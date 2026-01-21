import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient();
    
    const body = await request.json();
    const { image, prompt, products, analysis: existingAnalysis } = body;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Check image size (base64 string length)
    const imageSizeKB = Math.round(image.length / 1024);
    console.log(`Received image size: ${imageSizeKB}KB`);
    
    if (imageSizeKB > 3500) {
      return NextResponse.json(
        { error: 'Image too large. Please use a smaller image (max 3.5MB).' },
        { status: 413 }
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

    let analysisText = existingAnalysis;

    // Only analyze if we don't have existing analysis
    if (!analysisText) {
      // Use GPT-4 Vision to analyze the image and generate a detailed description
      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this room image briefly and describe:
1. Room type and approximate size
2. Current style and color scheme
3. Lighting conditions
Then provide a concise prompt (max 200 words) for generating an image that shows this room redesigned with these products: ${productDetails}`,
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
        max_tokens: 500,
      });

      analysisText = visionResponse.choices[0]?.message?.content || '';
    }

    // Generate the new image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional interior design photography.
${analysisText}
${enhancedPrompt}
Style: Photorealistic, high-end interior design magazine quality, natural lighting.
Technical: High quality, proper perspective, realistic shadows.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('content_policy')) {
      return NextResponse.json(
        { error: 'The image could not be processed due to content policy. Please try a different image.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
