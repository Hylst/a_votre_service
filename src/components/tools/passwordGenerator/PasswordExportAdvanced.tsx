/**
 * PasswordExportAdvanced.tsx
 * Advanced export component supporting multiple password manager formats with encryption options
 */

import React, { useState } from 'react';
import { Download, Lock, FileText, Database, Shield, Key, Chrome, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PasswordEntry } from './hooks/usePasswordGeneratorEnhanced';
import { generatePasswordExportFileName, getCurrentUsername, sanitizeFileName } from './utils/fileNaming';
import { 
  SupportedFormat, 
  getExporter, 
  getFormatMetadata, 
  getExportFormats 
} from './parsers';

interface PasswordExportAdvancedProps {
  passwords: PasswordEntry[];
  onExport?: (format: string, encrypted: boolean) => void;
  className?: string;
}

type ExportFormat = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
  compatibility: string[];
  supportsEncryption: boolean;
  popularity: 'high' | 'medium' | 'low';
};

// Génération dynamique des formats d'export à partir des parseurs
const generateExportFormats = (): ExportFormat[] => {
  const supportedFormats = getExportFormats();
  
  return supportedFormats.map(format => {
    const metadata = getFormatMetadata(format);
    if (!metadata) {
      throw new Error(`Metadata not found for format: ${format}`);
    }

    // Icônes par format
    const getIcon = (format: SupportedFormat) => {
      switch (format) {
        case 'json': return <FileText className="h-4 w-4" />;
        case 'bitwarden_json': return <Shield className="h-4 w-4" />;
        case 'onepassword_1pif': return <Key className="h-4 w-4" />;
        case 'keepass_csv': return <Database className="h-4 w-4" />;
        case 'lastpass_csv': return <Database className="h-4 w-4" />;
        case 'chrome_csv': return <Chrome className="h-4 w-4" />;
        case 'dashlane_csv': return <Smartphone className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
      }
    };

    // Popularité par format
    const getPopularity = (format: SupportedFormat): 'high' | 'medium' | 'low' => {
      switch (format) {
        case 'json':
        case 'bitwarden_json':
        case 'onepassword_1pif':
          return 'high';
        case 'keepass_csv':
        case 'lastpass_csv':
        case 'chrome_csv':
          return 'medium';
        case 'dashlane_csv':
          return 'low';
        default:
          return 'medium';
      }
    };

    return {
      id: format,
      name: metadata.name,
      description: metadata.description,
      icon: getIcon(format),
      extension: metadata.extension,
      compatibility: metadata.compatibility || [],
      supportsEncryption: metadata.encrypted || false,
      popularity: getPopularity(format)
    };
  });
};

const exportFormats: ExportFormat[] = generateExportFormats();

