/**
 * FinanceBudgetInfoModal.tsx
 * Modal component displaying detailed information about Finance & Budget suite functionality
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
  DollarSign,
  Calculator,
  PiggyBank,
  TrendingUp,
  Bitcoin,
  Receipt,
  BarChart3,
  Target,
  Shield,
  Zap,
  Crown
} from 'lucide-react';

interface FinanceBudgetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinanceBudgetInfoModal: React.FC<FinanceBudgetInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const tools = [
    {
      icon: DollarSign,
      title: "Calculateur de Prêts",
      description: "Calculez vos mensualités, coûts totaux et tableaux d'amortissement pour tous types de prêts",
      features: ["Prêts immobiliers", "Prêts auto", "Prêts personnels", "Comparaison d'offres", "Tableau d'amortissement détaillé"]
    },
    {
      icon: Calculator,
      title: "Planificateur Budget",
      description: "Gérez vos finances personnelles avec un système de budget intelligent et prédictif",
      features: ["Catégories personnalisables", "Objectifs d'épargne", "Alertes budgétaires", "Analyse des tendances", "Export/Import données"]
    },
    {
      icon: PiggyBank,
      title: "Calculateur Épargne",
      description: "Simulez vos investissements et planifiez votre épargne avec différents profils de risque",
      features: ["Intérêts composés", "Profils de risque", "Projections long terme", "Stratégies d'investissement", "Comparaison de scénarios"]
    },
    {
      icon: TrendingUp,
      title: "Simulateur Retraite",
      description: "Planifiez votre retraite avec des projections détaillées et des conseils personnalisés",
      features: ["Calcul pension", "Compléments retraite", "Stratégies d'épargne", "Projections inflation", "Conseils optimisation"]
    },
    {
      icon: Bitcoin,
      title: "Convertisseur Crypto",
      description: "Convertissez instantanément entre cryptomonnaies et devises avec des taux en temps réel",
      features: ["Taux temps réel", "100+ cryptos", "Devises mondiales", "Historique des prix", "Alertes de prix"]
    },
    {
      icon: Receipt,
      title: "Calculateur Taxes",
      description: "Calculez vos impôts français avec précision et optimisez votre fiscalité",
      features: ["Impôt sur le revenu", "Taxes foncières", "Plus-values", "Niches fiscales", "Simulation IR"]
    },
    {
      icon: BarChart3,
      title: "Gestionnaire Dépenses",
      description: "Suivez et analysez vos dépenses avec des graphiques détaillés et des prédictions",
      features: ["Suivi temps réel", "Catégorisation auto", "Graphiques avancés", "Prédictions IA", "Budgets dynamiques"]
    }
  ];

  const advantages = [
    "Suite complète intégrée pour tous vos besoins financiers",
    "Calculs précis basés sur les réglementations françaises",
    "Interface intuitive adaptée aux débutants et experts",
    "Données sauvegardées localement pour votre confidentialité",
    "Mises à jour automatiques des taux et réglementations",
    "Export de données pour votre comptable ou conseiller",
    "Simulations avancées avec projections long terme",
    "Conseils personnalisés selon votre profil financier"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Finance & Budget - Suite Complète
          </DialogTitle>
          <DialogDescription className="text-base">
            Une suite d'outils financiers professionnels pour gérer, calculer et optimiser vos finances personnelles.
            Tous les outils sont gratuits, sécurisés et respectent votre vie privée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Outils disponibles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              7 Outils Professionnels Intégrés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <Card key={index} className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <IconComponent className="w-5 h-5" />
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tool.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Avantages Clés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0" />
                  <span className="text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fonctionnalités Premium */}
          <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Fonctionnalités Avancées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600">Calculs Temps Réel</Badge>
                  <span className="text-sm">Taux et données actualisés automatiquement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600">Projections IA</Badge>
                  <span className="text-sm">Prédictions intelligentes basées sur vos données</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600">Multi-Scénarios</Badge>
                  <span className="text-sm">Comparaison de différentes stratégies financières</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600">Confidentialité Totale</Badge>
                  <span className="text-sm">Aucune donnée transmise, tout reste local</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              Technologies & Sécurité
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Calculs Haute Précision</Badge>
              <Badge variant="secondary">Stockage Local Sécurisé</Badge>
              <Badge variant="secondary">Interface Responsive</Badge>
              <Badge variant="secondary">Réglementations FR</Badge>
              <Badge variant="secondary">APIs Financières</Badge>
              <Badge variant="secondary">Chiffrement Client</Badge>
              <Badge variant="secondary">Mode Hors-ligne</Badge>
              <Badge variant="secondary">Export Professionnel</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceBudgetInfoModal;