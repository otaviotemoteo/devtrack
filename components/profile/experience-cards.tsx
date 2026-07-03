"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/experiences";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

interface ExperienceCardsProps {
  initial: Experience[];
}

type SaveState = "idle" | "saving" | "saved";

/**
 * User-managed experience cards. Pre-filled entries (confirmed=false, seeded
 * from the LinkedIn/CV import) show a "is this correct?" banner until
 * confirmed. Add/edit/delete are local until the explicit Save.
 */
export function ExperienceCards({ initial }: ExperienceCardsProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [items, setItems] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Card values when the editing session opened — null means it's a fresh
  // "Add" (cancel removes it instead of restoring).
  const [editingSnapshot, setEditingSnapshot] = useState<Experience | null>(null);
  const [state, setState] = useState<SaveState>("idle");

  const dirty = JSON.stringify(items) !== JSON.stringify(saved);
  const unconfirmed = items.filter((e) => !e.confirmed);
  const prefillSource = unconfirmed[0]?.source === "cv" ? "CV analysis" : "LinkedIn import";

  async function persist(next: Experience[]) {
    setState("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences: next }),
      });
      if (!res.ok) throw new Error();
      setSaved(next);
      setItems(next);
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("idle");
    }
  }

  function confirmAll() {
    persist(items.map((e) => ({ ...e, confirmed: true })));
  }

  function update(id: string, patch: Partial<Experience>) {
    setItems((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    setItems((list) => list.filter((e) => e.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function add() {
    const fresh: Experience = {
      id: crypto.randomUUID(),
      company: "",
      role: "",
      period: "",
      description: "",
      source: "manual",
      confirmed: true,
    };
    setItems((list) => [fresh, ...list]);
    setEditingId(fresh.id);
    setEditingSnapshot(null);
  }

  function startEdit(exp: Experience) {
    setEditingId(exp.id);
    setEditingSnapshot(exp);
  }

  function cancelEdit() {
    if (editingId) {
      if (editingSnapshot) {
        setItems((list) =>
          list.map((e) => (e.id === editingId ? editingSnapshot : e))
        );
      } else {
        setItems((list) => list.filter((e) => e.id !== editingId));
      }
    }
    setEditingId(null);
    setEditingSnapshot(null);
  }

  return (
    <div className="mt-6">
      {unconfirmed.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed border-green/40 bg-green-soft/40 px-4 py-3">
          <p className="text-sm text-ink-soft">
            We pre-filled {unconfirmed.length === 1 ? "this" : "these"} from your{" "}
            {prefillSource} — is it correct?
          </p>
          <button
            onClick={confirmAll}
            disabled={state === "saving"}
            className="shrink-0 text-sm font-semibold text-green-dark transition-colors hover:text-green disabled:opacity-50"
          >
            Looks right ✓
          </button>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-ink-soft">
          No experiences yet — add one, or import your LinkedIn / analyze your
          CV and we&apos;ll pre-fill them for you.
        </p>
      )}

      <div className="space-y-3">
        {items.map((exp) =>
          editingId === exp.id ? (
            <ExperienceEditor
              key={exp.id}
              exp={exp}
              onChange={(patch) => update(exp.id, patch)}
              onCancel={cancelEdit}
              onDone={() => {
                // Editing a pre-filled card is an implicit confirmation.
                update(exp.id, { confirmed: true });
                setEditingId(null);
                setEditingSnapshot(null);
              }}
            />
          ) : (
            <div
              key={exp.id}
              className="flex items-start justify-between gap-4 rounded-card border border-border bg-bg px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {exp.role || "Untitled role"}
                  {exp.company && (
                    <span className="font-normal text-ink-soft"> · {exp.company}</span>
                  )}
                </p>
                {exp.period && (
                  <p className="mt-0.5 font-mono text-xs text-ink-soft">{exp.period}</p>
                )}
                {exp.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
                    {exp.description}
                  </p>
                )}
                {!exp.confirmed && (
                  <span className="mt-2 inline-block rounded-chip border border-green/40 bg-green-soft px-2.5 py-0.5 font-mono text-xs text-green-dark">
                    pre-filled · {exp.source}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 gap-3 text-sm font-semibold">
                <button
                  onClick={() => startEdit(exp)}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(exp.id)}
                  className="text-ink-soft transition-colors hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={add}
          className="text-sm font-semibold text-green-dark transition-colors hover:text-green"
        >
          ＋ Add experience
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={!dirty}
            onClick={() => {
              setItems(saved);
              setEditingId(null);
              setEditingSnapshot(null);
            }}
          >
            Cancel
          </Button>
          <Button disabled={!dirty || state === "saving"} onClick={() => persist(items)}>
            {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({
  exp,
  onChange,
  onCancel,
  onDone,
}: {
  exp: Experience;
  onChange: (patch: Partial<Experience>) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    <div className="rounded-card border border-green/40 bg-bg px-5 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          autoFocus
          className={inputClass}
          placeholder="Role — e.g. Backend Engineer"
          value={exp.role}
          onChange={(e) => onChange({ role: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Company"
          value={exp.company}
          onChange={(e) => onChange({ company: e.target.value })}
        />
        <input
          className={`${inputClass} sm:col-span-2`}
          placeholder="Period — e.g. Mar 2023 – now"
          value={exp.period}
          onChange={(e) => onChange({ period: e.target.value })}
        />
        <textarea
          className={`${inputClass} h-20 resize-none overflow-y-auto sm:col-span-2`}
          placeholder="What you did / impact (optional)"
          value={exp.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button size="md" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="md" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
