import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";

export default function Learn() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-16">
        <h1 className="text-2xl font-bold mb-2">Learn</h1>
        <p className="text-foreground/70">Educational resources on common scam tactics and prevention.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6">
            <h3 className="font-medium">Digital Arrest Scams</h3>
            <p className="text-sm text-foreground/70 mt-1">Impersonation, urgency, coercion. Verify via official channels.</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-medium">Deepfake Awareness</h3>
            <p className="text-sm text-foreground/70 mt-1">Look for blink/lip-sync anomalies. Ask for alternate verification.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
