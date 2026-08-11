"use client";

import { useCallback, useMemo, useState } from "react";
import {
  sanitizeUserInput,
  type SanitizationOptions,
  type SanitizationResult,
} from "../lib/security/inputSanitization";

export interface UseSanitizedInputResult {
  rawValue: string;
  value: string;
  changed: boolean;
  warnings: string[];
  setRawValue: (value: string) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  sanitizeNow: () => SanitizationResult;
  reset: () => void;
}

export function useSanitizedInput(
  initialValue = "",
  options: SanitizationOptions = {},
): UseSanitizedInputResult {
  const [rawValue, setRawValue] = useState(initialValue);

  const result = useMemo(() => sanitizeUserInput(rawValue, options), [rawValue, options]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRawValue(event.target.value);
    },
    [],
  );

  const sanitizeNow = useCallback(() => {
    const next = sanitizeUserInput(rawValue, options);
    setRawValue(next.value);
    return next;
  }, [rawValue, options]);

  const reset = useCallback(() => {
    setRawValue(initialValue);
  }, [initialValue]);

  return {
    rawValue,
    value: result.value,
    changed: result.changed,
    warnings: result.warnings,
    setRawValue,
    onChange,
    sanitizeNow,
    reset,
  };
}
