/**
 * ProfileModal.tsx
 * Modal component for user profile management with localStorage storage
 * Features: name, optional email, avatar presets/custom URL, notes
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { User, Save, X } from 'lucide-react';

interface UserProfile {
  name: string;
  email?: string;
  avatar: string;
  avatarType: 'preset' | 'custom';
  notes: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 10 diverse avatar presets
const AVATAR_PRESETS = [
  '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬'
];

const STORAGE_KEY = 'user_profile';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: AVATAR_PRESETS[0],
    avatarType: 'preset',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  


  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        if (parsedProfile.avatarType === 'custom') {
          setCustomAvatarUrl(parsedProfile.avatar);
        }
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Validate required fields
    if (!profile.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive",
      });
      return;
    }

    // Validate custom avatar URL if selected
    if (profile.avatarType === 'custom' && !customAvatarUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une URL d'avatar valide",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const profileToSave = {
        ...profile,
        avatar: profile.avatarType === 'custom' ? customAvatarUrl : profile.avatar,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileToSave));
      
      toast({
        title: "Succès",
        description: "Profil sauvegardé avec succès",
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du profil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to saved state
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        if (parsedProfile.avatarType === 'custom') {
          setCustomAvatarUrl(parsedProfile.avatar);
        }
      } catch (error) {
        console.error('Error resetting profile:', error);
      }
    }
    onClose();
  };

  const handleAvatarPresetChange = (preset: string) => {
    setProfile(prev => ({
      ...prev,
      avatar: preset,
      avatarType: 'preset'
    }));
  };

  const handleCustomAvatarChange = (url: string) => {
    setCustomAvatarUrl(url);
    setProfile(prev => ({
      ...prev,
      avatarType: 'custom'
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mon Profil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Votre nom"
              className="bg-background text-foreground"
            />
          </div>

          {/* Email Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              className="bg-background text-foreground"
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Avatar</Label>
            <Tabs value={profile.avatarType} onValueChange={(value) => 
              setProfile(prev => ({ ...prev, avatarType: value as 'preset' | 'custom' }))
            }>
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="preset" className="text-secondary-foreground">Presets</TabsTrigger>
                <TabsTrigger value="custom" className="text-secondary-foreground">URL personnalisée</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preset" className="space-y-3">
                <div className="text-sm text-muted-foreground">Choisissez un avatar :</div>
                <RadioGroup
                  value={profile.avatar}
                  onValueChange={handleAvatarPresetChange}
                  className="grid grid-cols-5 gap-2"
                >
                  {AVATAR_PRESETS.map((preset, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={preset} id={`preset-${index}`} className="sr-only" />
                      <Label
                        htmlFor={`preset-${index}`}
                        className={`cursor-pointer text-2xl p-2 rounded-lg border-2 transition-colors ${
                          profile.avatar === preset && profile.avatarType === 'preset'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:bg-secondary'
                        }`}
                      >
                        {preset}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-3">
                <div className="text-sm text-muted-foreground">URL de votre avatar :</div>
                <Input
                  value={customAvatarUrl}
                  onChange={(e) => handleCustomAvatarChange(e.target.value)}
                  placeholder="https://exemple.com/avatar.jpg"
                  className="bg-background text-foreground"
                />
                {customAvatarUrl && (
                  <div className="flex justify-center">
                    <img
                      src={customAvatarUrl}
                      alt="Aperçu avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes personnelles</Label>
            <Textarea
              id="notes"
              value={profile.notes}
              onChange={(e) => setProfile(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Vos notes personnelles..."
              rows={3}
              className="bg-background text-foreground"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-secondary text-secondary-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};