/**
 * TextUtilsInfoModal.tsx
 * Modal component that presents all features and integrated help for the text utilities section
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Edit, Code, BarChart3, Copy, Scissors, Type, Hash, Clock } from "lucide-react";

interface TextUtilsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextUtilsInfoModal: React.FC<TextUtilsInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Outils Texte - Guide Complet
          </DialogTitle>
          <DialogDescription>
            Découvrez toutes les fonctionnalités avancées pour l'analyse, l'édition et la création de contenu textuel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-lg mb-2 text-orange-800 dark:text-orange-200">Vue d'ensemble</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Une suite complète d'outils pour traiter, analyser et transformer vos textes avec précision et efficacité.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <Search className="w-3 h-3 mr-1" />
                Analyse
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Edit className="w-3 h-3 mr-1" />
                Édition
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Type className="w-3 h-3 mr-1" />
                Création
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Code className="w-3 h-3 mr-1" />
                Code
              </Badge>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Text Analysis */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                Analyse de Texte
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Comptage de mots, caractères, paragraphes</li>
                <li>• Analyse de fréquence des mots</li>
                <li>• Détection de la langue</li>
                <li>• Statistiques de lisibilité</li>
                <li>• Analyse de sentiment</li>
                <li>• Comparaison de textes avec diff</li>
                <li>• Extraction d'éléments spécifiques</li>
                <li>• Analyse SEO et mots-clés</li>
              </ul>
            </div>

            {/* Text Editing */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Edit className="w-4 h-4 text-blue-600" />
                Édition Avancée
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Recherche et remplacement avec regex</li>
                <li>• Transformation de casse</li>
                <li>• Suppression d'espaces et caractères</li>
                <li>• Formatage automatique</li>
                <li>• Nettoyage de texte</li>
                <li>• Éditeur Markdown intégré</li>
                <li>• Transformation de texte avancée</li>
              </ul>
            </div>

            {/* Text Generation */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-green-600" />
                Génération de Contenu
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Génération de Lorem Ipsum</li>
                <li>• Création de mots de passe</li>
                <li>• Génération de texte aléatoire</li>
                <li>• Templates de contenu</li>
                <li>• Suggestions d'amélioration</li>
                <li>• Gestionnaire d'emojis intégré</li>
                <li>• Génération de contenu personnalisé</li>
              </ul>
            </div>

            {/* Code Tools */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-purple-600" />
                Outils Code
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Formatage JSON, XML, HTML</li>
                <li>• Minification de code</li>
                <li>• Encodage/Décodage Base64, URL</li>
                <li>• Échappement de caractères</li>
                <li>• Validation de syntaxe</li>
                <li>• Coloration syntaxique avancée</li>
                <li>• Outils Markdown complets</li>
                <li>• Conversion entre formats</li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              Actions Rapides
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Copy className="w-3 h-3" />
                Copier résultat
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scissors className="w-3 h-3" />
                Couper texte
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-3 h-3" />
                Générer hash
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-3 h-3" />
                Recherche avancée
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Code className="w-3 h-3" />
                Encodage URL
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-3 h-3" />
                Comparaison diff
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Conseils d'utilisation</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Utilisez Ctrl+A pour sélectionner tout le texte rapidement</li>
              <li>• Les résultats sont automatiquement copiés dans le presse-papiers</li>
              <li>• Sauvegardez vos textes fréquents avec les favoris</li>
              <li>• Utilisez les raccourcis clavier pour une productivité maximale</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextUtilsInfoModal;