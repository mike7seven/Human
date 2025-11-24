import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';
import { Card } from '@/components/ui';
import { useCognitiveState } from '@/context/CognitiveStateContext';
import { loadLevelToNumber } from '@/utils/helpers';
import type { LoadLevel } from '@/types';

interface DataPoint {
  time: string;
  load: number;
  loadLabel: LoadLevel;
}

export function EmotionalLoadChart() {
  const { state } = useCognitiveState();
  const [data, setData] = useState<DataPoint[]>([]);

  // Collect data points over time
  useEffect(() => {
    if (state.status) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setData((prev) => {
        const newPoint: DataPoint = {
          time: timeStr,
          load: loadLevelToNumber(state.status!.emotional_load),
          loadLabel: state.status!.emotional_load,
        };

        // Keep last 12 data points (1 hour at 5min intervals)
        const updated = [...prev, newPoint];
        if (updated.length > 12) {
          return updated.slice(-12);
        }
        return updated;
      });
    }
  }, [state.status?.timestamp]);

  const getLoadColor = (load: number) => {
    if (load <= 1) return '#22c55e'; // green
    if (load <= 2) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: DataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-xs text-slate-500">{data.time}</p>
          <p
            className="font-medium capitalize"
            style={{ color: getLoadColor(data.load) }}
          >
            {data.loadLabel}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Emotional Load Over Time
        </h3>
      </div>

      {data.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Collecting data points... Check back in a few minutes.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[1, 2, 3]}
                tickFormatter={(value) => {
                  if (value === 1) return 'Low';
                  if (value === 2) return 'Med';
                  return 'High';
                }}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="load"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2 text-center">
        Updates every 5 seconds. Shows last hour of data.
      </p>
    </Card>
  );
}

export default EmotionalLoadChart;
