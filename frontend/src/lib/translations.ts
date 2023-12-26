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
  },
};

export default translations;
