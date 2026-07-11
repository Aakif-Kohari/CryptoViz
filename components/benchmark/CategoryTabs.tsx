'use client'

interface CategoryTabsProps {
  selectedCategory: 'all' | 'classical' | 'symmetric' | 'asymmetric' | 'hash'
  onCategoryChange: (category: 'all' | 'classical' | 'symmetric' | 'asymmetric' | 'hash') => void
}

export default function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const categories: Array<{
    id: 'all' | 'classical' | 'symmetric' | 'asymmetric' | 'hash'
    label: string
    description: string
  }> = [
    { id: 'all', label: 'All Algorithms', description: 'All available algorithms' },
    { id: 'classical', label: 'Classical', description: 'Traditional ciphers' },
    { id: 'symmetric', label: 'Symmetric', description: 'Modern encryption' },
    { id: 'asymmetric', label: 'Asymmetric', description: 'Public key cryptography' },
    { id: 'hash', label: 'Hashing', description: 'Hash functions' },
  ]

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`inline-flex flex-col items-start gap-1 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
            selectedCategory === category.id
              ? 'border border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-900/20'
              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="font-medium text-sm text-zinc-900 dark:text-white">
            {category.label}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {category.description}
          </span>
        </button>
      ))}
    </div>
  )
}
