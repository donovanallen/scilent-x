import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized.
 * 
 * SSR-safe: Returns `undefined` during SSR and initial hydration,
 * then updates to the correct value after hydration.
 * 
 * @returns `true` if mobile, `false` if not, `undefined` during SSR/hydration
 */
export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Listen for changes
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

/**
 * Hook to detect if the current viewport is mobile-sized.
 * 
 * Similar to useIsMobile but returns a boolean with a default fallback
 * for SSR/hydration scenarios. Use this when you need a guaranteed boolean.
 * 
 * @param defaultValue - Value to return during SSR/hydration (default: false)
 * @returns `true` if mobile, `false` otherwise
 */
export function useIsMobileWithDefault(defaultValue: boolean = false): boolean {
  const isMobile = useIsMobile();
  return isMobile ?? defaultValue;
}

/**
 * Hook to detect touch-capable devices.
 * Useful for enabling touch-specific interactions.
 * 
 * @returns `true` if device supports touch, `false` otherwise
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    const handleChange = () => {
      checkTouch();
    };
    
    checkTouch();
    
    // Re-check when orientation or layout may change (tablet users may rotate)
    const orientation = (window.screen as any)?.orientation;
    if (orientation && typeof orientation.addEventListener === 'function') {
      orientation.addEventListener('change', handleChange);
      return () => {
        orientation.removeEventListener('change', handleChange);
      };
    }

    window.addEventListener('resize', handleChange);
    return () => {
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return isTouch;
}
