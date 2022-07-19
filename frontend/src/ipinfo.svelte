<script lang="ts">
  import { onMount } from "svelte";
  import Netmask from "netmask";
  import Card from "@smui/card";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import { fetcher } from "./util";

  type names = {
    de: string;
    en: string;
    es: string;
    fr: string;
    ja: string;
    ru: string;
  };

  type ipinfo = {
    ipAddress: string;
    asn: {
      AutonomousSystemNumber: number;
      AutonomousSystemOrganization: string;
    };
    city: {
      City: {
        Names: names | null;
      };
      Continent: {
        Code: string;
        Names: names | null;
      } | null;
      Country: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names | null;
      };
      RegisteredCountry: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names | null;
      } | null;
      Postal: {
        Code: string;
      };
      Location: {
        AccuracyRadius: number;
        Latitude: number;
        Longitude: number;
        MetroCode: number;
        TimeZone: string;
      };
      RepresentedCountry: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names | null;
        Type: string;
      } | null;
      Subdivisions:
        | [
            {
              IsoCode: string;
              Names: names | null;
            }
          ]
        | null;
      Traits: {
        IsAnonymousProxy: boolean;
        IsSatelliteProvider: boolean;
      } | null;
    };
    license: string;
  };
  let info: ipinfo = {
    ipAddress: "",
    asn: { AutonomousSystemNumber: 0, AutonomousSystemOrganization: "" },
    city: {
      City: {
        Names: { en: "", de: "", es: "", fr: "", ja: "", ru: "" },
      },
      Country: {
        IsInEuropeanUnion: false,
        IsoCode: "",
        Names: { en: "", de: "", es: "", fr: "", ja: "", ru: "" },
      },
      Postal: { Code: "" },
    },
  };
  let locationInfo = "";
  async function getIPinfo(ip: string) {
    await fetcher<ipinfo>("/json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip: ip,
      }),
    })
      .then((data) => {
        console.log(data);
        return;
      })
      .catch((error) => {
        console.error("getIPinfo error:", error);
      });
  }
  async function myIPinfo() {
    await fetcher<ipinfo>("/json", {
      method: "GET",
    })
      .then((data) => {
        console.log(data);
        info = data;
        locationInfo = JSON.stringify(info.city.Location);
        return;
      })
      .catch((error) => {
        console.error("myIPinfo error:", error);
      });
  }
  onMount(myIPinfo);
</script>

<Card>
  <DataTable table$aria-label="ip list" style="width: auto;">
    <Body>
      <Row><Cell>IP address</Cell> <Cell>{info.ipAddress}</Cell></Row>
      <Row
        ><Cell>Country</Cell>
        <Cell>{info.city.Country.Names.en}</Cell></Row
      >
      <Row
        ><Cell>Country code</Cell>
        <Cell>{info.city.Country.IsoCode}</Cell></Row
      >
      <Row><Cell>City</Cell> <Cell>{info.city.City.Names.en}</Cell></Row>
      <Row
        ><Cell>AS</Cell>
        <Cell>{info.asn.AutonomousSystemNumber}</Cell></Row
      >
      <Row
        ><Cell>AS organization</Cell>
        <Cell>{info.asn.AutonomousSystemOrganization}</Cell></Row
      >
      <Row
        ><Cell>Postal code</Cell>
        <Cell>{info.city.Postal.Code}</Cell></Row
      >
      <Row><Cell>Location</Cell> <Cell>{locationInfo}</Cell></Row>
      <Row><Cell>License</Cell> <Cell>{info.license}</Cell></Row>
    </Body>
  </DataTable>
</Card>

<style>
  :global(.mdc-card) {
    padding: 18px;
  }
</style>
