import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BrandSuggestionsPortalProps {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  visible: boolean;
}

export default function BrandSuggestionsPortal({ children, anchorRef, visible }: BrandSuggestionsPortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorRef?.current || !portalRef.current || !visible) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const offset = 4; // px între input și dropdown
    portalRef.current.style.position = 'fixed';
    portalRef.current.style.left = `${anchorRect.left}px`;
    portalRef.current.style.top = `${anchorRect.bottom + offset + window.scrollY}px`;
    portalRef.current.style.width = `${anchorRect.width}px`;
    portalRef.current.style.minWidth = `${anchorRect.width}px`;
    portalRef.current.style.maxWidth = '100vw';
    portalRef.current.style.zIndex = '99999';
    portalRef.current.style.boxSizing = 'border-box';
  }, [anchorRef, visible]);

  if (!visible) return null;

  return createPortal(
    <div ref={portalRef} style={{ pointerEvents: visible ? 'auto' : 'none', width: '100%' }}>
      {children}
    </div>,
    document.body
  );
} 