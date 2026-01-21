'use client';

import { useEffect, useRef } from 'react';
import { useChatStore, processUserRequest } from '@/store/chatStore';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import CartSidebar from './CartSidebar';
import { Bot, Zap, ShoppingCart } from 'lucide-react';

export default function ChatInterface() {
  const { 
    messages, 
    isProcessing, 
    addUserMessage, 
    cart, 
    isCartOpen, 
    toggleCart,
    setOriginalImage,
  } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const store = useChatStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (content: string, imageUrl?: string) => {
    // Store original image for AI generation
    if (imageUrl) {
      setOriginalImage(imageUrl);
    }
    
    // Add user message
    addUserMessage(content, imageUrl);

    // Process the request
    await processUserRequest(content, !!imageUrl, store);
  };

  const isEmpty = messages.length === 0;
  const cartItemCount = cart.length;

  return (
    <div className="flex h-screen max-h-screen bg-[var(--background)]">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCartOpen ? 'mr-0 sm:mr-[420px]' : ''}`}>
        {/* Header */}
        <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[var(--foreground)]">OTTO</h1>
                <p className="text-xs text-[var(--muted)] font-mono">Agentic Commerce</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] status-pulse" />
                <span className="text-xs font-mono text-[var(--accent)]">AGENT ACTIVE</span>
              </div>
              
              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className={`relative p-2.5 rounded-xl transition-all ${
                  isCartOpen 
                    ? 'bg-[var(--accent)] text-black' 
                    : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--muted)]'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-black text-xs font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {isEmpty ? (
              // Empty State
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mb-6">
                  <Zap className="w-10 h-10 text-[var(--accent)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  What can I fetch for you?
                </h2>
                <p className="text-[var(--muted)] max-w-md mb-8">
                  Upload a photo of your space and I&apos;ll show you exactly how it could look 
                  with new furniture. Or just tell me what you need.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  {[
                    { emoji: '📸', text: 'Upload a room photo', highlight: true },
                    { emoji: '🛋️', text: 'Refresh my living room' },
                    { emoji: '👔', text: 'Office outfit for Monday' },
                    { emoji: '🔧', text: 'DIY weekend project' },
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (suggestion.highlight) {
                          // Trigger file upload
                          document.getElementById('image-upload')?.click();
                        } else {
                          handleSubmit(suggestion.text);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                        suggestion.highlight
                          ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 hover:border-[var(--accent)]'
                          : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted)]'
                      }`}
                    >
                      <span className="text-xl">{suggestion.emoji}</span>
                      <span className={`text-sm transition-colors ${
                        suggestion.highlight 
                          ? 'text-[var(--accent)]' 
                          : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'
                      }`}>
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Feature highlight */}
                <div className="mt-8 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
                        AI-Powered Visualization
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Upload a photo and see exactly how products will look in your space 
                        before you buy. Powered by advanced AI image generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Messages List
              <div className="space-y-2">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input Area */}
        <footer className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ChatInput onSubmit={handleSubmit} disabled={isProcessing} />
          </div>
        </footer>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Overlay for mobile when cart is open */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={toggleCart}
        />
      )}
    </div>
  );
}
