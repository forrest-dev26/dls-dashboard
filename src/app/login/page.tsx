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
    <div
      style={{
        background: "#0e0e18",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          border: "1px solid #2e2e4a",
          borderRadius: "12px",
          padding: "48px 40px 40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "#c9a96e",
            color: "#0e0e18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-lora), Georgia, serif",
            fontWeight: 700,
            fontSize: 24,
            fontStyle: "italic",
            margin: "0 auto 20px",
          }}
        >
          D
        </div>

        <h1
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontWeight: 600,
            fontSize: 24,
            textAlign: "center",
            color: "#e8e0d4",
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          Dead Letter Studio
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#6b6b80",
            fontSize: 13,
            margin: "0 0 32px",
          }}
        >
          Owner Dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: 12,
              color: "#8a8a9e",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
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
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#12121e",
              border: "1px solid #2e2e4a",
              borderRadius: 6,
              color: "#e8e0d4",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#c9a96e"; }}
            onBlur={(e) => { e.target.style.borderColor = "#2e2e4a"; }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              marginTop: 20,
              background: loading ? "#9a7a4e" : "#c9a96e",
              color: "#0e0e18",
              border: "none",
              borderRadius: 6,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "rgba(168,85,73,0.15)",
              border: "1px solid rgba(168,85,73,0.3)",
              borderRadius: 6,
              color: "#f0bdb5",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 11,
            color: "#3e3e56",
          }}
        >
          Dead Letter Studio · Owner Access
        </p>
      </div>
    </div>
  );
}
