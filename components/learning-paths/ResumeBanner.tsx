'use client'

import Link from 'next/link'
import { Play, RotateCcw, Clock } from 'lucide-react'
import { LearningPath, Lesson, LastActiveLesson } from '@/lib/learning-paths/types'

interface ResumeBannerProps {
  lastActiveDetails: {
    path: LearningPath
    lesson: Lesson
    lastActive: LastActiveLesson
  } | null
  onReset: () => void
}

export default function ResumeBanner({ lastActiveDetails, onReset }: ResumeBannerProps) {
  if (!lastActiveDetails) return null

  const { path, lesson, lastActive } = lastActiveDetails
  const formattedDate = new Date(lastActive.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/50">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Resume Learning</span>
          </div>

          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>{lesson.title}</span>
          </h3>

          <p className="text-sm text-slate-400">
            Path: <span className="text-slate-200 font-medium">{path.title}</span> • Last active {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/learning-paths/${path.id}/${lesson.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Continue Lesson</span>
          </Link>

          <button
            onClick={onReset}
            title="Reset Learning Progress"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
