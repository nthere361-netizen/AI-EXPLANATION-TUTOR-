import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { HelpCircle, CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

interface QuizCardProps {
  quiz: QuizQuestion;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
  };

  const resetQuiz = () => {
    setSelectedIdx(null);
    setShowHint(false);
  };

  const answered = selectedIdx !== null;
  const isCorrectChoice = answered && quiz.options[selectedIdx]?.isCorrect;

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Check Your Understanding
          </span>
        </div>
        {answered && (
          <button
            onClick={resetQuiz}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-snug">
        {quiz.question}
      </h4>

      {/* Options */}
      <div className="space-y-2.5">
        {quiz.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          let containerStyle = 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700';

          if (answered) {
            if (option.isCorrect) {
              containerStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400';
            } else if (isSelected && !option.isCorrect) {
              containerStyle = 'bg-rose-50/90 border-rose-400 text-rose-950 ring-1 ring-rose-400';
            } else {
              containerStyle = 'bg-slate-50/40 border-slate-200/60 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 ${containerStyle}`}
            >
              <div className="mt-0.5 shrink-0">
                {answered ? (
                  option.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      {String.fromCharCode(65 + idx)}
                    </div>
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-mono group-hover:border-indigo-400 group-hover:text-indigo-600">
                    {String.fromCharCode(65 + idx)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium leading-relaxed block">
                  {option.text}
                </span>
                
                {/* Feedback explanation for this choice when answered */}
                {answered && (isSelected || option.isCorrect) && (
                  <div className={`mt-2 pt-2 border-t text-xs font-medium leading-relaxed ${
                    option.isCorrect ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'
                  }`}>
                    {option.explanation}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint toggle */}
      {quiz.hint && !answered && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
          </button>
          {showHint && (
            <p className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200 px-3 py-1 rounded-lg">
              {quiz.hint}
            </p>
          )}
        </div>
      )}

      {/* Answer summary footer */}
      {answered && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          isCorrectChoice 
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
            : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          {isCorrectChoice ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Great job! You grasped the foundational mechanism.</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Not quite, but that’s a very common confusion! Read the explanation above to clarify the distinction.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
