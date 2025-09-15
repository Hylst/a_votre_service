/**
 * PasswordImportAdvanced.tsx
 * Advanced import component supporting multiple password manager formats with validation
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PasswordEntry } from './hooks/usePasswordGeneratorEnhanced';
import { 
  SupportedFormat, 
  ImportResult, 
  getParser, 
  getFormatMetadata, 
  detectFormat,
  getImportFormats 
} from './parsers';

interface PasswordImportAdvancedProps {
  onImport: (passwords: PasswordEntry[]) => void;
  className?: string;
}

interface FileUploadState {
  file: File | null;
  content: string | ArrayBuffer | null;
  detectedFormat: SupportedFormat | null;
  selectedFormat: SupportedFormat | null;
  isProcessing: boolean;
  error: string | null;
  previewData: PasswordEntry[] | null;
  requiresPassword: boolean;
  decryptionPassword: string;
}

export const PasswordImportAdvanced: React.FC<PasswordImportAdvancedProps> = ({
  onImport,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    content: null,
    detectedFormat: null,
    selectedFormat: null,
    isProcessing: false,
    error: null,
    previewData: null,
    requiresPassword: false,
    decryptionPassword: ''
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Formats supportés pour l'import
  const importFormats = getImportFormats();

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Sélection de fichier
  const handleFileSelect = async (file: File) => {
    setUploadState(prev => ({
      ...prev,
      file,
      content: null,
      detectedFormat: null,
      selectedFormat: null,
      error: null,
      previewData: null,
      isProcessing: true,
      requiresPassword: false
    }));

    try {
      // Lire le contenu du fichier
      const content = await readFileContent(file);
      
      // Détecter automatiquement le format
      const detectedFormat = await detectFormat(content, file.name);
      
      setUploadState(prev => ({
        ...prev,
        content,
        detectedFormat,
        selectedFormat: detectedFormat,
        isProcessing: false
      }));
      
      if (detectedFormat) {
        toast.success(`Format détecté automatiquement : ${getFormatMetadata(detectedFormat)?.name}`);
      } else {
        toast.info('Format non détecté automatiquement. Veuillez sélectionner le format manuellement.');
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: `Erreur lors de la lecture du fichier : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        isProcessing: false
      }));
    }
  };

  // Lecture du contenu du fichier
  const readFileContent = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result);
        } else {
          reject(new Error('Impossible de lire le fichier'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      
      // Lire comme texte pour la plupart des formats
      if (file.name.toLowerCase().endsWith('.kdbx')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'utf-8');
      }
    });
  };

  // Prévisualisation des données
  const handlePreview = async () => {
    if (!uploadState.content || !uploadState.selectedFormat) {
      toast.error('Veuillez sélectionner un fichier et un format');
      return;
    }

    setUploadState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const parser = getParser(uploadState.selectedFormat);
      if (!parser) {
        throw new Error('Parseur non trouvé pour ce format');
      }

      // Vérifier si le format nécessite un mot de passe
      const formatMeta = getFormatMetadata(uploadState.selectedFormat);
      if (formatMeta?.requiresPassword && !uploadState.decryptionPassword) {
        setUploadState(prev => ({ 
          ...prev, 
          requiresPassword: true, 
          isProcessing: false 
        }));
        return;
      }

      // Parser les données
      const result: ImportResult = await parser.parse(uploadState.content, {
        password: uploadState.decryptionPassword || undefined
      });

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du parsing');
      }

      setUploadState(prev => ({
        ...prev,
        previewData: result.passwords,
        isProcessing: false,
        error: null
      }));
      
      setShowPreview(true);
      toast.success(`${result.passwords.length} mots de passe trouvés`);
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la prévisualisation',
        isProcessing: false
      }));
    }
  };

  // Import final
  const handleImport = () => {
    if (!uploadState.previewData) {
      toast.error('Aucune donnée à importer');
      return;
    }

    onImport(uploadState.previewData);
    toast.success(`${uploadState.previewData.length} mots de passe importés avec succès`);
    
    // Reset de l'état
    setUploadState({
      file: null,
      content: null,
      detectedFormat: null,
      selectedFormat: null,
      isProcessing: false,
      error: null,
      previewData: null,
      requiresPassword: false,
      decryptionPassword: ''
    });
    setShowPreview(false);
  };

  // Reset
  const handleReset = () => {
    setUploadState({
      file: null,
      content: null,
      detectedFormat: null,
      selectedFormat: null,
      isProcessing: false,
      error: null,
      previewData: null,
      requiresPassword: false,
      decryptionPassword: ''
    });
    setShowPreview(false);
  };

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Avancé
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Importez vos mots de passe depuis différents gestionnaires populaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de drop de fichier */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border/50 hover:border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-card-foreground font-medium">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou cliquez pour sélectionner
              </p>
            </div>
            <Input
              type="file"
              accept=".json,.csv,.1pif,.kdbx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" className="pointer-events-none">
                <FileText className="h-4 w-4 mr-2" />
                Sélectionner un fichier
              </Button>
            </Label>
          </div>
        </div>

        {/* Informations sur le fichier sélectionné */}
        {uploadState.file && (
          <Card className="bg-secondary/20 border-border/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{uploadState.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadState.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {uploadState.detectedFormat && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                      {getFormatMetadata(uploadState.detectedFormat)?.name}
                    </Badge>
                  )}
                </div>
                
                {/* Sélection manuelle du format */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Format du fichier</Label>
                  <Select 
                    value={uploadState.selectedFormat || ''} 
                    onValueChange={(value) => 
                      setUploadState(prev => ({ 
                        ...prev, 
                        selectedFormat: value as SupportedFormat 
                      }))
                    }
                  >
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue placeholder="Sélectionnez le format" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/50">
                      {importFormats.map((format) => {
                        const metadata = getFormatMetadata(format);
                        return (
                          <SelectItem key={format} value={format}>
                            <div className="flex items-center gap-2">
                              <span>{metadata?.name}</span>
                              {metadata?.encrypted && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mot de passe de déchiffrement */}
                {uploadState.requiresPassword && (
                  <div className="space-y-2">
                    <Label className="text-card-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mot de passe de déchiffrement
                    </Label>
                    <Input
                      type="password"
                      value={uploadState.decryptionPassword}
                      onChange={(e) => 
                        setUploadState(prev => ({ 
                          ...prev, 
                          decryptionPassword: e.target.value 
                        }))
                      }
                      placeholder="Saisissez le mot de passe..."
                      className="bg-background border-border/50"
                    />
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePreview}
                    disabled={!uploadState.selectedFormat || uploadState.isProcessing}
                    variant="outline"
                    size="sm"
                  >
                    {uploadState.isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Analyse...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        Prévisualiser
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erreurs */}
        {uploadState.error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {uploadState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Prévisualisation des données */}
        {showPreview && uploadState.previewData && (
          <Card className="bg-secondary/20 border-border/30">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center justify-between">
                <span>Prévisualisation ({uploadState.previewData.length} mots de passe)</span>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="ghost"
                  size="sm"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadState.previewData.slice(0, 10).map((password, index) => (
                  <div key={index} className="p-3 bg-background/50 rounded border border-border/30">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-card-foreground">Site:</span>
                        <span className="ml-2 text-muted-foreground">
                          {password.siteName || 'Non spécifié'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">Utilisateur:</span>
                        <span className="ml-2 text-muted-foreground">
                          {password.username || 'Non spécifié'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {uploadState.previewData.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ... et {uploadState.previewData.length - 10} autres mots de passe
                  </p>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={handleImport} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Importer {uploadState.previewData.length} mot(s) de passe
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formats supportés */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Formats supportés</h4>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>JSON :</strong> Bitwarden, Dashlane, Application</p>
            <p><strong>CSV :</strong> 1Password, Bitwarden, LastPass, KeePass, Chrome, Edge, Dashlane</p>
            <p><strong>1PIF :</strong> 1Password Interchange Format</p>
            <p><strong>KDBX :</strong> KeePass (bientôt disponible)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordImportAdvanced;