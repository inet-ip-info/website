import "./styles.css";
import { WORLD_MAP_PATHS, WORLD_MAP_VIEW_BOX } from "./world-map";

type PageName = "home" | "ipcalc" | "country" | "playground" | "access";
type Locale = "en" | "ja" | "zh-Hans" | "ko" | "es" | "fr" | "de" | "pt-BR";
type LocaleOption = { value: Locale; label: string; htmlLang: string; flag: string };

type NameMap = Record<string, string> | null;

type IpInfo = {
  ipAddress: string;
  asn: {
    AutonomousSystemNumber: number;
    AutonomousSystemOrganization: string;
  };
  city: {
    City: { Names: NameMap } | null;
    Continent: { Code: string; Names: NameMap } | null;
    Country: { IsInEuropeanUnion: boolean; IsoCode: string; Names: NameMap } | null;
    RegisteredCountry: { IsInEuropeanUnion: boolean; IsoCode: string; Names: NameMap } | null;
    RepresentedCountry: { IsInEuropeanUnion: boolean; IsoCode: string; Names: NameMap; Type: string } | null;
    Subdivisions: Array<{ IsoCode: string; Names: NameMap }> | null;
    Postal: { Code: string };
    Location: {
      AccuracyRadius: number;
      Latitude: number;
      Longitude: number;
      MetroCode: number;
      TimeZone: string;
    } | null;
    Traits: {
      IsAnonymousProxy: boolean;
      IsSatelliteProvider: boolean;
    } | null;
  };
  license: string;
};

type DetailRow = {
  label: string;
  value: string;
  strong?: boolean;
};

