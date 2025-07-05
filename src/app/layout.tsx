import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from '@/components/Navbar';
import Script from 'next/script';
import dynamic from 'next/dynamic';

// Lazy load Footer component pentru reducerea bundle size
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div style={{ height: '200px' }}></div>,
  ssr: false
});

// Lazy load metadata function pentru a evita problemele cu Firebase în build
const getMetadata = async () => {
  try {
    // Import dinamic pentru a evita problemele cu Firebase în build
    const { db } = await import('@/utils/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const docRef = doc(db, 'config', 'public');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: data.metaTitle || 'AutoBRB',
        description: data.metaDescription || 'AutoBRB - Platforma ta de încredere pentru mașini',
        metadataBase: new URL('https://autobrb.vercel.app'),
        openGraph: {
          title: data.metaTitle || 'AutoBRB',
          description: data.metaDescription || 'AutoBRB - Platforma ta de încredere pentru mașini',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: data.metaTitle || 'AutoBRB',
          description: data.metaDescription || 'AutoBRB - Platforma ta de încredere pentru mașini',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
  
  // Default fallback values
  return {
    title: 'AutoBRB',
    description: 'AutoBRB - Platforma ta de încredere pentru mașini',
    metadataBase: new URL('https://autobrb.vercel.app'),
  };
};

// Optimizare font - preload și display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const generateMetadata = async (): Promise<Metadata> => {
  const metadata = await getMetadata();
  return metadata;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <head>
        {/* Preconnect pentru performanță maximă */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* DNS prefetch pentru resurse externe */}
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="//identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        
        {/* Preload resurse critice */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          as="style"
        />
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" 
          as="style"
        />
        
        {/* Load CSS critic */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <AuthProvider>
          <div className="background-wrapper min-vh-100 d-flex flex-column">
            <Navbar />
            <main className="main-content flex-grow-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
        
        {/* Scripts ne-esențiale cu strategy optimizat */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
          defer
        />
        
        {/* Analytics și scripturi externe cu strategy afterInteractive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  );
}
