package main

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestLiveAccessEventJSONIsCompact(t *testing.T) {
	event := liveAccessEvent{
		ID:        7,
		Timestamp: 1782158400,
		Label:     "Tokyo, JP",
		Latitude:  35.6812,
		Longitude: 139.7671,
		Network:   "Example Network AS64500",
	}
	body, err := json.Marshal(event)
	if err != nil {
		t.Fatal(err)
	}
	payload := string(body)
	for _, want := range []string{`"id":7`, `"ts":1782158400`, `"label":"Tokyo, JP"`, `"lat":35.6812`, `"lon":139.7671`, `"network":"Example Network AS64500"`} {
		if !strings.Contains(payload, want) {
			t.Fatalf("payload %s does not contain %s", payload, want)
		}
	}
	for _, unwanted := range []string{
		"path",
		"countryCode",
		"countryName",
		"city",
		"subdivision",
		"accuracyRadius",
		"asn",
		"organization",
		"timestamp",
		"latitude",
		"longitude",
	} {
		if strings.Contains(payload, unwanted) {
			t.Fatalf("payload %s contains unused field %q", payload, unwanted)
		}
	}
}

func TestLiveAccessHubRecentReplayLimit(t *testing.T) {
	hub := NewLiveAccessHub()
	for i := 0; i < liveAccessRecentLimit+3; i++ {
		hub.Publish(liveAccessEvent{
			Timestamp: 1782158400 + int64(i),
			Label:     fmt.Sprintf("event-%02d", i),
			Latitude:  35,
			Longitude: 139,
		})
	}

	_, recent, unsubscribe := hub.Subscribe()
	defer unsubscribe()
	if len(recent) != liveAccessRecentLimit {
		t.Fatalf("recent length = %d, want %d", len(recent), liveAccessRecentLimit)
	}
	if recent[0].Label != "event-03" {
		t.Fatalf("first replayed event = %q, want event-03", recent[0].Label)
	}
}

func TestWriteReadySSEIsMinimal(t *testing.T) {
	recorder := httptest.NewRecorder()
	writeReadySSE(recorder)
	if got, want := recorder.Body.String(), "event: ready\ndata:1\n\n"; got != want {
		t.Fatalf("ready SSE = %q, want %q", got, want)
	}
}