type HomeViewState = {
  currentIp: string;
  inputValue: string;
  resolvedTarget: string;
  info: IpInfo | null;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

type CountryFirewallMode = "nftables" | "legacy";

type CountryCommandExample = {
  title: string;
  command: string;
};

type CidrResult = {
  base: string;
  mask: string;
  bitmask: number;
  hostmask: string;
  broadcast: string;
  size: string;
  first: string;
  last: string;
};

type AccessSummary = {
  totalRequests: number;
  uniqueVisitors: number;
  peakHourRequests: number;
  successRate: number;
};

type AccessCountry = {
  code: string;
  name: string;
  requests: number;
  share: number;
};

type AccessLocation = {
  label: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  requests: number;
};

type AccessRanking = {
  label: string;
  requests: number;
  share?: number;
};

type AccessStatus = {
  code: string;
  requests: number;
};

type AccessHour = {
  hour: string;
  requests: number;
};

type AccessPeriod = {
  id: string;
  label: string;
  description?: string;
  generatedAt?: string;
  source?: string;
  windowHours: number;
  summary: AccessSummary;
  topCountries: AccessCountry[];
  topLocations: AccessLocation[];
  topAsns: AccessRanking[];
  topEndpoints: AccessRanking[];
  statusCodes: AccessStatus[];
  userAgents: AccessRanking[];
  hourlyRequests: AccessHour[];
  notes: string[];
};

type AccessHistoricalEstimate = {
  id: string;
  label: string;
  from: string;
  to: string;
  totalRequests: number;
  peakDay: string;
  peakDayRequests: number;
  sampleCount: number;
  coverageDays: number;
  estimated: boolean;
  notes: string[];
};

type AccessInsights = AccessPeriod & {
  sample?: boolean;
  defaultPeriod?: string;
  periods?: AccessPeriod[];
  historicalEstimates?: AccessHistoricalEstimate[];
};

const LOCALE_STORAGE_KEY = "inet-ip-info-locale";

const localeOptions: LocaleOption[] = [
  { value: "en", label: "English", htmlLang: "en", flag: "🇺🇸" },
  { value: "ja", label: "日本語", htmlLang: "ja", flag: "🇯🇵" },
  { value: "zh-Hans", label: "简体中文", htmlLang: "zh-Hans", flag: "🇨🇳" },
  { value: "ko", label: "한국어", htmlLang: "ko", flag: "🇰🇷" },
  { value: "es", label: "Español", htmlLang: "es", flag: "🇪🇸" },
  { value: "fr", label: "Français", htmlLang: "fr", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", htmlLang: "de", flag: "🇩🇪" },
  { value: "pt-BR", label: "Português", htmlLang: "pt-BR", flag: "🇧🇷" },
];

const translations = {
  en: {
    "meta.home.title": "inet-ip.info | IPv4 lookup for server operators",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 by Country | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.access.title": "Access Insights | inet-ip.info",
    "meta.description": "Fast IPv4 lookup, ASN, GeoIP and curl-ready responses for internet server administrators.",
    "language.label": "Language",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP Lookup",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 by Country",
    "nav.playground": "CLI Playground",
    "nav.access": "Access Insights",
    "nav.currentIp": "Your IP",
    "footer.summary": "Fast IPv4 lookup and curl-ready responses for server operators.",
    "home.lead": "Know what the internet sees.",
    "home.text": "Fast IPv4 lookup, ASN, GeoIP and curl-ready responses for server operators.",
    "home.lookupLabel": "IPv4 Lookup",
    "home.lookupPlaceholder": "IPv4 address",
    "home.lookupButton": "Inspect IP",
    "home.currentIpButton": "Use current IP",
    "home.viewCli": "View CLI",
    "home.panelAria": "IP address information",
    "home.resolvedTarget": "Resolved target",
    "home.resolving": "Resolving...",
    "home.ipAddress": "IP address",
    "home.lookupCoverage": "Lookup coverage",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "Coordinates",
    "home.signalCli": "CLI",
    "home.signalReady": "Ready",
    "home.signalCountry": "Country lookup",
    "home.signalLocation": "Location detail",
    "home.signalCurl": "curl-ready",
    "home.readableTitle": "GeoIP context for policy decisions",
    "home.readableText":
      "Use location data as an operations hint for firewall policy, traffic review, and incident notes; it is not host-level positioning.",
    "home.cliTitle": "curl-ready endpoints",
    "home.cliText": "Use the same service from shell scripts, provisioning jobs, monitoring checks or incident notes.",
    "home.moreToolsTitle": "More operator tools",
    "home.moreToolsText": "Move from discovery to calculation, country-based IPv4 lists, and browser-safe CLI experiments.",
    "home.toolIpcalcText": "CIDR, subnet mask and broadcast calculation.",
    "home.toolCountryText": "Country-based CIDR lists for network policy.",
    "home.toolPlaygroundText": "Try command patterns safely in the browser.",
    "home.toolAccessText": "Aggregated request geography, paths and client trends.",
    "detail.organization": "Organization",
    "detail.continent": "Continent",
    "detail.country": "Country",
    "detail.representedCountry": "Represented country",
    "detail.registeredCountry": "Registered country",
    "detail.subdivision": "Subdivision",
    "detail.city": "City",
    "detail.postalCode": "Postal code",
    "detail.timezone": "Timezone",
    "detail.coordinates": "Coordinates",
    "detail.status": "Status",
    "detail.waiting": "Waiting for lookup result",
    "detail.accuracyRadius": "Accuracy radius",
    "detail.latitude": "Latitude",
    "detail.longitude": "Longitude",
    "detail.metroCode": "Metro code",
    "geoip.source": "Data source",
    "geoip.operatorUse": "Operational use",
    "geoip.operatorUseValue": "Policy hint, allowlist review, incident context",
    "message.lookupFailed": "Lookup failed. Please retry or check the API response.",
    "message.invalidIpv4": "Valid IPv4 address is required.",
    "message.unknown": "Unknown",
    "license.prefix": "This product includes GeoLite2 data created by MaxMind, available from",
    "license.suffix": ".",
    "command.current.response": "Current IP address ({ip}\\n)",
    "command.current.fallback": "Current IP address",
    "command.current.note": "Plain response with a trailing newline.",
    "command.ipOnly.response": "IP address only",
    "command.ipOnly.note": "Minimal output for shell scripts.",
    "command.json.response": "JSON with IP, ASN and GeoIP fields",
    "command.json.note": "Structured data for automation.",
    "button.copy": "Copy",
    "button.copied": "Copied",
    "ipcalc.description":
      "Calculate CIDR, network address, subnet mask, broadcast address and usable host range without sending data to the server.",
    "ipcalc.label": "IPv4 address with CIDR",
    "ipcalc.placeholder": "For example: 192.168.0.1/24",
    "ipcalc.calculate": "Calculate",
    "ipcalc.error": "Enter an IPv4 address with CIDR, for example 192.168.0.1/24.",
    "cidr.base": "Network address",
    "cidr.mask": "Subnet mask",
    "cidr.bitmask": "CIDR bits",
    "cidr.hostmask": "Host mask",
    "cidr.broadcast": "Broadcast address",
    "cidr.size": "Address count",
    "cidr.first": "First usable address",
    "cidr.last": "Last usable address",
    "country.description":
      "Daily generated country-based IPv4 CIDR lists for nftables, legacy ipset/iptables rules, and operations runbooks.",
    "country.download": "Download all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Policy-ready list format",
    "country.formatText":
      "The release artifact is collected from public RIR data and published as tab-separated country code plus CIDR entries.",
    "country.firewallTabs": "Firewall examples",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Install nftables on Debian 13",
    "country.createJapanNftSet": "Create and load a Japan-only nftables set",
    "country.allowNftUdp": "Allow UDP game ports from the nftables set",
    "country.installIpset": "Install legacy ipset/iptables",
    "country.createJapanSet": "Create and load a Japan-only ipset",
    "country.allowUdp": "Allow UDP game ports from the ipset",
    "playground.description":
      "A lightweight browser scratchpad for common text-processing patterns. It is intentionally small and does not run a full shell.",
    "playground.tabs": "Command modes",
    "playground.pattern": "Pattern or expression",
    "playground.stdin": "Stdin",
    "playground.output": "Output",
    "playground.sed": "sed replace",
    "playground.awk": "awk columns",
    "playground.jq": "jq format",
    "playground.invalidJson": "Invalid JSON: {message}",
    "access.description":
      "A regularly updated, privacy-preserving summary of where requests come from, which paths are used, and whether the service looks healthy.",
    "access.generated": "Last updated",
    "access.window": "Window",
    "access.periods": "Period",
    "access.periodSummary": "Selected period",
    "access.periodDescriptionHours": "Last {count} hours from the latest aggregate.",
    "access.periodDescriptionDays": "Last {count} days from retained access logs.",
    "access.periodDescriptionMonths": "Last {count} months from available aggregate data.",
    "access.periodDescriptionYears": "Last {count} years from available aggregate data.",
    "access.periodDescriptionAll": "All available aggregate data.",
    "access.periodAll": "all",
    "access.requests": "Requests",
    "access.visitors": "Unique visitors",
    "access.peakHour": "Peak hour",
    "access.peakDay": "Peak day",
    "access.successRate": "Success rate",
    "access.logSummary": "Retained access-log aggregate",
    "access.historicalEstimate": "Historical estimate",
    "access.estimatedRequests": "Estimated requests",
    "access.estimatedPeakDay": "Estimated peak day",
    "access.estimatedRange": "{from} - {to}",
    "access.estimatedCoverage": "{count} days estimated",
    "access.geoTitle": "Request geography",
    "access.geoText": "GeoIP is aggregated for operations visibility. Raw visitor IP addresses are not published in this page data.",
    "access.mapFallback": "No location data yet",
    "access.topCountries": "Top countries",
    "access.topLocations": "Top locations",
    "access.trafficTitle": "Traffic shape",
    "access.trafficText": "Use the trend, endpoint and status breakdowns to spot sudden crawlers, broken links, or routing changes.",
    "access.hourlyTrend": "Hourly requests",
    "access.dailyTrend": "Daily requests",
    "access.topEndpoints": "Top endpoints",
    "access.statusCodes": "Status codes",
    "access.clientTitle": "Client signals",
    "access.clientText": "ASN and user-agent families help distinguish normal operator use, search crawlers and automated scripts.",
    "access.topAsns": "Top ASNs",
    "access.userAgents": "User agents",
    "access.notes": "Notes",
    "access.sampleNotice": "Showing bundled sample data. Configure the regularly updated access-insights.json to show live traffic.",
  },
  ja: {
    "meta.home.title": "inet-ip.info | サーバー管理者向け IPv4 lookup",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "国別 IPv4 | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.access.title": "Access Insights | inet-ip.info",
    "meta.description": "インターネットサーバー管理者向けの高速な IPv4 lookup、ASN、GeoIP、curl 対応レスポンス。",
    "language.label": "言語",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP Lookup",
    "nav.ipcalc": "IPcalc",
    "nav.country": "国別 IPv4",
    "nav.playground": "CLI Playground",
    "nav.access": "Access Insights",
    "nav.currentIp": "Your IP",
    "footer.summary": "サーバー管理者向けの高速な IPv4 lookup と curl 対応レスポンス。",
    "home.lead": "インターネットから見える情報を把握する。",
    "home.text": "IPv4 lookup、ASN、GeoIP、curl 対応レスポンスをサーバー管理者向けに素早く返します。",
    "home.lookupLabel": "IPv4 Lookup",
    "home.lookupPlaceholder": "IPv4 アドレス",
    "home.lookupButton": "IP を確認",
    "home.currentIpButton": "現在の IP を使う",
    "home.viewCli": "CLI を見る",
    "home.panelAria": "IP アドレス情報",
    "home.resolvedTarget": "Resolved target",
    "home.resolving": "解決中...",
    "home.ipAddress": "IP アドレス",
    "home.lookupCoverage": "Lookup coverage",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "座標",
    "home.signalCli": "CLI",
    "home.signalReady": "準備完了",
    "home.signalCountry": "国 lookup",
    "home.signalLocation": "位置情報",
    "home.signalCurl": "curl 対応",
    "home.readableTitle": "GeoIP を運用判断に使う",
    "home.readableText": "GeoIP は firewall policy、allowlist、インシデント調査の補助情報として扱い、端末の正確な位置としては扱いません。",
    "home.cliTitle": "curl 対応エンドポイント",
    "home.cliText": "シェルスクリプト、プロビジョニング、監視、インシデントメモから同じサービスを利用できます。",
    "home.moreToolsTitle": "管理者向けツール",
    "home.moreToolsText": "調査から計算、国別 IPv4 リスト、ブラウザ上の CLI 実験まで移動できます。",
    "home.toolIpcalcText": "CIDR、サブネットマスク、ブロードキャストを計算します。",
    "home.toolCountryText": "ネットワークポリシー向けの国別 CIDR リスト。",
    "home.toolPlaygroundText": "コマンドパターンをブラウザ上で安全に試せます。",
    "home.toolAccessText": "リクエスト元の地域、path、client 傾向を集計します。",
    "detail.organization": "組織",
    "detail.continent": "大陸",
    "detail.country": "国",
    "detail.representedCountry": "代表国",
    "detail.registeredCountry": "登録国",
    "detail.subdivision": "地域",
    "detail.city": "都市",
    "detail.postalCode": "郵便番号",
    "detail.timezone": "タイムゾーン",
    "detail.coordinates": "座標",
    "detail.status": "状態",
    "detail.waiting": "lookup 結果待ち",
    "detail.accuracyRadius": "精度半径",
    "detail.latitude": "緯度",
    "detail.longitude": "経度",
    "detail.metroCode": "Metro code",
    "geoip.source": "データソース",
    "geoip.operatorUse": "運用での使い方",
    "geoip.operatorUseValue": "ポリシー判断、allowlist 確認、インシデント文脈の補助",
    "message.lookupFailed": "lookup に失敗しました。再試行するか API レスポンスを確認してください。",
    "message.invalidIpv4": "有効な IPv4 アドレスを入力してください。",
    "message.unknown": "不明",
    "license.prefix": "この製品には MaxMind が作成した GeoLite2 データが含まれています。入手元:",
    "license.suffix": "。",
    "command.current.response": "現在の IP アドレス ({ip}\\n)",
    "command.current.fallback": "現在の IP アドレス",
    "command.current.note": "末尾に改行を含むプレーンレスポンス。",
    "command.ipOnly.response": "IP アドレスのみ",
    "command.ipOnly.note": "シェルスクリプト向けの最小出力。",
    "command.json.response": "IP、ASN、GeoIP フィールドを含む JSON",
    "command.json.note": "自動化向けの構造化データ。",
    "button.copy": "コピー",
    "button.copied": "コピー済み",
    "ipcalc.description":
      "データをサーバーへ送らずに CIDR、ネットワークアドレス、サブネットマスク、ブロードキャスト、利用可能なホスト範囲を計算します。",
    "ipcalc.label": "CIDR 付き IPv4 アドレス",
    "ipcalc.placeholder": "例: 192.168.0.1/24",
    "ipcalc.calculate": "計算",
    "ipcalc.error": "192.168.0.1/24 のように CIDR 付き IPv4 アドレスを入力してください。",
    "cidr.base": "ネットワークアドレス",
    "cidr.mask": "サブネットマスク",
    "cidr.bitmask": "CIDR ビット",
    "cidr.hostmask": "ホストマスク",
    "cidr.broadcast": "ブロードキャストアドレス",
    "cidr.size": "アドレス数",
    "cidr.first": "最初の利用可能アドレス",
    "cidr.last": "最後の利用可能アドレス",
    "country.description": "nftables、legacy ipset/iptables ルール、運用 runbook 向けに日次生成される国別 IPv4 CIDR リストです。",
    "country.download": "all-ipv4cidr.tsv.gz をダウンロード",
    "country.formatTitle": "ポリシーに使いやすいリスト形式",
    "country.formatText": "release artifact は公開 RIR データから収集され、国コードと CIDR を tab 区切りで公開します。",
    "country.firewallTabs": "Firewall 例",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Debian 13 に nftables をインストール",
    "country.createJapanNftSet": "日本のみの nftables set を作成して読み込む",
    "country.allowNftUdp": "nftables set から UDP game port を許可",
    "country.installIpset": "legacy ipset/iptables をインストール",
    "country.createJapanSet": "日本のみの ipset を作成して読み込む",
    "country.allowUdp": "ipset から UDP game port を許可",
    "playground.description": "よく使うテキスト処理パターン向けの軽量なブラウザ scratchpad です。full shell は実行しません。",
    "playground.tabs": "コマンドモード",
    "playground.pattern": "パターンまたは式",
    "playground.stdin": "標準入力",
    "playground.output": "出力",
    "playground.sed": "sed 置換",
    "playground.awk": "awk 列抽出",
    "playground.jq": "jq 整形",
    "playground.invalidJson": "無効な JSON: {message}",
    "access.description":
      "定期更新されるプライバシー配慮済みのアクセス集計です。どの地域からのリクエストが多いか、どの path が使われているか、サービス状態に異常がないかを確認できます。",
    "access.generated": "最終更新",
    "access.window": "集計範囲",
    "access.periods": "期間",
    "access.periodSummary": "選択中の期間",
    "access.periodDescriptionHours": "直近 {count} 時間の集計です。",
    "access.periodDescriptionDays": "保持されている access log から直近 {count} 日分を集計します。",
    "access.periodDescriptionMonths": "利用可能な集計データから直近 {count} ヶ月分を表示します。",
    "access.periodDescriptionYears": "利用可能な集計データから直近 {count} 年分を表示します。",
    "access.periodDescriptionAll": "利用可能な全期間の集計です。",
    "access.periodAll": "全期間",
    "access.requests": "リクエスト",
    "access.visitors": "ユニーク訪問元",
    "access.peakHour": "ピーク時間",
    "access.peakDay": "ピーク日",
    "access.successRate": "成功率",
    "access.logSummary": "保持ログの詳細集計",
    "access.historicalEstimate": "過去推定",
    "access.estimatedRequests": "推定リクエスト",
    "access.estimatedPeakDay": "推定ピーク日",
    "access.estimatedRange": "{from} - {to}",
    "access.estimatedCoverage": "{count} 日分の推定",
    "access.geoTitle": "リクエスト元の地域",
    "access.geoText": "GeoIP は運用状況を把握するために集計します。このページ用データには訪問元 IP アドレスの生値を公開しません。",
    "access.mapFallback": "位置情報データはまだありません",
    "access.topCountries": "上位の国",
    "access.topLocations": "上位の地域",
    "access.trafficTitle": "トラフィックの形",
    "access.trafficText": "時間推移、endpoint、status の内訳から crawler の急増、リンク切れ、routing 変更を見つけやすくします。",
    "access.hourlyTrend": "時間別リクエスト",
    "access.dailyTrend": "日別リクエスト",
    "access.topEndpoints": "上位 endpoint",
    "access.statusCodes": "status code",
    "access.clientTitle": "client signal",
    "access.clientText": "ASN と user-agent family から、通常利用、search crawler、自動化 script の偏りを把握します。",
    "access.topAsns": "上位 ASN",
    "access.userAgents": "User agent",
    "access.notes": "メモ",
    "access.sampleNotice":
      "同梱サンプルデータを表示しています。定期更新される access-insights.json を設定すると実トラフィックを表示します。",
  },
  "zh-Hans": {
    "meta.home.title": "inet-ip.info | 面向服务器管理员的 IPv4 查询",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "按国家划分的 IPv4 | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "为互联网服务器管理员提供快速 IPv4 查询、ASN、GeoIP 和 curl 友好响应。",
    "language.label": "语言",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP 查询",
    "nav.ipcalc": "IPcalc",
    "nav.country": "按国家划分 IPv4",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "你的 IP",
    "footer.summary": "为服务器管理员提供快速 IPv4 查询和 curl 友好响应。",
    "home.lead": "了解互联网上看到的你。",
    "home.text": "为服务器管理员快速返回 IPv4 查询、ASN、GeoIP 和 curl 友好响应。",
    "home.lookupLabel": "IPv4 查询",
    "home.lookupPlaceholder": "IPv4 地址",
    "home.lookupButton": "检查 IP",
    "home.currentIpButton": "使用当前 IP",
    "home.viewCli": "查看 CLI",
    "home.panelAria": "IP 地址信息",
    "home.resolvedTarget": "已解析目标",
    "home.resolving": "解析中...",
    "home.ipAddress": "IP 地址",
    "home.lookupCoverage": "查询范围",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "坐标",
    "home.signalCli": "CLI",
    "home.signalReady": "就绪",
    "home.signalCountry": "国家查询",
    "home.signalLocation": "位置详情",
    "home.signalCurl": "curl 友好",
    "home.readableTitle": "用于策略判断的 GeoIP 上下文",
    "home.readableText": "将位置数据作为防火墙策略、流量复核和故障记录的运维提示，而不是主机级精确定位。",
    "home.cliTitle": "curl 友好端点",
    "home.cliText": "可在 shell 脚本、配置任务、监控检查或故障记录中使用同一服务。",
    "home.moreToolsTitle": "更多运维工具",
    "home.moreToolsText": "从发现到计算、国家 IPv4 列表以及浏览器内安全 CLI 实验。",
    "home.toolIpcalcText": "计算 CIDR、子网掩码和广播地址。",
    "home.toolCountryText": "用于网络策略的国家 CIDR 列表。",
    "home.toolPlaygroundText": "在浏览器中安全尝试命令模式。",
    "detail.organization": "组织",
    "detail.continent": "大洲",
    "detail.country": "国家",
    "detail.representedCountry": "代表国家",
    "detail.registeredCountry": "注册国家",
    "detail.subdivision": "行政区",
    "detail.city": "城市",
    "detail.postalCode": "邮政编码",
    "detail.timezone": "时区",
    "detail.coordinates": "坐标",
    "detail.status": "状态",
    "detail.waiting": "等待查询结果",
    "detail.accuracyRadius": "精度半径",
    "detail.latitude": "纬度",
    "detail.longitude": "经度",
    "detail.metroCode": "Metro code",
    "geoip.source": "数据源",
    "geoip.operatorUse": "运维用途",
    "geoip.operatorUseValue": "策略提示、allowlist 复核、事件上下文",
    "message.lookupFailed": "查询失败。请重试或检查 API 响应。",
    "message.invalidIpv4": "请输入有效的 IPv4 地址。",
    "message.unknown": "未知",
    "license.prefix": "本产品包含 MaxMind 创建的 GeoLite2 数据，来源:",
    "license.suffix": "。",
    "command.current.response": "当前 IP 地址 ({ip}\\n)",
    "command.current.fallback": "当前 IP 地址",
    "command.current.note": "带尾随换行的纯文本响应。",
    "command.ipOnly.response": "仅 IP 地址",
    "command.ipOnly.note": "适合 shell 脚本的最小输出。",
    "command.json.response": "包含 IP、ASN 和 GeoIP 字段的 JSON",
    "command.json.note": "适合自动化的结构化数据。",
    "button.copy": "复制",
    "button.copied": "已复制",
    "ipcalc.description": "无需向服务器发送数据，即可计算 CIDR、网络地址、子网掩码、广播地址和可用主机范围。",
    "ipcalc.label": "带 CIDR 的 IPv4 地址",
    "ipcalc.placeholder": "例如: 192.168.0.1/24",
    "ipcalc.calculate": "计算",
    "ipcalc.error": "请输入带 CIDR 的 IPv4 地址，例如 192.168.0.1/24。",
    "cidr.base": "网络地址",
    "cidr.mask": "子网掩码",
    "cidr.bitmask": "CIDR 位数",
    "cidr.hostmask": "主机掩码",
    "cidr.broadcast": "广播地址",
    "cidr.size": "地址数量",
    "cidr.first": "第一个可用地址",
    "cidr.last": "最后一个可用地址",
    "country.description": "每日生成的国家 IPv4 CIDR 列表，适用于 nftables、legacy ipset/iptables 规则和运维 runbook。",
    "country.download": "下载 all-ipv4cidr.tsv.gz",
    "country.formatTitle": "适合策略使用的列表格式",
    "country.formatText": "release artifact 从公开 RIR 数据收集，并以制表符分隔的国家代码和 CIDR 条目发布。",
    "country.firewallTabs": "防火墙示例",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "在 Debian 13 上安装 nftables",
    "country.createJapanNftSet": "创建并加载仅日本的 nftables set",
    "country.allowNftUdp": "允许来自 nftables set 的 UDP 游戏端口",
    "country.installIpset": "安装 legacy ipset/iptables",
    "country.createJapanSet": "创建并加载仅日本的 ipset",
    "country.allowUdp": "允许来自该 ipset 的 UDP 游戏端口",
    "playground.description": "用于常见文本处理模式的轻量浏览器 scratchpad。它故意保持小巧，不运行完整 shell。",
    "playground.tabs": "命令模式",
    "playground.pattern": "模式或表达式",
    "playground.stdin": "标准输入",
    "playground.output": "输出",
    "playground.sed": "sed 替换",
    "playground.awk": "awk 列",
    "playground.jq": "jq 格式化",
    "playground.invalidJson": "无效 JSON: {message}",
  },
  ko: {
    "meta.home.title": "inet-ip.info | 서버 운영자를 위한 IPv4 조회",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "국가별 IPv4 | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "인터넷 서버 관리자를 위한 빠른 IPv4 조회, ASN, GeoIP, curl 친화 응답.",
    "language.label": "언어",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP 조회",
    "nav.ipcalc": "IPcalc",
    "nav.country": "국가별 IPv4",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "내 IP",
    "footer.summary": "서버 운영자를 위한 빠른 IPv4 조회와 curl 친화 응답.",
    "home.lead": "인터넷에서 보이는 정보를 확인합니다.",
    "home.text": "서버 운영자를 위해 IPv4 조회, ASN, GeoIP, curl 친화 응답을 빠르게 제공합니다.",
    "home.lookupLabel": "IPv4 조회",
    "home.lookupPlaceholder": "IPv4 주소",
    "home.lookupButton": "IP 검사",
    "home.currentIpButton": "현재 IP 사용",
    "home.viewCli": "CLI 보기",
    "home.panelAria": "IP 주소 정보",
    "home.resolvedTarget": "해결된 대상",
    "home.resolving": "확인 중...",
    "home.ipAddress": "IP 주소",
    "home.lookupCoverage": "조회 범위",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "좌표",
    "home.signalCli": "CLI",
    "home.signalReady": "준비됨",
    "home.signalCountry": "국가 조회",
    "home.signalLocation": "위치 정보",
    "home.signalCurl": "curl 지원",
    "home.readableTitle": "정책 판단을 위한 GeoIP 맥락",
    "home.readableText":
      "위치 데이터는 방화벽 정책, 트래픽 검토, 장애 기록을 위한 운영 힌트로 보고 호스트 단위의 정확한 위치로 보지 않습니다.",
    "home.cliTitle": "curl 지원 엔드포인트",
    "home.cliText": "shell 스크립트, 프로비저닝, 모니터링 확인, 장애 기록에서 같은 서비스를 사용할 수 있습니다.",
    "home.moreToolsTitle": "운영자 도구",
    "home.moreToolsText": "조회에서 계산, 국가별 IPv4 목록, 브라우저 내 CLI 실험으로 이동합니다.",
    "home.toolIpcalcText": "CIDR, 서브넷 마스크, 브로드캐스트를 계산합니다.",
    "home.toolCountryText": "네트워크 정책을 위한 국가별 CIDR 목록.",
    "home.toolPlaygroundText": "브라우저에서 명령 패턴을 안전하게 시험합니다.",
    "detail.organization": "조직",
    "detail.continent": "대륙",
    "detail.country": "국가",
    "detail.representedCountry": "대표 국가",
    "detail.registeredCountry": "등록 국가",
    "detail.subdivision": "지역",
    "detail.city": "도시",
    "detail.postalCode": "우편번호",
    "detail.timezone": "시간대",
    "detail.coordinates": "좌표",
    "detail.status": "상태",
    "detail.waiting": "조회 결과 대기 중",
    "detail.accuracyRadius": "정확도 반경",
    "detail.latitude": "위도",
    "detail.longitude": "경도",
    "detail.metroCode": "Metro code",
    "geoip.source": "데이터 소스",
    "geoip.operatorUse": "운영 용도",
    "geoip.operatorUseValue": "정책 힌트, allowlist 검토, 인시던트 맥락",
    "message.lookupFailed": "조회에 실패했습니다. 다시 시도하거나 API 응답을 확인하세요.",
    "message.invalidIpv4": "유효한 IPv4 주소가 필요합니다.",
    "message.unknown": "알 수 없음",
    "license.prefix": "이 제품에는 MaxMind가 만든 GeoLite2 데이터가 포함되어 있으며, 제공처:",
    "license.suffix": ".",
    "command.current.response": "현재 IP 주소 ({ip}\\n)",
    "command.current.fallback": "현재 IP 주소",
    "command.current.note": "끝에 개행이 포함된 plain 응답.",
    "command.ipOnly.response": "IP 주소만",
    "command.ipOnly.note": "shell 스크립트를 위한 최소 출력.",
    "command.json.response": "IP, ASN, GeoIP 필드를 포함한 JSON",
    "command.json.note": "자동화를 위한 구조화 데이터.",
    "button.copy": "복사",
    "button.copied": "복사됨",
    "ipcalc.description":
      "데이터를 서버로 보내지 않고 CIDR, 네트워크 주소, 서브넷 마스크, 브로드캐스트 주소, 사용 가능한 호스트 범위를 계산합니다.",
    "ipcalc.label": "CIDR 포함 IPv4 주소",
    "ipcalc.placeholder": "예: 192.168.0.1/24",
    "ipcalc.calculate": "계산",
    "ipcalc.error": "192.168.0.1/24 같은 CIDR 포함 IPv4 주소를 입력하세요.",
    "cidr.base": "네트워크 주소",
    "cidr.mask": "서브넷 마스크",
    "cidr.bitmask": "CIDR 비트",
    "cidr.hostmask": "호스트 마스크",
    "cidr.broadcast": "브로드캐스트 주소",
    "cidr.size": "주소 수",
    "cidr.first": "첫 번째 사용 가능 주소",
    "cidr.last": "마지막 사용 가능 주소",
    "country.description": "nftables, legacy ipset/iptables 규칙, 운영 runbook을 위한 국가별 IPv4 CIDR 목록을 매일 생성합니다.",
    "country.download": "all-ipv4cidr.tsv.gz 다운로드",
    "country.formatTitle": "정책에 바로 쓰기 좋은 목록 형식",
    "country.formatText": "release artifact는 공개 RIR 데이터에서 수집되며 국가 코드와 CIDR 항목을 탭으로 구분해 게시합니다.",
    "country.firewallTabs": "방화벽 예시",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Debian 13에 nftables 설치",
    "country.createJapanNftSet": "일본 전용 nftables set 생성 및 로드",
    "country.allowNftUdp": "nftables set에서 UDP 게임 포트 허용",
    "country.installIpset": "legacy ipset/iptables 설치",
    "country.createJapanSet": "일본 전용 ipset 생성 및 로드",
    "country.allowUdp": "ipset에서 UDP 게임 포트 허용",
    "playground.description": "일반적인 텍스트 처리 패턴을 위한 가벼운 브라우저 scratchpad입니다. full shell은 실행하지 않습니다.",
    "playground.tabs": "명령 모드",
    "playground.pattern": "패턴 또는 식",
    "playground.stdin": "표준 입력",
    "playground.output": "출력",
    "playground.sed": "sed 치환",
    "playground.awk": "awk 열",
    "playground.jq": "jq 포맷",
    "playground.invalidJson": "잘못된 JSON: {message}",
  },
  es: {
    "meta.home.title": "inet-ip.info | Consulta IPv4 para administradores de servidores",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 por país | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "Consulta IPv4 rápida, ASN, GeoIP y respuestas listas para curl para administradores de servidores de internet.",
    "language.label": "Idioma",
    "brand.subtitle": "public IP tools",
    "nav.home": "Consulta IP",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 por país",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "Tu IP",
    "footer.summary": "Consulta IPv4 rápida y respuestas listas para curl para administradores de servidores.",
    "home.lead": "Sepa qué ve internet.",
    "home.text": "Consulta IPv4 rápida, ASN, GeoIP y respuestas listas para curl para administradores de servidores.",
    "home.lookupLabel": "Consulta IPv4",
    "home.lookupPlaceholder": "Dirección IPv4",
    "home.lookupButton": "Inspeccionar IP",
    "home.currentIpButton": "Usar IP actual",
    "home.viewCli": "Ver CLI",
    "home.panelAria": "Información de dirección IP",
    "home.resolvedTarget": "Destino resuelto",
    "home.resolving": "Resolviendo...",
    "home.ipAddress": "Dirección IP",
    "home.lookupCoverage": "Cobertura de consulta",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "Coordenadas",
    "home.signalCli": "CLI",
    "home.signalReady": "Listo",
    "home.signalCountry": "Consulta de país",
    "home.signalLocation": "Detalle de ubicación",
    "home.signalCurl": "listo para curl",
    "home.readableTitle": "Contexto GeoIP para decisiones de política",
    "home.readableText":
      "Use los datos de ubicación como una pista operativa para firewall, revisión de tráfico e incidentes; no son posicionamiento exacto del host.",
    "home.cliTitle": "Endpoints listos para curl",
    "home.cliText": "Use el mismo servicio desde scripts de shell, aprovisionamiento, monitoreo o notas de incidentes.",
    "home.moreToolsTitle": "Más herramientas para operadores",
    "home.moreToolsText": "Pase de descubrir a calcular, listas IPv4 por país y experimentos CLI seguros en el navegador.",
    "home.toolIpcalcText": "Cálculo de CIDR, máscara de subred y broadcast.",
    "home.toolCountryText": "Listas CIDR por país para políticas de red.",
    "home.toolPlaygroundText": "Pruebe patrones de comandos de forma segura en el navegador.",
    "detail.organization": "Organización",
    "detail.continent": "Continente",
    "detail.country": "País",
    "detail.representedCountry": "País representado",
    "detail.registeredCountry": "País registrado",
    "detail.subdivision": "Subdivisión",
    "detail.city": "Ciudad",
    "detail.postalCode": "Código postal",
    "detail.timezone": "Zona horaria",
    "detail.coordinates": "Coordenadas",
    "detail.status": "Estado",
    "detail.waiting": "Esperando resultado de consulta",
    "detail.accuracyRadius": "Radio de precisión",
    "detail.latitude": "Latitud",
    "detail.longitude": "Longitud",
    "detail.metroCode": "Código metro",
    "geoip.source": "Fuente de datos",
    "geoip.operatorUse": "Uso operativo",
    "geoip.operatorUseValue": "Pista de política, revisión de allowlist, contexto de incidente",
    "message.lookupFailed": "La consulta falló. Reintente o revise la respuesta de la API.",
    "message.invalidIpv4": "Se requiere una dirección IPv4 válida.",
    "message.unknown": "Desconocido",
    "license.prefix": "Este producto incluye datos GeoLite2 creados por MaxMind, disponibles en",
    "license.suffix": ".",
    "command.current.response": "Dirección IP actual ({ip}\\n)",
    "command.current.fallback": "Dirección IP actual",
    "command.current.note": "Respuesta simple con salto de línea final.",
    "command.ipOnly.response": "Solo dirección IP",
    "command.ipOnly.note": "Salida mínima para scripts de shell.",
    "command.json.response": "JSON con campos IP, ASN y GeoIP",
    "command.json.note": "Datos estructurados para automatización.",
    "button.copy": "Copiar",
    "button.copied": "Copiado",
    "ipcalc.description": "Calcule CIDR, dirección de red, máscara de subred, broadcast y rango usable sin enviar datos al servidor.",
    "ipcalc.label": "Dirección IPv4 con CIDR",
    "ipcalc.placeholder": "Por ejemplo: 192.168.0.1/24",
    "ipcalc.calculate": "Calcular",
    "ipcalc.error": "Ingrese una dirección IPv4 con CIDR, por ejemplo 192.168.0.1/24.",
    "cidr.base": "Dirección de red",
    "cidr.mask": "Máscara de subred",
    "cidr.bitmask": "Bits CIDR",
    "cidr.hostmask": "Máscara de host",
    "cidr.broadcast": "Dirección broadcast",
    "cidr.size": "Cantidad de direcciones",
    "cidr.first": "Primera dirección usable",
    "cidr.last": "Última dirección usable",
    "country.description":
      "Listas CIDR IPv4 por país generadas a diario para nftables, reglas legacy ipset/iptables y runbooks de operación.",
    "country.download": "Descargar all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Formato listo para políticas",
    "country.formatText":
      "El release artifact se recopila desde datos RIR públicos y se publica como código de país y entradas CIDR separados por tabuladores.",
    "country.firewallTabs": "Ejemplos de firewall",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Instalar nftables en Debian 13",
    "country.createJapanNftSet": "Crear y cargar un set nftables solo de Japón",
    "country.allowNftUdp": "Permitir puertos UDP de juego desde el set nftables",
    "country.installIpset": "Instalar legacy ipset/iptables",
    "country.createJapanSet": "Crear y cargar un ipset solo de Japón",
    "country.allowUdp": "Permitir puertos UDP de juego desde el ipset",
    "playground.description":
      "Un scratchpad ligero en el navegador para patrones comunes de procesamiento de texto. Es intencionalmente pequeño y no ejecuta un shell completo.",
    "playground.tabs": "Modos de comando",
    "playground.pattern": "Patrón o expresión",
    "playground.stdin": "Stdin",
    "playground.output": "Salida",
    "playground.sed": "sed reemplazar",
    "playground.awk": "awk columnas",
    "playground.jq": "jq formato",
    "playground.invalidJson": "JSON inválido: {message}",
  },
  fr: {
    "meta.home.title": "inet-ip.info | Recherche IPv4 pour administrateurs serveur",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 par pays | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "Recherche IPv4 rapide, ASN, GeoIP et réponses prêtes pour curl pour les administrateurs de serveurs internet.",
    "language.label": "Langue",
    "brand.subtitle": "public IP tools",
    "nav.home": "Recherche IP",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 par pays",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "Votre IP",
    "footer.summary": "Recherche IPv4 rapide et réponses prêtes pour curl pour les administrateurs serveur.",
    "home.lead": "Sachez ce qu'internet voit.",
    "home.text": "Recherche IPv4 rapide, ASN, GeoIP et réponses prêtes pour curl pour les administrateurs serveur.",
    "home.lookupLabel": "Recherche IPv4",
    "home.lookupPlaceholder": "Adresse IPv4",
    "home.lookupButton": "Inspecter l'IP",
    "home.currentIpButton": "Utiliser l'IP actuelle",
    "home.viewCli": "Voir CLI",
    "home.panelAria": "Informations d'adresse IP",
    "home.resolvedTarget": "Cible résolue",
    "home.resolving": "Résolution...",
    "home.ipAddress": "Adresse IP",
    "home.lookupCoverage": "Couverture de recherche",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "Coordonnées",
    "home.signalCli": "CLI",
    "home.signalReady": "Prêt",
    "home.signalCountry": "Recherche pays",
    "home.signalLocation": "Détail de localisation",
    "home.signalCurl": "prêt pour curl",
    "home.readableTitle": "Contexte GeoIP pour les décisions de politique",
    "home.readableText":
      "Utilisez la localisation comme indice opérationnel pour firewall, revue de trafic et notes d'incident; ce n'est pas une position précise de l'hôte.",
    "home.cliTitle": "Endpoints prêts pour curl",
    "home.cliText":
      "Utilisez le même service depuis des scripts shell, tâches de provisionnement, contrôles de supervision ou notes d'incident.",
    "home.moreToolsTitle": "Plus d'outils opérateur",
    "home.moreToolsText": "Passez de la découverte au calcul, aux listes IPv4 par pays et aux essais CLI sûrs dans le navigateur.",
    "home.toolIpcalcText": "Calcul CIDR, masque de sous-réseau et broadcast.",
    "home.toolCountryText": "Listes CIDR par pays pour les politiques réseau.",
    "home.toolPlaygroundText": "Essayez des modèles de commande en sécurité dans le navigateur.",
    "detail.organization": "Organisation",
    "detail.continent": "Continent",
    "detail.country": "Pays",
    "detail.representedCountry": "Pays représenté",
    "detail.registeredCountry": "Pays enregistré",
    "detail.subdivision": "Subdivision",
    "detail.city": "Ville",
    "detail.postalCode": "Code postal",
    "detail.timezone": "Fuseau horaire",
    "detail.coordinates": "Coordonnées",
    "detail.status": "Statut",
    "detail.waiting": "En attente du résultat",
    "detail.accuracyRadius": "Rayon de précision",
    "detail.latitude": "Latitude",
    "detail.longitude": "Longitude",
    "detail.metroCode": "Code métro",
    "geoip.source": "Source des données",
    "geoip.operatorUse": "Usage opérationnel",
    "geoip.operatorUseValue": "Indice de politique, revue allowlist, contexte d'incident",
    "message.lookupFailed": "La recherche a échoué. Réessayez ou vérifiez la réponse de l'API.",
    "message.invalidIpv4": "Une adresse IPv4 valide est requise.",
    "message.unknown": "Inconnu",
    "license.prefix": "Ce produit inclut des données GeoLite2 créées par MaxMind, disponibles sur",
    "license.suffix": ".",
    "command.current.response": "Adresse IP actuelle ({ip}\\n)",
    "command.current.fallback": "Adresse IP actuelle",
    "command.current.note": "Réponse texte avec retour à la ligne final.",
    "command.ipOnly.response": "Adresse IP seule",
    "command.ipOnly.note": "Sortie minimale pour scripts shell.",
    "command.json.response": "JSON avec champs IP, ASN et GeoIP",
    "command.json.note": "Données structurées pour l'automatisation.",
    "button.copy": "Copier",
    "button.copied": "Copié",
    "ipcalc.description":
      "Calculez CIDR, adresse réseau, masque de sous-réseau, broadcast et plage utilisable sans envoyer de données au serveur.",
    "ipcalc.label": "Adresse IPv4 avec CIDR",
    "ipcalc.placeholder": "Par exemple: 192.168.0.1/24",
    "ipcalc.calculate": "Calculer",
    "ipcalc.error": "Saisissez une adresse IPv4 avec CIDR, par exemple 192.168.0.1/24.",
    "cidr.base": "Adresse réseau",
    "cidr.mask": "Masque de sous-réseau",
    "cidr.bitmask": "Bits CIDR",
    "cidr.hostmask": "Masque hôte",
    "cidr.broadcast": "Adresse broadcast",
    "cidr.size": "Nombre d'adresses",
    "cidr.first": "Première adresse utilisable",
    "cidr.last": "Dernière adresse utilisable",
    "country.description":
      "Listes CIDR IPv4 par pays générées chaque jour pour nftables, règles legacy ipset/iptables et runbooks d'exploitation.",
    "country.download": "Télécharger all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Format prêt pour les politiques",
    "country.formatText":
      "Le release artifact est collecté depuis les données RIR publiques et publié en code pays plus entrées CIDR séparées par tabulations.",
    "country.firewallTabs": "Exemples firewall",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Installer nftables sur Debian 13",
    "country.createJapanNftSet": "Créer et charger un set nftables Japon uniquement",
    "country.allowNftUdp": "Autoriser les ports UDP de jeu depuis le set nftables",
    "country.installIpset": "Installer legacy ipset/iptables",
    "country.createJapanSet": "Créer et charger un ipset Japon uniquement",
    "country.allowUdp": "Autoriser les ports UDP de jeu depuis l'ipset",
    "playground.description":
      "Un scratchpad navigateur léger pour les traitements texte courants. Il reste volontairement petit et n'exécute pas un shell complet.",
    "playground.tabs": "Modes de commande",
    "playground.pattern": "Motif ou expression",
    "playground.stdin": "Stdin",
    "playground.output": "Sortie",
    "playground.sed": "sed remplacer",
    "playground.awk": "awk colonnes",
    "playground.jq": "jq format",
    "playground.invalidJson": "JSON invalide: {message}",
  },
  de: {
    "meta.home.title": "inet-ip.info | IPv4 Lookup für Serveradministratoren",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 nach Land | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "Schneller IPv4 Lookup, ASN, GeoIP und curl-freundliche Antworten für Internet-Serveradministratoren.",
    "language.label": "Sprache",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP Lookup",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 nach Land",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "Ihre IP",
    "footer.summary": "Schneller IPv4 Lookup und curl-freundliche Antworten für Serveradministratoren.",
    "home.lead": "Sehen, was das Internet sieht.",
    "home.text": "Schneller IPv4 Lookup, ASN, GeoIP und curl-freundliche Antworten für Serveradministratoren.",
    "home.lookupLabel": "IPv4 Lookup",
    "home.lookupPlaceholder": "IPv4 Adresse",
    "home.lookupButton": "IP prüfen",
    "home.currentIpButton": "Aktuelle IP nutzen",
    "home.viewCli": "CLI ansehen",
    "home.panelAria": "IP-Adressinformationen",
    "home.resolvedTarget": "Aufgelöstes Ziel",
    "home.resolving": "Wird aufgelöst...",
    "home.ipAddress": "IP-Adresse",
    "home.lookupCoverage": "Lookup-Abdeckung",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "Koordinaten",
    "home.signalCli": "CLI",
    "home.signalReady": "Bereit",
    "home.signalCountry": "Länder-Lookup",
    "home.signalLocation": "Standortdetails",
    "home.signalCurl": "curl-freundlich",
    "home.readableTitle": "GeoIP-Kontext für Policy-Entscheidungen",
    "home.readableText":
      "Nutzen Sie Standortdaten als operativen Hinweis für Firewall-Policy, Traffic-Prüfung und Incident-Notizen, nicht als exakte Host-Position.",
    "home.cliTitle": "curl-freundliche Endpunkte",
    "home.cliText": "Nutzen Sie denselben Dienst aus Shell-Skripten, Provisioning-Jobs, Monitoring-Checks oder Incident-Notizen.",
    "home.moreToolsTitle": "Mehr Operator-Tools",
    "home.moreToolsText": "Von Erkennung zu Berechnung, länderbasierten IPv4-Listen und sicheren CLI-Experimenten im Browser.",
    "home.toolIpcalcText": "CIDR, Subnetzmaske und Broadcast berechnen.",
    "home.toolCountryText": "Länderbasierte CIDR-Listen für Netzwerkregeln.",
    "home.toolPlaygroundText": "Befehlsmuster sicher im Browser testen.",
    "detail.organization": "Organisation",
    "detail.continent": "Kontinent",
    "detail.country": "Land",
    "detail.representedCountry": "Vertretenes Land",
    "detail.registeredCountry": "Registriertes Land",
    "detail.subdivision": "Region",
    "detail.city": "Stadt",
    "detail.postalCode": "Postleitzahl",
    "detail.timezone": "Zeitzone",
    "detail.coordinates": "Koordinaten",
    "detail.status": "Status",
    "detail.waiting": "Warten auf Lookup-Ergebnis",
    "detail.accuracyRadius": "Genauigkeitsradius",
    "detail.latitude": "Breitengrad",
    "detail.longitude": "Längengrad",
    "detail.metroCode": "Metro-Code",
    "geoip.source": "Datenquelle",
    "geoip.operatorUse": "Operative Nutzung",
    "geoip.operatorUseValue": "Policy-Hinweis, Allowlist-Prüfung, Incident-Kontext",
    "message.lookupFailed": "Lookup fehlgeschlagen. Bitte erneut versuchen oder API-Antwort prüfen.",
    "message.invalidIpv4": "Eine gültige IPv4-Adresse ist erforderlich.",
    "message.unknown": "Unbekannt",
    "license.prefix": "Dieses Produkt enthält GeoLite2-Daten von MaxMind, verfügbar unter",
    "license.suffix": ".",
    "command.current.response": "Aktuelle IP-Adresse ({ip}\\n)",
    "command.current.fallback": "Aktuelle IP-Adresse",
    "command.current.note": "Einfache Antwort mit abschließendem Zeilenumbruch.",
    "command.ipOnly.response": "Nur IP-Adresse",
    "command.ipOnly.note": "Minimale Ausgabe für Shell-Skripte.",
    "command.json.response": "JSON mit IP-, ASN- und GeoIP-Feldern",
    "command.json.note": "Strukturierte Daten für Automatisierung.",
    "button.copy": "Kopieren",
    "button.copied": "Kopiert",
    "ipcalc.description":
      "Berechnen Sie CIDR, Netzwerkadresse, Subnetzmaske, Broadcast-Adresse und nutzbaren Hostbereich, ohne Daten an den Server zu senden.",
    "ipcalc.label": "IPv4-Adresse mit CIDR",
    "ipcalc.placeholder": "Zum Beispiel: 192.168.0.1/24",
    "ipcalc.calculate": "Berechnen",
    "ipcalc.error": "Geben Sie eine IPv4-Adresse mit CIDR ein, zum Beispiel 192.168.0.1/24.",
    "cidr.base": "Netzwerkadresse",
    "cidr.mask": "Subnetzmaske",
    "cidr.bitmask": "CIDR-Bits",
    "cidr.hostmask": "Hostmaske",
    "cidr.broadcast": "Broadcast-Adresse",
    "cidr.size": "Adressanzahl",
    "cidr.first": "Erste nutzbare Adresse",
    "cidr.last": "Letzte nutzbare Adresse",
    "country.description":
      "Täglich generierte länderbasierte IPv4-CIDR-Listen für nftables, legacy ipset/iptables-Regeln und Betriebs-Runbooks.",
    "country.download": "all-ipv4cidr.tsv.gz herunterladen",
    "country.formatTitle": "Policy-fähiges Listenformat",
    "country.formatText":
      "Das release artifact wird aus öffentlichen RIR-Daten gesammelt und als tab-getrennte Ländercodes plus CIDR-Einträge veröffentlicht.",
    "country.firewallTabs": "Firewall-Beispiele",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "nftables auf Debian 13 installieren",
    "country.createJapanNftSet": "Japan-only nftables-Set erstellen und laden",
    "country.allowNftUdp": "UDP-Spielports aus dem nftables-Set erlauben",
    "country.installIpset": "legacy ipset/iptables installieren",
    "country.createJapanSet": "Japan-only ipset erstellen und laden",
    "country.allowUdp": "UDP-Spielports aus dem ipset erlauben",
    "playground.description":
      "Ein leichtes Browser-Scratchpad für häufige Textverarbeitungsmuster. Es ist bewusst klein und führt keine vollständige Shell aus.",
    "playground.tabs": "Befehlsmodi",
    "playground.pattern": "Muster oder Ausdruck",
    "playground.stdin": "Stdin",
    "playground.output": "Ausgabe",
    "playground.sed": "sed ersetzen",
    "playground.awk": "awk Spalten",
    "playground.jq": "jq formatieren",
    "playground.invalidJson": "Ungültiges JSON: {message}",
  },
  "pt-BR": {
    "meta.home.title": "inet-ip.info | Consulta IPv4 para administradores de servidores",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 por país | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "Consulta IPv4 rápida, ASN, GeoIP e respostas prontas para curl para administradores de servidores de internet.",
    "language.label": "Idioma",
    "brand.subtitle": "public IP tools",
    "nav.home": "Consulta IP",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 por país",
    "nav.playground": "CLI Playground",
    "nav.currentIp": "Seu IP",
    "footer.summary": "Consulta IPv4 rápida e respostas prontas para curl para administradores de servidores.",
    "home.lead": "Saiba o que a internet vê.",
    "home.text": "Consulta IPv4 rápida, ASN, GeoIP e respostas prontas para curl para administradores de servidores.",
    "home.lookupLabel": "Consulta IPv4",
    "home.lookupPlaceholder": "Endereço IPv4",
    "home.lookupButton": "Inspecionar IP",
    "home.currentIpButton": "Usar IP atual",
    "home.viewCli": "Ver CLI",
    "home.panelAria": "Informações do endereço IP",
    "home.resolvedTarget": "Alvo resolvido",
    "home.resolving": "Resolvendo...",
    "home.ipAddress": "Endereço IP",
    "home.lookupCoverage": "Cobertura da consulta",
    "home.signalAsn": "ASN",
    "home.signalGeoip": "GeoIP",
    "home.signalCoordinates": "Coordenadas",
    "home.signalCli": "CLI",
    "home.signalReady": "Pronto",
    "home.signalCountry": "Consulta de país",
    "home.signalLocation": "Detalhe de localização",
    "home.signalCurl": "pronto para curl",
    "home.readableTitle": "Contexto GeoIP para decisões de política",
    "home.readableText":
      "Use dados de localização como pista operacional para firewall, revisão de tráfego e incidentes; não como posição exata do host.",
    "home.cliTitle": "Endpoints prontos para curl",
    "home.cliText": "Use o mesmo serviço em scripts shell, provisionamento, checks de monitoramento ou notas de incidente.",
    "home.moreToolsTitle": "Mais ferramentas para operadores",
    "home.moreToolsText": "Vá da descoberta ao cálculo, listas IPv4 por país e experimentos CLI seguros no navegador.",
    "home.toolIpcalcText": "Cálculo de CIDR, máscara de sub-rede e broadcast.",
    "home.toolCountryText": "Listas CIDR por país para políticas de rede.",
    "home.toolPlaygroundText": "Teste padrões de comando com segurança no navegador.",
    "detail.organization": "Organização",
    "detail.continent": "Continente",
    "detail.country": "País",
    "detail.representedCountry": "País representado",
    "detail.registeredCountry": "País registrado",
    "detail.subdivision": "Subdivisão",
    "detail.city": "Cidade",
    "detail.postalCode": "CEP",
    "detail.timezone": "Fuso horário",
    "detail.coordinates": "Coordenadas",
    "detail.status": "Status",
    "detail.waiting": "Aguardando resultado da consulta",
    "detail.accuracyRadius": "Raio de precisão",
    "detail.latitude": "Latitude",
    "detail.longitude": "Longitude",
    "detail.metroCode": "Código metro",
    "geoip.source": "Fonte de dados",
    "geoip.operatorUse": "Uso operacional",
    "geoip.operatorUseValue": "Pista de política, revisão de allowlist, contexto de incidente",
    "message.lookupFailed": "A consulta falhou. Tente novamente ou verifique a resposta da API.",
    "message.invalidIpv4": "É necessário um endereço IPv4 válido.",
    "message.unknown": "Desconhecido",
    "license.prefix": "Este produto inclui dados GeoLite2 criados pela MaxMind, disponíveis em",
    "license.suffix": ".",
    "command.current.response": "Endereço IP atual ({ip}\\n)",
    "command.current.fallback": "Endereço IP atual",
    "command.current.note": "Resposta simples com quebra de linha final.",
    "command.ipOnly.response": "Somente endereço IP",
    "command.ipOnly.note": "Saída mínima para scripts shell.",
    "command.json.response": "JSON com campos IP, ASN e GeoIP",
    "command.json.note": "Dados estruturados para automação.",
    "button.copy": "Copiar",
    "button.copied": "Copiado",
    "ipcalc.description":
      "Calcule CIDR, endereço de rede, máscara de sub-rede, broadcast e intervalo utilizável sem enviar dados ao servidor.",
    "ipcalc.label": "Endereço IPv4 com CIDR",
    "ipcalc.placeholder": "Por exemplo: 192.168.0.1/24",
    "ipcalc.calculate": "Calcular",
    "ipcalc.error": "Digite um endereço IPv4 com CIDR, por exemplo 192.168.0.1/24.",
    "cidr.base": "Endereço de rede",
    "cidr.mask": "Máscara de sub-rede",
    "cidr.bitmask": "Bits CIDR",
    "cidr.hostmask": "Máscara de host",
    "cidr.broadcast": "Endereço broadcast",
    "cidr.size": "Quantidade de endereços",
    "cidr.first": "Primeiro endereço utilizável",
    "cidr.last": "Último endereço utilizável",
    "country.description":
      "Listas CIDR IPv4 por país geradas diariamente para nftables, regras legacy ipset/iptables e runbooks de operação.",
    "country.download": "Baixar all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Formato pronto para políticas",
    "country.formatText":
      "O release artifact é coletado de dados RIR públicos e publicado como código de país e entradas CIDR separados por tabulação.",
    "country.firewallTabs": "Exemplos de firewall",
    "country.nftablesTab": "nftables",
    "country.legacyTab": "Legacy iptables/ipset",
    "country.installNftables": "Instalar nftables no Debian 13",
    "country.createJapanNftSet": "Criar e carregar um set nftables somente do Japão",
    "country.allowNftUdp": "Permitir portas UDP de jogo a partir do set nftables",
    "country.installIpset": "Instalar legacy ipset/iptables",
    "country.createJapanSet": "Criar e carregar um ipset somente do Japão",
    "country.allowUdp": "Permitir portas UDP de jogo a partir do ipset",
    "playground.description":
      "Um scratchpad leve no navegador para padrões comuns de processamento de texto. Ele é intencionalmente pequeno e não executa um shell completo.",
    "playground.tabs": "Modos de comando",
    "playground.pattern": "Padrão ou expressão",
    "playground.stdin": "Stdin",
    "playground.output": "Saída",
    "playground.sed": "sed substituir",
    "playground.awk": "awk colunas",
    "playground.jq": "jq formatar",
    "playground.invalidJson": "JSON inválido: {message}",
  },
} as const satisfies Record<Locale, Record<string, string>>;

let locale: Locale = resolveInitialLocale();

const SAMPLE_INFO: IpInfo = {
  ipAddress: "203.0.113.42",
  asn: {
    AutonomousSystemNumber: 64500,
    AutonomousSystemOrganization: "Example Network Operations",
  },
  city: {
    City: {
      Names: {
        en: "Tokyo",
        ja: "東京",
        "zh-CN": "东京",
        ko: "도쿄",
        es: "Tokio",
        fr: "Tokyo",
        de: "Tokio",
        "pt-BR": "Tóquio",
      },
    },
    Continent: {
      Code: "AS",
      Names: {
        en: "Asia",
        ja: "アジア",
        "zh-CN": "亚洲",
        ko: "아시아",
        es: "Asia",
        fr: "Asie",
        de: "Asien",
        "pt-BR": "Ásia",
      },
    },
    Country: {
      IsInEuropeanUnion: false,
      IsoCode: "JP",
      Names: {
        en: "Japan",
        ja: "日本",
        "zh-CN": "日本",
        ko: "일본",
        es: "Japón",
        fr: "Japon",
        de: "Japan",
        "pt-BR": "Japão",
      },
    },
    RegisteredCountry: {
      IsInEuropeanUnion: false,
      IsoCode: "JP",
      Names: {
        en: "Japan",
        ja: "日本",
        "zh-CN": "日本",
        ko: "일본",
        es: "Japón",
        fr: "Japon",
        de: "Japan",
        "pt-BR": "Japão",
      },
    },
    RepresentedCountry: null,
    Subdivisions: [
      {
        IsoCode: "13",
        Names: {
          en: "Tokyo",
          ja: "東京都",
          "zh-CN": "东京都",
          ko: "도쿄도",
          es: "Tokio",
          fr: "Tokyo",
          de: "Tokio",
          "pt-BR": "Tóquio",
        },
      },
    ],
    Postal: { Code: "100-0001" },
    Location: {
      AccuracyRadius: 20,
      Latitude: 35.6812,
      Longitude: 139.7671,
      MetroCode: 0,
      TimeZone: "Asia/Tokyo",
    },
    Traits: { IsAnonymousProxy: false, IsSatelliteProvider: false },
  },
  license:
    'This product includes GeoLite2 data created by MaxMind, available from <a href="https://www.maxmind.com">https://www.maxmind.com</a>.',
};

const SAMPLE_ACCESS_24H_PERIOD: AccessPeriod = {
  id: "24h",
  label: "24h",
  description: "Last 24 hours, refreshed by the latest periodic aggregate.",
  windowHours: 24,
  source: "sample-nginx-access",
  summary: {
    totalRequests: 18472,
    uniqueVisitors: 2638,
    peakHourRequests: 1420,
    successRate: 98.7,
  },
  topCountries: [
    { code: "JP", name: "Japan", requests: 8240, share: 44.6 },
    { code: "US", name: "United States", requests: 3910, share: 21.2 },
    { code: "DE", name: "Germany", requests: 1448, share: 7.8 },
    { code: "SG", name: "Singapore", requests: 1124, share: 6.1 },
    { code: "KR", name: "South Korea", requests: 886, share: 4.8 },
  ],
  topLocations: [
    { label: "Tokyo, JP", countryCode: "JP", latitude: 35.6895, longitude: 139.6917, requests: 4620 },
    { label: "Osaka, JP", countryCode: "JP", latitude: 34.6937, longitude: 135.5023, requests: 1240 },
    { label: "Ashburn, US", countryCode: "US", latitude: 39.0437, longitude: -77.4875, requests: 2180 },
    { label: "Frankfurt, DE", countryCode: "DE", latitude: 50.1109, longitude: 8.6821, requests: 1260 },
    { label: "Singapore, SG", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, requests: 980 },
  ],
  topAsns: [
    { label: "AS4713 NTT DOCOMO BUSINESS", requests: 3210, share: 17.4 },
    { label: "AS15169 Google", requests: 2420, share: 13.1 },
    { label: "AS8075 Microsoft", requests: 1284, share: 7.0 },
    { label: "AS16509 Amazon", requests: 1166, share: 6.3 },
  ],
  topEndpoints: [
    { label: "/", requests: 5890, share: 31.9 },
    { label: "/json", requests: 4384, share: 23.7 },
    { label: "/ip", requests: 2910, share: 15.8 },
    { label: "/IPv4byCountry", requests: 1268, share: 6.9 },
    { label: "/access-insights", requests: 830, share: 4.5 },
  ],
  statusCodes: [
    { code: "200", requests: 17624 },
    { code: "304", requests: 520 },
    { code: "404", requests: 216 },
    { code: "400", requests: 112 },
  ],
  userAgents: [
    { label: "Browser", requests: 9210, share: 49.9 },
    { label: "curl/wget", requests: 4620, share: 25.0 },
    { label: "Search crawler", requests: 3160, share: 17.1 },
    { label: "Monitoring", requests: 1482, share: 8.0 },
  ],
  hourlyRequests: [
    { hour: "2026-06-20T04:00:00+09:00", requests: 480 },
    { hour: "2026-06-20T05:00:00+09:00", requests: 520 },
    { hour: "2026-06-20T06:00:00+09:00", requests: 610 },
    { hour: "2026-06-20T07:00:00+09:00", requests: 720 },
    { hour: "2026-06-20T08:00:00+09:00", requests: 880 },
    { hour: "2026-06-20T09:00:00+09:00", requests: 1040 },
    { hour: "2026-06-20T10:00:00+09:00", requests: 1168 },
    { hour: "2026-06-20T11:00:00+09:00", requests: 1420 },
    { hour: "2026-06-20T12:00:00+09:00", requests: 1240 },
    { hour: "2026-06-20T13:00:00+09:00", requests: 1180 },
    { hour: "2026-06-20T14:00:00+09:00", requests: 980 },
    { hour: "2026-06-20T15:00:00+09:00", requests: 860 },
  ],
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Country and ASN coverage depends on the GeoIP endpoint configured for periodic updates.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
};

const SAMPLE_ACCESS_7D_PERIOD: AccessPeriod = {
  id: "7d",
  label: "7d",
  description: "Last 7 days, useful for weekday patterns and crawler spikes.",
  windowHours: 168,
  source: "sample-nginx-access",
  summary: {
    totalRequests: 126840,
    uniqueVisitors: 14920,
    peakHourRequests: 8620,
    successRate: 98.5,
  },
  topCountries: [
    { code: "JP", name: "Japan", requests: 54820, share: 43.2 },
    { code: "US", name: "United States", requests: 28490, share: 22.5 },
    { code: "DE", name: "Germany", requests: 9380, share: 7.4 },
    { code: "SG", name: "Singapore", requests: 7920, share: 6.2 },
    { code: "KR", name: "South Korea", requests: 6010, share: 4.7 },
  ],
  topLocations: [
    { label: "Tokyo, JP", countryCode: "JP", latitude: 35.6895, longitude: 139.6917, requests: 31540 },
    { label: "Ashburn, US", countryCode: "US", latitude: 39.0437, longitude: -77.4875, requests: 16020 },
    { label: "Osaka, JP", countryCode: "JP", latitude: 34.6937, longitude: 135.5023, requests: 8640 },
    { label: "Frankfurt, DE", countryCode: "DE", latitude: 50.1109, longitude: 8.6821, requests: 7810 },
    { label: "Singapore, SG", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, requests: 6990 },
  ],
  topAsns: [
    { label: "AS4713 NTT DOCOMO BUSINESS", requests: 21440, share: 16.9 },
    { label: "AS15169 Google", requests: 18020, share: 14.2 },
    { label: "AS8075 Microsoft", requests: 9420, share: 7.4 },
    { label: "AS16509 Amazon", requests: 8210, share: 6.5 },
  ],
  topEndpoints: [
    { label: "/", requests: 40220, share: 31.7 },
    { label: "/json", requests: 30440, share: 24.0 },
    { label: "/ip", requests: 19880, share: 15.7 },
    { label: "/IPv4byCountry", requests: 9210, share: 7.3 },
    { label: "/access-insights", requests: 5120, share: 4.0 },
  ],
  statusCodes: [
    { code: "200", requests: 120460 },
    { code: "304", requests: 3920 },
    { code: "404", requests: 1690 },
    { code: "400", requests: 770 },
  ],
  userAgents: [
    { label: "Browser", requests: 62840, share: 49.5 },
    { label: "curl/wget", requests: 31420, share: 24.8 },
    { label: "Search crawler", requests: 22140, share: 17.5 },
    { label: "Monitoring", requests: 10440, share: 8.2 },
  ],
  hourlyRequests: [
    { hour: "2026-06-15T00:00:00+09:00", requests: 16840 },
    { hour: "2026-06-16T00:00:00+09:00", requests: 17920 },
    { hour: "2026-06-17T00:00:00+09:00", requests: 18580 },
    { hour: "2026-06-18T00:00:00+09:00", requests: 17740 },
    { hour: "2026-06-19T00:00:00+09:00", requests: 18220 },
    { hour: "2026-06-20T00:00:00+09:00", requests: 19068 },
    { hour: "2026-06-21T00:00:00+09:00", requests: 18472 },
  ],
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Seven-day data is generated from daily log windows, then published as aggregate rankings.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
};

const SAMPLE_ACCESS_14D_PERIOD: AccessPeriod = {
  id: "14d",
  label: "14d",
  description: "Last 14 days, matching the current nginx access-log retention window.",
  windowHours: 336,
  source: "sample-nginx-access",
  summary: {
    totalRequests: 262410,
    uniqueVisitors: 26780,
    peakHourRequests: 9360,
    successRate: 98.4,
  },
  topCountries: [
    { code: "JP", name: "Japan", requests: 111420, share: 42.5 },
    { code: "US", name: "United States", requests: 60480, share: 23.0 },
    { code: "DE", name: "Germany", requests: 19120, share: 7.3 },
    { code: "SG", name: "Singapore", requests: 16260, share: 6.2 },
    { code: "KR", name: "South Korea", requests: 12240, share: 4.7 },
  ],
  topLocations: [
    { label: "Tokyo, JP", countryCode: "JP", latitude: 35.6895, longitude: 139.6917, requests: 64280 },
    { label: "Ashburn, US", countryCode: "US", latitude: 39.0437, longitude: -77.4875, requests: 34480 },
    { label: "Osaka, JP", countryCode: "JP", latitude: 34.6937, longitude: 135.5023, requests: 18420 },
    { label: "Frankfurt, DE", countryCode: "DE", latitude: 50.1109, longitude: 8.6821, requests: 15920 },
    { label: "Singapore, SG", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, requests: 14110 },
  ],
  topAsns: [
    { label: "AS4713 NTT DOCOMO BUSINESS", requests: 43820, share: 16.7 },
    { label: "AS15169 Google", requests: 39160, share: 14.9 },
    { label: "AS8075 Microsoft", requests: 19140, share: 7.3 },
    { label: "AS16509 Amazon", requests: 17220, share: 6.6 },
  ],
  topEndpoints: [
    { label: "/", requests: 83240, share: 31.7 },
    { label: "/json", requests: 62410, share: 23.8 },
    { label: "/ip", requests: 41780, share: 15.9 },
    { label: "/IPv4byCountry", requests: 18260, share: 7.0 },
    { label: "/access-insights", requests: 9980, share: 3.8 },
  ],
  statusCodes: [
    { code: "200", requests: 248940 },
    { code: "304", requests: 7960 },
    { code: "404", requests: 3740 },
    { code: "400", requests: 1770 },
  ],
  userAgents: [
    { label: "Browser", requests: 130920, share: 49.9 },
    { label: "curl/wget", requests: 64280, share: 24.5 },
    { label: "Search crawler", requests: 45520, share: 17.3 },
    { label: "Monitoring", requests: 21690, share: 8.3 },
  ],
  hourlyRequests: [
    { hour: "2026-06-08T00:00:00+09:00", requests: 17820 },
    { hour: "2026-06-09T00:00:00+09:00", requests: 18440 },
    { hour: "2026-06-10T00:00:00+09:00", requests: 19020 },
    { hour: "2026-06-11T00:00:00+09:00", requests: 20110 },
    { hour: "2026-06-12T00:00:00+09:00", requests: 17880 },
    { hour: "2026-06-13T00:00:00+09:00", requests: 17140 },
    { hour: "2026-06-14T00:00:00+09:00", requests: 18160 },
    { hour: "2026-06-15T00:00:00+09:00", requests: 16840 },
    { hour: "2026-06-16T00:00:00+09:00", requests: 17920 },
    { hour: "2026-06-17T00:00:00+09:00", requests: 18580 },
    { hour: "2026-06-18T00:00:00+09:00", requests: 17740 },
    { hour: "2026-06-19T00:00:00+09:00", requests: 18220 },
    { hour: "2026-06-20T00:00:00+09:00", requests: 19068 },
    { hour: "2026-06-21T00:00:00+09:00", requests: 18472 },
  ],
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Fourteen-day data follows the current nginx access-log retention window.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
};

function scaleSampleAccessPeriod(
  base: AccessPeriod,
  options: {
    id: string;
    label: string;
    windowHours: number;
    totalRequests: number;
    uniqueVisitors: number;
    peakHourRequests: number;
    successRate: number;
    trendStart: string;
    trendDays: number;
    notes: string[];
  },
): AccessPeriod {
  const factor = options.totalRequests / Math.max(1, base.summary.totalRequests);
  return {
    ...base,
    id: options.id,
    label: options.label,
    description: "",
    windowHours: options.windowHours,
    summary: {
      totalRequests: options.totalRequests,
      uniqueVisitors: options.uniqueVisitors,
      peakHourRequests: options.peakHourRequests,
      successRate: options.successRate,
    },
    topCountries: scaleSampleRequests(base.topCountries, factor),
    topLocations: scaleSampleRequests(base.topLocations, factor),
    topAsns: scaleSampleRequests(base.topAsns, factor),
    topEndpoints: scaleSampleRequests(base.topEndpoints, factor),
    statusCodes: scaleSampleRequests(base.statusCodes, factor),
    userAgents: scaleSampleRequests(base.userAgents, factor),
    hourlyRequests: createSampleDailyTrend(options.trendStart, options.trendDays, options.totalRequests),
    notes: options.notes,
  };
}

function scaleSampleRequests<T extends { requests: number }>(items: T[], factor: number): T[] {
  return items.map((item) => ({ ...item, requests: Math.max(1, Math.round(item.requests * factor)) }));
}

function createSampleDailyTrend(startDate: string, days: number, totalRequests: number): AccessHour[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const average = totalRequests / Math.max(1, days);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const weekly = index % 7 === 5 || index % 7 === 6 ? 0.92 : 1.04;
    const seasonal = 1 + Math.sin(index * 0.73) * 0.08 + Math.cos(index * 0.19) * 0.05;
    return {
      hour: `${formatSampleDate(date)}T00:00:00+09:00`,
      requests: Math.max(1, Math.round(average * weekly * seasonal)),
    };
  });
}

function formatSampleDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const SAMPLE_ACCESS_1M_PERIOD = scaleSampleAccessPeriod(SAMPLE_ACCESS_14D_PERIOD, {
  id: "1m",
  label: "1m",
  windowHours: 30 * 24,
  totalRequests: 558900,
  uniqueVisitors: 49800,
  peakHourRequests: 21420,
  successRate: 98.3,
  trendStart: "2026-05-23",
  trendDays: 30,
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Longer windows are intended to be generated from retained aggregate history once it is available.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
});

const SAMPLE_ACCESS_3M_PERIOD = scaleSampleAccessPeriod(SAMPLE_ACCESS_14D_PERIOD, {
  id: "3m",
  label: "3m",
  windowHours: 90 * 24,
  totalRequests: 1642300,
  uniqueVisitors: 146200,
  peakHourRequests: 23840,
  successRate: 98.2,
  trendStart: "2026-03-24",
  trendDays: 90,
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Three-month data is most useful after daily aggregate history has accumulated.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
});

const SAMPLE_ACCESS_6M_PERIOD = scaleSampleAccessPeriod(SAMPLE_ACCESS_14D_PERIOD, {
  id: "6m",
  label: "6m",
  windowHours: 180 * 24,
  totalRequests: 3186700,
  uniqueVisitors: 274500,
  peakHourRequests: 25180,
  successRate: 98.2,
  trendStart: "2025-12-24",
  trendDays: 180,
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Six-month data is intended for seasonal traffic and crawler trend review.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
});

