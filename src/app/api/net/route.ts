import type { NextRequest } from "next/server";

// Echoes back what the visitor's own request reveals about them.
// Nothing is stored or logged here.

export const dynamic = "force-dynamic";

const HIDDEN = new Set(["cookie", "authorization"]);

function geoHeader(req: NextRequest, name: string) {
  const v = req.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function GET(req: NextRequest) {
  const h = req.headers;
  const ip =
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  const headers: Record<string, string> = {};
  h.forEach((value, key) => {
    if (HIDDEN.has(key)) headers[key] = "(hidden)";
    // Platform-internal headers aren't something the browser sent.
    else if (!key.startsWith("x-vercel-") && !key.startsWith("x-middleware")) headers[key] = value;
  });

  const lat = geoHeader(req, "x-vercel-ip-latitude");
  const lon = geoHeader(req, "x-vercel-ip-longitude");

  return Response.json(
    {
      ip,
      ipVersion: ip ? (ip.includes(":") ? 6 : 4) : null,
      geo: {
        city: geoHeader(req, "x-vercel-ip-city"),
        region: geoHeader(req, "x-vercel-ip-country-region"),
        country: geoHeader(req, "x-vercel-ip-country"),
        postal: geoHeader(req, "x-vercel-ip-postal-code"),
        timezone: geoHeader(req, "x-vercel-ip-timezone"),
        lat: lat ? Number(lat) : null,
        lon: lon ? Number(lon) : null,
      },
      edge: h.get("x-vercel-id")?.split("::")[0] ?? null,
      protocol: h.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", ""),
      userAgent: h.get("user-agent"),
      headers,
      serverTime: Date.now(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Tiny response for latency pings.
export function HEAD() {
  return new Response(null, { headers: { "Cache-Control": "no-store" } });
}
