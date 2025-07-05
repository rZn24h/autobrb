import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Cache pentru configurație - optimizat pentru performanță
let configCache: any = null;
let lastConfigFetch = 0;
const CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minute (redus pentru actualizări mai frecvente)

// Fallback config pentru a evita loading states
const FALLBACK_CONFIG = {
  nume: 'AutoBRB',
  slogan: 'Platforma ta de încredere pentru mașini',
  bannerImg: null
};

export function useConfig() {
  const [config, setConfig] = useState<any>(FALLBACK_CONFIG);
  const [loading, setLoading] = useState(false); // Începe cu false pentru a evita loading states
  const { user } = useAuth();

  useEffect(() => {
    // Use a fixed document ID for public config
    const configRef = doc(db, 'config', 'public');
    
    // Check cache first - optimizat pentru performanță
    const now = Date.now();
    if (configCache && (now - lastConfigFetch) < CONFIG_CACHE_DURATION) {
      setConfig(configCache);
      setLoading(false);
      return;
    }
    
    // Set loading only if we don't have cache
    if (!configCache) {
      setLoading(true);
    }
    
    // Subscribe to real-time updates - optimizat cu timeout
    const timeoutId = setTimeout(() => {
      // Fallback dacă Firebase nu răspunde în 3 secunde
      if (loading) {
        setConfig(FALLBACK_CONFIG);
        setLoading(false);
      }
    }, 3000);
    
    const unsubscribe = onSnapshot(
      configRef, 
      (doc) => {
        clearTimeout(timeoutId);
        if (doc.exists()) {
          const data = doc.data();
          // Update cache
          configCache = data;
          lastConfigFetch = now;
          setConfig(data);
        } else {
          setConfig(FALLBACK_CONFIG);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Error fetching config:', error);
        // Fallback to cache if available
        if (configCache) {
          setConfig(configCache);
        } else {
          setConfig(FALLBACK_CONFIG);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []); // Remove user dependency since we're using a fixed document

  return { config, loading };
} 