const SAMPLE_ACCESS_1Y_PERIOD = scaleSampleAccessPeriod(SAMPLE_ACCESS_14D_PERIOD, {
  id: "1y",
  label: "1y",
  windowHours: 365 * 24,
  totalRequests: 6420900,
  uniqueVisitors: 522800,
  peakHourRequests: 26840,
  successRate: 98.1,
  trendStart: "2025-06-22",
  trendDays: 365,
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "One-year data is intended for long-running operations review after aggregate history has accumulated.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
});

const SAMPLE_ACCESS_ALL_PERIOD = scaleSampleAccessPeriod(SAMPLE_ACCESS_14D_PERIOD, {
  id: "all",
  label: "all",
  windowHours: 365 * 24 * 100,
  totalRequests: 9884200,
  uniqueVisitors: 731400,
  peakHourRequests: 29110,
  successRate: 98.0,
  trendStart: "2025-04-28",
  trendDays: 420,
  notes: [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "The all period covers every day available in the aggregate history used to publish this JSON.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ],
});

const SAMPLE_ACCESS_INSIGHTS: AccessInsights = {
  ...SAMPLE_ACCESS_ALL_PERIOD,
  sample: true,
  generatedAt: "2026-06-21T03:00:00+09:00",
  source: "sample-nginx-access",
  defaultPeriod: "24h",
  periods: [
    SAMPLE_ACCESS_24H_PERIOD,
    SAMPLE_ACCESS_7D_PERIOD,
    SAMPLE_ACCESS_14D_PERIOD,
    SAMPLE_ACCESS_1M_PERIOD,
    SAMPLE_ACCESS_3M_PERIOD,
    SAMPLE_ACCESS_6M_PERIOD,
    SAMPLE_ACCESS_1Y_PERIOD,
    SAMPLE_ACCESS_ALL_PERIOD,
  ],
  historicalEstimates: [
    {
      id: "1y",
      label: "1y",
      from: "2025-06-22T00:00:00Z",
      to: "2026-06-08T00:00:00Z",
      totalRequests: 6120000,
      peakDay: "2026-03-09",
      peakDayRequests: 26840,
      sampleCount: 351,
      coverageDays: 351,
      estimated: true,
      notes: [
        "This estimate covers only the period before retained nginx access logs.",
        "Country, location, ASN, endpoint, status and user-agent breakdowns are not available for this estimated historical segment.",
      ],
    },
  ],
};

const navItems: Array<{ href: string; labelKey: string; page: PageName }> = [
  { href: "/", labelKey: "nav.home", page: "home" },
  { href: "/ipcalc", labelKey: "nav.ipcalc", page: "ipcalc" },
  { href: "/IPv4byCountry", labelKey: "nav.country", page: "country" },
  { href: "/playground", labelKey: "nav.playground", page: "playground" },
  { href: "/access-insights", labelKey: "nav.access", page: "access" },
];

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("Missing #app root");
}