export const PasswordExportAdvanced: React.FC<PasswordExportAdvancedProps> = ({
  passwords,
  onExport,
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  // Simple encryption function (for demo purposes - in production, use proper crypto libraries)
  const encryptData = (data: string, password: string): string => {
    if (!password) return data;
    // This is a simple XOR encryption for demo - use proper encryption in production
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return btoa(encrypted);
  };

  // Fonction de formatage utilisant les nouveaux parseurs
  const formatPasswords = async (passwords: PasswordEntry[], format: SupportedFormat): Promise<string> => {
    const exporter = getExporter(format);
    if (!exporter) {
      throw new Error(`Exporteur non trouvé pour le format: ${format}`);
    }

    const currentUser = getCurrentUsername();
    const exportOptions = {
      appName: 'À Votre Service',
      username: currentUser || 'Utilisateur anonyme',
      timestamp: new Date().toISOString()
    };

    const result = await exporter.export(passwords, exportOptions);
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'export');
    }

    return result.content;
  };





  const handleExport = async () => {
    if (passwords.length === 0) {
      toast.error('Aucun mot de passe à exporter');
      return;
    }

    if (enableEncryption && !encryptionPassword.trim()) {
      toast.error('Veuillez saisir un mot de passe de chiffrement');
      return;
    }

    setIsExporting(true);

    try {
      const currentUser = getCurrentUsername();
      
      // Générer le contenu avec le nouveau système de parseurs
      let content = await formatPasswords(passwords, selectedFormat as SupportedFormat);
      
      // Générer le nom de fichier
      const filename = generatePasswordExportFileName({
        appName: 'À Votre Service',
        username: currentUser,
        format: selectedFormat,
        extension: selectedFormatData?.extension || 'txt',
        encrypted: enableEncryption && selectedFormatData?.supportsEncryption,
        passwordCount: passwords.length
      });

      // Appliquer le chiffrement si activé
      if (enableEncryption && selectedFormatData?.supportsEncryption) {
        content = encryptData(content, encryptionPassword);
      }

      // Sécuriser le nom de fichier
      const secureFilename = sanitizeFileName(filename);

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = secureFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Export réussi : ${passwords.length} mots de passe exportés au format ${selectedFormatData?.name}`);
      onExport?.(selectedFormat, enableEncryption);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getPopularityBadge = (popularity: string) => {
    const variants = {
      high: 'bg-green-500/20 text-green-700 dark:text-green-300',
      medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      low: 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
    };
    const labels = {
      high: 'Populaire',
      medium: 'Courant',
      low: 'Spécialisé'
    };
    return (
      <Badge variant="secondary" className={variants[popularity as keyof typeof variants]}>
        {labels[popularity as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Avancé
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Exportez vos mots de passe vers différents gestionnaires populaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-card-foreground font-medium">Format d'export</Label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/50">
              {exportFormats.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  <div className="flex items-center gap-2">
                    {format.icon}
                    <span>{format.name}</span>
                    {getPopularityBadge(format.popularity)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Details */}
        {selectedFormatData && (
          <Card className="bg-secondary/30 border-border/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-card-foreground">{selectedFormatData.name}</h4>
                  {getPopularityBadge(selectedFormatData.popularity)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedFormatData.description}</p>
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">Compatible avec :</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFormatData.compatibility.map((app, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Encryption Options */}
        {selectedFormatData?.supportsEncryption && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-card-foreground font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Chiffrement
                </Label>
                <p className="text-sm text-muted-foreground">
                  Protégez vos données avec un mot de passe
                </p>
              </div>
              <Switch
                checked={enableEncryption}
                onCheckedChange={setEnableEncryption}
              />
            </div>
            
            {enableEncryption && (
              <div className="space-y-2">
                <Label htmlFor="encryptionPassword" className="text-card-foreground">
                  Mot de passe de chiffrement
                </Label>
                <Input
                  id="encryptionPassword"
                  type="password"
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="Saisissez un mot de passe fort..."
                  className="bg-background border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Conservez ce mot de passe en sécurité - il sera nécessaire pour déchiffrer vos données
                </p>
              </div>
            )}
          </div>
        )}

        {/* Export Summary */}
        <div className="bg-secondary/20 p-4 rounded-lg border border-border/30">
          <h4 className="font-medium text-card-foreground mb-2">Résumé de l'export</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• {passwords.length} mot(s) de passe à exporter</p>
            <p>• Format : {selectedFormatData?.name} (.{selectedFormatData?.extension})</p>
            {enableEncryption && selectedFormatData?.supportsEncryption && (
              <p>• Chiffrement : Activé 🔒</p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || passwords.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Export en cours...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter {passwords.length} mot(s) de passe
            </div>
          )}
        </Button>

        {/* Popular Services Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Services populaires supportés</h4>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Très populaires :</strong> Bitwarden, 1Password, Google Chrome</p>
            <p><strong>Populaires :</strong> KeePass, LastPass, Microsoft Edge</p>
            <p><strong>Spécialisés :</strong> Dashlane, Vaultwarden, KeeWeb</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordExportAdvanced;