'use client';

import { Message } from '@/types';
import ReasoningEngine from './ReasoningEngine';
import { useChatStore } from '@/store/chatStore';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/searchEngine';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { setCartOpen } = useChatStore();

  // Thinking state with reasoning
  if (message.isThinking && message.reasoning) {
    return (
      <div className="flex justify-start mb-4 fade-in">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <span className="text-black text-xs font-bold">O</span>
            </div>
            <span className="text-xs text-[var(--muted)] font-mono">OTTO</span>
          </div>
          <ReasoningEngine steps={message.reasoning} />
        </div>
      </div>
    );
  }

  // Solution message - now shows a summary with option to view cart
  if (message.solution) {
    return (
      <div className="flex justify-start mb-4 slide-up">
        <div className="max-w-[90%] md:max-w-[80%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <span className="text-black text-xs font-bold">O</span>
            </div>
            <span className="text-xs text-[var(--muted)] font-mono">OTTO</span>
          </div>
          
          {/* Solution Summary Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--foreground)] mb-3">{message.content}</p>
            
            {/* Mini product preview */}
            <div className="flex items-center gap-2 mb-4">
              {message.solution.items.slice(0, 4).map((item, i) => (
                <div 
                  key={item.product.id}
                  className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--background)]"
                  style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 4 - i }}
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {message.solution.items.length > 4 && (
                <span className="text-xs text-[var(--muted)] ml-1">
                  +{message.solution.items.length - 4} more
                </span>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">
                {message.solution.items.length} items curated
              </span>
              <span className="font-mono font-semibold text-[var(--accent)]">
                {formatPrice(message.solution.totalPrice)}
              </span>
            </div>

            {/* View Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="w-full mt-4 py-2.5 px-4 rounded-lg bg-[var(--accent)] text-black font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              View Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular message
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 fade-in`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'order-2' : ''}`}>
        {/* Avatar and name */}
        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <span className="text-black text-xs font-bold">O</span>
            </div>
          )}
          <span className="text-xs text-[var(--muted)] font-mono">
            {isUser ? 'You' : 'OTTO'}
          </span>
          {isUser && (
            <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center">
              <span className="text-[var(--foreground)] text-xs font-bold">U</span>
            </div>
          )}
        </div>

        {/* Message content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[var(--foreground)] text-[var(--background)] rounded-tr-sm'
              : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-tl-sm'
          }`}
        >
          {/* Image if present */}
          {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-w-full h-auto max-h-48 object-cover"
              />
            </div>
          )}
          
          {/* Text content */}
          {message.content && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-xs text-[var(--muted)] mt-1 font-mono ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
