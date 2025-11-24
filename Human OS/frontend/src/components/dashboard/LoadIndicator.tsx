import { cn, loadLevelToNumber } from '@/utils/helpers';
import type { LoadLevel } from '@/types';

interface LoadIndicatorProps {
  level: LoadLevel;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LoadIndicator({
  level,
  label,
  size = 'md',
  showLabel = true,
}: LoadIndicatorProps) {
  const numericLevel = loadLevelToNumber(level);

  const sizes = {
    sm: { bar: 'h-2', text: 'text-xs', gap: 'gap-0.5' },
    md: { bar: 'h-3', text: 'text-sm', gap: 'gap-1' },
    lg: { bar: 'h-4', text: 'text-base', gap: 'gap-1.5' },
  };

  const colors = {
    low: 'bg-green-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };

  return (
    <div className="flex flex-col items-center">
      {label && showLabel && (
        <span className={cn('text-slate-500 mb-1', sizes[size].text)}>{label}</span>
      )}

      {/* Bar indicator */}
      <div className={cn('flex w-full max-w-[80px]', sizes[size].gap)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-full transition-all',
              sizes[size].bar,
              i <= numericLevel ? colors[level] : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Text label */}
      <span
        className={cn(
          'capitalize font-medium mt-1',
          sizes[size].text,
          level === 'low' && 'text-green-600',
          level === 'medium' && 'text-amber-600',
          level === 'high' && 'text-red-600'
        )}
      >
        {level}
      </span>
    </div>
  );
}

export default LoadIndicator;
