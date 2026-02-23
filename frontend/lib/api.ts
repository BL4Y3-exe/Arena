const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type RequestOptions = RequestInit & { token?: string };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const resp = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    request<{ id: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    return request<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );
  },
};

// ── Profiles ──────────────────────────────────────────────────────────────────
export const profileApi = {
  getMe: (token: string) => request<Profile>("/profiles/me", { token }),
  create: (token: string, data: Partial<Profile>) =>
    request<Profile>("/profiles", { method: "POST", body: JSON.stringify(data), token }),
  update: (token: string, data: Partial<Profile>) =>
    request<Profile>("/profiles/me", { method: "PATCH", body: JSON.stringify(data), token }),
};

// ── Match ─────────────────────────────────────────────────────────────────────
export const matchApi = {
  findMatches: (token: string) => request<MatchResult[]>("/match/find", { method: "POST", token }),
  recommended: (token: string) => request<MatchResult[]>("/match/recommended", { token }),
  respond: (token: string, matchId: string, status: "accepted" | "rejected") =>
    request<MatchResult>(`/match/${matchId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),
};

// ── Availability ─────────────────────────────────────────────────────────────
export const availabilityApi = {
  get: (token: string) => request<Availability[]>("/availability", { token }),
  add: (token: string, data: { day_of_week: number; start_time: string; end_time: string }) =>
    request<Availability>("/availability", { method: "POST", body: JSON.stringify(data), token }),
  remove: (token: string, id: string) =>
    request<void>(`/availability/${id}`, { method: "DELETE", token }),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  sport: string;
  skill_level: number;
  experience_years?: number;
  goals?: string;
  training_intensity?: string;
  city?: string;
}

export interface MatchResult {
  id: string;
  user_a_id: string;
  user_b_id: string;
  compatibility_score?: number;
  ai_reasoning?: string;
  risks?: string;
  strengths?: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Availability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
