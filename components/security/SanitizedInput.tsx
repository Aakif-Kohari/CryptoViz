"use client";

import { useId } from "react";
import { useSanitizedInput } from "../../hooks/useSanitizedInput";
import type { SanitizationOptions } from "../../lib/security/inputSanitization";

export interface SanitizedInputProps {
  label: string;
  initialValue?: string;
  options?: SanitizationOptions;
  multiline?: boolean;
  placeholder?: string;
  onSanitizedChange?: (value: string) => void;
}

export default function SanitizedInput({
  label,
  initialValue = "",
  options = {},
  multiline = false,
  placeholder,
  onSanitizedChange,
}: SanitizedInputProps) {
  const id = useId();
  const input = useSanitizedInput(initialValue, options);
  const warningId = `${id}-warnings`;

  function handleBlur() {
    const result = input.sanitizeNow();
    onSanitizedChange?.(result.value);
  }

  const sharedProps = {
    id,
    value: input.rawValue,
    onChange: input.onChange,
    onBlur: handleBlur,
    placeholder,
    "aria-describedby": input.warnings.length > 0 ? warningId : undefined,
    className:
      "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2",
  };

  return (
    <label className="block text-sm font-bold text-slate-200">
      {label}
      <span className="mt-2 block">
        {multiline ? <textarea {...sharedProps} rows={5} /> : <input {...sharedProps} />}
      </span>

      {input.changed || input.warnings.length > 0 ? (
        <span
          id={warningId}
          role="status"
          className="mt-2 block rounded-lg border border-amber-300/30 bg-amber-300/10 p-2 text-xs leading-5 text-amber-100"
        >
          {input.warnings.length > 0
            ? input.warnings.join(" ")
            : "Input will be normalized before use."}
        </span>
      ) : null}
    </label>
  );
}
