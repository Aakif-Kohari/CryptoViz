'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sparkles,
  Clock,
  ListCheck,
} from 'lucide-react'
import { LearningPath, Lesson } from '@/lib/learning-paths/types'
import QuizComponent from './QuizComponent'

interface LessonViewerProps {
  path: LearningPath
  lesson: Lesson
  lessonIndex: number
  isCompleted: boolean
  onToggleComplete: () => void
  onQuizScore: (score: number) => void
  nextLessonId?: string
  prevLessonId?: string
}

export default function LessonViewer({
  path,
  lesson,
  lessonIndex,
  isCompleted,
  onToggleComplete,
  onQuizScore,
  nextLessonId,
  prevLessonId,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'visualizers' | 'quiz'>('content')
  const [prevLessonIdState, setPrevLessonIdState] = useState(lesson.id)

  if (prevLessonIdState !== lesson.id) {
    setPrevLessonIdState(lesson.id)
    setActiveTab('content')
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/learning-paths/${path.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {path.title}</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Lesson {lessonIndex + 1} of {path.lessons.length} • {lesson.duration}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              {path.title}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{lesson.title}</h1>
          </div>

          <button
            onClick={onToggleComplete}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shrink-0 ${
              isCompleted
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{isCompleted ? 'Lesson Completed' : 'Mark as Complete'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('content')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'content'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lesson Theory</span>
        </button>

        {lesson.visualizers.length > 0 && (
          <button
            onClick={() => setActiveTab('visualizers')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'visualizers'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Visualizers ({lesson.visualizers.length})</span>
          </button>
        )}

        {lesson.quiz.length > 0 && (
          <button
            onClick={() => setActiveTab('quiz')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'quiz'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quiz ({lesson.quiz.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Content */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Key Takeaways */}
          {lesson.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <ListCheck className="w-4 h-4" />
                <span>Key Concept Takeaways</span>
              </div>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Body */}
          <div className="prose prose-invert prose-slate max-w-none p-6 rounded-2xl border border-slate-800 bg-slate-900/60 leading-relaxed text-slate-300 whitespace-pre-line text-sm sm:text-base">
            {lesson.content.trim()}
          </div>
        </div>
      )}

      {/* Tab 2: Recommended Visualizers */}
      {activeTab === 'visualizers' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Reinforce your learning by experimenting with these recommended visualizers and tools in CryptoViz:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.visualizers.map((vis, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-100 text-base mb-1">{vis.title}</h4>
                  <p className="text-xs text-slate-400">{vis.description}</p>
                </div>

                <Link
                  href={vis.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
                >
                  <span>Launch Visualizer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Quiz */}
      {activeTab === 'quiz' && (
        <QuizComponent quiz={lesson.quiz} onComplete={onQuizScore} />
      )}

      {/* Next/Previous Controls */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-800">
        {prevLessonId ? (
          <Link
            href={`/learning-paths/${path.id}/${prevLessonId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </Link>
        ) : (
          <div />
        )}

        {nextLessonId ? (
          <Link
            href={`/learning-paths/${path.id}/${nextLessonId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all"
          >
            <span>Next Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/learning-paths/${path.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all"
          >
            <span>Complete Path Overview</span>
            <CheckCircle className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
