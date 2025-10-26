# Implementation Notes

Technical implementation details for developers.

## Architecture Overview

### Frontend Architecture

```
Vue 3 Single Page Application
├── Pages (Nuxt routing)
│   └── pages/index.vue (Main UI)
├── Components
│   └── MathDisplay.vue (Renders math formulas)
└── Composables
    └── useMathExplainer.ts (API integration)
```

### Backend Architecture

```
Nitro Server Routes
├── POST /api/explain-math (Text problems)
└── POST /api/explain-math-image (Image problems)
```

### Data Flow

1. **User Input** → Vue component
2. **Composable** → Prepare request
3. **HTTP POST** → Nitro server route
4. **Server** → Forward to OpenRouter API
5. **Response** → Parse & return to client
6. **Rendering** → MathDisplay component with MathJax

---

## Key Components

### 1. MathDisplay.vue

**Purpose**: Render mathematical formulas beautifully

**Features**:
- Converts markdown-style LaTeX to MathJax format
- Supports inline ($...$) and display ($$...$$) modes
- Auto-converts markdown (bold, italic, links, headings)
- Integrates with MathJax CDN

**How it works**:
```typescript
// Input: "The solution is $x = 5$"
// Output: HTML with MathJax processed formula
```

**Key Props**:
- `content`: String with markdown/LaTeX content

**Rendering Pipeline**:
1. Detect markdown syntax
2. Replace with HTML
3. Trigger MathJax typesetPromise
4. Display rendered math

### 2. useMathExplainer Composable

**Purpose**: Manage API communication and state

**Functions**:
```typescript
explainProblem(problem, apiKey?)    // Solve text problems
explainFromImage(image, apiKey?, context?)  // Analyze images
```

**State Management**:
- `explanation`: Result content (reactive)
- `loading`: Loading state (readonly)
- `error`: Error messages (readonly)

**Error Handling**:
- Catches network errors
- Provides user-friendly messages
- Returns detailed error info

### 3. API Routes

#### explain-math.post.ts

**Request Structure**:
```typescript
{
  problem: string           // The math problem
  apiKey?: string          // Optional user API key
}
```

**Response Structure**:
```typescript
{
  explanation: string      // Solution with LaTeX
  model: string           // Model used (z-ai/glm-4.5v)
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

**System Prompt**:
```
You are an expert mathematics tutor. When explaining mathematical problems:
1. Break down the problem into clear, sequential steps
2. Explain the reasoning behind each step
3. Use LaTeX notation for mathematical formulas
4. Be thorough but clear and concise
5. Always provide the final answer
6. Format your response using markdown with proper LaTeX support
```

#### explain-math-image.post.ts

**Request Structure**:
```typescript
{
  imageBase64: string      // Base64 encoded image
  apiKey?: string         // Optional user API key
  additionalContext?: string // Extra problem context
}
```

**Image Processing**:
- Accepts base64-encoded images
- Supports JPEG, PNG formats
- Sent as base64 to OpenRouter API
- AI transcribes and explains

**Vision Capability**:
- Uses GLM-4.5V's vision capabilities
- Can recognize handwritten math
- Can read printed problems
- Generates LaTeX explanations

---

## Security Implementation

### API Key Handling

#### Server-Side Key (Option 1)
```
User Request → Server checks env variable → Adds to OpenRouter request
```
✅ Key never exposed to client
✅ Simpler for users
⚠️ Server bears the cost

#### Client-Side Key (Option 2)
```
User pastes key → Sent with request → Server forwards to OpenRouter
```
✅ Users control costs
✅ No server-side secrets
✅ Better for multi-tenant
⚠️ Requires user key management

### Environment Variables

```typescript
// .env.local (never commit!)
NUXT_OPENROUTER_API_KEY=sk-or-xxx

// Accessed server-side
const config = useRuntimeConfig()
const key = config.openrouterApiKey
```

### Request Headers

```typescript
headers: {
  'Authorization': `Bearer ${key}`,
  'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL,
  'X-Title': 'MathSplainer'
}
```

Required by OpenRouter for rate limiting and quota tracking.

---

## Math Formula Rendering

### LaTeX Support

The application uses:
- **MathJax 3** (CDN): Universal math rendering
- **KaTeX CSS** (CDN): Beautiful formula styling

### Markdown to LaTeX Conversion

```typescript
// Input markdown
$$\frac{x^2 + 5x + 6}{x + 2}$$

// Converted to
<div class="math-display">$$\n\frac{x^2 + 5x + 6}{x + 2}\n$$</div>

