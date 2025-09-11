
import { Calendar, Home, Calculator, CheckSquare, Palette, Heart, FileText, Shield, Settings, Info, User, Database, Briefcase } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const AppSidebar = ({ activeSection, setActiveSection }: AppSidebarProps) => {
  const { user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleMenuClick = (sectionId: string) => {
    // Si c'est la section settings, naviguer vers la page /settings
    if (sectionId === "settings") {
      navigate('/settings');
      return;
    }
    
    setActiveSection(sectionId);
    // Fermer le menu sur mobile après sélection
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuItems = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "unit-converter", label: "Convertisseurs", icon: Calculator },
    { id: "calculator", label: "Calculatrices", icon: Calculator },
    { id: "date-calculator-advanced", label: "Dates & Temps", icon: Calendar },
    { id: "productivity-suite", label: "Organisation productive", icon: CheckSquare },
    { id: "password-generator-advanced", label: "Sécurité Avancée", icon: Shield },
    { id: "color-generator", label: "Créativité", icon: Palette },
    { id: "career-generator", label: "Carrière/Pro", icon: Briefcase },
    { id: "health-wellness-suite", label: "Santé", icon: Heart },
    { id: "text-utils-advanced", label: "Utilitaires Texte", icon: FileText },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "profile", label: "Mon Profil", icon: User },
    { id: "data-manager", label: "Gestion Données", icon: Database },
    { id: "about", label: "À propos", icon: Info },
  ];

  // Filtrer les éléments selon l'état de connexion de l'utilisateur
  const filteredMenuItems = user ? menuItems : menuItems.filter(item => item.id !== "profile");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 p-1">
            <img 
              src="/images/majordome-hero.png" 
              alt="Majordome Logo" 
              className="w-full h-full object-contain sidebar-logo-animation"
            />
          </div>
          <div className="grid flex-1 text-center text-sm leading-tight">
            <span className="truncate font-semibold">À votre service</span>
            <span className="truncate text-xs text-gray-500 text-center">Votre boîte à outils numérique</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => handleMenuClick(item.id)}
                      isActive={activeSection === item.id}
                      tooltip={item.label}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2 text-center space-y-1">
          <p className="text-xs text-gray-500">v1.5.8</p>
          <p className="text-xs text-gray-400">Tous droits réservés :</p>
          <p className="text-xs text-gray-400">Geoffroy Streit</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
