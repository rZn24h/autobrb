import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

const inter = Inter({ subsets: ["latin"] });

async function getMetadata() {
  try {
    const docRef = doc(db, 'config', 'public');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: data.metaTitle || 'AutoBRB',
        description: data.metaDescription || 'AutoBRB - Platforma ta de încredere pentru mașini',
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
  
  // Default fallback values
  return {
    title: 'AutoBRB',
    description: 'AutoBRB - Platforma ta de încredere pentru mașini',
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
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="background-wrapper min-vh-100 d-flex flex-column">
            <Navbar />
            <main className="main-content flex-grow-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
