"use client";

import { useState } from "react";

interface ActionButtonProps {
  label: string;
  variant?: "primary" | "ghost" | "light" | "decline";
}

export default function ActionButton({ label, variant = "primary" }: ActionButtonProps) {
  const [toast, setToast] = useState(false);

  function handleClick() {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  const base: React.CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: 12,
    fontWeight: 500,
    padding: "7px 14px",
    borderRadius: 4,
    border: "1px solid transparent",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    position: "relative",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--gold)",
      color: "var(--ink)",
      borderColor: "var(--gold)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-4)",
      borderColor: "rgba(255,255,255,0.2)",
    },
    light: {
      background: "var(--bg-soft)",
      color: "var(--ink)",
      borderColor: "var(--line)",
    },
    decline: {
      background: "transparent",
      color: "var(--bad-soft)",
      borderColor: "rgba(248,219,214,0.25)",
    },
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{ ...base, ...variants[variant] }}
      >
        {label}
      </button>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "12px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "var(--font-ui)",
            boxShadow: "0 4px 14px rgba(26,20,16,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Phase 2</span>
          — coming soon
        </div>
      )}
    </>
  );
}
