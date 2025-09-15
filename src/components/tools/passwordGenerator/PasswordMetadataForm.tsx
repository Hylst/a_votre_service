/**
 * PasswordMetadataForm.tsx
 * Collapsible form component for optional password metadata (site name/URL and username)
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface PasswordMetadataFormProps {
  siteName: string;
  username: string;
  onSiteNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  className?: string;
}

export const PasswordMetadataForm: React.FC<PasswordMetadataFormProps> = ({
  siteName,
  username,
  onSiteNameChange,
  onUsernameChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasMetadata = siteName.trim() || username.trim();

  return (
    <div className={`w-full ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleExpanded}
        className="w-full mb-2 bg-card text-card-foreground hover:bg-secondary/80 border-border/50"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Informations optionnelles</span>
            {hasMetadata && (
              <div className="flex gap-1">
                {siteName.trim() && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
                {username.trim() && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </Button>

      {/* Collapsible Form */}
      {isExpanded && (
        <Card className="bg-card border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-3">
              Ajoutez des informations pour organiser vos mots de passe
            </div>
            
            {/* Site Name/URL Field */}
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-card-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nom du site / URL / Domaine
              </Label>
              <Input
                id="siteName"
                type="text"
                value={siteName}
                onChange={(e) => onSiteNameChange(e.target.value)}
                placeholder="ex: google.com, Gmail, Mon site web..."
                className="bg-background text-foreground border-border/50 focus:border-primary"
              />
            </div>

            {/* Username/Identifier Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-card-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Identifiant / Nom d'utilisateur
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="ex: john.doe@email.com, mon_pseudo..."
                className="bg-background text-foreground border-border/50 focus:border-primary"
              />
            </div>

            {/* Clear Button */}
            {hasMetadata && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSiteNameChange('');
                  onUsernameChange('');
                }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Effacer les informations
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PasswordMetadataForm;