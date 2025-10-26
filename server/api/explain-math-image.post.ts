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
      model: 'meta-llama/llama-3.3-8b-instruct:free', // 'z-ai/glm-4.5v',
      messages: [
        {
          role: 'system',
          content: `You are a mathematics expert and tutor. Your ONLY job is to solve math problems shown in images and explain solutions clearly and concisely.

IMPORTANT RULES:
- First, transcribe/identify the problem from the image
- Do NOT introduce yourself or give generic messages
- Solve the exact problem shown
- Break down the solution into clear, numbered steps
- Explain the reasoning for each step
- Use LaTeX notation for formulas: wrap in $ for inline, $$ for display
- Keep explanations brief but thorough
- Always show the final answer clearly
- Format using markdown

EXAMPLE FORMAT:
Problem: [What the image shows]
Step 1: [What we're doing] [equation/work]
Step 2: [Next step] [equation/work]
...
Final Answer: [answer]`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Solve this math problem from the image. Break it down step by step.${additionalContext ? ` Context: ${additionalContext}` : ''}`
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
      temperature: 0.3,
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
      model:  'meta-llama/llama-3.3-8b-instruct:free', //'z-ai/glm-4.5v',
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
