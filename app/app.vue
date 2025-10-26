<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <header class="header">
      <div class="container">
        <h1>🧮 MathSplainer</h1>
        <p>Understand Mathematics Step by Step with AI</p>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <NuxtPage />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 MathSplainer. Powered by OpenRouter and GLM-4.5V</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background: #f3f4f6;
  color: #1f2937;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 1rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.95;
  font-weight: 300;
}

.main {
  flex: 1;
  padding: 2rem 1rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.footer {
  background: #1f2937;
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  margin-top: 2rem;
}

.footer p {
  font-size: 0.875rem;
  opacity: 0.8;
}

@media (max-width: 640px) {
  .header h1 {
    font-size: 1.875rem;
  }

  .header p {
    font-size: 1rem;
  }
}
</style>
