<script>
  import LibLoader from "./LibLoader.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const onSuccess = function (geoipResponse) {
    const info = {
      ipAddress: geoipResponse.traits.ip_address || "unknown",
      network: geoipResponse.traits.network || "unknown",
      asNumber: geoipResponse.traits.autonomous_system_number || "unknown",
      asName: geoipResponse.traits.autonomous_system_organization || "unknown",
      isp: geoipResponse.traits.isp || "unknown",
      domain: geoipResponse.traits.domain || "unknown",
      cityName: geoipResponse.city.names.en || "unknown",
      countryName: geoipResponse.country.names.en || "unknown",
      countryCode: geoipResponse.country.iso_code || "unknown",
    };
    dispatch("loaded", info);
  };
  const onError = function (error) {
    const err = "an error!  Please try again.." + error;
    const info = {
      cityName: err,
      countryName: err,
      countryCode: err,
    };
    dispatch("loaded", info);
  };
  function onLoaded() {
    if (typeof geoip2 !== "undefined") {
      geoip2.city(onSuccess, onError);
    } else {
      document.getElementById("city").innerHTML = "a browser that blocks GeoIP2 requests";
    }
  }
</script>

<LibLoader
  libraryDetectionObject="geoip2"
  src="//geoip-js.com/js/apis/geoip2/v2.1/geoip2.js"
  on:loaded="{onLoaded}"
/>
