/**
 * UnitConverterInfoModal.tsx
 * Modal component displaying detailed information about unit converter functionality
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
  Scale,
  Thermometer,
  DollarSign,
  Clock,
  Ruler,
  Weight,
  Zap,
  Fuel,
  Activity,
  Palette,
  Droplets,
  Volume
} from 'lucide-react';

interface UnitConverterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const converterInfo = [
  {
    id: 'length',
    title: 'Convertisseur de Longueurs',
    icon: <Ruler className="w-5 h-5 text-primary" />,
    units: '13 unités',
    description: 'Convertit entre mètres, kilomètres, centimètres, millimètres, pouces, pieds, yards, miles, etc.',
    features: ['Standards SI', 'Unités impériales', 'Précision élevée']
  },
  {
    id: 'weight',
    title: 'Convertisseur de Poids',
    icon: <Weight className="w-5 h-5 text-primary" />,
    units: '11 unités',
    description: 'Convertit entre grammes, kilogrammes, tonnes, livres, onces, stones, etc.',
    features: ['Système métrique', 'Système impérial', 'Conversion précise']
  },
  {
    id: 'temperature',
    title: 'Convertisseur de Température',
    icon: <Thermometer className="w-5 h-5 text-primary" />,
    units: '5 unités',
    description: 'Convertit entre Celsius, Fahrenheit, Kelvin, Rankine et Réaumur.',
    features: ['Échelles scientifiques', 'Usage quotidien', 'Formules exactes']
  },
  {
    id: 'volume',
    title: 'Convertisseur de Volume',
    icon: <Volume className="w-5 h-5 text-primary" />,
    units: '14 unités',
    description: 'Convertit entre litres, millilitres, gallons, pintes, tasses, etc.',
    features: ['Cuisine & recettes', 'Systèmes US/UK', 'Précision culinaire']
  },
  {
    id: 'area',
    title: 'Convertisseur de Surface',
    icon: <Scale className="w-5 h-5 text-primary" />,
    units: '11 unités',
    description: 'Convertit entre mètres carrés, hectares, acres, pieds carrés, etc.',
    features: ['Immobilier', 'Agriculture', 'Architecture']
  },
  {
    id: 'speed',
    title: 'Convertisseur de Vitesse',
    icon: <Activity className="w-5 h-5 text-primary" />,
    units: '7 unités',
    description: 'Convertit entre km/h, m/s, mph, nœuds, mach, etc.',
    features: ['Transport', 'Aviation', 'Marine']
  },
  {
    id: 'pressure',
    title: 'Convertisseur de Pression',
    icon: <Droplets className="w-5 h-5 text-primary" />,
    units: '10 unités',
    description: 'Convertit entre pascals, bars, atmosphères, PSI, mmHg, etc.',
    features: ['Météorologie', 'Ingénierie', 'Médical']
  },
  {
    id: 'energy',
    title: 'Convertisseur d\'Énergie',
    icon: <Fuel className="w-5 h-5 text-primary" />,
    units: '11 unités',
    description: 'Convertit entre joules, calories, kWh, BTU, etc.',
    features: ['Électricité', 'Nutrition', 'Thermodynamique']
  },
  {
    id: 'power',
    title: 'Convertisseur de Puissance',
    icon: <Zap className="w-5 h-5 text-primary" />,
    units: '8 unités',
    description: 'Convertit entre watts, kilowatts, chevaux-vapeur, BTU/h, etc.',
    features: ['Électronique', 'Automobile', 'Industrie']
  },
  {
    id: 'currency',
    title: 'Convertisseur de Devises',
    icon: <DollarSign className="w-5 h-5 text-primary" />,
    units: '12 devises',
    description: 'Convertit entre EUR, USD, GBP, JPY, CHF et autres devises majeures.',
    features: ['Taux en temps réel', 'Devises majeures', 'Commerce international']
  },
  {
    id: 'time',
    title: 'Convertisseur de Temps',
    icon: <Clock className="w-5 h-5 text-primary" />,
    units: '12 unités',
    description: 'Convertit entre secondes, minutes, heures, jours, semaines, années, etc.',
    features: ['Planification', 'Productivité', 'Calculs temporels']
  },
  {
    id: 'data',
    title: 'Convertisseur de Données',
    icon: <Palette className="w-5 h-5 text-primary" />,
    units: '12 unités',
    description: 'Convertit entre octets, Ko, Mo, Go, To et autres unités de stockage.',
    features: ['Informatique', 'Stockage', 'Réseaux']
  }
];

export const UnitConverterInfoModal: React.FC<UnitConverterInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            Convertisseurs Universels - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Découvrez toutes les fonctionnalités et capacités de nos 12 convertisseurs d'unités
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {converterInfo.map((converter) => (
              <Card key={converter.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {converter.icon}
                    {converter.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {converter.units}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {converter.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {converter.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">
                Fonctionnalités Générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Standards SI</Badge>
                  <span className="text-sm">Conformité aux standards internationaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Temps réel</Badge>
                  <span className="text-sm">Conversion instantanée pendant la saisie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Notes explicatives</Badge>
                  <span className="text-sm">Informations détaillées sur chaque unité</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Débounce optimisé</Badge>
                  <span className="text-sm">Performance optimisée pour une saisie fluide</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};