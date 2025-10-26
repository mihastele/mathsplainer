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
      return response
    } catch (err: any) {
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
      return response
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to get explanation'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    explanation: readonly(explanation),
    loading: readonly(loading),
    error,
    explainProblem,
    explainFromImage
  }
}
