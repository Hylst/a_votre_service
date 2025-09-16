/**
 * KeyboardShortcutsHelp.tsx
 * Component that displays available keyboard shortcuts for productivity tools
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: ShortcutItem[];
  className?: string;
}

/**
 * Composant d'aide pour les raccourcis clavier
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  className
}) => {
  // Grouper les raccourcis par catégorie
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  /**
   * Formate les touches pour l'affichage
   */
  const formatKeys = (keys: string[]): string => {
    return keys.join(' + ');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label="Afficher les raccourcis clavier"
        >
          <Keyboard className="h-4 w-4" />
          <HelpCircle className="h-4 w-4" />
          Raccourcis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier disponibles
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                {category}
              </h3>
              <div className="grid gap-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                  >
                    <span className="text-card-foreground font-medium">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs px-2 py-1 bg-secondary text-secondary-foreground"
                          >
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Astuce :</strong> Ces raccourcis fonctionnent uniquement lorsque vous êtes sur la page de l'outil correspondant.
            Utilisez <Badge variant="outline" className="mx-1 font-mono">?</Badge> pour afficher cette aide à tout moment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Raccourcis par défaut pour Kanban
 */
export const getKanbanShortcutsHelp = (): ShortcutItem[] => [
  {
    keys: ['Ctrl', 'N'],
    description: 'Ajouter une nouvelle tâche',
    category: 'Gestion des tâches'
  },
  {
    keys: ['Ctrl', 'M'],
    description: 'Afficher/Masquer les métriques',
    category: 'Affichage'
  },
  {
    keys: ['Ctrl', 'E'],
    description: 'Exporter en PDF',
    category: 'Export'
  },
  {
    keys: ['Ctrl', 'Shift', 'E'],
    description: 'Exporter en CSV',
    category: 'Export'
  },
  {
    keys: ['Ctrl', 'F'],
    description: 'Rechercher dans les tâches',
    category: 'Navigation'
  },
  {
    keys: ['?'],
    description: 'Afficher cette aide',
    category: 'Aide'
  }
];

/**
 * Raccourcis par défaut pour Eisenhower
 */
export const getEisenhowerShortcutsHelp = (): ShortcutItem[] => [
  {
    keys: ['Ctrl', 'N'],
    description: 'Ajouter une nouvelle tâche',
    category: 'Gestion des tâches'
  },
  {
    keys: ['Ctrl', 'A'],
    description: 'Afficher/Masquer les analytiques',
    category: 'Affichage'
  },
  {
    keys: ['Ctrl', 'E'],
    description: 'Exporter en PDF',
    category: 'Export'
  },
  {
    keys: ['Ctrl', 'Shift', 'E'],
    description: 'Exporter en CSV',
    category: 'Export'
  },
  {
    keys: ['Ctrl', 'F'],
    description: 'Rechercher dans les tâches',
    category: 'Navigation'
  },
  {
    keys: ['1'],
    description: 'Sélectionner quadrant Urgent & Important',
    category: 'Quadrants'
  },
  {
    keys: ['2'],
    description: 'Sélectionner quadrant Important & Non-urgent',
    category: 'Quadrants'
  },
  {
    keys: ['3'],
    description: 'Sélectionner quadrant Urgent & Non-important',
    category: 'Quadrants'
  },
  {
    keys: ['4'],
    description: 'Sélectionner quadrant Non-urgent & Non-important',
    category: 'Quadrants'
  },
  {
    keys: ['?'],
    description: 'Afficher cette aide',
    category: 'Aide'
  }
];

export default KeyboardShortcutsHelp;