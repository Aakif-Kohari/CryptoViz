export const ADVISOR_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "details summary",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface AdvisorFocusRegionConfig {
  regionId: string;
  headingId: string;
  closeButtonId?: string;
}

export interface AdvisorFocusState {
  active: boolean;
  focusedElementId: string | null;
  lastTriggerId: string | null;
  regionId: string;
}

export interface AdvisorFocusTarget {
  id: string;
  label: string;
  role: string;
  disabled?: boolean;
  hidden?: boolean;
  tabIndex?: number;
}

export function isFocusableTarget(target: AdvisorFocusTarget): boolean {
  if (target.disabled || target.hidden) return false;
  if (typeof target.tabIndex === "number" && target.tabIndex < 0) return false;

  return ["button", "link", "textbox", "combobox", "summary", "menuitem", "tab"].includes(
    target.role,
  );
}

export function getFirstFocusableTarget(targets: AdvisorFocusTarget[]): AdvisorFocusTarget | null {
  return targets.find(isFocusableTarget) ?? null;
}

export function getNextFocusableTarget(
  targets: AdvisorFocusTarget[],
  currentId: string,
  direction: "forward" | "backward" = "forward",
): AdvisorFocusTarget | null {
  const focusable = targets.filter(isFocusableTarget);
  if (focusable.length === 0) return null;

  const currentIndex = focusable.findIndex((target) => target.id === currentId);
  if (currentIndex === -1) return direction === "forward" ? focusable[0] : focusable.at(-1) ?? null;

  const delta = direction === "forward" ? 1 : -1;
  const nextIndex = (currentIndex + delta + focusable.length) % focusable.length;
  return focusable[nextIndex];
}

export function shouldTrapAdvisorFocus(eventKey: string, shiftKey = false): boolean {
  return eventKey === "Tab" || (eventKey === "Escape" && !shiftKey);
}

export function buildAdvisorFocusState(
  config: AdvisorFocusRegionConfig,
  lastTriggerId: string | null,
  targets: AdvisorFocusTarget[],
): AdvisorFocusState {
  const firstTarget = getFirstFocusableTarget(targets);

  return {
    active: true,
    focusedElementId: firstTarget?.id ?? config.headingId,
    lastTriggerId,
    regionId: config.regionId,
  };
}

export function closeAdvisorFocusState(state: AdvisorFocusState): AdvisorFocusState {
  return {
    ...state,
    active: false,
    focusedElementId: state.lastTriggerId,
  };
}

export function createAdvisorFocusAttributes(config: AdvisorFocusRegionConfig) {
  return {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": config.headingId,
    tabIndex: -1,
    id: config.regionId,
  } as const;
}

export function createAdvisorTriggerAttributes(
  expanded: boolean,
  controlsId: string,
  label = "Open cryptography advisor",
) {
  return {
    type: "button",
    "aria-expanded": expanded,
    "aria-controls": controlsId,
    "aria-label": label,
  } as const;
}

export function createAdvisorCloseAttributes(label = "Close cryptography advisor") {
  return {
    type: "button",
    "aria-label": label,
  } as const;
}

export function createAdvisorLiveRegionMessage(
  isOpen: boolean,
  suggestionCount: number,
): string {
  if (!isOpen) return "Advisor closed. Focus returned to the opening control.";
  if (suggestionCount === 0) return "Advisor opened. No recommendations are currently available.";
  if (suggestionCount === 1) return "Advisor opened. One recommendation is available.";
  return `Advisor opened. ${suggestionCount} recommendations are available.`;
}

export function buildAdvisorKeyboardHelp(): string[] {
  return [
    "Press Enter or Space to open the advisor.",
    "Press Tab to move through advisor controls.",
    "Press Shift + Tab to move backward through advisor controls.",
    "Press Escape to close the advisor and return focus to the trigger.",
    "Use visible focus indicators to confirm the active control.",
  ];
}
