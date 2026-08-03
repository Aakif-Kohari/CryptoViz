"use client";

import { useMemo, useState } from "react";
import Breadcrumbs from '../../components/layout/Breadcrumbs'

import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import { resources } from "@/lib/resources";
import FilterBar from "@/components/resources/FilterBar";
import SearchBar from "@/components/resources/SearchBar";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const topics = useMemo(
  () => [...new Set(resources.flatMap((resource) => resource.tags))].sort(),
  []
);
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.author.toLowerCase().includes(search.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );

      const matchesCategory =
        category === "All" || resource.category === category;

      const matchesDifficulty =
        difficulty === "All" || resource.difficulty === difficulty;
      const matchesTopic =
  topic === "All" || resource.tags.includes(topic);
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTopic;
    });
  }, [search, category, difficulty,topic]);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#081419] dark:via-[#09090B] dark:to-[#120d1d]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Breadcrumbs items={[{ label: "Reference" }, { label: "Resources" }]} />
        {/* Page Header */}
        <div className="mb-10 border-b border-zinc-200 dark:border-[#2A2A31] pb-10">
          <span className="inline-flex rounded-full border border-teal-200 dark:border-[#0C3634] bg-teal-50 dark:bg-[#0C3634]/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#00C2AE]">
            CURATED KNOWLEDGE HUB
          </span>

          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#F5F5F5]">
            Cryptography Resources Library
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-[#B3B3B8]">
            Discover curated cryptography books, seminal research papers, RFC specifications, NIST guidelines, open-source repositories, interactive learning sites, and video lectures.
          </p>

          {/* Featured Specialized Sub-modules */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl">
            <Link
              href="/resources/standards-rfc"
              className="group rounded-2xl border border-zinc-200 dark:border-[#2A2A31] bg-zinc-50 dark:bg-[#16161A] p-5 transition hover:-translate-y-0.5 hover:border-[#00C2AE]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00C2AE]">
                  EXPLORER TOOL
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-[#00C2AE]">
                  Open →
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-white group-hover:text-[#00C2AE]">
                Standards & RFC Explorer
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-[#8A8A94]">
                Interactive RFC specifications, FIPS publications, and NIST cryptographic standards.
              </p>
            </Link>

            <Link
              href="/resources/video-library"
              className="group rounded-2xl border border-zinc-200 dark:border-[#2A2A31] bg-zinc-50 dark:bg-[#16161A] p-5 transition hover:-translate-y-0.5 hover:border-[#00C2AE]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00C2AE]">
                  CURATED VIDEOS
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-[#00C2AE]">
                  Open →
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-white group-hover:text-[#00C2AE]">
                Cryptography Video Library
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-[#8A8A94]">
                Curated lectures, Computerphile videos, and Stanford cryptography course previews.
              </p>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-[#2A2A31] bg-white dark:bg-[#16161A] p-6 shadow-sm">
         <FilterBar
  search={search}
  setSearch={setSearch}
  category={category}
  setCategory={setCategory}
  difficulty={difficulty}
  setDifficulty={setDifficulty}
  topic={topic}
  setTopic={setTopic}
  topics={topics}
/>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between px-1">
          <p className="text-sm text-zinc-500 dark:text-[#8A8A94]">
            Showing <span className="font-bold text-[#00C2AE]">{filteredResources.length}</span> of {resources.length} resources
          </p>
        </div>

        {/* Search Results Grid */}
        <SearchBar
          resources={filteredResources}
          onClear={() => {
  setSearch("");
  setCategory("All");
  setDifficulty("All");
  setTopic("All");
}}
        />
      </main>
    </div>
  );
}