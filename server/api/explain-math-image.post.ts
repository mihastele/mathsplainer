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

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'z-ai/glm-4.5v',
      messages: [
        {
          role: 'system',
          content: `You are an expert mathematics tutor. When explaining mathematical problems from images:
1. First, identify and transcribe the mathematical problem from the image
2. Break down the problem into clear, sequential steps
3. Explain the reasoning behind each step
4. Use LaTeX notation for mathematical formulas (wrap in $$ for display mode or $ for inline)
5. Be thorough but clear and concise
6. Always provide the final answer
7. Format your response using markdown with proper LaTeX support`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this mathematical problem from the image and explain how to solve it step by step.${additionalContext ? ` Additional context: ${additionalContext}` : ''}`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.replace(/^data:image\/[^;]+;base64,/, '')
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'MathSplainer'
      }
    })

    return {
      explanation: response.data.choices[0].message.content,
      model: 'z-ai/glm-4.5v',
      usage: response.data.usage
    }
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.response?.data || error.message)
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?.data?.error?.message || 'Failed to get explanation from OpenRouter',
      data: error.response?.data
    })
  }
})
