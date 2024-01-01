<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { javascript } from "@codemirror/lang-javascript";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { EditorView } from "@codemirror/view";
  import { split } from "shlex";

  let cliInput = "";
  let stdinInput = "";
  let value = "...";
  let errorMessage: string = "";

  let cli: any;
  const run = async (stdin: string, command: string, arg: string[]) => {
    cli.stdin = stdin;
    value = await cli.exec(command, arg);
  };

  onMount(async () => {
    if (browser && window.Aioli) {
      cli = await new window.Aioli([
        "base/1.0.0",
        {
          tool: "sed",
          version: "4.8",
          reinit: true,
        },
      ]);
    }
  });

  // theme
  let theme = EditorView.theme({});
  const updateThemeBasedOnSystemSettings = () => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    theme = currentTheme === "dark" ? oneDark : EditorView.theme({});
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
  let tab = "sed-tab";
  const handleClick = (event: MouseEvent) => {
    // クリックされた要素のIDを取得
    const elementId = (event.target as HTMLElement).id;
    console.log(`Clicked element ID: ${elementId}`);
    tab = elementId;
  };
  const changeHandler = (event: Event) => {
    try {
      let args = split(cliInput);
      //console.debug(`args:`, args);
      let command = args[0];
      args.shift();
      run(stdinInput, command, args);
      errorMessage = "";
    } catch (error) {
      if (error instanceof Error) {
        //console.debug(`err:`, error);
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
    }
  };
</script>

<svelte:head>
  <title>hogehoge</title>
  <script src="https://biowasm.com/cdn/v3/aioli.js"></script>
</svelte:head>

<main>
  <div class="mx-5 py-2">
    <div class="py-2 text-center">
      <h3 class="">CLI コマンド プレイグラウンド</h3>
      <div class="accordion" id="accordion1">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne">Webブラウザ上でテキスト処理コマンド sed, grep, awk, jq を安全かつ直感的に使えます</button
            >
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordion1">
            <div class="accordion-body text-start">
              <p>
                サーバーにデータを送信することなく、WebAssemblyにコンパイルされたこれらのツールを利用して、手軽にテキスト加工の実験が可能です。
              </p>
              <h5>特長：</h5>
              <ul>
                <li>
                  <strong>オリジナルのソースコードからコンパイル: ...</strong> <code>sed</code>, <code>grep</code>, <code>awk</code>,
                  <code>jq</code>のそれぞれがオリジナルソースからコンパイルされているため、動作の互換性は完璧です。
                </li>
              </ul>
              <ul>
                <li>
                  <strong>エスケープ処理の再現: ...</strong> シェルのコマンドラインのエスケープ処理を忠実に再現。コマンドライン引数の動作テストに最適です。
                </li>
              </ul>
              <ul>
                <li>
                  <strong>安全性: ...</strong> サーバーへのテストデータ送信が不要で、ブラウザ上で完結するため、安全に利用できます。
                </li>
              </ul>
              <ul>
                <li>
                  <strong>便利な保存機能: ...</strong> あなたの実行内容はブラウザのローカルストレージに保存され、再利用が簡単です。
                </li>
              </ul>
              プログラミングのスキルを磨きたい方、CLIコマンドの奥深さを探求したい方には、このプレイグラウンドが最適な場所です。今すぐ始めて、テキスト処理の可能性を広げましょう！
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border rounded">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="sed-tab"
            on:click={handleClick}
            data-bs-toggle="tab"
            type="button"
            role="tab"
            aria-selected="true">sed</button
          >
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="grep-tab" on:click={handleClick} data-bs-toggle="tab" type="button" role="tab" aria-selected="false"
            >grep</button
          >
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="awk-tab" on:click={handleClick} data-bs-toggle="tab" type="button" role="tab" aria-selected="false"
            >awk</button
          >
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="jq-tab" on:click={handleClick} data-bs-toggle="tab" type="button" role="tab" aria-selected="false"
            >jq</button
          >
        </li>
      </ul>
      {#if tab === "sed-tab"}
        <div class="px-2 py-3 mx-1">
          <h3>sed</h3>
          command line: input:
          <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
          {#if errorMessage !== ""}
            <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
              {errorMessage}
            </div>
          {/if}
          <div class="row">
            <div class="col">
              stdin:
              <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
            </div>
            <div class="col">
              output:
              <CodeMirror bind:value lang={javascript()} {theme} />
            </div>
          </div>
        </div>
      {:else if tab === "grep-tab"}
        <div class="px-2 py-3 mx-1">
          <h3>grep</h3>
          command line: input:
          <CodeMirror basic={false} bind:value={cliInput} on:change={changeHandler} lang={javascript()} {theme} />
          {#if errorMessage !== ""}
            <div class="p-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
              {errorMessage}
            </div>
          {/if}
          <div class="row">
            <div class="col">
              stdin:
              <CodeMirror bind:value={stdinInput} lang={javascript()} {theme} />
            </div>
            <div class="col">
              output:
              <CodeMirror bind:value lang={javascript()} {theme} />
            </div>
          </div>
        </div>
      {:else if tab === "awk-tab"}
        awk
        <CodeMirror bind:value lang={javascript()} {theme} />
      {:else if tab === "jq-tab"}
        jq
        <CodeMirror bind:value lang={javascript()} {theme} />
      {/if}
    </div>
  </div>
</main>

<style>
</style>
