<script lang="ts">
  import { fetcher, testData, checkIP, getRepresentedCountry, navbarIP } from "$lib/util";
  import { t, initLocate } from "$lib/i18n";
  import { blur } from "svelte/transition";
  import type { ipinfo, names } from "$lib/util";
  import { onMount } from "svelte";
  import { dev } from "$app/environment";

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
  let myIP = "";
  const updateNavbarIP = (myIP: string) => {
    navbarIP.set(myIP);
  };

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
        if (myIP === "") {
          updateNavbarIP(info.ipAddress);
          value = info.ipAddress;
          myIP = info.ipAddress;
          console.info("myIpinfo myIP: ", myIP);
        }
        return;
      })
      .catch((error) => {
        console.error("myIPinfo error:", error);
      });
  }

  onMount(() => {
    initLocate();
    if (dev) {
      info = testData;
      value = info.ipAddress;
      myIP = info.ipAddress;
      return;
    }
    myIPinfo();
  });
  let value = "";
  let isInvalidIP = false;
  const ipHandler = () => {
    if (checkIP(value)) {
      isInvalidIP = false;
      getIPinfo(value).catch((error) => {
        console.error("getIPinfo error:", error);
      });
      return;
    }
    if (value === "") {
      isInvalidIP = false;
      myIPinfo().catch((error) => {
        console.error("myIPinfo error:", error);
      });
      return;
    }
    isInvalidIP = true;
  };
  const getName = (Names: names): string => {
    if (Names == null) {
      return "";
    }
    if (dev) {
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
  };
  const checkRepresentedCountry = (info: ipinfo): boolean => {
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
  };
  const checkRegisteredCountry = (info: ipinfo): boolean => {
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
  };
  /* eslint-disable */
</script>

<svelte:head>
  <title>{$t("home.title")}</title>
</svelte:head>

{#if myIP !== ""}
  <div transition:blur={{ opacity: 1000 }}>
    <div class="py-5 text-center">
      <img class="d-block mx-auto mb-4" src="sitelogo.svg" alt="" width="172" height="157" />
      <h1>inet-ip.info</h1>
      <p class="lead">{@html $t("home.welcome")}</p>
    </div>

    <div class="col-sm-6 mb-3">
      <div class="input-group">
        <span class="input-group-text">{$t("home.ipButton")}</span>
        <input
          bind:value
          on:input={ipHandler}
          type="text"
          class="form-control"
          placeholder="IPv4 {$t('home.address')}"
          class:is-invalid={isInvalidIP}
          id="ipaddress"
        />
      </div>
      <div class="invalid-feedback">Valid IPv4 address is required.</div>
    </div>

    <div class="col-md-12 col-lg-12 order-md-last">
      <h4 class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-info"
          >{#if value === "" || myIP === value}{$t("home.Your")}
          {/if}{$t("home.IPaddressInfomation")}</span
        >
      </h4>
      <div class="border border-secondary rounded pt-3 px-3">
        <table class="table table-striped border-secondary mb-3">
          <tbody>
            <tr>
              <th scope="row"><h4>{$t("home.IPaddress")}</h4></th>
              <td><h4>{info.ipAddress}</h4></td>
            </tr>
            <tr>
              <th scope="row">AS</th>
              <td>{info.asn.AutonomousSystemNumber}</td>
            </tr>
            <tr>
              <th scope="row">AS organization</th>
              <td>{info.asn.AutonomousSystemOrganization}</td>
            </tr>
            {#if info.city.Continent != null}
              {#if info.city.Continent.Names != null}
                <tr
                  ><th scope="row">{$t("home.Continent")}</th>
                  <td>{getName(info.city.Continent.Names)}</td></tr
                >
              {/if}
            {/if}
            {#if info.city.Country != null}
              {#if info.city.Country.Names != null}
                <tr
                  ><th scope="row">{$t("home.Country")}</th>
                  <td>{getName(info.city.Country.Names)}</td></tr
                >
                <tr
                  ><th scope="row">{$t("home.Continent")} ISO code</th>
                  <td>{info.city.Country.IsoCode}</td></tr
                >
              {/if}
            {/if}
            {#if checkRepresentedCountry(info)}
              <tr
                ><th scope="row">{$t("home.Represented")} {$t("home.Continent")}</th>
                <td>{getName(getRepresentedCountry(info).Names)}</td></tr
              >
              <tr
                ><th scope="row">{$t("home.Represented")} {$t("home.Country")} ISO code</th>
                <td>{getRepresentedCountry(info).IsoCode}</td></tr
              >
            {/if}
            {#if checkRegisteredCountry(info)}
              <tr
                ><th scope="row">{$t("home.Represented")} {$t("home.Country")}</th>
                <td>{getName(getRepresentedCountry(info).Names)}</td></tr
              >
              <tr
                ><th scope="row">{$t("home.Represented")} {$t("home.Country")} ISO code</th>
                <td>{getRepresentedCountry(info).IsoCode}</td></tr
              >
            {/if}
            {#if info.city.Subdivisions != null}
              {#each info.city.Subdivisions as subdivision, i}
                {#if subdivision.Names != null}
                  <tr
                    ><th scope="row">{$t("home.Subdivision")}{i + 1}</th>
                    <td>{getName(subdivision.Names)}</td></tr
                  >
                  <tr
                    ><th scope="row">{$t("home.Subdivision")}{i + 1} ISO code</th>
                    <td>{subdivision.IsoCode}</td></tr
                  >
                {/if}
              {/each}
            {/if}
            {#if info.city.City != null}
              {#if info.city.City.Names != null}
                <tr
                  ><th scope="row">{$t("home.City")}</th>
                  <td>{getName(info.city.City.Names)}</td></tr
                >
              {/if}
            {/if}
            <tr
              ><th scope="row">{$t("home.PostalCode")}</th>
              <td>{info.city.Postal.Code}</td></tr
            >
            {#if info.city.Location}
              <tr
                ><th scope="row">{$t("home.Location")}</th>
                <td>
                  <table class="table mb-0 table-striped border-secondary table-sm">
                    <tbody>
                      <tr><th scope="row">AccuracyRadius:</th><td>{info.city.Location.AccuracyRadius}</td></tr>
                      <tr><th scope="row">Latitude:</th><td>{info.city.Location.Latitude}</td></tr>
                      <tr><th scope="row">Longitude:</th><td>{info.city.Location.Longitude}</td></tr>
                      <tr><th scope="row">MetroCode:</th><td>{info.city.Location.MetroCode}</td></tr>
                      <tr><th scope="row">TimeZone:</th><td>{info.city.Location.TimeZone}</td></tr>
                    </tbody>
                  </table>
                </td></tr
              >
            {/if}
            <tr><th scope="row">License</th> <td>{@html info.license}</td></tr>
          </tbody>
        </table>
      </div>
      <h2 class="mt-5"><span class="glyphicon glyphicon-console" aria-hidden="true"></span>{$t("home.CLI")}</h2>
      <p>
        {$t("home.CLIinfo1")}
      </p>
      <div class="table-responsive border border-secondary rounded pt-4 px-4 my-3">
        <table class="table table-striped">
          <thead>
            <tr>
              <th style="width: 30%">{$t("home.Command")}</th>
              <th style="width: 3%"></th>
              <th>{$t("home.Response")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>$ curl inet-ip.info</td>
              <td><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></td>
              <td>{$t("home.CLIres1", { myIP: myIP })}</td></tr
            >
            <tr>
              <td>$ curl inet-ip.info/ip</td>
              <td><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></td>
              <td>{$t("home.CLIres2", { myIP: myIP })}</td></tr
            >
            <tr>
              <td>$ curl inet-ip.info/json</td>
              <td><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></td>
              <td>{$t("home.CLIres3")}</td></tr
            >
          </tbody>
        </table>
      </div>
      <p>
        {$t("home.CLIinfo2")}
      </p>
    </div>
  </div>
{/if}
