export type MythStatus = 'BUSTED' | 'MISCONCEPTION' | 'PLAUSIBLE' | 'PARTIALLY_TRUE';

export type MythCategory =
  | 'All'
  | 'Encoding vs Encryption'
  | 'Hashing vs Encryption'
  | 'Key Management & Sizes'
  | 'Password Security'
  | 'Quantum & Future Tech'
  | 'Security Principles';

export interface MythItem {
  id: string;
  mythTitle: string;
  statement: string;
  status: MythStatus;
  category: MythCategory;
  realitySummary: string;
  detailedExplanation: string;
  keyTakeaway: string;
  relatedCipherId?: string;
  relatedDocSlug?: string;
  tags: string[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  mythContext: string;
  options: QuizOption[];
}
