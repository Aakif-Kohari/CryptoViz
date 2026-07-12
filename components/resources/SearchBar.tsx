"use client";

import { LearningResource } from "@/lib/resources";
import ResourceCard from "./ResourceCard";

interface Props {
  resources: LearningResource[];
}

export default function SearchBar({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        <h2 className="text-xl font-semibold">No resources found</h2>
        <p className="mt-2 text-zinc-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.title}
          resource={resource}
        />
      ))}
    </div>
  );
}