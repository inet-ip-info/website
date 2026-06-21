package main

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"io"
	"log"
	"math"
	"math/bits"
	"net"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/oschwald/geoip2-golang"
)

const (
	outputPath    = "/var/lib/inet-ip-info/access-insights.json"
	topN          = 8
	topLocationN  = 200
	geoCacheLimit = 200000

	defaultGeoIPDatabaseDir = "/var/lib/inet-ip.info/data"
	geoASNDatabase          = "GeoLite2-ASN.mmdb"
	geoCityDatabase         = "GeoLite2-City.mmdb"

	defaultHistoricalEstimatesPath = "/var/lib/inet-ip-info/access-insights-history.json"
)

var logPaths = []string{
	"/var/log/nginx/inet-ip.info.access.log",
	"/var/log/nginx/inet-ip.info.access.log.1",
	"/var/log/nginx/inet-ip.info.access.log.2.gz",
	"/var/log/nginx/inet-ip.info.access.log.3.gz",
	"/var/log/nginx/inet-ip.info.access.log.4.gz",
	"/var/log/nginx/inet-ip.info.access.log.5.gz",
	"/var/log/nginx/inet-ip.info.access.log.6.gz",
	"/var/log/nginx/inet-ip.info.access.log.7.gz",
	"/var/log/nginx/inet-ip.info.access.log.8.gz",
	"/var/log/nginx/inet-ip.info.access.log.9.gz",
	"/var/log/nginx/inet-ip.info.access.log.10.gz",
	"/var/log/nginx/inet-ip.info.access.log.11.gz",
	"/var/log/nginx/inet-ip.info.access.log.12.gz",
	"/var/log/nginx/inet-ip.info.access.log.13.gz",
	"/var/log/nginx/inet-ip.info.access.log.14.gz",
}

type periodSpec struct {
	ID          string
	Label       string
	Description string
	Since       time.Time
	WindowHours int
	IsAll       bool
}

type dayAggregate struct {
	day           string
	midnight      string
	total         int64
	success       int64
	unique        *hll
	countries     map[string]countryRow
	locations     map[string]locationRow
	asns          map[string]asnRow
	endpoints     map[string]int64
	userAgents    map[string]int64
	status        map[string]int64
	hours         map[string]int64
	geoResolved   int64
	geoUnresolved int64
	firstSeen     time.Time
	lastSeen      time.Time
}

type combinedAggregate struct {
	spec          periodSpec
	total         int64
	success       int64
	unique        *hll
	countries     map[string]countryRow
	locations     map[string]locationRow
	asns          map[string]asnRow
	endpoints     map[string]int64
	userAgents    map[string]int64
	status        map[string]int64
	trend         map[string]int64
	geoResolved   int64
	geoUnresolved int64
	firstSeen     time.Time
	lastSeen      time.Time
	seen          bool
}

type record struct {
	ip        string
	when      time.Time
	target    string
	status    string
	userAgent string
}

type summary struct {
	TotalRequests    int64   `json:"totalRequests"`
	UniqueVisitors   int64   `json:"uniqueVisitors"`
	PeakHourRequests int64   `json:"peakHourRequests"`
	SuccessRate      float64 `json:"successRate"`
}

type countryRow struct {
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	Requests int64   `json:"requests"`
	Share    float64 `json:"share"`
}

