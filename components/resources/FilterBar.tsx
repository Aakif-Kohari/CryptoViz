"use client";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
}

const categories = [
  "All",
  "Book",
  "Research Paper",
  "RFC",
  "NIST",
  "Repository",
  "Learning Site",
  "Video",
  "Website",
];

const difficulties = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function ResourceFilters({
  search,
  setSearch,
  category,
  setCategory,
  difficulty,
  setDifficulty,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative w-full flex-1">
          <label htmlFor="resource-search" className="sr-only">Search resources</label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg
              className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="resource-search"
            type="text"
            placeholder="Search books, research papers, RFCs, NIST standards, repositories, sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-zinc-50 dark:bg-[#101013] py-3 pl-10 pr-10 text-sm text-zinc-900 dark:text-[#F5F5F5] placeholder:text-zinc-400 dark:placeholder:text-[#64646F] outline-none transition focus:border-[#00C2AE] focus:ring-1 focus:ring-[#00C2AE]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search string"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="sr-only">Filter by category</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-[160px] rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-zinc-50 dark:bg-[#101013] px-4 py-3 text-sm font-medium text-zinc-900 dark:text-[#F5F5F5] transition outline-none focus:border-[#00C2AE] focus:ring-1 focus:ring-[#00C2AE]"
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="difficulty-select" className="sr-only">Filter by difficulty</label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="min-w-[160px] rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-zinc-50 dark:bg-[#101013] px-4 py-3 text-sm font-medium text-zinc-900 dark:text-[#F5F5F5] transition outline-none focus:border-[#00C2AE] focus:ring-1 focus:ring-[#00C2AE]"
            aria-label="Filter by difficulty"
          >
            {difficulties.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Difficulties" : `${item} Level`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-[#2A2A31]/50">
        {categories.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#00C2AE] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-[#101013] dark:text-[#8A8A94] dark:hover:bg-[#2A2A31] dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}