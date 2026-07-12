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
    <div className="mb-8 flex flex-col gap-4 md:flex-row">
      <input
        type="text"
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {categories.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {difficulties.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}