type locationRow struct {
	Label       string  `json:"label"`
	CountryCode string  `json:"countryCode"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Requests    int64   `json:"requests"`
	Share       float64 `json:"share"`
}

type asnRow struct {
	Label    string  `json:"label"`
	Requests int64   `json:"requests"`
	Share    float64 `json:"share"`
}

type labelRow struct {
	Label    string  `json:"label"`
	Requests int64   `json:"requests"`
	Share    float64 `json:"share"`
}

type statusRow struct {
	Code     string `json:"code"`
	Requests int64  `json:"requests"`
}

type hourRow struct {
	Hour     string `json:"hour"`
	Requests int64  `json:"requests"`
}

type periodDocument struct {
	ID             string        `json:"id"`
	Label          string        `json:"label"`
	Description    string        `json:"description"`
	GeneratedAt    string        `json:"generatedAt"`
	WindowHours    int           `json:"windowHours"`
	Source         string        `json:"source"`
	Summary        summary       `json:"summary"`
	TopCountries   []countryRow  `json:"topCountries"`
	TopLocations   []locationRow `json:"topLocations"`
	TopAsns        []asnRow      `json:"topAsns"`
	TopEndpoints   []labelRow    `json:"topEndpoints"`
	StatusCodes    []statusRow   `json:"statusCodes"`
	UserAgents     []labelRow    `json:"userAgents"`
	HourlyRequests []hourRow     `json:"hourlyRequests"`
	Notes          []string      `json:"notes"`
}

type historicalEstimate struct {
	ID              string   `json:"id"`
	Label           string   `json:"label"`
	From            string   `json:"from"`
	To              string   `json:"to"`
	TotalRequests   int64    `json:"totalRequests"`
	PeakDay         string   `json:"peakDay"`
	PeakDayRequests int64    `json:"peakDayRequests"`
	SampleCount     int      `json:"sampleCount"`
	CoverageDays    int      `json:"coverageDays"`
	Estimated       bool     `json:"estimated"`
	Notes           []string `json:"notes"`
}

type accessDocument struct {
	ID                  string               `json:"id"`
	Label               string               `json:"label"`
	Description         string               `json:"description"`
	GeneratedAt         string               `json:"generatedAt"`
	WindowHours         int                  `json:"windowHours"`
	Source              string               `json:"source"`
	Summary             summary              `json:"summary"`
	TopCountries        []countryRow         `json:"topCountries"`
	TopLocations        []locationRow        `json:"topLocations"`
	TopAsns             []asnRow             `json:"topAsns"`
	TopEndpoints        []labelRow           `json:"topEndpoints"`
	StatusCodes         []statusRow          `json:"statusCodes"`
	UserAgents          []labelRow           `json:"userAgents"`
	HourlyRequests      []hourRow            `json:"hourlyRequests"`
	Notes               []string             `json:"notes"`
	Sample              bool                 `json:"sample"`
	DefaultPeriod       string               `json:"defaultPeriod"`
	Periods             []periodDocument     `json:"periods"`
	HistoricalEstimates []historicalEstimate `json:"historicalEstimates,omitempty"`
}

func main() {
	start := time.Now()
	log.SetFlags(log.LstdFlags)
	log.Printf("access insights build start output=%s", outputPath)

	now := time.Now()
	geoResolver, err := newGeoResolver()
	if err != nil {
		log.Fatalf("open geoip databases failed: %v", err)
	}
	defer geoResolver.Close()

	days := map[string]*dayAggregate{}
	for _, path := range logPaths {
		lines, records, err := readLog(path, days, geoResolver)
		if err != nil {
			log.Fatalf("read %s failed: %v", path, err)
		}
		log.Printf("read complete path=%s lines=%d records=%d days=%d elapsed=%s", path, lines, records, len(days), time.Since(start).Round(time.Second))
	}

	orderedDays := sortedDays(days)
	log.Printf("aggregate complete days=%d geo_cache_entries=%d elapsed=%s", len(orderedDays), geoResolver.cacheSize(), time.Since(start).Round(time.Second))

	source := sourceLabel(logPaths)
	generatedAt := now.Format(time.RFC3339)
	specs := periodSpecs(now)
	periods := make([]periodDocument, 0, len(specs))
	for _, spec := range specs {
		combined := combineDays(spec, orderedDays)
		log.Printf("period build start id=%s requests=%d", spec.ID, combined.total)
		periods = append(periods, buildPeriodDocument(combined, generatedAt, source))
		log.Printf("period build complete id=%s elapsed=%s", spec.ID, time.Since(start).Round(time.Second))
	}
	if len(periods) == 0 {
		log.Fatal("no period documents generated")
	}
	historicalEstimates := loadHistoricalEstimates()

	allDoc := periods[len(periods)-1]
	doc := accessDocument{
		ID:                  allDoc.ID,
		Label:               allDoc.Label,
		Description:         allDoc.Description,
		GeneratedAt:         allDoc.GeneratedAt,
		WindowHours:         allDoc.WindowHours,
		Source:              allDoc.Source,
		Summary:             allDoc.Summary,
		TopCountries:        allDoc.TopCountries,
		TopLocations:        allDoc.TopLocations,
		TopAsns:             allDoc.TopAsns,
		TopEndpoints:        allDoc.TopEndpoints,
		StatusCodes:         allDoc.StatusCodes,
		UserAgents:          allDoc.UserAgents,
		HourlyRequests:      allDoc.HourlyRequests,
		Notes:               allDoc.Notes,
		Sample:              false,
		DefaultPeriod:       "all",
		Periods:             periods,
		HistoricalEstimates: historicalEstimates,
	}
	if err := writeAtomic(outputPath, doc); err != nil {
		log.Fatalf("write output failed: %v", err)
	}
	log.Printf("access insights build complete output=%s elapsed=%s", outputPath, time.Since(start).Round(time.Second))
}

func periodSpecs(now time.Time) []periodSpec {
	return []periodSpec{
		{ID: "24h", Label: "24h", Description: "Last 24 hours, generated from retained access-log input.", Since: now.Add(-24 * time.Hour), WindowHours: 24},
		{ID: "7d", Label: "7d", Description: "Last 7 days, generated from retained access-log input.", Since: now.AddDate(0, 0, -7), WindowHours: 7 * 24},
		{ID: "14d", Label: "14d", Description: "Last 14 days, generated from retained access-log input.", Since: now.AddDate(0, 0, -14), WindowHours: 14 * 24},
		{ID: "1m", Label: "1m", Description: "Last 1 month, limited by retained access-log input.", Since: now.AddDate(0, -1, 0), WindowHours: 30 * 24},
		{ID: "3m", Label: "3m", Description: "Last 3 months, limited by retained access-log input.", Since: now.AddDate(0, -3, 0), WindowHours: 3 * 30 * 24},
		{ID: "6m", Label: "6m", Description: "Last 6 months, limited by retained access-log input.", Since: now.AddDate(0, -6, 0), WindowHours: 6 * 30 * 24},
		{ID: "1y", Label: "1y", Description: "Last 1 year, limited by retained access-log input.", Since: now.AddDate(-1, 0, 0), WindowHours: 365 * 24},
		{ID: "all", Label: "all", Description: "All available retained access-log input supplied to this run.", Since: time.Unix(0, 0), WindowHours: 24 * 365 * 100, IsAll: true},
	}
}

func readLog(path string, days map[string]*dayAggregate, geoResolver *geoResolver) (int64, int64, error) {
	file, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		return 0, 0, nil
	}
	if err != nil {
		return 0, 0, err
	}
	defer file.Close()

	var reader io.Reader = file
	var gz *gzip.Reader
	if strings.HasSuffix(path, ".gz") {
		gz, err = gzip.NewReader(file)
		if err != nil {
			return 0, 0, err
		}
		defer gz.Close()
		reader = gz
	}

	var lines int64
	var records int64
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		lines++
		rec, ok := parseLine(scanner.Text())
		if !ok {
			continue
		}
		records++
		key := rec.when.Format("2006-01-02")
		day := days[key]
		if day == nil {
			day = newDayAggregate(key, rec.when)
			days[key] = day
		}
		day.add(rec, geoResolver)
	}
	if err := scanner.Err(); err != nil {
		return lines, records, err
	}
	return lines, records, nil
}

func newDayAggregate(day string, when time.Time) *dayAggregate {
	y, m, d := when.Date()
	_, offset := when.Zone()
	midnight := time.Date(y, m, d, 0, 0, 0, 0, time.FixedZone("", offset)).Format(time.RFC3339)
	return &dayAggregate{
		day:        day,
		midnight:   midnight,
		unique:     newHLL(14),
		countries:  map[string]countryRow{},
		locations:  map[string]locationRow{},
		asns:       map[string]asnRow{},
		endpoints:  map[string]int64{},
		userAgents: map[string]int64{},
		status:     map[string]int64{},
		hours:      map[string]int64{},
	}
}

func (d *dayAggregate) add(rec record, geoResolver *geoResolver) {
	d.total++
	if strings.HasPrefix(rec.status, "2") || strings.HasPrefix(rec.status, "3") {
		d.success++
	}
	d.unique.add(rec.ip)
	d.endpoints[normalizeEndpoint(rec.target)]++
	d.userAgents[classifyUserAgent(rec.userAgent)]++
	d.status[rec.status]++
	d.hours[hourKey(rec.when)]++
	if geoResolver != nil {
		entry, ok := geoResolver.lookup(rec.ip)
		if ok {
			d.geoResolved++
		} else {
			d.geoUnresolved++
		}
		addGeoEntry(d.countries, d.locations, d.asns, entry, 1)
	}
	if d.firstSeen.IsZero() || rec.when.Before(d.firstSeen) {
		d.firstSeen = rec.when
	}
	if d.lastSeen.IsZero() || rec.when.After(d.lastSeen) {
		d.lastSeen = rec.when
	}
}

func parseLine(line string) (record, bool) {
	var rec record
	ipEnd := strings.IndexByte(line, ' ')
	if ipEnd <= 0 {
		return rec, false
	}
	rec.ip = line[:ipEnd]
	left := strings.IndexByte(line, '[')
	right := strings.IndexByte(line, ']')
	if left < 0 || right <= left {
		return rec, false
	}
	when, err := time.Parse("02/Jan/2006:15:04:05 -0700", line[left+1:right])
	if err != nil {
		return rec, false
	}
	rec.when = when

	q1 := strings.IndexByte(line[right+1:], '"')
	if q1 < 0 {
		return rec, false
	}
	q1 += right + 1
	q2 := closingQuote(line, q1+1)
	if q2 < 0 {
		return rec, false
	}
	request := line[q1+1 : q2]
	parts := strings.Fields(request)
	if len(parts) >= 2 {
		rec.target = parts[1]
	}
	afterRequest := strings.TrimSpace(line[q2+1:])
	statusFields := strings.Fields(afterRequest)
	if len(statusFields) == 0 {
		return rec, false
	}
	rec.status = statusFields[0]

	q3 := strings.IndexByte(line[q2+1:], '"')
	if q3 < 0 {
		return rec, true
	}
	q3 += q2 + 1
	q4 := closingQuote(line, q3+1)
	if q4 < 0 {
		return rec, true
	}
	q5 := strings.IndexByte(line[q4+1:], '"')
	if q5 < 0 {
		return rec, true
	}
	q5 += q4 + 1
	q6 := closingQuote(line, q5+1)
	if q6 < 0 {
		return rec, true
	}
	rec.userAgent = line[q5+1 : q6]
	return rec, true
}

func closingQuote(value string, start int) int {
	escaped := false
	for i := start; i < len(value); i++ {
		ch := value[i]
		if escaped {
			escaped = false
			continue
		}
		if ch == '\\' {
			escaped = true
			continue
		}
		if ch == '"' {
			return i
		}
	}
	return -1
}

func normalizeEndpoint(target string) string {
	if target == "" || target == "-" {
		return "(empty request target)"
	}
	parsed, err := url.Parse(target)
	if err == nil && parsed.Path != "" {
		return parsed.Path
	}
	if idx := strings.IndexByte(target, '?'); idx >= 0 {
		target = target[:idx]
	}
	if target == "" {
		return "/"
	}
	return target
}

func classifyUserAgent(value string) string {
	ua := strings.ToLower(value)
	switch {
	case strings.Contains(ua, "curl") || strings.Contains(ua, "wget") || strings.Contains(ua, "httpie"):
		return "curl/wget"
	case strings.Contains(ua, "bot") || strings.Contains(ua, "crawler") || strings.Contains(ua, "spider"):
		return "Search crawler"
	case strings.Contains(ua, "prometheus") || strings.Contains(ua, "uptime") || strings.Contains(ua, "monitor"):
		return "Monitoring"
	case strings.Contains(ua, "mozilla"):
		return "Browser"
	case strings.TrimSpace(value) == "" || value == "-":
		return "Unknown"
	default:
		return "Other automation"
	}
}

func hourKey(value time.Time) string {
	y, m, d := value.Date()
	hour := value.Hour()
	_, offset := value.Zone()
	return time.Date(y, m, d, hour, 0, 0, 0, time.FixedZone("", offset)).Format(time.RFC3339)
}

func sortedDays(days map[string]*dayAggregate) []*dayAggregate {
	result := make([]*dayAggregate, 0, len(days))
	for _, day := range days {
		result = append(result, day)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].day < result[j].day })
	return result
}

func combineDays(spec periodSpec, days []*dayAggregate) *combinedAggregate {
	result := &combinedAggregate{
		spec:       spec,
		unique:     newHLL(14),
		countries:  map[string]countryRow{},
		locations:  map[string]locationRow{},
		asns:       map[string]asnRow{},
		endpoints:  map[string]int64{},
		userAgents: map[string]int64{},
		status:     map[string]int64{},
		trend:      map[string]int64{},
	}
	for _, day := range days {
		if !spec.IsAll && day.lastSeen.Before(spec.Since) {
			continue
		}
		result.total += day.total
		result.success += day.success
		result.unique.merge(day.unique)
		addCountries(result.countries, day.countries)
		addLocations(result.locations, day.locations)
		addASNs(result.asns, day.asns)
		addMap(result.endpoints, day.endpoints)
		addMap(result.userAgents, day.userAgents)
		addMap(result.status, day.status)
		result.geoResolved += day.geoResolved
		result.geoUnresolved += day.geoUnresolved
		if spec.WindowHours > 48 {
			result.trend[day.midnight] += day.total
		} else {
			addMap(result.trend, day.hours)
		}
		if !result.seen || day.firstSeen.Before(result.firstSeen) {
			result.firstSeen = day.firstSeen
		}
		if !result.seen || day.lastSeen.After(result.lastSeen) {
			result.lastSeen = day.lastSeen
		}
		result.seen = true
	}
	return result
}

func addMap(dst, src map[string]int64) {
	for key, value := range src {
		dst[key] += value
	}
}

func addCountries(dst map[string]countryRow, src map[string]countryRow) {
	for _, row := range src {
		addCountry(dst, row.Code, row.Name, row.Requests)
	}
}

func addLocations(dst map[string]locationRow, src map[string]locationRow) {
	for _, row := range src {
		key := fmt.Sprintf("%s|%s|%.3f|%.3f", row.Label, row.CountryCode, row.Latitude, row.Longitude)
		addLocation(dst, key, row.Label, row.CountryCode, row.Latitude, row.Longitude, row.Requests)
	}
}

func addASNs(dst map[string]asnRow, src map[string]asnRow) {
	for _, row := range src {
		addASN(dst, row.Label, row.Requests)
	}
}

func buildPeriodDocument(agg *combinedAggregate, generatedAt, source string) periodDocument {
	hours := hourRows(agg.trend)
	var peak int64
	for _, row := range hours {
		if row.Requests > peak {
			peak = row.Requests
		}
	}
	return periodDocument{
		ID:             agg.spec.ID,
		Label:          agg.spec.Label,
		Description:    agg.spec.Description,
		GeneratedAt:    generatedAt,
		WindowHours:    agg.spec.WindowHours,
		Source:         source,
		Summary:        summary{TotalRequests: agg.total, UniqueVisitors: agg.unique.estimate(), PeakHourRequests: peak, SuccessRate: percent(agg.success, agg.total)},
		TopCountries:   rankedCountries(agg.countries, agg.total),
		TopLocations:   rankedLocations(agg.locations, agg.total),
		TopAsns:        rankedASNs(agg.asns, agg.total),
		TopEndpoints:   labelRowsFromMap(agg.endpoints, agg.total),
		StatusCodes:    statusRows(agg.status),
		UserAgents:     labelRowsFromMap(agg.userAgents, agg.total),
		HourlyRequests: hours,
		Notes:          notes(agg),
	}
}

func notes(agg *combinedAggregate) []string {
	result := []string{
		"Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
		"Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
		"GeoIP and ASN fields are counted for every parsed request during streaming aggregation; raw visitor IP addresses are not written to this public JSON.",
	}
	if agg.spec.IsAll {
		result = append(result, "The all period covers all retained access-log inputs supplied to this run.")
	} else if agg.total > 0 && agg.seen && agg.firstSeen.After(agg.spec.Since) {
		result = append(result, fmt.Sprintf("Input logs for %s start at %s; older traffic is not included in this run.", agg.spec.Label, agg.firstSeen.UTC().Format(time.RFC3339)))
	}
	geoProcessed := agg.geoResolved + agg.geoUnresolved
	if geoProcessed > 0 {
		result = append(result, fmt.Sprintf("GeoIP and ASN enrichment processed %d of %d requests during streaming aggregation.", geoProcessed, agg.total))
		if agg.geoUnresolved > 0 {
			result = append(result, fmt.Sprintf("GeoIP lookup did not resolve country data for %d requests; those are grouped as Unknown / ZZ.", agg.geoUnresolved))
		}
	} else {
		result = append(result, "GeoIP enrichment is disabled or unavailable; country, location and ASN sections may be empty.")
	}
	return result
}

func loadHistoricalEstimates() []historicalEstimate {
	path := strings.TrimSpace(os.Getenv("ACCESS_INSIGHTS_HISTORY_FILE"))
	if path == "" {
		path = defaultHistoricalEstimatesPath
	}
	body, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		log.Printf("historical estimates skipped path=%s err=%v", path, err)
		return nil
	}
	var estimates []historicalEstimate
	if err := json.Unmarshal(body, &estimates); err != nil {
		log.Printf("historical estimates skipped path=%s err=%v", path, err)
		return nil
	}
	log.Printf("historical estimates loaded path=%s periods=%d", path, len(estimates))
	return estimates
}

func sourceLabel(paths []string) string {
	names := make([]string, 0, len(paths))
	for _, path := range paths {
		names = append(names, filepath.Base(path))
	}
	return strings.Join(names, ", ")
}

func writeAtomic(path string, doc accessDocument) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	body, err := json.MarshalIndent(doc, "", "  ")
	if err != nil {
		return err
	}
	tmp := fmt.Sprintf("%s.%d.tmp", path, os.Getpid())
	if err := os.WriteFile(tmp, append(body, '\n'), 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

type hll struct {
	p    uint8
	regs []uint8
}

func newHLL(p uint8) *hll {
	return &hll{p: p, regs: make([]uint8, 1<<p)}
}

func (h *hll) add(value string) {
	hasher := fnv.New64a()
	_, _ = hasher.Write([]byte(value))
	x := hasher.Sum64()
	idx := x >> (64 - h.p)
	w := x << h.p
	rank := bits.LeadingZeros64(w) + 1
	maxRank := 64 - int(h.p) + 1
	if rank > maxRank {
		rank = maxRank
	}
	if h.regs[idx] < uint8(rank) {
		h.regs[idx] = uint8(rank)
	}
}

func (h *hll) merge(other *hll) {
	for index, value := range other.regs {
		if h.regs[index] < value {
			h.regs[index] = value
		}
	}
}

func (h *hll) estimate() int64 {
	m := float64(len(h.regs))
	alpha := 0.7213 / (1 + 1.079/m)
	var sum float64
	var zeros int
	for _, reg := range h.regs {
		sum += math.Pow(2, -float64(reg))
		if reg == 0 {
			zeros++
		}
	}
	est := alpha * m * m / sum
	if est <= 2.5*m && zeros > 0 {
		est = m * math.Log(m/float64(zeros))
	}
	return int64(math.Round(est))
}

type geoEntry struct {
	countryCode   string
	countryName   string
	hasLocation   bool
	locationKey   string
	locationLabel string
	latitude      float64
	longitude     float64
	hasASN        bool
	asnLabel      string
}

type geoResolver struct {
	asn        *geoip2.Reader
	city       *geoip2.Reader
	cache      map[string]geoEntry
	cacheKeys  []string
	cacheNext  int
	cacheLimit int
}

func newGeoResolver() (*geoResolver, error) {
	dir := geoIPDatabaseDir()
	asn, err := geoip2.Open(filepath.Join(dir, geoASNDatabase))
	if err != nil {
		return nil, fmt.Errorf("open %s: %w", geoASNDatabase, err)
	}
	city, err := geoip2.Open(filepath.Join(dir, geoCityDatabase))
	if err != nil {
		asn.Close()
		return nil, fmt.Errorf("open %s: %w", geoCityDatabase, err)
	}
	log.Printf("open geoip databases dir=%s", dir)
	return &geoResolver{
		asn:        asn,
		city:       city,
		cache:      map[string]geoEntry{},
		cacheLimit: geoCacheLimit,
	}, nil
}

func geoIPDatabaseDir() string {
	for _, key := range []string{"ACCESS_INSIGHTS_GEOIP_DIR", "GEOIP_DATABASE_DIR", "GEOIPDATABASEEDIR"} {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value
		}
	}
	return defaultGeoIPDatabaseDir
}

func (r *geoResolver) Close() {
	if r == nil {
		return
	}
	if r.asn != nil {
		r.asn.Close()
	}
	if r.city != nil {
		r.city.Close()
	}
}

func (r *geoResolver) cacheSize() int {
	if r == nil {
		return 0
	}
	return len(r.cache)
}

func (r *geoResolver) lookup(value string) (geoEntry, bool) {
	if r == nil {
		return unknownGeoEntry(), false
	}
	if entry, ok := r.cache[value]; ok {
		return entry, entry.countryCode != "ZZ"
	}

	entry := unknownGeoEntry()
	ip := net.ParseIP(value)
	if ip == nil {
		r.remember(value, entry)
		return entry, false
	}

	city, cityErr := r.city.City(ip)
	if cityErr == nil && city != nil {
		if city.Country.IsoCode != "" {
			entry.countryCode = city.Country.IsoCode
			entry.countryName = nameFromMap(city.Country.Names)
		} else if city.RegisteredCountry.IsoCode != "" {
			entry.countryCode = city.RegisteredCountry.IsoCode
			entry.countryName = nameFromMap(city.RegisteredCountry.Names)
		}
		if entry.countryName == "" {
			entry.countryName = "Unknown"
		}
		if city.Location.Latitude != 0 || city.Location.Longitude != 0 {
			cityName := nameFromMap(city.City.Names)
			subdivision := ""
			if len(city.Subdivisions) > 0 {
				subdivision = nameFromMap(city.Subdivisions[0].Names)
			}
			entry.locationLabel = strings.Join(nonEmpty(cityName, subdivision, entry.countryName), ", ")
			entry.locationKey = fmt.Sprintf("%s|%s|%.3f|%.3f", entry.locationLabel, entry.countryCode, city.Location.Latitude, city.Location.Longitude)
			entry.latitude = city.Location.Latitude
			entry.longitude = city.Location.Longitude
			entry.hasLocation = entry.locationLabel != ""
		}
	}

	asn, asnErr := r.asn.ASN(ip)
	if asnErr == nil && asn != nil && (asn.AutonomousSystemNumber != 0 || asn.AutonomousSystemOrganization != "") {
		label := strings.TrimSpace(asn.AutonomousSystemOrganization)
		if asn.AutonomousSystemNumber != 0 {
			label = strings.TrimSpace(fmt.Sprintf("AS%d %s", asn.AutonomousSystemNumber, label))
		}
		entry.asnLabel = label
		entry.hasASN = label != ""
	}

	r.remember(value, entry)
	return entry, entry.countryCode != "ZZ"
}

func (r *geoResolver) remember(key string, entry geoEntry) {
	if r.cacheLimit <= 0 {
		return
	}
	if _, ok := r.cache[key]; ok {
		r.cache[key] = entry
		return
	}
	if len(r.cache) < r.cacheLimit {
		r.cache[key] = entry
		r.cacheKeys = append(r.cacheKeys, key)
		return
	}
	evict := r.cacheKeys[r.cacheNext]
	delete(r.cache, evict)
	r.cacheKeys[r.cacheNext] = key
	r.cache[key] = entry
	r.cacheNext = (r.cacheNext + 1) % r.cacheLimit
}

func unknownGeoEntry() geoEntry {
	return geoEntry{countryCode: "ZZ", countryName: "Unknown"}
}

func addGeoEntry(countries map[string]countryRow, locations map[string]locationRow, asns map[string]asnRow, entry geoEntry, requests int64) {
	if entry.countryCode == "" {
		entry.countryCode = "ZZ"
	}
	if entry.countryName == "" {
		entry.countryName = "Unknown"
	}
	addCountry(countries, entry.countryCode, entry.countryName, requests)
	if entry.hasLocation {
		addLocation(locations, entry.locationKey, entry.locationLabel, entry.countryCode, entry.latitude, entry.longitude, requests)
	}
	if entry.hasASN {
		addASN(asns, entry.asnLabel, requests)
	}
}

func nameFromMap(names map[string]string) string {
	if len(names) == 0 {
		return ""
	}
	for _, key := range []string{"en", "ja"} {
		if names[key] != "" {
			return names[key]
		}
	}
	for _, value := range names {
		return value
	}
	return ""
}

func nonEmpty(values ...string) []string {
	result := make([]string, 0, len(values))
	for _, value := range values {
		if value != "" {
			result = append(result, value)
		}
	}
	return result
}

func addCountry(rows map[string]countryRow, code, name string, requests int64) {
	row := rows[code]
	row.Code = code
	row.Name = name
	row.Requests += requests
	rows[code] = row
}

func addLocation(rows map[string]locationRow, key, label, countryCode string, lat, lon float64, requests int64) {
	row := rows[key]
	row.Label = label
	row.CountryCode = countryCode
	row.Latitude = lat
	row.Longitude = lon
	row.Requests += requests
	rows[key] = row
}

func addASN(rows map[string]asnRow, label string, requests int64) {
	row := rows[label]
	row.Label = label
	row.Requests += requests
	rows[label] = row
}

func rankedCountries(rows map[string]countryRow, total int64) []countryRow {
	result := make([]countryRow, 0, len(rows))
	for _, row := range rows {
		row.Share = percent(row.Requests, total)
		result = append(result, row)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Requests > result[j].Requests })
	if len(result) > topN {
		result = result[:topN]
	}
	return result
}

func rankedLocations(rows map[string]locationRow, total int64) []locationRow {
	result := make([]locationRow, 0, len(rows))
	for _, row := range rows {
		row.Share = percent(row.Requests, total)
		result = append(result, row)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Requests > result[j].Requests })
	if len(result) > topLocationN {
		result = result[:topLocationN]
	}
	return result
}

func rankedASNs(rows map[string]asnRow, total int64) []asnRow {
	result := make([]asnRow, 0, len(rows))
	for _, row := range rows {
		row.Share = percent(row.Requests, total)
		result = append(result, row)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Requests > result[j].Requests })
	if len(result) > topN {
		result = result[:topN]
	}
	return result
}

func labelRowsFromMap(values map[string]int64, total int64) []labelRow {
	rows := make([]labelRow, 0, len(values))
	for label, requests := range values {
		rows = append(rows, labelRow{Label: label, Requests: requests, Share: percent(requests, total)})
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].Requests > rows[j].Requests })
	if len(rows) > topN {
		rows = rows[:topN]
	}
	return rows
}

func statusRows(values map[string]int64) []statusRow {
	rows := make([]statusRow, 0, len(values))
	for code, requests := range values {
		rows = append(rows, statusRow{Code: code, Requests: requests})
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].Requests > rows[j].Requests })
	if len(rows) > topN {
		rows = rows[:topN]
	}
	return rows
}

func hourRows(values map[string]int64) []hourRow {
	rows := make([]hourRow, 0, len(values))
	for hour, requests := range values {
		rows = append(rows, hourRow{Hour: hour, Requests: requests})
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].Hour < rows[j].Hour })
	return rows
}

func percent(part, total int64) float64 {
	if total <= 0 {
		return 0
	}
	return math.Round((float64(part)/float64(total))*1000) / 10
}
