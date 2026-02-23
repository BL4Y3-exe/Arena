"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">
          🥊 <span className="text-primary">Arena</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4 p-8 border border-border rounded-xl shadow-sm bg-card">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
