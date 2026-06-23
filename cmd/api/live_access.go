package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const (
	liveAccessRecentLimit      = 60
	liveAccessDedupWindow      = 15 * time.Second
	liveAccessClientBufferSize = 16
)

type liveAccessEvent struct {
	ID             string  `json:"id"`
	Timestamp      string  `json:"timestamp"`
	Path           string  `json:"path,omitempty"`
	CountryCode    string  `json:"countryCode,omitempty"`
	CountryName    string  `json:"countryName,omitempty"`
	City           string  `json:"city,omitempty"`
	Subdivision    string  `json:"subdivision,omitempty"`
	Label          string  `json:"label,omitempty"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	AccuracyRadius uint16  `json:"accuracyRadius,omitempty"`
	ASN            uint    `json:"asn,omitempty"`
	Organization   string  `json:"organization,omitempty"`
}

type LiveAccessHub struct {
	mu       sync.Mutex
	clients  map[chan liveAccessEvent]struct{}
	recent   []liveAccessEvent
	lastSeen map[string]time.Time
	nextID   atomic.Uint64
}

func NewLiveAccessHub() *LiveAccessHub {
	return &LiveAccessHub{
		clients:  map[chan liveAccessEvent]struct{}{},
		lastSeen: map[string]time.Time{},
	}
}

func (h *LiveAccessHub) Subscribe() (<-chan liveAccessEvent, []liveAccessEvent, func()) {
	ch := make(chan liveAccessEvent, liveAccessClientBufferSize)
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	recent := append([]liveAccessEvent(nil), h.recent...)
	h.mu.Unlock()

	unsubscribe := func() {
		h.mu.Lock()
		if _, ok := h.clients[ch]; ok {
			delete(h.clients, ch)
			close(ch)
		}
		h.mu.Unlock()
	}
	return ch, recent, unsubscribe
}

func (h *LiveAccessHub) Allow(remoteIP string, now time.Time) bool {
	h.mu.Lock()
	defer h.mu.Unlock()

	for key, seen := range h.lastSeen {
		if now.Sub(seen) > 5*time.Minute {
			delete(h.lastSeen, key)
		}
	}
	if seen, ok := h.lastSeen[remoteIP]; ok && now.Sub(seen) < liveAccessDedupWindow {
		return false
	}
	h.lastSeen[remoteIP] = now
	return true
}

func (h *LiveAccessHub) Publish(event liveAccessEvent) {
	event.ID = fmt.Sprintf("%d", h.nextID.Add(1))
	if event.Timestamp == "" {
		event.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	h.mu.Lock()
	h.recent = append(h.recent, event)
	if len(h.recent) > liveAccessRecentLimit {
		h.recent = h.recent[len(h.recent)-liveAccessRecentLimit:]
	}
	for ch := range h.clients {
		select {
		case ch <- event:
		default:
		}
	}
	h.mu.Unlock()
}

func (h *Handler) trackLiveAccess(req *http.Request) {
	if h.liveAccess == nil || !shouldTrackLiveAccess(req) {
		return
	}
	remoteIP := getIp(req)
	if net.ParseIP(remoteIP) == nil {
		return
	}
	now := time.Now()
	if !h.liveAccess.Allow(remoteIP, now) {
		return
	}
	path := liveAccessPathLabel(req.URL.Path)
	go h.publishLiveAccess(remoteIP, path, now)
}

func shouldTrackLiveAccess(req *http.Request) bool {
	if req.Method != http.MethodGet && req.Method != http.MethodHead && req.Method != http.MethodPost {
		return false
	}
	path := req.URL.Path
	if path == "/access-stream" || strings.HasPrefix(path, "/assets/") {
		return false
	}
	if strings.Contains(path, ".") && !strings.HasSuffix(path, ".html") && path != "/access-insights.json" {
		return false
	}
	return true
}

func liveAccessPathLabel(path string) string {
	if path == "" {
		return "/"
	}
	if strings.HasSuffix(path, ".html") {
		return strings.TrimSuffix(path, ".html")
	}
	return path
}

func (h *Handler) publishLiveAccess(remoteIP, path string, now time.Time) {
	info, err := h.QueryIPinfo(remoteIP)
	if err != nil {
		return
	}
	event, ok := liveAccessEventFromInfo(info, path, now)
	if !ok {
		return
	}
	h.liveAccess.Publish(event)
}

func liveAccessEventFromInfo(info info, path string, now time.Time) (liveAccessEvent, bool) {
	if info.City == nil || info.City.Location.AccuracyRadius == 0 {
		return liveAccessEvent{}, false
	}
	countryCode := info.City.Country.IsoCode
	countryName := nameFromGeoNames(info.City.Country.Names)
	if countryCode == "" {
		countryCode = info.City.RegisteredCountry.IsoCode
	}
	if countryName == "" {
		countryName = nameFromGeoNames(info.City.RegisteredCountry.Names)
	}
	city := nameFromGeoNames(info.City.City.Names)
	subdivision := ""
	if len(info.City.Subdivisions) > 0 {
		subdivision = nameFromGeoNames(info.City.Subdivisions[0].Names)
	}
	label := liveAccessLocationLabel(city, subdivision, countryCode, countryName)
	if label == "" {
		return liveAccessEvent{}, false
	}

	event := liveAccessEvent{
		Timestamp:      now.UTC().Format(time.RFC3339),
		Path:           path,
		CountryCode:    countryCode,
		CountryName:    countryName,
		City:           city,
		Subdivision:    subdivision,
		Label:          label,
		Latitude:       info.City.Location.Latitude,
		Longitude:      info.City.Location.Longitude,
		AccuracyRadius: info.City.Location.AccuracyRadius,
	}
	if info.ASN != nil {
		event.ASN = info.ASN.AutonomousSystemNumber
		event.Organization = info.ASN.AutonomousSystemOrganization
	}
	return event, true
}

func nameFromGeoNames(names map[string]string) string {
	if len(names) == 0 {
		return ""
	}
	for _, key := range []string{"en", "ja", "zh-CN", "ko"} {
		if names[key] != "" {
			return names[key]
		}
	}
	for _, value := range names {
		if value != "" {
			return value
		}
	}
	return ""
}

func liveAccessLocationLabel(city, subdivision, countryCode, countryName string) string {
	parts := make([]string, 0, 2)
	if city != "" {
		parts = append(parts, city)
	} else if subdivision != "" {
		parts = append(parts, subdivision)
	}
	country := countryCode
	if country == "" {
		country = countryName
	}
	if country != "" {
		parts = append(parts, country)
	}
	return strings.Join(parts, ", ")
}

func (h *Handler) writeAccessStream(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache, no-transform")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	events, recent, unsubscribe := h.liveAccess.Subscribe()
	defer unsubscribe()

	writeSSE(w, "ready", map[string]string{"status": "connected"})
	for _, event := range recent {
		writeSSE(w, "access", event)
	}
	flusher.Flush()

	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-req.Context().Done():
			return
		case event, ok := <-events:
			if !ok {
				return
			}
			writeSSE(w, "access", event)
			flusher.Flush()
		case <-ticker.C:
			if _, err := w.Write([]byte(": keep-alive\n\n")); err != nil {
				return
			}
			flusher.Flush()
		}
	}
}

func writeSSE(w http.ResponseWriter, eventName string, payload interface{}) {
	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("json.Marshal SSE %s err:%s", eventName, err)
		return
	}
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", eventName, body)
}
