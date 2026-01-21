import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, prompt, products } = body;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Build enhanced prompt with product details
    const productDetails = products
      ?.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`)
      .join('. ') || '';

    const enhancedPrompt = `${prompt}

Products to incorporate: ${productDetails}

Important: Create a photorealistic result that looks like a professional interior design photo. 
The furniture should be naturally integrated into the space with proper scale, lighting, and shadows.`;

    // Use GPT-4 Vision to analyze the image and generate a detailed description
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this room image and describe:
1. The room type and dimensions
2. Current furniture and layout
3. Lighting conditions
4. Color scheme
5. Architectural features

Then, describe how to best integrate these products into the space: ${productDetails}

Provide a detailed prompt for generating a new image that shows this room with the new furniture naturally integrated.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysisText = visionResponse.choices[0]?.message?.content || '';

    // Generate the new image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional interior design photography of a modern living room.

Based on this analysis: ${analysisText}

${enhancedPrompt}

Style: Photorealistic, high-end interior design magazine quality, natural lighting, Japandi aesthetic.
Technical: 4K quality, proper perspective, realistic shadows and reflections.`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
      throw new Error('No image generated');
    }

    return NextResponse.json({
      imageUrl: generatedImageUrl,
      analysis: analysisText,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
