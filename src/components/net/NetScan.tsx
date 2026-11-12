"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, RotateCw } from "lucide-react";

/* ---------- types ---------- */

interface Echo {
  ip: string | null;
  ipVersion: 4 | 6 | null;
  geo: {
    city: string | null;
    region: string | null;
    country: string | null;
    postal: string | null;
    timezone: string | null;
    lat: number | null;
    lon: number | null;
  };
  edge: string | null;
  protocol: string;
  userAgent: string | null;
  headers: Record<string, string>;
  serverTime: number;
}

interface Lookup {
  ip: string;
  isp: string | null;
  org: string | null;
  asn: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  source: string;
}

interface Candidate {
  address: string;
  type: string;
  protocol: string;
}

interface Device {
  ua: string;
  platform: string;
  cores: number | null;
  memory: number | null;
  screen: string;
  dpr: number;
  colorDepth: number;
  gpu: string | null;
  languages: string;
  timezone: string;
  dnt: boolean;
  gpc: boolean;
  cookies: boolean;
  touch: number;
  connection: string | null;
  fingerprint: string;
}

interface Results {
  echo?: Echo;
  lookup?: Lookup | null;
  ping?: { min: number; avg: number; jitter: number } | null;
  speed?: number | null;
  v4?: string | null;
  v6?: string | null;
  rtc?: Candidate[] | null;
  device?: Device;
}

type Tone = "cmd" | "ok" | "warn" | "dim";
interface Line {
  text: string;
  tone: Tone;
}

/* ---------- probes ---------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJSON<T>(url: string, ms = 4000): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(ms) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function lookupIsp(): Promise<Lookup | null> {
  type IpWho = {
    success: boolean;
    ip: string;
    city?: string;
    region?: string;
    country?: string;
    connection?: { asn?: number; org?: string; isp?: string };
    timezone?: { id?: string };
  };
  const a = await getJSON<IpWho>("https://ipwho.is/");
  if (a?.success) {
    return {
      ip: a.ip,
      isp: a.connection?.isp ?? null,
      org: a.connection?.org ?? null,
      asn: a.connection?.asn ? `AS${a.connection.asn}` : null,
      city: a.city ?? null,
      region: a.region ?? null,
      country: a.country ?? null,
      timezone: a.timezone?.id ?? null,
      source: "ipwho.is",
    };
  }
  type IpApi = { ip: string; city?: string; region?: string; country_name?: string; org?: string; asn?: string; timezone?: string; error?: boolean };
  const b = await getJSON<IpApi>("https://ipapi.co/json/");
  if (b && !b.error) {
    return {
      ip: b.ip,
      isp: b.org ?? null,
      org: b.org ?? null,
      asn: b.asn ?? null,
      city: b.city ?? null,
      region: b.region ?? null,
      country: b.country_name ?? null,
      timezone: b.timezone ?? null,
      source: "ipapi.co",
    };
  }
  return null;
}

async function measurePing(n = 7) {
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    try {
      await fetch(`/api/net?p=${i}`, { method: "HEAD", cache: "no-store" });
    } catch {
      return null;
    }
    times.push(performance.now() - t0);
  }
  const s = times.slice(1); // first one warms up the connection
  const avg = s.reduce((a, b) => a + b, 0) / s.length;
  const jitter = s.slice(1).reduce((a, t, i) => a + Math.abs(t - s[i]), 0) / (s.length - 1);
  return { min: Math.min(...s), avg, jitter };
}

async function measureSpeed() {
  try {
    await fetch("/api/net/bytes?n=131072", { cache: "no-store" }); // warm-up
    let best = 0;
    for (let i = 0; i < 2; i++) {
      const t0 = performance.now();
      const res = await fetch(`/api/net/bytes?n=2097152&r=${i}`, { cache: "no-store" });
      const buf = await res.arrayBuffer();
      const secs = (performance.now() - t0) / 1000;
      best = Math.max(best, (buf.byteLength * 8) / secs / 1e6);
    }
    return best;
  } catch {
    return null;
  }
}

async function gatherRtc(): Promise<Candidate[] | null> {
  if (typeof RTCPeerConnection === "undefined") return null;
  const found = new Map<string, Candidate>();
  let pc: RTCPeerConnection | null = null;
  try {
    pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.createDataChannel("probe");
    const done = new Promise<void>((resolve) => {
      pc!.onicecandidate = (e) => {
        if (!e.candidate) return resolve();
        // candidate:<foundation> <component> <protocol> <priority> <address> <port> typ <type> ...
        const parts = e.candidate.candidate.split(" ");
        const address = parts[4];
        const type = parts[7];
        if (address && type) found.set(`${type}:${address}`, { address, type, protocol: parts[2] });
      };
      setTimeout(resolve, 3500);
    });
    await pc.setLocalDescription(await pc.createOffer());
    await done;
    return [...found.values()];
  } catch {
    return null;
  } finally {
    pc?.close();
  }
}

function gpuName(): string | null {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") ?? c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return String(name)
      .replace(/^ANGLE \((.*)\)$/, "$1")
      .replace(/^.*Renderer: /, "")
      .replace(/,? (Unspecified Version|Direct3D.*|OpenGL.*)$/, "");
  } catch {
    return null;
  }
}

function canvasPrint() {
  try {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 40;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("dayton.runyan ~/net 🛰", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("dayton.runyan ~/net 🛰", 4, 17);
    return c.toDataURL();
  } catch {
    return "";
  }
}

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function readDevice(): Promise<Device> {
  type Nav = Navigator & {
    deviceMemory?: number;
    globalPrivacyControl?: boolean;
    userAgentData?: { platform?: string };
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; type?: string };
  };
  const n = navigator as Nav;
  const conn = n.connection;
  const d = {
    ua: n.userAgent,
    platform: n.userAgentData?.platform || n.platform || "unknown",
    cores: n.hardwareConcurrency ?? null,
    memory: n.deviceMemory ?? null,
    screen: `${screen.width}×${screen.height}`,
    dpr: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    gpu: gpuName(),
    languages: (n.languages ?? [n.language]).join(", "),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dnt: n.doNotTrack === "1",
    gpc: Boolean(n.globalPrivacyControl),
    cookies: n.cookieEnabled,
    touch: n.maxTouchPoints ?? 0,
    connection: conn
      ? [conn.type, conn.effectiveType, conn.downlink != null && `~${conn.downlink} Mbps`, conn.rtt != null && `${conn.rtt} ms rtt`]
          .filter(Boolean)
          .join(" · ")
      : null,
  };
  const fingerprint = (await sha(JSON.stringify(d) + canvasPrint())).slice(0, 16);
  return { ...d, fingerprint };
}

/* ---------- helpers ---------- */

