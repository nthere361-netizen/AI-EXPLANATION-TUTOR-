import React, { useState } from 'react';
import { LearningPath, LearningPathNode } from '../types';
import { SAMPLE_LEARNING_PATHS } from '../data/mockData';
import { 
  GitFork, 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Compass,
  BookOpen
} from 'lucide-react';

interface LearningPathViewProps {
  onStartTopic: (prompt: string) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({ onStartTopic }) => {
  const [paths, setPaths] = useState<LearningPath[]>(SAMPLE_LEARNING_PATHS);
  const [activePathId, setActivePathId] = useState<string>(SAMPLE_LEARNING_PATHS[0].id);
  const [selectedNode, setSelectedNode] = useState<LearningPathNode | null>(SAMPLE_LEARNING_PATHS[0].nodes[3]);

  const activePath = paths.find((p) => p.id === activePathId) || paths[0];

  const handleSelectNode = (node: LearningPathNode) => {
    setSelectedNode(node);
  };

  const calculateProgress = (path: LearningPath) => {
    const completed = path.nodes.filter(n => n.status === 'completed').length;
    return Math.round((completed / path.nodes.length) * 100);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-50 text-teal-700 border border-teal-100">
              Curated Roadmaps
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Interactive Learning Paths
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Structured concept journeys designed for cumulative understanding without cognitive gaps.
            </p>
          </div>
        </div>

        {/* Path Selectors */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paths.map((path) => {
            const isSelected = activePathId === path.id;
            const progress = calculateProgress(path);
            return (
              <button
                key={path.id}
                onClick={() => {
                  setActivePathId(path.id);
                  const firstCurrent = path.nodes.find(n => n.status === 'current') || path.nodes[0];
                  setSelectedNode(firstCurrent);
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-400/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {path.category}
                  </span>
                  <h3 className={`text-sm font-bold ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                    {path.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Mastery</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roadmap & Active Node View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Connected Roadmap Nodes */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {activePath.title} Roadmap
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {activePath.nodes.length} Milestones
            </span>
          </div>

          <div className="relative space-y-4">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 z-0" />

            {activePath.nodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'current';
              const isLocked = node.status === 'locked';

              return (
                <div key={node.id} className="relative z-10 flex items-start gap-4">
                  {/* Status Node Icon */}
                  <button
                    onClick={() => handleSelectNode(node)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'ring-4 ring-teal-200 shadow-md scale-105'
                        : 'hover:scale-102'
                    } ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : isCurrent
                        ? 'bg-teal-600 text-white shadow-teal-200 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>

                  {/* Node Card */}
                  <button
                    onClick={() => handleSelectNode(node)}
                    className={`flex-1 p-4 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-300 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Step {index + 1}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            Current Focus
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{node.estimatedTime}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                      {node.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {node.description}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Node Focus Card */}
        <div className="lg:col-span-5">
          {selectedNode ? (
            <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedNode.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  selectedNode.status === 'current' ? 'bg-teal-50 text-teal-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {selectedNode.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{selectedNode.estimatedTime}</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedNode.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Target Conceptual Outcome:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Establish a rock-solid mental model of {selectedNode.title.toLowerCase()} before progressing to downstream topics.
                </p>
              </div>

              <button
                onClick={() => onStartTopic(selectedNode.prompt)}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 active:scale-98 text-white shadow-md shadow-teal-200 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explain This Milestone</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
              Select a milestone to view concept overview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
