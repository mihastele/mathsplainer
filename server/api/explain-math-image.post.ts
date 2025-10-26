import axios from 'axios'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { imageBase64, apiKey, additionalContext } = body

  if (!imageBase64) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image data is required'
    })
  }

  const config = useRuntimeConfig()
  const key = apiKey || config.openrouterApiKey

  if (!key) {
    throw createError({
      statusCode: 401,
      statusMessage: 'OpenRouter API key is required. Please provide one or configure it on the server.'
    })
  }

  // Extract media type and base64 data
  const mediaTypeMatch = imageBase64.match(/^data:image\/([^;]+);base64,/)
  const mediaType = mediaTypeMatch ? `image/${mediaTypeMatch[1]}` : 'image/jpeg'
  const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '')

  console.log('Image Processing Debug:', {
    hasImageData: !!imageBase64,
    mediaType,
    base64DataLength: base64Data.length,
    base64DataPrefix: base64Data.substring(0, 50),
    additionalContext: additionalContext || 'none'
  })

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'z-ai/glm-4.5v',
      messages: [
        {
          role: 'system',
          content: `You are a mathematics expert and tutor. Your PRIMARY task is to ANALYZE and SOLVE the specific math problem shown in the PROVIDED IMAGE.

CRITICAL INSTRUCTIONS:
1. FIRST: Look at the image and describe what math problem you see
2. EXTRACT the exact equations/problems from the image - DO NOT guess or make up problems
3. Solve ONLY the problem shown in the image, not generic problems
4. Break down the solution into clear, numbered steps
5. Explain the reasoning for each step clearly
6. Use LaTeX notation for formulas: wrap in $ for inline math, $$ for display math
7. Always show the final answer clearly
8. If the image is unclear, ask for clarification rather than guessing
9. Format your response using markdown

OUTPUT FORMAT:
**Problem from Image:** [Clearly state what you see in the image]
**Solution:**
Step 1: [What we're doing] [equation/work]
Step 2: [Next step] [equation/work]
...
**Final Answer:** [answer]

REMEMBER: You MUST analyze the provided image. Do not ignore it or provide generic solutions.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze and solve the math problem shown in this image. Be very specific about what you see in the image.${additionalContext ? ` Additional context: ${additionalContext}` : ''}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'MathSplainer'
      }
    })

    console.log('OpenRouter API Response:', {
      model: response.data.model,
      tokensUsed: response.data.usage?.total_tokens,
      contentLength: response.data.choices[0].message.content.length
    })

    return {
      explanation: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage
    }
  } catch (error: any) {
    console.error('OpenRouter API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error?.message,
      fullError: error.response?.data
    })
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?.data?.error?.message || 'Failed to get explanation from OpenRouter',
      data: error.response?.data
    })
  }
})
