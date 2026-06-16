import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

/**
 * Extract plain text from an uploaded document buffer. PDF via pdf-parse,
 * .docx via mammoth, everything else read as UTF-8. Framework-agnostic.
 */
export async function extractText(
  filename: string,
  buffer: Buffer
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text.trim();
  }

  if (ext === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }

  // .txt / .md / unknown — best-effort UTF-8.
  return buffer.toString("utf-8").trim();
}
