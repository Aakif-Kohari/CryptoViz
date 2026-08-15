'use client'

import { useMemo, useState } from 'react'

import {
  AUDIT_SCENARIOS,
  DEFAULT_AUDIT_SCENARIO_ID,
  type AuditScenarioId,
} from '@/lib/security/auditScenarios'

import {
  constantTimeStringEqual,
} from '@/lib/utils/constantTime'

type ResultState = {
  passed: boolean
  title: string
  message: string
} | null

type HighlightToken =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'property'
  | 'plain'

type HighlightedToken = {
  text: string
  type: HighlightToken
}

const TOKEN_PATTERN =
  /(\/\/.*$|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|async|await|if|else|new|import|from|export|true|false|class|throw|try|catch|interface|type|extends)\b|\b\d+(?:\.\d+)?n?\b|\b(?:crypto|Math|Uint8Array|ArrayBuffer|CryptoKey|Promise|RSA-OAEP|AES-GCM|AES-CBC)\b)/gm

function tokenizeCode(code: string): HighlightedToken[] {
  const tokens: HighlightedToken[] = []
  let lastIndex = 0

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0

    if (index > lastIndex) {
      tokens.push({
        text: code.slice(lastIndex, index),
        type: 'plain',
      })
    }

    const value = match[0]

    let type: HighlightToken = 'plain'

    if (value.startsWith('//') || value.startsWith('/*')) {
      type = 'comment'
    } else if (
      value.startsWith("'") ||
      value.startsWith('"') ||
      value.startsWith('`')
    ) {
      type = 'string'
    } else if (/^\d/.test(value)) {
      type = 'number'
    } else if (
      /^(const|let|var|function|return|async|await|if|else|new|import|from|export|true|false|class|throw|try|catch|interface|type|extends)$/.test(
        value,
      )
    ) {
      type = 'keyword'
    } else if (
      /^(crypto|Math|Uint8Array|ArrayBuffer|CryptoKey|Promise|RSA-OAEP|AES-GCM|AES-CBC)$/.test(
        value,
      )
    ) {
      type = 'property'
    }

    tokens.push({
      text: value,
      type,
    })

    lastIndex = index + value.length
  }

  if (lastIndex < code.length) {
    tokens.push({
      text: code.slice(lastIndex),
      type: 'plain',
    })
  }

  return tokens
}

function HighlightedCode({
  code,
}: {
  code: string
}) {
  const tokens = useMemo(
    () => tokenizeCode(code),
    [code],
  )

  return (
    <code className="font-mono text-[13px] leading-6">
      {tokens.map((token, index) => {
        const className =
          token.type === 'keyword'
            ? 'text-purple-600 dark:text-purple-400'
            : token.type === 'string'
              ? 'text-emerald-600 dark:text-emerald-400'
              : token.type === 'number'
                ? 'text-orange-600 dark:text-orange-400'
                : token.type === 'comment'
                  ? 'text-zinc-400 dark:text-zinc-600'
                  : token.type === 'property'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-zinc-800 dark:text-zinc-200'

        return (
          <span
            key={`${token.text}-${index}`}
            className={className}
          >
            {token.text}
          </span>
        )
      })}
    </code>
  )
}

