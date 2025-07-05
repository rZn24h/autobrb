import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';

// Cache pentru mașini - optimizat pentru performanță
let carsCache: any[] = [];
let lastCarsFetch = 0;
const CARS_CACHE_DURATION = 2 * 60 * 1000; // 2 minute

// Pagination constants - optimizat pentru mobile
const INITIAL_LIMIT = 6;
const LOAD_MORE_LIMIT = 6;

export function useCars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);

  // Fetch initial cars - optimizat cu cache
  const fetchInitialCars = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (carsCache.length > 0 && (now - lastCarsFetch) < CARS_CACHE_DURATION) {
      setCars(carsCache);
      setHasMore(carsCache.length === INITIAL_LIMIT);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'), limit(INITIAL_LIMIT));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Update cache
      carsCache = data;
      lastCarsFetch = now;
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      
      setCars(data);
      setHasMore(snap.docs.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Eroare la încărcarea anunțurilor');
      
      // Fallback to cache if available
      if (carsCache.length > 0) {
        setCars(carsCache);
        setHasMore(carsCache.length === INITIAL_LIMIT);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more cars function - optimizat cu IntersectionObserver
  const loadMoreCars = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDocRef.current) return;
    
    setLoadingMore(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDocRef.current),
        limit(LOAD_MORE_LIMIT)
      );
      
      const snap = await getDocs(q);
      const newCars = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (newCars.length > 0) {
        const updatedCars = [...cars, ...newCars];
        setCars(updatedCars);
        
        // Update cache
        carsCache = updatedCars;
        lastCarsFetch = Date.now();
        lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
        
        setHasMore(newCars.length === LOAD_MORE_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more cars:', error);
      setError('Eroare la încărcarea mai multor anunțuri');
    } finally {
      setLoadingMore(false);
    }
  }, [cars, loadingMore, hasMore]);

  // Reset cars - pentru filtrare
  const resetCars = useCallback(() => {
    setCars([]);
    setHasMore(true);
    lastDocRef.current = null;
    fetchInitialCars();
  }, [fetchInitialCars]);

  useEffect(() => {
    fetchInitialCars();
  }, [fetchInitialCars]);

  return {
    cars,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMoreCars,
    resetCars,
    fetchInitialCars
  };
} 