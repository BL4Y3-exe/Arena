"use client";

import { useState } from "react";
import { matchApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { useMatches } from "@/hooks/useArena";

export default function MatchesPage() {
  const token = useAuthStore((s) => s.accessToken);
  const { matches, loading, respond, refresh } = useMatches();
  const [finding, setFinding] = useState(false);

  const handleFindMatches = async () => {
    if (!token) return;
    setFinding(true);
    try {
      await matchApi.findMatches(token);
      await refresh();
    } finally {
      setFinding(false);
    }
  };

  const pending = matches.filter((m) => m.status === "pending");
  const accepted = matches.filter((m) => m.status === "accepted");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matches</h1>
        <button
          onClick={handleFindMatches}
          disabled={finding}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-60 transition text-sm"
        >
          {finding ? "Finding…" : "🔍 Find New Matches"}
        </button>
      </div>

      {loading && <p className="text-muted-foreground">Loading matches…</p>}

      {!loading && pending.length === 0 && accepted.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No matches yet. Find your first sparring partner!</p>
        </div>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recommended</h2>
          <div className="space-y-4">
            {pending.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={() => respond(match.id, "accepted")}
                onSkip={() => respond(match.id, "rejected")}
              />
            ))}
          </div>
        </section>
      )}

      {accepted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Your Partners</h2>
          <div className="space-y-4">
            {accepted.map((match) => (
              <MatchCard key={match.id} match={match} accepted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onAccept,
  onSkip,
  accepted,
}: {
  match: {
    id: string;
    user_b_id: string;
    compatibility_score?: number;
    ai_reasoning?: string;
    risks?: string;
    strengths?: string;
    status: string;
  };
  onAccept?: () => void;
  onSkip?: () => void;
  accepted?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = match.compatibility_score ?? 0;
  const scoreColor =
    score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="border border-border rounded-xl bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Partner ID: {match.user_b_id.slice(0, 8)}…</div>
          <div className={`text-2xl font-bold ${scoreColor}`}>{score.toFixed(0)}% Compatible</div>
        </div>
        {accepted && (
          <span className="text-xs bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
            Partner
          </span>
        )}
        {!accepted && (
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-1.5 border border-border rounded-lg text-sm hover:bg-accent transition"
            >
              Skip
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition"
            >
              Accept
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground transition"
      >
        {expanded ? "Hide details ▲" : "Show AI analysis ▼"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          {match.ai_reasoning && (
            <div>
              <span className="font-medium">Reasoning: </span>
              {match.ai_reasoning}
            </div>
          )}
          {match.strengths && (
            <div>
              <span className="font-medium text-green-600">Strengths: </span>
              {match.strengths}
            </div>
          )}
          {match.risks && (
            <div>
              <span className="font-medium text-yellow-600">Risks: </span>
              {match.risks}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
