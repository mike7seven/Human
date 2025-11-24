import { useState } from 'react';
import { Settings as SettingsIcon, RotateCcw, XCircle, Info, Server } from 'lucide-react';
import { Card, CardHeader, Button, Modal } from '@/components/ui';
import { modeAPI } from '@/services/api';
import { useCognitiveState } from '@/context/CognitiveStateContext';

const KEYBOARD_SHORTCUTS = [
  { shortcut: '⌘/Ctrl + K', description: 'Open command palette' },
  { shortcut: 'G D', description: 'Go to Dashboard' },
  { shortcut: 'G F', description: 'Go to Focus' },
  { shortcut: 'G L', description: 'Go to Loops' },
  { shortcut: 'G T', description: 'Go to Threads' },
  { shortcut: 'G I', description: 'Go to Ingest' },
  { shortcut: 'G E', description: 'Go to Emotion' },
  { shortcut: 'G A', description: 'Go to Archive' },
  { shortcut: 'G S', description: 'Go to Settings' },
  { shortcut: 'Esc', description: 'Close modal/palette' },
];

export function Settings() {
  const { addToast, refreshStatus } = useCognitiveState();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'soft' | 'hard' | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async (type: 'soft' | 'hard') => {
    setResetType(type);
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    if (!resetType) return;

    try {
      setIsResetting(true);
      if (resetType === 'soft') {
        await modeAPI.resetSoft();
        addToast('success', 'Soft reset complete. Nonessential threads cleared.');
      } else {
        await modeAPI.resetHard();
        addToast('success', 'Hard reset complete. Recovery mode activated.');
      }
      await refreshStatus();
    } catch {
      addToast('error', `Failed to perform ${resetType} reset`);
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
      setResetType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-slate-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          System configuration and recovery options.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Reset */}
        <Card>
          <CardHeader
            title="System Reset"
            description="Reset your cognitive state when things get overwhelming"
          />

          <div className="space-y-4">
            {/* Soft Reset */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">Soft Reset</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Close all nonessential tabs (mental and literal). Keep only
                    top 3 priorities. Use when cluttered but not fried.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={() => handleReset('soft')}
                    icon={<RotateCcw className="h-4 w-4" />}
                  >
                    Perform Soft Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Hard Reset */}
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Hard Reset</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Enter full recovery mode. No new input, no problem-solving.
                    Only recovery actions until you're restored. Use when truly
                    fried.
                  </p>
                  <Button
                    variant="danger"
                    className="mt-3"
                    onClick={() => handleReset('hard')}
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    Perform Hard Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader
            title="Keyboard Shortcuts"
            description="Power user navigation"
          />

          <div className="space-y-2">
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.shortcut}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-slate-600">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 rounded border border-gray-200">
                  {shortcut.shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader
            title="API Configuration"
            description="Connection settings for the Cognitive API"
          />

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Server className="h-4 w-4" />
                <span className="font-medium">API Endpoint</span>
              </div>
              <code className="text-xs text-slate-500 mt-1 block font-mono">
                {import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}
              </code>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Status polling active (every 5 seconds)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <CardHeader
            title="About Human OS"
            description="Cognitive self-regulation interface"
          />

          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Human OS is a cognitive control interface - mission control for
              your brain. It helps you manage focus, loops, threads, and mental
              state through explicit commands rather than letting your system
              run on autopilot.
            </p>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Core Philosophy</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your brain is a powerful system, but like any complex system,
                  it benefits from explicit controls. Rather than letting 1,000
                  loops auto-spawn, Human OS gives you the tools to issue clear
                  instructions to yourself.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-slate-400">
                Version 1.0.0 | Built with React, TypeScript, Tailwind
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetType(null);
        }}
        title={resetType === 'soft' ? 'Confirm Soft Reset' : 'Confirm Hard Reset'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {resetType === 'soft'
              ? 'This will close all nonessential cognitive threads and focus only on top priorities. Continue?'
              : 'This will enter full recovery mode. All non-essential processing will stop. Only use when you\'re truly fried. Continue?'}
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowResetModal(false);
                setResetType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={resetType === 'hard' ? 'danger' : 'primary'}
              onClick={confirmReset}
              loading={isResetting}
            >
              Confirm {resetType === 'soft' ? 'Soft' : 'Hard'} Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
