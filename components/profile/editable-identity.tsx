"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableIdentityProps {
  name: string | null;
  githubLogin: string | null;
}

/**
 * Profile header name + @handle with hover-pencil inline editing.
 * Each line swaps to an input in place; Enter/✓ saves, Escape/✕ cancels.
 */
export function EditableIdentity({ name, githubLogin }: EditableIdentityProps) {
  return (
    <div>
      <EditableLine
        value={name}
        field="name"
        placeholder="Your name"
        display={(v) => v || "Your profile"}
        className="font-display text-3xl font-bold tracking-tight text-ink"
        inputClassName="font-display text-3xl font-bold tracking-tight text-ink"
      />
      <EditableLine
        value={githubLogin}
        field="githubLogin"
        placeholder="handle"
        display={(v) => (v ? `@${v}` : "add your @handle")}
        className="font-mono text-sm text-ink-soft"
        inputClassName="font-mono text-sm text-ink-soft"
      />
    </div>
  );
}

function EditableLine({
  value,
  field,
  placeholder,
  display,
  className,
  inputClassName,
}: {
  value: string | null;
  field: "name" | "githubLogin";
  placeholder: string;
  display: (value: string | null) => string;
  className: string;
  inputClassName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [busy, setBusy] = useState(false);

  function open() {
    setDraft(value ?? "");
    setEditing(true);
  }

  async function save() {
    const trimmed = draft.trim();
    // name can't be emptied (it's the display identity); the handle can.
    if (busy || (field === "name" && !trimmed)) return;
    setBusy(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: field === "name" ? trimmed : trimmed || null }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          className={`rounded-input border border-border bg-bg px-2 py-0.5 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 ${inputClassName}`}
        />
        <button
          onClick={save}
          disabled={busy}
          aria-label="Save"
          className="text-sm font-semibold text-green-dark transition-colors hover:text-green disabled:opacity-50"
        >
          ✓
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={busy}
          aria-label="Cancel"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <span className={className}>{display(value)}</span>
      <button
        onClick={open}
        aria-label={`Edit ${field === "name" ? "name" : "handle"}`}
        className="text-ink-soft opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
