import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import StreamCipherVisualizer from "../../../components/cipher/StreamCipherVisualizer"
import type { CipherStep } from "../../../lib/cipher/types"

describe("StreamCipherVisualizer", () => {
  it("renders RC4's 16x16 permutation and pointers", () => {
    const step: CipherStep & { visualState: unknown } = {
      index: 0,
      label: "PRGA",
      inputState: "",
      outputState: "",
      visualState: {
        mode: "permutation",
        values: Array.from({ length: 256 }, (_, i) => i),
        i: 4,
        j: 9,
        emitted: 0xab,
      },
    }
    render(<StreamCipherVisualizer cipherId="rc4" step={step} stepIndex={0} stepCount={3} />)
    expect(screen.getByLabelText("RC4 permutation state visualizer")).toBeInTheDocument()
    expect(screen.getByText("emitted = 0xab")).toBeInTheDocument()
    expect(screen.getByText("i")).toBeInTheDocument()
  })

  it("renders a 4x4 ARX matrix", () => {
    const step: CipherStep & { visualState: unknown } = {
      index: 0,
      label: "double round",
      inputState: "",
      outputState: "",
      visualState: {
        mode: "matrix",
        values: Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => `0x${(r * 4 + c).toString(16)}`),
        ),
        active: [0, 5, 10, 15],
        phase: "diagonal quarter-round",
      },
    }
    render(<StreamCipherVisualizer cipherId="chacha20" step={step} stepIndex={1} stepCount={5} />)
    expect(screen.getByLabelText("ChaCha20 state matrix visualizer")).toBeInTheDocument()
    expect(screen.getByText("diagonal quarter-round")).toBeInTheDocument()
  })

  it("renders register chains and majority state", () => {
    const step: CipherStep & { visualState: unknown } = {
      index: 0,
      label: "clock",
      inputState: "",
      outputState: "",
      visualState: {
        mode: "registers",
        registers: [
          { name: "R1", bits: [0, 1, 0, 1], clockBit: 2, taps: [1, 3] },
          { name: "R2", bits: [1, 1, 0], clockBit: 1, taps: [2] },
        ],
        majority: 1,
        outputBit: 0,
        feedback: [1, 0],
      },
    }
    render(<StreamCipherVisualizer cipherId="a5-1" step={step} stepIndex={2} stepCount={7} />)
    expect(screen.getByLabelText("Shift-register state visualizer")).toBeInTheDocument()
    expect(screen.getByText(/majority =/)).toBeInTheDocument()
  })

  it("returns no visualizer when a cipher has no instrumented visual state", () => {
    const step: CipherStep = { index: 0, label: "plain", inputState: "", outputState: "" }
    const { container } = render(
      <StreamCipherVisualizer cipherId="rc4" step={step} stepIndex={0} stepCount={1} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
