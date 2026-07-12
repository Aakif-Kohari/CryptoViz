"use client";

import { useMemo, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { resources } from "@/lib/resources";
import FilterBar from "@/components/resources/FilterBar";
import SearchBar from "@/components/resources/SearchBar";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );

      const matchesCategory =
        category === "All" || resource.category === category;

      const matchesDifficulty =
        difficulty === "All" || resource.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty
      );
    });
  }, [search, category, difficulty]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Learning Resources
          </h1>

          <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
            Explore curated cryptography books, research papers, RFCs,
            NIST publications, videos and learning resources to
            strengthen your understanding of modern cryptography.
          </p>
        </div>

        <FilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />

        <SearchBar resources={filteredResources} />
      </main>
    </div>
  );
}