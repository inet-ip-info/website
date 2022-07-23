<script lang="ts">
  import { onMount } from "svelte";
  import Card from "@smui/card";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import { fetcher } from "./util";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Netmask from "netmask";

  type names = {
    [key: string]: string;
  } | null;

  type ipinfo = {
    ipAddress: string;
    asn: {
      AutonomousSystemNumber: number;
      AutonomousSystemOrganization: string;
    };
    city: {
      City: {
        Names: names;
      } | null;
      Continent: {
        Code: string;
        Names: names;
      } | null;
      Country: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names;
      } | null;
      RegisteredCountry: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names;
      } | null;
      RepresentedCountry: {
        IsInEuropeanUnion: boolean;
        IsoCode: string;
        Names: names;
        Type: string;
      } | null;
      Subdivisions:
        | [
            {
              IsoCode: string;
              Names: names;
            }
          ]
        | null;
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
      Continent: null,
      Country: {
        IsInEuropeanUnion: false,
        IsoCode: "",
        Names: { en: "", de: "", es: "", fr: "", ja: "", ru: "" },
      },
      RegisteredCountry: null,
      Postal: { Code: "" },
      Location: null,
      RepresentedCountry: null,
      Subdivisions: null,
      Traits: null,
    },
    license: "",
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
        info = data;
        locationInfo = JSON.stringify(info.city.Location);
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
  let value = "";
  function checkIP(ip: string): boolean {
    try {
      new Netmask.Netmask(ip);
    } catch (e) {
      return false;
    }
    return true;
  }
  function ipHandler() {
    if (checkIP(value)) {
      getIPinfo(value).catch((error) => {
        console.error("getIPinfo error:", error);
      });
    }
    if (value == "") {
      myIPinfo().catch((error) => {
        console.error("myIPinfo error:", error);
      });
    }
  }
  function getName(Names: names): string {
    if (Names == null) {
      return "";
    }
    if (navigator.language in Names) {
      return Names[navigator.language];
    }
    if ("en" in Names) {
      return Names["en"];
    }
    for (const property in Names) {
      return Names[property];
    }
    return "";
  }
  function checkRepresentedCountry(info: ipinfo): boolean {
    if (info.city.RepresentedCountry == null) {
      return false;
    }
    let country = "";
    if (info.city.Country != null) {
      country = getName(info.city.Country.Names);
    }
    const representedCountry = getName(info.city.RepresentedCountry.Names);
    if (representedCountry != "" && representedCountry != country) {
      return true;
    }
    return false;
  }
  function checkRegisteredCountry(info: ipinfo): boolean {
    if (info.city.RegisteredCountry == null) {
      return false;
    }
    let country = "";
    if (info.city.RepresentedCountry != null) {
      country = getName(info.city.RepresentedCountry.Names);
    }
    if (country == "") {
      if (info.city.Country != null) {
        country = getName(info.city.Country.Names);
      }
    }
    const registeredCountry = getName(info.city.RegisteredCountry.Names);
    if (registeredCountry != "" && registeredCountry != country) {
      return true;
    }
    return false;
  }
  /* eslint-disable */
</script>

<Card>
  <div class="columns margins">
    <Textfield
      on:input="{ipHandler}"
      variant="filled"
      bind:value
      label="Enter an IPv4 address"
    >
      <HelperText slot="helper">For example: '8.8.8.8'</HelperText>
    </Textfield>
  </div>
  <DataTable table$aria-label="ip list" style="width: auto;">
    <Body>
      <Row
        >{#if value == ""}<Cell>My IP address</Cell>{:else}<Cell>IP address</Cell>{/if}
        <Cell>{info.ipAddress}</Cell></Row
      >
      <Row
        ><Cell>AS</Cell>
        <Cell>{info.asn.AutonomousSystemNumber}</Cell></Row
      >
      <Row
        ><Cell>AS organization</Cell>
        <Cell>{info.asn.AutonomousSystemOrganization}</Cell></Row
      >
      {#if info.city.Continent != null}
        {#if info.city.Continent.Names != null}
          <Row
            ><Cell>Continent</Cell>
            <Cell>{getName(info.city.Continent.Names)}</Cell></Row
          >
        {/if}
      {/if}
      {#if info.city.Country != null}
        {#if info.city.Country.Names != null}
          <Row
            ><Cell>Country</Cell>
            <Cell>{getName(info.city.Country.Names)}</Cell></Row
          >
          <Row
            ><Cell>Country ISO code</Cell>
            <Cell>{info.city.Country.IsoCode}</Cell></Row
          >
        {/if}
      {/if}
      {#if checkRepresentedCountry(info)}
        <Row
          ><Cell>RepresentedCountry</Cell>
          <Cell>{getName(info.city.RepresentedCountry.Names)}</Cell></Row
        >
        <Row
          ><Cell>RepresentedCountry ISO code</Cell>
          <Cell>{info.city.RepresentedCountry.IsoCode}</Cell></Row
        >
      {/if}
      {#if checkRegisteredCountry(info)}
        <Row
          ><Cell>Registered Country</Cell>
          <Cell>{getName(info.city.RegisteredCountry.Names)}</Cell></Row
        >
        <Row
          ><Cell>RegisteredCountry ISO code</Cell>
          <Cell>{info.city.RegisteredCountry.IsoCode}</Cell></Row
        >
      {/if}
      {#if info.city.Subdivisions != null}
        {#each info.city.Subdivisions as subdivision}
          {#if subdivision.Names != null}
            <Row
              ><Cell>Subdivision</Cell>
              <Cell>{getName(subdivision.Names)}</Cell></Row
            >
            <Row
              ><Cell>Subdivision ISO code</Cell>
              <Cell>{subdivision.IsoCode}</Cell></Row
            >
          {/if}
        {/each}
      {/if}
      {#if info.city.City != null}
        {#if info.city.City.Names != null}
          <Row
            ><Cell>City</Cell>
            <Cell>{getName(info.city.City.Names)}</Cell></Row
          >
        {/if}
      {/if}
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
