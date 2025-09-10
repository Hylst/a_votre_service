/**
 * HealthInfoModal.tsx
 * Modal component displaying detailed information about Health & Wellness Suite features
 * Part of the compact display implementation for the Health section
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Calculator, 
  Apple, 
  Activity, 
  Moon, 
  Pill,
  Target,
  TrendingUp,
  Scale
} from "lucide-react";

interface HealthInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthInfoModal: React.FC<HealthInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const features = [
    {
      icon: <Calculator className="w-5 h-5 text-blue-500" />,
      title: "Calculateur IMC",
      description: "Calculez votre Indice de Masse Corporelle et obtenez des conseils personnalisés"
    },
    {
      icon: <Apple className="w-5 h-5 text-green-500" />,
      title: "Suivi Nutritionnel",
      description: "Suivez vos calories, macronutriments et habitudes alimentaires"
    },
    {
      icon: <Activity className="w-5 h-5 text-red-500" />,
      title: "Moniteur de Fitness",
      description: "Enregistrez vos activités physiques et suivez vos progrès"
    },
    {
      icon: <Moon className="w-5 h-5 text-purple-500" />,
      title: "Suivi du Sommeil",
      description: "Analysez la qualité de votre sommeil et améliorez vos habitudes"
    },
    {
      icon: <Pill className="w-5 h-5 text-orange-500" />,
      title: "Gestion des Médicaments",
      description: "Organisez vos prises de médicaments avec des rappels"
    },
    {
      icon: <Target className="w-5 h-5 text-pink-500" />,
      title: "Objectifs Santé",
      description: "Définissez et suivez vos objectifs de bien-être personnalisés"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      title: "Analyses & Tendances",
      description: "Visualisez vos progrès avec des graphiques détaillés"
    },
    {
      icon: <Scale className="w-5 h-5 text-teal-500" />,
      title: "Suivi du Poids",
      description: "Enregistrez et analysez l'évolution de votre poids"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="w-6 h-6 text-red-500" />
            Suite Santé & Bien-être - Fonctionnalités
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {["IMC", "Nutrition", "Bien-être", "Fitness", "Santé"].map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  {feature.icon}
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">🏥 Conseils d'utilisation</h3>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Utilisez le calculateur IMC pour évaluer votre état de santé général</li>
              <li>• Enregistrez quotidiennement vos repas pour un suivi nutritionnel optimal</li>
              <li>• Définissez des objectifs réalistes et suivez vos progrès régulièrement</li>
              <li>• Consultez toujours un professionnel de santé pour des conseils personnalisés</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};