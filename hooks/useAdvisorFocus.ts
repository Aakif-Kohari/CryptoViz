"use client";

import { useCallback, useEffect, useRef } from "react";
import { ADVISOR_FOCUSABLE_SELECTOR } from "../lib/accessibility/advisorFocus";

export interface UseAdvisorFocusOptions {
  isOpen: boolean;
  onClose: () => void;
  restoreFocus?: boolean;
}

export function useAdvisorFocus({ isOpen, onClose, restoreFocus = true }: UseAdvisorFocusOptions) {
  const regionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const rememberTrigger = useCallback((element: HTMLElement | null) => {
    triggerRef.current = element;
  }, []);

  const getFocusableElements = useCallback(() => {
    if (!regionRef.current) return [];

    return Array.from(
      regionRef.current.querySelectorAll<HTMLElement>(ADVISOR_FOCUSABLE_SELECTOR),
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }, []);

  useEffect(() => {
    if (!isOpen || !regionRef.current) return;

    const focusable = getFocusableElements();
    const first = focusable[0] ?? regionRef.current;

    requestAnimationFrame(() => first.focus());
  }, [getFocusableElements, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        regionRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [getFocusableElements, isOpen, onClose]);

  useEffect(() => {
    if (isOpen || !restoreFocus) return;

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [isOpen, restoreFocus]);

  return {
    regionRef,
    triggerRef,
    rememberTrigger,
    getFocusableElements,
  };
}
