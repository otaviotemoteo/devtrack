"use client";

import { useRef, useState } from "react";

interface DropzoneProps {
  /** Comma-separated accept list, e.g. ".pdf,.docx" */
  accept?: string;
  maxSizeMB?: number;
  title?: string;
  hint?: string;
  onFile: (file: File) => void;
}

export function Dropzone({
  accept,
  maxSizeMB = 10,
  title = "Drop your file here",
  hint,
  onFile,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  function handle(file?: File | null) {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMB} MB)`);
      return;
    }
    setError(null);
    setName(file.name);
    onFile(file);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`flex w-full flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed px-6 py-16 text-center transition-colors ${
          dragging
            ? "border-green bg-green-soft/40"
            : "border-border bg-bg-soft/40 hover:border-green/60"
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-btn border border-border bg-bg text-xl text-ink-soft">
          ↑
        </span>
        <span className="font-display text-xl font-bold text-ink">
          {name ?? title}
        </span>
        {hint && <span className="text-sm text-ink-soft">{hint}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
