import { ref, readonly } from 'vue'

export const useMathExplainer = () => {
  const explanation = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  const explainProblem = async (problem: string, apiKey?: string) => {
    loading.value = true
    error.value = ''
    explanation.value = ''

    try {
      const response = await $fetch('/api/explain-math', {
        method: 'POST',
        body: {
          problem,
          apiKey
        }
      })

      explanation.value = response.explanation
      console.log('Text Problem - Explanation received:', response.explanation.substring(0, 100))
      return response
    } catch (err: any) {
      console.error('Text Problem API Error:', err)
      error.value = err.data?.statusMessage || err.message || 'Failed to get explanation'
      throw err
    } finally {
      loading.value = false
    }
  }

  const explainFromImage = async (imageBase64: string, apiKey?: string, additionalContext?: string) => {
    loading.value = true
    error.value = ''
    explanation.value = ''

    console.log('Image API Call - Debug Info:', {
      hasImageData: !!imageBase64,
      imageDataLength: imageBase64?.length,
      imageDataPrefix: imageBase64?.substring(0, 80),
      hasAdditionalContext: !!additionalContext,
      hasApiKey: !!apiKey
    })

    try {
      const response = await $fetch('/api/explain-math-image', {
        method: 'POST',
        body: {
          imageBase64,
          apiKey,
          additionalContext
        }
      })

      explanation.value = response.explanation
      console.log('Image Problem - Explanation received:', {
        model: response.model,
        contentLength: response.explanation?.length,
        tokenCount: response.usage?.total_tokens,
        preview: response.explanation.substring(0, 150)
      })
      return response
    } catch (err: any) {
      console.error('Image Problem API Error:', {
        statusCode: err.response?.status,
        statusMessage: err.data?.statusMessage,
        message: err.message,
        fullError: err
      })
      error.value = err.data?.statusMessage || err.message || 'Failed to get explanation'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    explanation,  // Remove readonly to ensure reactivity
    loading: readonly(loading),
    error,
    explainProblem,
    explainFromImage
  }
}
