"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useArena";
import { useMatches } from "@/hooks/useArena";

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { matches, loading: matchesLoading } = useMatches();

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const acceptedMatches = matches.filter((m) => m.status === "accepted");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{profile?.name ? `, ${profile.name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your Arena overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending Matches"
          value={matchesLoading ? "…" : String(pendingMatches.length)}
          href="/dashboard/matches"
          color="text-yellow-500"
        />
        <StatCard
          title="Accepted Partners"
          value={matchesLoading ? "…" : String(acceptedMatches.length)}
          href="/dashboard/matches"
          color="text-green-500"
        />
        <StatCard
          title="Sport"
          value={profileLoading ? "…" : profile?.sport ?? "—"}
          href="/dashboard/profile"
          color="text-primary"
        />
      </div>

      {!profile && !profileLoading && (
        <div className="p-6 border border-dashed border-border rounded-xl text-center">
          <p className="text-muted-foreground mb-3">You haven&apos;t created a profile yet.</p>
          <Link
            href="/dashboard/profile"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Create Profile
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="p-6 border border-border rounded-xl bg-card hover:border-primary/50 transition cursor-pointer">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </Link>
  );
}
