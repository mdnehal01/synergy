import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { message: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('Making request to Gemini API with prompt:', prompt.substring(0, 100) + '...')

    // Using Gemini Pro model via REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful writing assistant for Synergie. Generate high-quality, well-structured content based on the user's prompt. 

When rephrasing text:
- Use different vocabulary while maintaining the exact same meaning
- Vary sentence structure and length for better flow
- Keep the same tone and style as the original
- Ensure clarity and readability
- Preserve all key information and context
- Return only the rephrased text without additional commentary

When summarizing text:
- Extract the main points and key information
- Keep it concise but comprehensive
- Maintain the original meaning and context
 - Return only the summary, do not include the original text

When generating more content:
- Expand naturally on the given text
- Add relevant details, examples, or explanations
- Maintain consistency with the original tone and style
 - Return only the new additional content, do not repeat the original text
 - The new content should flow naturally after the original text

 IMPORTANT: Never repeat or include the original text in your response. Only provide the new content as requested.
User request: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      
      let errorMessage = 'Failed to generate content from Gemini'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // If we can't parse the error, use the default message
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Gemini API response data:', JSON.stringify(data, null, 2))

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      console.error('No content generated from Gemini API')
      return NextResponse.json(
        { message: 'No content generated' },
        { status: 500 }
      )
    }

    console.log('Generated content:', content.substring(0, 100) + '...')

    return NextResponse.json({ content: content.trim() })
  } catch (error) {
    console.error('AI generation error:', error)
    
    // Provide more specific error information
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error details:', error.stack)
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}