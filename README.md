# 🧮 MathSplainer

An AI-powered mathematics learning platform that explains math problems step-by-step using the GLM-4.5V model via OpenRouter. Users can input problems as text or upload images of handwritten/printed math problems.

## Features

- 📝 **Text Input**: Type or paste mathematical problems for detailed explanations
- 📷 **Image Recognition**: Upload photos of handwritten or printed math problems
- 🧮 **Step-by-Step Solutions**: Get detailed explanations of how to solve problems
- 📐 **LaTeX Rendering**: Beautiful mathematical formula display using MathJax
- 🔐 **API Key Flexibility**:
  - Use server-side API key for convenience (recommended for personal use)
  - Let users provide their own API keys for privacy (recommended for public deployments)
- 🎨 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Vue 3, Nuxt 4
- **Backend**: Nuxt Server Routes (Nitro)
- **AI Model**: GLM-4.5V via OpenRouter API
- **Math Rendering**: MathJax 3, KaTeX
- **Styling**: Vue Scoped Styles with Tailwind-inspired utilities

## Prerequisites

- Node.js 18.0.0 or higher
- npm/pnpm/yarn package manager
- OpenRouter API key (get one at https://openrouter.ai)

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenRouter API key (optional - users can provide their own):

```env
# Option 1: Server-side API key (keep this secret!)
NUXT_OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx

# Option 2: Or just configure the site URL
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Security Note**: If using a server-side API key, never commit `.env.local` to version control.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
# or
pnpm dev
```

The application will:
- Hot-reload on file changes
- Enable Vue DevTools
- Show detailed error messages

## Usage

### Text Problem Input
1. Click the "📝 Text Problem" tab
2. Enter your math problem in natural language or mathematical notation
3. Optionally provide your own OpenRouter API key
4. Click "✨ Explain Problem" to get step-by-step explanation

### Image Problem Input
1. Click the "📷 Image Problem" tab
2. Upload an image of a handwritten or printed math problem
3. (Optional) Add context about the problem
4. Optionally provide your own OpenRouter API key
5. Click "✨ Analyze Image" to get the explanation

### Example Problems

Text Input Examples:
- `Solve for x: 2x + 5 = 13`
- `Find the derivative of f(x) = x^3 + 2x^2 - 5x + 1`
- `What is the integral of sin(x)cos(x) dx?`
- `Prove that the sum of interior angles in a triangle is 180 degrees`

## Project Structure

```
mathsplainer/
├── app/
│   ├── app.vue                 # Main application wrapper
│   └── pages/
│       └── index.vue           # Home page with input forms
├── components/
│   └── MathDisplay.vue         # Math formula rendering component
├── composables/
│   └── useMathExplainer.ts     # API interaction logic
├── server/
│   └── api/
│       ├── explain-math.post.ts        # Text problem API route
│       └── explain-math-image.post.ts  # Image problem API route
├── public/                     # Static assets
├── nuxt.config.ts             # Nuxt configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## API Endpoints

### POST `/api/explain-math`
Explains a text-based math problem.

**Request Body**:
```json
{
  "problem": "Solve for x: 2x + 5 = 13",
  "apiKey": "sk-or-..." // Optional, uses server key if not provided
}
```

**Response**:
```json
{
  "explanation": "Step-by-step solution with LaTeX...",
  "model": "z-ai/glm-4.5v",
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

### POST `/api/explain-math-image`
Analyzes an image of a math problem.

**Request Body**:
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "apiKey": "sk-or-...", // Optional
  "additionalContext": "This is a calculus problem"
}
```

**Response**:
```json
{
  "explanation": "Step-by-step solution with LaTeX...",
  "model": "z-ai/glm-4.5v",
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

## Building for Production

Build the application for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deployment

### Environment Variables for Production

Set these environment variables in your hosting platform:

- `NUXT_OPENROUTER_API_KEY`: Your OpenRouter API key (optional)
- `NUXT_PUBLIC_SITE_URL`: Your application's public URL

### Recommended Hosting Options

- **Vercel** (seamless Nuxt integration)
- **Netlify** (with serverless functions)
- **Railway**, **Render**, **Heroku**
- **Docker** (containerized deployment)
- **VPS** (with PM2 or similar process manager)

## Troubleshooting

### "OpenRouter API key is required"
- Either set `NUXT_OPENROUTER_API_KEY` in `.env.local` (server-side)
- Or provide an API key through the UI when submitting a problem

### Math formulas not rendering
- Check browser console for errors
- Ensure MathJax is loaded from CDN
- Clear browser cache and reload

### Image upload not working
- Check file size (should be reasonable for API submission)
- Verify image format (JPG, PNG, etc.)
- Check browser console for errors

### Rate limiting errors from OpenRouter
- You've exceeded your API rate limit
- Wait a moment and try again
- Check your OpenRouter account for rate limit details

## Tips for Best Results

1. **For Text Problems**: Use clear mathematical notation (LaTeX or plain text)
2. **For Images**: Take clear, well-lit photos of problems
3. **Context Matters**: For images, optionally add context about the problem
4. **Complex Problems**: For very complex problems, break them into smaller parts

## API Rate Limits

The application respects OpenRouter's rate limits:
- Free tier: Limited requests
- Paid tiers: Based on your plan

Check your account at https://openrouter.ai for current limits.

## Security Considerations

### Client-Side vs Server-Side API Keys

**Option 1: Server-Side Key (Recommended for personal projects)**
- Set `NUXT_OPENROUTER_API_KEY` in `.env.local`
- API calls go through your Nuxt server
- Key never exposed to browser
- Simple deployment

**Option 2: User-Provided Keys (Recommended for public applications)**
- Users can provide their own OpenRouter API key through the UI
- More privacy-friendly
- No need to manage credentials on server
- Users control their own costs

## Development Tips

### Hot Module Reloading
Changes to components, pages, and composables hot-reload automatically.

### Debugging
- Enable Vue DevTools in Nuxt config
- Check `nuxt.config.ts` for configuration options
- Use browser DevTools for frontend debugging
- Check Nuxt logs for server-side errors

## Future Enhancements

- [ ] History/saved solutions
- [ ] Drawing board for interactive problem setup
- [ ] Multiple language support
- [ ] Solution export (PDF, image)
- [ ] Practice problem sets
- [ ] Performance optimizations
- [ ] WebGL math visualization

## License

This project is open source. Modify and distribute as needed.

## Support

For issues or feature requests:
1. Check the troubleshooting section
2. Review OpenRouter API documentation
3. Check Nuxt documentation for framework issues
4. File an issue in the repository

## References

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org)
- [MathJax Documentation](https://www.mathjax.org)
