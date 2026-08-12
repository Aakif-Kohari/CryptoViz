"use client";

import { useState } from "react";
import { handshakeSteps } from "@/lib/tlsHandshake";

export default function TLSHandshakeVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = handshakeSteps[currentStep];

  const nextStep = () => {
    if (currentStep < handshakeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress =
    ((currentStep + 1) / handshakeSteps.length) * 100;

  return (
    <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-lg p-6">

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>
            Step {currentStep + 1} of {handshakeSteps.length}
          </span>

          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-wrap gap-2 mb-8">
        {handshakeSteps.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setCurrentStep(index)}
            className={`px-3 py-2 rounded-lg text-sm transition

            ${
              index === currentStep
                ? "bg-blue-600 text-white"
                : index < currentStep
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-800"
            }
            `}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Client Server */}
      <div className="grid md:grid-cols-3 gap-6 items-center mb-8">

        <div className="border rounded-lg p-5 text-center">
          <h3 className="font-bold text-lg mb-3">
            Client
          </h3>

          <div className="text-blue-600 font-medium">
            {step.clientMessage || "Waiting..."}
          </div>
        </div>

        <div className="text-center text-3xl font-bold">
          ↔
        </div>

        <div className="border rounded-lg p-5 text-center">
          <h3 className="font-bold text-lg mb-3">
            Server
          </h3>

          <div className="text-green-600 font-medium">
            {step.serverMessage || "Waiting..."}
          </div>
        </div>

      </div>

      {/* Information */}
      <div className="rounded-xl border p-6 bg-gray-50 dark:bg-slate-800">

        <h2 className="text-2xl font-bold mb-3">
          {step.title}
        </h2>

        <p className="mb-5 text-gray-700 dark:text-gray-300">
          {step.description}
        </p>

        <div className="grid md:grid-cols-2 gap-5">

          <div className="rounded-lg bg-white dark:bg-slate-900 border p-4">
            <p className="text-sm text-gray-500">
              Encryption Status
            </p>

            <p className="font-semibold mt-2">
              {step.encryption}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 border p-4">
            <p className="text-sm text-gray-500">
              RFC Reference
            </p>

            <p className="font-semibold mt-2">
              {step.rfc}
            </p>
          </div>

        </div>

      </div>

      {/* Controls */}
      <div className="flex justify-between mt-8">

        <button
          onClick={previousStep}
          disabled={currentStep === 0}
          className="px-5 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
        >
          ← Previous
        </button>

        <button
          onClick={nextStep}
          disabled={currentStep === handshakeSteps.length - 1}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Next →
        </button>

      </div>

      {/* Learning Note */}
      <div className="mt-8 rounded-lg border-l-4 border-blue-600 bg-blue-50 dark:bg-slate-800 p-4">
        <h3 className="font-semibold mb-2">
          📘 Learning Note
        </h3>

        <p className="text-sm">
          TLS 1.3 reduces the number of handshake round trips,
          removes obsolete cryptographic algorithms, and provides
          forward secrecy by default using ephemeral key exchange.
        </p>
      </div>

    </div>
  );
}