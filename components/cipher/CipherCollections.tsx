'use client'

import React from 'react'
import Link from 'next/link'

export interface CipherCollectionItem {
  id: string
  name: string
  description: string
  path: string
  status?: string
}

export interface CipherCollectionGroup {
  title: string
  description: string
  ciphers: CipherCollectionItem[]
}

interface CipherCollectionsProps {
  collections: CipherCollectionGroup[]
}

export default function CipherCollections({ collections }: CipherCollectionsProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
          Cipher Collections
        </h1>
        <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
          Explore curated families of cryptographic algorithms grouped by design architecture, evolution, and shared primitives.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {collections.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {group.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {group.description}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.ciphers.map((cipher) => (
                  <Link
                    key={cipher.id}
                    href={cipher.path}
                    className="group flex flex-col justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3.5 transition-all hover:border-teal-500 hover:bg-teal-50/10 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-teal-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 group-hover:text-teal-600 dark:text-zinc-200 dark:group-hover:text-teal-400">
                        {cipher.name}
                      </span>
                      {cipher.status && (
                        <span className="text-[10px] uppercase tracking-wider rounded bg-zinc-200/60 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {cipher.status}
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400">
                      {cipher.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