const app: HTMLDivElement = appRoot;
const page = (app.dataset.page ?? "home") as PageName;
const homeViewState: HomeViewState = {
  currentIp: "",
  inputValue: "",
  resolvedTarget: "",
  info: null,
};
let activeAccessPeriodId = "";
let navIpInfoPromise: Promise<IpInfo> | null = null;

function markAppReady(): void {
  if (document.documentElement.classList.contains("app-ready")) return;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("app-loading");
      document.documentElement.classList.add("app-ready");
    });
  });
}

function renderPageForLocaleChange(): void {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const render = (): void => {
    renderPage();
    window.scrollTo(scrollX, scrollY);
  };
  const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && startViewTransition) {
    startViewTransition.call(document, render);
    return;
  }
  render();
}

function renderShell(content: string): void {
  setDocumentMetadata();
  app.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <nav class="site-nav" aria-label="Primary navigation">
          <a class="brand" href="/" aria-label="inet-ip.info home">
            <span class="brand-mark" aria-hidden="true">
              <span></span><span></span><span></span>
            </span>
            <span class="brand-copy">
              <strong>inet-ip.info</strong>
              <small>${escapeHtml(t("brand.subtitle"))}</small>
            </span>
          </a>
          <div class="nav-links">
            ${navItems
              .map((item) => `<a class="${item.page === page ? "active" : ""}" href="${item.href}">${escapeHtml(t(item.labelKey))}</a>`)
              .join("")}
          </div>
          <div class="header-actions">
            <div class="language-picker" id="language-picker">
              <button
                class="language-button"
                id="language-button"
                type="button"
                aria-label="${escapeHtml(`${t("language.label")}: ${currentLocaleOption().label}`)}"
                aria-haspopup="menu"
                aria-expanded="false"
                title="${escapeHtml(`${t("language.label")}: ${currentLocaleOption().label}`)}"
              >
                <span class="language-flag" aria-hidden="true">${escapeHtml(currentLocaleOption().flag)}</span>
              </button>
              <div class="language-menu" id="language-menu" role="menu" hidden>
                ${localeOptions
                  .map(
                    (option) => `
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked="${option.value === locale ? "true" : "false"}"
                        data-locale="${option.value}"
                      >
                        <span class="language-flag" aria-hidden="true">${escapeHtml(option.flag)}</span>
                        <span>${escapeHtml(option.label)}</span>
                        <strong>${option.value === locale ? "✓" : ""}</strong>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
            <div class="nav-ip" id="nav-ip" hidden>
              <span>${escapeHtml(t("nav.currentIp"))}</span>
              <strong id="nav-ip-value"></strong>
            </div>
          </div>
        </nav>
      </header>
      <main>${content}</main>
      <footer class="site-footer">
        <div>
          <strong>inet-ip.info</strong>
          <span>${escapeHtml(t("footer.summary"))}</span>
        </div>
        <a href="https://github.com/inet-ip-info/website/">GitHub</a>
      </footer>
    </div>
  `;
  setupLanguageMenu();
  void ensureNavIp();
}

function setDocumentMetadata(): void {
  document.documentElement.lang = localeOptions.find((option) => option.value === locale)?.htmlLang ?? "en";
  document.title = t(`meta.${page}.title`);
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    description.content = t("meta.description");
  }
}

function currentLocaleOption(): LocaleOption {
  return localeOptions.find((option) => option.value === locale) ?? localeOptions[0];
}

function setupLanguageMenu(): void {
  const picker = document.querySelector<HTMLDivElement>("#language-picker");
  const button = document.querySelector<HTMLButtonElement>("#language-button");
  const menu = document.querySelector<HTMLDivElement>("#language-menu");
  if (!picker || !button || !menu) return;
  const languagePicker = picker;
  const languageButton = button;
  const languageMenu = menu;

  let keydownHandler: ((event: KeyboardEvent) => void) | null = null;
  let pointerdownHandler: ((event: PointerEvent) => void) | null = null;

  function closeMenu(): void {
    if (languageMenu.hidden) return;
    languageMenu.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
    if (pointerdownHandler) {
      document.removeEventListener("pointerdown", pointerdownHandler, true);
      pointerdownHandler = null;
    }
  }

  function openMenu(): void {
    if (!languageMenu.hidden) return;
    languageMenu.hidden = false;
    languageButton.setAttribute("aria-expanded", "true");
    keydownHandler = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        languageButton.focus();
      }
    };
    pointerdownHandler = (event) => {
      const target = event.target;
      if (!(target instanceof Node) || !languagePicker.contains(target)) {
        closeMenu();
      }
    };
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("pointerdown", pointerdownHandler, true);
  }

  button.addEventListener("click", () => {
    if (languageMenu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
      languageMenu.querySelector<HTMLButtonElement>("[data-locale]")?.focus();
    }
  });

  languageMenu.querySelectorAll<HTMLButtonElement>("[data-locale]").forEach((item) => {
    item.addEventListener("click", () => {
      const nextLocale = normalizeLocale(item.dataset.locale);
      if (!nextLocale || nextLocale === locale) {
        closeMenu();
        return;
      }
      locale = nextLocale;
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // localStorage can be unavailable in strict privacy modes.
      }
      closeMenu();
      renderPageForLocaleChange();
    });
  });
}

