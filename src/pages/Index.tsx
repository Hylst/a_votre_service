import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Lazy load all tool components for better performance
const UserProfile = lazy(() => import("@/components/UserProfile").then(module => ({ default: module.UserProfile })));
const UnitConverter = lazy(() => import("@/components/tools/UnitConverter"));
const CalculatorImproved = lazy(() => import("@/components/tools/CalculatorImproved").then(module => ({ default: module.CalculatorImproved })));
const TodoListEnhanced = lazy(() => import("@/components/tools/TodoListEnhanced").then(module => ({ default: module.TodoListEnhanced })));
const ColorGenerator = lazy(() => import("@/components/tools/ColorGenerator").then(module => ({ default: module.ColorGenerator })));
const BMICalculator = lazy(() => import("@/components/tools/BMICalculator").then(module => ({ default: module.BMICalculator })));
const TextUtilsAdvanced = lazy(() => import("@/components/tools/TextUtilsAdvanced").then(module => ({ default: module.TextUtilsAdvanced })));
const DateCalculatorAdvanced = lazy(() => import("@/components/tools/DateCalculatorAdvanced"));
const ProductivitySuiteModular = lazy(() => import("@/components/tools/ProductivitySuiteModular").then(module => ({ default: module.ProductivitySuiteModular })));
const PasswordGeneratorAdvancedEnhanced = lazy(() => import("@/components/tools/PasswordGeneratorAdvancedEnhanced").then(module => ({ default: module.PasswordGeneratorAdvancedEnhanced })));
const QRCodeGenerator = lazy(() => import("@/components/tools/QRCodeGenerator").then(module => ({ default: module.QRCodeGenerator })));
const HealthWellnessSuite = lazy(() => import("@/components/tools/HealthWellnessSuite").then(module => ({ default: module.HealthWellnessSuite })));
const About = lazy(() => import("@/components/About").then(module => ({ default: module.About })));
const UniversalDataManager = lazy(() => import("@/components/tools/common/UniversalDataManager").then(module => ({ default: module.UniversalDataManager })));
const AppSettings = lazy(() => import("@/components/tools/common/AppSettings").then(module => ({ default: module.AppSettings })));
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

