import AdmZip from "adm-zip";
import Papa from "papaparse";

export interface NormalizedExperience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface NormalizedProfile {
  headline: string;
  about: string;
  experience: NormalizedExperience[];
  skills: string[];
}

function parseCsv(content: string): Record<string, string>[] {
  const { data } = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });
  return data;
}

/**
 * Parse LinkedIn's official "Get a copy of your data" export — a ZIP of CSVs —
 * into the normalized profile shape the audit generator consumes.
 * Reads Profile.csv (headline/about), Positions.csv (experience), Skills.csv.
 */
export function parseLinkedInExport(buffer: Buffer): NormalizedProfile {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const read = (name: string): Record<string, string>[] => {
    const entry = entries.find((e) =>
      e.entryName.toLowerCase().endsWith(name.toLowerCase())
    );
    return entry ? parseCsv(entry.getData().toString("utf-8")) : [];
  };

  const profile = read("Profile.csv")[0] ?? {};

  const experience: NormalizedExperience[] = read("Positions.csv")
    .map((p) => {
      const start = (p["Started On"] ?? "").trim();
      const finish = (p["Finished On"] ?? "").trim();
      const period = [start, finish || (start ? "now" : "")]
        .filter(Boolean)
        .join(" – ");
      return {
        company: (p["Company Name"] ?? "").trim(),
        role: (p["Title"] ?? "").trim(),
        period,
        description: (p["Description"] ?? "").trim(),
      };
    })
    .filter((e) => e.company || e.role);

  const skills = read("Skills.csv")
    .map((s) => (s["Name"] ?? "").trim())
    .filter(Boolean);

  return {
    headline: (profile["Headline"] ?? "").trim(),
    about: (profile["Summary"] ?? "").trim(),
    experience,
    skills,
  };
}
