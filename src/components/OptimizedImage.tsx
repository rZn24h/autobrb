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
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  quality = 75,
  className = '',
  style = {},
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k=',
  onLoad,
  onError,
  fallbackSrc = '/placeholder-car.jpg'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <div 
      className={`optimized-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className="optimized-image"
        style={{
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          ...style
        }}
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