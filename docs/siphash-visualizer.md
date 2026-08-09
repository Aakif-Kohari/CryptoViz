# SipHash Visualizer

The SipHash Visualizer adds an educational route for exploring SipHash-style keyed hashing with an interactive state trace.

## Route

```text
/visualizer/siphash
```

## Features

- editable message input
- editable 128-bit key input
- SipHash-2-4 default configuration
- compression round control
- finalization round control
- 64-bit message block list
- four-word internal state trace
- output in hexadecimal and decimal
- friendly validation errors
- responsive layout

## Reference vectors

With key `000102030405060708090A0B0C0D0E0F`, the empty message returns `310E0EDD47DB6F72`.

## Manual testing

1. Open `/visualizer/siphash`.
2. Change the message and confirm the hash output updates.
3. Change the 16-byte key and confirm the output changes.
4. Try invalid key input and confirm a friendly error appears.
5. Switch compression and finalization round counts.
6. Confirm the block list and state trace update.
7. Confirm the page is responsive on desktop, tablet, and mobile widths.
8. Run the focused SipHash unit tests.
