'use client'

import Link from 'next/link'
import { Compass, ArrowRight, Clock, Sparkles } from 'lucide-react'
import { LearningPath, Lesson } from '@/lib/learning-paths/types'

interface RecommendationCardProps {
  recommendation: {
    path: LearningPath
    lesson: Lesson
  } | null
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  if (!recommendation) return null

  const { path, lesson } = recommendation

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recommended Next Step</span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {lesson.duration}
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
          {path.title}
        </div>

        <h4 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
          {lesson.title}
        </h4>

        <p className="text-sm text-slate-400 line-clamp-2">
          {lesson.description}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">{path.difficulty}</span>
          </div>

          <Link
            href={`/learning-paths/${path.id}/${lesson.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>Start Recommended Lesson</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
