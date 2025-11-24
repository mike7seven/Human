import { useState, useEffect, useCallback } from 'react';
import { Search, Command, Bell, Settings, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { getLoadLevelBgColor } from '@/utils/helpers';
import CommandPalette from './CommandPalette';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { state } = useCognitiveState();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Human OS</span>
          </Link>

          {/* Search / Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-sm"
          >
            <Search className="h-4 w-4" />
            <span>Quick actions...</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white rounded border border-gray-300 font-mono">
              <Command className="h-3 w-3 inline" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          {state.status && (
            <div className="hidden md:flex items-center gap-3 mr-2">
              {/* Emotional Load */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Load</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${getLoadLevelBgColor(
                    state.status.emotional_load
                  )}`}
                />
              </div>

              {/* Energy Level */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Energy</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${getLoadLevelBgColor(
                    state.status.energy_level
                  )}`}
                />
              </div>

              {/* Open Loops */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Loops</span>
                <span className="text-xs font-medium text-slate-700">
                  {state.status.open_loops_estimate}
                </span>
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="p-2 rounded-md text-slate-500 hover:bg-slate-100 relative">
            <Bell className="h-5 w-5" />
            {state.status && state.status.pending_tasks > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
}

export default Header;