function setNavIp(ipAddress: string): void {
  const wrapper = document.querySelector<HTMLDivElement>("#nav-ip");
  const value = document.querySelector<HTMLElement>("#nav-ip-value");
  if (!wrapper || !value || ipAddress === "") return;
  value.textContent = ipAddress;
  wrapper.hidden = false;
}

async function ensureNavIp(): Promise<void> {
  if (homeViewState.currentIp !== "") {
    setNavIp(homeViewState.currentIp);
    return;
  }
  navIpInfoPromise ??= fetchIpInfo();
  try {
    const info = await navIpInfoPromise;
    if (info.ipAddress === "") return;
    homeViewState.currentIp = info.ipAddress;
    setNavIp(info.ipAddress);
  } catch {
    // Keep the header compact if the current-IP endpoint is unavailable.
  }
}

function getName(names: NameMap | undefined): string {
  if (!names) return "";
  for (const candidate of nameLocaleCandidates()) {
    if (names[candidate]) return names[candidate];
  }
  return names.en ?? Object.values(names)[0] ?? "";
}

function nameLocaleCandidates(): string[] {
  if (locale === "zh-Hans") return ["zh-CN", "zh-Hans", "zh", "en"];
  if (locale === "pt-BR") return ["pt-BR", "pt", "en"];
  return [locale, locale.split("-")[0] ?? locale, "en"];
}

function t(key: string): string {
  const localeStrings = translations[locale] as Record<string, string>;
  const fallbackStrings = translations.en as Record<string, string>;
  return localeStrings[key] ?? fallbackStrings[key] ?? key;
}

function tf(key: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce((value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)), t(key));
}

function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.trim();
  const lower = normalized.toLowerCase();
  if (lower.startsWith("zh")) return "zh-Hans";
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("en")) return "en";
  return null;
}

function resolveInitialLocale(): Locale {
  try {
    const storedLocale = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
    if (storedLocale) return storedLocale;
  } catch {
    // Ignore storage failures and fall back to browser languages.
  }
  const browserLocales = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const browserLocale of browserLocales) {
    const matched = normalizeLocale(browserLocale);
    if (matched) return matched;
  }
  return "en";
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function isValidIPv4(value: string): boolean {
  const parts = value.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    if (part.length > 1 && part.startsWith("0")) return false;
    const octet = Number(part);
    return octet >= 0 && octet <= 255;
  });
}

function parseIPv4(value: string): number | null {
  if (!isValidIPv4(value)) return null;
  const parts = value.split(".").map(Number);
  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
}

function formatIPv4(value: number): string {
  return `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`;
}

async function fetchIpInfo(ipAddress?: string): Promise<IpInfo> {
  if (isStaticFrontendPreview() && ipAddress === undefined) {
    return SAMPLE_INFO;
  }

  const init: RequestInit =
    ipAddress === undefined
      ? { method: "GET" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: ipAddress }),
        };
  try {
    const response = await fetch("/json", init);
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()) as IpInfo;
  } catch (error) {
    if (isStaticFrontendPreview() && ipAddress !== undefined) {
      throw new Error(`Local lookup proxy failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    throw error;
  }
}

function isStaticFrontendPreview(): boolean {
  return (location.hostname === "127.0.0.1" || location.hostname === "localhost") && (location.port === "5173" || location.port === "4173");
}

function renderRows(rows: DetailRow[]): string {
  return rows
    .filter((row) => row.value !== "")
    .map(
      (row) => `
        <div class="${row.strong ? "strong-row" : ""}">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>
      `,
    )
    .join("");
}

function detailsFor(info: IpInfo): DetailRow[] {
  const country = getName(info.city.Country?.Names);
  const representedCountry = getName(info.city.RepresentedCountry?.Names);
  const registeredCountry = getName(info.city.RegisteredCountry?.Names);
  const subdivisions =
    info.city.Subdivisions?.map((item) => getName(item.Names))
      .filter(Boolean)
      .join(", ") ?? "";
  return [
    {
      label: "AS",
      value: info.asn.AutonomousSystemNumber > 0 ? `AS${info.asn.AutonomousSystemNumber}` : "",
    },
    { label: t("detail.organization"), value: info.asn.AutonomousSystemOrganization },
    { label: t("detail.continent"), value: getName(info.city.Continent?.Names) },
    { label: t("detail.country"), value: [country, info.city.Country?.IsoCode].filter(Boolean).join(" / ") },
    { label: t("detail.representedCountry"), value: representedCountry !== country ? representedCountry : "" },
    { label: t("detail.registeredCountry"), value: registeredCountry !== country ? registeredCountry : "" },
    { label: t("detail.subdivision"), value: subdivisions },
    { label: t("detail.city"), value: getName(info.city.City?.Names) },
    { label: t("detail.timezone"), value: info.city.Location?.TimeZone ?? "" },
  ];
}

function locationRowsFor(info: IpInfo): DetailRow[] {
  if (!hasUsableLocation(info)) {
    return [{ label: t("detail.status"), value: t("message.unknown") }];
  }
  const location = info.city.Location;
  const coordinates = `${location.Latitude}, ${location.Longitude}`;
  return [
    { label: t("detail.accuracyRadius"), value: `${location.AccuracyRadius} km` },
    { label: t("detail.coordinates"), value: coordinates },
    { label: t("geoip.source"), value: "MaxMind GeoLite2" },
    { label: t("geoip.operatorUse"), value: t("geoip.operatorUseValue") },
  ];
}

function hasUsableLocation(
  info: IpInfo,
): info is IpInfo & { city: IpInfo["city"] & { Location: NonNullable<IpInfo["city"]["Location"]> } } {
  const location = info.city.Location;
  return Boolean(location && location.AccuracyRadius > 0 && Number.isFinite(location.Latitude) && Number.isFinite(location.Longitude));
}

function renderWorldMap(): string {
  return `
    <svg class="world-map" viewBox="${escapeHtml(
      WORLD_MAP_VIEW_BOX,
    )}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      ${WORLD_MAP_PATHS.map((path) => `<path d="${escapeHtml(path)}"></path>`).join("")}
    </svg>
  `;
}

function renderHome(): void {
  renderShell(`
    <section class="home-hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1>inet-ip.info</h1>
          <p class="hero-lead">${escapeHtml(t("home.lead"))}</p>
          <p class="hero-text">${escapeHtml(t("home.text"))}</p>
          <form class="lookup-control" id="lookup-form">
            <label for="ipaddress">${escapeHtml(t("home.lookupLabel"))}</label>
            <div class="lookup-line">
              <input id="ipaddress" type="text" inputmode="decimal" autocomplete="off" placeholder="${escapeHtml(
                t("home.lookupPlaceholder"),
              )}" />
              <button type="submit">${escapeHtml(t("home.lookupButton"))}</button>
            </div>
            <div class="lookup-actions">
              <button type="button" id="current-ip-button">${escapeHtml(t("home.currentIpButton"))}</button>
              <a href="#cli">${escapeHtml(t("home.viewCli"))}</a>
            </div>
            <p class="validation" id="lookup-message" hidden></p>
          </form>
        </div>
        <section class="inspector-panel" aria-label="${escapeHtml(t("home.panelAria"))}">
          <div class="panel-topline">
            <span>${escapeHtml(t("home.resolvedTarget"))}</span>
          </div>
          <div class="ip-display">
            <span>${escapeHtml(t("home.ipAddress"))}</span>
            <strong id="ip-display">${escapeHtml(t("home.resolving"))}</strong>
          </div>
          <div class="detail-table" id="detail-table"></div>
          <p class="license" id="license"></p>
        </section>
      </div>
    </section>
    <section class="content-section location-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("home.readableTitle"))}</h2>
        <p>${escapeHtml(t("home.readableText"))}</p>
      </div>
      <div class="location-grid">
        <div class="location-map" aria-hidden="true">
          ${renderWorldMap()}
          <span class="map-target" id="map-target" hidden><span></span></span>
          <small>Made with Natural Earth.</small>
        </div>
        <div class="mini-table" id="location-table"></div>
      </div>
    </section>
    <section class="content-section cli-section" id="cli">
      <div class="section-heading">
        <h2>${escapeHtml(t("home.cliTitle"))}</h2>
        <p>${escapeHtml(t("home.cliText"))}</p>
      </div>
      <div class="command-rail" id="command-rail"></div>
    </section>
    <section class="content-section tools-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("home.moreToolsTitle"))}</h2>
        <p>${escapeHtml(t("home.moreToolsText"))}</p>
      </div>
      <div class="tool-links">
        <a href="/ipcalc"><span>01</span><strong>IPcalc</strong><small>${escapeHtml(t("home.toolIpcalcText"))}</small></a>
        <a href="/IPv4byCountry"><span>02</span><strong>${escapeHtml(t("nav.country"))}</strong><small>${escapeHtml(
          t("home.toolCountryText"),
        )}</small></a>
        <a href="/playground"><span>03</span><strong>${escapeHtml(t("nav.playground"))}</strong><small>${escapeHtml(
          t("home.toolPlaygroundText"),
        )}</small></a>
        <a href="/access-insights"><span>04</span><strong>${escapeHtml(t("nav.access"))}</strong><small>${escapeHtml(
          t("home.toolAccessText"),
        )}</small></a>
      </div>
    </section>
  `);

  void initHome();
}

async function initHome(): Promise<void> {
  const form = requiredElement<HTMLFormElement>("#lookup-form");
  const input = requiredElement<HTMLInputElement>("#ipaddress");
  const currentButton = requiredElement<HTMLButtonElement>("#current-ip-button");
  const message = requiredElement<HTMLParagraphElement>("#lookup-message");
  let currentIp = homeViewState.currentIp;
  input.value = homeViewState.inputValue;

  function setMessage(value: string): void {
    message.textContent = value;
    message.hidden = value === "";
  }

  function update(info: IpInfo, options: { currentLookup?: boolean; inputValue?: string; resolvedTarget?: string } = {}): void {
    if (options.currentLookup || currentIp === "") {
      currentIp = info.ipAddress;
    }
    const nextInputValue = options.inputValue ?? (input.value || options.resolvedTarget || info.ipAddress);
    const nextResolvedTarget = options.resolvedTarget ?? (nextInputValue || currentIp || info.ipAddress);

    input.value = nextInputValue;
    homeViewState.currentIp = currentIp;
    homeViewState.inputValue = nextInputValue;
    homeViewState.resolvedTarget = nextResolvedTarget;
    homeViewState.info = info;

    setNavIp(currentIp || info.ipAddress);
    requiredElement("#ip-display").textContent = info.ipAddress || t("message.unknown");
    requiredElement("#detail-table").innerHTML = renderRows(detailsFor(info));
    requiredElement("#location-table").innerHTML = renderRows(locationRowsFor(info));
    updateMapTarget(info);
    requiredElement("#license").innerHTML = licenseHtml();
    renderCommandRows(currentIp || info.ipAddress);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!isValidIPv4(query)) {
      input.classList.add("error");
      setMessage(t("message.invalidIpv4"));
      return;
    }
    input.classList.remove("error");
    setMessage("");
    homeViewState.inputValue = query;
    void fetchIpInfo(query)
      .then((info) => update(info, { inputValue: query, resolvedTarget: query }))
      .catch(() => {
        setMessage(t("message.lookupFailed"));
      });
  });

  input.addEventListener("input", () => {
    homeViewState.inputValue = input.value;
    input.classList.remove("error");
    setMessage("");
  });

  currentButton.addEventListener("click", () => {
    input.value = "";
    homeViewState.inputValue = "";
    input.classList.remove("error");
    setMessage("");
    void fetchIpInfo()
      .then((info) => update(info, { currentLookup: true, inputValue: info.ipAddress, resolvedTarget: info.ipAddress }))
      .catch(() => {
        setMessage(t("message.lookupFailed"));
      });
  });

  if (homeViewState.info) {
    update(homeViewState.info, {
      inputValue: homeViewState.inputValue,
      resolvedTarget: homeViewState.resolvedTarget,
    });
    markAppReady();
    return;
  }

  const readyFallback = window.setTimeout(markAppReady, 1200);

  await fetchIpInfo()
    .then((info) => update(info, { currentLookup: true }))
    .catch(() => {
      setMessage(t("message.lookupFailed"));
    })
    .finally(() => {
      window.clearTimeout(readyFallback);
      markAppReady();
    });
}

function updateMapTarget(info: IpInfo): void {
  const target = requiredElement<HTMLElement>("#map-target");
  if (!hasUsableLocation(info)) {
    target.hidden = true;
    return;
  }
  const x = ((info.city.Location.Longitude + 180) / 360) * 100;
  const y = ((90 - info.city.Location.Latitude) / 180) * 100;
  target.style.left = `${clamp(x, 0, 100)}%`;
  target.style.top = `${clamp(y, 0, 100)}%`;
  target.hidden = false;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function licenseHtml(): string {
  return `${escapeHtml(t("license.prefix"))} <a href="https://www.maxmind.com">https://www.maxmind.com</a>${escapeHtml(
    t("license.suffix"),
  )}`;
}

function renderCommandRows(currentIp: string): void {
  const commands = [
    {
      command: "curl inet-ip.info",
      response: currentIp ? tf("command.current.response", { ip: currentIp }) : t("command.current.fallback"),
      note: t("command.current.note"),
    },
    {
      command: "curl inet-ip.info/ip",
      response: currentIp || t("command.ipOnly.response"),
      note: t("command.ipOnly.note"),
    },
    {
      command: "curl inet-ip.info/json",
      response: t("command.json.response"),
      note: t("command.json.note"),
    },
  ];

  requiredElement("#command-rail").innerHTML = commands
    .map(
      (row) => `
        <article class="command-row">
          <div><code>$ ${escapeHtml(row.command)}</code><p>${escapeHtml(row.note)}</p></div>
          <span>${escapeHtml(row.response)}</span>
          <button type="button" data-copy="${escapeHtml(row.command)}">${escapeHtml(t("button.copy"))}</button>
        </article>
      `,
    )
    .join("");

  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.copy ?? "";
      void navigator.clipboard?.writeText(command);
      button.textContent = t("button.copied");
      window.setTimeout(() => {
        button.textContent = t("button.copy");
      }, 1400);
    });
  });
}

function renderIpcalc(): void {
  renderShell(`
    <section class="page-hero narrow">
      <h1>IPcalc</h1>
      <p>${escapeHtml(t("ipcalc.description"))}</p>
    </section>
    <section class="content-section compact-section">
      <form class="lookup-control" id="cidr-form">
        <label for="cidr-input">${escapeHtml(t("ipcalc.label"))}</label>
        <div class="lookup-line wide-button">
          <input id="cidr-input" type="text" inputmode="decimal" placeholder="${escapeHtml(t("ipcalc.placeholder"))}" />
          <button type="submit">${escapeHtml(t("ipcalc.calculate"))}</button>
        </div>
        <p class="validation" id="cidr-message" hidden></p>
      </form>
      <div class="detail-table standalone" id="cidr-result"></div>
    </section>
  `);
  initIpcalc();
}

function initIpcalc(): void {
  const form = requiredElement<HTMLFormElement>("#cidr-form");
  const input = requiredElement<HTMLInputElement>("#cidr-input");
  const message = requiredElement<HTMLParagraphElement>("#cidr-message");
  const result = requiredElement<HTMLDivElement>("#cidr-result");

  function calculate(): void {
    const cidr = parseCidr(input.value.trim());
    if (!cidr) {
      input.classList.add("error");
      message.textContent = t("ipcalc.error");
      message.hidden = false;
      result.innerHTML = "";
      return;
    }
    input.classList.remove("error");
    message.hidden = true;
    result.innerHTML = renderRows(cidrRows(cidr));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });
  input.addEventListener("input", () => {
    if (input.value.trim() === "") return;
    calculate();
  });
}

function cidrRows(cidr: CidrResult): DetailRow[] {
  return [
    { label: t("cidr.base"), value: cidr.base, strong: true },
    { label: t("cidr.mask"), value: cidr.mask },
    { label: t("cidr.bitmask"), value: String(cidr.bitmask) },
    { label: t("cidr.hostmask"), value: cidr.hostmask },
    { label: t("cidr.broadcast"), value: cidr.broadcast },
    { label: t("cidr.size"), value: cidr.size },
    { label: t("cidr.first"), value: cidr.first },
    { label: t("cidr.last"), value: cidr.last },
  ];
}

function parseCidr(value: string): CidrResult | null {
  const [ipText, bitsText] = value.split("/");
  if (!ipText || !bitsText || !/^\d+$/.test(bitsText)) return null;
  const bitmask = Number(bitsText);
  const ip = parseIPv4(ipText);
  if (ip === null || bitmask < 0 || bitmask > 32) return null;
  const mask = bitmask === 0 ? 0 : (0xffffffff << (32 - bitmask)) >>> 0;
  const base = (ip & mask) >>> 0;
  const hostmask = ~mask >>> 0;
  const broadcast = (base | hostmask) >>> 0;
  const size = 2 ** (32 - bitmask);
  const first = size > 2 ? base + 1 : base;
  const last = size > 2 ? broadcast - 1 : broadcast;
  return {
    base: formatIPv4(base),
    mask: formatIPv4(mask),
    bitmask,
    hostmask: formatIPv4(hostmask),
    broadcast: formatIPv4(broadcast),
    size: new Intl.NumberFormat(locale).format(size),
    first: formatIPv4(first >>> 0),
    last: formatIPv4(last >>> 0),
  };
}

function renderCountry(): void {
  renderShell(`
    <section class="page-hero">
      <h1>${escapeHtml(t("nav.country"))}</h1>
      <p>${escapeHtml(t("country.description"))}</p>
      <a class="primary-link" href="https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz">${escapeHtml(
        t("country.download"),
      )}</a>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("country.formatTitle"))}</h2>
        <p>${escapeHtml(t("country.formatText"))}</p>
      </div>
      <div class="tabs country-tabs" role="tablist" aria-label="${escapeHtml(t("country.firewallTabs"))}">
        <button class="active" type="button" role="tab" aria-selected="true" data-country-mode="nftables">
          ${escapeHtml(t("country.nftablesTab"))}
        </button>
        <button type="button" role="tab" aria-selected="false" data-country-mode="legacy">
          ${escapeHtml(t("country.legacyTab"))}
        </button>
      </div>
      <div class="command-rail" id="country-command-rail"></div>
    </section>
  `);
  initCountryTabs();
}

function countryCommandExamples(mode: CountryFirewallMode): CountryCommandExample[] {
  if (mode === "legacy") {
    return [
      { title: t("country.installIpset"), command: "apt install -y ipset iptables" },
      {
        title: t("country.createJapanSet"),
        command: `URL=https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz
