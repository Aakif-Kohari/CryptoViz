# Avalanche Effect Visualizer

The Avalanche Effect Visualizer demonstrates how a one-bit input change can
propagate through multiple rounds of a cryptographic-style mixing function.

## Route

```text
/visualizer/avalanche-effect
```

## Features

- editable input message
- one-bit flip slider
- algorithm selector
- round-count slider
- input bit comparison
- per-round heatmap
- per-round output comparison
- changed-bit count
- percentage difference
- average difference
- peak changed bits
- responsive layout

## Algorithms

This visualizer uses teaching-oriented toy round functions rather than claiming
to implement a production cipher:

- Toy Feistel
- XOR + Rotate
- Mixing Hash

## Educational goal

A strong diffusion layer should cause a small input change to spread across many
output bits. The ideal avalanche effect is often discussed as roughly half the
output bits changing when one input bit changes.

## Manual testing

1. Open `/visualizer/avalanche-effect`.
2. Change the message and confirm the round table updates.
3. Move the flipped-bit slider and confirm the bit comparison updates.
4. Switch algorithms and confirm statistics change.
5. Confirm heatmap cells highlight changed bits by round.
6. Confirm final percentage difference and average difference are visible.
7. Resize to desktop, tablet, and mobile widths.
8. Run the focused avalanche effect unit tests.
