<template>
  <div class="home">
    <div class="tabs">
      <button
        v-for="tab in ['text', 'image']"
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        <span v-if="tab === 'text'">📝 Text Problem</span>
        <span v-else>📷 Image Problem</span>
      </button>
    </div>

    <!-- Text Input Tab -->
    <div v-if="activeTab === 'text'" class="tab-content">
      <div class="input-section">
        <h2>Enter Your Math Problem</h2>
        <textarea
          v-model="problemText"
          placeholder="Example: Solve for x: 2x + 5 = 13&#10;&#10;Or ask: How do I integrate sin(x)cos(x)?"
          class="textarea"
          @keyup.ctrl.enter="handleTextProblem"
        />

        <div class="api-key-section">
          <label>
            <input v-model="useOwnKey" type="checkbox" class="checkbox" />
            Use my own OpenRouter API Key
          </label>
          <input
            v-if="useOwnKey"
            v-model="customApiKey"
            type="password"
            placeholder="sk-or-..."
            class="api-key-input"
          />
          <p class="help-text">
            Don't have an API key? Get one at
            <a href="https://openrouter.ai" target="_blank">openrouter.ai</a>
          </p>
        </div>

        <button
          :disabled="!problemText || loading"
          class="submit-btn"
          @click="handleTextProblem"
        >
          <span v-if="!loading">✨ Explain Problem</span>
          <span v-else>⏳ Processing...</span>
        </button>
      </div>
    </div>

    <!-- Image Input Tab -->
    <div v-if="activeTab === 'image'" class="tab-content">
      <div class="input-section">
        <h2>Upload a Math Problem Image</h2>

        <div class="image-upload">
          <input
            id="file-input"
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            class="file-input"
          />
          <label
            for="file-input"
            class="upload-label"
            @dragover.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleImageDrop"
          >
            <div class="upload-area" :class="{ dragging: isDragging }">
              <span v-if="!selectedImage" class="upload-icon">📸</span>
              <img v-else :src="selectedImage" :alt="selectedImageName" class="preview-img" />
              <p v-if="!selectedImage">{{ isDragging ? '📥 Drop your image here' : 'Click to upload or drag an image' }}</p>
              <p v-else class="image-name">{{ selectedImageName }}</p>
            </div>
          </label>
        </div>

        <textarea
          v-model="additionalContext"
          placeholder="(Optional) Add any additional context or hints about the problem..."
          class="textarea small"
        />

        <div class="api-key-section">
          <label>
            <input v-model="useOwnKeyImage" type="checkbox" class="checkbox" />
            Use my own OpenRouter API Key
          </label>
          <input
            v-if="useOwnKeyImage"
            v-model="customApiKeyImage"
            type="password"
            placeholder="sk-or-..."
            class="api-key-input"
          />
        </div>

        <button
          :disabled="!selectedImage || loading"
          class="submit-btn"
          @click="handleImageProblem"
        >
          <span v-if="!loading">✨ Analyze Image</span>
          <span v-else>⏳ Processing...</span>
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <span class="close" @click="error = ''">×</span>
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Explanation Display -->
    <div v-if="explanation" class="explanation-section">
      <h2>Solution</h2>
      <MathDisplay :content="explanation" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMathExplainer } from '../composables/useMathExplainer'

const activeTab = ref<'text' | 'image'>('text')
const problemText = ref('')
const selectedImage = ref('')
const selectedImageName = ref('')
const additionalContext = ref('')
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const useOwnKey = ref(false)
const customApiKey = ref('')
const useOwnKeyImage = ref(false)
const customApiKeyImage = ref('')

const { explanation, loading, error, explainProblem, explainFromImage } = useMathExplainer()

// Watch explanation for debugging
watch(explanation, (newVal) => {
  console.log('Explanation watched, new value:', newVal ? newVal.substring(0, 50) : 'empty')
})

const handleTextProblem = async () => {
  if (!problemText.value) return

  error.value = ''
  try {
    console.log('Sending problem:', problemText.value)
    await explainProblem(problemText.value, useOwnKey.value ? customApiKey.value : undefined)
    console.log('Explanation state after response:', explanation.value ? explanation.value.substring(0, 50) : 'empty')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to get explanation. Check your API key.'
    console.error('Error:', err)
  }
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  processImageFile(file)
}

const handleImageDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    error.value = 'Please drop an image file'
    return
  }

  processImageFile(file)
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const processImageFile = (file: File) => {
  selectedImageName.value = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
  }
  reader.onerror = () => {
    error.value = 'Failed to read image file'
  }
  reader.readAsDataURL(file)
}

const handleImageProblem = async () => {
  if (!selectedImage.value) return

  error.value = ''
  try {
    await explainFromImage(
      selectedImage.value,
      useOwnKeyImage.value ? customApiKeyImage.value : undefined,
      additionalContext.value
    )
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to analyze image. Check your API key.'
    console.error('Error:', err)
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-btn:hover:not(.active) {
  color: #4b5563;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea.small {
  min-height: 80px;
}

.api-key-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.checkbox {
  margin-right: 0.5rem;
  cursor: pointer;
}

.api-key-input {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: monospace;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.help-text a {
  color: #3b82f6;
  text-decoration: none;
}

.help-text a:hover {
  text-decoration: underline;
}

.image-upload {
  margin: 1.5rem 0;
}

.file-input {
  display: none;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-area {
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #f0f9ff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
}

.upload-area.dragging {
  background: #bfdbfe;
  border-color: #0284c7;
  border-width: 3px;
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.preview-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.image-name {
  color: #059669;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.6);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  position: relative;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
}

.explanation-section {
  animation: slideDown 0.3s ease;
}

.explanation-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

@media (max-width: 640px) {
  .input-section {
    padding: 1.5rem;
  }

  .textarea {
    min-height: 120px;
  }

  .submit-btn {
    font-size: 1rem;
  }
}
</style>
