/**
 * PasswordExportAdvanced.tsx
 * Advanced password export component supporting multiple formats and encryption options
 * Supports popular password manager formats for easy migration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Shield, 
  FileText, 
  Database, 
  Key, 
  Lock, 
  Info, 
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Password entry interface (should match the one from usePasswordGeneratorEnhanced)
interface PasswordEntry {
  id: string;
  password: string;
  timestamp: number;
  settings: {
    length: number;
    upper: boolean;
    lower: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  strength: {
    score: number;
    level: string;
    color: string;
  };
  templateId?: string;
  isFavorite?: boolean;
  siteName?: string;
  username?: string;
  usageCount?: number;
}

// Export format definitions
type ExportFormat = 
  | 'json' 
  | 'csv' 
  | '1password' 
  | 'bitwarden' 
  | 'keepass' 
  | 'lastpass' 
  | 'chrome';

interface ExportFormatInfo {
  name: string;
  description: string;
  extension: string;
  encrypted: boolean;
  popular: boolean;
  compatibility: string[];
}

const exportFormats: Record<ExportFormat, ExportFormatInfo> = {
  json: {
    name: 'JSON Standard',
    description: 'Format JSON universel avec toutes les métadonnées',
    extension: 'json',
    encrypted: false,
    popular: true,
    compatibility: ['Applications personnalisées', 'Scripts', 'Sauvegarde']
  },
  csv: {
    name: 'CSV Standard',
    description: 'Format CSV compatible avec Excel et autres tableurs',
    extension: 'csv',
    encrypted: false,
    popular: true,
    compatibility: ['Excel', 'Google Sheets', 'LibreOffice']
  },
  '1password': {
    name: '1Password (1PIF)',
    description: 'Format natif 1Password pour import direct',
    extension: '1pif',
    encrypted: true,
    popular: true,
    compatibility: ['1Password']
  },
  bitwarden: {
    name: 'Bitwarden JSON',
    description: 'Format JSON compatible Bitwarden',
    extension: 'json',
    encrypted: false,
    popular: true,
    compatibility: ['Bitwarden', 'Vaultwarden']
  },
  keepass: {
    name: 'KeePass CSV',
    description: 'Format CSV pour KeePass et KeePassXC',
    extension: 'csv',
    encrypted: false,
    popular: true,
    compatibility: ['KeePass', 'KeePassXC', 'KeeWeb']
  },
  lastpass: {
    name: 'LastPass CSV',
    description: 'Format CSV compatible LastPass',
    extension: 'csv',
    encrypted: false,
    popular: true,
    compatibility: ['LastPass']
  },
  chrome: {
    name: 'Chrome Passwords',
    description: 'Format CSV pour Google Chrome/Edge',
    extension: 'csv',
    encrypted: false,
    popular: false,
    compatibility: ['Google Chrome', 'Microsoft Edge', 'Chromium']
  }
};

interface PasswordExportAdvancedProps {
  passwords: PasswordEntry[];
  onExport?: (format: ExportFormat, encrypted: boolean) => void;
}

export const PasswordExportAdvanced: React.FC<PasswordExportAdvancedProps> = ({
  passwords,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState('');

  // Simple encryption function (for demo purposes - in production, use proper crypto libraries)
  const encryptData = (data: string, password: string): string => {
    // This is a simple XOR encryption for demo purposes
    // In production, use proper encryption libraries like crypto-js
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ password.charCodeAt(i % password.length)
      );
    }
    return btoa(encrypted); // Base64 encode
  };

  // Format conversion functions
  const formatToJSON = (passwords: PasswordEntry[]): string => {
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      source: 'Password Generator Advanced Enhanced',
      count: passwords.length,
      passwords: passwords.map(p => ({
        id: p.id,
        password: p.password,
        siteName: p.siteName || '',
        username: p.username || '',
        created: new Date(p.timestamp).toISOString(),
        strength: p.strength.level,
        length: p.settings.length,
        isFavorite: p.isFavorite || false,
        usageCount: p.usageCount || 0
      }))
    };
    return JSON.stringify(exportData, null, 2);
  };

  const formatToCSV = (passwords: PasswordEntry[]): string => {
    const headers = ['Site/URL', 'Username', 'Password', 'Created', 'Strength', 'Length', 'Favorite', 'Usage Count'];
    const rows = passwords.map(p => [
      p.siteName || '',
      p.username || '',
      p.password,
      format(new Date(p.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      p.strength.level,
      p.settings.length.toString(),
      p.isFavorite ? 'Yes' : 'No',
      (p.usageCount || 0).toString()
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatTo1Password = (passwords: PasswordEntry[]): string => {
    // 1Password 1PIF format (simplified)
    const items = passwords.map(p => ({
      uuid: p.id,
      updatedAt: Math.floor(p.timestamp / 1000),
      createdAt: Math.floor(p.timestamp / 1000),
      title: p.siteName || 'Generated Password',
      location: p.siteName || '',
      secureContents: {
        fields: [
          {
            designation: 'username',
            name: 'username',
            type: 'T',
            value: p.username || ''
          },
          {
            designation: 'password',
            name: 'password',
            type: 'P',
            value: p.password
          }
        ]
      },
      typeName: 'webforms.WebForm'
    }));
    
    return JSON.stringify({ items }, null, 2);
  };

  const formatToBitwarden = (passwords: PasswordEntry[]): string => {
    const exportData = {
      encrypted: false,
      folders: [],
      items: passwords.map(p => ({
        id: p.id,
        organizationId: null,
        folderId: null,
        type: 1, // Login type
        name: p.siteName || 'Generated Password',
        notes: `Generated on ${format(new Date(p.timestamp), 'PPP', { locale: fr })}\nStrength: ${p.strength.level}`,
        favorite: p.isFavorite || false,
        login: {
          username: p.username || '',
          password: p.password,
          totp: null,
          uris: p.siteName ? [{ match: null, uri: p.siteName }] : []
        },
        collectionIds: []
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const formatToKeePass = (passwords: PasswordEntry[]): string => {
    const headers = ['Group', 'Title', 'Username', 'Password', 'URL', 'Notes'];
    const rows = passwords.map(p => [
      'Generated Passwords',
      p.siteName || 'Generated Password',
      p.username || '',
      p.password,
      p.siteName || '',
      `Generated: ${format(new Date(p.timestamp), 'PPP', { locale: fr })}\nStrength: ${p.strength.level}\nLength: ${p.settings.length}`
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatToLastPass = (passwords: PasswordEntry[]): string => {
    const headers = ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'];
    const rows = passwords.map(p => [
      p.siteName || '',
      p.username || '',
      p.password,
      `Generated: ${format(new Date(p.timestamp), 'PPP', { locale: fr })}`,
      p.siteName || 'Generated Password',
      'Generated Passwords',
      p.isFavorite ? '1' : '0'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatToChrome = (passwords: PasswordEntry[]): string => {
    const headers = ['name', 'url', 'username', 'password'];
    const rows = passwords.map(p => [
      p.siteName || 'Generated Password',
      p.siteName || '',
      p.username || '',
      p.password
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const generateExportData = (format: ExportFormat): string => {
    switch (format) {
      case 'json':
        return formatToJSON(passwords);
      case 'csv':
        return formatToCSV(passwords);
      case '1password':
        return formatTo1Password(passwords);
      case 'bitwarden':
        return formatToBitwarden(passwords);
      case 'keepass':
        return formatToKeePass(passwords);
      case 'lastpass':
        return formatToLastPass(passwords);
      case 'chrome':
        return formatToChrome(passwords);
      default:
        return formatToJSON(passwords);
    }
  };

  const handlePreview = () => {
    try {
      const data = generateExportData(selectedFormat);
      setPreviewData(data);
      setShowPreview(true);
      toast.success('Aperçu généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération de l\'aperçu');
    }
  };

  const handleExport = () => {
    try {
      let data = generateExportData(selectedFormat);
      
      // Apply encryption if enabled
      if (enableEncryption && encryptionPassword) {
        data = encryptData(data, encryptionPassword);
      }
      
      // Create and download file
      const formatInfo = exportFormats[selectedFormat];
      const filename = `passwords_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.${formatInfo.extension}`;
      
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Export réussi: ${filename}`);
      onExport?.(selectedFormat, enableEncryption);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewData);
      toast.success('Aperçu copié dans le presse-papiers');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const formatInfo = exportFormats[selectedFormat];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Avancé des Mots de Passe
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Exportez vos mots de passe vers différents gestionnaires de mots de passe populaires
          </p>
        </CardHeader>
      </Card>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration de l'Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format d'export</Label>
            <Select value={selectedFormat} onValueChange={(value: ExportFormat) => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(exportFormats).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{info.name}</span>
                      {info.popular && <Badge variant="secondary" className="text-xs">Populaire</Badge>}
                      {info.encrypted && <Shield className="w-3 h-3 text-green-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">{formatInfo.name}</h4>
                <p className="text-sm text-muted-foreground">{formatInfo.description}</p>
                <div className="flex flex-wrap gap-1">
                  {formatInfo.compatibility.map((app) => (
                    <Badge key={app} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Encryption Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Chiffrement des données
                </Label>
                <p className="text-xs text-muted-foreground">
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
                <Label htmlFor="encryption-password" className="text-sm">
                  Mot de passe de chiffrement
                </Label>
                <Input
                  id="encryption-password"
                  type="password"
                  placeholder="Entrez un mot de passe fort..."
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                />
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3 mt-0.5" />
                  <span>
                    Attention: Si vous perdez ce mot de passe, vos données seront irrécupérables.
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Export Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{passwords.length}</div>
              <div className="text-xs text-muted-foreground">Mots de passe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {passwords.filter(p => p.siteName).length}
              </div>
              <div className="text-xs text-muted-foreground">Avec site</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {passwords.filter(p => p.username).length}
              </div>
              <div className="text-xs text-muted-foreground">Avec utilisateur</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {passwords.filter(p => p.isFavorite).length}
              </div>
              <div className="text-xs text-muted-foreground">Favoris</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button
              onClick={handleExport}
              disabled={enableEncryption && !encryptionPassword}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter ({passwords.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Aperçu - {formatInfo.name}</CardTitle>
              <Button onClick={copyPreview} size="sm" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={previewData}
              readOnly
              className="min-h-[300px] font-mono text-xs"
              placeholder="L'aperçu apparaîtra ici..."
            />
          </CardContent>
        </Card>
      )}

      {/* Popular Password Managers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gestionnaires de Mots de Passe Populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Recommandés
              </h4>
              <div className="space-y-2 text-sm">
                <div><strong>Bitwarden</strong> - Open source, gratuit, très sécurisé</div>
                <div><strong>1Password</strong> - Interface excellente, fonctionnalités avancées</div>
                <div><strong>KeePass</strong> - Open source, stockage local, très personnalisable</div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Autres Options
              </h4>
              <div className="space-y-2 text-sm">
                <div><strong>LastPass</strong> - Populaire, interface simple</div>
                <div><strong>Chrome/Edge</strong> - Intégré au navigateur</div>
                <div><strong>Dashlane</strong> - Interface moderne, VPN inclus</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordExportAdvanced;