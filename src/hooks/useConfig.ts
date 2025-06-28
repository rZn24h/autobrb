import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Cache pentru configurație
let configCache: any = null;
let lastConfigFetch = 0;
const CONFIG_CACHE_DURATION = 10 * 60 * 1000; // 10 minute

export function useConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Use a fixed document ID for public config
    const configRef = doc(db, 'config', 'public');
    
    // Check cache first
    const now = Date.now();
    if (configCache && (now - lastConfigFetch) < CONFIG_CACHE_DURATION) {
      setConfig(configCache);
      setLoading(false);
      return;
    }
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(configRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Update cache
          configCache = data;
          lastConfigFetch = now;
          setConfig(data);
        } else {
          setConfig(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching config:', error);
        // Fallback to cache if available
        if (configCache) {
          setConfig(configCache);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Remove user dependency since we're using a fixed document

  return { config, loading };
} 