'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, FileText, Book, Video, Zap } from 'lucide-react'
import { searchGlobal, groupResultsByCategory, getCategoryLabel, type SearchResult, type SearchResultCategory } from '../../lib/search/searchIndex'

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Search function
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchGlobal(query)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      window.location.href = results[selectedIndex].url
    }
  }

  const getCategoryIcon = (category: SearchResultCategory) => {
    const icons = {
      visualizers: <Zap className="w-4 h-4" />,
      documentation: <FileText className="w-4 h-4" />,
      glossary: <Book className="w-4 h-4" />,
      resources: <Video className="w-4 h-4" />,
    }
    return icons[category]
  }

  const groupedResults = groupResultsByCategory(results)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-zinc-400 bg-zinc-100 rounded dark:bg-zinc-800 dark:text-zinc-500">
          <span>⌘</span>K
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div
        ref={searchRef}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation, glossary, resources, and visualizers..."
            className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              <Search className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
              <p className="text-lg font-medium">Start typing to search</p>
              <p className="text-sm mt-1">Use keyboard navigation with arrow keys</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([category, categoryResults]) => {
                if (categoryResults.length === 0) return null
                return (
                  <div key={category} className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {getCategoryIcon(category as SearchResultCategory)}
                      {getCategoryLabel(category as SearchResultCategory)}
                      <span className="text-zinc-400">({categoryResults.length})</span>
                    </div>
                    {categoryResults.map((result, idx) => {
                      const globalIndex = results.indexOf(result)
                      return (
                        <Link
                          key={result.id}
                          href={result.url}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                            globalIndex === selectedIndex
                              ? 'bg-teal-50 dark:bg-teal-950/30'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5 text-zinc-400">
                            {getCategoryIcon(result.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-zinc-900 dark:text-white">
                              {result.title}
                            </div>
                            <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                              {result.description}
                            </div>
                            {result.metadata?.tags && result.metadata.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {result.metadata.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded dark:bg-zinc-800">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded dark:bg-zinc-800">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded dark:bg-zinc-800">esc</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  )
}
