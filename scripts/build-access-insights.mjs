#!/usr/bin/env node
import { createReadStream } from "node:fs";
import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";

const MONTHS = new Map([
  ["Jan", "01"],
  ["Feb", "02"],
  ["Mar", "03"],
  ["Apr", "04"],
  ["May", "05"],
  ["Jun", "06"],
  ["Jul", "07"],
  ["Aug", "08"],
  ["Sep", "09"],
  ["Oct", "10"],
  ["Nov", "11"],
  ["Dec", "12"],
]);

const DEFAULT_LOGS = ["/var/log/nginx/access.log", "/var/log/nginx/access.log.1"];
const DEFAULT_PERIODS = ["24h", "7d", "14d", "1m", "3m", "6m", "1y", "all"];
const COMBINED_LOG_RE = /^(\S+) \S+ \S+ \[([^\]]+)] "([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"(?: .*)?$/;

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const now = args.now ? new Date(args.now) : new Date();
if (Number.isNaN(now.getTime())) {
  throw new Error(`Invalid --now value: ${args.now}`);
}

const periodSpecs = resolvePeriodSpecs(args);
const topN = numberArg(args.top, 8);
const geoipLimit = numberArg(args.geoipLimit, 200);
const logPaths = args.logs.length > 0 ? args.logs : DEFAULT_LOGS;
const parsedByPeriod = await readLogs(logPaths, periodSpecs, now);
const periodDocuments = [];
for (const period of periodSpecs) {
  const parsed = parsedByPeriod.get(period.id) ?? createEmptyAggregate();
  const geo = await enrichGeo(parsed.ipCounts, parsed.totalRequests, args.geoipEndpoint, geoipLimit, topN);
  periodDocuments.push(buildPeriodDocument(parsed, geo, now, period, topN, logPaths));
}
const document = buildDocument(periodDocuments, now, logPaths);
const json = `${JSON.stringify(document, null, 2)}\n`;

if (args.output) {
  await writeJsonAtomic(args.output, json);
} else {
  process.stdout.write(json);
}

function parseArgs(argv) {
  const parsedArgs = {
    geoipEndpoint: "",
    geoipLimit: "",
    help: false,
    hours: "",
    logs: [],
    now: "",
    output: "",
    periods: "",
    top: "",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1] ?? "";
    if (arg === "--help" || arg === "-h") {
      parsedArgs.help = true;
      continue;
    }
    if (arg === "--logs" || arg === "--log") {
      parsedArgs.logs.push(...splitList(next));
      index += 1;
      continue;
    }
    if (arg === "--output" || arg === "-o") {
      parsedArgs.output = next;
      index += 1;
      continue;
    }
    if (arg === "--hours") {
      parsedArgs.hours = next;
      index += 1;
      continue;
    }
    if (arg === "--periods") {
      parsedArgs.periods = next;
      index += 1;
      continue;
    }
    if (arg === "--top") {
      parsedArgs.top = next;
      index += 1;
      continue;
    }
    if (arg === "--geoip-endpoint") {
      parsedArgs.geoipEndpoint = next;
      index += 1;
      continue;
    }
    if (arg === "--geoip-limit") {
      parsedArgs.geoipLimit = next;
      index += 1;
      continue;
    }
    if (arg === "--now") {
      parsedArgs.now = next;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return parsedArgs;
}

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberArg(value, fallback) {
  if (!value) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return number;
}

function resolvePeriodSpecs(parsedArgs) {
  const tokens = parsedArgs.periods ? splitList(parsedArgs.periods) : parsedArgs.hours ? [`${parsedArgs.hours}h`] : DEFAULT_PERIODS;
  const specs = tokens.map(parsePeriodSpec).filter(Boolean);
  if (specs.length === 0) return [parsePeriodSpec("24h")];
  const seen = new Set();
  return specs.filter((spec) => {
    if (seen.has(spec.id)) return false;
    seen.add(spec.id);
    return true;
  });
}

function parsePeriodSpec(value) {
  const trimmed = String(value).trim().toLowerCase();
  if (trimmed === "all") {
    return {
      id: "all",
      label: "all",
      hours: 24 * 365 * 100,
      description: "All available access-log input supplied to this run.",
      since: new Date(0),
      isAll: true,
    };
  }
  const match = /^(\d+)(h|d|m|y)?$/.exec(trimmed);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2] ?? "h";
  const hours = periodHours(amount, unit);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  const id = `${amount}${unit}`;
  return {
    id,
    label: id,
    hours,
    description: periodDescription(amount, unit),
    since: periodSince(amount, unit),
  };
}

