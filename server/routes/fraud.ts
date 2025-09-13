import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

// Load JSON datasets
function loadJSON(file: string) {
  const p = path.resolve(process.cwd(), file);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw);
}

const KEYWORDS = [
  "digital arrest",
  "arrest warrant",
  "immediate payment",
  "escrow",
  "verify now",
  "kyc now",
  "suspended",
  "threat",
  "legal action",
  "pan is flagged",
  "compromised",
  "refund deposit",
  "cyber cell",
  "law enforcement",
];

const URGENCY_WORDS = [
  "immediately",
  "now",
  "within 10 minutes",
  "urgent",
  "final notice",
  "deadline",
  "last warning",
];

const SUSPICIOUS_DOMAINS = [
  "paytm-secure.co.in",
  "verify-secure-bank.com",
];

function highlight(text: string, phrases: string[]) {
  const hits: { phrase: string; index: number }[] = [];
  const lower = text.toLowerCase();
  phrases.forEach((p) => {
    const i = lower.indexOf(p.toLowerCase());
    if (i !== -1) hits.push({ phrase: p, index: i });
  });
  return hits;
}

function analyzeText(content: string, meta?: Record<string, any>) {
  const lc = content.toLowerCase();
  const kwHits = KEYWORDS.filter((k) => lc.includes(k));
  const urgHits = URGENCY_WORDS.filter((k) => lc.includes(k));
  let domainFlag = false;
  if (meta?.sender) {
    const m = /@([^\s>]+)$/i.exec(meta.sender);
    const dom = m?.[1]?.toLowerCase();
    if (dom) domainFlag = SUSPICIOUS_DOMAINS.some((d) => dom.includes(d));
  }
  const score = Math.min(1,
    kwHits.length * 0.25 +
    urgHits.length * 0.15 +
    (domainFlag ? 0.2 : 0)
  );
  const severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons: string[] = [];
  if (kwHits.length) reasons.push(`Keywords detected: ${kwHits.join(", ")}`);
  if (urgHits.length) reasons.push(`Urgency cues: ${urgHits.join(", ")}`);
  if (domainFlag) reasons.push("Suspicious sender domain");

  const highlights = highlight(content, [...kwHits, ...urgHits]);
  const advice = [
    "Do not click links or share OTPs.",
    "Verify caller/sender via official website/app.",
    "Report to cybercrime.gov.in if in India.",
  ];
  return { label: score > 0.5 ? "potential_scam" : "unclear", score, severity, reasons, highlights, advice };
}

function analyzeVoice(transcript: string, meta?: Record<string, any>) {
  const base = analyzeText(transcript, meta);
  const spoof = meta?.spoofedCallerId === true || /140-/.test(meta?.callerId || "");
  const extra = spoof ? 0.25 : 0;
  const score = Math.min(1, base.score + extra);
  const severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons = [...base.reasons];
  if (spoof) reasons.push("Possible caller ID spoofing");
  return { ...base, score, severity, reasons };
}

function analyzeVideo(transcript: string, meta?: Record<string, any>) {
  const base = analyzeText(transcript, meta);
  const blinkLow = (meta?.deepfakeIndicators?.blinkRatePerMin ?? 12) < 6;
  const lipSyncLow = (meta?.deepfakeIndicators?.lipSyncScore ?? 1) < 0.7;
  const dfFlag = blinkLow || lipSyncLow;
  const extra = dfFlag ? 0.25 : 0;
  const score = Math.min(1, base.score + extra);
  const severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons = [...base.reasons];
  if (dfFlag) reasons.push("Possible deepfake indicators (blink/lip-sync anomaly)");
  const advice = [
    ...base.advice,
    "Ask for official email confirmation from a .gov.in / official domain.",
    "Do not perform any payment on call/video; independently verify.",
  ];
  return { ...base, score, severity, reasons, advice };
}

export const getSamples: RequestHandler = (req, res) => {
  const type = (req.query.type as string) || "all";
  const basePath = "server/data";
  const texts = loadJSON(path.join(basePath, "text_samples.json"));
  const voices = loadJSON(path.join(basePath, "voice_samples.json"));
  const videos = loadJSON(path.join(basePath, "video_samples.json"));
  const data = { text: texts, voice: voices, video: videos } as const;
  if (type === "text" || type === "voice" || type === "video") {
    // @ts-ignore
    return res.json(data[type]);
  }
  res.json({ text: texts, voice: voices, video: videos });
};

export const analyze: RequestHandler = (req, res) => {
  const { channel, content, metadata } = req.body || {};
  if (!channel || !content) return res.status(400).json({ error: "channel and content are required" });
  let result: any;
  if (channel === "text") result = analyzeText(content, metadata);
  else if (channel === "voice") result = analyzeVoice(content, metadata);
  else if (channel === "video") result = analyzeVideo(content, metadata);
  else return res.status(400).json({ error: "invalid channel" });

  res.json({ channel, content, metadata, analysis: result });
};

export const batchAnalyze: RequestHandler = (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: "items must be an array" });
  const results = items.map((it: any) => {
    const { channel, content, ...rest } = it;
    try {
      if (channel === "text") return { id: it.id, ...analyzeText(content, rest) };
      if (channel === "voice") return { id: it.id, ...analyzeVoice(content, rest) };
      if (channel === "video") return { id: it.id, ...analyzeVideo(content, rest) };
      return { id: it.id, error: "invalid channel" };
    } catch (e) {
      return { id: it.id, error: "analysis_failed" };
    }
  });
  res.json({ results });
};
