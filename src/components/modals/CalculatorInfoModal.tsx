/**
 * CalculatorInfoModal.tsx
 * Modal component displaying detailed information about calculator functionality
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
import {
  Calculator,
  Sigma,
  Binary,
  TrendingUp,
  History,
  Plus,
  Minus,
  X,
  Divide
} from 'lucide-react';

interface CalculatorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const calculatorInfo = [
  {
    id: 'basic',
    title: 'Calculatrice Basique',
    icon: <Calculator className="w-5 h-5 text-blue-600" />,
    functions: '15+ fonctions',
    description: 'Opérations arithmétiques de base : addition, soustraction, multiplication, division, pourcentages.',
    features: ['Interface intuitive', 'Historique des calculs', 'Raccourcis clavier']
  },
  {
    id: 'scientific',
    title: 'Calculatrice Scientifique',
    icon: <Sigma className="w-5 h-5 text-green-600" />,
    functions: '50+ fonctions',
    description: 'Fonctions avancées : trigonométrie, logarithmes, exponentielles, factorielles, constantes.',
    features: ['Fonctions trigonométriques', 'Logarithmes & exponentielles', 'Constantes mathématiques']
  },
  {
    id: 'programmer',
    title: 'Calculatrice Programmeur',
    icon: <Binary className="w-5 h-5 text-purple-600" />,
    functions: '20+ fonctions',
    description: 'Conversions entre bases numériques : binaire, octal, décimal, hexadécimal. Opérations bit à bit.',
    features: ['Bases numériques', 'Opérations binaires', 'Conversion instantanée']
  },
  {
    id: 'graphing',
    title: 'Calculatrice Graphique',
    icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
    functions: '30+ fonctions',
    description: 'Tracé de fonctions mathématiques, analyse graphique, zoom et navigation interactive.',
    features: ['Tracé de fonctions', 'Zoom interactif', 'Analyse graphique']
  },
  {
    id: 'history',
    title: 'Historique des Calculs',
    icon: <History className="w-5 h-5 text-teal-600" />,
    functions: 'Illimité',
    description: 'Sauvegarde automatique de tous vos calculs avec possibilité de réutilisation et export.',
    features: ['Sauvegarde automatique', 'Réutilisation facile', 'Export des données']
  }
];

const operationCategories = [
  {
    category: 'Opérations de Base',
    icon: <Plus className="w-4 h-4 text-blue-600" />,
    operations: ['Addition (+)', 'Soustraction (-)', 'Multiplication (×)', 'Division (÷)', 'Pourcentage (%)', 'Racine carrée (√)']
  },
  {
    category: 'Fonctions Scientifiques',
    icon: <Sigma className="w-4 h-4 text-green-600" />,
    operations: ['sin, cos, tan', 'log, ln', 'exp, pow', 'Factorielle (!)', 'Constantes (π, e)', 'Fonctions hyperboliques']
  },
  {
    category: 'Programmation',
    icon: <Binary className="w-4 h-4 text-purple-600" />,
    operations: ['Binaire (BIN)', 'Octal (OCT)', 'Décimal (DEC)', 'Hexadécimal (HEX)', 'AND, OR, XOR', 'Décalages de bits']
  },
  {
    category: 'Fonctions Graphiques',
    icon: <TrendingUp className="w-4 h-4 text-orange-600" />,
    operations: ['Tracé 2D', 'Fonctions polynomiales', 'Fonctions trigonométriques', 'Zoom et pan', 'Points d\'intersection', 'Analyse de courbes']
  }
];

export const CalculatorInfoModal: React.FC<CalculatorInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            Calculatrices Professionnelles - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Découvrez toutes les fonctionnalités et capacités de nos 5 types de calculatrices
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Types de Calculatrices */}
          <div className="grid gap-4 md:grid-cols-2">
            {calculatorInfo.map((calculator) => (
              <Card key={calculator.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {calculator.icon}
                    {calculator.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {calculator.functions}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {calculator.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {calculator.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Catégories d'Opérations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Opérations et Fonctions Disponibles
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {operationCategories.map((category, index) => (
                <Card key={index} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-1">
                      {category.operations.map((operation, opIndex) => (
                        <div key={opIndex} className="text-sm text-gray-600 dark:text-gray-300">
                          • {operation}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Fonctionnalités Générales */}
          <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Fonctionnalités Générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Raccourcis Clavier</Badge>
                  <span className="text-sm">Support complet du clavier pour une saisie rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600">Historique Intelligent</Badge>
                  <span className="text-sm">Sauvegarde et réutilisation des calculs précédents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">Interface Adaptative</Badge>
                  <span className="text-sm">S'adapte automatiquement au type de calcul</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600">Précision Élevée</Badge>
                  <span className="text-sm">Calculs avec une précision de 15 décimales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-600">Export de Données</Badge>
                  <span className="text-sm">Exportation des résultats et graphiques</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-600">Mode Sombre</Badge>
                  <span className="text-sm">Interface optimisée pour tous les environnements</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};