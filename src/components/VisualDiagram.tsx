/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VisualDiagram — Context-Aware Pedagogical Visual Engine & Diagram Type Router
 * 
 * Routes automatically by concept shape:
 * - Process / Steps -> FlowDiagram (animated numbered pipeline)
 * - Comparison / Contrast -> CompareDiagram (side-by-side split cards)
 * - System / Architecture -> StackDiagram (layered horizontal stack Client -> API -> DB)
 * - Hierarchy / Classification -> TreeDiagram (mind-map / tree with bezier branches)
 * - Data / Metrics -> ChartDiagram (stat tiles + mini bar/line charts)
 * - Math / Equations -> EquationDiagram (equation block with annotated steps)
 * - Timeline / History -> TimelineDiagram (horizontal milestone timeline)
 */

import React, { useState, useEffect } from 'react';
import { 
  VisualExplanation, 
  VisualDiagramType, 
  ExplanationLevel 
} from '../types';
import {
  FlowDiagram,
  CompareDiagram,
  StackDiagram,
  TreeDiagram,
  ChartDiagram,
  EquationDiagram,
  TimelineDiagram,
  CycleDiagram
} from './diagrams';
import { 
  Layers, 
  GitBranch, 
  Columns, 
  Activity, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  Info,
  Clock,
  Sigma,
  Workflow,
  RotateCw,
  Eye
} from 'lucide-react';

