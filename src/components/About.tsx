
/**
 * About.tsx
 * Enhanced About page component with comprehensive tool suites information,
 * collapsible content, and adaptive theming
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Code, Heart, Zap, Shield, Palette, Calculator, 
  Scale, Calendar, Brain, Briefcase, FileText, 
  Database, ChevronDown, ChevronRight, 
  Target, Clock, Users, Lightbulb, Activity
} from "lucide-react";
import { useState } from "react";

export const About = () => {
  // State for managing collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  /**
   * Toggle collapsible section state
   */
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Complete tool suites data with exhaustive detailed features
  const toolSuites = [
    {
      id: "converters",
      icon: Scale,
      title: "Convertisseurs Universels",
      description: "12 types d'unités avec conversion temps réel et précision maximale",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      tools: [
        {
          name: "Longueurs (13 unités)",
          features: [
            "Mètres, kilomètres, centimètres, millimètres",
            "Miles, yards, pieds, pouces",
            "Milles nautiques, chaînes, furlong",
            "Conversion bidirectionnelle instantanée",
            "Précision jusqu'à 15 décimales",
            "Validation automatique des entrées"
          ]
        },
        {
          name: "Poids & Masses (11 unités)",
          features: [
            "Kilogrammes, grammes, tonnes métriques",
            "Livres, onces, stones, tonnes courtes/longues",
            "Carats, grains pour bijouterie",
            "Standards internationaux (SI, Imperial, US)",
            "Calculs haute précision",
            "Contexte d'usage (cuisine, industrie, bijoux)"
          ]
        },
        {
          name: "Températures (5 unités)",
          features: [
            "Celsius, Fahrenheit, Kelvin scientifique",
            "Rankine, Réaumur historiques",
            "Formules thermodynamiques exactes",
            "Validation des limites physiques",
            "Conversion temps réel",
            "Applications météo et scientifiques"
          ]
        },
        {
          name: "Volumes (14 unités)",
          features: [
            "Litres, millilitres, mètres cubes",
            "Gallons US/UK, pintes, quarts",
            "Onces fluides, tasses, cuillères",
            "Barils, boisseaux pour commerce",
            "Systèmes métriques et impériaux",
            "Notes explicatives par contexte"
          ]
        },
        {
          name: "Surfaces (11 unités)",
          features: [
            "Mètres carrés, kilomètres carrés",
            "Hectares, ares, centiares",
            "Acres, pieds carrés, yards carrés",
            "Pouces carrés pour précision",
            "Calculs géométriques avancés",
            "Standards SI et cadastraux"
          ]
        },
        {
          name: "Vitesse (7 unités)",
          features: [
            "Mètres/seconde, kilomètres/heure",
            "Miles/heure, pieds/seconde",
            "Nœuds maritimes et aéronautiques",
            "Mach pour vitesses supersoniques",
            "Conversion contextuelle (auto, avion, bateau)",
            "Calculs de temps de trajet"
          ]
        },
        {
          name: "Pression (10 unités)",
          features: [
            "Pascal, kilopascal, mégapascal",
            "Bar, millibar, atmosphères",
            "PSI, mmHg, inHg météo",
            "Torr pour applications scientifiques",
            "Conversion industrielle et météorologique",
            "Validation des plages de mesure"
          ]
        },
        {
          name: "Énergie (11 unités)",
          features: [
            "Joules, kilojoules, mégajoules",
            "Kilowattheures, wattheures",
            "Calories, kilocalories nutritionnelles",
            "BTU, therms, pieds-livres",
            "Électronvolts pour physique",
            "Applications énergétiques et nutritionnelles"
          ]
        },
        {
          name: "Puissance (8 unités)",
          features: [
            "Watts, kilowatts, mégawatts",
            "Chevaux-vapeur (HP, PS, CV)",
            "BTU/heure, tonnes de réfrigération",
            "Pieds-livres/seconde",
            "Conversion moteurs et électricité",
            "Calculs de consommation énergétique"
          ]
        },
        {
          name: "Devises (12 principales)",
          features: [
            "EUR, USD, GBP, JPY majeurs",
            "CHF, CAD, AUD, CNY",
            "SEK, NOK, DKK nordiques",
            "Taux de change temps réel (API)",
            "Historique des fluctuations",
            "Calculs commerciaux et voyage"
          ]
        },
        {
          name: "Temps (12 unités)",
          features: [
            "Secondes, minutes, heures, jours",
            "Semaines, mois, années",
            "Millisecondes, microsecondes",
            "Décennies, siècles, millénaires",
            "Conversion précise avec calendriers",
            "Gestion années bissextiles"
          ]
        },
        {
          name: "Données Numériques",
          features: [
            "Bytes, KB, MB, GB, TB, PB",
            "Bits, Kbits, Mbits, Gbits",
            "Conversion binaire/décimale (1024 vs 1000)",
            "Calculs de bande passante",
            "Estimation temps de transfert",
            "Optimisation stockage"
          ]
        }
      ]
    },
    {
      id: "calculators",
      icon: Calculator,
      title: "Calculatrices",
      description: "Suite complète de calculatrices scientifiques et spécialisées",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      tools: [
        {
          name: "Calculatrice Scientifique Avancée",
          features: [
            "Fonctions trigonométriques (sin, cos, tan, arc)",
            "Logarithmes (ln, log10, log2, logN)",
            "Exponentielles (e^x, 10^x, x^y)",
            "Racines (√, ∛, n√x) et puissances",
            "Constantes mathématiques (π, e, φ, γ)",
            "Fonctions hyperboliques (sinh, cosh, tanh)",
            "Factorielles, combinaisons, permutations",
            "Conversion degrés/radians/grades"
          ]
        },
        {
          name: "Saisie Clavier Intelligente",
          features: [
            "Raccourcis clavier complets (Ctrl+C/V/Z)",
            "Navigation par flèches dans l'expression",
            "Saisie rapide avec validation temps réel",
            "Correction d'erreurs avec suggestions",
            "Auto-complétion des fonctions",
            "Parenthèses automatiques équilibrées",
            "Détection et correction de syntaxe",
            "Support des opérateurs mathématiques Unicode"
          ]
        },
        {
          name: "Système de Mémoire Avancé",
          features: [
            "Stockage multiple (M1, M2, M3...)",
            "Opérations sur mémoire (M+, M-, M×, M÷)",
            "Rappel instantané avec aperçu",
            "Historique des valeurs mémorisées",
            "Étiquetage personnalisé des mémoires",
            "Sauvegarde persistante entre sessions",
            "Export/import des mémoires",
            "Calculs avec variables nommées"
          ]
        },
        {
          name: "Historique Intelligent",
          features: [
            "Sauvegarde automatique illimitée",
            "Recherche textuelle dans l'historique",
            "Filtrage par type d'opération",
            "Export en multiple formats (TXT, CSV, PDF)",
            "Réutilisation par glisser-déposer",
            "Favoris et annotations",
            "Statistiques d'utilisation",
            "Synchronisation cloud optionnelle"
          ]
        },
        {
          name: "Calculatrice Graphique",
          features: [
            "Tracé de fonctions mathématiques",
            "Zoom et navigation interactive",
            "Analyse de courbes (dérivées, intégrales)",
            "Points d'intersection automatiques",
            "Grille et axes personnalisables",
            "Export des graphiques (PNG, SVG)",
            "Fonctions paramétriques et polaires",
            "Animation de paramètres"
          ]
        },
        {
          name: "Calculatrice Programmeur",
          features: [
            "Bases numériques (2, 8, 10, 16)",
            "Opérations bit à bit (AND, OR, XOR, NOT)",
            "Décalages binaires (<<, >>)",
            "Complément à deux",
            "Tailles de mots (8, 16, 32, 64 bits)",
            "Conversion ASCII/Unicode",
            "Calculs d'adresses mémoire",
            "Masques binaires visuels"
          ]
        }
      ]
    },
    {
      id: "datetime",
      icon: Calendar,
      title: "Dates & Temps Avancés",
      description: "7 outils complets de calculs temporels et planification",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      tools: [
        {
          name: "Calculs de Dates Précis",
          features: [
            "Ajout/soustraction de jours, mois, années",
            "Calculs avec heures, minutes, secondes",
            "Gestion automatique des années bissextiles",
            "Validation des dates limites (1900-2100)",
            "Formats internationaux (ISO, US, EU)",
            "Calculs de périodes complexes",
            "Arrondi intelligent des résultats",
            "Prise en compte des calendriers spéciaux"
          ]
        },
        {
          name: "Calculateur d'Âge Complet",
          features: [
            "Âge exact en temps réel (années, mois, jours)",
            "Prochains anniversaires et jalons",
            "Statistiques de vie détaillées",
            "Comparaisons d'âges multiples",
            "Calcul de l'espérance de vie restante",
            "Âge en différentes unités (heures, minutes)",
            "Événements historiques à votre naissance",
            "Compatibilité astrologique et numérologique"
          ]
        },
        {
          name: "Différences de Dates Avancées",
          features: [
            "Calculs précis entre deux dates quelconques",
            "Résultats en multiple unités simultanées",
            "Exclusion des week-ends optionnelle",
            "Prise en compte des jours fériés",
            "Calculs de durées de projets",
            "Analyse de tendances temporelles",
            "Export des résultats en calendrier",
            "Visualisation graphique des périodes"
          ]
        },
        {
          name: "Jours Ouvrables Professionnels",
          features: [
            "Calculs excluant week-ends automatiquement",
            "Gestion des jours fériés par pays",
            "Calendriers d'entreprise personnalisés",
            "Calculs de délais légaux et contractuels",
            "Planning de congés et absences",
            "Optimisation de planification projet",
            "Alertes de dates limites",
            "Intégration avec systèmes RH"
          ]
        },
        {
          name: "Planning d'Événements Intelligent",
          features: [
            "Planification de projets multi-phases",
            "Échéances automatiques avec dépendances",
            "Calendrier intégré avec vue multiple",
            "Rappels intelligents personnalisables",
            "Gestion des ressources et disponibilités",
            "Templates de projets prédéfinis",
            "Analyse de charge de travail",
            "Export vers calendriers externes"
          ]
        },
        {
          name: "Fuseaux Horaires Mondiaux",
          features: [
            "Conversion entre 400+ fuseaux horaires",
            "Gestion automatique de l'heure d'été (DST)",
            "Planification de réunions internationales",
            "Horloge mondiale avec villes favorites",
            "Calculs de décalage horaire optimal",
            "Alertes de changements d'heure",
            "Historique des modifications de fuseaux",
            "API de géolocalisation pour détection auto"
          ]
        },
        {
          name: "Historique et Sauvegarde",
          features: [
            "Sauvegarde automatique de tous les calculs",
            "Recherche avancée dans l'historique",
            "Favoris et calculs récurrents",
            "Export en formats multiples (PDF, Excel)",
            "Synchronisation cloud sécurisée",
            "Partage de calculs avec équipes",
            "Modèles de calculs personnalisés",
            "Statistiques d'utilisation détaillées"
          ]
        }
      ]
    },
    {
      id: "productivity",
      icon: Target,
      title: "Organisation Productive Complète",
      description: "5 modules intégrés pour une productivité maximale",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      tools: [
        {
          name: "To-Do List Améliorée",
          features: [
            "Interface intuitive avec drag & drop",
            "Priorités visuelles avec codes couleur",
            "Catégories personnalisées illimitées",
            "Synchronisation temps réel multi-appareils",
            "Notifications push intelligentes",
            "Récurrence automatique des tâches",
            "Sous-tâches avec indentation",
            "Filtres avancés et recherche instantanée",
            "Statistiques de productivité quotidienne",
            "Templates de listes prédéfinies"
          ]
        },
        {
          name: "Gestionnaire de Tâches Pro",
          features: [
            "Catégories avancées avec hiérarchie",
            "Système de priorités à 5 niveaux",
            "IA pour estimation de durée",
            "Collaboration équipe en temps réel",
            "Assignation et délégation de tâches",
            "Dépendances entre tâches",
            "Calendrier intégré avec vue Gantt",
            "Rapports de productivité automatiques",
            "Intégration avec outils externes",
            "Workflow personnalisables"
          ]
        },
        {
          name: "Suivi d'Objectifs Intelligent",
          features: [
            "Objectifs SMART avec validation",
            "Jalons intermédiaires automatiques",
            "Suivi de progression visuel",
            "Analyses de performance détaillées",
            "Coaching IA personnalisé",
            "Métriques de succès personnalisables",
            "Rappels adaptatifs intelligents",
            "Visualisation de tendances",
            "Partage d'objectifs avec mentors",
            "Célébration automatique des réussites"
          ]
        },
        {
          name: "Timer Pomodoro Avancé",
          features: [
            "Cycles personnalisables (15-60 min)",
            "Statistiques détaillées avec graphiques",
            "Bibliothèque de sons de notification",
            "Intégration automatique avec tâches",
            "Mode focus avec blocage distractions",
            "Suivi de productivité par projet",
            "Pauses intelligentes adaptatives",
            "Synchronisation avec calendrier",
            "Rapports hebdomadaires automatiques",
            "Gamification avec badges de réussite"
          ]
        },
        {
          name: "Gestionnaire de Notes Complet",
          features: [
            "Organisation avec tags hiérarchiques",
            "Recherche avancée full-text",
            "Catégories multiples avec couleurs",
            "Export en 10+ formats (PDF, Word, etc.)",
            "Éditeur riche avec formatage",
            "Collaboration en temps réel",
            "Historique des versions",
            "Chiffrement de bout en bout",
            "Synchronisation cloud sécurisée",
            "Templates de notes professionnelles"
          ]
        }
      ]
    },
    {
      id: "security",
      icon: Shield,
      title: "Sécurité Avancée",
      description: "Suite complète de sécurité avec 5 modules intégrés",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
      tools: [
        {
          name: "Générateur de Mots de Passe Avancé",
          features: [
            "Templates sécurisés prédéfinis (bancaire, social, pro)",
            "Paramètres ultra-personnalisables (longueur 4-128)",
            "12 types de caractères configurables",
            "Exclusion de caractères ambigus",
            "Génération par lots (jusqu'à 100)",
            "Patterns personnalisés avec regex",
            "Mots de passe prononçables",
            "Intégration avec gestionnaires de mots de passe",
            "API de génération pour développeurs",
            "Conformité NIST et OWASP"
          ]
        },
        {
          name: "Analyseur de Force Ultra-Précis",
          features: [
            "Évaluation en temps réel avec 15 critères",
            "Calcul d'entropie Shannon précis",
            "Détection de patterns courants",
            "Vérification contre 10M+ mots de passe compromis",
            "Score de sécurité sur 100 points",
            "Suggestions d'amélioration contextuelles",
            "Estimation du temps de crack",
            "Analyse de la résistance aux attaques",
            "Rapport de sécurité détaillé",
            "Comparaison avec standards industriels"
          ]
        },
        {
          name: "Templates et Catégories",
          features: [
            "50+ templates prédéfinis par secteur",
            "Catégories spécialisées (finance, santé, tech)",
            "Favoris personnels avec tags",
            "Règles d'entreprise personnalisables",
            "Conformité réglementaire (GDPR, HIPAA)",
            "Templates adaptatifs par contexte",
            "Partage sécurisé de templates",
            "Versioning des configurations",
            "Import/export de règles",
            "Validation automatique des politiques"
          ]
        },
        {
          name: "Historique et Gestion Sécurisée",
          features: [
            "Sauvegarde chiffrée AES-256",
            "Gestion avancée des favoris",
            "Recherche full-text sécurisée",
            "Export multi-formats (CSV, JSON, XML)",
            "Synchronisation cloud chiffrée",
            "Audit trail complet",
            "Purge automatique programmable",
            "Backup incrémental",
            "Restauration sélective",
            "Statistiques d'utilisation anonymisées"
          ]
        },
        {
          name: "Export/Import Universel",
          features: [
            "Sauvegarde complète chiffrée",
            "Import depuis 20+ gestionnaires",
            "Export vers formats standards",
            "Migration assistée entre outils",
            "Validation d'intégrité des données",
            "Compression intelligente",
            "Partage sécurisé temporaire",
            "API REST pour intégrations",
            "Batch processing pour volumes",
            "Logs de traçabilité complets"
          ]
        }
      ]
    },
    {
      id: "creativity",
      icon: Palette,
      title: "Créativité",
      description: "Suite avancée de 9 outils créatifs et de design professionnel",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      tools: [
        {
          name: "Générateur de Couleurs Avancé",
          features: [
            "Palettes harmonieuses avec 12 règles théoriques",
            "Roue chromatique interactive 360°",
            "Génération par émotion et contexte",
            "Accessibilité WCAG 2.1 intégrée",
            "Export CSS, SCSS, JSON, Adobe",
            "Inspiration automatique par IA",
            "Simulation daltonisme",
            "Tendances couleurs en temps réel",
            "Bibliothèque de 1000+ palettes",
            "Analyse psychologique des couleurs"
          ]
        },
        {
          name: "Générateur d'Harmonie Chromatique",
          features: [
            "12 combinaisons théoriques (triadique, tétradique, etc.)",
            "Algorithmes de contraste optimisés",
            "Génération contextuelle (web, print, mobile)",
            "Validation automatique d'accessibilité",
            "Prévisualisations en temps réel",
            "Export vers outils de design",
            "Historique des harmonies créées",
            "Partage collaboratif d'équipe",
            "Templates par industrie",
            "Analyse de tendances sectorielles"
          ]
        },
        {
          name: "Extracteur de Palette d'Images",
          features: [
            "Analyse IA de couleurs dominantes",
            "Extraction de 5-50 couleurs",
            "Algorithmes de clustering avancés",
            "Support 15+ formats d'image",
            "Harmonies automatiques dérivées",
            "Export multi-formats professionnels",
            "Batch processing d'images",
            "API pour intégrations",
            "Historique des extractions",
            "Optimisation pour différents médias"
          ]
        },
        {
          name: "Générateur de Dégradés CSS",
          features: [
            "Transitions fluides multi-couleurs",
            "CSS/SCSS automatique optimisé",
            "Prévisualisations temps réel",
            "Bibliothèque de 500+ dégradés",
            "Générateur radial et linéaire",
            "Animation CSS intégrée",
            "Export SVG et PNG",
            "Compatibilité navigateurs",
            "Templates par catégorie",
            "Partage et collaboration"
          ]
        },
        {
          name: "Logo Maker Professionnel",
          features: [
            "Design professionnel assisté par IA",
            "1000+ templates par secteur",
            "Personnalisation complète",
            "Export haute résolution (SVG, PNG, PDF)",
            "Variations automatiques (couleur, taille)",
            "Guide de style automatique",
            "Mockups intégrés",
            "Droits commerciaux inclus",
            "Versioning et historique",
            "Collaboration équipe"
          ]
        },
        {
          name: "Générateur de Motifs",
          features: [
            "Motifs géométriques et artistiques",
            "Algorithmes génératifs avancés",
            "Personnalisation paramétrique",
            "Export seamless (répétition parfaite)",
            "Formats vectoriels et bitmap",
            "Bibliothèque de 200+ bases",
            "Génération par style artistique",
            "Optimisation pour impression",
            "Animation de motifs",
            "API pour développeurs"
          ]
        },
        {
          name: "Générateur Typographique",
          features: [
            "Appariement intelligent de polices",
            "Hiérarchie visuelle optimisée",
            "Lisibilité et accessibilité",
            "Tendances design actuelles",
            "Prévisualisations contextuelles",
            "Export CSS complet",
            "Bibliothèque Google Fonts intégrée",
            "Analyse de performance web",
            "Suggestions par secteur",
            "Tests A/B automatisés"
          ]
        },
        {
          name: "Filtres d'Images CSS",
          features: [
            "20+ effets CSS professionnels",
            "Prévisualisation temps réel",
            "Combinaisons d'effets avancées",
            "Export CSS optimisé",
            "Batch processing d'images",
            "Presets par style artistique",
            "Compatibilité navigateurs",
            "Performance optimisée",
            "Historique des filtres",
            "Partage de configurations"
          ]
        },
        {
          name: "Générateur d'Icônes",
          features: [
            "Création d'icônes personnalisées",
            "Bibliothèque de 5000+ éléments",
            "Styles multiples (flat, 3D, outline)",
            "Export multi-résolutions",
            "Formats SVG, PNG, ICO",
            "Cohérence de style automatique",
            "Packs d'icônes thématiques",
            "Optimisation pour différents usages",
            "Droits commerciaux inclus",
            "Intégration avec outils design"
          ]
        }
      ]
    },
    {
      id: "career",
      icon: Briefcase,
      title: "Carrière/Pro",
      description: "7 modules professionnels via CareerSuite pour développement de carrière",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      tools: [
        {
          name: "Dashboard Carrière",
          features: [
            "Suivi progression de carrière en temps réel",
            "Visualisation d'objectifs avec graphiques",
            "Métriques de performance personnalisées",
            "Analyse de gaps de compétences",
            "Roadmap de développement personnalisé",
            "Intégration avec LinkedIn et réseaux pro",
            "Alertes d'opportunités ciblées",
            "Benchmarking sectoriel",
            "Rapports de progression automatiques",
            "Coaching IA personnalisé"
          ]
        },
        {
          name: "Studio Documents Professionnels",
          features: [
            "CV Builder avec 50+ templates ATS-optimisés",
            "Lettres de motivation intelligentes",
            "Personnalisation avancée par secteur",
            "Export multi-formats (PDF, Word, HTML)",
            "Optimisation mots-clés automatique",
            "Analyse de compatibilité ATS",
            "Versions multilingues",
            "Historique et versioning",
            "Partage sécurisé avec recruteurs",
            "Feedback automatique et suggestions"
          ]
        },
        {
          name: "Préparation Entretiens Avancée",
          features: [
            "Base de 1000+ questions par secteur",
            "Simulations d'entretiens avec IA",
            "Système de feedback détaillé",
            "Entraînement vidéo avec analyse",
            "Conseils personnalisés par poste",
            "Préparation entretiens techniques",
            "Gestion du stress et confiance",
            "Négociation salariale intégrée",
            "Suivi post-entretien",
            "Statistiques de performance"
          ]
        },
        {
          name: "Intelligence Marché de l'Emploi",
          features: [
            "Analyse marché emploi en temps réel",
            "Insights salaires par région/secteur",
            "Tendances compétences émergentes",
            "Opportunités cachées détectées par IA",
            "Veille concurrentielle automatique",
            "Prédictions d'évolution secteur",
            "Cartographie des entreprises cibles",
            "Analyse de demande par compétence",
            "Rapports personnalisés hebdomadaires",
            "Alertes opportunités sur mesure"
          ]
        },
        {
          name: "Coach Négociation Salariale",
          features: [
            "Stratégies de négociation personnalisées",
            "Calculateur de salaire équitable",
            "Conseils par secteur et expérience",
            "Simulation de négociations",
            "Arguments de valeur automatiques",
            "Timing optimal pour négocier",
            "Alternatives à la rémunération",
            "Scripts de négociation prêts",
            "Suivi des négociations",
            "Analyse de réussite post-négociation"
          ]
        },
        {
          name: "Hub Networking Professionnel",
          features: [
            "Outils de réseautage stratégique",
            "Templates de messages de networking",
            "Suivi des contacts professionnels",
            "Planification d'événements networking",
            "Analyse de réseau et influence",
            "Recommandations de connexions",
            "Gestion de réputation en ligne",
            "Stratégies de personal branding",
            "Intégration réseaux sociaux pro",
            "Métriques d'engagement réseau"
          ]
        },
        {
          name: "Évaluation et Développement Compétences",
          features: [
            "Évaluation complète de compétences",
            "Analyse des gaps par rapport au marché",
            "Plans de développement personnalisés",
            "Recommandations de formations ciblées",
            "Certification et validation compétences",
            "Suivi de progression en temps réel",
            "Benchmarking avec pairs du secteur",
            "Prédiction d'évolution de carrière",
            "Portefeuille de compétences digital",
            "Intégration avec plateformes d'apprentissage"
          ]
        }
      ]
    },
    {
      id: "health",
      icon: Activity,
      title: "Santé & Bien-être",
      description: "10 outils complets de suivi santé et bien-être intégrés",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      tools: [
        {
          name: "IMC Avancé",
          features: [
            "Calculs précis avec 5 formules différentes",
            "Recommandations personnalisées par âge/sexe",
            "Analyse de composition corporelle",
            "Suivi évolution avec graphiques",
            "Conseils santé contextuels",
            "Comparaison avec standards OMS",
            "Calcul de poids idéal multiple",
            "Alertes de santé préventives",
            "Export rapports médicaux",
            "Intégration avec wearables"
          ]
        },
        {
          name: "Nutrition Complète",
          features: [
            "Suivi calories avec base 100k+ aliments",
            "Analyse macronutriments détaillée",
            "Micronutriments et vitamines",
            "Recommandations personnalisées",
            "Scanner code-barres intégré",
            "Planification repas intelligente",
            "Allergies et intolérances",
            "Objectifs nutritionnels adaptatifs",
            "Rapports nutritionnels professionnels",
            "Intégration avec applications fitness"
          ]
        },
        {
          name: "Hydratation Optimisée",
          features: [
            "Objectifs quotidiens personnalisés",
            "Rappels intelligents adaptatifs",
            "Suivi consommation multi-boissons",
            "Statistiques détaillées hebdomadaires",
            "Facteurs environnementaux (chaleur, sport)",
            "Intégration avec activité physique",
            "Alertes de déshydratation",
            "Gamification avec défis",
            "Analyse de qualité d'hydratation",
            "Conseils nutritionnels liés"
          ]
        },
        {
          name: "Sommeil Avancé",
          features: [
            "Analyse qualité de sommeil",
            "Recommandations d'amélioration",
            "Suivi cycles de sommeil",
            "Facteurs d'influence détectés",
            "Optimisation horaires coucher/lever",
            "Corrélations avec performance",
            "Conseils d'hygiène du sommeil",
            "Intégration avec wearables",
            "Rapports de tendances",
            "Alertes de dette de sommeil"
          ]
        },
        {
          name: "Exercices et Fitness",
          features: [
            "Programmes d'entraînement personnalisés",
            "Suivi séances avec chronomètre",
            "Progression automatique adaptative",
            "Conseils techniques par exercice",
            "Bibliothèque de 500+ exercices",
            "Planification hebdomadaire intelligente",
            "Analyse de performance",
            "Prévention blessures",
            "Intégration équipements connectés",
            "Coaching virtuel personnalisé"
          ]
        },
        {
          name: "Santé Mentale",
          features: [
            "Suivi humeur quotidien",
            "Insights bien-être personnalisés",
            "Techniques de relaxation guidées",
            "Méditation et mindfulness",
            "Gestion du stress",
            "Journal émotionnel",
            "Corrélations avec habitudes",
            "Alertes de bien-être",
            "Ressources d'aide professionnelle",
            "Confidentialité et sécurité maximales"
          ]
        },
        {
          name: "Rappels Médicaments",
          features: [
            "Gestion complète des traitements",
            "Rappels intelligents personnalisés",
            "Suivi de prise et effets",
            "Interactions médicamenteuses",
            "Historique médical sécurisé",
            "Partage avec médecins",
            "Alertes de renouvellement",
            "Gestion des effets secondaires",
            "Conformité HIPAA",
            "Urgences médicales intégrées"
          ]
        },
        {
          name: "Métriques Santé Dashboard",
          features: [
            "Dashboard complet multi-métriques",
            "Visualisations avancées",
            "Corrélations automatiques",
            "Tendances et prédictions",
            "Rapports de santé globaux",
            "Intégration tous les modules",
            "Export pour professionnels",
            "Alertes santé préventives",
            "Benchmarking avec pairs",
            "IA de recommandations santé"
          ]
        },
        {
          name: "Suivi Poids Intelligent",
          features: [
            "Graphiques de tendance avancés",
            "Objectifs personnalisés SMART",
            "Analyses statistiques prédictives",
            "Système de motivation gamifié",
            "Corrélations avec habitudes",
            "Prédictions de progression",
            "Alertes de plateau et conseils",
            "Synchronisation balance connectée",
            "Partage avec professionnels santé",
            "Historique long terme (5+ ans)"
          ]
        },
        {
          name: "Objectifs Fitness",
          features: [
            "Définition d'objectifs SMART",
            "Suivi multi-métriques intégré",
            "Ajustements automatiques",
            "Motivation et récompenses",
            "Défis communautaires",
            "Analyse de faisabilité",
            "Planification long terme",
            "Célébration des réussites",
            "Partage avec coach/amis",
            "Statistiques de réussite"
          ]
        }
      ]
    },
    {
      id: "text",
      icon: FileText,
      title: "Utilitaires Texte Avancés",
      description: "11 outils professionnels de traitement et analyse de texte",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      tools: [
        {
          name: "Analyseur de Texte Complet",
          features: [
            "Comptage mots/caractères/paragraphes précis",
            "Analyse de lisibilité (Flesch-Kincaid, SMOG)",
            "Statistiques détaillées multi-langues",
            "Métriques SEO avancées",
            "Analyse de sentiment automatique",
            "Détection de langue automatique",
            "Analyse de complexité syntaxique",
            "Fréquence des mots-clés",
            "Score de diversité lexicale",
            "Rapports d'analyse exportables"
          ]
        },
        {
          name: "Formatage Professionnel",
          features: [
            "Mise en forme automatique intelligente",
            "Correction typographique avancée",
            "Styles multiples (APA, MLA, Chicago)",
            "Export formaté (PDF, Word, HTML)",
            "Normalisation des espaces",
            "Correction de ponctuation",
            "Formatage de citations",
            "Alignement et indentation",
            "Gestion des caractères spéciaux",
            "Templates de mise en page"
          ]
        },
        {
          name: "Transformation Avancée",
          features: [
            "Changement de casse (15+ options)",
            "Encodage/décodage multi-formats",
            "Nettoyage automatique intelligent",
            "Conversion formats (Markdown, HTML, Plain)",
            "Suppression caractères invisibles",
            "Normalisation Unicode",
            "Conversion d'accents",
            "Remplacement par expressions régulières",
            "Transformation par lots",
            "Historique des transformations"
          ]
        },
        {
          name: "Générateur de Contenu IA",
          features: [
            "Templates prédéfinis (50+ catégories)",
            "Génération automatique contextuelle",
            "Personnalisation par industrie",
            "Export multiple formats",
            "Génération de titres optimisés",
            "Création de résumés automatiques",
            "Suggestions de mots-clés",
            "Adaptation au ton souhaité",
            "Génération multilingue",
            "Intégration API externe"
          ]
        },
        {
          name: "Comparaison de Textes",
          features: [
            "Diff textes avec visualisation",
            "Analyse de similitudes avancée",
            "Détection de plagiat",
            "Comparaison sémantique",
            "Surlignage des différences",
            "Statistiques de changements",
            "Export des comparaisons",
            "Historique des versions",
            "Fusion intelligente de textes",
            "Analyse de cohérence"
          ]
        },
        {
          name: "Colorisation Syntaxique",
          features: [
            "Support 100+ langages de programmation",
            "Thèmes de coloration personnalisables",
            "Détection automatique du langage",
            "Export avec coloration (HTML, PDF)",
            "Numérotation des lignes",
            "Pliage de code",
            "Mise en évidence des erreurs",
            "Autocomplétion basique",
            "Formatage automatique du code",
            "Intégration avec éditeurs externes"
          ]
        },
        {
          name: "Gestionnaire d'Emojis",
          features: [
            "Recherche avancée par catégories",
            "Base de données 3000+ emojis",
            "Suggestions contextuelles",
            "Favoris personnalisés",
            "Raccourcis clavier",
            "Conversion texte vers emoji",
            "Analyse de sentiment par emojis",
            "Statistiques d'utilisation",
            "Support Unicode complet",
            "Intégration réseaux sociaux"
          ]
        },
        {
          name: "Éditeur Markdown Pro",
          features: [
            "Édition temps réel avec prévisualisation",
            "Syntaxe étendue (tables, diagrammes)",
            "Export multi-formats (HTML, PDF, Word)",
            "Thèmes de prévisualisation",
            "Raccourcis clavier avancés",
            "Insertion d'images par glisser-déposer",
            "Génération de table des matières",
            "Support LaTeX intégré",
            "Collaboration en temps réel",
            "Synchronisation cloud"
          ]
        },
        {
          name: "Outils Markdown Avancés",
          features: [
            "Conversion bidirectionnelle (MD ↔ HTML)",
            "Prévisualisation multi-thèmes",
            "Validation syntaxe Markdown",
            "Optimisation pour GitHub/GitLab",
            "Génération de badges automatiques",
            "Création de diagrammes Mermaid",
            "Templates de documentation",
            "Minification et optimisation",
            "Extraction de métadonnées",
            "Intégration avec CMS"
          ]
        },
        {
          name: "Analyseur SEO Avancé",
          features: [
            "Optimisation contenu pour moteurs",
            "Analyse densité mots-clés",
            "Suggestions d'amélioration SEO",
            "Score de lisibilité web",
            "Analyse des balises meta",
            "Optimisation pour featured snippets",
            "Analyse de la concurrence",
            "Suggestions de mots-clés longue traîne",
            "Vérification des liens internes",
            "Rapports SEO détaillés"
          ]
        },
        {
          name: "Extracteur de Données",
          features: [
            "Extraction données structurées",
            "Reconnaissance d'entités nommées",
            "Extraction d'emails et URLs",
            "Analyse de patterns personnalisés",
            "Export en CSV/JSON/XML",
            "Nettoyage automatique des données",
            "Validation des formats extraits",
            "Traitement par lots",
            "Règles d'extraction personnalisables",
            "Intégration avec bases de données"
          ]
        }
      ]
    },
    {
      id: "data",
      icon: Database,
      title: "Gestionnaire de Données Avancé",
      description: "5 modules professionnels de gestion et analyse de données",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      tools: [
        {
          name: "Export Universel Pro",
          features: [
            "Support 25+ formats (JSON, CSV, XML, PDF, Excel)",
            "Personnalisation avancée des templates",
            "Compression intelligente multi-algorithmes",
            "Validation automatique des données",
            "Export par lots et programmé",
            "Filtrage et tri avant export",
            "Chiffrement des exports sensibles",
            "Métadonnées et horodatage",
            "Prévisualisation avant export",
            "Intégration cloud (Drive, Dropbox, OneDrive)"
          ]
        },
        {
          name: "Import/Export Intelligent",
          features: [
            "Sauvegarde complète multi-niveaux",
            "Restauration sélective par modules",
            "Migration entre versions automatique",
            "Synchronisation cloud temps réel",
            "Détection et résolution de conflits",
            "Historique des sauvegardes (30 jours)",
            "Compression différentielle",
            "Vérification d'intégrité des données",
            "Import depuis applications tierces",
            "Planification automatique des sauvegardes"
          ]
        },
        {
          name: "Statistiques Avancées",
          features: [
            "Métriques d'utilisation en temps réel",
            "Analyses prédictives avec IA",
            "Rapports personnalisables (50+ templates)",
            "Tendances et patterns automatiques",
            "Dashboard interactif multi-vues",
            "Alertes et notifications intelligentes",
            "Comparaisons historiques",
            "Export rapports (PDF, Excel, PowerBI)",
            "Segmentation utilisateurs avancée",
            "KPIs personnalisés et benchmarking"
          ]
        },
        {
          name: "Monitoring Performance",
          features: [
            "Surveillance performance temps réel",
            "Optimisation automatique des requêtes",
            "Détection d'anomalies par IA",
            "Alertes de performance proactives",
            "Analyse de la charge système",
            "Recommandations d'optimisation",
            "Historique des performances (90 jours)",
            "Métriques de disponibilité (SLA)",
            "Diagnostic automatique des problèmes",
            "Intégration avec outils de monitoring"
          ]
        },
        {
          name: "Tests Intégrés",
          features: [
            "Validation automatique des données",
            "Tests de régression continus",
            "Simulation de charge et stress",
            "Vérification d'intégrité référentielle",
            "Tests de performance automatisés",
            "Validation des règles métier",
            "Détection de doublons intelligente",
            "Tests de compatibilité multi-navigateurs",
            "Rapports de qualité des données",
            "Certification conformité (RGPD, SOX)"
          ]
        }
      ]
    }
  ];

  const technologies = [
    "React", "TypeScript", "Tailwind CSS", "Shadcn/ui", "Vite", "Lucide Icons",
    "IndexedDB", "PWA", "Responsive Design", "Accessibility"
  ];

  return (
    <div className="w-full space-y-6">
      {/* En-tête principal */}
      <Card className="w-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-2xl">
              🛠️
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            à votre service
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-2">
            Une collection complète de plus de 100 outils professionnels pour votre quotidien
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">Version 1.5.8</Badge>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">2025</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Suites d'outils complètes */}
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6" />
            Suites d'Outils Complètes
          </CardTitle>
          <p className="text-muted-foreground">
            10 suites spécialisées avec plus de 100 outils professionnels
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {toolSuites.map((suite) => {
            const IconComponent = suite.icon;
            const isOpen = openSections[suite.id];
            
            return (
              <Collapsible key={suite.id} open={isOpen} onOpenChange={() => toggleSection(suite.id)}>
                <CollapsibleTrigger className="w-full">
                  <Card className={`w-full hover:shadow-md transition-all duration-200 ${suite.bgColor} border-l-4 border-l-current`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-background rounded-lg`}>
                            <IconComponent className={`w-6 h-6 ${suite.color}`} />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-lg">{suite.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{suite.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {suite.tools.length} outils
                          </Badge>
                          {isOpen ? 
                            <ChevronDown className="w-4 h-4 text-muted-foreground" /> : 
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-2">
                  <Card className="w-full bg-background/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suite.tools.map((tool, toolIndex) => (
                          <div key={toolIndex} className="space-y-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-primary" />
                              {tool.name}
                            </h4>
                            <ul className="space-y-1 ml-6">
                              {tool.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      {/* Technologies utilisées */}
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Technologies Utilisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Caractéristiques principales */}
      <Card className="w-full bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Caractéristiques Principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Interface moderne et responsive</h4>
              <p className="text-sm text-muted-foreground">
                Design adaptatif fonctionnant parfaitement sur tous les appareils
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Plus de 100 outils professionnels</h4>
              <p className="text-sm text-muted-foreground">
                Collection complète d'outils pour tous vos besoins quotidiens
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Thème adaptatif sombre/clair</h4>
              <p className="text-sm text-muted-foreground">
                Interface qui s'adapte automatiquement à vos préférences
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Sauvegarde locale sécurisée</h4>
              <p className="text-sm text-muted-foreground">
                Vos données restent privées et accessibles hors ligne
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Performance optimisée</h4>
              <p className="text-sm text-muted-foreground">
                Chargement rapide et utilisation fluide grâce aux technologies modernes
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✓ Accessibilité complète</h4>
              <p className="text-sm text-muted-foreground">
                Conçu pour être utilisable par tous, avec support clavier complet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* À propos de l'auteur */}
      <Card className="w-full border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            À propos de l'auteur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">
              Geoffroy Streit
            </h3>
            <p className="text-muted-foreground mt-2">
              Développeur passionné par la création d'outils pratiques et intuitifs
            </p>
          </div>
          
          <Separator />
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Cette application a été développée avec soin pour offrir une expérience utilisateur optimale.
            </p>
            <p className="text-sm text-muted-foreground">
              Chaque outil a été pensé pour être à la fois puissant et simple d'utilisation.
            </p>
            <p className="text-sm text-muted-foreground">
              L'objectif est de vous faire gagner du temps dans vos tâches quotidiennes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Copyright */}
      <div className="text-center py-4 w-full">
        <p className="text-sm text-muted-foreground">
          © 2025 Geoffroy Streit - Tous droits réservés
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Développé avec React, TypeScript et Tailwind CSS
        </p>
      </div>
    </div>
  );
};
