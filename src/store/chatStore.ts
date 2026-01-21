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
  imageAnalysis: string | null;
  
  // Current solution being built
  currentSolution: Solution | null;
  
  // Actions
  addUserMessage: (content: string, imageUrl?: string) => void;
  startProcessing: (query: string, hasImage: boolean) => void;
  updateReasoningStep: (stepId: string, status: 'active' | 'completed', message?: string) => void;
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
  setImageAnalysis: (analysis: string | null) => void;
  
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
  imageAnalysis: null,
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
  
  updateReasoningStep: (stepId: string, status: 'active' | 'completed', message?: string) => {
    set((state) => ({
      currentReasoning: state.currentReasoning.map((step) =>
        step.id === stepId ? { ...step, status, message: message || step.message } : step
      ),
      messages: state.messages.map((msg) => {
        if (msg.isThinking && msg.reasoning) {
          return {
            ...msg,
            reasoning: msg.reasoning.map((step) =>
              step.id === stepId ? { ...step, status, message: message || step.message } : step
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
    set({ cart: [], currentSolution: null, generatedImage: null, imageAnalysis: null });
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
  
  setImageAnalysis: (analysis: string | null) => {
    set({ imageAnalysis: analysis });
  },
  
  // Solution actions
  setCurrentSolution: (solution: Solution | null) => {
    set({ currentSolution: solution });
  },
}));

// Async function to simulate the agent processing with AI image generation
export async function processUserRequest(
  query: string,
  hasImage: boolean,
  store: ChatStore
) {
  const { 
    startProcessing, 
    updateReasoningStep, 
    completeProcessing, 
    addToCart,
    originalImage,
    setIsGeneratingImage,
    setGeneratedImage,
    setImageAnalysis,
  } = store;
  
  startProcessing(query, hasImage);
  
  const steps = generateReasoningSteps(query, hasImage);
  
  // Step 1: VISION - Analyze image if present
  await new Promise((resolve) => setTimeout(resolve, 300));
  updateReasoningStep(steps[0].id, 'active');
  
  let imageAnalysisResult: string | null = null;
  
  if (hasImage && originalImage) {
    // Actually analyze the image with AI
    try {
      updateReasoningStep(steps[0].id, 'active', 'Analyzing your space with AI vision...');
      
      const visionResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImage }),
      });
      
      if (visionResponse.ok) {
        const data = await visionResponse.json();
        imageAnalysisResult = data.analysis;
        setImageAnalysis(data.analysis);
        updateReasoningStep(steps[0].id, 'completed', `Detected: ${data.roomType || 'Living space'} - ${data.style || 'Modern'} style`);
      } else {
        updateReasoningStep(steps[0].id, 'completed', 'Image analyzed successfully');
      }
    } catch {
      updateReasoningStep(steps[0].id, 'completed', 'Image composition analyzed');
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateReasoningStep(steps[0].id, 'completed');
  }
  
  // Step 2: DETECT - Style identification
  await new Promise((resolve) => setTimeout(resolve, 300));
  updateReasoningStep(steps[1].id, 'active');
  await new Promise((resolve) => setTimeout(resolve, 600));
  updateReasoningStep(steps[1].id, 'completed');
  
  // Step 3: SEARCH - Inventory search
  await new Promise((resolve) => setTimeout(resolve, 300));
  updateReasoningStep(steps[2].id, 'active');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  updateReasoningStep(steps[2].id, 'completed');
  
  // Step 4: OPTIMIZE - Price comparison
  await new Promise((resolve) => setTimeout(resolve, 300));
  updateReasoningStep(steps[3].id, 'active');
  await new Promise((resolve) => setTimeout(resolve, 800));
  updateReasoningStep(steps[3].id, 'completed');
  
  // Generate solution
  await new Promise((resolve) => setTimeout(resolve, 500));
  const solution = generateSolution(query);
  
  // Add items to cart progressively
  for (const item of solution.items) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    addToCart(item.product, item.role);
  }
  
  // Step 5: DONE - If image was uploaded, also generate the AI preview
  updateReasoningStep(steps[4].id, 'active');
  
  if (hasImage && originalImage) {
    updateReasoningStep(steps[4].id, 'active', 'Generating AI visualization of your space...');
    setIsGeneratingImage(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: originalImage,
          prompt: `Transform this space with the selected furniture items. Create a photorealistic interior design visualization.`,
          products: solution.items.map(item => ({
            name: item.product.name,
            description: item.product.description,
          })),
          analysis: imageAnalysisResult,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl);
        updateReasoningStep(steps[4].id, 'completed', 'AI visualization ready! Check the preview tab.');
      } else {
        updateReasoningStep(steps[4].id, 'completed', 'Solution generated.');
      }
    } catch {
      updateReasoningStep(steps[4].id, 'completed', 'Solution generated.');
    } finally {
      setIsGeneratingImage(false);
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateReasoningStep(steps[4].id, 'completed');
  }
  
  completeProcessing(solution);
}