function periodHours(amount, unit) {
  if (unit === "h") return amount;
  if (unit === "d") return amount * 24;
  if (unit === "m") return amount * 30 * 24;
  if (unit === "y") return amount * 365 * 24;
  return amount;
}

function periodSince(amount, unit) {
  if (unit === "m") return subtractCalendar({ months: amount });
  if (unit === "y") return subtractCalendar({ years: amount });
  return new Date(now.getTime() - periodHours(amount, unit) * 60 * 60 * 1000);
}

function subtractCalendar({ months = 0, years = 0 }) {
  const date = new Date(now);
  date.setUTCFullYear(date.getUTCFullYear() - years);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

function periodDescription(amount, unit) {
  if (unit === "h") return `Last ${amount} hours, generated from access-log input.`;
  if (unit === "d") return `Last ${amount} days, generated from access-log input.`;
  if (unit === "m") return `Last ${amount} month${amount === 1 ? "" : "s"}, generated from access-log input.`;
  if (unit === "y") return `Last ${amount} year${amount === 1 ? "" : "s"}, generated from access-log input.`;
  return `Last ${amount} hours, generated from access-log input.`;
}

function createEmptyAggregate() {
  return {
    totalRequests: 0,
    uniqueVisitors: new Set(),
    ipCounts: new Map(),
    endpoints: new Map(),
    statusCodes: new Map(),
    userAgents: new Map(),
    hourlyRequests: new Map(),
    firstSeen: null,
    lastSeen: null,
  };
}

async function readLogs(paths, periods, untilDate) {
  const resultByPeriod = new Map(periods.map((period) => [period.id, createEmptyAggregate()]));
  const earliestSince = new Date(Math.min(...periods.map((period) => period.since.getTime())));

  for (const path of paths) {
    if (!(await isReadableFile(path))) continue;
    const stream = path.endsWith(".gz") ? createReadStream(path).pipe(createGunzip()) : createReadStream(path);
    const lines = createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of lines) {
      const record = parseAccessLogLine(line);
      if (!record || record.date < earliestSince || record.date > untilDate) continue;
      for (const period of periods) {
        if (record.date >= period.since) {
          const aggregate = resultByPeriod.get(period.id);
          if (aggregate) addRecord(aggregate, record, period.hours);
        }
      }
    }
  }

  return resultByPeriod;
}

function addRecord(aggregate, record, windowHours) {
  aggregate.totalRequests += 1;
  aggregate.uniqueVisitors.add(record.ip);
  increment(aggregate.ipCounts, record.ip);
  increment(aggregate.endpoints, normalizeEndpoint(record.target));
  increment(aggregate.statusCodes, record.status);
  increment(aggregate.userAgents, classifyUserAgent(record.userAgent));
  const timeKey = windowHours > 48 ? record.dayKey : record.hourKey;
  increment(aggregate.hourlyRequests, timeKey);
  if (!aggregate.firstSeen || record.date < aggregate.firstSeen) aggregate.firstSeen = record.date;
  if (!aggregate.lastSeen || record.date > aggregate.lastSeen) aggregate.lastSeen = record.date;
}

async function isReadableFile(path) {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

function parseAccessLogLine(line) {
  const match = COMBINED_LOG_RE.exec(line);
  if (!match) return null;
  const [, ip, timeText, requestText, status, , , userAgent] = match;
  const parsedTime = parseNginxTime(timeText);
  if (!parsedTime) return null;
  const requestMatch = /^(\S+)\s+(\S+)(?:\s+HTTP\/[0-9.]+)?$/.exec(requestText);
  return {
    ip,
    date: parsedTime.date,
    hourKey: parsedTime.hourKey,
    dayKey: parsedTime.dayKey,
    method: requestMatch?.[1] ?? "",
    target: requestMatch?.[2] ?? "",
    status,
    userAgent,
  };
}

function parseNginxTime(value) {
  const match = /^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, monthName, year, hour, minute, second, zone] = match;
  const month = MONTHS.get(monthName);
  if (!month) return null;
  const offset = `${zone.slice(0, 3)}:${zone.slice(3)}`;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date,
    hourKey: `${year}-${month}-${day}T${hour}:00:00${offset}`,
    dayKey: `${year}-${month}-${day}T00:00:00${offset}`,
  };
}

