'use client';

import { SolutionItem } from '@/types';
import { formatPrice } from '@/lib/searchEngine';
import { ExternalLink, Truck } from 'lucide-react';

interface ProductCardProps {
  item: SolutionItem;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const { role, product } = item;

  return (
    <div 
      className="flex gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--muted)] transition-all fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[var(--card)]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {/* Role Badge */}
        <span className="inline-block px-2 py-0.5 text-xs font-mono bg-[var(--accent)]/10 text-[var(--accent)] rounded mb-1">
          {role}
        </span>

        {/* Product Name */}
        <h4 className="text-sm font-medium text-[var(--foreground)] truncate">
          {product.name}
        </h4>

        {/* Store */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-[var(--muted)]">{product.store}</span>
          <a
            href={product.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Price and Delivery */}
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
            {formatPrice(product.price, product.currency)}
          </span>
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <Truck className="w-3 h-3" />
            <span>{product.deliveryDays}d</span>
          </div>
        </div>
      </div>
    </div>
  );
}
