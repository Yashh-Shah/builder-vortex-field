import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import LiveFeed from "@/components/app/LiveFeed";
import AnalyzerForm from "@/components/app/AnalyzerForm";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ScanLine, Sparkles, BookOpen, PlayCircle } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="container py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-foreground/70">
              <ShieldAlert className="text-primary" /> Multi-Channel Digital Fraud Detection
            </div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Stop Digital Arrest Scams in Real Time
            </h1>
            <p className="mt-4 text-foreground/70 max-w-prose">
              Sentinel Guard analyzes SMS, email, voice transcripts, and video calls to detect scam patterns, deepfake indicators, and urgent coercion tactics—then alerts users instantly with clear guidance.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" className=""><ScanLine className="mr-2"/>Start Live Scan</Button>
              <a href="#learn" className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground"><PlayCircle/> Watch how it works</a>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-4 bg-card">SMS / Email NLP</div>
              <div className="rounded-lg border p-4 bg-card">Voice spoof detection</div>
              <div className="rounded-lg border p-4 bg-card">Video deepfake cues</div>
              <div className="rounded-lg border p-4 bg-card">Instant alerts</div>
            </div>
          </div>
          <div className="relative rounded-xl border bg-gradient-to-br from-indigo-50 to-sky-50 p-6">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="relative">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm font-medium">Incoming message</div>
                <p className="mt-2 text-sm">This is Inspector Arjun from the Cyber Cell... digital arrest ... verify now.</p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-red-100 text-red-700">High risk detected</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="uppercase text-foreground/60">Scam Likelihood</div>
                </div>
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">6</div>
                  <div className="uppercase text-foreground/60">Keywords</div>
                </div>
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">2</div>
                  <div className="uppercase text-foreground/60">Urgency Cues</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live feed */}
      <LiveFeed />

      {/* Analyzer */}
      <AnalyzerForm />

      {/* Resources */}
      <section id="learn" className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a className="rounded-lg border p-6 hover:shadow-sm transition" href="#">
            <BookOpen className="text-primary"/>
            <h3 className="mt-3 font-semibold">How to spot scams</h3>
            <p className="mt-1 text-sm text-foreground/70">Common phrases and tactics used by scammers.</p>
          </a>
          <a className="rounded-lg border p-6 hover:shadow-sm transition" href="#">
            <BookOpen className="text-primary"/>
            <h3 className="mt-3 font-semibold">Verify officials safely</h3>
            <p className="mt-1 text-sm text-foreground/70">Steps to confirm police/bank communication legitimacy.</p>
          </a>
          <a className="rounded-lg border p-6 hover:shadow-sm transition" href="#">
            <BookOpen className="text-primary"/>
            <h3 className="mt-3 font-semibold">Report and recover</h3>
            <p className="mt-1 text-sm text-foreground/70">Where to report incidents and protect your accounts.</p>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
