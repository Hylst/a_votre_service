/**
 * useMobileResponsive.ts
 * Hook for handling mobile-responsive behavior and touch gestures
 */

import { useState, useEffect, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

interface MobileResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  swipeThreshold: number;
  touchSensitivity: number;
}

const DEFAULT_CONFIG: MobileResponsiveConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  swipeThreshold: 50,
  touchSensitivity: 10
};

export const useMobileResponsive = (config: Partial<MobileResponsiveConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Detect screen size
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width < finalConfig.breakpoints.mobile) {
      setScreenSize('mobile');
    } else if (width < finalConfig.breakpoints.tablet) {
      setScreenSize('tablet');
    } else {
      setScreenSize('desktop');
    }
  }, [finalConfig.breakpoints]);

  // Detect touch device
  const detectTouchDevice = useCallback(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsScrolling(false);
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    const deltaX = Math.abs(currentTouch.x - touchStart.x);
    const deltaY = Math.abs(currentTouch.y - touchStart.y);
    
    // Detect if user is scrolling vertically
    if (deltaY > deltaX && deltaY > finalConfig.touchSensitivity) {
      setIsScrolling(true);
    }
  }, [touchStart, finalConfig.touchSensitivity]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart || isScrolling) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    });
  }, [touchStart, isScrolling]);

  // Calculate swipe gesture
  const getSwipeGesture = useCallback((): SwipeGesture => {
    if (!touchStart || !touchEnd) {
      return { direction: null, distance: 0 };
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < finalConfig.swipeThreshold) {
      return { direction: null, distance };
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return {
        direction: deltaX > 0 ? 'right' : 'left',
        distance
      };
    } else {
      return {
        direction: deltaY > 0 ? 'down' : 'up',
        distance
      };
    }
  }, [touchStart, touchEnd, finalConfig.swipeThreshold]);

  // Get responsive classes
  const getResponsiveClasses = useCallback((classes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    base?: string;
  }) => {
    const baseClass = classes.base || '';
    const responsiveClass = classes[screenSize] || '';
    return `${baseClass} ${responsiveClass}`.trim();
  }, [screenSize]);

  // Check if mobile layout should be used
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop';

  // Setup event listeners
  useEffect(() => {
    updateScreenSize();
    detectTouchDevice();
    
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, [updateScreenSize, detectTouchDevice]);

  // Touch event handlers for components
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    touchHandlers,
    getSwipeGesture,
    getResponsiveClasses,
    isScrolling,
    touchStart,
    touchEnd
  };
};

// Helper function for touch-friendly drag and drop
export const createTouchFriendlyDragHandlers = ({
  onDragStart,
  onDragEnd,
  dragData
}: {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragData: string;
}) => {
  let dragElement: HTMLElement | null = null;
  let isDragging = false;
  let startPosition = { x: 0, y: 0 };
  
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    startPosition = { x: touch.clientX, y: touch.clientY };
    dragElement = e.target as HTMLElement;
    
    // Add visual feedback
    if (dragElement) {
      dragElement.style.transform = 'scale(1.05)';
      dragElement.style.opacity = '0.8';
      dragElement.style.zIndex = '1000';
    }
    
    onDragStart?.();
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!dragElement) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.x;
    const deltaY = touch.clientY - startPosition.y;
    
    // Start dragging if moved enough
    if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isDragging = true;
    }
    
    if (isDragging) {
      dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    }
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!dragElement) return;
    
    // Reset visual feedback
    dragElement.style.transform = '';
    dragElement.style.opacity = '';
    dragElement.style.zIndex = '';
    
    if (isDragging) {
      // Find drop target
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementBelow?.closest('[data-drop-zone]');
      
      if (dropZone) {
        const dropEvent = new CustomEvent('touchdrop', {
          detail: { dragData, dropZone }
        });
        dropZone.dispatchEvent(dropEvent);
      }
    }
    
    dragElement = null;
    isDragging = false;
    onDragEnd?.();
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};