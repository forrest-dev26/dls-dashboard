"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg font-ui">
      <div className="w-full max-w-[400px] rounded-xl border border-line bg-bg-card p-10 pt-12 shadow-lg">
        {/* Brand mark */}
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[10px] bg-gold font-display text-2xl font-bold italic text-ink">
          D
        </div>

        <h1 className="m-0 mb-1.5 text-center font-display text-2xl font-semibold tracking-tight text-ink">
          Dead Letter Studio
        </h1>
        <p className="m-0 mb-8 text-center text-[13px] text-ink-3">
          Owner Dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="password"
            className="mb-2 block text-xs uppercase tracking-[0.08em] text-ink-3"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter dashboard password"
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-md border border-line bg-bg-soft px-4 py-3 font-ui text-[15px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-gold"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md border-none bg-burgundy px-4 py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in\u2026" : "Sign In"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-bad/30 bg-bad-soft px-3.5 py-2.5 text-center text-[13px] text-bad">
            {error}
          </div>
        )}

        <p className="m-0 mt-6 text-center text-[11px] text-ink-3">
          Dead Letter Studio · Owner Access
        </p>
      </div>
    </div>
  );
}
