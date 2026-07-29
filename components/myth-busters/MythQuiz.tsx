'use client';

import React, { useState } from 'react';
import { MYTH_QUIZ_QUESTIONS } from '@/lib/myth-busters/mythData';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Trophy } from 'lucide-react';

export default function MythQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = MYTH_QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null) return; // Prevent changing answer
    setSelectedOptionId(optionId);
    setShowExplanation(true);

    const selectedOpt = currentQ.options.find(o => o.id === optionId);
    if (selectedOpt && selectedOpt.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < MYTH_QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setShowExplanation(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-teal-500/5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Cryptography Reality Check Quiz
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20">
                Interactive Test
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Test your understanding against real-world cryptographic misconceptions.
            </p>
          </div>
        </div>

        {!isCompleted && (
          <div className="text-xs font-bold text-teal-400 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800">
            Question {currentIdx + 1} of {MYTH_QUIZ_QUESTIONS.length}
          </div>
        )}
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono text-zinc-400 italic">
              Context: {currentQ.mythContext}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1">
              {currentQ.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3" role="radiogroup" aria-label="Quiz options">
            {currentQ.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              let btnStyle = 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300';

              if (selectedOptionId !== null) {
                if (option.isCorrect) {
                  btnStyle = 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300';
                } else if (isSelected && !option.isCorrect) {
                  btnStyle = 'border-red-500/50 bg-red-950/30 text-red-300';
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={selectedOptionId !== null}
                  className={`w-full flex items-start gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all ${btnStyle}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold mt-0.5">
                    {option.id.toUpperCase()}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {selectedOptionId !== null && option.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  )}
                  {selectedOptionId !== null && isSelected && !option.isCorrect && (
                    <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-teal-400 uppercase tracking-wider">Explanation</span>
                <span className="text-zinc-500">Current Score: {score}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentQ.options.find(o => o.id === selectedOptionId)?.explanation}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold px-5 py-2 text-xs shadow-md shadow-teal-500/20 hover:scale-[1.02] transition-transform"
                >
                  {currentIdx + 1 < MYTH_QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="py-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Trophy className="h-8 w-8" />
          </div>
          <h4 className="text-2xl font-bold text-white">Quiz Completed!</h4>
          <p className="text-sm text-zinc-300 max-w-md mx-auto">
            You scored <strong className="text-teal-400">{score}</strong> out of{' '}
            <strong>{MYTH_QUIZ_QUESTIONS.length}</strong> questions correctly.
          </p>
          <div className="pt-4">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold px-6 py-2.5 text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Reality Check Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
