# MathSplainer Architecture

Visual and detailed architecture documentation.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Vue 3 Frontend Application                  │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │        app/app.vue (Layout & Header)           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                       │                                  │   │
│  │                       ▼                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │      app/pages/index.vue (Main Page)           │    │   │
│  │  │  - Text Input Form                              │    │   │
│  │  │  - Image Upload                                 │    │   │
│  │  │  - API Key Input (Optional)                     │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                       │                                  │   │
│  │                       ▼                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  composables/useMathExplainer.ts                │    │   │
│  │  │  - explainProblem()                             │    │   │
│  │  │  - explainFromImage()                           │    │   │
│  │  │  - State: explanation, loading, error           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                       │                                  │   │
│  │                       ▼                                  │   │
│  │            [HTTP POST Request]                          │   │
│  │                       │                                  │   │
│  └──────────────────────┼──────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                    [Network/HTTP]
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                         ▼                                         │
│                  NUXT SERVER (Backend)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Nitro Server Routes (server/api/)                │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  POST /api/explain-math                            │ │   │
│  │  │  - Receives: { problem, apiKey? }                  │ │   │
│  │  │  - Validates input                                 │ │   │
│  │  │  - Calls OpenRouter API                            │ │   │
│  │  │  - Returns: { explanation, model, usage }          │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  POST /api/explain-math-image                      │ │   │
│  │  │  - Receives: { imageBase64, apiKey?, context? }   │ │   │
│  │  │  - Validates image data                            │ │   │
│  │  │  - Sends to OpenRouter with vision                 │ │   │
│  │  │  - Returns: { explanation, model, usage }          │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                       │                                  │   │
│  │                       ▼                                  │   │
│  │        [Secure API Key Management]                      │   │
│  │        - Server-side key (from .env)                    │   │
│  │        - User-provided key (from request)               │   │
│  │                                                          │   │
│  └──────────────────────┼──────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                    [HTTPS Request]
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                         ▼                                         │
│                  OPENROUTER API                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          https://openrouter.ai/api/v1/chat/...          │   │
│  │                                                          │   │
│  │  Model: z-ai/glm-4.5v                                   │   │
│  │  - Text-to-text problems                                │   │
│  │  - Vision capability for images                         │   │
│  │  - LaTeX output support                                 │   │
│  │  - Step-by-step reasoning                               │   │
│  │                                                          │   │
│  │  Temperature: 0.7 (balanced)                             │   │
│  │  Max Tokens: 4000 (detailed explanations)                │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                    [HTTPS Response]
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                         ▼                                         │
│                  NUXT SERVER (Response)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Response Processing                                     │   │
│  │  - Parse OpenRouter response                             │   │
│  │  - Extract explanation with LaTeX                        │   │
│  │  - Include usage statistics                              │   │
│  │  - Handle errors gracefully                              │   │
│  │  - Return to client                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                    [HTTP Response]
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                         ▼                                         │
│                  USER BROWSER (Response)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Composable Updates State                                │   │
│  │  - explanation.value = response                          │   │
│  │  - loading.value = false                                 │   │
│  │  - error.value = '' (if success)                         │   │
│  │  - Triggers component re-render                          │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │    components/MathDisplay.vue (Rendering)               │   │
│  │                                                          │   │
│  │  Process:                                                │   │
│  │  1. Watch for content changes                            │   │
│  │  2. Convert markdown syntax to HTML                      │   │
│  │  3. Replace LaTeX markers                                │   │
│  │    - $formula$ → <span class="math-inline">              │   │
│  │    - $$formula$$ → <div class="math-display">            │   │
│  │  4. Inject HTML (v-html)                                 │   │
│  │  5. Trigger MathJax typesetPromise()                     │   │
│  │  6. MathJax renders beautiful formulas                   │   │
│  │                                                          │   │
│  │  Output:                                                 │   │
│  │  - Formatted explanation text                            │   │
│  │  - Beautiful rendered mathematical formulas              │   │
│  │  - Responsive styling                                    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              User Sees Solution                          │   │
│  │                                                          │   │
│  │  "Step 1: Solve 2x + 5 = 13                             │   │
│  │   Subtract 5 from both sides:                            │   │
│  │   2x = 8                                                 │   │
│  │                                                          │   │
│  │   Step 2: Divide by 2                                    │   │
│  │   x = 4                                                  │   │
│  │                                                          │   │
│  │   Verification: 2(4) + 5 = 8 + 5 = 13 ✓"               │   │
│  │                                                          │   │
│  │  [Beautiful math formulas with MathJax]                  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Dependency Graph

