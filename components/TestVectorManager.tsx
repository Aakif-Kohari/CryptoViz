"use client";

import { useState } from "react";
import { sampleVectors } from "@/lib/testVectors";

export default function TestVectorManager() {
  const [vectors, setVectors] = useState(sampleVectors);
  const [message, setMessage] = useState("");

  const importVectors = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (Array.isArray(json)) {
          setVectors(json);
          setMessage("✅ Test vectors imported successfully.");
        } else {
          throw new Error();
        }
      } catch {
        setMessage("❌ Invalid JSON file.");
      }
    };

    reader.readAsText(file);
  };

  const exportVectors = () => {
    const blob = new Blob(
      [JSON.stringify(vectors, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "test-vectors.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const copyJSON = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(vectors, null, 2)
    );

    setMessage("📋 JSON copied to clipboard.");
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-wrap gap-4">

        <input
          type="file"
          accept=".json"
          onChange={importVectors}
        />

        <button
          onClick={exportVectors}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Export JSON
        </button>

        <button
          onClick={copyJSON}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Copy JSON
        </button>

      </div>

      {message && (
        <div className="font-medium">
          {message}
        </div>
      )}

      <div className="grid gap-6">

        {vectors.map((item, index) => (

          <div
            key={index}
            className="border rounded-xl p-5 shadow-sm bg-white dark:bg-zinc-900"
          >

            <h3 className="text-xl font-bold mb-4">
              {item.algorithm}
            </h3>

            <div className="space-y-2 text-sm">

              <p>
                <strong>Key:</strong> {item.key}
              </p>

              <p>
                <strong>Plaintext:</strong>
                <br />
                {item.plaintext}
              </p>

              <p>
                <strong>Ciphertext:</strong>
                <br />
                {item.ciphertext}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}