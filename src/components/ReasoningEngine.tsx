'use client';

import { ReasoningStep } from '@/types';
import { useState } from 'react';
import { 
  Eye, 
  Scan, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Loader2 
} from 'lucide-react';

interface ReasoningEngineProps {
  steps: ReasoningStep[];
}

const stepIcons: Record<ReasoningStep['type'], React.ReactNode> = {
  VISION: <Eye className="w-4 h-4" />,
  DETECT: <Scan className="w-4 h-4" />,
  SEARCH: <Search className="w-4 h-4" />,
  OPTIMIZE: <TrendingUp className="w-4 h-4" />,
  DONE: <CheckCircle2 className="w-4 h-4" />,
};

const stepColors: Record<ReasoningStep['type'], string> = {
  VISION: 'text-purple-400',
  DETECT: 'text-blue-400',
  SEARCH: 'text-yellow-400',
  OPTIMIZE: 'text-orange-400',
  DONE: 'text-[var(--accent)]',
};

export default function ReasoningEngine({ steps }: ReasoningEngineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const isComplete = completedSteps === steps.length;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--card-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {!isComplete ? (
            <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
          )}
          <span className="font-mono text-sm">
            {isComplete ? 'Analysis Complete' : 'Thinking...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)] font-mono">
            {completedSteps}/{steps.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
          )}
        </div>
      </button>

      {/* Steps List */}
      {isExpanded && (
        <div className="border-t border-[var(--border)] p-4 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 terminal-line ${
                step.status === 'pending' ? 'opacity-40' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status Indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'active' ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] status-pulse" />
                  </div>
                ) : step.status === 'completed' ? (
                  <div className={`w-5 h-5 flex items-center justify-center ${stepColors[step.type]}`}>
                    {stepIcons[step.type]}
                  </div>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-semibold ${stepColors[step.type]}`}>
                    [{step.type}]
                  </span>
                </div>
                <p className={`text-sm font-mono mt-0.5 ${
                  step.status === 'active' 
                    ? 'text-[var(--foreground)]' 
                    : step.status === 'completed'
                    ? 'text-[var(--muted)]'
                    : 'text-[var(--muted)]'
                }`}>
                  {step.message}
                  {step.status === 'active' && (
                    <span className="inline-block w-1.5 h-4 bg-[var(--accent)] ml-1 cursor-blink align-middle" />
                  )}
                </p>
              </div>

              {/* Checkmark for completed */}
              {step.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--border)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${(completedSteps / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