```
┌─────────────────────────┐
│    app.vue              │ (Main Layout & Header)
│ (App Wrapper)           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  pages/index.vue                        │ (Main Page)
│  ┌─────────────────────────────────┐   │
│  │  Tabs                           │   │
│  │  - Text Problem Tab             │   │
│  │  - Image Problem Tab            │   │
│  ├─────────────────────────────────┤   │
│  │  Input Forms                    │   │
│  │  - Text textarea                │   │
│  │  - Image upload                 │   │
│  │  - API key input                │   │
│  │  - Submit buttons               │   │
│  ├─────────────────────────────────┤   │
│  │  Event Handlers                 │   │
│  │  - @click: handleTextProblem    │   │
│  │  - @click: handleImageProblem   │   │
│  └────────────┬────────────────────┘   │
└───────────────┼────────────────────────┘
                │
     ┌──────────┴──────────┐
     ▼                     ▼
┌──────────────────┐  ┌──────────────────────────┐
│ useMathExplainer │  │ MathDisplay.vue          │
│ (Composable)     │  │ (Formula Rendering)      │
│                  │  │                          │
│ - explanation    │  │ - @input: content       │
│ - loading        │  │ - @watch: content       │
│ - error          │  │ - Process markdown      │
│                  │  │ - Render with MathJax   │
│ - explainProblem │  │ - Display result        │
│ - explainFromImg │  │                          │
│                  │  └──────────────────────────┘
└────────┬─────────┘
         │
         ▼
    Server API Routes
    ├─ explain-math.post.ts
    └─ explain-math-image.post.ts
         │
         ▼
    OpenRouter API
```

## Data Flow Diagram

### Text Problem Flow

```
User Types Problem
        │
        ▼
[input.problem] (Reactive)
        │
        ▼
handleTextProblem()
        │
        ▼
useMathExplainer.explainProblem(problem, apiKey?)
        │
        ▼
POST /api/explain-math
├─ Body: { problem, apiKey }
├─ Server loads API key (env or from request)
│
└─▶ OpenRouter API Request
    ├─ Model: z-ai/glm-4.5v
    ├─ System Prompt: Math tutor
    ├─ Messages: [{ role, content }]
    ├─ Temperature: 0.7
    ├─ Max tokens: 4000
    │
    └─▶ AI Processes → Returns explanation with LaTeX
        │
        └─▶ Server parses response
            │
            └─▶ Return { explanation, model, usage }
                │
                └─▶ Client receives
                    │
                    ├─▶ explanation.value = response
                    ├─▶ loading.value = false
                    │
                    └─▶ MathDisplay watches explanation
                        │
                        └─▶ Renders with MathJax
                            │
                            └─▶ User sees solution
```

### Image Problem Flow

```
User Uploads Image
        │
        ▼
FileReader.readAsDataURL(file)
        │
        ▼
selectedImage = Base64String
        │
        ▼
handleImageProblem()
        │
        ▼
useMathExplainer.explainFromImage(base64, apiKey?, context?)
        │
        ▼
POST /api/explain-math-image
├─ Body: { imageBase64, apiKey, additionalContext }
├─ Server loads API key
│
└─▶ OpenRouter API Request (with Vision)
    ├─ Model: z-ai/glm-4.5v (with vision)
    ├─ Messages with image_url type
    ├─ AI recognizes math problem
    ├─ AI transcribes problem
    ├─ AI explains solution
    │
    └─▶ Return explanation with LaTeX
        │
        └─▶ [Same as text flow from here]
```

## State Management

```
Vue Component (index.vue)
├─ Local State (ref):
│  ├─ activeTab: 'text' | 'image'
│  ├─ problemText: string
│  ├─ selectedImage: string
│  ├─ selectedImageName: string
│  ├─ additionalContext: string
│  ├─ useOwnKey: boolean
│  ├─ customApiKey: string
│  ├─ useOwnKeyImage: boolean
│  └─ customApiKeyImage: string
│
└─ Composable State (useMathExplainer):
   ├─ explanation: readonly<string>
   ├─ loading: readonly<boolean>
   └─ error: readonly<string>
```

## API Security Model

```
┌────────────────────────────────────────┐
│    Option 1: Server-Side Key           │
├────────────────────────────────────────┤
│ .env.local:                            │
│ NUXT_OPENROUTER_API_KEY=sk-or-xxx      │
│                                        │
│ User Request → Server uses env key →   │
│ OpenRouter API → Response              │
│                                        │
│ ✅ Key never exposed                   │
│ ❌ Server bears cost                   │
│ ✅ Simpler UX                          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    Option 2: User-Provided Key         │
├────────────────────────────────────────┤
│ User pastes API key in UI               │
│ ↓                                       │
│ Sent with request (HTTPS)               │
│ ↓                                       │
│ Server forwards to OpenRouter            │
│ ↓                                       │
│ Response back to client                 │
│                                        │
│ ✅ User controls cost                  │
│ ✅ Better privacy                      │
│ ✅ No server secrets                   │
│ ⚠️ User must manage keys                │
└────────────────────────────────────────┘
```

