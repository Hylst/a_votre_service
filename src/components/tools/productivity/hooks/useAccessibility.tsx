/**
 * useAccessibility.ts - Hook pour les fonctionnalités d'accessibilité
 * Gère les ARIA labels, la navigation clavier et le support des lecteurs d'écran
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './useTaskManager';

interface AccessibilityConfig {
  announceChanges?: boolean;
  enableKeyboardNavigation?: boolean;
  highContrastMode?: boolean;
  reducedMotion?: boolean;
}

interface FocusManagement {
  currentFocusIndex: number;
  focusableElements: HTMLElement[];
  trapFocus: boolean;
}

export const useAccessibility = (config: AccessibilityConfig = {}) => {
  const {
    announceChanges = true,
    enableKeyboardNavigation = true,
    highContrastMode = false,
    reducedMotion = false
  } = config;

  const [screenReaderText, setScreenReaderText] = useState('');
  const [focusManagement, setFocusManagement] = useState<FocusManagement>({
    currentFocusIndex: -1,
    focusableElements: [],
    trapFocus: false
  });

  const announcementRef = useRef<HTMLDivElement>(null);

  // Annonce les changements pour les lecteurs d'écran
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;
    
    setScreenReaderText(message);
    
    // Clear après un délai pour permettre les nouvelles annonces
    setTimeout(() => setScreenReaderText(''), 1000);
  }, [announceChanges]);

  // Gestion du focus pour la navigation clavier
  const updateFocusableElements = useCallback((container: HTMLElement | null) => {
    if (!container || !enableKeyboardNavigation) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    setFocusManagement(prev => ({
      ...prev,
      focusableElements: elements
    }));
  }, [enableKeyboardNavigation]);

  // Navigation clavier
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent, container: HTMLElement | null) => {
    if (!enableKeyboardNavigation || !container) return;

    const { focusableElements, currentFocusIndex } = focusManagement;
    
    switch (event.key) {
      case 'Tab':
        if (focusManagement.trapFocus) {
          event.preventDefault();
          const nextIndex = event.shiftKey 
            ? (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length
            : (currentFocusIndex + 1) % focusableElements.length;
          
          focusableElements[nextIndex]?.focus();
          setFocusManagement(prev => ({ ...prev, currentFocusIndex: nextIndex }));
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const newIndex = Math.max(0, Math.min(focusableElements.length - 1, currentFocusIndex + direction));
        
        focusableElements[newIndex]?.focus();
        setFocusManagement(prev => ({ ...prev, currentFocusIndex: newIndex }));
        break;
        
      case 'Home':
        event.preventDefault();
        focusableElements[0]?.focus();
        setFocusManagement(prev => ({ ...prev, currentFocusIndex: 0 }));
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = focusableElements.length - 1;
        focusableElements[lastIndex]?.focus();
        setFocusManagement(prev => ({ ...prev, currentFocusIndex: lastIndex }));
        break;
        
      case 'Escape':
        if (focusManagement.trapFocus) {
          setFocusManagement(prev => ({ ...prev, trapFocus: false }));
          announceToScreenReader('Navigation libre activée');
        }
        break;
    }
  }, [enableKeyboardNavigation, focusManagement, announceToScreenReader]);

  // Piège de focus pour les modales
  const enableFocusTrap = useCallback((container: HTMLElement | null) => {
    if (!container) return;
    
    updateFocusableElements(container);
    setFocusManagement(prev => ({ ...prev, trapFocus: true, currentFocusIndex: 0 }));
    
    // Focus sur le premier élément
    const firstElement = container.querySelector('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])') as HTMLElement;
    firstElement?.focus();
    
    announceToScreenReader('Mode navigation restreinte activé. Utilisez Tab pour naviguer, Échap pour quitter.');
  }, [updateFocusableElements, announceToScreenReader]);

  const disableFocusTrap = useCallback(() => {
    setFocusManagement(prev => ({ ...prev, trapFocus: false }));
    announceToScreenReader('Mode navigation libre activé');
  }, [announceToScreenReader]);

  // Génération d'ARIA labels contextuels
  const generateAriaLabel = useCallback((task: Task, context: 'card' | 'button' | 'status') => {
    const priority = task.priority === 'high' ? 'haute priorité' : 
                    task.priority === 'medium' ? 'priorité moyenne' : 'priorité basse';
    const status = task.status === 'todo' ? 'à faire' :
                  task.status === 'in-progress' ? 'en cours' :
                  task.status === 'review' ? 'en révision' : 'terminée';
    
    switch (context) {
      case 'card':
        return `Tâche ${task.title}, ${priority}, statut ${status}. ${task.description || ''}`;
      case 'button':
        return `Modifier la tâche ${task.title}`;
      case 'status':
        return `Changer le statut de ${task.title}, actuellement ${status}`;
      default:
        return task.title;
    }
  }, []);

  // Détection des préférences d'accessibilité du système
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)')
    };

    const handleMediaChange = () => {
      // Appliquer les préférences système
      if (mediaQueries.reducedMotion.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      }
      
      if (mediaQueries.highContrast.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    // Écouter les changements
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', handleMediaChange);
    });

    // Appliquer initialement
    handleMediaChange();

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', handleMediaChange);
      });
    };
  }, []);

  // Annonces spécifiques pour les actions Kanban
  const announceTaskAction = useCallback((action: string, task: Task, newStatus?: string) => {
    let message = '';
    
    switch (action) {
      case 'moved':
        message = `Tâche "${task.title}" déplacée vers ${newStatus}`;
        break;
      case 'created':
        message = `Nouvelle tâche "${task.title}" créée`;
        break;
      case 'updated':
        message = `Tâche "${task.title}" mise à jour`;
        break;
      case 'deleted':
        message = `Tâche "${task.title}" supprimée`;
        break;
      case 'completed':
        message = `Tâche "${task.title}" marquée comme terminée`;
        break;
      default:
        message = `Action ${action} effectuée sur la tâche "${task.title}"`;
    }
    
    announceToScreenReader(message, 'polite');
  }, [announceToScreenReader]);

  // Composant d'annonce pour lecteurs d'écran
  const ScreenReaderAnnouncement = () => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {screenReaderText}
    </div>
  );

  return {
    announceToScreenReader,
    announceTaskAction,
    generateAriaLabel,
    handleKeyboardNavigation,
    updateFocusableElements,
    enableFocusTrap,
    disableFocusTrap,
    focusManagement,
    ScreenReaderAnnouncement
  };
};

// Hook pour la gestion des raccourcis clavier accessibles
export const useAccessibleShortcuts = () => {
  const [activeShortcuts, setActiveShortcuts] = useState<Map<string, () => void>>(new Map());

  const registerShortcut = useCallback((key: string, callback: () => void, description: string) => {
    setActiveShortcuts(prev => new Map(prev.set(key, callback)));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setActiveShortcuts(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = `${event.ctrlKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.key}`;
    const callback = activeShortcuts.get(key);
    
    if (callback) {
      event.preventDefault();
      callback();
    }
  }, [activeShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    registerShortcut,
    unregisterShortcut,
    activeShortcuts: Array.from(activeShortcuts.keys())
  };
};