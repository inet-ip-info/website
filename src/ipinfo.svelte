<script lang="ts">
    import Netmask from "netmask";
    import Card from "@smui/card";
    import DataTable, { Body, Row, Cell } from "@smui/data-table";
    import GeoIP from "./geoip.svelte";

    let countryCode: string = "";
    let countryName: string = "";
    let cityName: string = "";
    let ipAddress: string = "";
    let network: string = "";
    let asNumber: string = "";
    let asName: string = "";
    let isp: string = "";
    let domain: string = "";
    function onLoaded(event) {
        countryCode = event.detail.countryCode;
        countryName = event.detail.countryName;
        cityName = event.detail.cityName;
        ipAddress = event.detail.ipAddress;
        network = event.detail.network;
        asNumber = event.detail.asNumber;
        asName = event.detail.asName;
        isp = event.detail.isp;
        domain = event.detail.domain;
    }
</script>

<GeoIP on:loaded={onLoaded} />
<Card>
    <DataTable table$aria-label="ip list" style="width: auto;">
        <Body>
            <Row><Cell>IP address</Cell> <Cell>{ipAddress}</Cell></Row>
            <Row><Cell>Country</Cell> <Cell>{countryName}</Cell></Row>
            <Row><Cell>Country code</Cell> <Cell>{countryCode}</Cell></Row>
            <Row><Cell>City</Cell> <Cell>{cityName}</Cell></Row>
            <Row><Cell>AS number</Cell> <Cell>{asNumber}</Cell></Row>
            <Row><Cell>AS</Cell> <Cell>{asName}</Cell></Row>
            <Row><Cell>ISP</Cell> <Cell>{isp}</Cell></Row>
            <Row><Cell>Domain</Cell> <Cell>{domain}</Cell></Row>
            <Row><Cell>Network</Cell> <Cell>{network}</Cell></Row>
        </Body>
    </DataTable>
</Card>

<style>
    :global(.mdc-card) {
        padding: 18px;
    }
</style>
