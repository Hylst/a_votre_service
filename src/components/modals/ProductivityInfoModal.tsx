import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckSquare2, CheckSquare, Timer, BookOpen, Target, TrendingUp, Zap } from 'lucide-react';

interface ProductivityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductivityInfoModal: React.FC<ProductivityInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const features = [
    {
      icon: CheckSquare2,
      title: "To-Do List Avancée",
      description: "Gestionnaire de tâches intelligent avec priorités, catégories et suivi de progression.",
      badges: ["Priorités", "Catégories", "Progression"]
    },
    {
      icon: CheckSquare,
      title: "Gestionnaire de Tâches Pro",
      description: "Organisez efficacement vos tâches avec priorités et catégories avancées.",
      badges: ["Organisation", "Efficacité", "Suivi"]
    },
    {
      icon: Timer,
      title: "Technique Pomodoro",
      description: "Boostez votre concentration avec des sessions de travail chronométrées et des pauses optimisées.",
      badges: ["25 min", "Pauses", "Focus"]
    },
    {
      icon: BookOpen,
      title: "Notes Intelligentes",
      description: "Prenez des notes organisées avec système de tags et recherche avancée.",
      badges: ["Tags", "Recherche", "Organisation"]
    },
    {
      icon: Target,
      title: "Objectifs SMART",
      description: "Définissez et suivez vos objectifs avec la méthodologie SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel).",
      badges: ["SMART", "Suivi", "Réalisation"]
    },
    {
      icon: TrendingUp,
      title: "Statistiques Détaillées",
      description: "Analysez votre productivité avec des graphiques et métriques avancées.",
      badges: ["Graphiques", "Métriques", "Analyse"]
    },
    {
      icon: Zap,
      title: "Sauvegarde Locale",
      description: "Toutes vos données sont synchronisées et sauvegardées localement pour une sécurité maximale.",
      badges: ["Sécurisé", "Local", "Sync"]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600" />
            Suite Productivité - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Tous vos outils de productivité intégrés en un seul endroit pour maximiser votre efficacité.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconComponent className="w-5 h-5 text-emerald-600" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {feature.badges.map((badge, badgeIndex) => (
                        <Badge key={badgeIndex} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">Avantages de la Suite Intégrée</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Interface unifiée pour tous vos outils de productivité</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Synchronisation automatique entre tous les modules</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Données sauvegardées localement pour une sécurité maximale</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Statistiques globales de votre productivité</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};