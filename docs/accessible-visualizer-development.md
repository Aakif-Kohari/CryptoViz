# Accessible Visualizer Development

CryptoViz visualizers communicate cryptographic transformations primarily
through graphical state changes. Every important visual state must therefore
have an equivalent non-visual representation.

This document defines the accessibility pattern used by interactive
cryptographic visualizers.

## Goals

Accessible visualizers should provide:

- Dynamic ARIA live-region narration.
- Keyboard navigation.
- Textual representations of matrices and grids.
- Natural-language descriptions of cryptographic steps.
- Accessible labels for visual state changes.
- Respect for reduced-motion preferences.

The existing visual representation should remain available. Accessibility
features should provide an equivalent way to understand the same information.

---

## Step Narration

`A11yStepNarrator` provides an invisible live region:
