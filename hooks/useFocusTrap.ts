import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.hidden) {
      return false;
    }

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.getAttribute("aria-hidden") !== "true"
    );
  });
}

interface UseFocusTrapOptions {
  enabled: boolean;
  onEscape?: () => void;
}

export function useFocusTrap({
  enabled,
  onEscape,
}: UseFocusTrapOptions): RefObject<HTMLDivElement | null> {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasEnabledRef = useRef(false);

  const focusFirstElement = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const focusableElements = getFocusableElements(dialog);

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return;
    }

    dialog.focus();
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (wasEnabledRef.current) {
        wasEnabledRef.current = false;

        const opener = openerRef.current;
        openerRef.current = null;

        if (opener && opener.isConnected) {
          window.requestAnimationFrame(() => {
            opener.focus();
          });
        }
      }

      return;
    }

    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!wasEnabledRef.current) {
      wasEnabledRef.current = true;

      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLElement) {
        openerRef.current = activeElement;
      }
    }

    const focusFrame = window.requestAnimationFrame(() => {
      focusFirstElement();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentDialog = dialogRef.current;

      if (!currentDialog) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(currentDialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      /*
       * Focus has escaped the dialog. Re-enter at the first
       * focusable element before allowing Tab navigation.
       */
      if (
        !(activeElement instanceof Node) ||
        !currentDialog.contains(activeElement)
      ) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    /*
     * Listen on the document so Tab events originating outside
     * the dialog can be intercepted and returned to the dialog.
     *
     * A document-level listener also receives events originating
     * inside the dialog because keyboard events bubble.
     */
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, focusFirstElement, onEscape]);

  return dialogRef;
}