function normalizeEndpoint(target) {
  if (!target || target === "-") return "(empty request target)";
  try {
    const url = new URL(target, "https://inet-ip.info");
    return url.pathname || "/";
  } catch {
    return target.split("?")[0] || target;
  }
}

function classifyUserAgent(value) {
  const ua = value.toLowerCase();
  if (ua.includes("curl") || ua.includes("wget") || ua.includes("httpie")) return "curl/wget";
  if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) return "Search crawler";
  if (ua.includes("prometheus") || ua.includes("uptime") || ua.includes("monitor")) return "Monitoring";
  if (ua.includes("mozilla")) return "Browser";
  if (value === "-" || value.trim() === "") return "Unknown";
  return "Other automation";
}

async function enrichGeo(ipCounts, totalRequests, endpoint, limit, topN) {
  const countries = new Map();
  const locations = new Map();
  const asns = new Map();
  let enrichedRequests = 0;

  if (!endpoint) {
    return { countries: [], locations: [], asns: [], enrichedRequests: 0 };
  }

  const topIps = [...ipCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  for (const [ip, requests] of topIps) {
    const info = await queryGeoip(endpoint, ip);
    if (!info) continue;
    enrichedRequests += requests;

    const countryCode = info.city?.Country?.IsoCode || info.city?.RegisteredCountry?.IsoCode || "ZZ";
    const countryName = nameFromMap(info.city?.Country?.Names) || nameFromMap(info.city?.RegisteredCountry?.Names) || "Unknown";
    incrementAggregate(countries, countryCode, requests, { code: countryCode, name: countryName });

    const latitude = info.city?.Location?.Latitude;
    const longitude = info.city?.Location?.Longitude;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const city = nameFromMap(info.city?.City?.Names);
      const subdivision = nameFromMap(info.city?.Subdivisions?.[0]?.Names);
      const label = [city || subdivision || countryName, countryCode].filter(Boolean).join(", ");
      const key = `${label}|${countryCode}|${Number(latitude).toFixed(3)}|${Number(longitude).toFixed(3)}`;
      incrementAggregate(locations, key, requests, {
        label,
        countryCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
    }

    const asn = info.asn?.AutonomousSystemNumber;
    const organization = info.asn?.AutonomousSystemOrganization;
    if (asn || organization) {
      const label = [asn ? `AS${asn}` : "", organization].filter(Boolean).join(" ");
      incrementAggregate(asns, label, requests, { label });
    }
  }

  if (totalRequests > enrichedRequests) {
    const unknownRequests = totalRequests - enrichedRequests;
    incrementAggregate(countries, "ZZ", unknownRequests, { code: "ZZ", name: "Unknown" });
  }

  return {
    countries: ranked(countries, topN, totalRequests),
    locations: ranked(locations, topN, totalRequests),
    asns: ranked(asns, topN, totalRequests),
    enrichedRequests,
  };
}

async function queryGeoip(endpoint, ip) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ip }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function nameFromMap(names) {
  if (!names || typeof names !== "object") return "";
  return names.en || names.ja || Object.values(names).find((value) => typeof value === "string") || "";
}

function buildDocument(periodDocuments, generatedAt, logPaths) {
  const fallbackPeriod = parsePeriodSpec("24h");
  const defaultPeriodCandidate = periodDocuments.find((period) => period.id === "all") ?? periodDocuments[0];
  const defaultPeriod =
    defaultPeriodCandidate ??
    buildPeriodDocument(
      createEmptyAggregate(),
      { countries: [], locations: [], asns: [], enrichedRequests: 0 },
      generatedAt,
      fallbackPeriod,
      8,
      logPaths,
    );
  return {
    ...defaultPeriod,
    sample: false,
    generatedAt: generatedAt.toISOString(),
    source: logPaths.map((path) => basename(path)).join(", "),
    defaultPeriod: defaultPeriod.id,
    periods: periodDocuments,
  };
}

function buildPeriodDocument(parsed, geo, generatedAt, period, topN, logPaths) {
  const topStatusCodes = rankedSimple(parsed.statusCodes, topN);
  const successfulRequests = [...parsed.statusCodes.entries()]
    .filter(([code]) => code.startsWith("2") || code.startsWith("3"))
    .reduce((sum, [, requests]) => sum + requests, 0);
  const hourlyRequests = [...parsed.hourlyRequests.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, requests]) => ({ hour, requests }));
  const peakHourRequests = hourlyRequests.reduce((max, item) => Math.max(max, item.requests), 0);
  const totalRequests = parsed.totalRequests;
  const notes = buildPeriodNotes(parsed, geo, period, totalRequests);

  return {
    id: period.id,
    label: period.label,
    description: period.description,
    generatedAt: generatedAt.toISOString(),
    windowHours: period.hours,
    source: logPaths.map((path) => basename(path)).join(", "),
    summary: {
      totalRequests,
      uniqueVisitors: parsed.uniqueVisitors.size,
      peakHourRequests,
      successRate: totalRequests === 0 ? 0 : round1((successfulRequests / totalRequests) * 100),
    },
    topCountries: geo.countries,
    topLocations: geo.locations,
    topAsns: geo.asns,
    topEndpoints: rankedLabels(parsed.endpoints, topN, totalRequests),
    statusCodes: topStatusCodes,
    userAgents: rankedLabels(parsed.userAgents, topN, totalRequests),
    hourlyRequests,
    notes,
  };
}

