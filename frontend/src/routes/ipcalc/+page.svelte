<script lang="ts">
  import Netmask from "netmask";
  import { isValidIPv4CIDR } from "$lib/util";
  import { t, initLocate } from "$lib/i18n";
  import { onMount } from "svelte";

  let value = "";
  let isInvalidIP = false;
  let block: Netmask.Netmask = new Netmask.Netmask("0.0.0.0/0");
  function ipHandler() {
    if (isValidIPv4CIDR(value)) {
      isInvalidIP = false;
      block = new Netmask.Netmask(value);
      return;
    }
    isInvalidIP = true;
  }
  onMount(() => {
    initLocate();
  });
</script>

<div class="container">
  <div class="py-5 text-center">
    <h1>{$t("ipcalc.title")}</h1>
    <p class="lead">{$t("ipcalc.welcome")}</p>
  </div>
  <div class="columns margins mb-3">
    <div class="input-group">
      <span class="input-group-text">IPv4 address(CIDR)</span>
      <input
        bind:value
        on:input={ipHandler}
        type="text"
        class="form-control"
        placeholder="For example: '192.168.0.1/24'"
        class:is-invalid={isInvalidIP}
        id="ipaddress"
      />
      <div class="invalid-feedback">Enter an IPv4 address(CIDR) For example: '192.168.0.1/24'</div>
    </div>
  </div>
  {#if !isInvalidIP && value !== ""}
    <div class="border border-secondary rounded pt-3 px-3">
      <table class="table table-striped border-secondary mb-3">
        <tbody>
          <tr><th>base</th> <td>{block.base}</td></tr>
          <tr><th>mask</th> <td>{block.mask}</td></tr>
          <tr><th>bitmask</th> <td>{block.bitmask}</td></tr>
          <tr><th>hostmask</th> <td>{block.hostmask}</td></tr>
          <tr><th>broadcast</th> <td>{block.broadcast}</td></tr>
          <tr><th>size</th> <td>{block.size}</td></tr>
          <tr><th>first</th> <td>{block.first}</td></tr>
          <tr><th>last</th> <td>{block.last}</td></tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 960px;
  }
</style>
