export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface VisualizerRef {
  title: string
  href: string
  description: string
}

export interface Lesson {
  id: string
  title: string
  duration: string
  description: string
  keyTakeaways: string[]
  content: string
  visualizers: VisualizerRef[]
  quiz: QuizQuestion[]
}

export interface LearningPath {
  id: string
  title: string
  shortDescription: string
  fullDescription: string
  category: string
  difficulty: Difficulty
  icon: string
  color: string
  estimatedTime: string
  lessons: Lesson[]
  badge: {
    name: string
    description: string
    icon: string
  }
}

export interface LastActiveLesson {
  pathId: string
  lessonId: string
  timestamp: number
}

export interface UserLearningProgress {
  completedLessons: Record<string, boolean> // format: "pathId:lessonId"
  quizScores: Record<string, number> // format: "lessonId", value: percentage 0-100
  lastActiveLesson: LastActiveLesson | null
  completedPaths: Record<string, boolean> // format: "pathId"
}
