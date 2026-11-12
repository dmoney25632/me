import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Small home-page card pointing at the /net tool. */
export function NetTeaser() {
  return (
    <div className="container-narrow pb-4">
      <Link
        href="/net"
        className="group relative block overflow-hidden rounded-2xl border border-border bg-[#0b0d0c] p-6 text-[#d4d4d8] transition-transform hover:-translate-y-0.5"
      >
        <div className="font-mono text-[12.5px] leading-relaxed">
          <p className="text-[#34d399]">$ whoami --network</p>
          <p className="text-white/45">  ip, isp, city, webrtc leaks, device fingerprint…</p>
          <p className="mt-1 text-[#34d399]">
            $ open ~/net<span className="ml-1 inline-block h-3.5 w-2 animate-pulse bg-[#34d399] align-middle" />
          </p>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            See everything your browser just told me about you and your network.
          </p>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#34d399]" />
        </div>
      </Link>
    </div>
  );
}