CIDRFILE=/var/lib/ipset/ipset_list
SETNAME=allow_list

curl -sL "$URL" |
  zcat |
  sed -n 's/^JP\\t//p' > "$CIDRFILE"

ipset create "$SETNAME" hash:net -exist
ipset flush "$SETNAME"
while read -r cidr; do
  ipset add "$SETNAME" "$cidr"
done < "$CIDRFILE"`,
      },
      {
        title: t("country.allowUdp"),
        command: `SETNAME=allow_list

iptables -A INPUT -p udp --dport 26900:26903 -m set --match-set "$SETNAME" src -j ACCEPT
iptables -A INPUT -p udp --dport 26900:26903 -j DROP`,
      },
    ];
  }

  return [
    {
      title: t("country.installNftables"),
      command: `apt install -y nftables
systemctl enable --now nftables`,
    },
    {
      title: t("country.createJapanNftSet"),
      command: `URL=https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz
SETNAME=jp_ipv4

nft list table inet filter >/dev/null 2>&1 || nft add table inet filter
nft list set inet filter "$SETNAME" >/dev/null 2>&1 ||
  nft "add set inet filter $SETNAME { type ipv4_addr; flags interval; }"
nft flush set inet filter "$SETNAME"

curl -sL "$URL" |
  zcat |
  awk -F '\\t' '$1 == "JP" { print $2 }' |
  while read -r cidr; do
    nft add element inet filter "$SETNAME" "{ $cidr }"
  done`,
    },
    {
      title: t("country.allowNftUdp"),
      command: `SETNAME=jp_ipv4

nft list chain inet filter input >/dev/null 2>&1 ||
  nft 'add chain inet filter input { type filter hook input priority 0; policy accept; }'

