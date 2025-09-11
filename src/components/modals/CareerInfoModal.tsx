/**
 * CareerInfoModal.tsx
 * Modal component displaying detailed information about career/professional functionality
 */

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
import { Briefcase, Bot, TrendingUp, MessageSquare, FileText, Users, Target, DollarSign, Sparkles } from 'lucide-react';

interface CareerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareerInfoModal: React.FC<CareerInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      title: "Coach IA Personnel",
      description: "Accompagnement intelligent pour votre développement professionnel",
      details: [
        "Conseils personnalisés basés sur votre profil",
        "Analyse de vos compétences et lacunes",
        "Plans de développement sur mesure",
        "Suivi de progression automatique"
      ]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Intelligence du Marché",
      description: "Analyses et tendances du marché de l'emploi",
      details: [
        "Tendances salariales par secteur",
        "Compétences les plus demandées",
        "Opportunités émergentes",
        "Analyses géographiques"
      ]
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Préparation d'Entretiens",
      description: "Entraînez-vous avec des simulations réalistes",
      details: [
        "Questions fréquentes par secteur",
        "Simulations d'entretiens IA",
        "Feedback détaillé sur vos réponses",
        "Conseils de présentation"
      ]
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      title: "Générateur de Documents",
      description: "Créez des CV et lettres de motivation percutants",
      details: [
        "Templates professionnels modernes",
        "Optimisation ATS automatique",
        "Personnalisation par secteur",
        "Export multi-formats"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "Outils de Networking",
      description: "Développez votre réseau professionnel efficacement",
      details: [
        "Stratégies de networking ciblées",
        "Templates de messages LinkedIn",
        "Suivi de vos contacts",
        "Conseils d'approche personnalisés"
      ]
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "Développement des Compétences",
      description: "Identifiez et développez vos compétences clés",
      details: [
        "Évaluation de compétences complète",
        "Recommandations de formation",
        "Suivi de progression",
        "Certification de compétences"
      ]
    },
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
      title: "Négociation Salariale",
      description: "Maximisez votre potentiel de rémunération",
      details: [
        "Benchmarks salariaux précis",
        "Stratégies de négociation",
        "Simulateur de négociation",
        "Conseils de timing optimal"
      ]
    }
  ];

  const advantages = [
    "Interface intuitive et professionnelle",
    "IA avancée pour des conseils personnalisés",
    "Base de données actualisée en temps réel",
    "Outils collaboratifs intégrés",
    "Suivi de progression détaillé",
    "Export et partage facilités"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Suite Carrière/Pro - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Une suite complète d'outils professionnels pour booster votre carrière.
            De la recherche d'emploi à la négociation salariale, tout pour réussir.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Fonctionnalités principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Fonctionnalités Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      {feature.icon}
                      <span>{feature.title}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Avantages Clés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                  <span className="text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges de fonctionnalités */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technologies & Fonctionnalités</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Intelligence Artificielle</Badge>
              <Badge variant="secondary">Analyse Prédictive</Badge>
              <Badge variant="secondary">Données Temps Réel</Badge>
              <Badge variant="secondary">Personnalisation Avancée</Badge>
              <Badge variant="secondary">Export Multi-formats</Badge>
              <Badge variant="secondary">Intégration LinkedIn</Badge>
              <Badge variant="secondary">Suivi de Performance</Badge>
              <Badge variant="secondary">Conseils Personnalisés</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CareerInfoModal;