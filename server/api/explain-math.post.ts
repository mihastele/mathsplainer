import axios from 'axios'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { problem, apiKey } = body

  if (!problem) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Problem text is required'
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
          content: `You are an expert mathematics tutor. When explaining mathematical problems:
1. Break down the problem into clear, sequential steps
2. Explain the reasoning behind each step
3. Use LaTeX notation for mathematical formulas (wrap in $$ for display mode or $ for inline)
4. Be thorough but clear and concise
5. Always provide the final answer
6. Format your response using markdown with proper LaTeX support`
        },
        {
          role: 'user',
          content: problem
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
