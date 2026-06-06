import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

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
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const generations = pgTable("generations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  scanId: text("scanId")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["linkedin", "portfolio", "cv"] })
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
