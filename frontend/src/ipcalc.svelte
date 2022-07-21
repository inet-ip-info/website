<script lang="ts">
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Netmask from "netmask";
  import Card from "@smui/card";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";

  //let valueIP;
  let value = "";
  let block: Netmask.Netmask = new Netmask.Netmask("0.0.0.0/0");
  function ipHandler() {
    block = new Netmask.Netmask(value);
  }
</script>

<Card>
  <div class="columns margins">
    <Textfield
      on:input="{ipHandler}"
      variant="filled"
      bind:value
      label="IPv4 address(CIDR)"
    >
      <HelperText slot="helper">For example: '192.168.0.1/24'</HelperText>
    </Textfield>
  </div>
  <DataTable table$aria-label="ip list" style="width: 50%;">
    <Body>
      <Row><Cell>base</Cell> <Cell>{block.base}</Cell></Row>
      <Row><Cell>mask</Cell> <Cell>{block.mask}</Cell></Row>
      <Row><Cell>bitmask</Cell> <Cell>{block.bitmask}</Cell></Row>
      <Row><Cell>hostmask</Cell> <Cell>{block.hostmask}</Cell></Row>
      <Row><Cell>broadcast</Cell> <Cell>{block.broadcast}</Cell></Row>
      <Row><Cell>size</Cell> <Cell>{block.size}</Cell></Row>
      <Row><Cell>first</Cell> <Cell>{block.first}</Cell></Row>
      <Row><Cell>last</Cell> <Cell>{block.last}</Cell></Row>
    </Body>
  </DataTable>
</Card>

<style>
  :global(.mdc-card) {
    padding: 18px;
  }
</style>
