package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const (
	defaultAPIBase       = "https://api.mackerelio.com"
	defaultMetricName    = "custom.nginx.requests.requests"
	defaultConfigPath    = "/etc/mackerel-agent/mackerel-agent.conf"
	defaultHostIDPath    = "/var/lib/mackerel-agent/id"
	defaultOutputPath    = "/var/lib/inet-ip-info/access-insights-history.json"
	defaultRetainedDays  = 14
	defaultLookbackDays  = 365
	defaultRequestTimout = 60 * time.Second
)

type mackerelMetric struct {
	Time  int64   `json:"time"`
	Value float64 `json:"value"`
}

type mackerelMetricsResponse struct {
	Metrics []mackerelMetric `json:"metrics"`
}

type historicalEstimate struct {
	ID              string   `json:"id"`
	Label           string   `json:"label"`
	Source          string   `json:"source"`
	MetricName      string   `json:"metricName"`
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

type periodSpec struct {
	ID    string
	Label string
	Since time.Time
	All   bool
}

func main() {
	log.SetFlags(log.LstdFlags)

	var outputPath string
	var metricName string
	var apiBase string
	var hostIDPath string
	var configPath string
	var retainedDays int
	var lookbackDays int
	flag.StringVar(&outputPath, "output", envOrDefault("ACCESS_INSIGHTS_HISTORY_FILE", defaultOutputPath), "output JSON path")
	flag.StringVar(&metricName, "metric", envOrDefault("ACCESS_INSIGHTS_MACKEREL_METRIC", defaultMetricName), "Mackerel metric name")
	flag.StringVar(&apiBase, "api-base", envOrDefault("ACCESS_INSIGHTS_MACKEREL_API_BASE", defaultAPIBase), "Mackerel API base URL")
	flag.StringVar(&hostIDPath, "host-id-file", defaultHostIDPath, "Mackerel host ID file")
	flag.StringVar(&configPath, "config", defaultConfigPath, "mackerel-agent.conf path")
	flag.IntVar(&retainedDays, "retained-days", defaultRetainedDays, "days covered by retained access logs")
	flag.IntVar(&lookbackDays, "lookback-days", defaultLookbackDays, "Mackerel lookback days")
	flag.Parse()

	now := time.Now()
	to := now.AddDate(0, 0, -retainedDays).UTC().Truncate(24 * time.Hour)
	from := now.AddDate(0, 0, -lookbackDays).UTC().Truncate(24 * time.Hour)
	if !from.Before(to) {
		log.Fatalf("invalid range from=%s to=%s", from.Format(time.RFC3339), to.Format(time.RFC3339))
	}

	apiKey, err := mackerelAPIKey(configPath)
	if err != nil {
		log.Fatal(err)
	}
	hostID, err := mackerelHostID(hostIDPath)
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), defaultRequestTimout)
	defer cancel()
	metrics, err := fetchMetrics(ctx, strings.TrimRight(apiBase, "/"), apiKey, hostID, metricName, from, now.UTC())
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("fetched mackerel metrics host=%s metric=%s points=%d from=%s to=%s", hostID, metricName, len(metrics), from.Format(time.RFC3339), now.UTC().Format(time.RFC3339))

	estimates := buildEstimates(metrics, metricName, from, to, now.UTC())
	if err := writeAtomic(outputPath, estimates); err != nil {
		log.Fatal(err)
	}
	log.Printf("wrote historical estimates path=%s periods=%d", outputPath, len(estimates))
}

func buildEstimates(metrics []mackerelMetric, metricName string, historyFrom, retainedStart, now time.Time) []historicalEstimate {
	specs := []periodSpec{
		{ID: "1m", Label: "1m", Since: now.AddDate(0, -1, 0)},
		{ID: "3m", Label: "3m", Since: now.AddDate(0, -3, 0)},
		{ID: "6m", Label: "6m", Since: now.AddDate(0, -6, 0)},
		{ID: "1y", Label: "1y", Since: now.AddDate(-1, 0, 0)},
		{ID: "all", Label: "all", Since: historyFrom, All: true},
	}

	estimates := make([]historicalEstimate, 0, len(specs))
	for _, spec := range specs {
		from := spec.Since.UTC()
		if spec.All {
			from = historyFrom
		}
		to := retainedStart.UTC()
		if !from.Before(to) {
			continue
		}
		total, peakDay, peakDayRequests, sampleCount, coverageDays := integrateMetrics(metrics, from, to)
		if sampleCount == 0 || total <= 0 {
			continue
		}
		estimates = append(estimates, historicalEstimate{
			ID:              spec.ID,
			Label:           spec.Label,
			Source:          "Mackerel host metrics",
			MetricName:      metricName,
			From:            from.Format(time.RFC3339),
			To:              to.Format(time.RFC3339),
			TotalRequests:   total,
			PeakDay:         peakDay,
			PeakDayRequests: peakDayRequests,
			SampleCount:     sampleCount,
			CoverageDays:    coverageDays,
			Estimated:       true,
			Notes: []string{
				"This estimate covers only the period before retained nginx access logs.",
				"Mackerel stores this graph as request-per-minute metric values; totals are estimated by integrating each point over its time step.",
				"Country, location, ASN, endpoint, status and user-agent breakdowns are not available for this estimated historical segment.",
			},
		})
	}
	return estimates
}