## Tech Stack Layers

```
┌──────────────────────────────────────────────┐
│         CDN & External Services              │
├──────────────────────────────────────────────┤
│  - MathJax 3 (formula rendering)             │
│  - KaTeX CSS (math styling)                  │
│  - OpenRouter API (AI backend)               │
└──────────────────────────────────────────────┘
          ▲
          │
┌─────────┴──────────────────────────────────┐
│       Browser / Client Layer               │
├────────────────────────────────────────────┤
│  Vue 3 + TypeScript                        │
│  ├─ Components (.vue)                      │
│  ├─ Composables (logic)                    │
│  ├─ Pages (routing)                        │
│  └─ Styles (scoped CSS)                    │
└─────────┬──────────────────────────────────┘
          │
          │ (HTTP/HTTPS)
          │
┌─────────┴──────────────────────────────────┐
│       Server / Nuxt Layer                  │
├────────────────────────────────────────────┤
│  Nitro Server Runtime                      │
│  ├─ API Routes (.post.ts)                  │
│  ├─ Middleware (auth, validation)          │
│  ├─ Configuration                          │
│  └─ Runtime utilities                      │
└─────────┬──────────────────────────────────┘
          │
          │ (HTTPS)
          │
┌─────────┴──────────────────────────────────┐
│     External AI Service                    │
├────────────────────────────────────────────┤
│  OpenRouter API                            │
│  ├─ GLM-4.5V Model                         │
│  ├─ Vision Capabilities                    │
│  └─ Token Counting                         │
└────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│      Development / Build Tools              │
├──────────────────────────────────────────────┤
│  - Node.js / npm                            │
│  - TypeScript                               │
│  - Vite (bundler)                           │
│  - Nuxi (CLI)                               │
│  - PostCSS                                  │
└──────────────────────────────────────────────┘
```

## Deployment Architecture Options

```
Option 1: Vercel (Recommended)
┌─────────────────────┐
│   Git Repository    │
│   (GitHub/GitLab)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Vercel          │  ← Auto-builds, deploys, scales
├─────────────────────┤
│  Edge Functions     │  ← API routes
│  CDN               │  ← Static assets
│  Auto-scaling      │  ← Handles traffic spikes
└─────────────────────┘

Option 2: Docker + VPS
┌─────────────────────┐
│   Source Code       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Docker Build      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│   Container Registry         │
│   (Docker Hub / Private)     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   VPS / Server               │
├──────────────────────────────┤
│  - Docker Runtime            │
│  - Nginx (Reverse Proxy)     │
│  - PM2/Systemd (Process Mgr) │
│  - Let's Encrypt (SSL)       │
└──────────────────────────────┘

Option 3: Kubernetes
┌─────────────────────────────────┐
│   Container Image               │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   Kubernetes Cluster             │
├──────────────────────────────────┤
│  - Pods (running containers)     │
│  - Services (load balancing)     │
│  - Ingress (routing)             │
│  - ConfigMaps (configuration)    │
│  - Secrets (API keys)            │
└──────────────────────────────────┘
```

---

## File Organization

```
mathsplainer/
│
├── app/                      # Nuxt app directory
│   ├── app.vue              # Root layout component
│   └── pages/               # Route pages
│       └── index.vue        # Home page (/)
│
├── components/              # Reusable Vue components
│   └── MathDisplay.vue      # Formula rendering component
│
├── composables/             # Logic composition functions
│   └── useMathExplainer.ts  # API and state management
│
├── server/                  # Backend (Nitro)
│   └── api/                 # API routes (auto-route)
│       ├── explain-math.post.ts
│       └── explain-math-image.post.ts
│
├── public/                  # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── Configuration Files
│   ├── nuxt.config.ts       # Nuxt settings
│   ├── tsconfig.json        # TypeScript config
│   ├── package.json         # Dependencies
│   ├── .env.example         # Environment template
│   ├── Dockerfile           # Container definition
│   ├── docker-compose.yml   # Local Docker setup
│   └── .dockerignore        # Docker build ignore
│
├── Documentation
│   ├── README.md            # Main documentation
│   ├── QUICKSTART.md        # Quick start guide
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── IMPLEMENTATION_NOTES.md  # Technical details
│   ├── ARCHITECTURE.md      # This file
│   └── PROJECT_SUMMARY.md   # Overview
│
└── Git Configuration
    ├── .gitignore           # Git ignore rules
    └── .git/                # Git repository
```

---

This architecture supports:
- **Scalability**: Easy to scale with Vercel, Docker, or Kubernetes
- **Security**: Multiple API key management options
- **Performance**: CDN for static assets, optimized API calls
- **Developer Experience**: Hot reloading, TypeScript, auto-imports
- **User Experience**: Responsive design, fast responses, beautiful math rendering