// New design system components
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ToolCard } from "@/components/ui/tool-card";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Gérer la navigation via URL params (depuis Settings)
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
      // Nettoyer l'URL après avoir mis à jour l'état
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  const getSectionTitle = () => {
    switch (activeSection) {
      case "unit-converter": return "Convertisseurs d'Unités";
      case "calculator": return "Calculatrices";
      case "date-calculator-advanced": return "Dates & Temps Avancés";
      case "productivity-suite": return "Suite Productivité";
      case "password-generator-advanced": return "Générateur de Mots de Passe";
      case "color-generator": return "Générateur de Couleurs";
      case "bmi-calculator": return "Calculateur IMC";
      case "health-wellness-suite": return "Suite Santé & Bien-être";
      case "text-utils-advanced": return "Utilitaires Texte Avancés";
      case "data-manager": return "Gestionnaire de Données";
      case "settings": return "Paramètres";
      case "profile": return "Mon Profil";
      case "about": return "À propos";
      default: return "Boîte à Outils Pratiques";
    }
  };

  const handleProfileClick = () => {
    setActiveSection("profile");
  };

  /**
   * Loading fallback component for lazy-loaded components
   */
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <Text color="muted">Chargement de l'outil...</Text>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "unit-converter":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UnitConverter />
          </Suspense>
        );
      case "calculator":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CalculatorImproved />
          </Suspense>
        );
      case "date-calculator-advanced":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DateCalculatorAdvanced />
          </Suspense>
        );
      case "productivity-suite":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProductivitySuiteModular />
          </Suspense>
        );
      case "password-generator-advanced":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PasswordGeneratorAdvancedEnhanced />
          </Suspense>
        );
      case "color-generator":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ColorGenerator />
          </Suspense>
        );
      case "bmi-calculator":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BMICalculator />
          </Suspense>
        );
      case "health-wellness-suite":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HealthWellnessSuite />
          </Suspense>
        );
      case "text-utils-advanced":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TextUtilsAdvanced />
          </Suspense>
        );
      case "data-manager":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UniversalDataManager />
          </Suspense>
        );
      case "settings":
        return (
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<LoadingFallback />}>
              <AppSettings />
            </Suspense>
          </div>
        );
      case "profile":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UserProfile />
          </Suspense>
        );
      case "about":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <About />
          </Suspense>
        );
      default:
        return (
          <div className="space-y-0">
            {/* Hero Section */}
            <Section spacing="xl" className="text-center">
              <Container variant="narrow">
                <Heading level={1} gradient className="mb-6">
                  Boîte à Outils Pratiques
                </Heading>
                <Text size="xl" color="muted" className="mb-8 max-w-2xl mx-auto">
                  Une collection d'outils utiles pour votre quotidien. Convertisseurs, calculatrices, 
                  outils de productivité et bien plus encore !
                </Text>
                
                {!loading && !user && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 w-full sm:w-auto"
                      size="lg"
                    >
                      Se connecter
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/auth')}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      Créer un compte
                    </Button>
                  </div>
                )}
              </Container>
            </Section>
            
            {/* Tools Grid */}
            <Section spacing="lg">
              <Container>
                <Heading level={2} size="2xl" className="text-center mb-8">
                  Outils Disponibles
                </Heading>
                
                <Grid variant="responsive" gap="lg">
                  <ToolCard
                    title="Convertisseurs Universels"
                    description="12 types d'unités : longueurs, poids, températures, devises..."
                    icon="⚖️"
                    tools={["12 Types d'unités", "Temps réel", "Notes explicatives", "Standards SI", "Débounce optimisé"]}
                    onClick={() => setActiveSection("unit-converter")}
                  />
                  
                  <ToolCard
                    title="Calculatrices"
                    description="Scientifique avec saisie clavier"
                    icon="🧮"
                    tools={["Scientifique", "Clavier", "Mémoire", "Historique"]}
                    onClick={() => setActiveSection("calculator")}
                  />
                  
                  <ToolCard
                    title="Dates & Temps Avancés"
                    description="Calculateurs complets de dates"
                    icon="📅"
                    tools={["Différences", "Ajout/Soustraction", "Âge", "Planning", "Fuseaux horaires"]}
                    onClick={() => setActiveSection("date-calculator-advanced")}
                  />
                  
                  <ToolCard
                    title="Suite Productivité Complète"
                    description="Tâches avancées, notes, Pomodoro et to-do list intégrés"
                    icon="🚀"
                    tools={["Tâches intelligentes", "To-do list améliorée", "Notes avec tags", "Pomodoro", "Statistiques", "Synchronisation"]}
                    onClick={() => setActiveSection("productivity-suite")}
                    variant="highlighted"
                  />
                  
                  <ToolCard
                    title="Sécurité Avancée"
                    description="Générateur de mots de passe sécurisés avec analyse"
                    icon="🔐"
                    tools={["Templates sécurisés", "Analyse de force", "Historique", "Export/Import", "Chiffrement"]}
                    onClick={() => setActiveSection("password-generator-advanced")}
                  />
                  
                  <ToolCard
                    title="Créativité"
                    description="Générateurs et outils créatifs"
                    icon="🎨"
                    tools={["Couleurs", "Palettes", "Design", "Inspiration"]}
                    onClick={() => setActiveSection("color-generator")}
                  />
                  
                  <ToolCard
                    title="Santé & Bien-être"
                    description="Suite complète : IMC, nutrition, sommeil, exercices..."
                    icon="💪"
                    tools={["IMC Avancé", "Nutrition", "Hydratation", "Sommeil", "Exercices", "Mental", "Médicaments", "Métriques", "Poids", "Objectifs"]}
                    onClick={() => setActiveSection("health-wellness-suite")}
                  />
                  
                  <ToolCard
                    title="Utilitaires Texte Avancés"
                    description="Analyse, formatage, transformation et outils avancés"
                    icon="📝"
                    tools={["Compteur avancé", "Formatage", "Analyse sentiment", "Transformation", "SEO", "Markdown", "Colorisation", "Emojis"]}
                    onClick={() => setActiveSection("text-utils-advanced")}
                  />

                  <ToolCard
                    title="Gestionnaire de Données"
                    description="Gérez, exportez et importez toutes vos données en un seul endroit"
                    icon="🗃️"
                    tools={["Export universel", "Import/Export", "Statistiques", "Performance", "Tests intégrés"]}
                    onClick={() => setActiveSection("data-manager")}
                  />
                  
                  <ToolCard
                    title="À propos"
                    description="Informations sur l'application"
                    icon="ℹ️"
                    tools={["Auteur", "Technologies", "Version", "Licence"]}
                    onClick={() => setActiveSection("about")}
                  />
                </Grid>
              </Container>
            </Section>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text color="muted">Chargement...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <SidebarInset>
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <Heading level={1} size="lg" className="truncate">
                  {getSectionTitle()}
                </Heading>
              </div>
              
              <div className="ml-auto flex items-center gap-2 px-4">
                <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>🛠️</span>
                  <span>Outils Pratiques</span>
                </div>
                
                <ThemeToggle />
                
                {user ? (
                  <UserMenu onProfileClick={handleProfileClick} />
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="hidden sm:flex"
                    size="sm"
                  >
                    Connexion
                  </Button>
                )}
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
              <Container className="py-6 lg:py-8">
                {renderContent()}
              </Container>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
