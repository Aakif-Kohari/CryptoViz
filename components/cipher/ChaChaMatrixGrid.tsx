interface Props {
  values: string[][]
  active: number[]
  phase?: string
}

export default function ChaChaMatrixGrid({ values, active, phase }: Props) {
  return (
    <div>
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5" aria-label="4 by 4 stream cipher state matrix">
        {values.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => {
            const index = rowIndex * 4 + colIndex
            const isActive = active.includes(index)
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                title={`word ${index}: ${value}${isActive ? " — active quarter-round word" : ""}`}
                className={[
                  "rounded-lg border p-2 text-center font-mono text-[10px] transition-all",
                  isActive
                    ? "border-teal-400 bg-teal-50 text-teal-800 shadow-sm dark:border-teal-500 dark:bg-teal-950/30 dark:text-teal-200"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300",
                ].join(" ")}
              >
                <span className="block text-[9px] text-zinc-400">{index}</span>
                {value}
              </div>
            )
          }),
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>Active words: {active.length ? active.join(", ") : "none"}</span>
        <span className="font-semibold">{phase ?? "state snapshot"}</span>
      </div>
    </div>
  )
}
