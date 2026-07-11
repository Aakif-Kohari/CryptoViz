'use client'

import { useCallback } from 'react'
import { CIPHER_REGISTRY } from '@/lib/cipher/registry'

interface AlgorithmSelectorProps {
  selectedAlgorithms: string[]
  onSelectionChange: (algorithms: string[]) => void
  category?: 'classical' | 'symmetric' | 'hash' | 'asymmetric' | null
}

export default function AlgorithmSelector({
  selectedAlgorithms,
  onSelectionChange,
  category = null,
}: AlgorithmSelectorProps) {
  const filteredCiphers = category
    ? CIPHER_REGISTRY.filter((c) => c.category === category)
    : CIPHER_REGISTRY

  const handleToggle = useCallback(
    (cipherId: string) => {
      const newSelection = selectedAlgorithms.includes(cipherId)
        ? selectedAlgorithms.filter((id) => id !== cipherId)
        : [...selectedAlgorithms, cipherId]
      onSelectionChange(newSelection)
    },
    [selectedAlgorithms, onSelectionChange],
  )

  const handleSelectAll = useCallback(() => {
    onSelectionChange(filteredCiphers.map((c) => c.id))
  }, [filteredCiphers, onSelectionChange])

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Algorithm Selection {category && `(${category})`}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
className="rounded px-3 py-1 text-sm font-medium text-zinc-600 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="rounded px-3 py-1 text-sm font-medium text-zinc-600 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCiphers.map((cipher) => (
          <label
            key={cipher.id}
className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm dark:border-zinc-700 dark:hover:border-teal-500 dark:hover:bg-zinc-800"          >
            <input
              type="checkbox"
              checked={selectedAlgorithms.includes(cipher.id)}
              onChange={() => handleToggle(cipher.id)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-zinc-300 text-teal-600 dark:border-zinc-600"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-900 dark:text-white">{cipher.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{cipher.description}</div>
              <div className="mt-1">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                    cipher.securityStatus === 'secure'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : cipher.securityStatus === 'deprecated'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {cipher.securityStatus.charAt(0).toUpperCase() + cipher.securityStatus.slice(1)}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
        {selectedAlgorithms.length === 0
          ? 'Select at least one algorithm to benchmark'
          : `${selectedAlgorithms.length} algorithm${selectedAlgorithms.length !== 1 ? 's' : ''} selected`}
      </div>
    </div>
  )
}
