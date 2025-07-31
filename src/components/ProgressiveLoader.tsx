import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  onLoad,
  className = '',
  style = {},
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  if (!isInView) {
    return (
      <div ref={ref} className={className} style={style}>
        {placeholder || (
          <div className="placeholder-glow">
            <div className="placeholder" style={{ height: '200px' }}></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {React.cloneElement(children as React.ReactElement, {
        onLoad: handleLoad,
        style: {
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          ...(children as React.ReactElement).props.style,
        },
      })}
    </div>
  );
};

// Component pentru încărcarea treptată a listelor
interface ProgressiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  batchSize?: number;
  delay?: number;
  className?: string;
  placeholder?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
}

export function ProgressiveList<T>({
  items,
  renderItem,
  batchSize = 10,
  delay = 100,
  className = '',
  placeholder,
  keyExtractor,
}: ProgressiveListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = useCallback(() => {
    if (currentIndex >= items.length) return;

    setIsLoading(true);
    setTimeout(() => {
      const nextBatch = items.slice(currentIndex, currentIndex + batchSize);
      setVisibleItems(prev => [...prev, ...nextBatch]);
      setCurrentIndex(prev => prev + batchSize);
      setIsLoading(false);
    }, delay);
  }, [items, currentIndex, batchSize, delay]);

  useEffect(() => {
    if (items.length > 0 && visibleItems.length === 0) {
      loadNextBatch();
    }
  }, [items, visibleItems.length, loadNextBatch]);

  useEffect(() => {
    if (currentIndex < items.length && !isLoading) {
      const timer = setTimeout(loadNextBatch, delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items.length, isLoading, loadNextBatch, delay]);

  if (visibleItems.length === 0) {
    return (
      <div className={className}>
        {placeholder || (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {visibleItems.map((item, index) => {
        const originalIndex = items.indexOf(item);
        const key = keyExtractor ? keyExtractor(item, originalIndex) : `item-${originalIndex}`;
        return (
          <React.Fragment key={key}>
            {renderItem(item, originalIndex)}
          </React.Fragment>
        );
      })}
      {isLoading && (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Se încarcă mai multe...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component pentru încărcarea treptată cu virtualizare
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = '',
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component pentru încărcarea treptată cu skeleton
interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  height = '200px',
  className = '',
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="placeholder-glow mb-3"
          style={{ height }}
        >
          <div className="placeholder" style={{ height: '100%' }}></div>
        </div>
      ))}
    </div>
  );
};

// Component pentru încărcarea treptată cu progress
interface ProgressLoaderProps {
  progress: number;
  total: number;
  onComplete?: () => void;
  className?: string;
}

export const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  progress,
  total,
  onComplete,
  className = '',
}) => {
  const percentage = Math.min((progress / total) * 100, 100);

  useEffect(() => {
    if (percentage >= 100 && onComplete) {
      onComplete();
    }
  }, [percentage, onComplete]);

  return (
    <div className={className}>
      <div className="progress" style={{ height: '4px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      <small className="text-muted mt-1 d-block">
        {progress} din {total} încărcate ({Math.round(percentage)}%)
      </small>
    </div>
  );
};