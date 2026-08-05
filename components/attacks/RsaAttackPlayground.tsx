"use client";

import { useMemo, useState } from "react";
import {
  RSA_ATTACK_PRESETS,
  attackStepsToRows,
  commonModulusAttack,
  fermatFactor,
  hastadBroadcastAttack,
  parseBigIntInput,
  wienerAttack,
} from "../../lib/attacks/rsaAttacks";

type Tab = "fermat" | "wiener" | "common" | "hastad";

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Unable to run RSA attack demo.";
}

export default function RsaAttackPlayground() {
  const [tab, setTab] = useState<Tab>("fermat");
  const [fermatN, setFermatN] = useState(String(RSA_ATTACK_PRESETS.fermat.n));
  const [wienerN, setWienerN] = useState(String(RSA_ATTACK_PRESETS.wiener.n));
  const [wienerE, setWienerE] = useState(String(RSA_ATTACK_PRESETS.wiener.e));
  const [commonN, setCommonN] = useState(String(RSA_ATTACK_PRESETS.commonModulus.n));
  const [commonE1, setCommonE1] = useState(String(RSA_ATTACK_PRESETS.commonModulus.e1));
  const [commonE2, setCommonE2] = useState(String(RSA_ATTACK_PRESETS.commonModulus.e2));
  const [commonC1, setCommonC1] = useState(String(RSA_ATTACK_PRESETS.commonModulus.c1));
  const [commonC2, setCommonC2] = useState(String(RSA_ATTACK_PRESETS.commonModulus.c2));
  const [hastadE, setHastadE] = useState(String(RSA_ATTACK_PRESETS.hastad.e));
  const [hastadRows, setHastadRows] = useState(
    RSA_ATTACK_PRESETS.hastad.moduli
      .map((n, index) => `${RSA_ATTACK_PRESETS.hastad.ciphertexts[index]},${n}`)
      .join("\n"),
  );

  const fermat = useMemo(() => {
    try {
      return { value: fermatFactor(parseBigIntInput(fermatN, "n"), 5000), error: null as string | null };
    } catch (error) {
      return { value: null, error: formatError(error) };
    }
  }, [fermatN]);

  const wiener = useMemo(() => {
    try {
      return {
        value: wienerAttack(parseBigIntInput(wienerE, "e"), parseBigIntInput(wienerN, "n")),
        error: null as string | null,
      };
    } catch (error) {
      return { value: null, error: formatError(error) };
    }
  }, [wienerE, wienerN]);

  const common = useMemo(() => {
    try {
      return {
        value: commonModulusAttack(
          parseBigIntInput(commonN, "n"),
          parseBigIntInput(commonE1, "e1"),
          parseBigIntInput(commonE2, "e2"),
          parseBigIntInput(commonC1, "c1"),
          parseBigIntInput(commonC2, "c2"),
        ),
        error: null as string | null,
      };
    } catch (error) {
      return { value: null, error: formatError(error) };
    }
  }, [commonN, commonE1, commonE2, commonC1, commonC2]);

  const hastad = useMemo(() => {
    try {
      const congruences = hastadRows
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [c, n] = line.split(",").map((value) => value.trim());
          return {
            c: parseBigIntInput(c ?? "", `ciphertext row ${index + 1}`),
            n: parseBigIntInput(n ?? "", `modulus row ${index + 1}`),
          };
        });

      return {
        value: hastadBroadcastAttack(parseBigIntInput(hastadE, "e"), congruences),
        error: null as string | null,
      };
    } catch (error) {
      return { value: null, error: formatError(error) };
    }
  }, [hastadE, hastadRows]);

  const activeSteps =
    tab === "fermat"
      ? fermat.value?.steps
      : tab === "wiener"
        ? wiener.value?.steps
        : tab === "common"
          ? common.value?.steps
          : hastad.value?.steps;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.18),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">RSA cryptanalysis</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              RSA Attack Playground
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              Explore how mathematically valid RSA keys fail when parameters are badly chosen.
              These demos use tiny teaching-size numbers only and render each recovery as a step trace.
            </p>
          </div>
        </header>

        <nav className="grid gap-3 md:grid-cols-4">
          {[
            ["fermat", "Fermat"],
            ["wiener", "Wiener"],
            ["common", "Common modulus"],
            ["hastad", "Håstad"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as Tab)}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                tab === id
                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/50 hover:text-cyan-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            {tab === "fermat" ? (
              <Panel title="Fermat factorization" summary="Works when p and q are too close together.">
                <TextInput label="n" value={fermatN} onChange={setFermatN} />
                <ResultBox
                  error={fermat.error}
                  rows={[
                    ["p", fermat.value?.p],
                    ["q", fermat.value?.q],
                    ["prime gap", fermat.value?.primeGap],
                    ["iterations", fermat.value?.iterations],
                  ]}
                />
              </Panel>
            ) : null}

            {tab === "wiener" ? (
              <Panel title="Wiener's attack" summary="Works when private exponent d is dangerously small.">
                <TextInput label="n" value={wienerN} onChange={setWienerN} />
                <TextInput label="e" value={wienerE} onChange={setWienerE} />
                <ResultBox error={wiener.error} rows={[["recovered d", wiener.value?.d ?? "not found"]]} />
              </Panel>
            ) : null}

            {tab === "common" ? (
              <Panel title="Common modulus attack" summary="Works when the same n is reused with coprime exponents.">
                <TextInput label="n" value={commonN} onChange={setCommonN} />
                <TextInput label="e1" value={commonE1} onChange={setCommonE1} />
                <TextInput label="e2" value={commonE2} onChange={setCommonE2} />
                <TextInput label="c1" value={commonC1} onChange={setCommonC1} />
                <TextInput label="c2" value={commonC2} onChange={setCommonC2} />
                <ResultBox
                  error={common.error}
                  rows={[
                    ["m", common.value?.m],
                    ["a", common.value?.a],
                    ["b", common.value?.b],
                  ]}
                />
              </Panel>
            ) : null}

            {tab === "hastad" ? (
              <Panel title="Håstad broadcast attack" summary="Works when the same unpadded message is sent with small e.">
                <TextInput label="e" value={hastadE} onChange={setHastadE} />
                <label className="mt-4 block text-sm font-bold text-slate-200">
                  ciphertext,modulus rows
                  <textarea
                    value={hastadRows}
                    onChange={(event) => setHastadRows(event.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
                  />
                </label>
                <ResultBox
                  error={hastad.error}
                  rows={[
                    ["m", hastad.value?.m],
                    ["CRT value", hastad.value?.crtValue],
                  ]}
                />
              </Panel>
            ) : null}
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Formula trace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Each row shows the rule, the substituted values, and the teaching note.
            </p>

            {activeSteps ? (
              <div className="mt-5 overflow-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Formula</th>
                      <th className="px-4 py-3">Substitution</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attackStepsToRows(activeSteps).map((row) => (
                      <tr key={`${row.index}-${row.label}`} className="border-t border-white/5">
                        <td className="px-4 py-3 font-mono text-slate-400">{row.index}</td>
                        <td className="px-4 py-3 font-bold text-white">{row.label}</td>
                        <td className="px-4 py-3 font-mono text-cyan-100">{row.formula}</td>
                        <td className="px-4 py-3 font-mono text-amber-100">{row.substituted}</td>
                        <td className="px-4 py-3 text-slate-300">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">
                Fix the inputs to render the step trace.
              </div>
            )}
          </section>
        </section>

        {tab === "wiener" && wiener.value ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Wiener convergents</h2>
            <div className="mt-5 overflow-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">k</th>
                    <th className="px-4 py-3">d</th>
                    <th className="px-4 py-3">φ candidate</th>
                    <th className="px-4 py-3">Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {wiener.value.convergents.map((row, index) => (
                    <tr key={`${row.k}-${row.d}-${index}`} className={`border-t border-white/5 ${row.accepted ? "bg-emerald-300/10" : ""}`}>
                      <td className="px-4 py-3 font-mono text-cyan-100">{String(row.k)}</td>
                      <td className="px-4 py-3 font-mono text-cyan-100">{String(row.d)}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{row.phi === null ? "—" : String(row.phi)}</td>
                      <td className="px-4 py-3 font-bold">{row.accepted ? "yes" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6">
          <h2 className="text-2xl font-black text-amber-100">Mitigation notes</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Generate RSA primes with approved libraries and sufficient separation.",
              "Use e = 65537 and never choose unusually small private exponents.",
              "Never reuse the same RSA modulus across different users.",
              "Use randomized padding such as OAEP for encryption and PSS for signatures.",
              "Do not send the same unpadded message to multiple recipients.",
              "Use modern standards and prefer audited cryptographic implementations.",
            ].map((note) => (
              <li key={note} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-200">
                {note}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}

function Panel({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{summary}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 block text-sm font-bold text-slate-200">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
      />
    </label>
  );
}

function ResultBox({ error, rows }: { error: string | null; rows: Array<[string, bigint | number | string | null | undefined]> }) {
  if (error) {
    return <div role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>;
  }

  return (
    <div className="mt-5 grid gap-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-1 break-all font-mono text-lg font-black text-cyan-100">{String(value ?? "—")}</p>
        </div>
      ))}
    </div>
  );
}
