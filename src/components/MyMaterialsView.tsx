import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../types';
import { analyzeMaterial } from '../services/tutorService';
import { loadStoredMaterials, saveStoredMaterials } from '../services/storage';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Trash2, 
  Clock, 
  HardDrive, 
  BookOpen, 
  AlertCircle,
  FileCode,
  Loader2,
  FileCheck
} from 'lucide-react';

interface MyMaterialsViewProps {
  onLearnFromTopic: (topic: string) => void;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.json', '.csv', '.html'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MyMaterialsView: React.FC<MyMaterialsViewProps> = ({ onLearnFromTopic }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => loadStoredMaterials());
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Set default selected material on mount
  useEffect(() => {
    if (materials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materials[0]);
    }
  }, [materials, selectedMaterial]);

  const handleFileSelection = async (file: File) => {
    setErrorMessage(null);

    // 1. Validate file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported format (${ext}). Supported formats: PDF, TXT, MD, PY, JS, TS, Java, C++, JSON, CSV.`);
      return;
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File exceeds maximum allowable size (10MB). Please choose a smaller document.');
      return;
    }

    if (file.size === 0) {
      setErrorMessage("We couldn't read this file. Please try another file or format.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Reading file contents...');

    try {
      let contentText: string | undefined;
      let pdfBase64: string | undefined;

      if (ext === '.pdf') {
        setStatusMessage('Extracting document stream from PDF...');
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URI prefix (e.g. data:application/pdf;base64,)
            const commaIdx = result.indexOf(',');
            resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
          };
          reader.onerror = () => reject(new Error("We couldn't read this file. Please try another file or format."));
          reader.readAsDataURL(file);
        });
        pdfBase64 = base64Data;
      } else {
        setStatusMessage('Extracting text content...');
        const rawText = await file.text();
        if (!rawText || rawText.trim().length === 0) {
          throw new Error("We couldn't read this file. Please try another file or format.");
        }
        contentText = rawText;
      }

      setStatusMessage('AI analyzing curriculum, mental models, and key mechanisms...');
      const analysisResult = await analyzeMaterial(file.name, contentText, pdfBase64);

      const formattedSize = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const newMaterial: StudyMaterial = {
        id: 'mat-' + Date.now(),
        title: file.name,
        type: ext === '.pdf' ? 'pdf' : ['.py', '.js', '.ts', '.java', '.cpp'].includes(ext) ? 'code' : 'notes',
        size: formattedSize,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        summary: analysisResult.summary,
        keyConcepts: analysisResult.keyConcepts,
        content: analysisResult.extractedContent || contentText || `Document: ${file.name}`,
        recommendedQuestions: analysisResult.recommendedQuestions
      };

      const updated = [newMaterial, ...materials];
      setMaterials(updated);
      saveStoredMaterials(updated);
      setSelectedMaterial(newMaterial);
      setStatusMessage('');
      setLastFailedFile(null);
    } catch (err: any) {
      console.error('File analysis error:', err);
      setLastFailedFile(file);
      setErrorMessage(err?.message || "We couldn't read this file. Please try another file or format.");
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleCreateFromText = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const trimmed = customText.trim();
    if (trimmed.length < 20) {
      setModalError('Please enter at least 20 characters of notes to analyze.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Analyzing your notes with AI tutor...');

    try {
      const title = customTitle.trim() || 'Custom Lecture Notes';
      const analysisResult = await analyzeMaterial(title, trimmed);

      const newMaterial: StudyMaterial = {
        id: 'mat-' + Date.now(),
        title,
        type: 'notes',
        size: `${(trimmed.length / 1024).toFixed(1)} KB`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        summary: analysisResult.summary,
        keyConcepts: analysisResult.keyConcepts,
        content: trimmed,
        recommendedQuestions: analysisResult.recommendedQuestions
      };

      const updated = [newMaterial, ...materials];
      setMaterials(updated);
      saveStoredMaterials(updated);
      setSelectedMaterial(newMaterial);
      setCustomTitle('');
      setCustomText('');
      setShowPasteModal(false);
    } catch (err: any) {
      console.error('Text analysis error:', err);
      setModalError(err?.message || 'Failed to analyze notes. Please try again.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleDeleteMaterial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    saveStoredMaterials(updated);
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(updated[0] || null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header & Flow Indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              Personal Study Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              My Study Materials
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload your textbook chapters, PDFs, lecture slides, or notes to extract mental models and trigger deep tutoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalError(null);
                setShowPasteModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Paste Raw Notes
            </button>
          </div>
        </div>

        {/* Visual Flow: UPLOAD → ANALYZE → UNDERSTAND → LEARN */}
        <div className="mt-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Step 1</span>
              <span className="text-xs font-bold text-slate-800">UPLOAD</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Step 2</span>
              <span className="text-xs font-bold text-slate-800">ANALYZE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">Step 3</span>
              <span className="text-xs font-bold text-slate-800">DECOMPOSE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Step 4</span>
              <span className="text-xs font-bold text-slate-800">TUTOR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Material List | Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Box & List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real Upload Dropzone */}
          <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-all text-center group relative overflow-hidden">
            <input
              type="file"
              accept=".pdf,.txt,.md,.py,.js,.ts,.java,.cpp,.c,.json,.csv,.html"
              disabled={isProcessing}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
                e.target.value = '';
              }}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            />
            
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Drop your syllabus, PDF, or notes
              </h3>
              <p className="text-xs text-slate-500 mb-3 max-w-xs">
                Supports PDF, Markdown, text, and code files up to 10MB
              </p>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Browse Files
              </span>
            </div>

            {/* Active processing state indicator */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-20">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-800 text-center">
                  {statusMessage || 'Analyzing Document...'}
                </p>
                <p className="text-[11px] text-slate-500 text-center mt-1">
                  Extracting foundational concepts and questions
                </p>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="leading-relaxed">{errorMessage}</p>
                <div className="flex items-center gap-3 mt-2">
                  {lastFailedFile && (
                    <button
                      onClick={() => handleFileSelection(lastFailedFile)}
                      className="text-[11px] font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-lg border border-rose-300 transition-colors"
                    >
                      Retry Analysis
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setLastFailedFile(null);
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of uploaded documents */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vault Documents ({materials.length})
              </span>
            </div>

            {materials.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No documents uploaded yet. Upload a syllabus or lecture note above.
              </div>
            ) : (
              materials.map((mat) => {
                const isSelected = selectedMaterial?.id === mat.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between group ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/30'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        mat.type === 'pdf' ? 'bg-rose-50 text-rose-600' :
                        mat.type === 'code' ? 'bg-purple-50 text-purple-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {mat.type === 'pdf' ? <FileText className="w-4 h-4" /> :
                         mat.type === 'code' ? <FileCode className="w-4 h-4" /> :
                         <BookOpen className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {mat.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{mat.size}</span>
                          <span>•</span>
                          <span>{mat.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteMaterial(mat.id, e)}
                      title="Remove from vault"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Material Curriculum Breakdown */}
        <div className="lg:col-span-7">
          {selectedMaterial ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
              {/* Material Title and Tutor Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    Extracted Curriculum
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {selectedMaterial.title}
                  </h3>
                </div>

                <button
                  onClick={() => onLearnFromTopic(selectedMaterial.recommendedQuestions[0] || selectedMaterial.title)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all hover:scale-102"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Tutor on Topic</span>
                </button>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Conceptual Summary
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {selectedMaterial.summary}
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Identified Core Concepts ({selectedMaterial.keyConcepts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedMaterial.keyConcepts.map((concept, i) => (
                    <div key={i} className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-800 leading-snug">
                        {concept}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Questions to Ask Tutor */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recommended Tutor Prompts
                </h4>
                <div className="space-y-2">
                  {selectedMaterial.recommendedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onLearnFromTopic(q)}
                      className="w-full p-3 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-900 transition-all flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              Select or upload a study material to view extracted concepts.
            </div>
          )}
        </div>
      </div>

      {/* Paste notes modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Paste Lecture Notes or Text
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste rough notes, syllabus text, or textbook excerpts. Explanation Tutor will extract the foundational mental models.
            </p>

            {modalError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFromText} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chem 101 - Acid Base Equilibria"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes Content</label>
                <textarea
                  rows={6}
                  placeholder="Paste lecture text, formulas, or summaries here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  disabled={isProcessing}
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !customText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Analyze & Add to Vault</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
