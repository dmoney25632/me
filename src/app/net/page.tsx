import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { NetScan } from "@/components/net/NetScan";

export const metadata: Metadata = {
  title: "~/net",
  description: "What your browser gives away: your IP, ISP, location, WebRTC leaks, and device fingerprint.",
};

export default function NetPage() {
  return (
    <PageShell>
      <div className="container-narrow py-14 sm:py-20">
        <p className="font-mono text-xs text-accent">~/net</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Here&apos;s what you just told me<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Opening this page handed my server your IP address, your rough location, and a stack of details
          about your device. Here&apos;s all of it, so you can see what every website sees.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-subtle">
          Nothing here is saved. The ISP lookup runs from your browser against ipwho.is, the IPv4/IPv6
          check against ipify, and the WebRTC test against Google&apos;s public STUN server.
        </p>
        <div className="mt-10">
          <NetScan />
        </div>
      </div>
    </PageShell>
  );
}
