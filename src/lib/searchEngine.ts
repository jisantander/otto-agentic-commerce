import { Product, Solution, SolutionItem, ReasoningStep } from '@/types';
import { mockProducts, solutionTemplates, SolutionTemplateKey } from './mockData';

// Keywords mapping to solution templates
const keywordToTemplate: Record<string, SolutionTemplateKey> = {
  // Living room related
  'living': 'livingRoom',
  'sala': 'livingRoom',
  'sofá': 'livingRoom',
  'sofa': 'livingRoom',
  'room': 'livingRoom',
  'habitación': 'livingRoom',
  'decorar': 'livingRoom',
  'japandi': 'livingRoom',
  'minimalista': 'livingRoom',
  
  // Casual outfit related
  'casual': 'casualOutfit',
  'weekend': 'casualOutfit',
  'fin de semana': 'casualOutfit',
  'outfit': 'casualOutfit',
  'look': 'casualOutfit',
  'ropa': 'casualOutfit',
  'vestir': 'casualOutfit',
  
  // Office style related
  'office': 'officeStyle',
  'oficina': 'officeStyle',
  'trabajo': 'officeStyle',
  'formal': 'officeStyle',
  'profesional': 'officeStyle',
  'reunión': 'officeStyle',
  'meeting': 'officeStyle',
  
  // Home improvement related
  'diy': 'homeImprovement',
  'arreglar': 'homeImprovement',
  'reparar': 'homeImprovement',
  'pintar': 'homeImprovement',
  'herramienta': 'homeImprovement',
  'tool': 'homeImprovement',
  'mejora': 'homeImprovement',
  'proyecto': 'homeImprovement',
};

// Style detection keywords
const styleKeywords = {
  japandi: ['japandi', 'japonés', 'minimalista', 'zen', 'natural', 'madera'],
  modern: ['moderno', 'contemporáneo', 'actual', 'trendy'],
  classic: ['clásico', 'tradicional', 'elegante', 'atemporal'],
  industrial: ['industrial', 'loft', 'metal', 'urbano'],
  bohemian: ['boho', 'bohemio', 'ecléctico', 'colorido'],
};

export function detectStyle(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return style.charAt(0).toUpperCase() + style.slice(1);
    }
  }
  
  return 'Japandi'; // Default style
}

export function findMatchingTemplate(query: string): SolutionTemplateKey {
  const lowerQuery = query.toLowerCase();
  
  for (const [keyword, template] of Object.entries(keywordToTemplate)) {
    if (lowerQuery.includes(keyword)) {
      return template;
    }
  }
  
  // Default to living room for image uploads or unrecognized queries
  return 'livingRoom';
}

export function searchProducts(query: string, category?: 'home' | 'fashion'): Product[] {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);
  
  return mockProducts.filter(product => {
    // Filter by category if specified
    if (category && product.category !== category) {
      return false;
    }
    
    // Check if any word matches product name, description, or tags
    return words.some(word => 
      product.name.toLowerCase().includes(word) ||
      product.description.toLowerCase().includes(word) ||
      product.tags.some(tag => tag.includes(word))
    );
  });
}

export function generateSolution(query: string): Solution {
  const templateKey = findMatchingTemplate(query);
  const template = solutionTemplates[templateKey];
  
  const items: SolutionItem[] = template.productIds.map((productId, index) => {
    const product = mockProducts.find(p => p.id === productId)!;
    return {
      role: template.roles[index],
      product,
    };
  });
  
  const totalPrice = items.reduce((sum, item) => sum + item.product.price, 0);
  
  return {
    id: `solution-${Date.now()}`,
    title: template.title,
    description: template.description,
    items,
    totalPrice,
    currency: 'CLP',
  };
}

export function generateReasoningSteps(query: string, hasImage: boolean): ReasoningStep[] {
  const style = detectStyle(query);
  const templateKey = findMatchingTemplate(query);
  const template = solutionTemplates[templateKey];
  
  // Get unique stores from the solution
  const productIds = template.productIds;
  const products = productIds.map(id => mockProducts.find(p => p.id === id)!);
  const stores = Array.from(new Set(products.map(p => p.store)));
  
  const steps: ReasoningStep[] = [
    {
      id: 'step-1',
      type: 'VISION',
      message: hasImage 
        ? 'Scanning image composition and room geometry...'
        : 'Analyzing request parameters...',
      status: 'pending',
    },
    {
      id: 'step-2',
      type: 'DETECT',
      message: `Identifying style preference: ${style}...`,
      status: 'pending',
    },
    {
      id: 'step-3',
      type: 'SEARCH',
      message: `Scraping inventory: ${stores.join(', ')}...`,
      status: 'pending',
    },
    {
      id: 'step-4',
      type: 'OPTIMIZE',
      message: 'Comparing prices and delivery times...',
      status: 'pending',
    },
    {
      id: 'step-5',
      type: 'DONE',
      message: 'Solution generated.',
      status: 'pending',
    },
  ];
  
  return steps;
}

export function formatPrice(price: number, currency: string = 'CLP'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
