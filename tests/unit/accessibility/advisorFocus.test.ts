import { describe, expect, it } from "vitest";
import {
  buildAdvisorFocusState,
  buildAdvisorKeyboardHelp,
  closeAdvisorFocusState,
  createAdvisorCloseAttributes,
  createAdvisorFocusAttributes,
  createAdvisorLiveRegionMessage,
  createAdvisorTriggerAttributes,
  getFirstFocusableTarget,
  getNextFocusableTarget,
  isFocusableTarget,
  shouldTrapAdvisorFocus,
} from "../../../lib/accessibility/advisorFocus";

const targets = [
  { id: "heading", label: "Heading", role: "heading" },
  { id: "close", label: "Close", role: "button" },
  { id: "disabled", label: "Disabled", role: "button", disabled: true },
  { id: "link", label: "Learn more", role: "link" },
  { id: "hidden", label: "Hidden", role: "button", hidden: true },
];

describe("advisor focus accessibility utilities", () => {
  it("detects focusable advisor targets", () => {
    expect(isFocusableTarget(targets[0])).toBe(false);
    expect(isFocusableTarget(targets[1])).toBe(true);
    expect(isFocusableTarget(targets[2])).toBe(false);
    expect(isFocusableTarget(targets[4])).toBe(false);
  });

  it("finds the first focusable target", () => {
    expect(getFirstFocusableTarget(targets)?.id).toBe("close");
  });

  it("cycles focus forward and backward", () => {
    expect(getNextFocusableTarget(targets, "close", "forward")?.id).toBe("link");
    expect(getNextFocusableTarget(targets, "link", "forward")?.id).toBe("close");
    expect(getNextFocusableTarget(targets, "close", "backward")?.id).toBe("link");
  });

  it("falls back when current focus is outside the advisor", () => {
    expect(getNextFocusableTarget(targets, "outside", "forward")?.id).toBe("close");
    expect(getNextFocusableTarget(targets, "outside", "backward")?.id).toBe("link");
  });

  it("tracks keys used by the focus trap", () => {
    expect(shouldTrapAdvisorFocus("Tab")).toBe(true);
    expect(shouldTrapAdvisorFocus("Escape")).toBe(true);
    expect(shouldTrapAdvisorFocus("Escape", true)).toBe(false);
    expect(shouldTrapAdvisorFocus("Enter")).toBe(false);
  });

  it("builds initial and closed focus state", () => {
    const state = buildAdvisorFocusState(
      {
        regionId: "advisor",
        headingId: "heading",
      },
      "trigger",
      targets,
    );

    expect(state).toEqual({
      active: true,
      focusedElementId: "close",
      lastTriggerId: "trigger",
      regionId: "advisor",
    });

    expect(closeAdvisorFocusState(state)).toMatchObject({
      active: false,
      focusedElementId: "trigger",
    });
  });

  it("creates accessible advisor region attributes", () => {
    expect(
      createAdvisorFocusAttributes({
        regionId: "advisor",
        headingId: "heading",
      }),
    ).toEqual({
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "heading",
      tabIndex: -1,
      id: "advisor",
    });
  });

  it("creates accessible trigger and close button attributes", () => {
    expect(createAdvisorTriggerAttributes(true, "advisor")).toMatchObject({
      type: "button",
      "aria-expanded": true,
      "aria-controls": "advisor",
    });

    expect(createAdvisorCloseAttributes()).toMatchObject({
      type: "button",
      "aria-label": "Close cryptography advisor",
    });
  });

  it("creates live region messages", () => {
    expect(createAdvisorLiveRegionMessage(false, 0)).toMatch(/closed/i);
    expect(createAdvisorLiveRegionMessage(true, 0)).toMatch(/no recommendations/i);
    expect(createAdvisorLiveRegionMessage(true, 1)).toMatch(/one recommendation/i);
    expect(createAdvisorLiveRegionMessage(true, 3)).toMatch(/3 recommendations/i);
  });

  it("documents keyboard help", () => {
    const help = buildAdvisorKeyboardHelp();

    expect(help).toContain("Press Escape to close the advisor and return focus to the trigger.");
    expect(help.some((item) => item.includes("Shift + Tab"))).toBe(true);
  });
});
