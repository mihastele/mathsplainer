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
      console.log('Image Problem - Explanation received:', response.explanation.substring(0, 100))
      return response
    } catch (err: any) {
      console.error('Image Problem API Error:', err)
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
