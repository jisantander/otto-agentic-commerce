'use client';

import { useChatStore } from '@/store/chatStore';
import { formatPrice } from '@/lib/searchEngine';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Sparkles, 
  ImageIcon, 
  Loader2,
  ChevronRight,
  Package,
  Truck,
  Check,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CartSidebar() {
  const { 
    cart, 
    isCartOpen, 
    setCartOpen, 
    removeFromCart, 
    clearCart,
    originalImage,
    generatedImage,
    isGeneratingImage,
    setIsGeneratingImage,
    setGeneratedImage,
    imageAnalysis,
  } = useChatStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'preview'>('cart');

  // Auto-switch to preview tab when image is generated
  useEffect(() => {
    if (generatedImage && !isGeneratingImage) {
      setActiveTab('preview');
    }
  }, [generatedImage, isGeneratingImage]);

  // Auto-switch to preview tab when generating starts
  useEffect(() => {
    if (isGeneratingImage) {
      setActiveTab('preview');
    }
  }, [isGeneratingImage]);

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const maxDelivery = cart.length > 0 
    ? Math.max(...cart.map(item => item.product.deliveryDays))
    : 0;

  const handleGeneratePreview = async () => {
    if (!originalImage || cart.length === 0) return;
    
    setIsGeneratingImage(true);
    setActiveTab('preview');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: originalImage,
          prompt: `Transform this room with the selected furniture items. Create a photorealistic interior design visualization.`,
          products: cart.map(item => ({
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleExecuteOrder = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsExecuted(true);
    }, 2000);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-lg">Your Selection</h2>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono bg-[var(--accent)]/10 text-[var(--accent)] rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - always show when there's an original image or generated image */}
        {(originalImage || generatedImage || isGeneratingImage) && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cart'
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Items
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'preview'
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              AI Preview
              {(isGeneratingImage || generatedImage) && activeTab !== 'preview' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'cart' ? (
          // Cart Items
          <div className="p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)]">Your cart is empty</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Ask OTTO for recommendations to get started
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--card)] flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 text-xs font-mono bg-[var(--accent)]/10 text-[var(--accent)] rounded mb-1">
                      {item.role}
                    </span>
                    <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-xs text-[var(--muted)]">{item.product.store}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-sm font-semibold">
                        {formatPrice(item.product.price)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // AI Preview Tab
          <div className="p-4">
            {isGeneratingImage ? (
              <div className="space-y-4">
                {/* Show original image while generating */}
                {originalImage && (
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                    <img
                      src={originalImage}
                      alt="Your space"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                      <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
                      <p className="text-sm text-white font-mono">Generating AI visualization...</p>
                      <p className="text-xs text-white/70 mt-2">Analyzing your space and placing products</p>
                      <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Processing steps indicator */}
                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-[var(--accent)]" />
                    <span className="text-sm font-medium">AI is working on your preview</span>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--muted)] font-mono">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-[var(--accent)]" />
                      <span>Analyzing room geometry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-[var(--accent)]" />
                      <span>Detecting lighting conditions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 text-[var(--accent)] animate-spin" />
                      <span>Rendering products in your space...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                {/* Generated Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden border border-[var(--accent)]/50 shadow-lg shadow-[var(--accent)]/10">
                  <img
                    src={generatedImage}
                    alt="AI Generated Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                    <span className="text-xs font-mono text-[var(--accent)]">AI GENERATED</span>
                  </div>
                </div>
                
                <p className="text-sm text-[var(--muted)] text-center">
                  This is how your space could look with the selected items
                </p>
                
                {/* Regenerate button */}
                <button
                  onClick={handleGeneratePreview}
                  className="w-full py-2 px-4 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--background)] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Preview
                </button>

                {/* Before/After comparison */}
                {originalImage && (
                  <div className="mt-4">
                    <p className="text-xs text-[var(--muted)] mb-3 font-mono text-center">COMPARISON</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-2 font-mono">BEFORE</p>
                        <div className="aspect-square rounded-lg overflow-hidden border border-[var(--border)]">
                          <img
                            src={originalImage}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-2 font-mono">AFTER</p>
                        <div className="aspect-square rounded-lg overflow-hidden border border-[var(--accent)]/50">
                          <img
                            src={generatedImage}
                            alt="Generated"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Analysis Info */}
                {imageAnalysis && (
                  <div className="mt-4 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-xs font-mono text-[var(--accent)]">AI ANALYSIS</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-3">
                      {typeof imageAnalysis === 'string' 
                        ? imageAnalysis.substring(0, 200) + (imageAnalysis.length > 200 ? '...' : '')
                        : 'Space analyzed successfully'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // No image yet - prompt to upload
              <div className="aspect-square rounded-xl bg-[var(--background)] border border-[var(--border)] border-dashed flex flex-col items-center justify-center p-6 text-center">
                <ImageIcon className="w-12 h-12 text-[var(--muted)] mb-4" />
                <p className="text-[var(--foreground)] font-medium mb-2">
                  See your room transformed
                </p>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Upload a photo of your space and we&apos;ll show you how it looks with the selected products
                </p>
                {originalImage && cart.length > 0 && (
                  <button
                    onClick={handleGeneratePreview}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate Preview
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-[var(--border)] bg-[var(--background)]">
          {/* Summary */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Total ({cart.length} items)</p>
              <p className="font-mono text-xl font-bold">{formatPrice(totalPrice)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Truck className="w-3 h-3" />
                <span>Est. delivery</span>
              </div>
              <p className="text-sm font-medium">{maxDelivery} days</p>
            </div>
          </div>

          {/* Generate Preview Button (if image uploaded but no preview yet) */}
          {originalImage && !generatedImage && !isGeneratingImage && activeTab === 'cart' && (
            <button
              onClick={handleGeneratePreview}
              disabled={isGeneratingImage}
              className="w-full py-3 px-4 rounded-xl border border-[var(--accent)] text-[var(--accent)] font-medium text-sm mb-3 hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Preview in Your Space
            </button>
          )}

          {/* Execute Button */}
          {!isExecuted ? (
            <button
              onClick={handleExecuteOrder}
              disabled={isExecuting}
              className={`w-full py-4 px-6 rounded-xl font-mono font-semibold text-sm transition-all ${
                isExecuting
                  ? 'bg-[var(--border)] text-[var(--muted)] cursor-wait'
                  : 'bg-[var(--accent)] text-black hover:opacity-90 active:scale-[0.98]'
              }`}
            >
              {isExecuting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PROCESSING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  [ EXECUTE ORDER - {formatPrice(totalPrice)} ]
                </span>
              )}
            </button>
          ) : (
            <div className="w-full py-4 px-6 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-center">
              <span className="font-mono text-sm text-[var(--accent)] flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                ORDER CONFIRMED
              </span>
            </div>
          )}

          {/* Clear Cart */}
          <button
            onClick={clearCart}
            className="w-full mt-3 py-2 text-sm text-[var(--muted)] hover:text-red-400 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
