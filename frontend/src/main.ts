import "./styles.css";

type PageName = "home" | "ipcalc" | "country" | "playground";
type Locale = "en" | "ja" | "zh-Hans" | "ko" | "es" | "fr" | "de" | "pt-BR";

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

const LOCALE_STORAGE_KEY = "inet-ip-info-locale";

const localeOptions: Array<{ value: Locale; label: string; htmlLang: string }> = [
  { value: "en", label: "English", htmlLang: "en" },
  { value: "ja", label: "日本語", htmlLang: "ja" },
  { value: "zh-Hans", label: "简体中文", htmlLang: "zh-Hans" },
  { value: "ko", label: "한국어", htmlLang: "ko" },
  { value: "es", label: "Español", htmlLang: "es" },
  { value: "fr", label: "Français", htmlLang: "fr" },
  { value: "de", label: "Deutsch", htmlLang: "de" },
  { value: "pt-BR", label: "Português", htmlLang: "pt-BR" },
];

const translations = {
  en: {
    "meta.home.title": "inet-ip.info | IPv4 lookup for server operators",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "IPv4 by Country | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "Fast IPv4 lookup, ASN, GeoIP and curl-ready responses for internet server administrators.",
    "language.label": "Language",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP Lookup",
    "nav.ipcalc": "IPcalc",
    "nav.country": "IPv4 by Country",
    "nav.playground": "CLI Playground",
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
    "home.readableTitle": "Readable network detail",
    "home.readableText": "Keep the fields operators need most visible, without making the lookup result feel like a raw dump.",
    "home.cliTitle": "curl-ready endpoints",
    "home.cliText": "Use the same service from shell scripts, provisioning jobs, monitoring checks or incident notes.",
    "home.moreToolsTitle": "More operator tools",
    "home.moreToolsText": "Move from discovery to calculation, country-based IPv4 lists, and browser-safe CLI experiments.",
    "home.toolIpcalcText": "CIDR, subnet mask and broadcast calculation.",
    "home.toolCountryText": "Country-based CIDR lists for network policy.",
    "home.toolPlaygroundText": "Try command patterns safely in the browser.",
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
      "Daily generated country-based IPv4 CIDR lists for access control, ipset, firewall rules and operations runbooks.",
    "country.download": "Download all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Policy-ready list format",
    "country.formatText":
      "The release artifact is collected from public RIR data and published as tab-separated country code plus CIDR entries.",
    "country.installIpset": "Install ipset",
    "country.createJapanSet": "Create and load a Japan-only set",
    "country.allowUdp": "Allow UDP game ports from the set",
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
  },
  ja: {
    "meta.home.title": "inet-ip.info | サーバー管理者向け IPv4 lookup",
    "meta.ipcalc.title": "IPcalc | inet-ip.info",
    "meta.country.title": "国別 IPv4 | inet-ip.info",
    "meta.playground.title": "CLI Playground | inet-ip.info",
    "meta.description": "インターネットサーバー管理者向けの高速な IPv4 lookup、ASN、GeoIP、curl 対応レスポンス。",
    "language.label": "言語",
    "brand.subtitle": "public IP tools",
    "nav.home": "IP Lookup",
    "nav.ipcalc": "IPcalc",
    "nav.country": "国別 IPv4",
    "nav.playground": "CLI Playground",
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
    "home.readableTitle": "読みやすいネットワーク情報",
    "home.readableText": "管理者がよく見る項目を見やすく保ち、lookup 結果を生の dump に見せません。",
    "home.cliTitle": "curl 対応エンドポイント",
    "home.cliText": "シェルスクリプト、プロビジョニング、監視、インシデントメモから同じサービスを利用できます。",
    "home.moreToolsTitle": "管理者向けツール",
    "home.moreToolsText": "調査から計算、国別 IPv4 リスト、ブラウザ上の CLI 実験まで移動できます。",
    "home.toolIpcalcText": "CIDR、サブネットマスク、ブロードキャストを計算します。",
    "home.toolCountryText": "ネットワークポリシー向けの国別 CIDR リスト。",
    "home.toolPlaygroundText": "コマンドパターンをブラウザ上で安全に試せます。",
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
    "country.description": "アクセス制御、ipset、firewall ルール、運用 runbook 向けに日次生成される国別 IPv4 CIDR リストです。",
    "country.download": "all-ipv4cidr.tsv.gz をダウンロード",
    "country.formatTitle": "ポリシーに使いやすいリスト形式",
    "country.formatText": "release artifact は公開 RIR データから収集され、国コードと CIDR を tab 区切りで公開します。",
    "country.installIpset": "ipset をインストール",
    "country.createJapanSet": "日本のみの set を作成して読み込む",
    "country.allowUdp": "set から UDP game port を許可",
    "playground.description": "よく使うテキスト処理パターン向けの軽量なブラウザ scratchpad です。full shell は実行しません。",
    "playground.tabs": "コマンドモード",
    "playground.pattern": "パターンまたは式",
    "playground.stdin": "標準入力",
    "playground.output": "出力",
    "playground.sed": "sed 置換",
    "playground.awk": "awk 列抽出",
    "playground.jq": "jq 整形",
    "playground.invalidJson": "無効な JSON: {message}",
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
    "home.readableTitle": "清晰的网络详情",
    "home.readableText": "突出管理员最常用字段，避免让查询结果看起来像原始 dump。",
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
    "country.description": "每日生成的国家 IPv4 CIDR 列表，适用于访问控制、ipset、防火墙规则和运维 runbook。",
    "country.download": "下载 all-ipv4cidr.tsv.gz",
    "country.formatTitle": "适合策略使用的列表格式",
    "country.formatText": "release artifact 从公开 RIR 数据收集，并以制表符分隔的国家代码和 CIDR 条目发布。",
    "country.installIpset": "安装 ipset",
    "country.createJapanSet": "创建并加载仅日本的 set",
    "country.allowUdp": "允许来自该 set 的 UDP 游戏端口",
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
    "home.readableTitle": "읽기 쉬운 네트워크 정보",
    "home.readableText": "운영자가 자주 보는 필드를 명확히 보여 주고, 조회 결과가 원시 dump처럼 보이지 않게 합니다.",
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
    "country.description": "접근 제어, ipset, 방화벽 규칙, 운영 runbook을 위한 국가별 IPv4 CIDR 목록을 매일 생성합니다.",
    "country.download": "all-ipv4cidr.tsv.gz 다운로드",
    "country.formatTitle": "정책에 바로 쓰기 좋은 목록 형식",
    "country.formatText": "release artifact는 공개 RIR 데이터에서 수집되며 국가 코드와 CIDR 항목을 탭으로 구분해 게시합니다.",
    "country.installIpset": "ipset 설치",
    "country.createJapanSet": "일본 전용 set 생성 및 로드",
    "country.allowUdp": "set에서 UDP 게임 포트 허용",
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
    "home.readableTitle": "Detalle de red legible",
    "home.readableText":
      "Mantenga visibles los campos que más necesitan los operadores, sin que el resultado parezca un dump sin procesar.",
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
    "country.description": "Listas CIDR IPv4 por país generadas a diario para control de acceso, ipset, firewall y runbooks de operación.",
    "country.download": "Descargar all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Formato listo para políticas",
    "country.formatText":
      "El release artifact se recopila desde datos RIR públicos y se publica como código de país y entradas CIDR separados por tabuladores.",
    "country.installIpset": "Instalar ipset",
    "country.createJapanSet": "Crear y cargar un set solo de Japón",
    "country.allowUdp": "Permitir puertos UDP de juego desde el set",
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
    "home.readableTitle": "Détails réseau lisibles",
    "home.readableText": "Gardez visibles les champs dont les opérateurs ont le plus besoin, sans transformer le résultat en dump brut.",
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
      "Listes CIDR IPv4 par pays générées chaque jour pour contrôle d'accès, ipset, règles firewall et runbooks d'exploitation.",
    "country.download": "Télécharger all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Format prêt pour les politiques",
    "country.formatText":
      "Le release artifact est collecté depuis les données RIR publiques et publié en code pays plus entrées CIDR séparées par tabulations.",
    "country.installIpset": "Installer ipset",
    "country.createJapanSet": "Créer et charger un set Japon uniquement",
    "country.allowUdp": "Autoriser les ports UDP de jeu depuis le set",
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
    "home.readableTitle": "Lesbare Netzwerkdetails",
    "home.readableText": "Halten Sie die wichtigsten Felder sichtbar, ohne dass das Ergebnis wie ein roher Dump wirkt.",
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
      "Täglich generierte länderbasierte IPv4-CIDR-Listen für Zugriffskontrolle, ipset, Firewall-Regeln und Betriebs-Runbooks.",
    "country.download": "all-ipv4cidr.tsv.gz herunterladen",
    "country.formatTitle": "Policy-fähiges Listenformat",
    "country.formatText":
      "Das release artifact wird aus öffentlichen RIR-Daten gesammelt und als tab-getrennte Ländercodes plus CIDR-Einträge veröffentlicht.",
    "country.installIpset": "ipset installieren",
    "country.createJapanSet": "Japan-only Set erstellen und laden",
    "country.allowUdp": "UDP-Spielports aus dem Set erlauben",
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
    "home.readableTitle": "Detalhes de rede legíveis",
    "home.readableText": "Mantenha visíveis os campos mais importantes para operadores, sem parecer um dump bruto.",
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
      "Listas CIDR IPv4 por país geradas diariamente para controle de acesso, ipset, regras de firewall e runbooks de operação.",
    "country.download": "Baixar all-ipv4cidr.tsv.gz",
    "country.formatTitle": "Formato pronto para políticas",
    "country.formatText":
      "O release artifact é coletado de dados RIR públicos e publicado como código de país e entradas CIDR separados por tabulação.",
    "country.installIpset": "Instalar ipset",
    "country.createJapanSet": "Criar e carregar um set somente do Japão",
    "country.allowUdp": "Permitir portas UDP de jogo a partir do set",
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

const navItems: Array<{ href: string; labelKey: string; page: PageName }> = [
  { href: "/", labelKey: "nav.home", page: "home" },
  { href: "/ipcalc", labelKey: "nav.ipcalc", page: "ipcalc" },
  { href: "/IPv4byCountry", labelKey: "nav.country", page: "country" },
  { href: "/playground", labelKey: "nav.playground", page: "playground" },
];

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("Missing #app root");
}

const app: HTMLDivElement = appRoot;
const page = (app.dataset.page ?? "home") as PageName;

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
            <label class="language-picker">
              <span class="sr-only">${escapeHtml(t("language.label"))}</span>
              <select id="language-select" aria-label="${escapeHtml(t("language.label"))}">
                ${localeOptions
                  .map(
                    (option) =>
                      `<option value="${option.value}" ${option.value === locale ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
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
  setupLanguageSelect();
}

function setDocumentMetadata(): void {
  document.documentElement.lang = localeOptions.find((option) => option.value === locale)?.htmlLang ?? "en";
  document.title = t(`meta.${page}.title`);
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    description.content = t("meta.description");
  }
}

function setupLanguageSelect(): void {
  const select = document.querySelector<HTMLSelectElement>("#language-select");
  if (!select) return;
  select.addEventListener("change", () => {
    const nextLocale = normalizeLocale(select.value);
    if (!nextLocale || nextLocale === locale) return;
    locale = nextLocale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // localStorage can be unavailable in strict privacy modes.
    }
    renderPage();
  });
}

function setNavIp(ipAddress: string): void {
  const wrapper = document.querySelector<HTMLDivElement>("#nav-ip");
  const value = document.querySelector<HTMLElement>("#nav-ip-value");
  if (!wrapper || !value || ipAddress === "") return;
  value.textContent = ipAddress;
  wrapper.hidden = false;
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
  const coordinates = info.city.Location ? `${info.city.Location.Latitude}, ${info.city.Location.Longitude}` : "";
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
    { label: t("detail.postalCode"), value: info.city.Postal.Code },
    { label: t("detail.timezone"), value: info.city.Location?.TimeZone ?? "" },
    { label: t("detail.coordinates"), value: coordinates },
  ];
}

function locationRowsFor(info: IpInfo): DetailRow[] {
  if (!info.city.Location) {
    return [{ label: t("detail.status"), value: t("detail.waiting") }];
  }
  return [
    { label: t("detail.accuracyRadius"), value: `${info.city.Location.AccuracyRadius} km` },
    { label: t("detail.latitude"), value: String(info.city.Location.Latitude) },
    { label: t("detail.longitude"), value: String(info.city.Location.Longitude) },
    { label: t("detail.metroCode"), value: String(info.city.Location.MetroCode) },
    { label: t("detail.timezone"), value: info.city.Location.TimeZone },
  ];
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
            <strong id="resolved-target">${escapeHtml(t("home.resolving"))}</strong>
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
    <section class="signal-strip" aria-label="${escapeHtml(t("home.lookupCoverage"))}">
      <div><span>${escapeHtml(t("home.signalAsn"))}</span><strong id="signal-asn">${escapeHtml(t("home.signalReady"))}</strong></div>
      <div><span>${escapeHtml(t("home.signalGeoip"))}</span><strong id="signal-country">${escapeHtml(
        t("home.signalCountry"),
      )}</strong></div>
      <div><span>${escapeHtml(t("home.signalCoordinates"))}</span><strong id="signal-coordinates">${escapeHtml(
        t("home.signalLocation"),
      )}</strong></div>
      <div><span>${escapeHtml(t("home.signalCli"))}</span><strong>${escapeHtml(t("home.signalCurl"))}</strong></div>
    </section>
    <section class="content-section location-section">
      <div class="section-heading">
        <h2>${escapeHtml(t("home.readableTitle"))}</h2>
        <p>${escapeHtml(t("home.readableText"))}</p>
      </div>
      <div class="location-grid">
        <div class="location-map" aria-hidden="true">
          <span class="map-node node-a"></span>
          <span class="map-node node-b"></span>
          <span class="map-node node-c"></span>
          <span class="map-line line-a"></span>
          <span class="map-line line-b"></span>
          <strong id="map-label">GeoIP</strong>
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
  let currentIp = "";

  function setMessage(value: string): void {
    message.textContent = value;
    message.hidden = value === "";
  }

  function update(info: IpInfo): void {
    currentIp ||= info.ipAddress;
    input.value = input.value || info.ipAddress;
    setNavIp(currentIp);
    requiredElement("#resolved-target").textContent = input.value || currentIp;
    requiredElement("#ip-display").textContent = info.ipAddress || t("message.unknown");
    requiredElement("#detail-table").innerHTML = renderRows(detailsFor(info));
    requiredElement("#location-table").innerHTML = renderRows(locationRowsFor(info));
    requiredElement("#signal-asn").textContent =
      info.asn.AutonomousSystemNumber > 0 ? `AS${info.asn.AutonomousSystemNumber}` : t("home.signalReady");
    requiredElement("#signal-country").textContent = getName(info.city.Country?.Names) || t("home.signalCountry");
    requiredElement("#signal-coordinates").textContent = info.city.Location
      ? `${info.city.Location.Latitude}, ${info.city.Location.Longitude}`
      : t("home.signalLocation");
    requiredElement("#map-label").textContent = getName(info.city.Country?.Names) || "GeoIP";
    requiredElement("#license").innerHTML = licenseHtml();
    renderCommandRows(currentIp);
  }

  await fetchIpInfo()
    .then(update)
    .catch(() => {
      setMessage(t("message.lookupFailed"));
    });

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
    void fetchIpInfo(query)
      .then(update)
      .catch(() => {
        setMessage(t("message.lookupFailed"));
      });
  });

  input.addEventListener("input", () => {
    input.classList.remove("error");
    setMessage("");
  });

  currentButton.addEventListener("click", () => {
    input.value = "";
    input.classList.remove("error");
    setMessage("");
    void fetchIpInfo()
      .then(update)
      .catch(() => {
        setMessage(t("message.lookupFailed"));
      });
  });
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
      <div class="command-rail">
        ${codeBlock(t("country.installIpset"), "apt install -y ipset")}
        ${codeBlock(
          t("country.createJapanSet"),
          `URL=https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz
CIDRFILE=/var/lib/ipset/ipset_list
SETNAME=allow_list

curl -sL "$URL" |
  zcat |
  sed -n 's/^JP\\t//p' > "$CIDRFILE"

ipset create "$SETNAME" hash:net
ipset flush "$SETNAME"
while read line; do
  ipset add "$SETNAME" "$line"
done < "$CIDRFILE"`,
        )}
        ${codeBlock(
          t("country.allowUdp"),
          `iptables -A INPUT -p udp --dport 26900:26903 -m set --match-set "$SETNAME" src -j ACCEPT
iptables -A INPUT -p udp --dport 26900:26903 -j DROP`,
        )}
      </div>
    </section>
  `);
  initCopyButtons();
}

function codeBlock(title: string, code: string): string {
  return `
    <article class="code-block">
      <div><strong>${escapeHtml(title)}</strong><button type="button" data-copy="${escapeHtml(code)}">${escapeHtml(
        t("button.copy"),
      )}</button></div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </article>
  `;
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

function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.copy ?? "";
      void navigator.clipboard?.writeText(value);
      button.textContent = t("button.copied");
      window.setTimeout(() => {
        button.textContent = t("button.copy");
      }, 1400);
    });
  });
}

function requiredElement<T extends Element = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function renderPage(): void {
  if (page === "home") renderHome();
  if (page === "ipcalc") renderIpcalc();
  if (page === "country") renderCountry();
  if (page === "playground") renderPlayground();
}

renderPage();
