import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";

export default function Incidents() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-16">
        <h1 className="text-2xl font-bold mb-2">Incidents</h1>
        <p className="text-foreground/70">This page will list detected incidents with filters and export. Prompt to fill this page further.</p>
        <div className="mt-6 rounded-lg border p-8 text-sm text-foreground/60">Coming soon. Use the live dashboard to see detections in real time.</div>
      </main>
      <Footer />
    </div>
  );
}
