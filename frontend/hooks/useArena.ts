"use client";

import { useState, useEffect } from "react";
import { profileApi, matchApi, type Profile, type MatchResult } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export function useProfile() {
  const token = useAuthStore((s) => s.accessToken);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    profileApi.getMe(token)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return { profile, loading, error, setProfile };
}

export function useMatches() {
  const token = useAuthStore((s) => s.accessToken);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await matchApi.recommended(token);
      setMatches(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [token]);

  const respond = async (matchId: string, status: "accepted" | "rejected") => {
    if (!token) return;
    await matchApi.respond(token, matchId, status);
    await fetchMatches();
  };

  return { matches, loading, respond, refresh: fetchMatches };
}
