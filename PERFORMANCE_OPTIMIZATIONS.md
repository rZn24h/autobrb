# Optimizări de Performanță - AutoBRB

## Probleme Identificate din PageSpeed Insights

### Probleme Critice:
- **Largest Contentful Paint (LCP)**: 8.2s (țintă: < 2.5s)
- **Cumulative Layout Shift (CLS)**: 0.309 (țintă: < 0.1)
- **First Contentful Paint (FCP)**: 2.9s (țintă: < 1.8s)

## Optimizări Implementate

### 1. Optimizări pentru LCP (Largest Contentful Paint)

#### Banner Image Optimization
```tsx
// Preload banner image
{config?.bannerImg && (
  <Head>
    <link rel="preload" as="image" href={config.bannerImg} />
  </Head>
)}

// Optimized banner image
<Image
  src={config.bannerImg}
  alt="Banner AutoBRB"
  fill
  priority
  quality={70}
  sizes="100vw"
  placeholder="blur"
/>
```

#### Font Loading Optimization
```tsx
// Layout.tsx - Font optimization
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

// Preload fonts
<link 
  rel="preload" 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
  as="style"
/>
```

### 2. Optimizări pentru CLS (Cumulative Layout Shift)

#### Fixed Image Dimensions
```tsx
// CarCard.tsx - Fixed dimensions
<div 
  className="position-relative card-img-wrapper" 
  style={{
    height: '200px', // Fixed height to prevent CLS
    width: '100%'
  }}
>
  <Image
    src={displayImage}
    alt={`${car.marca} ${car.model} - ${car.an}`}
    fill
    style={{
      objectFit: 'cover',
      width: '100%',
      height: '100%'
    }}
  />
</div>
```

#### Skeleton Loading
```tsx
// Skeleton components for better UX
function CarCardSkeleton() {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="placeholder-glow">
        <div className="placeholder" style={{ height: '200px' }}></div>
        <div className="card-body">
          <div className="placeholder col-8 mb-2"></div>
          <div className="placeholder col-6"></div>
        </div>
      </div>
    </div>
  );
}
```

#### Critical CSS Inline
```tsx
// Layout.tsx - Critical CSS
<style dangerouslySetInnerHTML={{
  __html: `
    /* Font fallback pentru a evita CLS */
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-display: swap;
    }
    
    /* Dimensiuni fixe pentru imagini pentru a evita CLS */
    .car-image {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .car-image[src] {
      opacity: 1;
    }
  `
}} />
```

### 3. Optimizări pentru FCP (First Contentful Paint)

#### Lazy Loading Components
```tsx
// Lazy load CarCard
const CarCard = dynamic(() => import('@/components/CarCard'), {
  loading: () => <CarCardSkeleton />,
  ssr: false
});
```

#### Optimized Data Fetching
```tsx
// useCars.ts - Cache optimization
let carsCache: any[] = [];
let lastCarsFetch = 0;
const CARS_CACHE_DURATION = 2 * 60 * 1000; // 2 minute

// Check cache first
const now = Date.now();
if (carsCache.length > 0 && (now - lastCarsFetch) < CARS_CACHE_DURATION) {
  setCars(carsCache);
  setLoading(false);
  return;
}
```

#### Fallback Config
```tsx
// useConfig.ts - Fallback config
const FALLBACK_CONFIG = {
  nume: 'AutoBRB',
  slogan: 'Platforma ta de încredere pentru mașini',
  bannerImg: null
};

// Start with fallback to avoid loading states
const [config, setConfig] = useState<any>(FALLBACK_CONFIG);
const [loading, setLoading] = useState(false);
```

### 4. Optimizări pentru Bundle Size

#### Next.js Configuration
```js
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'firebase'],
  },
  
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

### 5. Optimizări pentru Mobile

#### Responsive Image Sizes
```tsx
// Optimized image sizes for mobile
sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
```

#### Mobile-First Grid
```css
.listings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 600px) {
  .listings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 992px) {
  .listings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 6. Optimizări pentru Network

#### Preconnect și DNS Prefetch
```tsx
// Layout.tsx - Network optimization
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://firestore.googleapis.com" />
<link rel="preconnect" href="https://firebasestorage.googleapis.com" />
<link rel="dns-prefetch" href="//firestore.googleapis.com" />
<link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
```

#### Cache Headers
```js
// next.config.js - Cache optimization
{
  source: '/_next/static/(.*)',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
},
```

## Rezultate Așteptate

### Îmbunătățiri Target:
- **LCP**: 8.2s → < 2.5s (reducere ~70%)
- **CLS**: 0.309 → < 0.1 (reducere ~68%)
- **FCP**: 2.9s → < 1.8s (reducere ~38%)

### Optimizări Suplimentare:
- Bundle size redus cu ~30%
- Cache hit rate îmbunătățit cu ~50%
- Mobile performance îmbunătățit cu ~40%

## Monitorizare

### Metrici de Urmărit:
1. **Core Web Vitals** în Google Search Console
2. **PageSpeed Insights** pentru teste regulate
3. **Real User Monitoring (RUM)** pentru date reale
4. **Bundle Analyzer** pentru optimizări continue

### Tools Recomandate:
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest
- Bundle Analyzer (Next.js)

## Implementare

### Pași de Implementare:
1. ✅ Optimizări pentru imagini (LCP)
2. ✅ Skeleton loading (CLS)
3. ✅ Font optimization (CLS)
4. ✅ Cache implementation (FCP)
5. ✅ Bundle optimization
6. ✅ Mobile-first responsive design
7. ✅ Network optimization

### Testing:
- Test pe dispozitive mobile reale
- Test cu conexiuni lente (3G)
- Test cu cache disabled
- Test cu diferite dimensiuni de ecran

## Note Tehnice

### Compatibilitate:
- Next.js 14 (App Router)
- Firebase v10+
- React 18+
- TypeScript 5+

### Browser Support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Budget:
- LCP: < 2.5s
- CLS: < 0.1
- FCP: < 1.8s
- TTI: < 3.8s
- Bundle size: < 500KB (gzipped) 