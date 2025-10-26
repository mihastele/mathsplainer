# Deployment Guide

Complete guide to deploying MathSplainer to production.

## Table of Contents

1. [Vercel (Recommended)](#vercel-recommended)
2. [Docker](#docker)
3. [Traditional VPS/Server](#traditional-vpsserver)
4. [Environment Variables](#environment-variables)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)

---

## Vercel (Recommended)

Vercel has seamless Nuxt integration and automatic deployments.

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial MathSplainer setup"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your repository
4. Select "Nuxt.js" as the framework
5. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add `NUXT_OPENROUTER_API_KEY` (optional)
3. Add `NUXT_PUBLIC_SITE_URL` (your deployed URL)
4. Redeploy

### Step 4: Update OpenRouter Referrer

In OpenRouter Dashboard:

1. Verify your deployed URL is set correctly
2. The application will send the proper referrer header

Done! 🎉

---

## Docker

Deploy using Docker containers.

### Build the Image

```bash
docker build -t mathsplainer:latest .
```

### Run the Container

```bash
docker run -p 3000:3000 \
  -e NUXT_OPENROUTER_API_KEY=sk-or-your-key \
  -e NUXT_PUBLIC_SITE_URL=http://your-domain.com \
  mathsplainer:latest
```

### Using Docker Compose

```bash
# Create .env file
echo "NUXT_OPENROUTER_API_KEY=sk-or-your-key" > .env
echo "NUXT_PUBLIC_SITE_URL=http://your-domain.com" >> .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Push to Docker Registry

```bash
# Tag the image
docker tag mathsplainer:latest your-registry/mathsplainer:latest

# Push to registry
docker push your-registry/mathsplainer:latest

# Deploy with Docker registry
docker run -p 3000:3000 \
  -e NUXT_OPENROUTER_API_KEY=sk-or-your-key \
  your-registry/mathsplainer:latest
```

### Kubernetes Deployment

Example Kubernetes manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mathsplainer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mathsplainer
  template:
    metadata:
      labels:
        app: mathsplainer
    spec:
      containers:
      - name: mathsplainer
        image: your-registry/mathsplainer:latest
        ports:
        - containerPort: 3000
        env:
        - name: NUXT_OPENROUTER_API_KEY
          valueFrom:
            secretKeyRef:
              name: mathsplainer-secrets
              key: api-key
        - name: NUXT_PUBLIC_SITE_URL
          value: "https://your-domain.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: mathsplainer-service
spec:
  selector:
    app: mathsplainer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## Traditional VPS/Server

Deploy on your own server (Ubuntu/Debian example).

### Prerequisites

- Node.js 18+ installed
- Nginx installed (for reverse proxy)
- Git installed

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/mathsplainer.git
cd mathsplainer/mathsplainer
```

### Step 2: Install Dependencies

```bash
npm ci
```

### Step 3: Configure Environment

```bash
cp .env.example .env.local
nano .env.local  # Edit with your API key
```

### Step 4: Build Application

```bash
npm run build
```

### Step 5: Set Up Nginx Reverse Proxy

Create `/etc/nginx/sites-available/mathsplainer`:

```nginx
upstream mathsplainer {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1000;

    # Proxy settings
    location / {
        proxy_pass http://mathsplainer;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/mathsplainer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Set Up SSL (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### Step 7: Set Up Process Manager (PM2)

```bash
npm install -g pm2

# Start the app
pm2 start npm --name "mathsplainer" -- start

# Setup autostart
pm2 startup
pm2 save
```

### Step 8: Set Up Auto-Updates

Create `/home/user/update-mathsplainer.sh`:

```bash
#!/bin/bash
cd /home/user/mathsplainer/mathsplainer
git pull origin main
npm ci
npm run build
pm2 restart mathsplainer
```

Create crontab entry:

```bash
crontab -e
# Add: 0 2 * * * /home/user/update-mathsplainer.sh
```

---

## Environment Variables

### Required

- `NUXT_PUBLIC_SITE_URL`: Your application URL (e.g., `https://mathsplainer.com`)

### Optional

- `NUXT_OPENROUTER_API_KEY`: Server-side API key (if providing for users)
- `NODE_ENV`: Set to `production` for production deployments

### Platform-Specific

**Vercel:**
- Dashboard → Settings → Environment Variables

**Docker:**
- Use `-e` flag or `.env` file with `docker-compose`

**VPS:**
- `.env.local` file in application root

---

## Pre-Deployment Checklist

- [ ] Remove `.env.local` from git (check `.gitignore`)
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Update `NUXT_PUBLIC_SITE_URL` for your domain
- [ ] Set up OpenRouter API key securely
- [ ] Configure SSL/HTTPS
- [ ] Set up error monitoring (optional)
- [ ] Configure backups (for VPS)
- [ ] Test image upload functionality
- [ ] Test with real math problems
- [ ] Verify MathJax rendering works
- [ ] Check rate limiting settings
- [ ] Set up monitoring/alerts
- [ ] Document your deployment method
- [ ] Test rollback procedure

---

## Monitoring and Maintenance

### Logs

**Vercel:**
- Check in Vercel Dashboard → Deployments → Logs

**Docker:**
```bash
docker logs container-name
```

**VPS (PM2):**
```bash
pm2 logs mathsplainer
pm2 monit
```

### Updates

Keep dependencies updated:

```bash
npm update
npm audit fix
```

### Performance Monitoring

Monitor these metrics:

- Page load times
- API response times
- Error rates
- OpenRouter API usage and costs
- Server resource usage

### Scaling

For high traffic:

1. **Vercel**: Automatically scales
2. **Docker**: Use load balancer + multiple containers
3. **VPS**: Consider reverse proxy caching, optimize database queries

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
npm run build
npm run preview

# Check Node version
node --version  # Should be 18+
```

### API Key Not Working

- Verify format: `sk-or-...`
- Check OpenRouter account is active
- Verify rate limits not exceeded
- Ensure key has sufficient balance

### SSL Certificate Issues

```bash
# Verify certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### High Memory Usage

- Check for memory leaks in logs
- Restart application
- Increase server RAM
- Optimize images

---

## Getting Help

1. Check error logs first
2. Review [Nuxt docs](https://nuxt.com/docs/getting-started/deployment)
3. Check [OpenRouter API docs](https://openrouter.ai/docs)
4. Review troubleshooting section in main [README.md](./README.md)

Good luck! 🚀
