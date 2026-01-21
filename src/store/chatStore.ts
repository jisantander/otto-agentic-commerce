import { create } from 'zustand';
import { Message, ReasoningStep, Solution, Product } from '@/types';
import { generateSolution, generateReasoningSteps } from '@/lib/searchEngine';

interface CartItem {
  product: Product;
  role: string;
  quantity: number;
}

interface ChatStore {
  // Chat state
  messages: Message[];
  isProcessing: boolean;
  currentReasoning: ReasoningStep[];
  
  // Cart state
  cart: CartItem[];
  isCartOpen: boolean;
  
  // AI Image state
  originalImage: string | null;
  generatedImage: string | null;
  isGeneratingImage: boolean;
  
  // Current solution being built
  currentSolution: Solution | null;
  
  // Actions
  addUserMessage: (content: string, imageUrl?: string) => void;
  startProcessing: (query: string, hasImage: boolean) => void;
  updateReasoningStep: (stepId: string, status: 'active' | 'completed') => void;
  completeProcessing: (solution: Solution) => void;
  clearChat: () => void;
  
  // Cart actions
  addToCart: (product: Product, role: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Image actions
  setOriginalImage: (imageUrl: string | null) => void;
  setGeneratedImage: (imageUrl: string | null) => void;
  setIsGeneratingImage: (isGenerating: boolean) => void;
  
  // Solution actions
  setCurrentSolution: (solution: Solution | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  messages: [],
  isProcessing: false,
  currentReasoning: [],
  cart: [],
  isCartOpen: false,
  originalImage: null,
  generatedImage: null,
  isGeneratingImage: false,
  currentSolution: null,
  
  addUserMessage: (content: string, imageUrl?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl,
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
      originalImage: imageUrl || state.originalImage,
    }));
  },
  
  startProcessing: (query: string, hasImage: boolean) => {
    const reasoningSteps = generateReasoningSteps(query, hasImage);
    
    const thinkingMessage: Message = {
      id: `msg-thinking-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
      reasoning: reasoningSteps,
    };
    
    set((state) => ({
      isProcessing: true,
      currentReasoning: reasoningSteps,
      messages: [...state.messages, thinkingMessage],
      isCartOpen: true, // Open cart when processing starts
    }));
  },
  
  updateReasoningStep: (stepId: string, status: 'active' | 'completed') => {
    set((state) => ({
      currentReasoning: state.currentReasoning.map((step) =>
        step.id === stepId ? { ...step, status } : step
      ),
      messages: state.messages.map((msg) => {
        if (msg.isThinking && msg.reasoning) {
          return {
            ...msg,
            reasoning: msg.reasoning.map((step) =>
              step.id === stepId ? { ...step, status } : step
            ),
          };
        }
        return msg;
      }),
    }));
  },
  
  completeProcessing: (solution: Solution) => {
    set((state) => {
      const messagesWithoutThinking = state.messages.filter((msg) => !msg.isThinking);
      
      const solutionMessage: Message = {
        id: `msg-solution-${Date.now()}`,
        role: 'assistant',
        content: `I've curated ${solution.items.length} items for your "${solution.title.replace('Project: ', '')}". Check the cart panel to review and customize your selection.`,
        timestamp: new Date(),
        solution,
      };
      
      return {
        isProcessing: false,
        currentReasoning: [],
        messages: [...messagesWithoutThinking, solutionMessage],
        currentSolution: solution,
      };
    });
  },
  
  clearChat: () => {
    set({
      messages: [],
      isProcessing: false,
      currentReasoning: [],
      currentSolution: null,
    });
  },
  
  // Cart actions
  addToCart: (product: Product, role: string) => {
    set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        cart: [...state.cart, { product, role, quantity: 1 }],
        isCartOpen: true,
      };
    });
  },
  
  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter(item => item.product.id !== productId),
    }));
  },
  
  clearCart: () => {
    set({ cart: [], currentSolution: null, generatedImage: null });
  },
  
  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },
  
  setCartOpen: (open: boolean) => {
    set({ isCartOpen: open });
  },
  
  // Image actions
  setOriginalImage: (imageUrl: string | null) => {
    set({ originalImage: imageUrl });
  },
  
  setGeneratedImage: (imageUrl: string | null) => {
    set({ generatedImage: imageUrl });
  },
  
  setIsGeneratingImage: (isGenerating: boolean) => {
    set({ isGeneratingImage: isGenerating });
  },
  
  // Solution actions
  setCurrentSolution: (solution: Solution | null) => {
    set({ currentSolution: solution });
  },
}));

// Async function to simulate the agent processing
export async function processUserRequest(
  query: string,
  hasImage: boolean,
  store: ChatStore
) {
  const { startProcessing, updateReasoningStep, completeProcessing, addToCart } = store;
  
  startProcessing(query, hasImage);
  
  const steps = generateReasoningSteps(query, hasImage);
  
  // Animate through each step
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateReasoningStep(step.id, 'active');
    
    const delay = step.type === 'SEARCH' ? 1200 : step.type === 'OPTIMIZE' ? 800 : 600;
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    updateReasoningStep(step.id, 'completed');
  }
  
  await new Promise((resolve) => setTimeout(resolve, 500));
  const solution = generateSolution(query);
  
  // Add items to cart progressively
  for (const item of solution.items) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    addToCart(item.product, item.role);
  }
  
  completeProcessing(solution);
}
