# Ghid Deployment Vercel - AutoBRB

## 🚀 Pregătire pentru Vercel

### 1. Configurare Proiect

#### Verifică package.json
```json
{
  "name": "autobrb",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "vercel-build": "next build"
  }
}
```

#### Verifică next.config.js
```js
module.exports = {
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      undici: false,
    };
    return config;
  },
};
```

### 2. Variabile de Mediu

#### În Vercel Dashboard, adaugă:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Optimizări Implementate

#### ✅ Performance Optimizations
- **LCP**: Preload banner image, optimized fonts
- **CLS**: Fixed image dimensions, skeleton loading
- **FCP**: Lazy loading, cache implementation
- **Bundle**: Code splitting, tree shaking

#### ✅ Vercel Specific
- **Standalone output**: Pentru edge functions
- **Webpack fixes**: Pentru undici și Firebase
- **Cache headers**: Pentru static assets
- **Security headers**: Pentru SEO și securitate

### 4. Deployment Steps

#### Pasul 1: Conectare GitHub
1. Mergi la [vercel.com](https://vercel.com)
2. Conectează-te cu GitHub
3. Importă repository-ul `autobrb`

#### Pasul 2: Configurare Proiect
```bash
# Framework Preset: Next.js
# Root Directory: ./
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm install
```

#### Pasul 3: Environment Variables
Adaugă toate variabilele Firebase în Vercel Dashboard:
- Settings → Environment Variables
- Production, Preview, Development

#### Pasul 4: Deploy
```bash
# Vercel va detecta automat Next.js
# Build time: ~2-3 minute
# Deploy time: ~1 minut
```

### 5. Post-Deployment

#### Verificări
1. **PageSpeed Insights**: Testează performanța
2. **Lighthouse**: Verifică Core Web Vitals
3. **Mobile**: Testează pe dispozitive reale
4. **Firebase**: Verifică conexiunea

#### Monitoring
- **Vercel Analytics**: Pentru performanță
- **Google Search Console**: Pentru SEO
- **Firebase Console**: Pentru date

### 6. Troubleshooting

#### Erori Comune

##### Build Errors
```bash
# Error: undici module
# Soluție: Configurat în next.config.js
config.resolve.fallback = {
  undici: false,
};
```

##### Runtime Errors
```bash
# Error: Firebase not initialized
# Soluție: Verifică environment variables
```

##### Performance Issues
```bash
# Slow loading
# Soluție: Verifică cache headers și image optimization
```

### 7. Optimizări Suplimentare

#### Cache Strategy
```js
// vercel.json
{
  "routes": [
    {
      "src": "/_next/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

#### Image Optimization
```js
// next.config.js
images: {
  domains: ['firebasestorage.googleapis.com'],
  formats: ['image/webp', 'image/avif'],
}
```

### 8. Performance Targets

#### Core Web Vitals
- **LCP**: < 2.5s ✅
- **CLS**: < 0.1 ✅
- **FCP**: < 1.8s ✅

#### Bundle Size
- **Total**: < 500KB gzipped ✅
- **First Load**: < 200KB ✅

### 9. Monitoring Setup

#### Vercel Analytics
```js
// Adaugă în layout.tsx
<Script
  src="https://va.vercel-scripts.com/v1/script.js"
  strategy="afterInteractive"
/>
```

#### Google Analytics
```js
// Adaugă în layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### 10. Deployment Checklist

#### ✅ Pre-Deployment
- [ ] Environment variables configurate
- [ ] Firebase config valid
- [ ] Build local funcționează
- [ ] Images optimizate
- [ ] Bundle size verificat

#### ✅ Post-Deployment
- [ ] Site accesibil
- [ ] Firebase conectat
- [ ] Images se încarcă
- [ ] Performance testat
- [ ] Mobile verificat

### 11. Comenzi Utile

#### Local Development
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

#### Vercel CLI
```bash
npm i -g vercel      # Install Vercel CLI
vercel login         # Login to Vercel
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

### 12. Support

#### Resurse
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

#### Contact
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)

---

## 🎯 Rezultat Final

După deployment, site-ul ar trebui să aibă:
- ✅ Performanță optimizată (LCP < 2.5s)
- ✅ Layout stabil (CLS < 0.1)
- ✅ Încărcare rapidă (FCP < 1.8s)
- ✅ Compatibilitate mobile
- ✅ SEO optimizat
- ✅ Cache eficient 