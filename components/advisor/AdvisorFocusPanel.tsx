"use client";

import { useId, useMemo, useState } from "react";
import {
  buildAdvisorKeyboardHelp,
  createAdvisorCloseAttributes,
  createAdvisorFocusAttributes,
  createAdvisorLiveRegionMessage,
  createAdvisorTriggerAttributes,
} from "../../lib/accessibility/advisorFocus";
import { useAdvisorFocus } from "../../hooks/useAdvisorFocus";

export interface AdvisorFocusPanelProps {
  title?: string;
  suggestions?: string[];
}

export default function AdvisorFocusPanel({
  title = "Cryptography Advisor",
  suggestions = [
    "Use authenticated encryption when confidentiality and integrity are both required.",
    "Avoid ECB mode for repeated structured data.",
    "Prefer standards-backed primitives and audited implementations.",
  ],
}: AdvisorFocusPanelProps) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const regionId = `advisor-focus-region-${generatedId}`;
  const headingId = `advisor-focus-heading-${generatedId}`;
  const { regionRef, rememberTrigger } = useAdvisorFocus({
    isOpen: open,
    onClose: () => setOpen(false),
  });

  const liveMessage = useMemo(
    () => createAdvisorLiveRegionMessage(open, suggestions.length),
    [open, suggestions.length],
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Advisor accessibility
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Keyboard focus is trapped inside the advisor while open and restored to the
            trigger when closed.
          </p>
        </div>

        <button
          {...createAdvisorTriggerAttributes(open, regionId)}
          ref={rememberTrigger}
          onClick={() => setOpen(true)}
          className="rounded-xl border border-cyan-300/40 px-4 py-3 text-sm font-bold text-cyan-100 outline-none transition hover:bg-cyan-300/10 focus-visible:ring-4 focus-visible:ring-cyan-300/40"
        >
          Open advisor
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div
            {...createAdvisorFocusAttributes({ regionId, headingId })}
            ref={regionRef as React.RefObject<HTMLDivElement>}
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={headingId} className="text-2xl font-black text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Review the recommendations below. Press Escape to close this panel.
                </p>
              </div>

              <button
                {...createAdvisorCloseAttributes()}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 outline-none transition hover:border-cyan-300/50 hover:text-cyan-100 focus-visible:ring-4 focus-visible:ring-cyan-300/40"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {suggestions.map((suggestion, index) => (
                <article
                  key={suggestion}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Recommendation {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{suggestion}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 outline-none transition hover:border-cyan-300/50 hover:text-cyan-100 focus-visible:ring-4 focus-visible:ring-cyan-300/40"
                  >
                    Mark useful
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-black text-cyan-100">Keyboard help</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                {buildAdvisorKeyboardHelp().map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
