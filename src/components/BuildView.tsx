import React, { useState } from 'react';
import { 
  Hammer, 
  Sparkles, 
  Layers, 
  Code2, 
  FolderTree, 
  CheckSquare, 
  Copy, 
  Check, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  ExternalLink, 
  Cpu, 
  Server, 
  Database, 
  ShieldCheck, 
  Cloud, 
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileCode,
  Folder,
  Clock,
  Target,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { BuildPlanData, CodeScaffoldFile, BuildPhase } from '../types';

interface BuildViewProps {
  data: BuildPlanData | null;
  savedBuilds: BuildPlanData[];
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  onGenerate: (idea: string, techPreferences?: string) => void;
  onSaveBuild: () => void;
  onDeleteSavedBuild: (id: string) => void;
  onLoadSavedBuild: (build: BuildPlanData) => void;
}

const PRESET_IDEAS = [
  'Full-Stack Task Manager (React + Node + SQLite)',
  'Real-time Collaborative Whiteboard with WebSockets',
  'E-Commerce Payment & Webhook Microservice',
  'AI Voice Journal with Audio Transcription',
  'Serverless URL Shortener with Geo Analytics',
];

export const BuildView: React.FC<BuildViewProps> = ({
  data,
  savedBuilds,
  isLoading,
  loadingStep,
  error,
  onGenerate,
  onSaveBuild,
  onDeleteSavedBuild,
  onLoadSavedBuild,
}) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [techPrefInput, setTechPrefInput] = useState('');
  const [activeScaffoldTab, setActiveScaffoldTab] = useState<number>(0);
  const [copiedFileIdx, setCopiedFileIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'brief' | 'architecture' | 'stack' | 'tree' | 'phases' | 'code'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInput.trim() || isLoading) return;
    onGenerate(ideaInput.trim(), techPrefInput.trim() || undefined);
  };

  const handlePresetClick = (idea: string) => {
    setIdeaInput(idea);
    onGenerate(idea, techPrefInput.trim() || undefined);
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedFileIdx(idx);
    setTimeout(() => setCopiedFileIdx(null), 2000);
  };

  const copyAllScaffolds = () => {
    if (!data) return;
    const combined = data.scaffoldFiles
      .map(f => `// ==========================================\n// File: ${f.filename}\n// Description: ${f.description}\n// ==========================================\n\n${f.code}\n`)
      .join('\n\n');
    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const downloadBlueprintMarkdown = () => {
    if (!data) return;
    let md = `# ${data.brief.title}\n> ${data.brief.tagline}\n\n`;
    md += `## Target Audience\n${data.brief.targetAudience}\n\n`;
    md += `## Core Goal\n${data.brief.coreGoal}\n\n`;
    md += `## Key Features\n${data.brief.keyFeatures.map(f => `- ${f}`).join('\n')}\n\n`;
    md += `## Architecture Layers\n`;
    data.architecture.layers.forEach(l => {
      md += `### ${l.name} (${l.badge})\n${l.description}\nTechnologies: ${l.technologies.join(', ')}\n\n`;
    });
    md += `## Data Flow\n${data.architecture.dataFlowSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    md += `## Tech Stack\n`;
    data.techStack.forEach(t => {
      md += `- **${t.category}**: ${t.technology} — ${t.reason}\n`;
    });
    md += `\n## File Structure\n`;
    data.fileTree.forEach(f => {
      md += `- \`${f.path}\`: ${f.description}\n`;
    });
    md += `\n## Implementation Phases\n`;
    data.phases.forEach(p => {
      md += `### Phase ${p.phase}: ${p.title} (${p.estimatedHours || ''})\n${p.description}\n`;
      p.tasks.forEach(t => { md += `- [ ] ${t}\n`; });
      md += '\n';
    });
    md += `## Working Code Scaffolds\n`;
    data.scaffoldFiles.forEach(f => {
      md += `### ${f.filename}\n\`\`\`${f.language}\n${f.code}\n\`\`\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.brief.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isCurrentSaved = data && savedBuilds.some(b => b.id === data.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold tracking-wide uppercase mb-4">
            <Hammer className="w-3.5 h-3.5 text-indigo-400" />
            Mode C • Software & Product Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Build Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Architect</span>
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Turn any app idea into a production-grade working blueprint: verified architecture layers, 
            justified tech stack, project file tree, phased milestones, and complete starter code scaffolds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-8 relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="What do you want to build? (e.g. 'Real-time collaborative whiteboard' or 'E-commerce API')…"
                className="w-full bg-transparent border-0 px-3 py-2.5 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-0"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !ideaInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Architecting…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-medium shrink-0">Architect ideas:</span>
            {PRESET_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(idea)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{idea}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Saved Blueprints Drawer / Bar if any */}
      {savedBuilds.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
              Saved Blueprints ({savedBuilds.length})
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {savedBuilds.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all shrink-0 ${
                  data?.id === b.id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <button
                  onClick={() => onLoadSavedBuild(b)}
                  className="hover:underline text-left cursor-pointer truncate max-w-[200px]"
                >
                  {b.brief.title}
                </button>
                <button
                  onClick={() => onDeleteSavedBuild(b.id)}
                  title="Remove saved blueprint"
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-sm font-medium text-indigo-950 dark:text-indigo-200">
                {loadingStep || 'Designing architecture layers & code scaffolds…'}
              </span>
            </div>
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-mono">Synthesizing files</span>
          </div>

          <div className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
          </div>
        </div>
      )}

      {/* Blueprint Content */}
      {!isLoading && data && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
                  Working Blueprint
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {data.scaffoldFiles.length} Starter Code Files
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {data.brief.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {data.brief.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onSaveBuild}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isCurrentSaved
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCurrentSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                <span>{isCurrentSaved ? 'Saved to Blueprints' : 'Save Blueprint'}</span>
              </button>
              <button
                onClick={downloadBlueprintMarkdown}
                title="Download full architectural blueprint as Markdown"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          {/* 1. Project Brief Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                1. Project Brief & Scope
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Audience</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {data.brief.targetAudience}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Core Problem & Goal</h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {data.brief.coreGoal}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Functional Features</h4>
                <div className="space-y-2">
                  {data.brief.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Architecture Diagram (Layers & Flow) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  2. System Architecture & Component Layers
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">End-to-End Pipeline</span>
            </div>

            {/* Architecture Stack Bands */}
            <div className="space-y-3">
              {data.architecture.layers.map((layer, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/80 dark:to-indigo-950/20 border border-slate-200/90 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {layer.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        {layer.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-8">
                      {layer.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pl-8 md:pl-0 shrink-0">
                    {layer.technologies.map((t, ti) => (
                      <span
                        key={ti}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Data Flow Progression */}
            {data.architecture.dataFlowSteps && data.architecture.dataFlowSteps.length > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data Flow Pipeline
                </h4>
                <div className="space-y-2">
                  {data.architecture.dataFlowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Tech Stack Justifications */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                3. Tech Stack & Architectural Decisions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.techStack.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:shadow-xs transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.technology}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Project File Structure Tree */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FolderTree className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                4. Project File Tree & Organization
              </h3>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs text-slate-300 border border-slate-800 space-y-2 overflow-x-auto">
              {data.fileTree.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 hover:bg-slate-800/60 p-1 rounded-md transition-colors">
                  {f.isFolder ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-100">{f.path}</span>
                  <span className="text-slate-500 font-sans text-xs ml-auto truncate max-w-xs sm:max-w-md">
                    {f.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Phased Build Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                5. Step-by-Step Implementation Phases
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.phases.map((phase: BuildPhase) => (
                <div
                  key={phase.phase}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                      Phase {phase.phase}
                    </span>
                    {phase.estimatedHours && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {phase.estimatedHours}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {phase.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {phase.description}
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    {phase.tasks.map((task, ti) => (
                      <div key={ti} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Working Code Scaffold */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  6. Working Code Scaffold Files
                </h3>
              </div>

              <button
                onClick={copyAllScaffolds}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'All Files Copied!' : 'Copy All Scaffolds'}</span>
              </button>
            </div>

            {/* Scaffold Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 no-scrollbar">
              {data.scaffoldFiles.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScaffoldTab(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs sm:text-sm font-mono font-medium transition-all shrink-0 cursor-pointer ${
                    activeScaffoldTab === idx
                      ? 'bg-slate-900 text-white border-t-2 border-indigo-500 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>

            {/* Active File Content View */}
            {data.scaffoldFiles[activeScaffoldTab] && (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
                  <div className="space-y-0.5">
                    <span className="font-mono font-semibold text-white">
                      {data.scaffoldFiles[activeScaffoldTab].filename}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {data.scaffoldFiles[activeScaffoldTab].description}
                    </p>
                  </div>

                  <button
                    onClick={() => copyCode(data.scaffoldFiles[activeScaffoldTab].code, activeScaffoldTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedFileIdx === activeScaffoldTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-5 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
                  <code>{data.scaffoldFiles[activeScaffoldTab].code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
