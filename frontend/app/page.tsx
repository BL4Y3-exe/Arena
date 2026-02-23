import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-extrabold tracking-tight mb-4">
          🥊 <span className="text-primary">Arena</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered platform for finding sparring partners.
          <br />
          Smart matching based on skill, goals, schedule, and location.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="border border-border px-8 py-3 rounded-lg font-semibold hover:bg-accent transition"
          >
            Sign In
          </Link>
        </div>
      </div>

      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        {[
          { icon: "🎯", title: "Smart Matching", desc: "AI scores compatibility based on 5 weighted factors." },
          { icon: "📅", title: "Schedule Sync", desc: "Matches only with partners who share your availability." },
          { icon: "🤖", title: "AI Insights", desc: "Get detailed reasoning, risks, and strengths for every match." },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-1">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
