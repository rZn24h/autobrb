import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createPopper, Instance } from '@popperjs/core';

interface BrandSuggestionsPortalProps {
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  visible: boolean;
}

export default function BrandSuggestionsPortal({ children, anchorRef, visible }: BrandSuggestionsPortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const popperInstance = useRef<Instance | null>(null);

  useEffect(() => {
    if (!anchorRef?.current || !portalRef.current || !visible) return;
    if (popperInstance.current) {
      popperInstance.current.destroy();
      popperInstance.current = null;
    }
    popperInstance.current = createPopper(anchorRef.current, portalRef.current, {
      placement: 'bottom-start',
      modifiers: [
        { name: 'offset', options: { offset: [0, 4] } },
        { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
        { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
        { name: 'customZIndex', enabled: true, phase: 'write', fn: ({ state }) => {
          if (state.elements && state.elements.popper) {
            (state.elements.popper as HTMLElement).style.zIndex = '2147483647';
          }
        }}
      ],
    });
    return () => {
      if (popperInstance.current) {
        popperInstance.current.destroy();
        popperInstance.current = null;
      }
    };
  }, [anchorRef, visible]);

  if (!visible) return null;

  return createPortal(
    <div ref={portalRef} style={{ pointerEvents: visible ? 'auto' : 'none', width: anchorRef.current?.offsetWidth || '100%', zIndex: 2147483647 }}>
      {children}
    </div>,
    document.body
  );
} 