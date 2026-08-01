# Curated Cryptography Video Library

The Curated Cryptography Video Library adds a structured learning resource page
to CryptoViz. It helps learners discover relevant educational videos by topic,
difficulty, and tag.

## What the page includes

- embedded video previews
- keyword search
- topic filter
- difficulty filter
- tag filter
- featured preview area
- responsive video cards
- external watch links
- learning recommendations
- manual testing checklist

## Route

```text
/resources/video-library
```

## Topics covered

- foundations
- symmetric encryption
- asymmetric encryption
- key exchange
- hashing
- elliptic curves
- cryptanalysis
- key derivation

## Notes for maintainers

The video list is stored in `lib/resources/cryptographyVideoLibrary.ts` so new
entries can be added without changing the UI component. Each entry should include:

- title
- topic
- difficulty
- duration
- provider
- tags
- description
- embed URL
- watch URL
- recommended use case

## Manual testing

1. Open `/resources/video-library`.
2. Confirm embedded previews load responsively.
3. Search for `AES`.
4. Filter by topic.
5. Filter by difficulty.
6. Filter by tag.
7. Open an external video link.
8. Resize to mobile width and confirm cards remain usable.
