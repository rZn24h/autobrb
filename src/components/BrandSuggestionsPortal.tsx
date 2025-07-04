'use client';

import { memo, useLayoutEffect, useState, RefObject } from 'react';
import { createPortal } from 'react-dom';

interface BrandSuggestionsPortalProps {
  children: React.ReactNode;
  visible: boolean;
  anchorRef: RefObject<HTMLElement>;
}

const BrandSuggestionsPortal = memo(function BrandSuggestionsPortal({ 
  children, 
  visible, 
  anchorRef 
}: BrandSuggestionsPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current || !mounted) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [visible, anchorRef, mounted]);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {children}
    </div>,
    document.body
  );
});

export default BrandSuggestionsPortal; 