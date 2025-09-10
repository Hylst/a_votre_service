
import { Menu, Home, Scale, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { UnitConverterInfoModal } from "@/components/modals/UnitConverterInfoModal";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Header = ({ onMenuClick, activeSection, setActiveSection }: HeaderProps) => {
  const { user } = useAuth();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const getSectionTitle = () => {
    switch (activeSection) {
      case "unit-converter": return "Convertisseurs d'Unités";
      case "calculator": return "Calculatrices";
      case "date-calculator": return "Calculateurs de Dates";
      case "todo": return "Productivité";
      case "password-generator": return "Générateur de Mots de Passe";
      case "qr-code": return "Générateur QR Code";
      case "color-generator": return "Générateur de Couleurs";
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
            <UserMenu />
          ) : (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth'}
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
    </header>
  );
};
