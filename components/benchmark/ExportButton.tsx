"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BenchmarkResult,
  BenchmarkSession,
  DeviceInfo,
} from "@/types/benchmark";
import { exportToCSV, exportSessionToCSV } from "@/lib/utils/csvExport";
import {
  exportBenchmarkAsJson,
  exportBenchmarkAsMarkdown,
} from "@/lib/benchmark/benchmarkExport";

interface ExportButtonProps {
  results: BenchmarkResult[];
  session?: BenchmarkSession | null;
  disabled?: boolean;
}

type ExportAction = "csv" | "session-csv" | "markdown" | "json";

function downloadText(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  try {
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

function getCurrentDeviceInfo(): DeviceInfo {
  const screenInfo = typeof screen !== "undefined" ? screen : undefined;

  return {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    hardwareConcurrency:
      typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 1,
    language:
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "unknown",
    platform:
      typeof navigator !== "undefined" && navigator.platform
        ? navigator.platform
        : "unknown",
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"
        : "unknown",
    screen: {
      width: screenInfo?.width ?? 0,
      height: screenInfo?.height ?? 0,
      colorDepth: screenInfo?.colorDepth ?? 0,
      pixelDepth: screenInfo?.pixelDepth ?? 0,
    },
  };
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function" &&
    typeof window !== "undefined" &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is unavailable in this environment.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Clipboard copy command failed.");
    }
  } finally {
    textarea.remove();
  }
}

export default function ExportButton({
  results,
  session,
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ExportAction | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDisabled = disabled || results.length === 0 || activeAction !== null;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleExport = useCallback(
    async (action: ExportAction) => {
      if (disabled || results.length === 0 || activeAction !== null) {
        return;
      }

      setActiveAction(action);
      setStatus(null);

      try {
        const environment = session?.deviceInfo ?? getCurrentDeviceInfo();
        const timestamp = Date.now();

        switch (action) {
          case "csv":
            exportToCSV(results, `benchmark-results-${timestamp}.csv`);
            setStatus("CSV exported.");
            break;

          case "session-csv":
            if (!session) {
              throw new Error("No benchmark session is available.");
            }
            exportSessionToCSV(session);
            setStatus("Session CSV exported.");
            break;

          case "markdown": {
            const markdown = exportBenchmarkAsMarkdown(results, environment);
            await copyTextToClipboard(markdown);
            setStatus("Markdown table copied.");
            break;
          }

          case "json": {
            const json = exportBenchmarkAsJson(results, environment);
            downloadText(
              json,
              `benchmark-report-${timestamp}.json`,
              "application/json;charset=utf-8",
            );
            setStatus("JSON report exported.");
            break;
          }
        }
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Export failed.",
        );
      } finally {
        setActiveAction(null);
        setIsOpen(false);
      }
    },
    [activeAction, disabled, results, session],
  );

  const buttonLabel = activeAction
    ? "Exporting..."
    : status ?? "Export Benchmark";

  const menuItemClass =
    "block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={isDisabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setStatus(null);
          setIsOpen((open) => !open);
        }}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span className="inline-flex items-center gap-2">
          {buttonLabel}
          <span aria-hidden="true">▾</span>
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Benchmark export formats"
          className="absolute right-0 z-50 mt-2 min-w-64 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <button
            type="button"
            role="menuitem"
            disabled={activeAction !== null}
            onClick={() => void handleExport("csv")}
            className={menuItemClass}
          >
            Export as CSV (.csv)
          </button>

          {session && (
            <button
              type="button"
              role="menuitem"
              disabled={activeAction !== null}
              onClick={() => void handleExport("session-csv")}
              className={menuItemClass}
            >
              Export Session as CSV (.csv)
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={activeAction !== null}
            onClick={() => void handleExport("markdown")}
            className={menuItemClass}
          >
            Copy Markdown Table
            <span className="ml-1 text-[10px] text-zinc-400">
              GitHub PRs
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={activeAction !== null}
            onClick={() => void handleExport("json")}
            className={`${menuItemClass} text-teal-700 dark:text-teal-300`}
          >
            Export JSON Benchmark Report (.json)
          </button>
        </div>
      )}
    </div>
  );
}
