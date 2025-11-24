import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  RefreshCw,
  Cpu,
  Inbox,
  Heart,
  Archive,
  Settings,
  X,
  Zap,
  Brain,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useCognitiveState } from '@/context/CognitiveStateContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/focus', label: 'Focus', icon: Target },
  { path: '/loops', label: 'Loops', icon: RefreshCw },
  { path: '/threads', label: 'Threads', icon: Cpu },
  { path: '/ingest', label: 'Ingest', icon: Inbox },
  { path: '/emotion', label: 'Emotion', icon: Heart },
  { path: '/archive', label: 'Archive', icon: Archive },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { state } = useCognitiveState();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">H</span>
              </div>
              <span className="font-semibold">Human OS</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Focus */}
          {state.status?.current_focus && (
            <div className="mx-4 mb-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
                <Target className="h-3 w-3" />
                ACTIVE FOCUS
              </div>
              <p className="text-sm text-white truncate">
                {state.status.current_focus}
              </p>
              {state.status.focus_locked && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-400">
                  <Zap className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}

                  {/* Badges */}
                  {item.path === '/loops' && state.status && (
                    <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                      {state.status.open_loops_estimate}
                    </span>
                  )}
                  {item.path === '/ingest' && state.status && state.status.pending_tasks > 0 && (
                    <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {state.status.pending_tasks}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {state.status && (
            <div className="mx-4 mb-4 p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                <Brain className="h-3 w-3" />
                COGNITIVE STATUS
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Foreground</span>
                  <p className="text-white font-medium">
                    {state.status.foreground_threads.length} threads
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Background</span>
                  <p className="text-white font-medium">
                    {state.status.background_threads.length} threads
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Ideas</span>
                  <p className="text-white font-medium">
                    {state.status.captured_ideas}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Predictions</span>
                  <p className="text-white font-medium">
                    {state.status.active_predictions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Link */}
          <div className="p-3 border-t border-slate-800">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/settings'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
