
import { Menu, Home, Scale, Info, Calculator, Brain, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UnitConverterInfoModal } from "@/components/modals/UnitConverterInfoModal";
import { CalculatorInfoModal } from "@/components/modals/CalculatorInfoModal";
import { ProductivityInfoModal } from "@/components/modals/ProductivityInfoModal";
import { CreativityInfoModal } from "@/components/modals/CreativityInfoModal";
import { PasswordGeneratorInfoModal } from "@/components/modals/PasswordGeneratorInfoModal";
import { ProfileModal } from "@/components/modals/ProfileModal";

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Header = ({ onMenuClick, activeSection, setActiveSection }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Debug: Log user state changes in Header
  useEffect(() => {
    console.log('🔄 Header re-rendered - User state:', user ? 'logged in' : 'not logged in', user);
    
    // Debug localStorage state
    const currentUser = localStorage.getItem('currentUser');
    const localUsers = localStorage.getItem('localUsers');
    console.log('🔍 localStorage currentUser:', currentUser);
    console.log('🔍 localStorage localUsers:', localUsers);
  }, [user]);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCalculatorInfoModalOpen, setIsCalculatorInfoModalOpen] = useState(false);
  const [isProductivityInfoModalOpen, setIsProductivityInfoModalOpen] = useState(false);
  const [isCreativityInfoModalOpen, setIsCreativityInfoModalOpen] = useState(false);
  const [isPasswordGeneratorInfoModalOpen, setIsPasswordGeneratorInfoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Debug: Log ProfileModal state changes
  useEffect(() => {
    console.log('📋 Header: ProfileModal state changed to:', isProfileModalOpen);
    console.log('📋 Header: User state:', user ? 'User exists' : 'No user');
    console.log('📋 Header: User object:', user);
  }, [isProfileModalOpen, user]);

  
  const getSectionTitle = () => {
    switch (activeSection) {
      case "unit-converter": return "Convertisseurs d'Unités";
      case "calculator": return "Calculatrices";
      case "date-calculator": return "Calculateurs de Dates";
      case "todo": return "Productivité";
      case "productivity-suite": return "Organisation productive";
      case "password-generator": return "Générateur de Mots de Passe";
      case "password-generator-advanced": return "Gestion de mots de passe et sécurité";
      case "qr-code": return "Générateur QR Code";
      case "color-generator": return "Créativité";

      case "bmi-calculator": return "Calculateur IMC";
      case "text-utils": return "Utilitaires Texte";
      default: return "à votre service";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            {activeSection !== "home" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection("home")}
                className="hidden sm:flex"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            )}
            <div className="flex items-center gap-2">
              {activeSection === "unit-converter" && (
                <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
              {activeSection === "calculator" && (
                <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
              {activeSection === "productivity-suite" && (
                <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              )}
              {activeSection === "color-generator" && (
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              )}
              {activeSection === "password-generator-advanced" && (
                <span className="text-2xl">🔐</span>
              )}

              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {getSectionTitle()}
              </h1>
              {activeSection === "unit-converter" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsInfoModalOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <div className="hidden lg:flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">12 types d'unités</Badge>
                    <Badge variant="secondary" className="text-xs">Standards SI</Badge>
                    <Badge variant="secondary" className="text-xs">Temps réel</Badge>
                  </div>
                </>
              )}
              {activeSection === "calculator" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCalculatorInfoModalOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </Button>
                  <div className="hidden lg:flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">5 types</Badge>
                    <Badge variant="secondary" className="text-xs">50+ fonctions</Badge>
                    <Badge variant="secondary" className="text-xs">Graphiques</Badge>
                    <Badge variant="secondary" className="text-xs">Scientifique</Badge>
                  </div>
                </>
              )}
              {activeSection === "productivity-suite" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProductivityInfoModalOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  >
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                  <div className="hidden lg:flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">To-do avancée</Badge>
                    <Badge variant="secondary" className="text-xs">Technique Pomodoro</Badge>
                    <Badge variant="secondary" className="text-xs">Notes SMART</Badge>
                    <Badge variant="secondary" className="text-xs">Objectifs</Badge>
                    <Badge variant="secondary" className="text-xs">Statistiques</Badge>
                  </div>
                </>
              )}
              {activeSection === "color-generator" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreativityInfoModalOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900"
                  >
                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                  <div className="hidden lg:flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">Couleurs avancées</Badge>
                    <Badge variant="secondary" className="text-xs">Palettes intelligentes</Badge>
                    <Badge variant="secondary" className="text-xs">Dégradés dynamiques</Badge>
                    <Badge variant="secondary" className="text-xs">Typographie</Badge>
                    <Badge variant="secondary" className="text-xs">Filtres image</Badge>
                  </div>
                </>
              )}
              {activeSection === "password-generator-advanced" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPasswordGeneratorInfoModalOpen(true)}
                    className="p-1 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <div className="hidden lg:flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">Génération</Badge>
                    <Badge variant="secondary" className="text-xs">Analyse</Badge>
                    <Badge variant="secondary" className="text-xs">Import/Export</Badge>
                    <Badge variant="secondary" className="text-xs">Historique</Badge>
                    <Badge variant="secondary" className="text-xs">Chiffrement</Badge>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <span>🛠️</span>
            <span>à votre service</span>
          </div>
          
          <ThemeToggle />
          
          {user ? (
            <UserMenu onProfileClick={() => {
              setIsProfileModalOpen(true);
            }} />
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="hidden sm:flex"
            >
              Connexion
            </Button>
          )}
        </div>
      </div>
      
      <UnitConverterInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
      <CalculatorInfoModal 
        isOpen={isCalculatorInfoModalOpen} 
        onClose={() => setIsCalculatorInfoModalOpen(false)} 
      />
      <ProductivityInfoModal 
        isOpen={isProductivityInfoModalOpen} 
        onClose={() => setIsProductivityInfoModalOpen(false)} 
      />
      <CreativityInfoModal 
        isOpen={isCreativityInfoModalOpen} 
        onClose={() => setIsCreativityInfoModalOpen(false)} 
      />
      <PasswordGeneratorInfoModal 
        isOpen={isPasswordGeneratorInfoModalOpen} 
        onClose={() => setIsPasswordGeneratorInfoModalOpen(false)} 
      />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => {
          console.log('📋 Header: Closing ProfileModal');
          setIsProfileModalOpen(false);
        }} 
      />

    </header>
  );
};
