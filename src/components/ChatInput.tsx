'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Camera, Send, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage, getDataUrlSizeKB } from '@/lib/imageUtils';

interface ChatInputProps {
  onSubmit: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((message.trim() || imagePreview) && !isCompressing) {
      onSubmit(message.trim() || 'Analyze this image and suggest products', imagePreview || undefined);
      setMessage('');
      setImagePreview(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const originalDataUrl = reader.result as string;
          const originalSize = getDataUrlSizeKB(originalDataUrl);
          
          // Compress if larger than 300KB to stay well under Vercel's limit
          let finalDataUrl = originalDataUrl;
          if (originalSize > 300) {
            console.log(`Compressing image from ${originalSize}KB...`);
            // Use aggressive compression for large images
            const quality = originalSize > 2000 ? 0.5 : originalSize > 1000 ? 0.6 : 0.7;
            const maxDimension = originalSize > 2000 ? 800 : 1024;
            finalDataUrl = await compressImage(originalDataUrl, maxDimension, maxDimension, quality);
          }
          
          setImagePreview(finalDataUrl);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fall back to original if compression fails
          setImagePreview(reader.result as string);
        } finally {
          setIsCompressing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Image Preview */}
      {(imagePreview || isCompressing) && (
        <div className="mb-3 relative inline-block">
          <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)]">
            {isCompressing ? (
              <div className="h-24 w-32 flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto mb-1" />
                  <span className="text-xs text-[var(--muted)]">Optimizing...</span>
                </div>
              </div>
            ) : imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-auto object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-[var(--muted)] font-mono">
            <ImageIcon className="w-3 h-3" />
            <span>{isCompressing ? 'Processing...' : 'Image attached'}</span>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-center gap-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] focus-within:border-[var(--accent)] transition-colors">
        {/* Camera Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer ${
            disabled || isCompressing ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Camera className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
        </label>

        {/* Text Input */}
        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell OTTO what to fetch..."
            disabled={disabled || isCompressing}
            className="w-full bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] outline-none text-sm"
          />
          {!message && !imagePreview && !isCompressing && (
            <span className="w-2 h-5 bg-[var(--accent)] cursor-blink ml-0.5" />
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || isCompressing || (!message.trim() && !imagePreview)}
          className={`p-2 rounded-lg transition-all ${
            (message.trim() || imagePreview) && !isCompressing
              ? 'bg-[var(--accent)] text-black hover:opacity-90'
              : 'bg-[var(--card-hover)] text-[var(--muted)]'
          } ${disabled || isCompressing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-[var(--muted)] text-center font-mono">
        Try: &quot;Fix my living room&quot; or &quot;I need a casual weekend outfit&quot;
      </p>
    </div>
  );
}
