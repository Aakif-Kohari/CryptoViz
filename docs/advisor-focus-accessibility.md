# Advisor Focus Accessibility

Issue #612 reports that keyboard focus in the Advisor is inconsistent. This
update introduces a reusable focus-management layer for Advisor-style panels.

## Accessibility behavior

The Advisor panel should:

- expose the panel as a dialog
- connect the dialog to a visible heading with `aria-labelledby`
- mark the panel as modal with `aria-modal`
- move focus into the panel when it opens
- keep Tab / Shift+Tab focus inside the panel while open
- close on Escape
- restore focus to the trigger when closed
- provide visible `focus-visible` styles
- announce open/close state through a polite live region

## Added utilities

- `createAdvisorFocusAttributes`
- `createAdvisorTriggerAttributes`
- `createAdvisorCloseAttributes`
- `createAdvisorLiveRegionMessage`
- `buildAdvisorFocusState`
- `closeAdvisorFocusState`
- `getFirstFocusableTarget`
- `getNextFocusableTarget`
- `buildAdvisorKeyboardHelp`

## Added hook

`useAdvisorFocus` handles runtime focus movement:

- remembers the opening trigger
- focuses the first interactive element on open
- traps Tab and Shift+Tab
- closes on Escape
- restores focus after close

## Manual testing

1. Open the Advisor using keyboard only.
2. Confirm focus moves into the Advisor.
3. Press Tab until the last control.
4. Confirm Tab wraps back to the first control.
5. Press Shift+Tab on the first control.
6. Confirm focus wraps to the last control.
7. Press Escape.
8. Confirm the Advisor closes and focus returns to the original trigger.
9. Confirm visible focus rings are present on all Advisor controls.
