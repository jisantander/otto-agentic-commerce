// Types for OTTO - Agentic Commerce Interface

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  store: string;
  storeUrl: string;
  imageUrl: string;
  category: 'home' | 'fashion';
  tags: string[];
  deliveryDays: number;
}

export interface SolutionItem {
  role: string; // e.g., "Main Sofa", "Accent Lamp"
  product: Product;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  items: SolutionItem[];
  totalPrice: number;
  currency: string;
}

export interface ReasoningStep {
  id: string;
  type: 'VISION' | 'DETECT' | 'SEARCH' | 'OPTIMIZE' | 'DONE';
  message: string;
  status: 'pending' | 'active' | 'completed';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  solution?: Solution;
  reasoning?: ReasoningStep[];
  isThinking?: boolean;
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  currentReasoning: ReasoningStep[];
}