const PRIVATE_V4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;
const isV6 = (ip: string) => ip.includes(":");

function place(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(", ") || null;
}

function flag(country?: string | null) {
  if (!country || country.length !== 2) return "";
  return String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

/* ---------- UI bits ---------- */

function Card({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-accent">{title}</h2>
        {tag && <span className="font-mono text-[10px] text-subtle">{tag}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ k, v, mono = true }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <dt className="shrink-0 text-sm text-muted">{k}</dt>
      <dd className={`min-w-0 break-words text-right text-sm ${mono ? "font-mono" : ""}`}>
        {v ?? <span className="text-subtle">—</span>}
      </dd>
    </div>
  );
}

function Pending() {
  return <span className="inline-block h-3 w-16 animate-pulse rounded bg-border align-middle" />;
}

function Signal({ tone, children }: { tone: "ok" | "warn" | "info"; children: ReactNode }) {
  const color = tone === "ok" ? "bg-accent" : tone === "warn" ? "bg-amber-500" : "bg-sky-500";
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-muted">
      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      <span>{children}</span>
    </li>
  );
}

/* ---------- main ---------- */

export function NetScan() {
  const [lines, setLines] = useState<Line[]>([]);
  const [r, setR] = useState<Results>({});
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);

  const run = async () => {
    const id = ++runId.current;
    const live = () => runId.current === id;
    const log = async (text: string, tone: Tone = "dim") => {
      if (!live()) return;
      setLines((l) => [...l, { text, tone }]);
      await wait(70);
    };
    const set = (patch: Partial<Results>) => live() && setR((prev) => ({ ...prev, ...patch }));

    setRunning(true);
    setLines([]);
    setR({});

    await log("$ whoami --network", "cmd");
    const echo = await getJSON<Echo>("/api/net");
    if (echo) {
      set({ echo });
      await log(`  ip: ${echo.ip ?? "unknown"}  (IPv${echo.ipVersion ?? "?"})`, "ok");
      if (echo.edge) await log(`  served from edge: ${echo.edge}`);
    } else await log("  couldn't reach /api/net", "warn");

    await log("$ lookup --isp --asn", "cmd");
    const lookup = await lookupIsp();
    set({ lookup });
    if (lookup) await log(`  ${lookup.isp ?? lookup.org ?? "unknown ISP"} ${lookup.asn ?? ""}`.trimEnd(), "ok");
    else await log("  lookup blocked (ad blocker?) — skipping", "warn");

    await log("$ probe --ipv4 --ipv6", "cmd");
    const [v4, v6] = await Promise.all([
      getJSON<{ ip: string }>("https://api4.ipify.org?format=json", 3500),
      getJSON<{ ip: string }>("https://api6.ipify.org?format=json", 3500),
    ]);
    set({ v4: v4?.ip ?? null, v6: v6?.ip ?? null });
    await log(`  ipv4 ${v4 ? "✓" : "✗"}   ipv6 ${v6 ? "✓" : "✗"}`, v6 ? "ok" : "dim");

    await log("$ ping -c 6 dayton.runyan", "cmd");
    const ping = await measurePing();
    set({ ping });
    if (ping) await log(`  min ${ping.min.toFixed(0)}ms  avg ${ping.avg.toFixed(0)}ms  jitter ${ping.jitter.toFixed(1)}ms`, "ok");

    await log("$ speedtest --down 4MB", "cmd");
    const speed = await measureSpeed();
    set({ speed });
    await log(speed ? `  ↓ ${speed.toFixed(1)} Mbps (to this server)` : "  failed", speed ? "ok" : "warn");

    await log("$ webrtc --ice-candidates", "cmd");
    const rtc = await gatherRtc();
    set({ rtc });
    await log(rtc ? `  ${rtc.length} candidate${rtc.length === 1 ? "" : "s"} gathered` : "  WebRTC disabled", rtc ? "ok" : "warn");

    await log("$ fingerprint --device", "cmd");
    const device = await readDevice();
    set({ device });
    await log(`  id ${device.fingerprint}`, "ok");

    await log("done. scroll down ↓", "cmd");
    if (live()) setRunning(false);
  };

  useEffect(() => {
    const t = setTimeout(run, 250);
    return () => {
      clearTimeout(t);
      // Cancels any in-flight scan (intentionally reads the latest value).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      runId.current++;
    };
  }, []);

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [lines]);

  const { echo, lookup, device } = r;
  const ip = lookup?.ip ?? echo?.ip ?? null;
  // In local dev the echo IP is ::1 / 127.0.0.1 — prefer the public lookup then.
  const echoIsLocal = !echo?.ip || /^(::1|127\.|::ffff:127\.)/.test(echo.ip);
  const shownIp = echoIsLocal ? ip : echo!.ip;
  const city = place([echo?.geo.city ?? lookup?.city, echo?.geo.region ?? lookup?.region]);
  const country = echo?.geo.country ?? lookup?.country ?? null;
  const ipTz = echo?.geo.timezone ?? lookup?.timezone ?? null;

  const rtcPublic = r.rtc?.filter((c) => c.type === "srflx").map((c) => c.address) ?? [];
  const rtcLocal = r.rtc?.filter((c) => c.type === "host").map((c) => c.address) ?? [];
  const localIps = [...new Set(rtcLocal.filter((a) => !a.endsWith(".local")))];
  const mdnsHidden = rtcLocal.some((a) => a.endsWith(".local"));
  const httpIps = [echoIsLocal ? null : echo?.ip, lookup?.ip, r.v4, r.v6].filter(Boolean) as string[];
  const rtcLeak = rtcPublic.filter((a) => !httpIps.includes(a) && httpIps.some((h) => isV6(h) === isV6(a)));
  const privateV4 = localIps.find((a) => PRIVATE_V4.test(a));
  const gateway = privateV4 ? privateV4.replace(/\.\d+$/, ".1") : null;

  const copyIp = async () => {
    if (!shownIp) return;
    try {
      await navigator.clipboard.writeText(shownIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* terminal */}
      <div className="overflow-hidden rounded-2xl border border-border bg-[#0b0d0c] text-[#d4d4d8] shadow-xl shadow-black/10">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-white/40">visitor@dayton.runyan: ~/net</span>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <RotateCw className={`h-3 w-3 ${running ? "animate-spin" : ""}`} />
            rerun
          </button>
        </div>
        <div ref={termRef} className="h-56 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed" aria-live="polite">
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.tone === "cmd"
                  ? "mt-1 text-[#34d399] first:mt-0"
                  : l.tone === "ok"
                    ? "text-white/85"
                    : l.tone === "warn"
                      ? "text-amber-300"
                      : "text-white/45"
              }
            >
              {l.text}
            </div>
          ))}
          {running && <span className="inline-block h-3.5 w-2 animate-pulse bg-[#34d399] align-middle" />}
        </div>
      </div>

      {/* identity */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-6">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Your public IP</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="min-w-0 break-all font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
              {shownIp ?? <Pending />}
            </p>
            {shownIp && (
              <button
                type="button"
                onClick={copyIp}
                aria-label="Copy IP"
                className="shrink-0 rounded-lg border border-border p-2 text-muted transition-colors hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          <p className="mt-2 text-muted">
            {city || country ? (
              <>
                {flag(echo?.geo.country)} {place([city, country])}
                {(lookup?.isp || lookup?.org) && <> · via {lookup.isp ?? lookup.org}</>}
              </>
            ) : running ? (
              <Pending />
            ) : (
              "Location unknown"
            )}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-subtle">
            Every site you visit sees this. It&apos;s how the internet knows where to send the page back — and
            it&apos;s usually enough to place you within a city.
          </p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Connection" tag={echo?.protocol ? `${echo.protocol}` : undefined}>
          <dl>
            <Row k="ISP" v={lookup ? (lookup.isp ?? lookup.org) : lookup === null ? null : <Pending />} mono={false} />
            <Row k="ASN" v={lookup ? lookup.asn : lookup === null ? null : <Pending />} />
            <Row k="IPv4" v={r.v4 === undefined ? <Pending /> : r.v4} />
            <Row k="IPv6" v={r.v6 === undefined ? <Pending /> : (r.v6 ?? "not available")} />
            <Row k="Latency" v={r.ping === undefined ? <Pending /> : r.ping && `${r.ping.avg.toFixed(0)} ms`} />
            <Row k="Jitter" v={r.ping === undefined ? <Pending /> : r.ping && `${r.ping.jitter.toFixed(1)} ms`} />
            <Row k="Download" v={r.speed === undefined ? <Pending /> : r.speed && `${r.speed.toFixed(1)} Mbps`} />
            {device?.connection && <Row k="Browser says" v={device.connection} />}
          </dl>
        </Card>

        <Card title="Location" tag={lookup?.source ? `geo · ${echo?.geo.city ? "edge" : lookup.source}` : undefined}>
          <dl>
            <Row k="City" v={echo?.geo.city ?? lookup?.city ?? (running ? <Pending /> : null)} mono={false} />
            <Row k="Region" v={echo?.geo.region ?? lookup?.region ?? null} mono={false} />
            <Row k="Country" v={country} mono={false} />
            {echo?.geo.postal && <Row k="Postal" v={echo.geo.postal} />}
            {echo?.geo.lat != null && echo.geo.lon != null && (
              <Row
                k="Coords"
                v={
                  <a
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${echo.geo.lat}&mlon=${echo.geo.lon}#map=11/${echo.geo.lat}/${echo.geo.lon}`}
                  >
                    {echo.geo.lat.toFixed(3)}, {echo.geo.lon.toFixed(3)}
                  </a>
                }
              />
            )}
            <Row k="IP timezone" v={ipTz} />
            <Row k="Your clock" v={device?.timezone ?? <Pending />} />
          </dl>
        </Card>
      </div>

      <Card title="Home network" tag="webrtc · ice">
        <ul className="space-y-2.5">
          {r.rtc === undefined ? (
            <Signal tone="info">Asking your browser for its network candidates…</Signal>
          ) : r.rtc === null ? (
            <Signal tone="ok">WebRTC is off in this browser, so it can&apos;t leak anything about your local network.</Signal>
          ) : (
            <>
              {localIps.length > 0 ? (
                <Signal tone="warn">
                  Your browser handed over your <b className="text-foreground">local IP</b>:{" "}
                  <code className="font-mono text-foreground">{localIps.join(", ")}</code>
                  {gateway && (
                    <>
                      . Your router is probably at <code className="font-mono text-foreground">{gateway}</code>
                    </>
                  )}
                  .
                </Signal>
              ) : mdnsHidden ? (
                <Signal tone="ok">
                  Your local IP is masked behind a random <code className="font-mono">.local</code> name (mDNS). Nice
                  — sites can&apos;t see your address inside your home network.
                </Signal>
              ) : (
                <Signal tone="ok">No local addresses exposed.</Signal>
              )}
              {rtcPublic.length > 0 && (
                <Signal tone={rtcLeak.length ? "warn" : "info"}>
                  STUN sees you as <code className="font-mono text-foreground">{rtcPublic.join(", ")}</code>
                  {rtcLeak.length ? (
                    <>
                      {" "}
                      — <b className="text-foreground">that&apos;s different from your HTTP IP.</b> If you&apos;re on a
                      VPN, it may be leaking your real address through WebRTC.
                    </>
                  ) : (
                    <> — matches your public IP, no WebRTC leak.</>
                  )}
                </Signal>
              )}
              {ipTz && device && ipTz !== device.timezone && (
                <Signal tone="info">
                  Your clock says <b className="text-foreground">{device.timezone}</b> but your IP says{" "}
                  <b className="text-foreground">{ipTz}</b>. VPN, travel, or a far-away ISP gateway?
                </Signal>
              )}
              <Signal tone="info">
                What I <i>can&apos;t</i> see: the other devices on your Wi-Fi, open ports, or your router. Browsers
                block pages from scanning your local network — which is exactly what you want.
              </Signal>
            </>
          )}
        </ul>
      </Card>

      <Card title="Your device" tag={device ? `fingerprint ${device.fingerprint}` : undefined}>
        {device ? (
          <>
            <dl className="grid gap-x-8 md:grid-cols-2">
              <div>
                <Row k="Platform" v={device.platform} />
                <Row k="CPU cores" v={device.cores} />
                <Row k="Memory" v={device.memory ? `≥ ${device.memory} GB` : null} />
                <Row k="GPU" v={device.gpu} />
                <Row k="Screen" v={`${device.screen} @${device.dpr}x`} />
                <Row k="Color depth" v={`${device.colorDepth}-bit`} />
              </div>
              <div>
                <Row k="Languages" v={device.languages} />
                <Row k="Touch points" v={device.touch} />
                <Row k="Cookies" v={device.cookies ? "on" : "off"} />
                <Row k="Do Not Track" v={device.dnt ? "on" : "off"} />
                <Row k="Global Privacy Control" v={device.gpc ? "on" : "off"} />
                <Row k="Fingerprint" v={<span className="text-accent">{device.fingerprint}</span>} />
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-subtle">
              The fingerprint is a hash of everything above plus how your GPU draws a bit of text. No cookies
              needed — it tends to stay the same across visits, which is how ad networks recognize you.
            </p>
          </>
        ) : (
          <Pending />
        )}
      </Card>

      {echo && (
        <Card title="Request headers" tag={`${Object.keys(echo.headers).length} sent`}>
          <button
            type="button"
            onClick={() => setShowHeaders((s) => !s)}
            className="font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            {showHeaders ? "− hide" : "+ show"} what your browser sent with this request
          </button>
          {showHeaders && (
            <pre className="mt-4 overflow-x-auto rounded-xl bg-background p-4 font-mono text-[11.5px] leading-relaxed text-muted">
              {Object.entries(echo.headers)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => (
                  <div key={k} className="whitespace-pre-wrap break-all">
                    <span className="text-accent">{k}</span>: {v}
                  </div>
                ))}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}
