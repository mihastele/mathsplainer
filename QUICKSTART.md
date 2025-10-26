# Quick Start Guide

Get **MathSplainer** running in 5 minutes!

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Get an OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up or log in
3. Go to your dashboard and create an API key
4. Copy your API key (looks like `sk-or-...`)

## 3️⃣ Choose Your Configuration

### Option A: Simple (Server-Side Key) 👤
**Best for personal use - your key stays on the server**

```bash
# Create .env.local
cp .env.example .env.local
```

Then edit `.env.local`:
```env
NUXT_OPENROUTER_API_KEY=sk-or-paste-your-key-here
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Option B: Secure (User-Provided Keys) 👥
**Best for public deployments - users bring their own keys**

```bash
# Just run - no API key needed on server!
# Users will paste their own keys in the UI
```

## 4️⃣ Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🚀

## 5️⃣ Try It Out!

### Test with Text Input:
1. Click "📝 Text Problem" tab
2. Paste a math problem:
   ```
   Solve for x: 3x + 7 = 22
   ```
3. Click "✨ Explain Problem"

### Test with Image:
1. Click "📷 Image Problem" tab
2. Upload or drag a photo of a math problem
3. Click "✨ Analyze Image"

## That's It! 🎉

The app will:
- Show the problem transcription
- Display step-by-step solution
- Render mathematical formulas beautifully

## Troubleshooting

**Error: "OpenRouter API key is required"**
- Option A users: Check `.env.local` has your key
- Option B users: Enter API key in the UI when solving

**Math not rendering?**
- Refresh the page
- Check browser console for errors
- Clear browser cache

**Need help?**
- Read the full [README.md](./README.md)
- Check [OpenRouter docs](https://openrouter.ai/docs)

## Common Problems to Try

```
# Basic Algebra
Solve for x: 2x - 5 = 11

# Calculus
Find the derivative of x^3 + 2x^2 - 5x + 1

# Geometry
What is the area of a circle with radius 5?

# Statistics
Calculate the standard deviation of: 10, 20, 30, 40, 50

# Complex Math
Solve the differential equation: dy/dx + 2y = e^x
```

## Going to Production

When ready to deploy:

1. Build the app:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform:
   - `NUXT_OPENROUTER_API_KEY` (optional)
   - `NUXT_PUBLIC_SITE_URL` (your domain)

3. Deploy (Vercel, Netlify, etc.)

## Next Steps

- Read [README.md](./README.md) for full documentation
- Explore advanced features
- Customize styling and behavior
- Add more features like problem history

Enjoy learning! 📚✨