nft add rule inet filter input udp dport 26900-26903 ip saddr @"$SETNAME" accept
nft add rule inet filter input udp dport 26900-26903 drop`,
    },
  ];
}

function initCountryTabs(): void {
  const rail = requiredElement<HTMLDivElement>("#country-command-rail");
  const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-country-mode]")];

  function setMode(mode: CountryFirewallMode): void {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.countryMode === mode;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    rail.replaceChildren(...countryCommandExamples(mode).map(({ title, command }) => createCodeBlock(title, command)));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.countryMode === "legacy" ? "legacy" : "nftables";
      setMode(mode);
    });
  });
  setMode("nftables");
}

function createCodeBlock(title: string, code: string): HTMLElement {
  const article = document.createElement("article");
  article.className = "code-block";

  const header = document.createElement("div");
  const label = document.createElement("strong");
  label.textContent = title;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = t("button.copy");
  button.addEventListener("click", () => {
    void navigator.clipboard?.writeText(code);
    button.textContent = t("button.copied");
    window.setTimeout(() => {
      button.textContent = t("button.copy");
    }, 1400);
  });
  header.append(label, button);

  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.textContent = code;
  pre.append(codeElement);
  article.append(header, pre);

  return article;
}

function renderAccessInsights(): void {
  renderShell(`
    <section class="page-hero access-page-hero">
      <h1>${escapeHtml(t("nav.access"))}</h1>
      <p>${escapeHtml(t("access.description"))}</p>
      <div class="access-meta" aria-label="access insights freshness">
        <span>${escapeHtml(t("access.generated"))}: <strong id="access-generated">-</strong></span>
        <span>${escapeHtml(t("access.window"))}: <strong id="access-window">-</strong></span>
      </div>
    </section>
    <section class="content-section compact-section access-dashboard">
      <p class="validation access-sample-notice" id="access-sample-notice" hidden>${escapeHtml(t("access.sampleNotice"))}</p>
      <div class="access-period-shell">
        <div class="tabs access-period-tabs" id="access-period-tabs" role="tablist" aria-label="${escapeHtml(t("access.periods"))}"></div>
        <div class="access-period-context">
          <span>${escapeHtml(t("access.periodSummary"))}</span>
          <strong id="access-period-title">-</strong>
          <p id="access-period-description"></p>
        </div>
      </div>
      <div class="access-summary-grid" id="access-summary"></div>
    </section>
    <section class="content-section access-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("access.geoTitle"))}</h2>
        <p>${escapeHtml(t("access.geoText"))}</p>
      </div>
      <div class="access-geo-grid">
        <div class="location-map access-map" id="access-map" aria-label="${escapeHtml(t("access.geoTitle"))}"></div>
        <div class="access-panel access-country-panel">
          <h3>${escapeHtml(t("access.topCountries"))}</h3>
          <div class="access-bar-list access-scroll-list access-country-list" id="access-countries"></div>
        </div>
      </div>
      <div class="access-panel access-wide-panel">
        <h3>${escapeHtml(t("access.topLocations"))}</h3>
        <div class="access-rank-grid access-scroll-list access-location-list" id="access-locations"></div>
      </div>
    </section>
    <section class="content-section access-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("access.trafficTitle"))}</h2>
        <p>${escapeHtml(t("access.trafficText"))}</p>
      </div>
      <div class="access-traffic-grid">
        <div class="access-panel access-trend-panel">
          <h3 id="access-trend-title">${escapeHtml(t("access.hourlyTrend"))}</h3>
          <div class="access-trend" id="access-trend"></div>
        </div>
        <div class="access-panel">
          <h3>${escapeHtml(t("access.statusCodes"))}</h3>
          <div class="access-status-list" id="access-status"></div>
        </div>
      </div>
      <div class="access-panel access-wide-panel">
        <h3>${escapeHtml(t("access.topEndpoints"))}</h3>
        <div class="access-bar-list" id="access-endpoints"></div>
      </div>
    </section>
    <section class="content-section access-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("access.clientTitle"))}</h2>
        <p>${escapeHtml(t("access.clientText"))}</p>
      </div>
      <div class="access-client-grid">
        <div class="access-panel">
          <h3>${escapeHtml(t("access.topAsns"))}</h3>
          <div class="access-bar-list" id="access-asns"></div>
        </div>
        <div class="access-panel">
          <h3>${escapeHtml(t("access.userAgents"))}</h3>
          <div class="access-bar-list" id="access-user-agents"></div>
        </div>
      </div>
      <div class="access-panel access-notes-panel">
        <h3>${escapeHtml(t("access.notes"))}</h3>
        <ul id="access-notes"></ul>
      </div>
    </section>
  `);
  void initAccessInsights();
}

async function initAccessInsights(): Promise<void> {
  const readyFallback = window.setTimeout(markAppReady, 1200);
  const result = await fetchAccessInsights();
  window.clearTimeout(readyFallback);
  renderAccessData(result.data, result.fromSample);
  markAppReady();
}

async function fetchAccessInsights(): Promise<{ data: AccessInsights; fromSample: boolean }> {
  try {
    const response = await fetch("/access-insights.json", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = normalizeAccessInsights((await response.json()) as Partial<AccessInsights>);
    return { data, fromSample: data.sample === true };
  } catch {
    return { data: SAMPLE_ACCESS_INSIGHTS, fromSample: true };
  }
}

function normalizeAccessInsights(data: Partial<AccessInsights>): AccessInsights {
  const normalizedRoot: AccessInsights = {
    ...SAMPLE_ACCESS_INSIGHTS,
    ...data,
    id: data.id ?? SAMPLE_ACCESS_INSIGHTS.id,
    label: data.label ?? SAMPLE_ACCESS_INSIGHTS.label,
    description: data.description ?? SAMPLE_ACCESS_INSIGHTS.description,
    generatedAt: data.generatedAt ?? SAMPLE_ACCESS_INSIGHTS.generatedAt,
    source: data.source ?? SAMPLE_ACCESS_INSIGHTS.source,
    windowHours: data.windowHours ?? SAMPLE_ACCESS_INSIGHTS.windowHours,
    summary: { ...SAMPLE_ACCESS_INSIGHTS.summary, ...(data.summary ?? {}) },
    topCountries: Array.isArray(data.topCountries) ? data.topCountries : [],
    topLocations: Array.isArray(data.topLocations) ? data.topLocations : [],
    topAsns: Array.isArray(data.topAsns) ? data.topAsns : [],
    topEndpoints: Array.isArray(data.topEndpoints) ? data.topEndpoints : [],
    statusCodes: Array.isArray(data.statusCodes) ? data.statusCodes : [],
    userAgents: Array.isArray(data.userAgents) ? data.userAgents : [],
    hourlyRequests: Array.isArray(data.hourlyRequests) ? data.hourlyRequests : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    historicalEstimates: Array.isArray(data.historicalEstimates) ? data.historicalEstimates : [],
  };
  const rawPeriods = Array.isArray(data.periods) && data.periods.length > 0 ? data.periods : [normalizedRoot];
  const periods = rawPeriods.map((period, index) => normalizeAccessPeriod(period, normalizedRoot, index));
  const defaultPeriod = periods.some((period) => period.id === data.defaultPeriod) ? data.defaultPeriod : periods[0]?.id;
  return { ...normalizedRoot, defaultPeriod, periods };
}

function normalizeAccessPeriod(period: Partial<AccessPeriod>, fallback: AccessInsights, index: number): AccessPeriod {
  const windowHours = period.windowHours ?? fallback.windowHours ?? 24;
  return {
    id: period.id ?? (index === 0 ? fallback.id : `${windowHours}h`),
    label: period.label ?? formatWindowLabel(windowHours),
    description: period.description ?? fallback.description ?? "",
    generatedAt: period.generatedAt ?? fallback.generatedAt,
    source: period.source ?? fallback.source,
    windowHours,
    summary: { ...fallback.summary, ...(period.summary ?? {}) },
    topCountries: Array.isArray(period.topCountries) ? period.topCountries : [],
    topLocations: Array.isArray(period.topLocations) ? period.topLocations : [],
    topAsns: Array.isArray(period.topAsns) ? period.topAsns : [],
    topEndpoints: Array.isArray(period.topEndpoints) ? period.topEndpoints : [],
    statusCodes: Array.isArray(period.statusCodes) ? period.statusCodes : [],
    userAgents: Array.isArray(period.userAgents) ? period.userAgents : [],
    hourlyRequests: Array.isArray(period.hourlyRequests) ? period.hourlyRequests : [],
    notes: Array.isArray(period.notes) ? period.notes : [],
  };
}

function formatWindowLabel(windowHours: number): string {
  if (windowHours === 30 * 24) return "1m";
  if (windowHours === 90 * 24) return "3m";
  if (windowHours === 180 * 24) return "6m";
  if (windowHours === 365 * 24) return "1y";
  if (windowHours > 0 && windowHours % 24 === 0) {
    const days = windowHours / 24;
    return days === 1 ? "24h" : `${days}d`;
  }
  return `${windowHours}h`;
}

function formatAccessPeriodLabel(period: AccessPeriod): string {
  if (period.id === "all") return t("access.periodAll");
  const monthMatch = /^(\d+)m$/.exec(period.id);
  if (monthMatch) return locale === "ja" ? `${monthMatch[1]}ヶ月` : period.label;
  const yearMatch = /^(\d+)y$/.exec(period.id);
  if (yearMatch) return locale === "ja" ? `${yearMatch[1]}年` : period.label;
  return period.label || formatWindowLabel(period.windowHours);
}

function formatAccessPeriodDescription(period: AccessPeriod): string {
  if (period.id === "all") return t("access.periodDescriptionAll");
  const monthMatch = /^(\d+)m$/.exec(period.id);
  if (monthMatch) return tf("access.periodDescriptionMonths", { count: monthMatch[1] });
  const yearMatch = /^(\d+)y$/.exec(period.id);
  if (yearMatch) return tf("access.periodDescriptionYears", { count: yearMatch[1] });
  if (Number.isFinite(period.windowHours) && period.windowHours > 0) {
    if (period.windowHours > 24 && period.windowHours % 24 === 0) {
      return tf("access.periodDescriptionDays", { count: period.windowHours / 24 });
    }
    return tf("access.periodDescriptionHours", { count: period.windowHours });
  }
  return period.description ?? "";
}

function isDailyAccessPeriod(period: AccessPeriod): boolean {
  return period.id === "all" || period.windowHours > 48;
}

function renderAccessData(data: AccessInsights, fromSample: boolean): void {
  const periods = data.periods && data.periods.length > 0 ? data.periods : [normalizeAccessPeriod(data, data, 0)];
  if (!activeAccessPeriodId || !periods.some((period) => period.id === activeAccessPeriodId)) {
    activeAccessPeriodId = data.defaultPeriod ?? periods[0].id;
  }
  const sampleNotice = requiredElement<HTMLParagraphElement>("#access-sample-notice");
  sampleNotice.hidden = !fromSample;
  const tabs = requiredElement<HTMLDivElement>("#access-period-tabs");
  tabs.innerHTML = periods
    .map(
      (period) => `
        <button type="button" role="tab" data-access-period="${escapeHtml(period.id)}">
          ${escapeHtml(formatAccessPeriodLabel(period))}
        </button>
      `,
    )
    .join("");
  tabs.querySelectorAll<HTMLButtonElement>("[data-access-period]").forEach((button) => {
    button.addEventListener("click", () => {
      activeAccessPeriodId = button.dataset.accessPeriod ?? activeAccessPeriodId;
      renderAccessPeriod(data, periods);
    });
  });
  renderAccessPeriod(data, periods);
}

function renderAccessPeriod(data: AccessInsights, periods: AccessPeriod[]): void {
  const period = periods.find((item) => item.id === activeAccessPeriodId) ?? periods[0];
  const periodLabel = formatAccessPeriodLabel(period);
  activeAccessPeriodId = period.id;
  requiredElement("#access-generated").textContent = formatDateTime(period.generatedAt ?? data.generatedAt ?? "");
  requiredElement("#access-window").textContent = periodLabel;
  requiredElement("#access-period-title").textContent = periodLabel;
  requiredElement("#access-period-description").textContent = formatAccessPeriodDescription(period);
  requiredElement("#access-trend-title").textContent = isDailyAccessPeriod(period) ? t("access.dailyTrend") : t("access.hourlyTrend");
  document.querySelectorAll<HTMLButtonElement>("[data-access-period]").forEach((button) => {
    const active = button.dataset.accessPeriod === period.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  const estimate = (data.historicalEstimates ?? []).find((item) => item.id === period.id);
  requiredElement("#access-summary").innerHTML = renderAccessSummary(period, estimate);
  requiredElement("#access-map").innerHTML = renderAccessMap(period);
  requiredElement("#access-countries").innerHTML = renderAccessBarList(period.topCountries);
  requiredElement("#access-locations").innerHTML = renderAccessRankGrid(period.topLocations);
  requiredElement("#access-trend").innerHTML = renderAccessTrend(period.hourlyRequests, period);
  requiredElement("#access-status").innerHTML = renderAccessStatuses(period.statusCodes);
  requiredElement("#access-endpoints").innerHTML = renderAccessBarList(period.topEndpoints);
  requiredElement("#access-asns").innerHTML = renderAccessBarList(period.topAsns);
  requiredElement("#access-user-agents").innerHTML = renderAccessBarList(period.userAgents);
  requiredElement("#access-notes").innerHTML = period.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
}

function renderAccessSummary(data: AccessPeriod, estimate?: AccessHistoricalEstimate): string {
  const peakLabel = isDailyAccessPeriod(data) ? t("access.peakDay") : t("access.peakHour");
  const estimateRange = estimate
    ? tf("access.estimatedRange", {
        from: formatDate(estimate.from),
        to: formatDate(estimate.to),
      })
    : "";
  const metrics = [
    {
      label: t("access.requests"),
      value: formatCount(estimate?.totalRequests ?? data.summary.totalRequests),
      tone: "strong",
      detail: estimateRange,
    },
    { label: t("access.visitors"), value: formatCount(data.summary.uniqueVisitors), tone: "" },
    {
      label: peakLabel,
      value: formatCount(estimate?.peakDayRequests ?? data.summary.peakHourRequests),
      tone: "",
      detail: estimate ? `${formatDate(estimate.peakDay)} / ${tf("access.estimatedCoverage", { count: estimate.coverageDays })}` : "",
    },
    { label: t("access.successRate"), value: formatPercent(data.summary.successRate), tone: "good" },
  ];
  return metrics
    .map(
      (metric) => `
        <article class="access-metric ${metric.tone}">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          ${metric.detail ? `<small>${escapeHtml(metric.detail)}</small>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderAccessMap(data: AccessPeriod): string {
  const mapLocations = data.topLocations.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).slice(0, 200);
  const maxRequests = Math.max(1, ...mapLocations.map((item) => item.requests));
  const coordinateHits = new Map<string, number>();
  const markers = mapLocations
    .map((item, index) => {
      const x = ((item.longitude + 180) / 360) * 100;
      const y = ((90 - item.latitude) / 180) * 100;
      const ratio = Math.max(0, item.requests / maxRequests);
      const scaledRatio = Math.sqrt(ratio);
      const size = 9 + scaledRatio * 17;
      const opacity = 0.72 + scaledRatio * 0.26;
      const coordinateKey = `${Math.round(x / 2)}:${Math.round(y / 2)}`;
      const overlapIndex = coordinateHits.get(coordinateKey) ?? 0;
      coordinateHits.set(coordinateKey, overlapIndex + 1);
      const jitterAngle = overlapIndex * 2.399963229728653;
      const jitterRadius = overlapIndex === 0 ? 0 : Math.min(28, 6 + Math.sqrt(overlapIndex) * 4.2);
      const jitterX = Math.cos(jitterAngle) * jitterRadius;
      const jitterY = Math.sin(jitterAngle) * jitterRadius * 0.68;
      return `
        <span
          class="access-map-marker"
          style="left: calc(${clamp(x, 0, 100)}% + ${jitterX.toFixed(1)}px); top: calc(${clamp(y, 0, 100)}% + ${jitterY.toFixed(
            1,
          )}px); width: ${size.toFixed(1)}px; height: ${size.toFixed(1)}px; opacity: ${opacity.toFixed(2)}; z-index: ${index + 3}"
          title="${escapeHtml(`${item.label}: ${formatCount(item.requests)}`)}"
        ></span>
      `;
    })
    .join("");
  return `
    ${renderWorldMap()}
    ${markers}
  `;
}

function renderAccessBarList(items: Array<AccessCountry | AccessRanking>): string {
  if (items.length === 0) return `<p class="access-empty">${escapeHtml(t("message.unknown"))}</p>`;
  const maxRequests = Math.max(1, ...items.map((item) => item.requests));
  return items
    .map((item) => {
      const label = "name" in item ? `${item.name} / ${item.code}` : item.label;
      const share = item.share === undefined ? "" : `<em>${escapeHtml(formatPercent(item.share))}</em>`;
      return `
        <div class="access-bar-row">
          <div>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(formatCount(item.requests))}</strong>
            ${share}
          </div>
          <span class="access-bar-track" aria-hidden="true"><span style="width: ${(item.requests / maxRequests) * 100}%"></span></span>
        </div>
      `;
    })
    .join("");
}

function renderAccessRankGrid(items: AccessLocation[]): string {
  if (items.length === 0) return `<p class="access-empty">${escapeHtml(t("message.unknown"))}</p>`;
  return items
    .map(
      (item, index) => `
        <article>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.countryCode)} · ${escapeHtml(formatCount(item.requests))}</small>
        </article>
      `,
    )
    .join("");
}

function renderAccessTrend(points: AccessHour[], period: AccessPeriod): string {
  if (points.length === 0) return `<p class="access-empty">${escapeHtml(t("message.unknown"))}</p>`;
  const maxRequests = Math.max(1, ...points.map((point) => point.requests));
  const labelStep = points.length > 18 ? Math.ceil(points.length / 8) : 1;
  const densityClass = points.length > 120 ? "dense" : points.length > 45 ? "compact" : "";
  return points
    .map((point, index) => {
      const tick = formatTrendTick(point.hour, period);
      const label = index % labelStep === 0 || index === points.length - 1 ? `<small>${escapeHtml(tick)}</small>` : "";
      return `
        <span
          class="${densityClass}"
          style="height: ${Math.max(6, (point.requests / maxRequests) * 100)}%"
          title="${escapeHtml(`${tick}: ${formatCount(point.requests)}`)}"
        >
          ${label}
        </span>
      `;
    })
    .join("");
}

function renderAccessStatuses(items: AccessStatus[]): string {
  if (items.length === 0) return `<p class="access-empty">${escapeHtml(t("message.unknown"))}</p>`;
  return items
    .map(
      (item) => `
        <span class="access-status status-${escapeHtml(item.code.slice(0, 1))}xx">
          ${escapeHtml(item.code)}
          <strong>${escapeHtml(formatCount(item.requests))}</strong>
        </span>
      `,
    )
    .join("");
}

function formatCount(value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatHour(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 5);
  return new Intl.DateTimeFormat(locale, { hour: "2-digit" }).format(date);
}

function formatTrendTick(value: string, period: AccessPeriod): string {
  if (!isDailyAccessPeriod(period)) return formatHour(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(5, 10);
  return new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" }).format(date);
}

function renderPlayground(): void {
  renderShell(`
    <section class="page-hero narrow">
      <h1>${escapeHtml(t("nav.playground"))}</h1>
      <p>${escapeHtml(t("playground.description"))}</p>
    </section>
    <section class="content-section compact-section playground">
      <div class="tabs" role="tablist" aria-label="${escapeHtml(t("playground.tabs"))}">
        <button class="active" type="button" data-mode="grep">grep</button>
        <button type="button" data-mode="sed">${escapeHtml(t("playground.sed"))}</button>
        <button type="button" data-mode="awk">${escapeHtml(t("playground.awk"))}</button>
        <button type="button" data-mode="jq">${escapeHtml(t("playground.jq"))}</button>
      </div>
      <label for="command-input">${escapeHtml(t("playground.pattern"))}</label>
      <input id="command-input" class="single-input" value="status" />
      <div class="editor-grid">
        <label>${escapeHtml(t("playground.stdin"))}<textarea id="stdin-input">server-a status=active
server-b status=inactive
server-c status=active</textarea></label>
        <label>${escapeHtml(t("playground.output"))}<textarea id="stdout-output" readonly></textarea></label>
      </div>
    </section>
  `);
  initPlayground();
}

function initPlayground(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-mode]")];
  const expression = requiredElement<HTMLInputElement>("#command-input");
  const stdin = requiredElement<HTMLTextAreaElement>("#stdin-input");
  const stdout = requiredElement<HTMLTextAreaElement>("#stdout-output");
  let mode = "grep";

  function run(): void {
    const input = stdin.value;
    if (mode === "grep") {
      stdout.value = input
        .split("\n")
        .filter((line) => line.includes(expression.value))
        .join("\n");
      return;
    }
    if (mode === "sed") {
      const [from = "", to = ""] = expression.value.split("=>");
      stdout.value = from === "" ? input : input.replaceAll(from, to);
      return;
    }
    if (mode === "awk") {
      const columns = expression.value
        .split(/[,\s]+/)
        .map((item) => Number(item.trim()) - 1)
        .filter((item) => Number.isInteger(item) && item >= 0);
      stdout.value = input
        .split("\n")
        .map((line) => {
          const fields = line.trim().split(/\s+/);
          return columns.map((index) => fields[index] ?? "").join(" ");
        })
        .join("\n");
      return;
    }
    try {
      stdout.value = JSON.stringify(JSON.parse(input), null, 2);
    } catch (error) {
      stdout.value = tf("playground.invalidJson", { message: error instanceof Error ? error.message : String(error) });
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode ?? "grep";
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      if (mode === "sed") expression.value = "status=>state";
      if (mode === "awk") expression.value = "1 2";
      if (mode === "jq") {
        expression.value = ".";
        stdin.value = '{"servers":[{"name":"server-a","status":"active"},{"name":"server-b","status":"inactive"}]}';
      }
      if (mode === "grep") expression.value = "status";
      run();
    });
  });
  expression.addEventListener("input", run);
  stdin.addEventListener("input", run);
  run();
}

function requiredElement<T extends Element = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function renderPage(): void {
  if (page === "home") {
    renderHome();
    return;
  }
  if (page === "ipcalc") renderIpcalc();
  if (page === "country") renderCountry();
  if (page === "playground") renderPlayground();
  if (page === "access") {
    renderAccessInsights();
    return;
  }
  markAppReady();
}

renderPage();
