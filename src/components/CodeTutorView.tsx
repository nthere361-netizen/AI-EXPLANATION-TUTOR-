import React, { useState } from 'react';
import { CodeTutorResponse, ChallengeEvaluationResponse } from '../types';
import { debugCodeWithTutor, evaluateChallenge } from '../services/tutorService';
import { SAMPLE_CODE_TUTOR_CASES } from '../data/mockData';
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  Lightbulb, 
  BookOpen, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export const CodeTutorView: React.FC = () => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [code, setCode] = useState<string>(SAMPLE_CODE_TUTOR_CASES[0].code);
  const [language, setLanguage] = useState<string>(SAMPLE_CODE_TUTOR_CASES[0].language);
  const [errorDesc, setErrorDesc] = useState<string>(SAMPLE_CODE_TUTOR_CASES[0].errorDescription);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [result, setResult] = useState<CodeTutorResponse | null>(null);
  
  const [copied, setCopied] = useState<boolean>(false);
  const [userTryAnswer, setUserTryAnswer] = useState<string>('');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<ChallengeEvaluationResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const handleSelectCase = (idx: number) => {
    setSelectedCaseIdx(idx);
    const item = SAMPLE_CODE_TUTOR_CASES[idx];
    setCode(item.code);
    setLanguage(item.language);
    setErrorDesc(item.errorDescription);
    setResult(null);
    setErrorText(null);
    setEvalResult(null);
    setEvalError(null);
    setShowSolution(false);
  };

  const handleRunAnalysis = async () => {
    if (!code.trim()) {
      setErrorText('Please enter code to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setEvalResult(null);
    setEvalError(null);
    setShowSolution(false);

    try {
      const resp = await debugCodeWithTutor(code, language, errorDesc);
      setResult(resp);
      setUserTryAnswer(resp.tryItYourself.starterCode);
    } catch (e: any) {
      console.error('Code analysis failed:', e);
      setErrorText(e?.message || 'Unable to analyze code with Code Tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckChallenge = async () => {
    if (!result || !userTryAnswer.trim()) return;

    setIsEvaluating(true);
    setEvalError(null);

    try {
      const evaluation = await evaluateChallenge({
        challengePrompt: result.tryItYourself.prompt,
        starterCode: result.tryItYourself.starterCode,
        solutionCode: result.tryItYourself.solutionCode,
        userCode: userTryAnswer,
        language
      });
      setEvalResult(evaluation);
    } catch (err: any) {
      console.error('Challenge evaluation failed:', err);
      setEvalError(err?.message || 'Failed to evaluate challenge. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60">
              Computational Logic Tutor
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
              Code Tutor: Understand Why Code Breaks
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Never copy-paste blind fixes. Understand the underlying execution mechanics, memory lifecycle, and scope invariants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Sample Scenarios:
            </span>
            <div className="flex items-center gap-1.5">
              {SAMPLE_CODE_TUTOR_CASES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCase(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCaseIdx === idx
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Scenario {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code Input & Editor Deck */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-400 font-mono ml-2">code_snippet.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'cpp'}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              rows={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste broken snippet or algorithmic function here..."
              className="w-full flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed"
            />
          </div>

          {/* Right Control Panel: Error symptoms & Trigger */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Observed Symptom / Error
              </label>
              <textarea
                rows={5}
                value={errorDesc}
                onChange={(e) => setErrorDesc(e.target.value)}
                placeholder="What error occurred? (e.g. RecursionError: maximum recursion depth exceeded)"
                className="w-full flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading || !code.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-purple-600 hover:bg-purple-700 active:scale-98 text-white shadow-md shadow-purple-200 dark:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deconstructing Execution Flow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Explain Bug</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification if API failed */}
        {errorText && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorText}</span>
            </div>
            <button
              onClick={handleRunAnalysis}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* RESULT BREAKDOWN STACK */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 1. WHAT'S WRONG */}
          <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-6 sm:p-7 border border-rose-200/90 dark:border-rose-900/50 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                What's Actually Happening
              </h3>
            </div>
            <p className="text-sm sm:text-base font-semibold text-rose-950 dark:text-rose-200 leading-relaxed">
              {result.whatsWrong}
            </p>
          </div>

          {/* 2. WHY IT HAPPENS (Computational Model) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                The Execution Mechanics (Why)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {result.why}
            </p>
          </div>

          {/* 3. CORRECTED CODE */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-300 font-semibold">
                  Corrected & Guarded Implementation
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed">
                <code>{result.correctedCode}</code>
              </pre>
            </div>
          </div>

          {/* 4. WHAT CHANGED */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Explicit Structural Changes:
            </h4>
            <div className="space-y-2">
              {result.whatChanged.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. CONCEPT MASTERY CARD */}
          <div className="bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl p-6 sm:p-7 border border-purple-200 dark:border-purple-900/50 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                Universal Concept: {result.learnThisConcept.concept}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {result.learnThisConcept.explanation}
            </p>
            <div className="p-3.5 rounded-xl bg-purple-100/70 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-xs sm:text-sm font-semibold text-purple-950 dark:text-purple-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
              <span>{result.learnThisConcept.ruleOfThumb}</span>
            </div>
          </div>

          {/* 6. TRY IT YOURSELF (Interactive Challenge with Rubric Evaluation) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Try It Yourself: Mini Challenge
                </h3>
              </div>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                {showSolution ? 'Hide Solution' : 'Reveal Reference Solution'}
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
              {result.tryItYourself.prompt}
            </p>

            <textarea
              rows={4}
              value={userTryAnswer}
              onChange={(e) => setUserTryAnswer(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCheckChallenge}
                disabled={isEvaluating || !userTryAnswer.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Solution...</span>
                  </>
                ) : (
                  <span>Check Understanding</span>
                )}
              </button>
            </div>

            {/* Evaluation Error */}
            {evalError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{evalError}</span>
              </div>
            )}

            {/* Rubric Evaluation Result */}
            {evalResult && (
              <div className={`mt-4 p-4 rounded-xl border text-xs sm:text-sm animate-in fade-in ${
                evalResult.isCorrect 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100' 
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {evalResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Challenge Solved — {evalResult.conceptMastery}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Needs Adjustment — {evalResult.conceptMastery}</span>
                    </>
                  )}
                </div>

                <p className="leading-relaxed">
                  {evalResult.feedback}
                </p>

                {evalResult.detectedIssues && evalResult.detectedIssues.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-amber-200/80 dark:border-amber-800/80">
                    <span className="font-semibold block mb-1 text-[11px] uppercase tracking-wider">
                      Identified gaps:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      {evalResult.detectedIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {showSolution && (
              <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Reference Solution:
                </div>
                <pre>{result.tryItYourself.solutionCode}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
