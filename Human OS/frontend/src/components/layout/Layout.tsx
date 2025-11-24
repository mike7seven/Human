import { useState, type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { useCognitiveState } from '@/context/CognitiveStateContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, dismissToast } = useCognitiveState();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={state.toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default Layout;
