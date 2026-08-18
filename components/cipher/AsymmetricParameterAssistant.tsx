
"use client"

import { useMemo, useState } from "react"
import {
  CURVE_PRESETS,
  PQC_PRESETS,
  isProbablePrime,
  parseBigInt,
  pointOnCurve,
  primitiveRootCheck,
  validatePrimePair,
  type ValidationResult,
} from "../../lib/cipher/asymmetric/parameterValidation"

interface Props {
  cipherId: string
  onApplyKey: (key: string) => void
}

const DLOG = new Set(["dh", "elgamal", "cramer-shoup"])
const FACTORING = new Set(["paillier", "rabin"])
const CURVES = new Set(["ecc", "ecdsa", "ecies", "sm2", "gost-r34-10", "schnorr"])
const PQC = new Set(["ml-kem", "frodokem"])

function Status({ result }: { result: ValidationResult }) {
  if (result.state === "idle") return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border px-3 py-2 text-xs ${
        result.state === "valid"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          : result.state === "checking"
            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      <div className="font-semibold">{result.message}</div>
      {result.details?.map((detail) => <div key={detail} className="mt-1 opacity-80">{detail}</div>)}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 font-mono text-xs text-zinc-900 outline-none focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100"
      />
    </label>
  )
}

export default function AsymmetricParameterAssistant({ cipherId, onApplyKey }: Props) {
  const [p, setP] = useState("23")
  const [g, setG] = useState("5")
  const [x, setX] = useState("6")
  const [primeP, setPrimeP] = useState("13")
  const [primeQ, setPrimeQ] = useState("17")
  const [curveId, setCurveId] = useState("p256")
  const [pointX, setPointX] = useState("")
  const [pointY, setPointY] = useState("")
  const [pqcId, setPqcId] = useState("ml-kem-768")

  const curve = CURVE_PRESETS.find((item) => item.id === curveId) ?? CURVE_PRESETS[0]
  const pqc = PQC_PRESETS.find((item) => item.id === pqcId) ?? PQC_PRESETS[0]

  const dlogResult = useMemo<ValidationResult>(() => {
    const pp = parseBigInt(p)
    const gg = parseBigInt(g)
    if (pp === null || gg === null) return { state: "invalid", message: "Enter integer p and g." }
    return primitiveRootCheck(pp, gg)
  }, [p, g])

  const factoringResult = useMemo<ValidationResult>(() => {
    const pp = parseBigInt(primeP)
    const qq = parseBigInt(primeQ)
    if (pp === null || qq === null) return { state: "invalid", message: "Enter integer p and q." }
    return validatePrimePair(pp, qq, cipherId === "rabin")
  }, [primeP, primeQ, cipherId])

  const curveResult = useMemo<ValidationResult>(() => {
    const xx = parseBigInt(pointX)
    const yy = parseBigInt(pointY)
    if (xx === null || yy === null) {
      return { state: "checking", message: "Enter x and y to verify a custom point." }
    }
    return pointOnCurve(xx, yy, curve)
      ? { state: "valid", message: `${curve.name}: point is on the curve.` }
      : { state: "invalid", message: `${curve.name}: point is not on the curve.` }
  }, [pointX, pointY, curve])

  const apply = (value: string) => onApplyKey(value)

  if (!DLOG.has(cipherId) && !FACTORING.has(cipherId) && !CURVES.has(cipherId) && !PQC.has(cipherId)) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Parameter Assistant</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          This asymmetric scheme does not expose structured domain parameters in its current cipher API.
          The assistant leaves its existing key format unchanged.
        </p>
      </section>
    )
  }

  return (
    <section aria-label="Asymmetric parameter assistant" className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm dark:border-teal-900 dark:bg-zinc-900/40">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-zinc-950 dark:text-white">Parameter Assistant</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Build a domain-valid educational key instead of typing composite parameters by hand.
        </p>
      </div>

      {DLOG.has(cipherId) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prime modulus p" value={p} onChange={setP} />
            <Field label="Generator g" value={g} onChange={setG} />
          </div>
          <Field label="Private exponent x" value={x} onChange={setX} />
          <Status result={dlogResult} />
          <button
            type="button"
            disabled={dlogResult.state !== "valid"}
            onClick={() => {
              if (cipherId === "dh") apply(`${p},${g}`)
              else if (cipherId === "elgamal") apply(`${p},${g},${modPowForY(p, g, x)}`)
              else apply("")
            }}
            className="w-full rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use verified parameters
          </button>
        </div>
      )}

      {FACTORING.has(cipherId) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prime p" value={primeP} onChange={setPrimeP} />
            <Field label="Prime q" value={primeQ} onChange={setPrimeQ} />
          </div>
          <Status result={factoringResult} />
          {factoringResult.details?.map((detail) => (
            <div key={detail} className="font-mono text-[10px] text-zinc-500">{detail}</div>
          ))}
          <button
            type="button"
            disabled={factoringResult.state !== "valid"}
            onClick={() => {
              if (cipherId === "rabin") apply(`${primeP},${primeQ}`)
              else apply(`${BigInt(primeP) * BigInt(primeQ)},${BigInt(primeP) * BigInt(primeQ) + 1n}`)
            }}
            className="w-full rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            Use prime pair
          </button>
        </div>
      )}

      {CURVES.has(cipherId) && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-zinc-500">Standard curve</span>
            <select
              value={curveId}
              onChange={(e) => setCurveId(e.target.value)}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              {CURVE_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="rounded-lg bg-zinc-50 p-3 text-[10px] font-mono dark:bg-zinc-950/50">
            <div>Gx = {curve.gx.toString(16)}</div>
            <div>Gy = {curve.gy.toString(16)}</div>
            <div>n = {curve.order.toString(16)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Custom point x" value={pointX} onChange={setPointX} placeholder="decimal or 0x..." />
            <Field label="Custom point y" value={pointY} onChange={setPointY} placeholder="decimal or 0x..." />
          </div>
          <Status result={curveResult} />
          <button
            type="button"
            onClick={() => apply(curve.privateKey)}
            className="w-full rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Use {curve.name} preset
          </button>
        </div>
      )}

      {PQC.has(cipherId) && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-zinc-500">Security parameter set</span>
            <select
              value={pqcId}
              onChange={(e) => setPqcId(e.target.value)}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              {PQC_PRESETS.filter((item) => cipherId === "ml-kem" ? item.id.startsWith("ml-kem") : item.id.startsWith("frodo")).map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {item.securityLevel}</option>
              ))}
            </select>
          </label>
          <div className="rounded-lg border border-zinc-200 p-3 text-xs dark:border-zinc-800">
            <div className="font-semibold">{pqc.name}</div>
            <div className="mt-1 text-zinc-500">{pqc.dimension} · {pqc.matrixShape}</div>
            <div className="mt-1 text-zinc-500">{pqc.description}</div>
          </div>
          <button
            type="button"
            onClick={() => apply(pqc.keyTemplate)}
            className="w-full rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Use parameter set
          </button>
        </div>
      )}
    </section>
  )
}

function modPowForY(p: string, g: string, x: string): string {
  const pp = BigInt(p), gg = BigInt(g), xx = BigInt(x)
  let r = 1n, b = gg % pp, e = xx
  while (e > 0n) {
    if (e & 1n) r = (r * b) % pp
    b = (b * b) % pp
    e >>= 1n
  }
  return r.toString()
}
