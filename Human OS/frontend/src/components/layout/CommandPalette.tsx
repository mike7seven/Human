import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Target,
  RefreshCw,
  Cpu,
  Inbox,
  Heart,
  Archive,
  Settings,
  Plus,
  Zap,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'focus' | 'loops' | 'quick';
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        shortcut: 'G D',
        action: () => {
          navigate('/');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-focus',
        label: 'Go to Focus',
        icon: <Target className="h-4 w-4" />,
        shortcut: 'G F',
        action: () => {
          navigate('/focus');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-loops',
        label: 'Go to Loops',
        icon: <RefreshCw className="h-4 w-4" />,
        shortcut: 'G L',
        action: () => {
          navigate('/loops');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-threads',
        label: 'Go to Threads',
        icon: <Cpu className="h-4 w-4" />,
        shortcut: 'G T',
        action: () => {
          navigate('/threads');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-ingest',
        label: 'Go to Ingest',
        icon: <Inbox className="h-4 w-4" />,
        shortcut: 'G I',
        action: () => {
          navigate('/ingest');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-emotion',
        label: 'Go to Emotion',
        icon: <Heart className="h-4 w-4" />,
        shortcut: 'G E',
        action: () => {
          navigate('/emotion');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-archive',
        label: 'Go to Archive',
        icon: <Archive className="h-4 w-4" />,
        shortcut: 'G A',
        action: () => {
          navigate('/archive');
          onClose();
        },
        category: 'navigation',
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        icon: <Settings className="h-4 w-4" />,
        shortcut: 'G S',
        action: () => {
          navigate('/settings');
          onClose();
        },
        category: 'navigation',
      },
      // Quick Actions
      {
        id: 'quick-new-focus',
        label: 'Set New Focus',
        description: 'Start a new focus session',
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          navigate('/focus');
          onClose();
        },
        category: 'focus',
      },
      {
        id: 'quick-lock-focus',
        label: 'Lock Focus',
        description: 'Enter hyperfocus mode',
        icon: <Zap className="h-4 w-4" />,
        action: () => {
          navigate('/focus');
          onClose();
        },
        category: 'focus',
      },
      {
        id: 'quick-new-loop',
        label: 'Authorize New Loop',
        description: 'Create a new open loop',
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          navigate('/loops');
          onClose();
        },
        category: 'loops',
      },
      {
        id: 'quick-close-loop',
        label: 'Close Loop',
        description: 'Mark a loop as done',
        icon: <XCircle className="h-4 w-4" />,
        action: () => {
          navigate('/loops');
          onClose();
        },
        category: 'loops',
      },
      {
        id: 'quick-soft-reset',
        label: 'Soft Reset',
        description: 'Clear nonessential threads',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => {
          navigate('/settings');
          onClose();
        },
        category: 'quick',
      },
    ],
    [navigate, onClose]
  );

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    focus: 'Focus',
    loops: 'Loops',
    quick: 'Quick Actions',
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-slate-100 rounded border border-gray-200 font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {categoryLabels[category]}
                </div>
                {items.map((cmd) => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                      )}
                    >
                      <span className="text-slate-500">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {cmd.label}
                        </p>
                        {cmd.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-slate-100 rounded border border-gray-200 font-mono text-slate-500">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-slate-100 rounded">↑</kbd>
              <kbd className="px-1 bg-slate-100 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 bg-slate-100 rounded">↵</kbd>
              to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
