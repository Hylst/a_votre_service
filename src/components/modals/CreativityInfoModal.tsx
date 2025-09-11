/**
 * CreativityInfoModal.tsx
 * Modal component displaying detailed information about creativity functionality
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
import { Palette, Droplets, Layers, Type, Filter, Sparkles, Crown, Grid, Shapes, Pen } from 'lucide-react';

interface CreativityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreativityInfoModal: React.FC<CreativityInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const features = [
    {
      icon: <Palette className="w-8 h-8 text-purple-600" />,
      title: "Générateur de Couleurs Avancé",
      description: "Créez des couleurs harmonieuses avec des outils professionnels",
      details: [
        "Sélecteur de couleurs HSL, RGB, HEX",
        "Roue chromatique interactive",
        "Ajustements de luminosité et saturation",
        "Prévisualisation en temps réel"
      ]
    },
    {
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      title: "Palettes Intelligentes",
      description: "Générez des palettes cohérentes automatiquement",
      details: [
        "Palettes monochromatiques",
        "Couleurs complémentaires",
        "Triades et tétraèdes",
        "Palettes analogues"
      ]
    },
    {
      icon: <Layers className="w-8 h-8 text-pink-600" />,
      title: "Dégradés Dynamiques",
      description: "Créez des dégradés CSS personnalisés",
      details: [
        "Dégradés linéaires et radiaux",
        "Contrôle des points d'arrêt",
        "Génération de code CSS",
        "Prévisualisation interactive"
      ]
    },
    {
      icon: <Type className="w-8 h-8 text-green-600" />,
      title: "Outils Typographiques",
      description: "Explorez les combinaisons de polices et styles",
      details: [
        "Prévisualisation de polices",
        "Calcul de contraste",
        "Hiérarchie typographique",
        "Styles CSS automatiques"
      ]
    },
    {
      icon: <Filter className="w-8 h-8 text-orange-600" />,
      title: "Filtres d'Images",
      description: "Appliquez des effets visuels à vos images",
      details: [
        "Filtres CSS (blur, brightness, contrast)",
        "Effets de couleur",
        "Transformations",
        "Prévisualisation en direct"
      ]
    },
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
      title: "Inspiration Créative",
      description: "Découvrez de nouvelles idées et tendances",
      details: [
        "Palettes tendance",
        "Combinaisons populaires",
        "Suggestions automatiques",
        "Sauvegarde de favoris"
      ]
    }
  ];

  const advantages = [
    "Interface intuitive et professionnelle",
    "Génération de code CSS prêt à l'emploi",
    "Outils d'accessibilité intégrés",
    "Synchronisation entre tous les outils",
    "Export dans multiple formats",
    "Historique des créations"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-600" />
            Suite Créativité - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Une suite complète d'outils créatifs pour designers, développeurs et artistes.
            Libérez votre créativité avec des outils professionnels intuitifs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Fonctionnalités principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
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
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
              
              {/* Additional tools */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <Crown className="w-8 h-8 text-indigo-600" />
                    <span>Générateur de Logos</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Créez des logos professionnels personnalisés</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Templates de logos modernes
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Personnalisation des formes
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Typographie intégrée
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Export SVG et PNG
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <Grid className="w-8 h-8 text-teal-600" />
                    <span>Générateur de Motifs</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Créez des motifs répétitifs et textures</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Motifs géométriques
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Patterns organiques
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Contrôle de la répétition
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Export pour CSS et design
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <Shapes className="w-8 h-8 text-cyan-600" />
                    <span>Générateur d'Icônes</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Créez des icônes vectorielles personnalisées</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Bibliothèque d'icônes
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Personnalisation avancée
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Styles multiples
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Export multi-formats
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <Pen className="w-8 h-8 text-violet-600" />
                    <span>Éditeur SVG</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Éditez et créez des graphiques vectoriels</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Outils de dessin vectoriel
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Manipulation des courbes
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Calques et groupes
                    </li>
                    <li className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                      Code SVG optimisé
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Avantages de la Suite Intégrée</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                  <span className="text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges des outils */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Outils Disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {["Couleurs avancées", "Palettes intelligentes", "Dégradés dynamiques", "Typographie", "Filtres image", "Inspiration créative", "Générateur de logos", "Générateur de motifs", "Générateur d'icônes", "Éditeur SVG"].map((tool, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativityInfoModal;