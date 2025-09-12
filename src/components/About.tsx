
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

  // Complete tool suites data with detailed features
  const toolSuites = [
    {
      id: "converters",
      icon: Scale,
      title: "Convertisseurs Universels",
      description: "12 types d'unités avec conversion temps réel",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      tools: [
        {
          name: "Longueurs",
          features: ["Mètres, kilomètres, miles, pieds, pouces", "Conversion bidirectionnelle", "Précision haute"]
        },
        {
          name: "Poids & Masses",
          features: ["Kilogrammes, livres, onces, tonnes", "Standards internationaux", "Calculs précis"]
        },
        {
          name: "Températures",
          features: ["Celsius, Fahrenheit, Kelvin", "Formules scientifiques", "Temps réel"]
        },
        {
          name: "Volumes",
          features: ["Litres, gallons, millilitres", "Systèmes métriques/impériaux", "Notes explicatives"]
        },
        {
          name: "Surfaces",
          features: ["Mètres carrés, hectares, acres", "Calculs géométriques", "Standards SI"]
        },
        {
          name: "Énergie",
          features: ["Joules, calories, kWh", "Conversions énergétiques", "Débounce optimisé"]
        }
      ]
    },
    {
      id: "calculators",
      icon: Calculator,
      title: "Calculatrices",
      description: "Calculatrice scientifique avec saisie clavier avancée",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      tools: [
        {
          name: "Calculatrice Scientifique",
          features: ["Fonctions trigonométriques", "Logarithmes et exponentielles", "Racines et puissances", "Constantes mathématiques"]
        },
        {
          name: "Saisie Clavier",
          features: ["Raccourcis clavier complets", "Navigation intuitive", "Saisie rapide", "Correction d'erreurs"]
        },
        {
          name: "Mémoire",
          features: ["Stockage de résultats", "Rappel de valeurs", "Opérations sur mémoire", "Effacement sélectif"]
        },
        {
          name: "Historique",
          features: ["Sauvegarde automatique", "Recherche dans l'historique", "Export des calculs", "Réutilisation de résultats"]
        }
      ]
    },
    {
      id: "datetime",
      icon: Calendar,
      title: "Dates & Temps Avancés",
      description: "Calculateurs complets de dates et gestion temporelle",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      tools: [
        {
          name: "Calcul de Différences",
          features: ["Différences en jours/mois/années", "Calculs précis", "Gestion des années bissextiles", "Formats multiples"]
        },
        {
          name: "Ajout/Soustraction",
          features: ["Ajout de périodes", "Soustraction de durées", "Calculs complexes", "Validation automatique"]
        },
        {
          name: "Calculateur d'Âge",
          features: ["Âge exact en temps réel", "Prochains anniversaires", "Statistiques de vie", "Comparaisons d'âges"]
        },
        {
          name: "Planning",
          features: ["Planification de projets", "Échéances automatiques", "Calendrier intégré", "Rappels intelligents"]
        },
        {
          name: "Fuseaux Horaires",
          features: ["Conversion mondiale", "Horaires multiples", "DST automatique", "Planification globale"]
        }
      ]
    },
    {
      id: "productivity",
      icon: Brain,
      title: "Organisation Productive Complète",
      description: "Suite complète de productivité avec IA intégrée",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      tools: [
        {
          name: "Tâches Intelligentes",
          features: ["Catégorisation automatique", "Priorités dynamiques", "IA de recommandation", "Analyse de productivité"]
        },
        {
          name: "To-Do List Améliorée",
          features: ["Interface intuitive", "Glisser-déposer", "Sous-tâches", "Progression visuelle"]
        },
        {
          name: "Notes avec Tags",
          features: ["Système de tags", "Recherche avancée", "Organisation automatique", "Synchronisation"]
        },
        {
          name: "Pomodoro",
          features: ["Cycles personnalisables", "Statistiques détaillées", "Notifications", "Intégration tâches"]
        },
        {
          name: "Statistiques",
          features: ["Tableaux de bord", "Métriques de performance", "Tendances", "Rapports exportables"]
        },
        {
          name: "Synchronisation",
          features: ["Sauvegarde cloud", "Multi-appareils", "Backup automatique", "Restauration"]
        }
      ]
    },
    {
      id: "security",
      icon: Shield,
      title: "Sécurité Avancée",
      description: "Générateur de mots de passe sécurisés avec analyse complète",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
      tools: [
        {
          name: "Templates Sécurisés",
          features: ["Modèles prédéfinis", "Personnalisation avancée", "Règles de sécurité", "Conformité standards"]
        },
        {
          name: "Analyse de Force",
          features: ["Score de sécurité", "Recommandations", "Tests de résistance", "Validation temps réel"]
        },
        {
          name: "Historique",
          features: ["Sauvegarde sécurisée", "Chiffrement local", "Recherche rapide", "Gestion des versions"]
        },
        {
          name: "Export/Import",
          features: ["Formats multiples", "Chiffrement", "Sauvegarde sécurisée", "Migration facile"]
        },
        {
          name: "Chiffrement",
          features: ["AES-256", "Clés locales", "Sécurité maximale", "Audit de sécurité"]
        }
      ]
    },
    {
      id: "creativity",
      icon: Palette,
      title: "Créativité",
      description: "Générateurs et outils créatifs pour designers",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      tools: [
        {
          name: "Générateur de Couleurs",
          features: ["Palettes harmonieuses", "Théorie des couleurs", "Export CSS/HEX", "Accessibilité"]
        },
        {
          name: "Palettes Avancées",
          features: ["Extraction d'images", "Tendances design", "Combinaisons automatiques", "Sauvegarde"]
        },
        {
          name: "Outils Design",
          features: ["Gradients", "Patterns", "Textures", "Formes géométriques"]
        },
        {
          name: "Inspiration",
          features: ["Galerie de designs", "Tendances actuelles", "Références", "Mood boards"]
        }
      ]
    },
    {
      id: "career",
      icon: Briefcase,
      title: "Carrière/Pro",
      description: "Outils professionnels pour développement de carrière",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      tools: [
        {
          name: "Préparation Entretiens",
          features: ["Questions types", "Simulations", "Feedback IA", "Conseils personnalisés"]
        },
        {
          name: "Documents Pro",
          features: ["CV builder", "Lettres de motivation", "Templates", "Optimisation ATS"]
        },
        {
          name: "Networking",
          features: ["Stratégies réseau", "Templates messages", "Suivi contacts", "Événements"]
        },
        {
          name: "Évaluation Compétences",
          features: ["Tests d'aptitudes", "Gap analysis", "Plans de développement", "Certifications"]
        },
        {
          name: "Négociation",
          features: ["Stratégies salariales", "Simulations", "Arguments", "Préparation"]
        },
        {
          name: "Coach IA",
          features: ["Conseils personnalisés", "Analyse de profil", "Recommandations", "Suivi progrès"]
        },
        {
          name: "Veille Marché",
          features: ["Tendances emploi", "Salaires", "Compétences demandées", "Opportunités"]
        }
      ]
    },
    {
      id: "health",
      icon: Activity,
      title: "Santé & Bien-être",
      description: "Suite complète de suivi santé et bien-être",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      tools: [
        {
          name: "IMC Avancé",
          features: ["Calculs précis", "Catégories détaillées", "Recommandations", "Suivi évolution"]
        },
        {
          name: "Nutrition",
          features: ["Calcul calories", "Macronutriments", "Plans alimentaires", "Base de données"]
        },
        {
          name: "Hydratation",
          features: ["Suivi quotidien", "Rappels", "Objectifs personnalisés", "Statistiques"]
        },
        {
          name: "Sommeil",
          features: ["Analyse du sommeil", "Cycles", "Qualité", "Recommandations"]
        },
        {
          name: "Exercices",
          features: ["Programmes", "Suivi séances", "Progression", "Calendrier"]
        },
        {
          name: "Mental",
          features: ["Suivi humeur", "Méditation", "Stress", "Bien-être"]
        },
        {
          name: "Médicaments",
          features: ["Rappels", "Posologie", "Interactions", "Historique"]
        },
        {
          name: "Métriques",
          features: ["Tableaux de bord", "Tendances", "Objectifs", "Rapports"]
        },
        {
          name: "Poids",
          features: ["Suivi évolution", "Objectifs", "Graphiques", "Prédictions"]
        },
        {
          name: "Objectifs",
          features: ["Définition SMART", "Suivi progrès", "Motivation", "Récompenses"]
        }
      ]
    },
    {
      id: "text",
      icon: FileText,
      title: "Utilitaires Texte Avancés",
      description: "Analyse, formatage et transformation de texte",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      tools: [
        {
          name: "Compteur Avancé",
          features: ["Mots, caractères, lignes", "Statistiques détaillées", "Temps de lecture", "Analyse fréquence"]
        },
        {
          name: "Formatage",
          features: ["Casse (majuscules/minuscules)", "Espacement", "Indentation", "Nettoyage"]
        },
        {
          name: "Analyse Sentiment",
          features: ["Détection émotions", "Score sentiment", "Mots-clés", "Recommandations"]
        },
        {
          name: "Transformation",
          features: ["Encodage/décodage", "Formats multiples", "Conversion", "Validation"]
        },
        {
          name: "SEO",
          features: ["Densité mots-clés", "Méta descriptions", "Optimisation", "Suggestions"]
        },
        {
          name: "Markdown",
          features: ["Éditeur WYSIWYG", "Prévisualisation", "Export HTML", "Syntaxe"]
        },
        {
          name: "Colorisation",
          features: ["Coloration syntaxique", "Langages multiples", "Thèmes", "Export"]
        },
        {
          name: "Emojis",
          features: ["Recherche", "Catégories", "Unicode", "Raccourcis"]
        }
      ]
    },
    {
      id: "data",
      icon: Database,
      title: "Gestionnaire de Données",
      description: "Gestion complète des données avec export/import",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      tools: [
        {
          name: "Export Universel",
          features: ["Formats multiples (JSON, CSV, XML)", "Sélection personnalisée", "Compression", "Planification"]
        },
        {
          name: "Import/Export",
          features: ["Migration données", "Validation", "Mapping automatique", "Rollback"]
        },
        {
          name: "Statistiques",
          features: ["Analyse usage", "Métriques performance", "Rapports", "Tendances"]
        },
        {
          name: "Performance",
          features: ["Optimisation", "Cache intelligent", "Monitoring", "Alertes"]
        },
        {
          name: "Tests Intégrés",
          features: ["Validation données", "Tests automatiques", "Intégrité", "Qualité"]
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
