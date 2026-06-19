"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Segmented } from "@/components/ui/segmented";
import { Chip } from "@/components/ui/chip";
import type { Repository } from "@/lib/github/repos";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

interface Group {
  key: string;
  label: string;
  isOrg: boolean;
  repos: Repository[];
  owners: string[];
}

function buildGroups(repos: Repository[]): { orgs: Group[]; personal: Group | null } {
  const orgMap = new Map<string, Repository[]>();
  const personal: Repository[] = [];
  for (const r of repos) {
    if (r.isOrg) {
      const arr = orgMap.get(r.owner) ?? [];
      arr.push(r);
      orgMap.set(r.owner, arr);
    } else {
      personal.push(r);
    }
  }
  const orgs: Group[] = [...orgMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([owner, list]) => ({
      key: owner,
      label: owner,
      isOrg: true,
      repos: list,
      owners: [owner],
    }));
  const personalGroup: Group | null = personal.length
    ? {
        key: "__personal__",
        label: "Your repositories",
        isOrg: false,
        repos: personal,
        owners: [...new Set(personal.map((r) => r.owner))],
      }
    : null;
  return { orgs, personal: personalGroup };
}

export function RepoPicker({ generationType }: { generationType: string }) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emphasis, setEmphasis] = useState<Record<string, string>>({});

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [target, setTarget] = useState<"global" | "company">("global");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [period, setPeriod] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/repositories/sync", { method: "POST" });
        if (!res.ok) throw new Error("Could not sync your repositories.");
        const data = (await res.json()) as { repositories: Repository[] };
        if (cancelled) return;
        setRepos(data.repositories);
        setSelected(
          new Set(data.repositories.filter((r) => r.selected).map((r) => r.id))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Sync failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { orgs, personal } = useMemo(
    () => buildGroups(repos ?? []),
    [repos]
  );

  async function toggleRepo(id: string, next: boolean) {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
    // Persist selection (fire-and-forget).
    fetch(`/api/repositories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected: next }),
    }).catch(() => {});
  }

  function setGroupSelection(group: Group, next: boolean) {
    for (const r of group.repos) toggleRepo(r.id, next);
  }

  async function start() {
    if (starting) return;
    if (selected.size === 0) {
      setError("Select at least one repository.");
      return;
    }
    if (target === "company" && !company.trim()) {
      setError("Enter the company name, or switch to a global profile.");
      return;
    }
    setError(null);
    setStarting(true);

    // Expand per-group emphasis into per-owner notes for evidence extraction.
    const orgEmphasis: Record<string, string> = {};
    for (const g of [...orgs, ...(personal ? [personal] : [])]) {
      const note = emphasis[g.key]?.trim();
      if (note) for (const owner of g.owners) orgEmphasis[owner] = note;
    }

    const config = {
      selectedRepoIds: [...selected],
      orgEmphasis,
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      target:
        target === "company"
          ? {
              kind: "company" as const,
              company: company.trim(),
              ...(role.trim() ? { role: role.trim() } : {}),
              ...(period.trim() ? { period: period.trim() } : {}),
            }
          : { kind: "global" as const },
      generationType,
    };

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not start the scan.");
      }
      const { scanId } = await res.json();
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
      setStarting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Choose what to scan
          </h1>
          <p className="mt-2 text-ink-soft">
            Pick the repos that best represent your work.
          </p>
        </div>
        <span className="shrink-0 rounded-chip border border-green/40 bg-green-soft px-4 py-1.5 font-mono text-sm text-green-dark">
          {selected.size} selected
        </span>
      </div>

      {error && (
        <p className="mt-6 rounded-input border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {repos === null ? (
        <p className="mt-10 text-ink-soft">Syncing your repositories…</p>
      ) : (
        <>
          {orgs.length > 0 && (
            <section className="mt-10">
              <p className="eyebrow">Organizations</p>
              <div className="mt-4 space-y-4">
                {orgs.map((g) => (
                  <GroupAccordion
                    key={g.key}
                    group={g}
                    selected={selected}
                    onToggleRepo={toggleRepo}
                    onSelectAll={setGroupSelection}
                    emphasis={emphasis[g.key] ?? ""}
                    onEmphasis={(v) =>
                      setEmphasis((p) => ({ ...p, [g.key]: v }))
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {personal && (
            <section className="mt-10">
              <p className="eyebrow">Personal</p>
              <div className="mt-4">
                <GroupAccordion
                  group={personal}
                  selected={selected}
                  onToggleRepo={toggleRepo}
                  onSelectAll={setGroupSelection}
                  emphasis={emphasis[personal.key] ?? ""}
                  onEmphasis={(v) =>
                    setEmphasis((p) => ({ ...p, [personal.key]: v }))
                  }
                />
              </div>
            </section>
          )}

          {/* Scan settings */}
          <section className="mt-10">
            <p className="eyebrow">Scan settings</p>
            <Card className="mt-4 space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-ink-soft">From</span>
                  <input
                    type="month"
                    className={inputClass}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-ink-soft">To</span>
                  <input
                    type="month"
                    className={inputClass}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-ink-soft">
                  This content is for…
                </span>
                <Segmented
                  options={[
                    { value: "global", label: "Global profile" },
                    { value: "company", label: "Specific company" },
                  ]}
                  value={target}
                  onChange={setTarget}
                  size="sm"
                />
              </div>

              {target === "company" && (
                <div className="grid gap-4 rounded-card border border-dashed border-green/40 p-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-ink-soft">
                      Company
                    </span>
                    <input
                      className={inputClass}
                      placeholder="Acme Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-ink-soft">Role</span>
                    <input
                      className={inputClass}
                      placeholder="Backend Eng."
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-ink-soft">
                      Period
                    </span>
                    <input
                      className={inputClass}
                      placeholder="2023 – now"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </Card>
          </section>

          <button
            onClick={start}
            disabled={starting}
            className="mt-8 inline-flex w-full items-center justify-center rounded-btn bg-green px-6 py-4 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start scan"}
          </button>
        </>
      )}
    </main>
  );
}

interface GroupAccordionProps {
  group: Group;
  selected: Set<string>;
  onToggleRepo: (id: string, next: boolean) => void;
  onSelectAll: (group: Group, next: boolean) => void;
  emphasis: string;
  onEmphasis: (value: string) => void;
}

function GroupAccordion({
  group,
  selected,
  onToggleRepo,
  onSelectAll,
  emphasis,
  onEmphasis,
}: GroupAccordionProps) {
  const [open, setOpen] = useState(group.isOrg ? false : true);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(5);

  const selectedCount = group.repos.filter((r) => selected.has(r.id)).length;
  const filtered = group.repos.filter((r) =>
    r.fullName.toLowerCase().includes(query.trim().toLowerCase())
  );
  const shown = filtered.slice(0, visible);
  const allSelected = group.repos.every((r) => selected.has(r.id));

  return (
    <Card className={selectedCount > 0 ? "border-green/50" : ""}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-btn border border-border bg-bg-soft text-ink-soft">
            ▦
          </span>
          <span>
            <span className="block font-semibold text-ink">{group.label}</span>
            <span className="block text-sm text-ink-soft">
              {group.repos.length} repositories
            </span>
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span
            className={`rounded-chip border px-3 py-1 font-mono text-xs ${
              selectedCount > 0
                ? "border-green/40 bg-green-soft text-green-dark"
                : "border-border text-ink-soft"
            }`}
          >
            {selectedCount > 0 ? `${selectedCount} selected` : "none yet"}
          </span>
          <span className="text-ink-soft">{open ? "⌄" : "›"}</span>
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-5">
          <div className="flex items-center gap-3">
            <input
              className={inputClass}
              placeholder={`Search repos in ${group.label}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={() => onSelectAll(group, !allSelected)}
              className="shrink-0 text-sm font-semibold text-green-dark transition-colors hover:text-green"
            >
              Select all / none
            </button>
          </div>

          <div className="mt-4 space-y-1">
            {shown.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-input px-2 py-2.5 hover:bg-bg-soft"
              >
                <Toggle
                  checked={selected.has(r.id)}
                  onChange={(next) => onToggleRepo(r.id, next)}
                  label={r.fullName.split("/")[1] ?? r.fullName}
                />
                {r.language && (
                  <span className="shrink-0">
                    <Chip>{r.language}</Chip>
                  </span>
                )}
              </div>
            ))}
            {shown.length === 0 && (
              <p className="px-2 py-3 text-sm text-ink-soft">No matches.</p>
            )}
          </div>

          {filtered.length > visible && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-ink-soft">
                Showing {shown.length} of {filtered.length}
              </span>
              <button
                type="button"
                onClick={() => setVisible((v) => v + 10)}
                className="rounded-btn border border-border bg-bg px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-bg-soft"
              >
                Load more
              </button>
            </div>
          )}

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm text-ink">
              Anything to emphasize about your work here?
            </span>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              placeholder='e.g. "Led the payments rewrite and mentored two juniors here…"'
              value={emphasis}
              onChange={(e) => onEmphasis(e.target.value)}
            />
          </label>
        </div>
      )}
    </Card>
  );
}
