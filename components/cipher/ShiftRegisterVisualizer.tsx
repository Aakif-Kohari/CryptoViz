interface Register {
  name: string
  bits: number[]
  clockBit?: number
  taps?: number[]
}

interface Props {
  registers: Register[]
  majority?: number
  outputBit?: number
  feedback?: number[]
}

function RegisterRow({ register }: { register: Register }) {
  const taps = new Set(register.taps ?? [])
  return (
    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="font-bold text-zinc-800 dark:text-zinc-200">{register.name}</span>
        <span className="text-zinc-500">
          {register.bits.length} bits
          {register.clockBit !== undefined ? ` · clock ${register.clockBit}` : ""}
        </span>
      </div>
      <div className="flex min-w-0 gap-px overflow-hidden rounded">
        {register.bits.map((bit, index) => (
          <div
            key={index}
            title={`bit ${index}: ${bit}${taps.has(index) ? " — feedback tap" : ""}`}
            className={[
              "flex h-6 min-w-2 flex-1 items-center justify-center text-[8px] font-mono",
              taps.has(index)
                ? "bg-amber-400 text-amber-950"
                : register.clockBit === index
                  ? "bg-teal-500 text-white"
                  : bit
                    ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            ].join(" ")}
          >
            {bit}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ShiftRegisterVisualizer({
  registers,
  majority,
  outputBit,
  feedback,
}: Props) {
  return (
    <div className="space-y-2">
      {registers.map((register) => (
        <RegisterRow key={register.name} register={register} />
      ))}
      <div className="flex flex-wrap gap-3 rounded-lg bg-zinc-50 p-2 text-[11px] dark:bg-zinc-950/40">
        {majority !== undefined && <span>majority = <b>{majority}</b></span>}
        {outputBit !== undefined && <span>output = <b>{outputBit}</b></span>}
        {feedback && <span>feedback = <b>{feedback.join(", ")}</b></span>}
      </div>
    </div>
  )
}
