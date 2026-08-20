import { useEffect, useState } from "react"

interface Props {
  values: number[]
  i?: number
  j?: number
  emitted?: number
}

export default function Rc4PermutationGrid({ values, i, j, emitted }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener?.("change", update)
    return () => media.removeEventListener?.("change", update)
  }, [])

  return (
    <div>
      <div className="mb-3 grid grid-cols-16 gap-0.5 overflow-x-auto rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {values.map((value, index) => {
          const activeI = index === i
          const activeJ = index === j
          return (
            <div
              key={index}
              title={`S[${index}] = ${value}${activeI ? " — i pointer" : ""}${activeJ ? " — j pointer" : ""}`}
              className={[
                "relative flex aspect-square min-w-5 items-center justify-center rounded text-[8px] font-mono transition-all",
                !reducedMotion && (activeI || activeJ) ? "duration-200 scale-110" : "",
                activeI && activeJ
                  ? "z-10 bg-violet-500 text-white ring-2 ring-violet-300"
                  : activeI
                    ? "z-10 bg-teal-500 text-white ring-2 ring-teal-300"
                    : activeJ
                      ? "z-10 bg-amber-500 text-white ring-2 ring-amber-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
              ].join(" ")}
            >
              {value.toString(16).padStart(2, "0")}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span><b className="text-teal-600 dark:text-teal-400">i</b> = {i ?? "—"}</span>
        <span><b className="text-amber-600 dark:text-amber-400">j</b> = {j ?? "—"}</span>
        <span>emitted = {emitted === undefined ? "—" : `0x${emitted.toString(16).padStart(2, "0")}`}</span>
      </div>
    </div>
  )
}
