"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SituationPicker, type Situation } from "@/components/profile/situation-picker";
import { IndustryPicker } from "@/components/profile/industry-picker";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

export interface ProfileContext {
  situation: Situation | null;
  currentRole: string;
  currentCompany: string;
  currentSince: string;
  projects: string;
  targetRole: string;
  industry: string;
  extraInstructions: string;
}

interface ProfileContextFormProps {
  initial: ProfileContext;
}

type SaveState = "idle" | "saving" | "saved";

/**
 * Situational context form. Starts with a click-to-choose "where are you right
 * now?", then asks only the questions that fit that branch. No auto-save —
 * explicit Cancel | Save at the bottom.
 */
export function ProfileContextForm({ initial }: ProfileContextFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  function set<K extends keyof ProfileContext>(key: K, value: ProfileContext[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!dirty || state === "saving") return;
    setState("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: form.situation ?? undefined,
          currentRole: form.currentRole.trim() || null,
          currentCompany: form.currentCompany.trim() || null,
          currentSince: form.currentSince.trim() || null,
          projects: form.projects.trim() || null,
          targetRole: form.targetRole.trim() || null,
          industry: form.industry.trim() || null,
          extraInstructions: form.extraInstructions.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(form);
      setState("saved");
      // Resync server props: reveals the Experience section (and the card
      // auto-filled from "I'm working as X at Y") right after saving.
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("idle");
    }
  }

  const situation = form.situation;

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-medium text-ink">Where are you right now?</p>
      <SituationPicker value={situation} onChange={(v) => set("situation", v)} />

      {situation && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {situation === "employed" ? (
            <>
              <label className="block">
                <span className="mb-1.5 block text-sm text-ink-soft">
                  What&apos;s your role?
                </span>
                <input
                  className={inputClass}
                  placeholder="e.g. Backend Engineer"
                  value={form.currentRole}
                  onChange={(e) => set("currentRole", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-ink-soft">
                  Where do you work?
                </span>
                <input
                  className={inputClass}
                  placeholder="e.g. Acme Corp"
                  value={form.currentCompany}
                  onChange={(e) => set("currentCompany", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-ink-soft">
                  How long have you been there?
                </span>
                <input
                  className={inputClass}
                  placeholder="e.g. since Mar 2022"
                  value={form.currentSince}
                  onChange={(e) => set("currentSince", e.target.value)}
                />
              </label>
            </>
          ) : (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-ink-soft">
                {situation === "searching"
                  ? "What role are you after?"
                  : "What role are you aiming for?"}
              </span>
              <input
                className={inputClass}
                placeholder="e.g. Junior Frontend Developer"
                value={form.targetRole}
                onChange={(e) => set("targetRole", e.target.value)}
              />
            </label>
          )}

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm text-ink-soft">
              {situation === "student"
                ? "What area interests you?"
                : "What area / industry?"}
            </p>
            <IndustryPicker value={form.industry} onChange={(v) => set("industry", v)} />
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm text-ink-soft">
              {situation === "student"
                ? "Tell us about your projects"
                : "Projects (optional)"}
            </span>
            <textarea
              className={`${inputClass} h-28 resize-none overflow-y-auto`}
              placeholder="Side or study projects — what they do, the stack, what you're proud of…"
              value={form.projects}
              onChange={(e) => set("projects", e.target.value)}
            />
          </label>
        </div>
      )}

      <label className="mt-6 block">
        <span className="mb-1.5 block text-sm text-ink-soft">Something to comment?</span>
        <textarea
          className={`${inputClass} h-28 resize-none overflow-y-auto`}
          placeholder="Any observation that should shape what we generate — tone, focus, things to avoid…"
          value={form.extraInstructions}
          onChange={(e) => set("extraInstructions", e.target.value)}
        />
      </label>

      <div className="mt-5 flex items-center justify-end gap-3">
        <Button variant="secondary" disabled={!dirty} onClick={() => setForm(saved)}>
          Cancel
        </Button>
        <Button disabled={!dirty || state === "saving"} onClick={save}>
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save"}
        </Button>
      </div>
    </div>
  );
}
