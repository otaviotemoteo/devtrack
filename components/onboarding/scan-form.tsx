"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Segmented } from "@/components/ui/segmented";
import type { ScanConfig } from "@/lib/scan/config";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

const labelClass = "mb-1.5 block text-sm text-ink-soft";

const sectionTitle =
  "font-mono text-xs uppercase tracking-[0.15em] text-green-dark";

export function ScanForm() {
  const router = useRouter();

  const [personalProjects, setPersonalProjects] = useState(true);
  const [orgContributions, setOrgContributions] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [target, setTarget] = useState<"global" | "company">("global");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [period, setPeriod] = useState("");
  const [language, setLanguage] = useState<"pt" | "en">("en");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!personalProjects && !orgContributions) {
      setError("Pick at least one source to scan.");
      return;
    }
    if (target === "company" && !company.trim()) {
      setError("Enter the company name, or switch to a global profile.");
      return;
    }

    const config: ScanConfig = {
      sources: {
        personalProjects,
        orgContributions,
        orgs: [], // all orgs — per-org filtering comes from the GitHub API later
      },
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      target:
        target === "company"
          ? {
              kind: "company",
              company: company.trim(),
              ...(role.trim() ? { role: role.trim() } : {}),
              ...(period.trim() ? { period: period.trim() } : {}),
            }
          : { kind: "global" },
      language,
      generationType: "linkedin",
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong starting the scan.");
      }
      const { scanId } = await res.json();
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sources */}
        <Card soft className="p-7">
          <p className={sectionTitle}>Sources</p>
          <div className="mt-6 space-y-5">
            <Toggle
              id="personal"
              label="Personal projects"
              checked={personalProjects}
              onChange={setPersonalProjects}
            />
            <Toggle
              id="orgs"
              label="Organization contributions"
              checked={orgContributions}
              onChange={setOrgContributions}
            />
            {orgContributions && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-chip border-2 border-green bg-bg px-4 py-1.5 text-sm font-medium text-green-dark">
                  all orgs
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Time range */}
        <Card soft className="p-7">
          <p className={sectionTitle}>Time range</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from" className={labelClass}>
                From
              </label>
              <input
                id="from"
                type="month"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="to" className={labelClass}>
                To
              </label>
              <input
                id="to"
                type="month"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Leave empty to scan all time.
          </p>
        </Card>
      </div>

      {/* Target */}
      <Card soft className="p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={sectionTitle}>Target</p>
            <p className="mt-3 text-ink">This content is for…</p>
          </div>
          <Segmented
            value={target}
            onChange={setTarget}
            options={[
              { value: "global", label: "Global profile" },
              { value: "company", label: "A specific company" },
            ]}
          />
        </div>

        {target === "company" && (
          <div className="mt-6 grid gap-4 rounded-card border-2 border-dashed border-green/50 bg-green-soft/60 p-5 sm:grid-cols-3">
            <div>
              <label htmlFor="company" className={labelClass}>
                Company name
              </label>
              <input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>
                Role
              </label>
              <input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Backend Eng."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="period" className={labelClass}>
                Period
              </label>
              <input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2023 – now"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </Card>

      {error && (
        <p className="rounded-input border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="text-ink">Output language</span>
          <Segmented
            size="sm"
            value={language}
            onChange={setLanguage}
            options={[
              { value: "pt", label: "PT" },
              { value: "en", label: "EN" },
            ]}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-btn bg-green px-8 py-3 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? "Starting…" : "Start scan"}
        </button>
      </div>
    </form>
  );
}
