import { useCognitiveState } from '@/context/CognitiveStateContext';
import {
  StatusCard,
  FocusTimer,
  ThreadList,
  LoopList,
  QuickActions,
  EmotionalLoadChart,
} from '@/components/dashboard';

export function Dashboard() {
  const { state } = useCognitiveState();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Your cognitive control center. Monitor and manage your mental state.
        </p>
      </div>

      {/* Main Status Card */}
      <StatusCard />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Active Focus */}
          <FocusTimer focus={state.focus} />

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Open Loops */}
          <LoopList />

          {/* Active Threads */}
          <ThreadList />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EmotionalLoadChart />
      </div>
    </div>
  );
}

export default Dashboard;
