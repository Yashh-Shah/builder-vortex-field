import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextareaHTMLAttributes } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function AnalyzerForm() {
  const [channel, setChannel] = useState<"text"|"voice"|"video">("text");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAnalyze() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/fraud/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, content, metadata: {} }),
      }).then(r => r.json());
      setResult(res.analysis);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Manual Reporting & Instant Scan</h2>
          <div className="mb-4">
            <Label className="text-sm">Channel</Label>
            <div className="mt-2 flex gap-2">
              {(["text","voice","video"] as const).map((c) => (
                <Button key={c} type="button" variant={channel===c?"default":"outline"} onClick={() => setChannel(c)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="content" className="text-sm">Paste content or transcript</Label>
            <textarea id="content" value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Paste SMS/email text, call transcript or video transcript here…" className="mt-2 w-full h-40 rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button onClick={onAnalyze} disabled={!content || loading}>{loading ? "Analyzing…" : "Analyze"}</Button>
        </div>
        <div className="rounded-lg border p-6 bg-card">
          <h3 className="font-medium mb-3">Result</h3>
          {!result && <div className="text-sm text-foreground/60">No analysis yet.</div>}
          {result && (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${result.severity === 'high' ? 'bg-red-100 text-red-700' : result.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                <span>Severity: {result.severity}</span>
                <span>Score: {(result.score*100).toFixed(0)}%</span>
              </div>
              {result.reasons?.length > 0 && (
                <ul className="text-sm list-disc pl-5 text-foreground/80">
                  {result.reasons.map((r:string,i:number)=>(<li key={i}>{r}</li>))}
                </ul>
              )}
              {result.advice?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Advice</h4>
                  <ul className="text-sm list-disc pl-5 text-foreground/80">
                    {result.advice.map((a:string,i:number)=>(<li key={i}>{a}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
