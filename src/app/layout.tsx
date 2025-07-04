import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from '@/components/Navbar';
import Script from 'next/script';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// Lazy load Footer component
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div style={{ height: '200px' }}></div>,
});

// Optimizare font - preload și display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

async function getMetadata() {
  try {
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
}

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
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
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
        
        {/* Load CSS */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        
        {/* DNS prefetch pentru Firebase */}
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="//identitytoolkit.googleapis.com" />
        
        {/* Preconnect pentru Firebase */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
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
        
        {/* Load Bootstrap JS with optimized strategy */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
          defer
        />
      </body>
    </html>
  );
}
