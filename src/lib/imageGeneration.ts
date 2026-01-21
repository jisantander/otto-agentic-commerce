import { Product } from '@/types';

interface GenerateImageParams {
  originalImageBase64: string;
  products: Product[];
  roomType: string;
}

export async function generateRoomVisualization({
  originalImageBase64,
  products,
  roomType,
}: GenerateImageParams): Promise<string> {
  // Build a detailed prompt based on the products
  const productDescriptions = products
    .map(p => `${p.name} (${p.store})`)
    .join(', ');

  const prompt = `Transform this ${roomType} photo into a professionally styled interior design visualization. 
Add these furniture items naturally into the space: ${productDescriptions}. 
Maintain the room's original architecture and lighting. 
Create a cohesive, modern Japandi aesthetic with clean lines and natural materials. 
The result should look like a high-end interior design magazine photo.
Keep the same camera angle and perspective as the original image.`;

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: originalImageBase64,
        prompt,
        products: products.map(p => ({
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export function buildVisualizationPrompt(products: Product[], context: string): string {
  const items = products.map(p => {
    const style = p.tags.join(', ');
    return `- ${p.name}: ${p.description} (style: ${style})`;
  }).join('\n');

  return `Create a photorealistic interior design visualization of a ${context}.

The room should feature these items:
${items}

Style guidelines:
- Modern Japandi aesthetic
- Clean, minimalist composition
- Natural lighting from windows
- Neutral color palette with warm wood tones
- Professional interior photography quality
- 4K resolution, magazine-worthy composition`;
}
