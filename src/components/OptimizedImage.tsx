'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  quality = 85,
  className,
  style,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-car.jpg'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoading(false);
      onError?.();
    }
  };

  return (
    <div className={`optimized-image-container ${className || ''}`} style={style}>
      {isLoading && (
        <div className="image-placeholder">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={`optimized-image ${isLoading ? 'loading' : 'loaded'}`}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        placeholder={placeholder}
        blurDataURL={blurDataURL || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k="}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Component pentru imagini cu aspect ratio fix
export function OptimizedImageWithAspectRatio({
  src,
  alt,
  aspectRatio = '16/9',
  ...props
}: OptimizedImageProps & { aspectRatio?: string }) {
  return (
    <div 
      className="optimized-image-aspect-container"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      <OptimizedImage
        {...props}
        src={src}
        alt={alt}
        fill
        style={{
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

// Component pentru imagini cu lazy loading
export function LazyOptimizedImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: OptimizedImageProps & { 
  threshold?: number;
  rootMargin?: string;
}) {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggered) {
          setIsInView(true);
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = document.createElement('div');
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasTriggered]);

  if (!isInView) {
    return (
      <div 
        className="lazy-image-placeholder"
        style={{
          width: props.width || '100%',
          height: props.height || '200px',
          backgroundColor: 'var(--gray-800)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return <OptimizedImage {...props} src={src} alt={alt} />;
} 