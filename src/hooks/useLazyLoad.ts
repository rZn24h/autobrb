import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
        setIsVisible(true);
        if (triggerOnce) {
          setHasTriggered(true);
        }
      } else if (!triggerOnce && !entry.isIntersecting) {
        setIsVisible(false);
      }
    },
    [triggerOnce, hasTriggered]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin]);

  return { elementRef, isVisible };
}

// Hook pentru infinite scroll optimizat
export function useInfiniteScroll<T>(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  loading: boolean
) {
  const [observerRef, setObserverRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(observerRef);

    return () => {
      observer.disconnect();
    };
  }, [observerRef, hasMore, loading, loadMore]);

  return setObserverRef;
}

// Hook pentru optimizarea imaginilor
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (loadedImages.has(src)) return;

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(src));
    };
    img.src = src;
  }, [loadedImages]);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  return { preloadImage, isImageLoaded };
} 