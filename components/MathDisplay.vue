<template>
  <div class="math-display">
    <div v-if="renderedContent" class="content" v-html="renderedContent"></div>
    <div v-else class="empty-state">
      <p>No mathematical explanation yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from 'vue'

interface Props {
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const renderedContent = ref<string>('')

const renderMath = () => {
  // Trigger MathJax rendering after DOM is updated
  if (typeof window !== 'undefined' && (window as any).MathJax) {
    nextTick(() => {
      (window as any).MathJax.typesetPromise?.().catch((err: any) => {
        console.error('MathJax processing error:', err)
      })
    })
  }
}

const sanitizeHtml = (html: string) => {
  // Create a temporary element to use browser's HTML parser
  const tempEl = document.createElement('div')
  tempEl.textContent = html // This escapes HTML
  return tempEl.innerHTML
}

watch(
  () => props.content,
  async (newContent) => {
    console.log('MathDisplay received content:', newContent ? newContent.substring(0, 100) : 'empty')

    if (!newContent) {
      renderedContent.value = ''
      return
    }

    let processed = newContent

    // Remove model-specific box markers
    processed = processed.replace(/<\|begin_of_box\|>/g, '')
    processed = processed.replace(/<\|end_of_box\|>/g, '')
    processed = processed.trim()

    // Convert markdown headings FIRST (before other replacements)
    processed = processed.replace(/^### ([^\n]+)/gm, '<h3>$1</h3>')
    processed = processed.replace(/^## ([^\n]+)/gm, '<h2>$1</h2>')
    processed = processed.replace(/^# ([^\n]+)/gm, '<h1>$1</h1>')

    // Convert markdown bold and italic
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // Convert markdown links to HTML
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // Convert markdown-style LaTeX to proper HTML for MathJax
    // Handle display math ($$...$$ - including multiline)
    processed = processed.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      return '<div class="math-display">' + match + '</div>'
    })

    // Handle inline math ($...$)
    processed = processed.replace(/\$(?!\$)[\s\S]*?(?<!\$)\$/g, (match) => {
      return '<span class="math-inline">' + match + '</span>'
    })

    // Convert line breaks to paragraphs
    // Split by double newlines for paragraph breaks
    const paragraphs = processed.split(/\n\n+/).map(para => {
      // Replace single newlines with <br>
      return '<p>' + para.replace(/\n/g, '<br>') + '</p>'
    })

    processed = paragraphs.join('')

    renderedContent.value = processed

    // Trigger MathJax rendering after DOM update
    renderMath()
  },
  { immediate: true }
)

onMounted(() => {
  if (props.content && renderedContent.value) {
    renderMath()
  }
})
</script>

<style scoped>
.math-display {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  min-height: 100px;
  border-left: 4px solid #3b82f6;
}

.content {
  line-height: 1.8;
  font-size: 1rem;
  color: #1f2937;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin: 1.5rem 0 1rem 0;
  font-weight: 600;
  color: #111827;
}

.content :deep(h1) {
  font-size: 1.875rem;
}

.content :deep(h2) {
  font-size: 1.5rem;
}

.content :deep(h3) {
  font-size: 1.25rem;
}

.content :deep(p) {
  margin: 1rem 0;
}

.content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.content :deep(a:hover) {
  color: #1e40af;
}

.content :deep(.math-display) {
  background: #fafbfc;
  padding: 1.5rem 1rem;
  margin: 1.5rem 0;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #3b82f6;
  overflow-x: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* MathJax container styling */
.content :deep(.math-display mjx-container) {
  font-size: 1.1em;
  margin: 0 auto;
}

.content :deep(.math-inline) {
  padding: 0 0.25rem;
  /* Let MathJax handle the rendering - clean, beautiful math */
}

/* MathJax inline math styling */
.content :deep(p) :deep(mjx-container[display="true"]) {
  display: block;
  text-align: center;
  margin: 1rem 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
  font-style: italic;
}
</style>
