<script lang="ts">
    //import TopBar from "./TopBar.svelte";
    import Ipcalc from "./ipcalc.svelte";
    import { onDestroy, onMount } from "svelte";

    import type { DrawerComponentDev } from "@smui/drawer";

    import Drawer, { Content, Scrim, AppContent } from "@smui/drawer";

    import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
    import IconButton from "@smui/icon-button";
    import { Icon } from "@smui/common";
    import { mdiGithub } from "@mdi/js";
    import { A, Svg } from "@smui/common/elements";
    import type { MenuComponentDev } from "@smui/menu";
    import Menu from "@smui/menu";
    import List, { Item, Separator, Text } from "@smui/list";
    let menu: MenuComponentDev;
    let drawer: DrawerComponentDev;
    const sections = [
        { name: "IP Info", component: Ipcalc },
        { name: "IP Calc", component: Ipcalc },
    ];
    let activeSection = sections[0];
    let miniWindow = false;
    let drawerOpen = false;
    function setMiniWindow() {
        if (typeof window !== "undefined") {
            miniWindow = window.innerWidth < 720;
        }
    }
    function sectionHandler(section) {
        activeSection = section;
    }
    onMount(setMiniWindow);
</script>

<TopAppBar variant="static" color="secondary">
    <Row>
        <Section>
            {#if miniWindow}
                <IconButton
                    on:click={() => menu.setOpen(true)}
                    class="material-icons">menu</IconButton
                >
            {/if}
            <Title>inet-ip.info</Title>
        </Section>
        <Section align="end" toolbar>
            <IconButton href="https://github.com/hperrin/svelte-material-ui">
                <Icon component={Svg} viewBox="0 0 24 24">
                    <path fill="currentColor" d={mdiGithub} />
                </Icon>
            </IconButton>
        </Section>
    </Row>
</TopAppBar>
<Menu bind:this={menu}>
    <List>
        <Item>
            <A href="https://inet-ip.info">inet-ip.info</A>
        </Item>
        <Separator />
        <Item>
            <Text>Cancel</Text>
        </Item>
    </List>
</Menu>
<div class="drawer-container">
    <Drawer
        bind:this={drawer}
        variant={miniWindow ? "modal" : undefined}
        bind:open={drawerOpen}
        class="drawer mdc-theme--secondary-bg {miniWindow
            ? 'drawer-adjust'
            : 'hide-initial-small'}"
    >
        <Content>
            <List>
                {#each sections as section}
                    <Item
                        on:click={() => sectionHandler(section)}
                        activated={section === activeSection}
                    >
                        <Text class="mdc-theme--on-secondary"
                            >{section.name}</Text
                        >
                    </Item>
                {/each}
            </List>
        </Content>
    </Drawer>

    {#if miniWindow}
        <Scrim />
    {/if}
    <AppContent class="app-content">
        <main class="main-content">
            <Ipcalc />
        </main>
    </AppContent>
</div>

<style>
    .main-content {
        margin: 18px;
    }
    @media (max-width: 720px) {
        * > :global(.hide-initial-small) {
            display: none;
        }
    }
    .drawer-container {
        flex-grow: 1;
        height: 100%;
        display: flex;
    }
    :global(.drawer, .main-content) {
        overflow: auto;
        height: 100%;
    }

    :global(.app-content) {
        flex: auto;
        position: relative;
        width: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    :global(.main-content) {
        overflow: auto;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    :global(.main-content > section) {
        padding: 48px;
        width: 100%;
        box-sizing: border-box;
    }

    :global(.main-content > section:after) {
        height: 32px;
        display: block;
        content: " ";
    }
    :global(.highlight) {
        background-color: #282b2e;
        color: #e0e2e4;
        padding: 1em !important;
        border-radius: 5px;
    }

    :global(.status) {
        max-width: 100%;
        font-size: 0.9em;
        word-break: break-word;
        white-space: normal;
        margin-bottom: 0;
    }
</style>
