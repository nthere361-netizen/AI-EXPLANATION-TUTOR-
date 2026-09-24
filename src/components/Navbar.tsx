import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Code2, 
  GitFork, 
  Settings, 
  Home, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'explain' | 'materials' | 'code-tutor' | 'paths' | 'settings';
  setCurrentTab: (tab: 'home' | 'explain' | 'materials' | 'code-tutor' | 'paths' | 'settings') => void;
  hasActiveExplanation?: boolean;
}

interface NavItem {
  id: 'home' | 'explain' | 'materials' | 'code-tutor' | 'paths' | 'settings';
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab,
  hasActiveExplanation 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explain', label: 'Explain', icon: Sparkles, badge: hasActiveExplanation ? 'Active' : undefined },
    { id: 'materials', label: 'My Materials', icon: FileText },
    { id: 'code-tutor', label: 'Code Tutor', icon: Code2 },
    { id: 'paths', label: 'Learning Paths', icon: GitFork },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Logo & Brand Identity */}
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 active:scale-95 transition-all duration-150">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                Explanation <span className="text-indigo-600">Tutor</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Medium Screen Navigation (Icon + Compact Label) */}
          <nav className="hidden md:flex lg:hidden items-center gap-0.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  title={item.label}
                  className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Mode Pill */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[11px] text-slate-600 font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Deep Learning Mode</span>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 pt-2 pb-4 space-y-1 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Deep Learning
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/90 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
