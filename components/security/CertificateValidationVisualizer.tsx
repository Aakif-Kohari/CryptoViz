"use client";

import { useState } from "react";
import { certificateValidationSteps } from "@/lib/certificateValidation";

export default function CertificateValidationVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = certificateValidationSteps[currentStep];

  const progress =
    ((currentStep + 1) / certificateValidationSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < certificateValidationSteps.length - 1) {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
    }
  };

  const checks = [
    { label: "Chain building", step: 1 },
    { label: "Signature verification", step: 2 },
    { label: "Validity period", step: 3 },
    { label: "CA constraints", step: 4 },
    { label: "Trust anchor", step: 5 },
    { label: "Certificate accepted", step: 6 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#081419] dark:via-[#09090B] dark:to-[#120d1d]">
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 border-b border-zinc-200 pb-10 dark:border-[#2A2A31]">
          <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#00C2AE] dark:border-[#0C3634] dark:bg-[#0C3634]/40">
            Certificate & Trust
          </span>

          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Certificate Validation
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-[#B3B3B8]">
            Explore how X.509 certificates are chained, verified, and
            connected to a trusted certificate authority.
          </p>
        </div>

        {/* Progress */}
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#2A2A31] dark:bg-[#16161A]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Validation Progress
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-[#B3B3B8]">
                Step {currentStep + 1} of{" "}
                {certificateValidationSteps.length}
              </p>
            </div>

            <span className="text-sm font-bold text-[#00C2AE]">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-[#2A2A31]">
            <div
              className="h-full rounded-full bg-[#00C2AE] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {certificateValidationSteps.map((item, index) => {
              const active = index === currentStep;
              const completed = index < currentStep;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`rounded-xl border px-3 py-3 text-left text-xs font-medium transition ${
                    active
                      ? "border-[#00C2AE] bg-[#00C2AE]/10 text-[#00C2AE]"
                      : completed
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-[#00C2AE] dark:border-[#2A2A31] dark:bg-[#101013] dark:text-zinc-400 dark:hover:border-[#00C2AE]"
                  }`}
                >
                  <span className="font-bold">{index + 1}.</span>{" "}
                  {item.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* Current Step */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#2A2A31] dark:bg-[#16161A] sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-[#2A2A31] sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00C2AE]">
                Current Validation Step
              </span>

              <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                {step.title}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-[#B3B3B8]">
                {step.description}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#00C2AE] dark:border-[#0C3634] dark:bg-[#0C3634]/40">
              X.509 Validation
            </span>
          </div>

          {/* Certificate Chain */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Certificate Chain
              </h3>

              <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                Follow the path from the end-entity certificate to the
                trusted root.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              {/* End Entity */}
              <div
                className={`rounded-2xl border p-6 transition ${
                  currentStep >= 6
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : currentStep === 0
                      ? "border-[#00C2AE] bg-[#00C2AE]/5"
                      : "border-zinc-200 bg-zinc-50 dark:border-[#2A2A31] dark:bg-[#101013]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00C2AE]">
                      End-Entity Certificate
                    </span>

                    <h4 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                      example.com
                    </h4>

                    <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                      Issuer: Example Intermediate CA
                    </p>
                  </div>

                  {currentStep >= 2 && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div
                className={`flex justify-center py-3 text-2xl ${
                  currentStep >= 1
                    ? "text-[#00C2AE]"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              >
                ↓
              </div>

              {/* Intermediate */}
              <div
                className={`rounded-2xl border p-6 transition ${
                  currentStep >= 6
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : currentStep === 1 || currentStep === 2
                      ? "border-[#00C2AE] bg-[#00C2AE]/5"
                      : "border-zinc-200 bg-zinc-50 dark:border-[#2A2A31] dark:bg-[#101013]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00C2AE]">
                      Intermediate Certificate Authority
                    </span>

                    <h4 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                      Example Intermediate CA
                    </h4>

                    <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                      Issuer: Example Root CA
                    </p>

                    <p className="mt-1 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                      Basic Constraints: CA = TRUE
                    </p>
                  </div>

                  {currentStep >= 2 && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div
                className={`flex justify-center py-3 text-2xl ${
                  currentStep >= 5
                    ? "text-[#00C2AE]"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              >
                ↓
              </div>

              {/* Trust Anchor */}
              <div
                className={`rounded-2xl border p-6 transition ${
                  currentStep >= 6
                    ? "border-emerald-400/40 bg-emerald-400/5"
                    : currentStep >= 5
                      ? "border-[#00C2AE] bg-[#00C2AE]/5"
                      : "border-zinc-200 bg-zinc-50 dark:border-[#2A2A31] dark:bg-[#101013]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00C2AE]">
                      Trust Anchor
                    </span>

                    <h4 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                      Example Root CA
                    </h4>

                    <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                      Root Certificate Authority
                    </p>
                  </div>

                  {currentStep >= 5 && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      ✓ Trusted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Checks */}
          <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-[#2A2A31]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Validation Checks
              </h3>

              <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8]">
                Each check becomes active as the validation process advances.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {checks.map((check) => {
                const completed = currentStep >= check.step;

                return (
                  <div
                    key={check.label}
                    className={`rounded-2xl border p-5 transition hover:-translate-y-1 ${
                      completed
                        ? "border-emerald-400/30 bg-emerald-400/5"
                        : "border-zinc-200 bg-zinc-50 dark:border-[#2A2A31] dark:bg-[#101013]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          completed
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-200 text-zinc-600 dark:bg-[#2A2A31] dark:text-zinc-400"
                        }`}
                      >
                        {completed ? "✓" : check.step}
                      </span>

                      <span
                        className={
                          completed
                            ? "font-semibold text-emerald-400"
                            : "font-medium text-zinc-700 dark:text-zinc-300"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-[#2A2A31]">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-[#00C2AE] dark:border-[#2A2A31] dark:bg-[#101013] dark:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={
                currentStep === certificateValidationSteps.length - 1
              }
              className="rounded-xl bg-[#00C2AE] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00a896] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </section>

        {/* Learning Note */}
        <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-[#0C3634] dark:bg-[#0C3634]/30">
          <div className="flex gap-4">
            <div className="text-xl">📘</div>

            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">
                Learning Note
              </h3>

              <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-[#B3B3B8]">
                A valid certificate signature alone does not establish trust.
                Validation also requires building a certification path,
                checking the certificates in that path, and determining
                whether it terminates at a trusted trust anchor.
              </p>
            </div>
          </div>
        </section>

        {/* Standards */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-[#2A2A31] dark:bg-[#16161A]">
          <div className="border-b border-zinc-200 p-6 dark:border-[#2A2A31]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C2AE]">
              Standards & References
            </span>

            <h2 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
              X.509 & TLS Standards
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            {[
              {
                name: "RFC 5280",
                description:
                  "Internet X.509 Public Key Infrastructure certificate and CRL profile.",
                href: "https://www.rfc-editor.org/rfc/rfc5280",
              },
              {
                name: "RFC 4158",
                description:
                  "Certification path building between certificates and trust anchors.",
                href: "https://www.rfc-editor.org/rfc/rfc4158",
              },
              {
                name: "RFC 8446",
                description:
                  "TLS 1.3 handshake and certificate authentication context.",
                href: "https://www.rfc-editor.org/rfc/rfc8446",
              },
            ].map((reference) => (
              <a
                key={reference.name}
                href={reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-1 hover:border-[#00C2AE] dark:border-[#2A2A31] dark:bg-[#101013]"
              >
                <div className="text-lg font-bold text-zinc-900 dark:text-white">
                  {reference.name}
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-[#B3B3B8]">
                  {reference.description}
                </p>

                <div className="mt-5 text-sm font-semibold text-[#00C2AE]">
                  View RFC →
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}