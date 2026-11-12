import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { Future42 } from "@/components/Future42";
import { Writing } from "@/components/Writing";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Education } from "@/components/Education";
import { NetTeaser } from "@/components/net/NetTeaser";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <Future42 />
      <Writing />
      <Projects />
      <Experience />
      <Education />
      <NetTeaser />
      <Contact />
    </PageShell>
  );
}
