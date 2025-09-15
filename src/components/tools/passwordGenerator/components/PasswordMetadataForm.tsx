/**
 * PasswordMetadataForm.tsx
 * Component for specifying metadata (site name/URL/domain and username) when generating passwords
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, User } from 'lucide-react';

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
  return (
    <div className={className}>
      <Card className="bg-card border-border">
        <CardContent className="p-3 space-y-3">
          <div className="text-sm text-muted-foreground mb-2">
            Ajoutez des informations pour identifier ce mot de passe dans l'historique
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Site Name/URL/Domain Field */}
            <div className="space-y-1">
              <Label htmlFor="siteName" className="text-xs font-medium flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-500" />
                Site web, URL ou domaine
              </Label>
              <Input
                id="siteName"
                type="text"
                placeholder="ex: google.com, Facebook..."
                value={siteName}
                onChange={(e) => onSiteNameChange(e.target.value)}
                className="bg-background text-sm h-8"
              />
            </div>
            
            {/* Username/Identifier Field */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-medium flex items-center gap-1">
                <User className="w-3 h-3 text-purple-500" />
                Nom d'utilisateur ou identifiant
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="ex: john.doe, mon.email@example.com..."
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="bg-background text-sm h-8"
              />
            </div>
          </div>
          
          {/* Clear button if any field has content */}
          {(siteName || username) && (
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSiteNameChange('');
                  onUsernameChange('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
              >
                Effacer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordMetadataForm;