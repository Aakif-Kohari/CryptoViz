'use client'

import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import WorkspaceHeader from './WorkspaceHeader'
import { CIPHER_REGISTRY } from '../../lib/cipher/registry'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  activeCipherId?: string
}

export default function WorkspaceLayout({ children, activeCipherId }: WorkspaceLayoutProps) {
  const sidebarCiphers = CIPHER_REGISTRY.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    defaultKey: item.defaultKey,
    defaultInput: item.defaultInput,
    securityStatus: item.securityStatus
  }))

  return (
    <div className="min-h-screen bg-zinc-50 font-sans transition-colors duration-300 dark:bg-zinc-950">
      <Navbar />

      <div className="mx-auto flex max-w-[1450px] flex-col md:flex-row items-start">
        <Sidebar ciphers={sidebarCiphers} activeCipherId={activeCipherId} />

        <main className="min-w-0 flex-1 bg-white dark:bg-zinc-900/10 border-x border-zinc-200 dark:border-zinc-800 min-h-[calc(100vh-88px)]">
          <WorkspaceHeader activeCipherId={activeCipherId} />
          {children}
        </main>
      </div>
    </div>
  )
}
