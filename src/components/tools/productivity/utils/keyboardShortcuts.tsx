/**
 * keyboardShortcuts.ts - Keyboard shortcuts and accessibility utilities
 * Provides keyboard navigation and shortcuts for productivity tools
 */

import { useEffect, useCallback } from 'react';

/**
 * Interface pour les raccourcis clavier
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook pour gérer les raccourcis clavier
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Raccourcis clavier pour le Kanban
 */
export const getKanbanShortcuts = ({
  onAddTask,
  onToggleMetrics,
  onExportPDF,
  onExportCSV,
  onFocusSearch
}: {
  onAddTask: () => void;
  onToggleMetrics: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onFocusSearch: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrlKey: true,
    action: onAddTask,
    description: 'Ajouter une nouvelle tâche'
  },
  {
    key: 'm',
    ctrlKey: true,
    action: onToggleMetrics,
    description: 'Afficher/masquer les métriques'
  },
  {
    key: 'e',
    ctrlKey: true,
    shiftKey: true,
    action: onExportPDF,
    description: 'Exporter en PDF'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: onExportCSV,
    description: 'Exporter en CSV'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: onFocusSearch,
    description: 'Rechercher dans les tâches'
  }
];

/**
 * Raccourcis clavier pour la matrice d'Eisenhower
 */
export const getEisenhowerShortcuts = ({
  onAddTask,
  onToggleAnalytics,
  onExportPDF,
  onExportCSV,
  onFocusSearch
}: {
  onAddTask: () => void;
  onToggleAnalytics: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onFocusSearch: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrlKey: true,
    action: onAddTask,
    description: 'Ajouter une nouvelle tâche'
  },
  {
    key: 'a',
    ctrlKey: true,
    action: onToggleAnalytics,
    description: 'Afficher/masquer les analytiques'
  },
  {
    key: 'e',
    ctrlKey: true,
    shiftKey: true,
    action: onExportPDF,
    description: 'Exporter en PDF'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: onExportCSV,
    description: 'Exporter en CSV'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: onFocusSearch,
    description: 'Rechercher dans les tâches'
  }
];

/**
 * Utilitaires d'accessibilité
 */
export const AccessibilityUtils = {
  /**
   * Annonce un message aux lecteurs d'écran
   */
  announceToScreenReader: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Gère la navigation au clavier dans une liste
   */
  handleListNavigation: (
    event: React.KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onSelect: (index: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onSelect(currentIndex < itemCount - 1 ? currentIndex + 1 : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        onSelect(currentIndex > 0 ? currentIndex - 1 : itemCount - 1);
        break;
      case 'Home':
        event.preventDefault();
        onSelect(0);
        break;
      case 'End':
        event.preventDefault();
        onSelect(itemCount - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Action à définir selon le contexte
        break;
    }
  },

  /**
   * Génère un ID unique pour l'accessibilité
   */
  generateA11yId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Attributs ARIA pour les éléments interactifs
   */
  getInteractiveAttributes: ({
    role,
    label,
    describedBy,
    expanded,
    selected
  }: {
    role?: string;
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
  }) => ({
    role,
    'aria-label': label,
    'aria-describedby': describedBy,
    'aria-expanded': expanded,
    'aria-selected': selected,
    tabIndex: 0
  })
};

/**
 * Hook pour gérer le focus et la navigation au clavier
 */
export const useFocusManagement = () => {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, []);

  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return { focusElement, trapFocus };
};

/**
 * Utilitaire pour formater les raccourcis clavier en données
 */
export const formatShortcutsForDisplay = (shortcuts: KeyboardShortcut[]) => {
  return shortcuts.map((shortcut, index) => ({
    id: index,
    description: shortcut.description,
    keys: [
      ...(shortcut.ctrlKey ? ['Ctrl'] : []),
      ...(shortcut.shiftKey ? ['Shift'] : []),
      ...(shortcut.altKey ? ['Alt'] : []),
      shortcut.key.toUpperCase()
    ]
  }));
};

/**
 * Génère le texte d'aide pour les raccourcis clavier
 */
export const getShortcutHelpText = (shortcut: KeyboardShortcut): string => {
  const keys = [];
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.shiftKey) keys.push('Shift');
  if (shortcut.altKey) keys.push('Alt');
  keys.push(shortcut.key.toUpperCase());
  
  return `${keys.join(' + ')}: ${shortcut.description}`;
};