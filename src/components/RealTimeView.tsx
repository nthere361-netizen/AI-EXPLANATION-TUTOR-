import React, { useState } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudSun, 
  Activity, 
  Zap, 
  Percent, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Globe, 
  Layers,
  ChevronRight,
  HelpCircle,
  Share2,
  Check
} from 'lucide-react';
import { RealTimeData, RealTimeIntent, LiveStatTile } from '../types';

interface RealTimeViewProps {
  data: RealTimeData | null;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  recentQueries: string[];
  onSearch: (query: string, intent?: RealTimeIntent) => void;
  onRefresh: () => void;
}

const PRESET_QUERIES = [
  { label: 'Tokyo Weather & Climate', query: 'Tokyo current weather and forecast', intent: 'weather' as const, icon: CloudSun },
  { label: 'Bitcoin Price & Trend', query: 'Bitcoin live price & market trend', intent: 'finance' as const, icon: TrendingUp },
  { label: 'Ethereum & Gas Activity', query: 'Ethereum live price and network gas fees', intent: 'finance' as const, icon: Zap },
  { label: 'Fed Interest Rates & Inflation', query: 'Federal Reserve interest rate decisions & inflation', intent: 'finance' as const, icon: Percent },
  { label: 'Global AI Semiconductor Trends', query: 'Latest AI and semiconductor hardware developments', intent: 'news' as const, icon: Globe },
];

export const RealTimeView: React.FC<RealTimeViewProps> = ({
  data,
  isLoading,
  loadingStep,
  error,
  recentQueries,
  onSearch,
  onRefresh,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<RealTimeIntent | 'auto'>('auto');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isLoading) return;
    onSearch(queryInput.trim(), selectedIntent === 'auto' ? undefined : selectedIntent);
  };

  const handlePresetClick = (presetQuery: string, intent?: RealTimeIntent) => {
    setQueryInput(presetQuery);
    if (intent) setSelectedIntent(intent);
    onSearch(presetQuery, intent);
  };

  const getTileIcon = (iconName?: string) => {
    switch (iconName) {
      case 'thermometer': return Thermometer;
      case 'droplet': return Droplets;
      case 'wind': return Wind;
      case 'cloud-sun': return CloudSun;
      case 'trending-up': return TrendingUp;
      case 'activity': return Activity;
      case 'zap': return Zap;
      case 'percent': return Percent;
      case 'calendar': return Calendar;
      default: return Activity;
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold tracking-wide uppercase mb-4">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Mode B • Live Telemetry & Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Real-Time <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Information Tutor</span>
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Live prices, weather dynamics, macroeconomic trends, and current affairs explained through 
            first-principles causality, clear analogies, and verified telemetry.
          </p>
        </div>

        {/* Search & Intent Form */}
        <form onSubmit={handleSubmit} className="mt-8 relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask about live weather, crypto, stock markets, inflation, or current news…"
                className="w-full bg-transparent border-0 px-3 py-2.5 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-0"
              />
            </div>

            {/* Intent Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 rounded-xl border border-slate-700/60 shrink-0">
              {(['auto', 'weather', 'finance', 'news'] as const).map((intent) => (
                <button
                  type="button"
                  key={intent}
                  onClick={() => setSelectedIntent(intent)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedIntent === intent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {intent}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || !queryInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Fetching…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Fetch & Explain</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-medium shrink-0">Quick live topics:</span>
            {PRESET_QUERIES.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset.query, preset.intent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Unable to fetch live information</p>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">{error}</p>
          </div>
          <button
            onClick={() => onSearch(queryInput || 'Tokyo current weather and forecast')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-sm font-medium text-indigo-950 dark:text-indigo-200">
                {loadingStep || 'Querying live telemetry…'}
              </span>
            </div>
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-mono">Real-time sync</span>
          </div>

          {/* Stat Tiles Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="w-28 h-7 bg-slate-300 dark:bg-slate-600 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800" />
        </div>
      )}

      {/* Real-Time Result Content */}
      {!isLoading && data && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Telemetry Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Live Telemetry
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {data.intent.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {data.headline}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  Source: <strong className="text-slate-700 dark:text-slate-300 font-medium">{data.source}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Updated: <span className="font-mono">{data.lastUpdated}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={onRefresh}
                title="Refresh live data now"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Refresh Live</span>
              </button>
              <button
                onClick={copyShareLink}
                title="Share link"
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live KPI Stat Tiles */}
          {data.liveTiles && data.liveTiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.liveTiles.map((tile: LiveStatTile, idx: number) => {
                const Icon = getTileIcon(tile.icon);
                const isPositive = tile.isPositive !== false;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                      <span className="truncate">{tile.label}</span>
                      <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    </div>

                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                        {tile.value}
                      </div>

                      {tile.change && (
                        <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
                          tile.isPositive === undefined 
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isPositive 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tile.isPositive !== undefined && (
                            isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{tile.change}</span>
                        </div>
                      )}

                      {tile.subtext && (
                        <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {tile.subtext}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Visual Trend Chart or Progression */}
          {data.visual && data.visual.dataPoints && data.visual.dataPoints.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    {data.visual.title || 'Dynamic Telemetry Progression'}
                  </h3>
                  {data.visual.caption && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {data.visual.caption}
                    </p>
                  )}
                </div>
                <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50">
                  Trendline
                </div>
              </div>

              {/* SVG Trendline Graphic */}
              <div className="pt-4 pb-2">
                <div className="h-44 sm:h-52 w-full flex items-end gap-2 sm:gap-4 px-2">
                  {(() => {
                    const points = data.visual.dataPoints;
                    const maxVal = Math.max(...points.map(p => p.value));
                    const minVal = Math.min(...points.map(p => p.value));
                    const range = maxVal - minVal || 1;

                    return points.map((pt, i) => {
                      const heightPercent = Math.max(20, Math.round(((pt.value - minVal) / range) * 80 + 15));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          {/* Bar Value Tooltip */}
                          <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-90 group-hover:scale-110 transition-transform">
                            {pt.value.toLocaleString()}
                          </div>
                          
                          {/* Animated Column Bar */}
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-sky-400 transition-all shadow-xs"
                          />

                          {/* Label */}
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full text-center">
                            {pt.label}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {data.visual.summary && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                  <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{data.visual.summary}</span>
                </div>
              )}
            </div>
          )}

          {/* 3-Layer Pedagogical Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layer 1: In Simple Words */}
            <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                1
              </div>
              <h3 className="font-bold text-indigo-950 dark:text-indigo-200 text-base">
                In Simple Words
              </h3>
              <p className="text-sm text-indigo-900 dark:text-indigo-300 leading-relaxed">
                {data.inSimpleWords}
              </p>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider pt-2">
                Analogy for Instant Intuition
              </div>
            </div>

            {/* Layer 2: First-Principles Explanation */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                First-Principles Causality
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.firstPrinciples}
              </p>
              <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider pt-2">
                Under the Hood Mechanism
              </div>
            </div>

            {/* Layer 3: Real-World Context */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Real-World Impact
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.realWorldContext}
              </p>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pt-2">
                Actionable Relevance
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          {data.keyTakeaways && data.keyTakeaways.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Key Takeaways
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.keyTakeaways.map((point: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                      Insight {idx + 1}
                    </span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Inquisitive Queries */}
          {data.relatedQueries && data.relatedQueries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Explore deeper questions related to this live data:
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.relatedQueries.map((q: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQueryInput(q);
                      onSearch(q, data.intent);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
