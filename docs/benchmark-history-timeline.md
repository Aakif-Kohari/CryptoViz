# Benchmark History Timeline

The Benchmark History Timeline is an educational performance-analysis feature
for CryptoViz. It shows how benchmark values change over multiple runs instead
of relying on one isolated number.

## What the timeline shows

- algorithm filter
- metric filter
- throughput trend
- latency trend
- memory trend
- improved / regressed / unchanged labels
- algorithm summary cards
- run notes
- benchmark history table

## Why history matters

A single benchmark can be noisy. Repeated benchmark runs help show whether a
change is consistently improving performance or only producing a one-off result.

When comparing real benchmark data, keep the environment stable:

- same browser/runtime
- same device
- same input sizes
- same worker settings
- same warm-up strategy

## Manual testing

1. Open `/benchmarks/history`.
2. Confirm the default AES-GCM throughput timeline renders.
3. Switch algorithms and confirm points update.
4. Switch metric between throughput, latency, and memory.
5. Confirm trend labels update correctly.
6. Confirm summary cards update for the selected metric.
7. Resize to mobile width and confirm the page remains usable.
