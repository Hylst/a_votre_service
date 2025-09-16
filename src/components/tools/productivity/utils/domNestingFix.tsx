/**
 * domNestingFix.tsx
 * Utilitaires pour corriger les erreurs de nesting DOM dans les composants de productivité
 * Résout l'erreur: validateDOMNesting(...): <div> cannot appear as a descendant of <p>
 */

import React from 'react';

/**
 * Composant wrapper sécurisé pour éviter les erreurs de nesting DOM
 * Utilise un span au lieu d'un div quand il est dans un contexte de paragraphe
 */
export const SafeWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'span';
  onClick?: () => void;
}> = ({ children, className, as = 'div', onClick }) => {
  const Component = as as keyof JSX.IntrinsicElements;
  return React.createElement(Component, { className, onClick }, children);
};

/**
 * Composant texte sécurisé qui évite les imbrications problématiques
 */
export const SafeText: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'p' | 'span' | 'div';
}> = ({ children, className, variant = 'span' }) => {
  const Component = variant as keyof JSX.IntrinsicElements;
  return React.createElement(Component, { className }, children);
};

/**
 * Composant conteneur flexible qui s'adapte au contexte
 */
export const FlexibleContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}> = ({ children, className, inline = false }) => {
  const Component = (inline ? 'span' : 'div') as keyof JSX.IntrinsicElements;
  return React.createElement(Component, { className }, children);
};

/**
 * Hook pour détecter le contexte de nesting et choisir l'élément approprié
 */
export const useContextualElement = (preferredElement: 'div' | 'span' = 'div') => {
  // Retourne l'élément préféré par défaut
  // Dans une implémentation plus avancée, on pourrait détecter le contexte parent
  return preferredElement;
};

/**
 * Fonction pour nettoyer la structure HTML et éviter les erreurs de nesting
 */
export const sanitizeHtmlStructure = (element: React.ReactElement): React.ReactElement => {
  // Implémentation basique - retourne l'élément tel quel
  // Dans une version plus avancée, on pourrait analyser et corriger la structure
  return element;
};

/**
 * Composant Badge sécurisé qui utilise span au lieu de div
 */
export const SafeBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
}> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background text-foreground'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Composant CardContent sécurisé
 */
export const SafeCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Règles de nesting DOM pour validation
 */
export const DOM_NESTING_RULES = {
  // Éléments qui ne peuvent pas contenir de div
  INLINE_ELEMENTS: ['p', 'span', 'a', 'strong', 'em', 'code'],
  
  // Éléments qui peuvent contenir des div
  BLOCK_ELEMENTS: ['div', 'section', 'article', 'main', 'aside', 'header', 'footer'],
  
  // Vérifie si un élément parent peut contenir un div
  canContainDiv: (parentElement: string): boolean => {
    return !DOM_NESTING_RULES.INLINE_ELEMENTS.includes(parentElement);
  },
  
  // Retourne l'élément approprié selon le contexte parent
  getAppropriateElement: (parentElement: string, preferredElement: 'div' | 'span' = 'div'): 'div' | 'span' => {
    if (DOM_NESTING_RULES.INLINE_ELEMENTS.includes(parentElement)) {
      return 'span';
    }
    return preferredElement;
  }
};

/**
 * Composant de débogage pour identifier les problèmes de nesting
 */
export const NestingDebugger: React.FC<{
  children: React.ReactNode;
  elementType?: string;
  debug?: boolean;
}> = ({ children, elementType = 'unknown', debug = false }) => {
  if (debug) {
    console.log(`NestingDebugger: Element type ${elementType}`);
  }
  return <>{children}</>;
};

/**
 * Types pour les propriétés des composants sécurisés
 */
export type SafeElementProps = {
  children: React.ReactNode;
  className?: string;
};

export type FlexibleElementProps = SafeElementProps & {
  as?: keyof JSX.IntrinsicElements;
  inline?: boolean;
};

/**
 * Classes CSS sécurisées pour éviter les problèmes de layout
 */
export const SAFE_CLASSES = {
  FLEX_CONTAINER: 'flex items-center gap-2',
  FLEX_COLUMN: 'flex flex-col gap-2',
  TEXT_MUTED: 'text-muted-foreground',
  TEXT_SMALL: 'text-sm',
  INLINE_FLEX: 'inline-flex items-center gap-1'
} as const;

/**
 * Utilitaire pour créer des composants adaptatifs selon le contexte
 */
export const createContextualComponent = <T extends keyof JSX.IntrinsicElements>(
  defaultElement: T,
  inlineElement: T
) => {
  return React.forwardRef<
    React.ElementRef<T>,
    React.ComponentPropsWithoutRef<T> & { inline?: boolean }
  >(({ inline = false, ...props }, ref) => {
    const Component = inline ? inlineElement : defaultElement;
    return React.createElement(Component, { ref, ...props });
  });
};

/**
 * Composant Container adaptatif
 */
export const AdaptiveContainer = createContextualComponent('div', 'span');

/**
 * Composant Text adaptatif
 */
export const AdaptiveText = createContextualComponent('p', 'span');