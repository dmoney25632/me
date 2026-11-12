import type { NextRequest } from "next/server";

// Random (incompressible) bytes for the download speed test on /net.

export const dynamic = "force-dynamic";

const MAX = 2 * 1024 * 1024;
const CHUNK = 65536; // getRandomValues limit per call

let pool: Uint8Array | null = null;
function randomPool() {
  if (!pool) {
    pool = new Uint8Array(MAX);
    for (let i = 0; i < MAX; i += CHUNK) crypto.getRandomValues(pool.subarray(i, i + CHUNK));
  }
  return pool;
}

export function GET(req: NextRequest) {
  const requested = Number(req.nextUrl.searchParams.get("n")) || 256 * 1024;
  const n = Math.min(Math.max(requested, 1024), MAX);
  return new Response(randomPool().slice(0, n), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(n),
      "Cache-Control": "no-store",
      "Content-Encoding": "identity",
    },
  });
}
