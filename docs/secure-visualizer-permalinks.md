# Secure visualizer permalinks

Visualizer permalink query parameters are an untrusted input boundary.

`parseVisualizerPermalink` now sanitizes every text value that comes from the
URL before returning it to visualizer consumers:

- `input`
- `key`
- `bobSecret`
- `aesMode`

Text values are normalized with `sanitizePlainText` and capped at 4096
characters. Controlled values such as `direction`, booleans, and numeric
settings continue to be parsed through their existing allowlists/ranges.

The builder does not sanitize application state before encoding it because
building a URL is not the trust boundary. The parser is the boundary where
untrusted URL data enters the application.

## Security properties

- HTML-sensitive characters are escaped.
- Control characters and unsafe whitespace are normalized.
- Oversized values are truncated to 4096 characters.
- `direction` accepts only `encrypt` or `decrypt`.
- `rounds` remains clamped to 4–31.
- `step` remains non-negative.

Focused tests cover reflected-XSS payloads, oversized parameters, control
characters, and constrained enum/numeric parameters.
