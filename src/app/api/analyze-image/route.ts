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
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Use GPT-4 Vision to analyze the image
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this room/space image and provide a brief JSON response with:
1. roomType: The type of room (living room, bedroom, patio, office, etc.)
2. style: The current style (modern, rustic, minimalist, traditional, etc.)
3. lighting: The lighting conditions (natural, artificial, dim, bright)
4. colors: Main color palette (list 2-3 dominant colors)
5. suggestions: 2-3 brief suggestions for improvement

Respond ONLY with valid JSON, no markdown or explanation.`,
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

    const analysisText = visionResponse.choices[0]?.message?.content || '';
    
    // Try to parse as JSON
    let analysisData;
    try {
      // Remove any markdown code blocks if present
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisData = JSON.parse(cleanJson);
    } catch {
      // If parsing fails, return raw text
      analysisData = {
        roomType: 'Living space',
        style: 'Modern',
        analysis: analysisText,
      };
    }

    return NextResponse.json({
      ...analysisData,
      analysis: analysisText,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to analyze image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
