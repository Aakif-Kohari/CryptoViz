"use client";

import { useMemo, useState } from "react";
import { standards } from "@/lib/standards";

export default function StandardsLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(standards.map((s) => s.category)),
  ];

  const filtered = useMemo(() => {
    return standards.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.organization.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="space-y-6">

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="🔍 Search standards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full dark:bg-zinc-900"
        />
        <Link href="/docs/nist-rfc-standards-library">
  Read Documentation
</Link>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 dark:bg-zinc-900"
        >
          {categories.map((cat) => (
            <option key={cat}>
              {cat}
            </option>
          ))}
        </select>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filtered.map((item) => (

          <div
            key={item.id}
            className="border rounded-xl shadow-sm p-5 bg-white dark:bg-zinc-900"
          >
            <div className="flex justify-between mb-3">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                {item.organization}
              </span>

              <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                {item.category}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {item.description}
            </p>

          <div className="mt-4 flex gap-4">
  <a
    href={item.reference}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 font-semibold hover:underline"
  >
    Official Standard →
  </a>

  <a
    href="/docs/nist-rfc-standards-library"
    className="text-green-600 font-semibold hover:underline"
  >
    Learn More →
  </a>
</div>
          </div>

        ))}

      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No standards found.
        </div>
      )}

    </div>
  );
}