interface VisualDiagramProps {
  data?: VisualExplanation | null;
  topic?: string;
  level?: ExplanationLevel;
  isLoading?: boolean;
  onRefreshVisual?: (preferredType?: VisualDiagramType) => void;
  error?: string | null;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ 
  data, 
  topic = 'Concept',
  level = 'beginner',
  isLoading = false,
  onRefreshVisual,
  error = null
}) => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'diagram' | 'breakdown'>('diagram');
  const [hasRenderError, setHasRenderError] = useState<boolean>(false);

  // Determine active diagram type with robust normalization & fallback detection
  const resolveDiagramType = (): VisualDiagramType => {
    if (!data) return 'flow';
    
    // Check explicit type field with alias normalization
    if (data.type) {
      const rawType = String(data.type).toLowerCase().trim();
      if (rawType === 'compare' || rawType === 'comparison' || rawType === 'versus') return 'comparison';
      if (rawType === 'stack' || rawType === 'layers' || rawType === 'architecture') return 'layers';
      if (rawType === 'tree' || rawType === 'concept_map' || rawType === 'mindmap' || rawType === 'hierarchy') return 'concept_map';
      if (rawType === 'chart' || rawType === 'bar' || rawType === 'metrics') return 'chart';
      if (rawType === 'equation' || rawType === 'formula' || rawType === 'math') return 'equation';
      if (rawType === 'timeline' || rawType === 'history' || rawType === 'milestones') return 'timeline';
      if (rawType === 'cycle' || rawType === 'loop' || rawType === 'circular') return 'cycle';
      if (rawType === 'graph') {
        return (data.graphData?.formula || data.equationData) ? 'equation' : 'chart';
      }
      return 'flow';
    }

    // Infer from structured data payloads
    if (data.comparisonData) return 'comparison';
    if (data.conceptMapData) return 'concept_map';
    if (data.equationData) return 'equation';
    if (data.chartData) return 'chart';
    if (data.timelineData && data.timelineData.length > 0) return 'timeline';
    if (data.layers && data.layers.length > 0) return 'layers';
    if (data.graphData) {
      return data.graphData.formula ? 'equation' : 'chart';
    }

    // Fallback: analyze title keywords if type is still ambiguous
    const titleLower = String(data.title || topic).toLowerCase();
    if (titleLower.includes(' vs ') || titleLower.includes('versus') || titleLower.includes('comparison')) {
      return 'comparison';
    }
    if (titleLower.includes('cycle') || titleLower.includes('loop') || titleLower.includes('continuous')) {
      return 'cycle';
    }
    if (titleLower.includes('layer') || titleLower.includes('stack') || titleLower.includes('architecture')) {
      return 'layers';
    }

    return 'flow';
  };

  const diagramType: VisualDiagramType = resolveDiagramType();
  const stages = data?.stages || [];

  // Reset active stage when stages array changes
  useEffect(() => {
    setActiveStage(0);
    setHasRenderError(false);
  }, [data?.title, data?.type]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Synthesizing Conceptual Diagram…
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generating SVG visual representation for {topic}
              </p>
            </div>
          </div>
        </div>

        {/* Pulse skeleton mirror */}
        <div className="space-y-4 animate-pulse py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/40" />
        </div>
      </div>
    );
  }

  // 2. Error / Missing State
  if (error || !data) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Visual Representation In Progress
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                {error || 'No visual diagram was attached to this prompt yet. Generate a clean, context-aware diagram at any time.'}
              </p>
            </div>
          </div>

          {onRefreshVisual && (
            <button
              onClick={() => onRefreshVisual()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95 transition-all self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Clean Visual</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Badge metadata
  const getTypeBadge = () => {
    switch (diagramType) {
      case 'comparison':
        return { label: 'Side-by-Side Comparison', icon: Columns };
      case 'layers':
        return { label: 'Architecture Layers', icon: Layers };
      case 'concept_map':
      case 'tree':
        return { label: 'Conceptual Hierarchy', icon: GitBranch };
      case 'chart':
        return { label: 'Metric Analytics', icon: Activity };
      case 'equation':
        return { label: 'Mathematical Model', icon: Sigma };
      case 'timeline':
        return { label: 'Timeline Progression', icon: Clock };
      case 'cycle':
        return { label: 'Cyclic Feedback Loop', icon: RefreshCw };
      default:
        return { label: 'Sequential Process', icon: Workflow };
    }
  };

  const badgeInfo = getTypeBadge();
  const IconComponent = badgeInfo.icon;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {data.title || `${topic} Visual Model`}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                {badgeInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SVG-based high-clarity mental model
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle (Diagram vs Breakdown) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/70 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setViewMode('breakdown')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'breakdown'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Details
            </button>
          </div>

          {/* Regenerate Visual button */}
          {onRefreshVisual && (
            <button
              onClick={() => onRefreshVisual()}
              title="Regenerate diagram"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Visual Display or Breakdown */}
      <div className="my-5 min-h-[300px] w-full overflow-x-auto overflow-y-visible">
        {viewMode === 'breakdown' ? (
          /* Text breakdown table / list */
          <div className="space-y-3 p-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Structural Components
            </h5>
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h6 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {stage.label}
                      </h6>
                      {stage.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {stage.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* THE DIAGRAM TYPE ROUTER */
          <div className="animate-in fade-in duration-200 w-full min-h-[280px]">
            {hasRenderError ? (
              <FlowDiagram
                title={data.title || topic}
                nodes={data.nodes}
                edges={data.edges}
                stages={stages}
                activeStage={activeStage}
                onSelectStage={(idx) => setActiveStage(idx)}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'comparison' ? (
              <CompareDiagram
                title={data.title}
                data={data.comparisonData}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'layers' ? (
              <StackDiagram
                title={data.title}
                layers={data.layers}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'concept_map' || diagramType === 'tree' ? (
              <TreeDiagram
                title={data.title}
                data={data.conceptMapData}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'chart' ? (
              <ChartDiagram
                title={data.title}
                chartData={data.chartData}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'equation' ? (
              <EquationDiagram
                title={data.title}
                data={data.equationData || (data.graphData ? {
                  formula: data.graphData.formula || 'F = ma',
                  name: data.graphData.title,
                  explanation: data.graphData.explanation,
                  variables: data.graphData.elements?.map(el => ({
                    symbol: el.label,
                    meaning: el.description || '',
                    unit: el.value !== undefined ? String(el.value) : undefined
                  }))
                } : undefined)}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'timeline' ? (
              <TimelineDiagram
                title={data.title}
                items={data.timelineData}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : diagramType === 'cycle' ? (
              <CycleDiagram
                title={data.title}
                stages={stages}
                altText={data.altText}
                caption={data.caption}
              />
            ) : (
              /* Default: Process / Steps -> Animated Numbered Flow Diagram */
              <FlowDiagram
                title={data.title || topic}
                nodes={data.nodes}
                edges={data.edges}
                stages={stages}
                activeStage={activeStage}
                onSelectStage={(idx) => setActiveStage(idx)}
                altText={data.altText}
                caption={data.caption}
              />
            )}
          </div>
        )}
      </div>

      {/* Accessible Alt text summary footer */}
      {data.altText && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Visual context: {data.altText}</span>
        </div>
      )}
    </div>
  );
};