func fetchMetrics(ctx context.Context, apiBase, apiKey, hostID, metricName string, from, to time.Time) ([]mackerelMetric, error) {
	values := url.Values{}
	values.Set("name", metricName)
	values.Set("from", fmt.Sprint(from.Unix()))
	values.Set("to", fmt.Sprint(to.Unix()))
	endpoint := fmt.Sprintf("%s/api/v0/hosts/%s/metrics?%s", apiBase, url.PathEscape(hostID), values.Encode())
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Api-Key", apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("mackerel metrics status %d", resp.StatusCode)
	}
	var body mackerelMetricsResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	sort.Slice(body.Metrics, func(i, j int) bool { return body.Metrics[i].Time < body.Metrics[j].Time })
	return body.Metrics, nil
}

func integrateMetrics(metrics []mackerelMetric, from, to time.Time) (int64, string, int64, int, int) {
	var total float64
	var sampleCount int
	daily := map[string]float64{}
	for index, metric := range metrics {
		pointStart := time.Unix(metric.Time, 0).UTC()
		step := metricStep(metrics, index)
		if step <= 0 || step > 31*24*time.Hour {
			continue
		}
		pointEnd := pointStart.Add(step)
		overlapStart := maxTime(pointStart, from)
		overlapEnd := minTime(pointEnd, to)
		if !overlapEnd.After(overlapStart) {
			continue
		}
		requests := metric.Value * overlapEnd.Sub(overlapStart).Seconds() / 60
		total += requests
		sampleCount++
		day := pointStart.Format("2006-01-02")
		daily[day] += requests
	}
	var peakDay string
	var peakValue float64
	for day, requests := range daily {
		if requests > peakValue || peakDay == "" {
			peakDay = day
			peakValue = requests
		}
	}
	return int64(math.Round(total)), peakDay, int64(math.Round(peakValue)), sampleCount, len(daily)
}

func metricStep(metrics []mackerelMetric, index int) time.Duration {
	if index+1 < len(metrics) {
		return time.Duration(metrics[index+1].Time-metrics[index].Time) * time.Second
	}
	if index > 0 {
		return time.Duration(metrics[index].Time-metrics[index-1].Time) * time.Second
	}
	return time.Minute
}

func mackerelAPIKey(configPath string) (string, error) {
	if value := strings.TrimSpace(os.Getenv("ACCESS_INSIGHTS_MACKEREL_API_KEY")); value != "" {
		return value, nil
	}
	body, err := os.ReadFile(configPath)
	if err != nil {
		return "", fmt.Errorf("read mackerel agent config: %w", err)
	}
	for _, line := range strings.Split(string(body), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok || !strings.EqualFold(strings.TrimSpace(key), "apikey") {
			continue
		}
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if value != "" {
			return value, nil
		}
	}
	return "", errors.New("mackerel apikey not found")
}

func mackerelHostID(path string) (string, error) {
	if value := strings.TrimSpace(os.Getenv("ACCESS_INSIGHTS_MACKEREL_HOST_ID")); value != "" {
		return value, nil
	}
	body, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("read mackerel host id: %w", err)
	}
	hostID := strings.TrimSpace(string(body))
	if hostID == "" {
		return "", errors.New("mackerel host id is empty")
	}
	return hostID, nil
}

func writeAtomic(path string, value []historicalEstimate) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	body, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	tmp := fmt.Sprintf("%s.%d.tmp", path, os.Getpid())
	if err := os.WriteFile(tmp, append(body, '\n'), 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func maxTime(left, right time.Time) time.Time {
	if left.After(right) {
		return left
	}
	return right
}

func minTime(left, right time.Time) time.Time {
	if left.Before(right) {
		return left
	}
	return right
}
