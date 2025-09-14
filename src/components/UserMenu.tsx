
import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  onProfileClick?: () => void;
}

export const UserMenu = ({ onProfileClick }: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  const handleProfileClick = () => {
    console.log('🔍 UserMenu: Profile clicked - START');
    console.log('🔍 UserMenu: onProfileClick function exists:', !!onProfileClick);
    console.log('🔍 UserMenu: onProfileClick type:', typeof onProfileClick);
    console.log('🔍 UserMenu: onProfileClick value:', onProfileClick);
    
    if (onProfileClick) {
      console.log('🔍 UserMenu: Setting timeout to call onProfileClick...');
      // Use setTimeout to allow dropdown to close first
      setTimeout(() => {
        console.log('🔍 UserMenu: Timeout executed, calling onProfileClick now');
        try {
          onProfileClick();
          console.log('🔍 UserMenu: onProfileClick called successfully');
        } catch (error) {
          console.error('🔍 UserMenu: Error calling onProfileClick:', error);
        }
      }, 100);
    } else {
      console.warn('🔍 UserMenu: onProfileClick function not provided!');
    }
    console.log('🔍 UserMenu: Profile clicked - END');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (!user) return null;

  const userInitials = user.fullName || user.full_name
    ? (user.fullName || user.full_name || '')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt="Avatar" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.fullName || user.full_name || 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Connecté localement
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
