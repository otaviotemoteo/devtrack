import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import type { Experience } from "@/lib/experiences";

export const scans = pgTable("scans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  config: jsonb("config").notNull(),
  status: text("status", { enum: ["pending", "running", "done", "error"] })
    .notNull()
    .default("pending"),
  progress: integer("progress").notNull().default(0),
  rawData: jsonb("rawData"),
  // Stage-1 Evidence output: distilled, auditable, reused by every generator.
  evidence: jsonb("evidence"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const generations = pgTable("generations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Null for standalone CV/audit generations (no scan involved) — the scan is
  // the only evidence producer, so we never create placeholder scans.
  scanId: text("scanId").references(() => scans.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["linkedin", "portfolio", "cv", "linkedin_audit"],
  })
    .notNull()
    .default("linkedin"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  rawResponse: text("rawResponse"),
  output: jsonb("output"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Cache of the user's GitHub repos plus their pre-scan selection + context.
// Synced from GitHub when the pre-scan screen opens; `selected`/`userContext`
// are user-owned and preserved across re-syncs.
export const repositories = pgTable(
  "repositories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    githubId: integer("githubId").notNull(),
    fullName: text("fullName").notNull(),
    description: text("description"),
    language: text("language"),
    isPrivate: boolean("isPrivate").notNull().default(false),
    isOrg: boolean("isOrg").notNull().default(false),
    owner: text("owner").notNull(),
    selected: boolean("selected").notNull().default(false),
    userContext: text("userContext"),
    lastSyncedAt: timestamp("lastSyncedAt", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.githubId)]
);

// Uploaded documents (CVs), stored as extracted plain text for the analyzer.
export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["cv", "other"] })
    .notNull()
    .default("cv"),
  filename: text("filename").notNull(),
  extractedText: text("extractedText").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Imported LinkedIn profile data, normalized to { headline, about, experience[], skills[] }.
export const linkedinImports = pgTable("linkedin_imports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: text("source", { enum: ["export", "apify"] }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Standing profile context + onboarding state (1:1 with user). The context
// fields (targetRole/industry/extraInstructions) are the default context fed to
// every generator. `onboarded` gates the first-run path picker.
export const profileSettings = pgTable("profile_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  targetRole: text("targetRole"),
  industry: text("industry"),
  extraInstructions: text("extraInstructions"),
  // Situational context: employed users get "sharpening" questions
  // (currentRole/currentCompany), job seekers and students get targeting ones
  // (targetRole/industry). All optional — generators degrade gracefully.
  situation: text("situation", { enum: ["employed", "searching", "student"] }),
  currentRole: text("currentRole"),
  currentCompany: text("currentCompany"),
  currentSince: text("currentSince"), // free text, e.g. "Mar 2022"
  projects: text("projects"), // user-described side/study projects
  // User-managed work experiences (lib/experiences.ts shape). Seeded once from
  // the LinkedIn export / CV analysis with confirmed=false, then user-owned.
  experiences: jsonb("experiences").$type<Experience[]>().notNull().default([]),
  onboarded: boolean("onboarded").notNull().default(false),
  firstChoice: text("firstChoice", { enum: ["linkedin", "cv", "github"] }),
  // "Skip for now" on the profile completion card — persists, never re-nags.
  contextPromptDismissed: boolean("contextPromptDismissed")
    .notNull()
    .default(false),
  githubLogin: text("githubLogin"), // cached @handle for the profile header
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
