import "./styles.css";

type PageName = "home" | "ipcalc" | "country" | "playground";

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

const SAMPLE_INFO: IpInfo = {
  ipAddress: "203.0.113.42",
  asn: {
    AutonomousSystemNumber: 64500,
    AutonomousSystemOrganization: "Example Network Operations",
  },
  city: {
    City: { Names: { en: "Tokyo", ja: "Tokyo" } },
    Continent: { Code: "AS", Names: { en: "Asia", ja: "Asia" } },
    Country: { IsInEuropeanUnion: false, IsoCode: "JP", Names: { en: "Japan", ja: "Japan" } },
    RegisteredCountry: { IsInEuropeanUnion: false, IsoCode: "JP", Names: { en: "Japan", ja: "Japan" } },
    RepresentedCountry: null,
    Subdivisions: [{ IsoCode: "13", Names: { en: "Tokyo" } }],
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

const navItems = [
  { href: "/", label: "IP Lookup", page: "home" },
  { href: "/ipcalc", label: "IPcalc", page: "ipcalc" },
  { href: "/IPv4byCountry", label: "IPv4 by Country", page: "country" },
  { href: "/playground", label: "CLI Playground", page: "playground" },
];

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("Missing #app root");
}

const app: HTMLDivElement = appRoot;
const page = (app.dataset.page ?? "home") as PageName;

function renderShell(content: string): void {
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
              <small>public IP tools</small>
            </span>
          </a>
          <div class="nav-links">
            ${navItems
              .map((item) => `<a class="${item.page === page ? "active" : ""}" href="${item.href}">${escapeHtml(item.label)}</a>`)
              .join("")}
          </div>
          <div class="nav-ip" id="nav-ip" hidden>
            <span>Your IP</span>
            <strong id="nav-ip-value"></strong>
          </div>
        </nav>
      </header>
      <main>${content}</main>
      <footer class="site-footer">
        <div>
          <strong>inet-ip.info</strong>
          <span>Fast IPv4 lookup and curl-ready responses for server operators.</span>
        </div>
        <a href="https://github.com/inet-ip-info/website/">GitHub</a>
      </footer>
    </div>
  `;
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
  const language = navigator.language || "en";
  const shortLanguage = language.split("-")[0] ?? "en";
  return names[language] ?? names[shortLanguage] ?? names.en ?? Object.values(names)[0] ?? "";
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
    { label: "IP address", value: info.ipAddress, strong: true },
    {
      label: "AS",
      value: info.asn.AutonomousSystemNumber > 0 ? `AS${info.asn.AutonomousSystemNumber}` : "",
    },
    { label: "Organization", value: info.asn.AutonomousSystemOrganization },
    { label: "Continent", value: getName(info.city.Continent?.Names) },
    { label: "Country", value: [country, info.city.Country?.IsoCode].filter(Boolean).join(" / ") },
    { label: "Represented country", value: representedCountry !== country ? representedCountry : "" },
    { label: "Registered country", value: registeredCountry !== country ? registeredCountry : "" },
    { label: "Subdivision", value: subdivisions },
    { label: "City", value: getName(info.city.City?.Names) },
    { label: "Postal code", value: info.city.Postal.Code },
    { label: "Timezone", value: info.city.Location?.TimeZone ?? "" },
    { label: "Coordinates", value: coordinates },
  ];
}

function locationRowsFor(info: IpInfo): DetailRow[] {
  if (!info.city.Location) {
    return [{ label: "Status", value: "Waiting for lookup result" }];
  }
  return [
    { label: "Accuracy radius", value: `${info.city.Location.AccuracyRadius} km` },
    { label: "Latitude", value: String(info.city.Location.Latitude) },
    { label: "Longitude", value: String(info.city.Location.Longitude) },
    { label: "Metro code", value: String(info.city.Location.MetroCode) },
    { label: "Timezone", value: info.city.Location.TimeZone },
  ];
}

function renderHome(): void {
  renderShell(`
    <section class="home-hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1>inet-ip.info</h1>
          <p class="hero-lead">Know what the internet sees.</p>
          <p class="hero-text">Fast IPv4 lookup, ASN, GeoIP and curl-ready responses for server operators.</p>
          <form class="lookup-control" id="lookup-form">
            <label for="ipaddress">IPv4 Lookup</label>
            <div class="lookup-line">
              <input id="ipaddress" type="text" inputmode="decimal" autocomplete="off" placeholder="IPv4 address" />
              <button type="submit">Inspect IP</button>
            </div>
            <div class="lookup-actions">
              <button type="button" id="current-ip-button">Use current IP</button>
              <a href="#cli">View CLI</a>
            </div>
            <p class="validation" id="lookup-message" hidden></p>
          </form>
        </div>
        <section class="inspector-panel" aria-label="IP address information">
          <div class="panel-topline">
            <span>Resolved target</span>
            <strong id="resolved-target">Resolving...</strong>
          </div>
          <div class="ip-display">
            <span>IP address</span>
            <strong id="ip-display">Resolving...</strong>
          </div>
          <div class="detail-table" id="detail-table"></div>
          <p class="license" id="license"></p>
        </section>
      </div>
    </section>
    <section class="signal-strip" aria-label="Lookup coverage">
      <div><span>ASN</span><strong id="signal-asn">Ready</strong></div>
      <div><span>GeoIP</span><strong id="signal-country">Country lookup</strong></div>
      <div><span>Coordinates</span><strong id="signal-coordinates">Location detail</strong></div>
      <div><span>CLI</span><strong>curl-ready</strong></div>
    </section>
    <section class="content-section location-section">
      <div class="section-heading">
        <h2>Readable network detail</h2>
        <p>Keep the fields operators need most visible, without making the lookup result feel like a raw dump.</p>
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
        <h2>curl-ready endpoints</h2>
        <p>Use the same service from shell scripts, provisioning jobs, monitoring checks or incident notes.</p>
      </div>
      <div class="command-rail" id="command-rail"></div>
    </section>
    <section class="content-section tools-section">
      <div class="section-heading">
        <h2>More operator tools</h2>
        <p>Move from discovery to calculation, country-based IPv4 lists, and browser-safe CLI experiments.</p>
      </div>
      <div class="tool-links">
        <a href="/ipcalc"><span>01</span><strong>IPcalc</strong><small>CIDR, subnet mask and broadcast calculation.</small></a>
        <a href="/IPv4byCountry"><span>02</span><strong>IPv4 by Country</strong><small>Country-based CIDR lists for network policy.</small></a>
        <a href="/playground"><span>03</span><strong>CLI Playground</strong><small>Try command patterns safely in the browser.</small></a>
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
    requiredElement("#ip-display").textContent = info.ipAddress || "Unknown";
    requiredElement("#detail-table").innerHTML = renderRows(detailsFor(info));
    requiredElement("#location-table").innerHTML = renderRows(locationRowsFor(info));
    requiredElement("#signal-asn").textContent = info.asn.AutonomousSystemNumber > 0 ? `AS${info.asn.AutonomousSystemNumber}` : "Ready";
    requiredElement("#signal-country").textContent = getName(info.city.Country?.Names) || "Country lookup";
    requiredElement("#signal-coordinates").textContent = info.city.Location
      ? `${info.city.Location.Latitude}, ${info.city.Location.Longitude}`
      : "Location detail";
    requiredElement("#map-label").textContent = getName(info.city.Country?.Names) || "GeoIP";
    requiredElement("#license").innerHTML =
      'This product includes GeoLite2 data created by MaxMind, available from <a href="https://www.maxmind.com">https://www.maxmind.com</a>.';
    renderCommandRows(currentIp);
  }

  await fetchIpInfo()
    .then(update)
    .catch(() => {
      setMessage("Lookup failed. Please retry or check the API response.");
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!isValidIPv4(query)) {
      input.classList.add("error");
      setMessage("Valid IPv4 address is required.");
      return;
    }
    input.classList.remove("error");
    setMessage("");
    void fetchIpInfo(query)
      .then(update)
      .catch(() => {
        setMessage("Lookup failed. Please retry or check the API response.");
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
        setMessage("Lookup failed. Please retry or check the API response.");
      });
  });
}

function renderCommandRows(currentIp: string): void {
  const commands = [
    {
      command: "curl inet-ip.info",
      response: currentIp ? `Current IP address (${currentIp}\\n)` : "Current IP address",
      note: "Plain response with a trailing newline.",
    },
    {
      command: "curl inet-ip.info/ip",
      response: currentIp || "IP address only",
      note: "Minimal output for shell scripts.",
    },
    {
      command: "curl inet-ip.info/json",
      response: "JSON with IP, ASN and GeoIP fields",
      note: "Structured data for automation.",
    },
  ];

  requiredElement("#command-rail").innerHTML = commands
    .map(
      (row) => `
        <article class="command-row">
          <div><code>$ ${escapeHtml(row.command)}</code><p>${escapeHtml(row.note)}</p></div>
          <span>${escapeHtml(row.response)}</span>
          <button type="button" data-copy="${escapeHtml(row.command)}">Copy</button>
        </article>
      `,
    )
    .join("");

  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.copy ?? "";
      void navigator.clipboard?.writeText(command);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1400);
    });
  });
}

function renderIpcalc(): void {
  renderShell(`
    <section class="page-hero narrow">
      <h1>IPcalc</h1>
      <p>Calculate CIDR, network address, subnet mask, broadcast address and usable host range without sending data to the server.</p>
    </section>
    <section class="content-section compact-section">
      <form class="lookup-control" id="cidr-form">
        <label for="cidr-input">IPv4 address with CIDR</label>
        <div class="lookup-line wide-button">
          <input id="cidr-input" type="text" inputmode="decimal" placeholder="For example: 192.168.0.1/24" />
          <button type="submit">Calculate</button>
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
      message.textContent = "Enter an IPv4 address with CIDR, for example 192.168.0.1/24.";
      message.hidden = false;
      result.innerHTML = "";
      return;
    }
    input.classList.remove("error");
    message.hidden = true;
    const rows = Object.entries(cidr).map(([label, value]) => ({
      label,
      value: String(value),
      strong: label === "base",
    }));
    result.innerHTML = renderRows(rows);
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
    size: new Intl.NumberFormat("en-US").format(size),
    first: formatIPv4(first >>> 0),
    last: formatIPv4(last >>> 0),
  };
}

function renderCountry(): void {
  renderShell(`
    <section class="page-hero">
      <h1>IPv4 by Country</h1>
      <p>Daily generated country-based IPv4 CIDR lists for access control, ipset, firewall rules and operations runbooks.</p>
      <a class="primary-link" href="https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz">Download all-ipv4cidr.tsv.gz</a>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <h2>Policy-ready list format</h2>
        <p>The release artifact is collected from public RIR data and published as tab-separated country code plus CIDR entries.</p>
      </div>
      <div class="command-rail">
        ${codeBlock("Install ipset", "apt install -y ipset")}
        ${codeBlock(
          "Create and load a Japan-only set",
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
          "Allow UDP game ports from the set",
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
      <div><strong>${escapeHtml(title)}</strong><button type="button" data-copy="${escapeHtml(code)}">Copy</button></div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </article>
  `;
}

function renderPlayground(): void {
  renderShell(`
    <section class="page-hero narrow">
      <h1>CLI Playground</h1>
      <p>A lightweight browser scratchpad for common text-processing patterns. It is intentionally small and does not run a full shell.</p>
    </section>
    <section class="content-section compact-section playground">
      <div class="tabs" role="tablist" aria-label="Command modes">
        <button class="active" type="button" data-mode="grep">grep</button>
        <button type="button" data-mode="sed">sed replace</button>
        <button type="button" data-mode="awk">awk columns</button>
        <button type="button" data-mode="jq">jq format</button>
      </div>
      <label for="command-input">Pattern or expression</label>
      <input id="command-input" class="single-input" value="status" />
      <div class="editor-grid">
        <label>Stdin<textarea id="stdin-input">server-a status=active
server-b status=inactive
server-c status=active</textarea></label>
        <label>Output<textarea id="stdout-output" readonly></textarea></label>
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
      stdout.value = `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`;
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
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1400);
    });
  });
}

function requiredElement<T extends Element = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

if (page === "home") renderHome();
if (page === "ipcalc") renderIpcalc();
if (page === "country") renderCountry();
if (page === "playground") renderPlayground();
