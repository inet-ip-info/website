package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLocationLabelOmitsDuplicateSubdivision(t *testing.T) {
	got := locationLabel("Tokyo", "Tokyo", "Japan")
	if got != "Tokyo, Japan" {
		t.Fatalf("locationLabel() = %q, want %q", got, "Tokyo, Japan")
	}
}

func TestRankedLocationsCompactsNearbyRows(t *testing.T) {
	rows := map[string]locationRow{
		"country": {
			Label:       "Japan",
			CountryCode: "JP",
			Latitude:    35.6893,
			Longitude:   139.6899,
			Requests:    100,
		},
		"tokyo": {
			Label:       "Tokyo, Japan",
			CountryCode: "JP",
			Latitude:    35.6812,
			Longitude:   139.7671,
			Requests:    50,
		},
		"yokohama": {
			Label:       "Yokohama, Kanagawa, Japan",
			CountryCode: "JP",
			Latitude:    35.4437,
			Longitude:   139.638,
			Requests:    25,
		},
	}

	ranked := rankedLocations(rows, 175)
	if len(ranked) != 2 {
		t.Fatalf("len(rankedLocations()) = %d, want 2: %#v", len(ranked), ranked)
	}
	if ranked[0].Label != "Tokyo, Japan" {
		t.Fatalf("top label = %q, want %q", ranked[0].Label, "Tokyo, Japan")
	}
	if ranked[0].Requests != 150 {
		t.Fatalf("top requests = %d, want 150", ranked[0].Requests)
	}
}

func TestWantedAggregateDaysRefreshesTargetAndBackfillsMissingDays(t *testing.T) {
	now := time.Date(2026, 6, 22, 2, 30, 0, 0, time.FixedZone("JST", 9*60*60))
	stored := map[string]*dayAggregate{
		"2026-06-20": newDayAggregate("2026-06-20", now.AddDate(0, 0, -2)),
	}

	wanted := wantedAggregateDays(now, stored)
	if !wanted["2026-06-21"] {
		t.Fatalf("wanted days should refresh target day: %#v", wanted)
	}
	if !wanted["2026-06-19"] {
		t.Fatalf("wanted days should include missing retained day: %#v", wanted)
	}
	if wanted["2026-06-20"] {
		t.Fatalf("wanted days should not include already stored non-target day: %#v", wanted)
	}
	if !needsBackfill(wanted, "2026-06-21") {
		t.Fatalf("missing older days should require backfill")
	}
}

func TestReadLogFiltersWantedDays(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "access.log")
	body := "" +
		`192.0.2.1 - - [20/Jun/2026:23:59:59 +0900] "GET /old HTTP/1.1" 200 1 "-" "curl"` + "\n" +
		`192.0.2.2 - - [21/Jun/2026:00:00:01 +0900] "GET /target HTTP/1.1" 200 1 "-" "curl"` + "\n"
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}

	days := map[string]*dayAggregate{}
	lines, records, err := readLog(path, days, nil, map[string]bool{"2026-06-21": true})
	if err != nil {
		t.Fatal(err)
	}
	if lines != 2 || records != 1 {
		t.Fatalf("readLog() lines=%d records=%d, want 2/1", lines, records)
	}
	if days["2026-06-20"] != nil {
		t.Fatalf("unwanted day was aggregated: %#v", days["2026-06-20"])
	}
	if days["2026-06-21"] == nil || days["2026-06-21"].total != 1 {
		t.Fatalf("target day aggregate missing or wrong: %#v", days["2026-06-21"])
	}
}

func TestStoredDayRoundTrip(t *testing.T) {
	dir := t.TempDir()
	when := time.Date(2026, 6, 21, 12, 0, 0, 0, time.FixedZone("JST", 9*60*60))
	day := newDayAggregate("2026-06-21", when)
	day.add(record{
		ip:        "192.0.2.1",
		when:      when,
		target:    "/json?secret=removed",
		status:    "200",
		userAgent: "curl/8",
	}, nil)

	if err := writeStoredDay(dir, day); err != nil {
		t.Fatal(err)
	}
	loaded, err := loadStoredDays(dir)
	if err != nil {
		t.Fatal(err)
	}
	got := loaded["2026-06-21"]
	if got == nil {
		t.Fatalf("stored day was not loaded: %#v", loaded)
	}
	if got.total != 1 || got.success != 1 || got.endpoints["/json"] != 1 {
		t.Fatalf("loaded aggregate mismatch: %#v", got)
	}
	if got.unique.estimate() != 1 {
		t.Fatalf("loaded unique estimate = %d, want 1", got.unique.estimate())
	}
}