function SeverityBadge({
  severity,
}: {
  severity: 'critical' | 'high' | 'medium'
}) {
  const classes =
    severity === 'critical'
      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
      : severity === 'high'
        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${classes}`}
    >
      {severity}
    </span>
  )
}

export default function CryptoAuditSandbox() {
  const [selectedId, setSelectedId] =
    useState<AuditScenarioId>(
      DEFAULT_AUDIT_SCENARIO_ID,
    )

  const [code, setCode] = useState(
    AUDIT_SCENARIOS[0].vulnerableCode,
  )

  const [result, setResult] =
    useState<ResultState>(null)

  const [showHint, setShowHint] = useState(false)

  const scenario = useMemo(
    () =>
      AUDIT_SCENARIOS.find(
        (item) => item.id === selectedId,
      ) ?? AUDIT_SCENARIOS[0],
    [selectedId],
  )

  const lineNumbers = useMemo(
    () =>
      code
        .split('\n')
        .map((_, index) => index + 1),
    [code],
  )

  const selectScenario = (id: AuditScenarioId) => {
    const nextScenario =
      AUDIT_SCENARIOS.find(
        (item) => item.id === id,
      ) ?? AUDIT_SCENARIOS[0]

    setSelectedId(id)
    setCode(nextScenario.vulnerableCode)
    setResult(null)
    setShowHint(false)
  }

  const resetScenario = () => {
    setCode(scenario.vulnerableCode)
    setResult(null)
    setShowHint(false)
  }

  const loadSecureSolution = () => {
    setCode(scenario.secureCode)
    setResult(null)
    setShowHint(false)
  }

  const runExploit = () => {
    const checkResult = scenario.check(code)

    setResult(checkResult)
  }

  const hasModifiedCode =
    code !== scenario.vulnerableCode

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Scenario selector */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="border-b border-zinc-200/70 p-5 dark:border-zinc-800/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                Cryptographic Code Audit
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Choose a vulnerability
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                Inspect the implementation, identify the
                misuse, modify the code, and verify the
                remediation.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {AUDIT_SCENARIOS.length} audit challenges
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-5">
          {AUDIT_SCENARIOS.map((item, index) => {
            const active = item.id === selectedId

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectScenario(item.id)}
                className={`group rounded-xl border p-3 text-left transition-all duration-200 ${
                  active
                    ? 'border-teal-500 bg-teal-500/5 shadow-sm'
                    : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/60'
                }`}
                aria-pressed={active}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      active
                        ? 'bg-teal-500 text-white'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <SeverityBadge severity={item.severity} />
                </div>

                <p
                  className={`text-sm font-bold ${
                    active
                      ? 'text-teal-700 dark:text-teal-300'
                      : 'text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {item.shortTitle}
                </p>

                <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-500">
                  {item.category}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Challenge heading */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {scenario.title}
          </h1>

          <SeverityBadge severity={scenario.severity} />
        </div>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {scenario.description}
        </p>
      </div>

      {/* IDE + exploit panel */}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        {/* Code editor */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Code Audit
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Edit the implementation
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasModifiedCode && (
                <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">
                  Modified
                </span>
              )}

              <button
                type="button"
                onClick={resetScenario}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="relative flex min-h-[440px] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            {/* Line numbers */}
            <div
              aria-hidden="true"
              className="select-none border-r border-zinc-200 bg-zinc-100/80 px-3 py-4 text-right font-mono text-[12px] leading-6 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600"
            >
              {lineNumbers.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <div className="relative min-w-0 flex-1 overflow-auto">
              {/* Syntax-highlighted layer */}
              <pre
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-0 whitespace-pre p-4"
              >
                <HighlightedCode code={code} />
              </pre>

              {/* Editable layer */}
              <textarea
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  setResult(null)
                }}
                spellCheck={false}
                aria-label={`Code editor for ${scenario.title}`}
                className="relative z-10 block min-h-[440px] w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-[13px] leading-6 text-transparent caret-teal-500 outline-none selection:bg-teal-500/20"
              />
            </div>
          </div>
        </div>

        {/* Exploit panel */}
        <aside className="min-w-0 rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
          <div className="border-b border-zinc-200/70 p-5 dark:border-zinc-800/70">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
              Attacker Panel
            </p>

            <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
              {scenario.exploitLabel}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {scenario.exploitDescription}
            </p>
          </div>

          <div className="space-y-4 p-5">
            <button
              type="button"
              onClick={runExploit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 active:translate-y-0"
            >
              <span>▶</span>
              Run Exploit Test
            </button>

            <button
              type="button"
              onClick={loadSecureSolution}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Load Secure Solution
            </button>

            {result && (
              <div
                role="status"
                className={`rounded-xl border p-4 ${
                  result.passed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      result.passed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {result.passed ? '✓' : '!'}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        result.passed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {result.passed
                        ? 'Secured!'
                        : 'Exploit succeeded'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {result.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 p-4 dark:border-zinc-800/70 dark:bg-zinc-900/50">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Hint
              </p>

              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                className="mt-2 text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>

              {showHint && (
                <ul className="mt-3 space-y-2">
                  {scenario.hints.map((hint) => (
                    <li
                      key={hint}
                      className="text-xs leading-5 text-zinc-600 dark:text-zinc-400"
                    >
                      • {hint}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Explanation */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
          <p className="text-xs font-bold uppercase tracking-wider text-red-500">
            Root Cause
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {scenario.vulnerability}
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Security Impact
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {scenario.impact}
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Remediation
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {scenario.remediation}
          </p>
        </article>
      </div>

      {/* References */}
      <div className="mt-5 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              Security References
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Standards and security guidance relevant to this challenge.
            </p>
          </div>

          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            {scenario.references.length} references
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {scenario.references.map((reference) => (
            <span
              key={reference}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
            >
              {reference}
            </span>
          ))}
        </div>
      </div>

      {/* Keep the existing utility available to this security feature. */}
      <span className="sr-only">
        {constantTimeStringEqual('', '') ? 'constant-time utility available' : ''}
      </span>
    </section>
  )
}