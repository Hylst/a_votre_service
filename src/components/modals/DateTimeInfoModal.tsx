/**
 * DateTimeInfoModal.tsx
 * Modal component displaying detailed information about date and time calculation functionality
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
  Calendar,
  Clock,
  Calculator,
  Globe,
  History,
  Plus,
  Minus,
  Timer
} from 'lucide-react';

interface DateTimeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dateTimeInfo = [
  {
    id: 'calculations',
    title: 'Calculs de Dates',
    icon: <Calculator className="w-5 h-5 text-blue-600" />,
    functions: '10+ opérations',
    description: 'Calculs précis entre dates : différences, ajouts, soustractions avec gestion des années bissextiles.',
    features: ['Différences précises', 'Ajout/Soustraction', 'Années bissextiles', 'Formats multiples']
  },
  {
    id: 'age',
    title: 'Calculateur d\'Âge Précis',
    icon: <Clock className="w-5 h-5 text-green-600" />,
    functions: '5+ formats',
    description: 'Calcul d\'âge exact en années, mois, jours, heures, minutes et secondes depuis la naissance.',
    features: ['Âge exact', 'Multiples unités', 'Temps vécu', 'Statistiques détaillées']
  },
  {
    id: 'planning',
    title: 'Planification Avancée',
    icon: <Calendar className="w-5 h-5 text-purple-600" />,
    functions: '15+ outils',
    description: 'Outils de planification : jours ouvrables, weekends, vacances, échéances et délais.',
    features: ['Jours ouvrables', 'Échéances', 'Délais projet', 'Calendrier intelligent']
  },
  {
    id: 'timezones',
    title: 'Fuseaux Horaires',
    icon: <Globe className="w-5 h-5 text-orange-600" />,
    functions: '400+ zones',
    description: 'Conversion entre fuseaux horaires mondiaux avec gestion automatique de l\'heure d\'été.',
    features: ['Conversion mondiale', 'Heure d\'été', 'Zones principales', 'Synchronisation']
  },
  {
    id: 'history',
    title: 'Historique Temporel',
    icon: <History className="w-5 h-5 text-teal-600" />,
    functions: 'Illimité',
    description: 'Sauvegarde de tous vos calculs temporels avec possibilité de réutilisation et export.',
    features: ['Sauvegarde auto', 'Réutilisation', 'Export données', 'Recherche rapide']
  }
];

const operationCategories = [
  {
    category: 'Opérations de Base',
    icon: <Plus className="w-4 h-4 text-blue-600" />,
    operations: ['Différence entre dates', 'Ajouter des jours/mois/années', 'Soustraire du temps', 'Calcul de durée', 'Jours écoulés', 'Semaines restantes']
  },
  {
    category: 'Calculs d\'Âge',
    icon: <Clock className="w-4 h-4 text-green-600" />,
    operations: ['Âge exact', 'Temps vécu total', 'Prochains anniversaires', 'Âge en différentes unités', 'Statistiques de vie', 'Comparaisons d\'âges']
  },
  {
    category: 'Planification',
    icon: <Calendar className="w-4 h-4 text-purple-600" />,
    operations: ['Jours ouvrables', 'Délais de projet', 'Échéances importantes', 'Calendrier de travail', 'Vacances et congés', 'Planning optimal']
  },
  {
    category: 'Fuseaux Horaires',
    icon: <Globe className="w-4 h-4 text-orange-600" />,
    operations: ['Conversion mondiale', 'Heure locale/UTC', 'Décalage horaire', 'Heure d\'été auto', 'Zones principales', 'Synchronisation équipes']
  }
];

export const DateTimeInfoModal: React.FC<DateTimeInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Dates & Temps - Fonctionnalités Complètes
          </DialogTitle>
          <DialogDescription>
            Découvrez tous les outils de calcul temporel, planification et gestion des fuseaux horaires
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Types d'Outils */}
          <div className="grid gap-4 md:grid-cols-2">
            {dateTimeInfo.map((tool) => (
              <Card key={tool.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {tool.icon}
                    {tool.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {tool.functions}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, index) => (
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
          <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                Fonctionnalités Avancées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600">Précision Maximale</Badge>
                  <span className="text-sm">Calculs précis au niveau de la seconde</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Années Bissextiles</Badge>
                  <span className="text-sm">Gestion automatique des années bissextiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">Interface Intuitive</Badge>
                  <span className="text-sm">Saisie facile avec calendriers visuels</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600">Formats Multiples</Badge>
                  <span className="text-sm">Support de tous les formats de date</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-600">Export Intelligent</Badge>
                  <span className="text-sm">Sauvegarde et partage des résultats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600">Temps Réel</Badge>
                  <span className="text-sm">Mise à jour automatique des calculs</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cas d'Usage */}
          <Card className="border-2 border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-200">
                Cas d'Usage Principaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="text-center">
                  <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Gestion de Projet</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Calcul de délais, échéances et planification</p>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Équipes Internationales</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Coordination entre fuseaux horaires</p>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Événements Personnels</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Anniversaires, âges et dates importantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};