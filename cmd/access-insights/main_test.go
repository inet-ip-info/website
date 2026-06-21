package main

import "testing"

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
