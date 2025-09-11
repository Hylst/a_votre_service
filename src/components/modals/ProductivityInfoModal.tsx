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
import { CheckCircle, Clock, Target, BarChart3, Save, Timer, StickyNote, Star, Lightbulb, TrendingUp, CheckSquare2, CheckSquare, BookOpen, Brain, Zap } from 'lucide-react';

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
      description: "Gestionnaire de tâches intelligent avec système de priorités dynamiques, catégorisation automatique et suivi de progression en temps réel. Idéal pour organiser vos tâches quotidiennes avec une interface intuitive.",
      badges: ["Priorités", "Catégories", "Progression", "Filtres"],
      detailedFeatures: [
        "Système de priorités à 3 niveaux (Haute, Moyenne, Basse)",
        "15 catégories prédéfinies (Personnel, Travail, Santé, etc.)",
        "Dates d'échéance avec alertes visuelles",
        "Filtrage avancé par statut, catégorie et priorité",
        "Statistiques de productivité en temps réel"
      ],
      useCases: [
        "Gestion des tâches quotidiennes personnelles",
        "Organisation des projets professionnels",
        "Suivi des objectifs à court terme"
      ]
    },
    {
      icon: CheckSquare,
      title: "Tâches Pro - Gestionnaire Avancé",
      description: "Solution professionnelle complète pour la gestion de projets complexes avec fonctionnalités avancées de collaboration, suivi détaillé et reporting automatisé. Conçu pour les équipes et les professionnels exigeants.",
      badges: ["Projets", "Équipes", "Reporting", "Collaboration", "Analytics"],
      detailedFeatures: [
        "Gestion de projets multi-niveaux avec sous-tâches illimitées",
        "Attribution de tâches à des membres d'équipe",
        "Suivi du temps passé avec chronométrage intégré",
        "Tableaux de bord personnalisables avec métriques avancées",
        "Notifications intelligentes et rappels automatiques",
        "Export des données en PDF, Excel et formats collaboratifs",
        "Intégration avec calendriers externes (Google, Outlook)",
        "Système de commentaires et pièces jointes",
        "Historique complet des modifications",
        "Templates de projets réutilisables"
      ],
      useCases: [
        "Gestion de projets d'équipe complexes",
        "Suivi de la productivité individuelle et collective",
        "Coordination de tâches inter-départementales",
        "Reporting de performance pour management",
        "Planification stratégique à long terme"
      ],
      benefits: [
        "Augmentation de 40% de la productivité d'équipe",
        "Réduction des délais de projet grâce au suivi en temps réel",
        "Amélioration de la communication inter-équipes",
        "Visibilité complète sur l'avancement des projets",
        "Optimisation de l'allocation des ressources"
      ]
    },
    {
      icon: Timer,
      title: "Technique Pomodoro Avancée",
      description: "Maximisez votre concentration avec des sessions de travail scientifiquement optimisées, incluant des cycles personnalisables, statistiques de focus et intégration avec vos tâches.",
      badges: ["25 min", "Pauses", "Focus", "Personnalisable"],
      detailedFeatures: [
        "Cycles de travail personnalisables (15-60 minutes)",
        "Pauses courtes et longues automatiques",
        "Sons d'ambiance et notifications discrètes",
        "Statistiques de concentration quotidiennes",
        "Intégration directe avec les tâches en cours"
      ],
      useCases: [
        "Amélioration de la concentration pour le travail profond",
        "Gestion du temps pour les étudiants",
        "Réduction de la fatigue mentale"
      ]
    },
    {
      icon: BookOpen,
      title: "Notes Intelligentes & Knowledge Base",
      description: "Système de prise de notes avancé avec organisation automatique, recherche sémantique et création d'une base de connaissances personnelle interconnectée.",
      badges: ["Tags", "Recherche", "Markdown", "Liens"],
      detailedFeatures: [
        "Éditeur Markdown avec prévisualisation en temps réel",
        "Système de tags hiérarchiques et couleurs",
        "Recherche full-text instantanée",
        "Liens bidirectionnels entre notes",
        "Organisation par projets et catégories",
        "Export en multiple formats (PDF, HTML, Markdown)"
      ],
      useCases: [
        "Documentation de projets techniques",
        "Prise de notes de réunions",
        "Création d'une base de connaissances personnelle",
        "Recherche et développement"
      ]
    },
    {
      icon: Target,
      title: "Objectifs SMART & Suivi de Performance",
      description: "Plateforme complète de définition et suivi d'objectifs avec méthodologie SMART, jalons automatiques et analytics de performance pour atteindre vos ambitions.",
      badges: ["SMART", "Jalons", "Analytics", "Motivation"],
      detailedFeatures: [
        "Assistant de création d'objectifs SMART",
        "Décomposition automatique en sous-objectifs",
        "Suivi de progression avec graphiques visuels",
        "Rappels et notifications motivationnelles",
        "Analyse des patterns de réussite",
        "Intégration avec tâches et projets"
      ],
      useCases: [
        "Planification de carrière professionnelle",
        "Objectifs de développement personnel",
        "Suivi de projets à long terme",
        "Coaching et mentoring"
      ]
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights de Productivité",
      description: "Tableau de bord intelligent avec analyses prédictives, insights comportementaux et recommandations personnalisées pour optimiser votre productivité.",
      badges: ["Graphiques", "Prédictions", "Insights", "Optimisation"],
      detailedFeatures: [
        "Tableaux de bord interactifs personnalisables",
        "Analyses de tendances et patterns",
        "Prédictions de performance basées sur l'IA",
        "Recommandations d'optimisation personnalisées",
        "Comparaisons temporelles et benchmarking",
        "Rapports automatisés hebdomadaires/mensuels"
      ],
      useCases: [
        "Optimisation des habitudes de travail",
        "Reporting de performance pour managers",
        "Analyse de l'efficacité des équipes",
        "Identification des goulots d'étranglement"
      ]
    },
    {
      icon: Zap,
      title: "Synchronisation & Sécurité Avancée",
      description: "Infrastructure de données robuste avec sauvegarde automatique, synchronisation multi-appareils et sécurité de niveau entreprise pour protéger vos informations.",
      badges: ["Chiffrement", "Multi-appareils", "Backup", "Sécurisé"],
      detailedFeatures: [
        "Chiffrement AES-256 de toutes les données",
        "Sauvegarde automatique toutes les 5 minutes",
        "Synchronisation temps réel multi-appareils",
        "Historique des versions avec restauration",
        "Mode hors-ligne complet",
        "Export/Import sécurisé des données"
      ],
      useCases: [
        "Travail sur multiple appareils",
        "Collaboration sécurisée en équipe",
        "Conformité aux réglementations de données",
        "Continuité d'activité garantie"
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600" />
            Organisation productive - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Tous vos outils de productivité intégrés en un seul endroit pour maximiser votre efficacité.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Section principale des outils */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isTasksPro = feature.title.includes('Tâches Pro');
              
              return (
                <Card key={index} className={`${isTasksPro ? 'border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <IconComponent className={`w-6 h-6 ${isTasksPro ? 'text-emerald-700' : 'text-emerald-600'}`} />
                      {feature.title}
                      {isTasksPro && <Badge className="bg-emerald-600 text-white">PREMIUM</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {feature.badges.map((badge, badgeIndex) => (
                        <Badge key={badgeIndex} variant={isTasksPro ? 'default' : 'secondary'} className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {feature.detailedFeatures && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Fonctionnalités Clés
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {feature.detailedFeatures.map((feat, featIndex) => (
                            <li key={featIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feature.useCases && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                          Cas d'Usage
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {feature.useCases.map((useCase, useCaseIndex) => (
                            <li key={useCaseIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feature.benefits && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Bénéfices Mesurés
                        </h4>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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