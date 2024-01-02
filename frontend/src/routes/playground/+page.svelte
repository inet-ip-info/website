<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { javascript } from "@codemirror/lang-javascript";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { solarizedLight } from "cm6-theme-solarized-light";
  import { EditorView } from "@codemirror/view";
  import { split } from "shlex";
  import { t, initLocate } from "$lib/i18n";
  import { blur } from "svelte/transition";

  let cliInput = "";
  let stdinInput = "";
  let value = "";
  let errorMessage: string = "";
  let tab = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cli: any;

  type inputStore = {
    cliInput: string;
    stdinInput: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aioliMap: any = {
    "sed-CLI": ["base/1.0.0", { tool: "sed", version: "4.8", reinit: true }],
    "grep-CLI": ["base/1.0.0", { tool: "grep", version: "3.7", reinit: true }],
    "awk-CLI": ["base/1.0.0", { tool: "gawk", version: "5.1.0", reinit: true }],
    "jq-CLI": ["jq/1.7"],
  };

  const defaultStrings: { [key: string]: inputStore } = {
    "sed-CLI": {
      cliInput: "sed --help",
      stdinInput: `hello
hel
lo
hello`,
    },
    "grep-CLI": {
      cliInput: "grep --help",
      stdinInput: `Lion: Africa
Tiger: Asia
Elephant: Africa
Penguin: Antarctica
Giraffe: Africa
Polar Bear: Arctic`,
    },
    "awk-CLI": {
      cliInput: "awk --help",
      stdinInput: `2024-01-01 12:30:45 Server1 Status: Active
2024-01-01 12:31:10 Server2 Status: Inactive
2024-01-01 12:32:05 Server3 Status: Active
2024-01-01 12:33:00 Server1 Status: Inactive`,
    },
    "jq-CLI": {
      cliInput: "jq --help",
      stdinInput: `{
  "servers": [
    {"name": "Server1", "status": "Active"},
    {"name": "Server2", "status": "Inactive"},
    {"name": "Server3", "status": "Active"}
  ]
}`,
    },
  };

  const getStoreTab = (): string => {
    const v = localStorage.getItem("tab");
    return v === null ? "sed-CLI" : v;
  };
  const saveStoreTab = () => {
    localStorage.setItem("tab", tab);
  };
  const getValue = () => {
    const s = ((): inputStore => {
      const stored = localStorage.getItem(tab);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return defaultStrings[tab];
    })();
    cliInput = s.cliInput;
    stdinInput = s.stdinInput;
  };
  const saveValue = () => {
    localStorage.setItem(
      tab,
      JSON.stringify({
        cliInput: cliInput,
        stdinInput: stdinInput,
      }),
    );
  };

  const run = async (stdin: string, command: string, arg: string[]) => {
    if (!cli) return;
    cli.stdin = stdin;
    const result = await cli.exec(command, arg);
    //console.log("result:", result);
    value = "";
    if (result.stderr && result.stderr.startsWith("exception thrown: RuntimeError:")) {
      console.log("exception thrown:", result.stderr);
      cli = null;
      setTimeout(() => {
        console.log("reload Aioli...");
        loadAioli(tab);
      }, 1000);
      return;
    }
    if (result.stderr) {
      value = rmESC(result.stderr);
    }
    if (result.stdout) {
      value = value + rmESC(result.stdout);
    }
  };

  const loadAioli = async (tabname: string) => {
    const arg = aioliMap[tabname];
    //console.log("loadAioli:", arg);
    cli = await new window.Aioli(arg, { printInterleaved: false });
  };

  const init = async () => {
    if (window.Aioli) {
      getValue();
      await loadAioli(tab);
      runCommand();
    } else {
      setTimeout(init, 1000);
    }
  };
  onMount(async () => {
    if (browser) {
      initLocate();
      tab = getStoreTab();
      init();
    }
  });

  // theme
  let theme = EditorView.theme({});
  const updateThemeBasedOnSystemSettings = () => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    //theme = currentTheme === "dark" ? oneDark : EditorView.theme({});
    theme = currentTheme === "dark" ? oneDark : solarizedLight;
    //theme = currentTheme === "dark" ? oneDark : basicLight;
  };
  onMount(() => {
    updateThemeBasedOnSystemSettings();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-bs-theme") {
          updateThemeBasedOnSystemSettings();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  });
  const handleTabClick = async (event: MouseEvent) => {
    // クリックされた要素のIDを取得
    const elementId = (event.target as HTMLElement).id;
    //console.log(`Clicked element ID: ${elementId}`);
    tab = elementId;
    await loadAioli(tab);
    saveStoreTab();
    getValue();
    runCommand();
  };
  const runCommand = async () => {
    try {
      let args = split(cliInput);
      //console.debug(`args:`, args);
      let command = args[0];
      args.shift();
      if (tab === "awk-CLI" && command === "awk") {
        command = "gawk";
      }
      //console.debug(`command:`, command);
      await run(stdinInput, command, args);
      errorMessage = "";
      saveValue();
    } catch (error) {
      if (error instanceof Error) {
        //console.debug(`err:`, error);
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
    }
  };
  const changeHandler = (/*event: Event*/) => {
    runCommand();
  };
  const rmESC = (text: string): string => {
    // eslint-disable-next-line no-control-regex
    const escapeSequenceRegex = /\x1b\[[0-9;]*m/g;
    return text.replace(escapeSequenceRegex, "");
  };
</script>

<svelte:head>
  <title>hogehoge</title>
  <script src="https://biowasm.com/cdn/v3/aioli.js"></script>
</svelte:head>

<!-- eslint-disable svelte/no-at-html-tags  -->
<main>
  <div class="mx-5 py-2" transition:blur={{ opacity: 1000 }}>
    <div class="py-2 text-center">
      <h3 class="">{$t("cliplayground.title")}</h3>
      <div class="accordion" id="accordion1">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne">{@html $t("cliplayground.welcome")}</button
            >
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordion1">
            <div class="accordion-body text-start">{@html $t("cliplayground.description")}</div>
          </div>
        </div>
      </div>
    </div>

    {#if tab !== ""}
      <div class="border rounded">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="sed-CLI"
              on:click={handleTabClick}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              aria-selected={tab === "sed-CLI"}
              class:active={tab === "sed-CLI"}>sed</button
            >
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="grep-CLI"
              on:click={handleTabClick}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              aria-selected={tab === "grep-CLI"}
              class:active={tab === "grep-CLI"}>grep</button
            >
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="awk-CLI"
              on:click={handleTabClick}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              aria-selected={tab === "awk-CLI"}
              class:active={tab === "awk-CLI"}>awk</button
            >
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="jq-CLI"
              on:click={handleTabClick}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              aria-selected={tab === "jq-CLI"}
              class:active={tab === "jq-CLI"}>jq</button
            >
          </li>
        </ul>
        <div class="px-2 py-3 mx-1 bg-body">
          {#if tab === "sed-CLI"}
            <h3>sed (4.8)</h3>
            command line input:
            <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
            {#if errorMessage !== ""}
              <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
                {errorMessage}
              </div>
            {/if}
            <div class="row">
              <div class="col">
                Stdin:
                <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
              </div>
              <div class="col">
                Output:
                <CodeMirror bind:value lang={javascript()} {theme} />
              </div>
            </div>
          {:else if tab === "grep-CLI"}
            <h3>grep (3.7)</h3>
            Command line input:
            <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
            {#if errorMessage !== ""}
              <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
                {errorMessage}
              </div>
            {/if}
            <div class="row">
              <div class="col">
                Stdin:
                <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
              </div>
              <div class="col">
                Output:
                <CodeMirror bind:value lang={javascript()} {theme} />
              </div>
            </div>
          {:else if tab === "awk-CLI"}
            <h3>awk (gawk/5.1.0)</h3>
            Command line input:
            <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
            {#if errorMessage !== ""}
              <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
                {errorMessage}
              </div>
            {/if}
            <div class="row">
              <div class="col">
                Stdin:
                <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
              </div>
              <div class="col">
                Output:
                <CodeMirror bind:value lang={javascript()} {theme} />
              </div>
            </div>
          {:else if tab === "jq-CLI"}
            <h3>jq (1.7)</h3>
            Command line input:
            <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
            {#if errorMessage !== ""}
              <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
                {errorMessage}
              </div>
            {/if}
            <div class="row">
              <div class="col">
                Stdin:
                <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
              </div>
              <div class="col">
                Output:
                <CodeMirror bind:value lang={javascript()} {theme} />
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>

<style>
</style>
