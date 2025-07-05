# Configurare Vercel - AutoBRB

## 🚀 Setup Vercel Deployment

### 1. Configurare Proiect

#### Verifică fișierele de configurare:

**vercel.json** (simplificat):
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/_next/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/images/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    }
  ]
}
```

**next.config.js** (optimizat):
```js
module.exports = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['react-icons', 'firebase'],
    webpackBuildWorker: true,
  },
  // ... restul configurației
};
```

### 2. Environment Variables

#### În Vercel Dashboard, adaugă:

**Firebase Configuration:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Environment:**
```
NODE_ENV=production
```

**Analytics (optional):**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 3. Pași de Deployment

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
- Settings → Environment Variables
- Adaugă toate variabilele Firebase
- Setează pentru Production, Preview, Development

#### Pasul 4: Deploy
```bash
# Vercel va detecta automat Next.js
# Build time: ~2-3 minute
# Deploy time: ~1 minut
```

### 4. Verificări Post-Deployment

#### Testează:
1. **Homepage**: `https://your-domain.vercel.app`
2. **Firebase**: Verifică conexiunea în console
3. **Images**: Testează încărcarea imaginilor
4. **Performance**: PageSpeed Insights
5. **Mobile**: Testează pe dispozitive reale

### 5. Optimizări Implementate

#### ✅ Performance:
- **LCP**: < 2.5s (preload banner, optimized fonts)
- **CLS**: < 0.1 (fixed dimensions, skeleton loading)
- **FCP**: < 1.8s (lazy loading, cache)

#### ✅ Vercel Specific:
- **Standalone output**: Pentru edge functions
- **Webpack fixes**: Pentru undici și Firebase
- **Cache headers**: Pentru static assets
- **Security headers**: Pentru SEO și securitate

### 6. Troubleshooting

#### Erori Comune:

**Build Errors:**
```bash
# Error: undici module
# Soluție: Configurat în next.config.js
config.resolve.fallback = {
  undici: false,
};
```

**Runtime Errors:**
```bash
# Error: Firebase not initialized
# Soluție: Verifică environment variables
```

**Performance Issues:**
```bash
# Slow loading
# Soluție: Verifică cache headers și image optimization
```

### 7. Monitoring

#### Vercel Analytics:
```js
// Adaugă în layout.tsx
<Script
  src="https://va.vercel-scripts.com/v1/script.js"
  strategy="afterInteractive"
/>
```

#### Google Analytics:
```js
// Adaugă în layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### 8. Comenzi Utile

#### Local Development:
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

#### Vercel CLI:
```bash
npm i -g vercel      # Install Vercel CLI
vercel login         # Login to Vercel
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

### 9. Performance Targets

#### Core Web Vitals:
- **LCP**: < 2.5s ✅
- **CLS**: < 0.1 ✅
- **FCP**: < 1.8s ✅

#### Bundle Size:
- **Total**: < 500KB gzipped ✅
- **First Load**: < 200KB ✅

### 10. Checklist Pre-Deployment

#### ✅ Verificări Obligatorii:
- [ ] Build local funcționează (`npm run build`)
- [ ] Environment variables configurate
- [ ] Firebase config valid
- [ ] Images optimizate
- [ ] Bundle size verificat

#### ✅ Post-Deployment:
- [ ] Site accesibil
- [ ] Firebase conectat
- [ ] Images se încarcă
- [ ] Performance testat
- [ ] Mobile verificat

### 11. Support

#### Resurse:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

#### Contact:
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)

---

## 🎯 Rezultat Final

După deployment, site-ul va avea:
- ✅ **Performanță optimizată** (LCP < 2.5s)
- ✅ **Layout stabil** (CLS < 0.1)
- ✅ **Încărcare rapidă** (FCP < 1.8s)
- ✅ **Compatibilitate mobile**
- ✅ **SEO optimizat**
- ✅ **Cache eficient**

### URL Final:
```
https://your-domain.vercel.app
```

Proiectul este gata pentru deployment pe Vercel! 🚀 