import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Circle, CircleAlert, MessagesSquare, Phone, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export type Channel = "text" | "voice" | "video";
interface Item {
  id: string;
  channel: Channel;
  content: string;
  metadata?: Record<string, any>;
}

interface AnalysisResult {
  label: string;
  score: number;
  severity: "low" | "medium" | "high";
  reasons: string[];
  highlights: { phrase: string; index: number }[];
  advice: string[];
}

export default function LiveFeed() {
  const [queue, setQueue] = useState<any[]>([]);
  const [events, setEvents] = useState<(Item & { analysis: AnalysisResult })[]>([]);
  const [running, setRunning] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Load samples
    Promise.all([
      fetch("/api/fraud/samples?type=text").then((r) => r.json()),
      fetch("/api/fraud/samples?type=voice").then((r) => r.json()),
      fetch("/api/fraud/samples?type=video").then((r) => r.json()),
    ]).then(([text, voice, video]) => {
      const norm = [
        ...text.map((t: any) => ({ id: t.id, channel: "text", content: t.content, metadata: { sender: t.sender, subject: t.subject, source: t.source } })),
        ...voice.map((v: any) => ({ id: v.id, channel: "voice", content: v.transcript, metadata: { callerId: v.callerId, spoofedCallerId: v.spoofedCallerId } })),
        ...video.map((vd: any) => ({ id: vd.id, channel: "video", content: vd.transcript, metadata: { deepfakeIndicators: vd.deepfakeIndicators, platform: vd.platform } })),
      ];
      setQueue(norm);
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(async () => {
      setQueue((q) => {
        if (q.length === 0) return q;
        const [next, ...rest] = q;
        analyze(next);
        return rest;
      });
      return undefined as any;
    }, 2500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running]);

  async function analyze(item: Item) {
    const res = await fetch("/api/fraud/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: item.channel, content: item.content, metadata: item.metadata }),
    }).then((r) => r.json());
    setEvents((ev) => [{ ...item, analysis: res.analysis }, ...ev].slice(0, 25));
  }

  const counts = useMemo(() => {
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const byChannel: Record<string, number> = { text: 0, voice: 0, video: 0 };
    events.forEach((e) => {
      bySeverity[e.analysis.severity]++;
      byChannel[e.channel]++;
    });
    return { bySeverity, byChannel };
  }, [events]);

  const Icon = ({ c }: { c: Channel }) => (c === "text" ? <MessagesSquare className="text-sky-500" /> : c === "voice" ? <Phone className="text-amber-500"/> : <Video className="text-violet-500"/>);

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Live Fraud Monitor</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-3">
            <span className="inline-flex items-center gap-1 text-xs"><Circle className="text-green-500"/> Safe</span>
            <span className="inline-flex items-center gap-1 text-xs"><Circle className="text-yellow-500"/> Caution</span>
            <span className="inline-flex items-center gap-1 text-xs"><Circle className="text-red-500"/> Danger</span>
          </div>
          <Button variant="outline" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Resume"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {events.map((e) => (
            <div key={e.id+e.channel+e.analysis.score} className="rounded-lg border p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon c={e.channel} />
                  <span className="text-sm uppercase text-foreground/60">{e.channel}</span>
                </div>
                <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${e.analysis.severity === 'high' ? 'bg-red-100 text-red-700' : e.analysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {e.analysis.severity === 'high' ? <AlertTriangle/> : <BadgeCheck/>}
                  <span>{e.analysis.severity}</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                {e.content}
              </p>
              {e.analysis.highlights.length > 0 && (
                <div className="mt-3 text-xs text-foreground/80">
                  <span className="font-medium">Flagged phrases:</span> {e.analysis.highlights.map(h => <code key={`${h.phrase}-${h.index}`} className="mx-1 rounded bg-secondary px-1.5 py-0.5">{h.phrase}</code>)}
                </div>
              )}
              {e.analysis.reasons.length > 0 && (
                <ul className="mt-3 text-xs list-disc pl-5 text-foreground/80">
                  {e.analysis.reasons.map((r,i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <div className="rounded-lg border p-8 text-center text-sm text-foreground/60">Waiting for events…</div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Alerts by Channel</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={Object.entries(counts.byChannel).map(([k,v]) => ({ name: k, value: v }))}>
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="value" fill="#6366f1" radius={6}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Severity</h3>
            <div className="flex gap-3">
              {(["low","medium","high"] as const).map((k) => (
                <div key={k} className="flex-1 rounded bg-secondary p-3 text-center">
                  <div className="text-2xl font-semibold">{counts.bySeverity[k]}</div>
                  <div className="text-xs uppercase text-foreground/60">{k}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Protective Advice</h3>
            <ul className="text-sm list-disc pl-5 text-foreground/80 space-y-1">
              <li>Never share OTPs or passwords.</li>
              <li>Verify caller identity via official channels.</li>
              <li>Avoid clicking shortened or suspicious links.</li>
              <li>Report incidents to official cybercrime portals.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
