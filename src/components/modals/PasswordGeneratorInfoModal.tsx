/**
 * PasswordGeneratorInfoModal.tsx
 * Modal component displaying detailed information about password generator and security functionality
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
import { Shield, BarChart, Download, Upload, History, Settings, Lock, Key, Eye, Zap } from 'lucide-react';

interface PasswordGeneratorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordGeneratorInfoModal: React.FC<PasswordGeneratorInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  const features = [
    {
      icon: <Settings className="w-8 h-8 text-blue-600" />,
      title: "Générateur Avancé",
      description: "Créez des mots de passe sécurisés avec des paramètres personnalisables",
      details: [
        "Longueur ajustable (4-128 caractères)",
        "Types de caractères configurables",
        "Exclusion des caractères ambigus",
        "Templates prédéfinis sécurisés"
      ]
    },
    {
      icon: <BarChart className="w-8 h-8 text-green-600" />,
      title: "Analyseur de Force",
      description: "Évaluez la sécurité de vos mots de passe en temps réel",
      details: [
        "Score de force détaillé (0-100%)",
        "Calcul d'entropie cryptographique",
        "Détection de motifs faibles",
        "Recommandations d'amélioration"
      ]
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Templates Intelligents",
      description: "Utilisez des modèles optimisés pour différents usages",
      details: [
        "Templates par catégorie (Web, Gaming, Pro)",
        "Niveaux de sécurité adaptés",
        "Favoris personnalisables",
        "Génération contextuelle"
      ]
    },
    {
      icon: <History className="w-8 h-8 text-orange-600" />,
      title: "Historique Complet",
      description: "Gardez une trace de tous vos mots de passe générés",
      details: [
        "Historique chronologique",
        "Métadonnées (site, utilisateur)",
        "Système de favoris",
        "Recherche et filtrage"
      ]
    },
    {
      icon: <Download className="w-8 h-8 text-red-600" />,
      title: "Export Sécurisé",
      description: "Exportez vos données dans multiple formats",
      details: [
        "Format JSON universel",
        "Compatible gestionnaires de mots de passe",
        "Chiffrement optionnel",
        "Noms de fichiers intelligents"
      ]
    },
    {
      icon: <Upload className="w-8 h-8 text-teal-600" />,
      title: "Import Avancé",
      description: "Importez des données depuis d'autres sources",
      details: [
        "Support multiple formats",
        "Validation des données",
        "Fusion intelligente",
        "Prévisualisation avant import"
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: "Chiffrement Local",
      description: "Toutes les données sont chiffrées localement avec AES-256"
    },
    {
      icon: <Key className="w-6 h-6 text-green-600" />,
      title: "Génération Cryptographique",
      description: "Utilise des algorithmes cryptographiquement sécurisés"
    },
    {
      icon: <Eye className="w-6 h-6 text-purple-600" />,
      title: "Confidentialité Totale",
      description: "Aucune donnée n'est transmise vers des serveurs externes"
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Protection Anti-Patterns",
      description: "Détection automatique des motifs faibles et vulnérables"
    }
  ];

  const advantages = [
    "Interface intuitive et professionnelle",
    "Génération instantanée et sécurisée",
    "Analyse de sécurité en temps réel",
    "Stockage local chiffré",
    "Export/Import universel",
    "Historique complet avec métadonnées",
    "Templates optimisés par usage",
    "Aucune dépendance externe"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Gestion de mots de passe et sécurité - Fonctionnalités Détaillées
          </DialogTitle>
          <DialogDescription>
            Une suite complète de sécurité pour générer, analyser et gérer vos mots de passe.
            Sécurité maximale avec chiffrement local et outils professionnels.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Fonctionnalités principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
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
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sécurité et confidentialité */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Sécurité et Confidentialité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow border-green-200 dark:border-green-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Avantages */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              Avantages Clés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                  <span className="text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2">Sécurité de Niveau Professionnel</h4>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Chiffrement AES-256
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Entropie &gt; 60 bits
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    NIST Compliant
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Stockage Local
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};