function buildPeriodNotes(parsed, geo, period, totalRequests) {
  const notes = [
    "Visitor IP addresses are aggregated in memory and are not written to this public JSON.",
    "Endpoint labels strip query strings before counting to avoid publishing tokens or identifiers.",
  ];
  if (period.isAll) {
    notes.push("The all period covers all access-log inputs supplied to this run.");
  } else if (totalRequests > 0 && parsed.firstSeen && parsed.firstSeen > period.since) {
    notes.push(`Input logs for ${period.label} start at ${parsed.firstSeen.toISOString()}; older traffic is not included in this run.`);
  }
  notes.push(
    geo.enrichedRequests > 0
      ? `GeoIP enrichment covered ${geo.enrichedRequests} of ${totalRequests} requests from the top visitor IPs.`
      : "GeoIP enrichment is disabled or unavailable; country, location and ASN sections may be empty.",
  );
  return notes;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function incrementAggregate(map, key, requests, base) {
  const current = map.get(key) ?? { ...base, requests: 0 };
  current.requests += requests;
  map.set(key, current);
}

function ranked(map, limit, totalRequests) {
  return [...map.values()]
    .sort((a, b) => b.requests - a.requests)
    .slice(0, limit)
    .map((item) => ({ ...item, share: totalRequests === 0 ? 0 : round1((item.requests / totalRequests) * 100) }));
}

function rankedLabels(map, limit, totalRequests) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, requests]) => ({
      label,
      requests,
      share: totalRequests === 0 ? 0 : round1((requests / totalRequests) * 100),
    }));
}

function rankedSimple(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([code, requests]) => ({ code, requests }));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

async function writeJsonAtomic(output, contents) {
  await mkdir(dirname(output), { recursive: true });
  const tmp = `${output}.${process.pid}.tmp`;
  await writeFile(tmp, contents, { mode: 0o644 });
  await rename(tmp, output);
}

function printHelp() {
  process.stdout.write(`Usage:
  node scripts/build-access-insights.mjs --logs /var/log/nginx/access.log,/var/log/nginx/access.log.1 \\
    --periods 24h,7d,14d,1m,3m,6m,1y,all \\
    --geoip-endpoint http://127.0.0.1:8880/json \\
    --output /var/lib/inet-ip-info/access-insights.json

Options:
  --logs <paths>           Comma-separated nginx access log paths. .gz files are supported.
  --periods <list>         Time windows to include, for example 24h,7d,14d,1m,3m,6m,1y,all.
                           Default: 24h,7d,14d,1m,3m,6m,1y,all.
  --hours <number>         Legacy single-window shorthand, equivalent to --periods <number>h.
  --geoip-endpoint <url>   Optional inet-ip.info /json-compatible endpoint for GeoIP/ASN enrichment.
  --geoip-limit <number>   Number of top visitor IPs to enrich. Default: 200.
  --top <number>           Number of rows per ranking. Default: 8.
  --output <path>          Output JSON path. If omitted, JSON is written to stdout.
  --now <iso>              Override current time for repeatable tests.
`);
}
