# Shared Input Sanitization

Issue #725 reports that repository guidelines recommend sanitization, but the
implementation is inconsistent. This update adds a reusable sanitization layer
that can be used across CryptoViz user-input surfaces.

## Added utilities

- `sanitizeUserInput`
- `sanitizePlainText`
- `sanitizeSearchQuery`
- `sanitizeHexInput`
- `sanitizeIdentifier`
- `sanitizeUrl`
- `sanitizeMarkdown`
- `sanitizeRecord`
- `sanitizedValue`
- `escapeHtml`
- `stripControlCharacters`

## Added React helpers

- `useSanitizedInput`
- `SanitizedInput`

## Recommended usage by surface

| Surface | Recommended helper |
|---|---|
| Cipher plaintext/ciphertext/key hex fields | `sanitizeHexInput` |
| Search boxes and filters | `sanitizeSearchQuery` |
| Titles, labels, names, short notes | `sanitizePlainText` |
| External references | `sanitizeUrl` |
| Markdown-like educational notes | `sanitizeMarkdown` |
| Multi-field forms | `sanitizeRecord` |

## Example

```ts
import { sanitizeHexInput } from "@/lib/security/inputSanitization";

const sanitized = sanitizeHexInput(userKey);

if (sanitized.warnings.length > 0) {
  console.warn(sanitized.warnings);
}

encryptRc6Block(plaintext, sanitized.value);
```

## React example

```tsx
import SanitizedInput from "@/components/security/SanitizedInput";

<SanitizedInput
  label="Cipher key"
  options={{ kind: "hex", maxLength: 64 }}
  onSanitizedChange={(value) => setKey(value)}
/>
```

## Manual testing

1. Enter HTML into a text input and confirm it is escaped.
2. Enter invalid characters into a hex field and confirm only hex remains.
3. Enter a `javascript:` URL and confirm it is rejected.
4. Enter dangerous markdown links and confirm they are neutralized.
5. Confirm warnings are shown when input is changed or truncated.
6. Run the focused sanitization unit tests.
7. Run lint and build.
