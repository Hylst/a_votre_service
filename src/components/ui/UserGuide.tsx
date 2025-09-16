/**
 * UserGuide.tsx - Composant réutilisable pour afficher les modes d'emploi et conseils
 * Affiche des guides contextuels en bas de chaque outil de la suite Organisation productive
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Zap,
  CheckCircle2,
  Star,
  ArrowRight
} from 'lucide-react';

export interface GuideSection {
  title: string;
  content: string[];
  icon?: React.ReactNode;
  type: 'instruction' | 'tip' | 'shortcut' | 'best-practice';
}

export interface UserGuideProps {
  toolName: string;
  toolIcon?: React.ReactNode;
  sections: GuideSection[];
  quickTips?: string[];
  shortcuts?: { key: string; description: string }[];
  className?: string;
}

/**
 * Composant UserGuide - Affiche un guide d'utilisation contextuel
 * @param toolName - Nom de l'outil
 * @param toolIcon - Icône de l'outil
 * @param sections - Sections du guide (instructions, conseils, etc.)
 * @param quickTips - Conseils rapides
 * @param shortcuts - Raccourcis clavier
 * @param className - Classes CSS additionnelles
 */
export const UserGuide: React.FC<UserGuideProps> = ({
  toolName,
  toolIcon,
  sections,
  quickTips = [],
  shortcuts = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fonction pour obtenir l'icône selon le type de section
  const getSectionIcon = (type: GuideSection['type']) => {
    switch (type) {
      case 'instruction':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'shortcut':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'best-practice':
        return <Target className="w-4 h-4 text-green-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Fonction pour obtenir la couleur du badge selon le type
  const getSectionBadgeColor = (type: GuideSection['type']) => {
    switch (type) {
      case 'instruction':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'tip':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'shortcut':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'best-practice':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Card className={`mt-6 border-dashed border-2 bg-card text-card-foreground ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                {toolIcon || <HelpCircle className="w-5 h-5 text-primary" />}
                <span>Mode d'emploi - {toolName}</span>
                <Badge variant="outline" className="ml-2">
                  Guide & Conseils
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Conseils rapides */}
            {quickTips.length > 0 && (
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-600" />
                  <h4 className="font-medium text-sm">Conseils rapides</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {quickTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sections du guide */}
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {section.icon || getSectionIcon(section.type)}
                    <h4 className="font-medium text-sm">{section.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getSectionBadgeColor(section.type)}`}
                    >
                      {section.type === 'instruction' && 'Mode d\'emploi'}
                      {section.type === 'tip' && 'Astuce'}
                      {section.type === 'shortcut' && 'Raccourci'}
                      {section.type === 'best-practice' && 'Bonne pratique'}
                    </Badge>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Raccourcis clavier */}
            {shortcuts.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-sm">Raccourcis clavier</h4>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded text-sm">
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {shortcut.key}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            
            {/* Footer avec encouragement */}
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Astuce :</strong> Utilisez ces fonctionnalités pour maximiser votre productivité !
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default UserGuide;