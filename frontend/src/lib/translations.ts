interface LanguageTranslations {
  [key: string]: string;
}

interface Translations {
  [locale: string]: LanguageTranslations;
}

export type TranslationKey = keyof typeof translations.en | keyof typeof translations.ja;

const translations: Translations = {
  en: {
    "home.title": "inet-ip.info",
    "home.welcome": `This website is a web service that allows you to check your current IP address. It is a web service written in the Go language, and
        its source code is publicly available on <a href="https://github.com/inet-ip-info/website/" class="link-underline-primary">GitHub</a
        >. This service is particularly useful for individuals and developers who need to quickly determine their public IP address for
        various network tasks, troubleshooting, or development purposes.`,
    "home.time": "The current time is: {{time}}",
    "home.ipButton": "IPv4",
    "home.IPaddressInfomation": "IP address Infomation",
    "home.ipv4required": "Valid IPv4 address is required.",
    "home.Your": "Your",
    "home.IPaddress": "IP address",
    "home.address": "address",
    "home.AS": "AS",
    "home.Continent": "Continent",
    "home.Country": "Country",
    "home.country": "country",
    "home.Represented": "Represented",
    "home.Subdivision": "Subdivision",
    "home.City": "City",
    "home.Location": "Location",
    "home.PostalCode": "Postal code",
    "home.Timezone": "Timezone",
    "home.ISP": "ISP",
    "home.Org": "Organization",
    "home.org": "organization",
    "home.domain": "domain",
    "home.type": "type",
    "home.CLI": "Command Line Interface",
    "home.CLIinfo1":
      "Using the Linux curl command, you can easily retrieve your external IP address and related information. This command is extremely handy for network diagnostics or for verification tasks during development.",
    "home.Command": "Command",
    "home.Response": "Response",
    "home.CLIres1": "Current IP address (e.g., {{myIP}}\\n)",
    "home.CLIres2": "Just the IP address in text format (e.g., {{myIP}})",
    "home.CLIres3": "A JSON string containing the IP address and other details",
    "home.CLIinfo2":
      "These commands are useful in various scenarios, such as network troubleshooting or verifying the IP address during application development. If the command fails, check your network connection or recheck the command syntax.",
    "ipcalc.title": "IP Calculator",
    "ipcalc.welcome":
      "This tool takes the bit number in CIDR (Classless Inter-Domain Routing) notation as input and calculates important network information based on it, including the network address, the number of usable hosts, the subnet mask, and the broadcast address.",
    "ipv4bycounty.welcome": `This site uses <a href="https://github.com/inet-ip-info/WorldIPv4Map" class="link-underline-primary">GitHub Actions</a> to automatically collect and aggregate the latest IP address data from multiple Regional Internet Registries (RIRs) daily. The collected data is converted into CIDR notation and subnet mask notation, and is provided in a text file format that can be easily used with Linux commands and similar tools.`,
    "ipv4bycounty.title": "IPv4 Address CIDR by Country",
    "ipv4bycounty.title1": "What is This IP Address List Used For?",
    "ipv4bycounty.text1": "This IP address list is very useful for restricting network access by country in a Linux environment.",
    "ipv4bycounty.title2": "Usage Example",
    "ipv4bycounty.text2": `This example demonstrates how to allow only IPv4 addresses from Japan (Country Code: JP) using <code>ipset</code> and
        <code>iptables</code>.`,
    "ipv4bycounty.usageTitle1": "Installing ipset Command",
    "ipv4bycounty.usageText1": "Installation command for Debian/Ubuntu-based Linux:",
    "ipv4bycounty.usageTitle2": "Creating and Loading the CIDR File into ipset",
    "ipv4bycounty.usageText2":
      "First, download the file containing all IPv4 CIDR lists (all-ipv4cidr.tsv.gz), extract only the Japanese IPv4 addresses to create the CIDR file, and then load this file into ipset.",
    "ipv4bycounty.usageTitle3": "Allowing Specific Ports with iptables",
    "ipv4bycounty.usageText3":
      "Finally, use iptables to allow only specific UDP ports (for example, 26900-26903) for IP addresses included in the $SETNAME ipset.",
    "ipv4bycounty.endText": "By using this setup, you can easily allow access only from IP addresses of a specific country.",
    "cliplayground.title": "CLI Command Playground",
    "cliplayground.welcome": `Safely and intuitively try out text processing commands <code>sed</code>, <code>grep</code>, <code>awk</code>, <code>jq</code> on a web browser`,
    "cliplayground.welcomeMini": `Text processing commands can be tested safely and intuitively.`,
    "cliplayground.description": `<p>These tools, compiled into WebAssembly, allow you to experiment with text manipulation easily without sending any data to the server.</p>
            <h5>Features:</h5>
            <ul><li><strong>Compiled from the Original Source Code: ...</strong> <code>sed</code>, <code>grep</code>, <code>awk</code>,
                <code>jq</code> are compiled from their original sources, ensuring perfect compatibility in operation.
            </li></ul>
            <ul><li>
                <strong>Accurate Replication of Escape Processing: ...</strong> Faithfully replicates the escape processing of shell command lines, making it ideal for testing the behavior of command-line arguments.
            </li></ul>
            <ul><li>
                <strong>Safety: ...</strong> No need to send test data to the server, as everything is completed in the browser, ensuring safe usage.
            </li></ul>
            <ul><li>
                <strong>Convenient Save Feature: ...</strong> Your executions are saved in the browser's local storage, making reuse easy.
            </li></ul>
            This playground is the perfect place for those who want to polish their programming skills and explore the depths of CLI commands. Start now and expand the possibilities of text processing!`,
  },
  ja: {
    "home.title": "inet-ip.info",
    "home.welcome": `このウェブサイトは、現在のIPアドレスを確認できるWebサービスです。Go言語で書かれたウェブサービスで、そのソースコードは<a href="https://github.com/inet-ip-info/website/" class="link-underline-primary">GitHub</a>で公開されています。このサービスは、ネットワークタスク、トラブルシューティング、開発目的で迅速に公開IPアドレスを把握する必要がある個人や開発者に特に便利です。`,
    "home.time": "現在の時刻: {{time}}",
    "home.ipButton": "IPv4",
    "home.IPaddressInfomation": "IPアドレス情報",
    "home.ipv4required": "有効なIPv4アドレスが必要です。",
    "home.Your": "あなたの",
    "home.IPaddress": "IPアドレス",
    "home.address": "アドレス",
    "home.AS": "AS",
    "home.Continent": "大陸",
    "home.Country": "国",
    "home.country": "国",
    "home.Represented": "代表される",
    "home.Subdivision": "州(県)",
    "home.City": "市",
    "home.Location": "位置",
    "home.PostalCode": "郵便番号",
    "home.Timezone": "タイムゾーン",
    "home.ISP": "ISP",
    "home.Org": "組織",
    "home.org": "組織",
    "home.domain": "ドメイン",
    "home.type": "タイプ",
    "home.CLI": "コマンドラインインターフェース",
    "home.CLIinfo1":
      "Linuxのcurlコマンドを使用すると、外部IPアドレスと関連情報を簡単に取得できます。このコマンドは、ネットワーク診断や開発中の確認作業に非常に便利です。",
    "home.Command": "コマンド",
    "home.Response": "レスポンス",
    "home.CLIres1": "現在のIPアドレス（例：{{myIP}}\\n）",
    "home.CLIres2": "テキスト形式のIPアドレスのみ（例：{{myIP}}）",
    "home.CLIres3": "IPアドレスとその他の詳細を含むJSON文字列",
    "home.CLIinfo2":
      "これらのコマンドは、ネットワークトラブルシューティングやアプリケーション開発中のIPアドレスの確認など、様々なシナリオで役立ちます。コマンドが失敗した場合は、ネットワーク接続を確認するか、コマンドの構文を再確認してください。",
    "ipcalc.title": "IP計算機",
    "ipcalc.welcome":
      "このツールは、CIDR（クラスレス・インタードメイン・ルーティング）表記のビット数を入力として受け取り、それに基づいて重要なネットワーク情報を計算します。これには、ネットワークアドレス、使用可能なホストの数、サブネットマスク、ブロードキャストアドレスが含まれます。",
    "ipv4bycounty.welcome": `このサイトは<a href="https://github.com/inet-ip-info/WorldIPv4Map/blob/main/README.jp.md" class="link-underline-primary">GitHub Actions</a>を使用して、複数の地域インターネットレジストリ（RIR）から最新のIPアドレスデータを毎日自動的に収集し集約します。収集されたデータはCIDR表記とサブネットマスク表記に変換され、Linuxコマンドや類似ツールで簡単に使用できるテキストファイル形式で提供されます。`,
    "ipv4bycounty.title": "国別IPv4アドレスCIDR",
    "ipv4bycounty.title1": "このIPアドレスリストは何に使われますか？",
    "ipv4bycounty.text1": "このIPアドレスリストは、Linux環境で国別にネットワークアクセスを制限するのに非常に役立ちます。",
    "ipv4bycounty.title2": "使用例",
    "ipv4bycounty.text2": `この例は、<code>ipset</code>と<code>iptables</code>を使用して、日本（国コード：JP）のIPv4アドレスのみを許可する方法を示しています。`,
    "ipv4bycounty.usageTitle1": "ipsetコマンドのインストール",
    "ipv4bycounty.usageText1": "Debian/UbuntuベースのLinux用のインストールコマンド：",
    "ipv4bycounty.usageTitle2": "CIDRファイルをipsetに作成し読み込む",
    "ipv4bycounty.usageText2":
      "まず、全てのIPv4 CIDRリストを含むファイル（all-ipv4cidr.tsv.gz）をダウンロードし、日本のIPv4アドレスだけを抽出してCIDRファイルを作成し、その後このファイルをipsetに読み込みます。",
    "ipv4bycounty.usageTitle3": "iptablesで特定のポートを許可する",
    "ipv4bycounty.usageText3":
      "最後に、iptablesを使用して、$SETNAME ipsetに含まれるIPアドレスに対して特定のUDPポート（例えば、26900-26903）のみを許可します。",
    "ipv4bycounty.endText": "この設定を使用することで、特定の国のIPアドレスからのアクセスのみを簡単に許可できます。",
    "cliplayground.title": "CLI コマンド プレイグラウンド",
    "cliplayground.welcome": `Webブラウザ上でテキスト処理コマンド </strong> <code>sed</code>, <code>grep</code>, <code>awk</code>, <code>jq</code> を安全かつ直感的に試せます`,
    "cliplayground.welcomeMini": `テキスト処理コマンドを安全かつ直感的に試せます`,
    "cliplayground.description": `<p>サーバーにデータを送信することなく、WebAssemblyにコンパイルされたこれらのツールを利用して、手軽にテキスト加工の実験が可能です。</p>
              <h5>特長：</h5>
              <ul><li><strong>オリジナルのソースコードからコンパイル: ...</strong> <code>sed</code>, <code>grep</code>, <code>awk</code>,
                  <code>jq</code>のそれぞれがオリジナルソースからコンパイルされているため、動作の互換性は完璧です。
              </li></ul>
              <ul><li>
                  <strong>エスケープ処理の再現: ...</strong> シェルのコマンドラインのエスケープ処理を忠実に再現。コマンドライン引数の動作テストに最適です。
              </li></ul>
              <ul><li>
                  <strong>安全性: ...</strong> サーバーへのテストデータ送信が不要で、ブラウザ上で完結するため、安全に利用できます。
              </li></ul>
              <ul><li>
                  <strong>便利な保存機能: ...</strong> あなたの実行内容はブラウザのローカルストレージに保存され、再利用が簡単です。
              </li></ul>
              プログラミングのスキルを磨きたい方、CLIコマンドの奥深さを探求したい方には、このプレイグラウンドが最適な場所です。今すぐ始めて、テキスト処理の可能性を広げましょう！`,
  },
};

export default translations;