// Rendered by MathJax
```

### Inline vs Display

```markdown
Inline: $x = 5$ is the solution
Display: $$x = 5$$
```

### Supported Math Notation

- Fractions: `\frac{a}{b}`
- Powers: `x^2`, `e^{i\pi}`
- Subscripts: `x_1`
- Greek: `\alpha`, `\beta`, `\sum`
- Operators: `\int`, `\lim`, `\sqrt`
- Matrices: `\begin{matrix}...\end{matrix}`

---

## API Integration

### OpenRouter Configuration

**Model**: `z-ai/glm-4.5v`
- Advanced mathematical reasoning
- Vision capability for images
- Supports LaTeX output
- Excellent for educational content

**Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Temperature**: `0.7`
- Balances creativity and accuracy
- Good for explanations

**Max Tokens**: `4000`
- Allows detailed step-by-step solutions
- Adjustable based on problem complexity

### Error Handling

```typescript
try {
  const response = await axios.post('https://openrouter.ai/...')
  return response.data
} catch (error) {
  // Handle specific error types
  if (error.response?.status === 401) {
    // Invalid API key
  } else if (error.response?.status === 429) {
    // Rate limited
  } else {
    // Network or other error
  }
  throw createError({ statusCode: 500, ... })
}
```

---

## Performance Considerations

### Frontend

1. **Component Lazy Loading**
   - MathDisplay only renders when needed
   - Components auto-import in Nuxt

2. **CSS Optimization**
   - Scoped styles (no global pollution)
   - Minimal external dependencies

3. **MathJax Caching**
   - Compiled formulas cached automatically
   - Repeated formulas render faster

### Backend

1. **Request Batching**
   - Each request independent
   - No unnecessary retries

2. **Error Resilience**
   - Clear error messages
   - Proper HTTP status codes

3. **Rate Limiting**
   - Handled by OpenRouter
   - User sees meaningful errors

### Network

1. **CDN Assets**
   - MathJax and KaTeX from jsDelivr CDN
   - Cached by browsers

2. **Compression**
   - Nitro automatically gzips responses
   - Minimal JavaScript bundle

---

## Testing Considerations

### Unit Tests (Future Enhancement)

```typescript
// Test composable
test('explainProblem returns explanation', async () => {
  const { explainProblem, explanation } = useMathExplainer()
  await explainProblem('Solve: x + 2 = 5')
  expect(explanation.value).toContain('x = 3')
})

// Test API route
test('explain-math endpoint works', async () => {
  const response = await $fetch('/api/explain-math', {
    method: 'POST',
    body: { problem: 'Solve: x + 2 = 5' }
  })
  expect(response.explanation).toBeDefined()
})

// Test math rendering
test('MathDisplay renders LaTeX', async () => {
  const wrapper = mount(MathDisplay, {
    props: { content: 'Test: $x = 5$' }
  })
  expect(wrapper.html()).toContain('math-display')
})
```

### Integration Tests

```typescript
// Full flow test
test('User can submit problem and see solution', async () => {
  // 1. Navigate to app
  // 2. Enter problem
  // 3. Submit
  // 4. Wait for response
  // 5. Verify math renders
})
```

### E2E Tests (Playwright/Cypress)

```typescript
test('Math problem solving flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.fill('textarea', 'Solve: 2x = 10')
  await page.click('button:has-text("Explain")')
  await page.waitForSelector('.math-display')
  const content = await page.textContent('.math-display')
  expect(content).toContain('x = 5')
})
```

---

## Debugging Tips

### Frontend Debugging

1. **Vue DevTools**
   ```
   Chrome/Firefox → Vue.js DevTools extension
   Inspect components, state, performance
   ```

2. **Browser Console**
   ```javascript
   // Check if MathJax loaded
   console.log(window.MathJax)

   // Manually trigger MathJax
   MathJax.typesetPromise()
   ```

3. **Network Tab**
   - Check API calls to `/api/explain-math`
   - Verify response format
   - Check for CORS issues

### Backend Debugging

1. **Nuxt Logs**
   ```
   npm run dev  // See server logs
   ```

2. **Axios Debugging**
   ```typescript
   // Add to API calls
   console.log('Request:', body)
   console.log('Response:', response.data)
   ```

3. **Error Stack Traces**
   - Full error details in console
   - Helps identify OpenRouter issues

---

## Extending the Application

### Adding New Models

```typescript
// nuxt.config.ts
runtimeConfig: {
  openrouterModel: 'meta-llama/llama-2-70b-chat'  // Change model
}

// List of models: https://openrouter.ai/docs/models
```

### Custom Prompts

```typescript
// server/api/explain-math.post.ts
messages: [
  {
    role: 'system',
    content: 'YOUR_CUSTOM_PROMPT_HERE'  // Customize
  },
  ...
]
```

### Adding Features

1. **New Page**
   ```
   Create: app/pages/new-feature.vue
   Auto-routes to /new-feature
   ```

2. **New Component**
   ```
   Create: components/YourComponent.vue
   Auto-imports in templates
   ```

3. **New API Route**
   ```
   Create: server/api/new-endpoint.post.ts
   Auto-routes to POST /api/new-endpoint
   ```

---

## Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Environment variables set correctly
- [ ] API key has sufficient balance
- [ ] HTTPS configured
- [ ] Referrer header correct
- [ ] Rate limits understood
- [ ] Error handling tested
- [ ] Math rendering verified
- [ ] Image upload tested
- [ ] Mobile responsive verified

---

## Production Considerations

### Monitoring

- Track API usage (OpenRouter dashboard)
- Monitor error rates
- Log slow requests
- Alert on API failures

### Scaling

- **Vercel**: Auto-scales
- **Docker**: Use load balancer
- **VPS**: Consider reverse proxy caching

### Cost Management

- OpenRouter charges per token
- Monitor usage patterns
- Set up rate limiting if needed
- Consider token optimization

### Security

- Keep API key secure
- Don't log sensitive data
- Validate user inputs
- Use HTTPS everywhere
- Set proper CORS headers

---

## Useful Links

- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org)
- [OpenRouter API](https://openrouter.ai/docs)
- [MathJax Documentation](https://www.mathjax.org/docs)
- [Nitro Docs](https://nitro.unjs.io)

---

## Version Information

- **Nuxt**: 4.2.0+
- **Vue**: 3.5.22+
- **Node**: 18.0.0+
- **OpenRouter**: Current API (v1)

---

This document provides technical depth for developers. For user-facing documentation, see README.md and QUICKSTART.md.
