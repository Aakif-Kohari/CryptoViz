# Docs UI Theme Sync

Issue #479 asks for the Docs UI to match the CryptoViz website theme.

## Route

```text
/docs
```

## Files added

- `app/docs/page.tsx`
- `components/docs/DocsThemeLayout.tsx`
- `components/docs/DocsLandingContent.tsx`
- `lib/docs/docsTheme.ts`
- `tests/unit/docs/docsTheme.test.ts`

## What changed

- Added a themed Docs landing page.
- Added reusable docs layout wrapper.
- Added grouped docs navigation data.
- Added responsive docs cards.
- Added main-site style hero section.
- Added dark background, glass cards, cyan accents, rounded panels, and focus rings.
- Added breadcrumb styling.
- Added manual verification checklist.
- Added focused unit tests.

## Design alignment

The docs surface now uses the same visual language as the rest of CryptoViz:

- dark slate background
- radial gradient hero
- rounded `3xl` cards
- subtle white borders
- cyan accent pills
- responsive card grids
- keyboard-visible focus rings
- semantic landmarks and nav labels

## Manual testing

1. Open `/docs`.
2. Confirm the page uses the same dark CryptoViz theme as visualizer pages.
3. Confirm docs cards use rounded glass styling.
4. Confirm docs navigation is grouped by category.
5. Confirm all docs links have visible focus states.
6. Resize to desktop, tablet, and mobile widths.
7. Confirm docs links are reachable from the existing navigation if the site has a docs nav entry.
8. Run the focused docs theme unit tests.
