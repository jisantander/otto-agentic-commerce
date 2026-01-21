'use client';

import { Solution } from '@/types';
import { formatPrice } from '@/lib/searchEngine';
import ProductCard from './ProductCard';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SolutionWidgetProps {
  solution: Solution;
}

export default function SolutionWidget({ solution }: SolutionWidgetProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    // Simulate order execution
    setTimeout(() => {
      setIsExecuting(false);
      setIsExecuted(true);
    }, 2000);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden scale-in">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-[var(--foreground)]">{solution.title}</h3>
        </div>
        <p className="text-sm text-[var(--muted)]">{solution.description}</p>
      </div>

      {/* Products List */}
      <div className="p-4 space-y-3">
        {solution.items.map((item, index) => (
          <ProductCard key={item.product.id} item={item} index={index} />
        ))}
      </div>

      {/* Footer with Total and Execute Button */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
        {/* Summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-[var(--muted)]">Total ({solution.items.length} items)</span>
            <p className="font-mono text-lg font-bold text-[var(--foreground)]">
              {formatPrice(solution.totalPrice, solution.currency)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[var(--muted)]">Est. delivery</span>
            <p className="text-sm text-[var(--foreground)]">
              {Math.max(...solution.items.map(i => i.product.deliveryDays))} days
            </p>
          </div>
        </div>

        {/* Execute Button */}
        {!isExecuted ? (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`w-full py-4 px-6 rounded-xl font-mono font-semibold text-sm transition-all ${
              isExecuting
                ? 'bg-[var(--border)] text-[var(--muted)] cursor-wait'
                : 'bg-[var(--accent)] text-black hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                PROCESSING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                [ EXECUTE ORDER - {formatPrice(solution.totalPrice, solution.currency)} ]
              </span>
            )}
          </button>
        ) : (
          <div className="w-full py-4 px-6 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-center">
            <span className="font-mono text-sm text-[var(--accent)]">
              ✓ ORDER CONFIRMED - Check your email for details
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
