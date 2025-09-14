
/**
 * AppSettings.tsx - Local Application Settings Component
 * Manages user preferences for local storage only (no backend)
 * Handles theme, display preferences, and data export/import
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Download, Upload, Palette, Monitor, Sun, Moon, HardDrive, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Local application settings interface
 * @interface LocalAppSettings
 * @property {string} theme - Theme preference: 'light', 'dark', or 'system'
 * @property {boolean} auto_save - Enable automatic saving of data
 * @property {boolean} compact_view - Use compact view for lists
 * @property {boolean} show_notifications - Show toast notifications
 * @property {string} language - Application language
 * @property {string} last_backup - ISO timestamp of last data backup
 */
interface LocalAppSettings {
  theme: 'light' | 'dark' | 'system';
  auto_save: boolean;
  compact_view: boolean;
  show_notifications: boolean;
  language: 'fr' | 'en';
  last_backup?: string;
}

/**
 * AppSettings Component - Local settings management
 * Handles theme, preferences, and data management for local-only app
 */
export const AppSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Initialize with default local settings
  const [settings, setSettings] = useState<LocalAppSettings>({
    theme: 'system',
    auto_save: true,
    compact_view: false,
    show_notifications: true,
    language: 'fr'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Load user settings from localStorage on component mount
   */
  useEffect(() => {
    const loadSettings = () => {
      try {
        const localSettings = localStorage.getItem('app_settings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setSettings({
            theme: parsed.theme || 'system',
            auto_save: parsed.auto_save ?? true,
            compact_view: parsed.compact_view ?? false,
            show_notifications: parsed.show_notifications ?? true,
            language: parsed.language || 'fr',
            last_backup: parsed.last_backup
          });
          
          // Apply theme if different from current
          if (parsed.theme && parsed.theme !== theme) {
            setTheme(parsed.theme);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les paramètres",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, [theme, setTheme, toast]);

  /**
   * Save settings to localStorage
   */
  const saveSettings = async (newSettings: Partial<LocalAppSettings>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const saveTime = new Date().toISOString();
      
      // Save to localStorage
      localStorage.setItem('app_settings', JSON.stringify({
        ...updatedSettings,
        last_updated: saveTime
      }));
      
      // Update local state
      setSettings(updatedSettings);
      
      if (settings.show_notifications) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Vos préférences ont été enregistrées",
        });
      }
      
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle theme change
   */
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await saveSettings({ theme: newTheme });
  };

  /**
   * Export all application data as JSON
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Collect all localStorage data
      const exportData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
      };
      
      // Add all localStorage items that belong to the app
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('app_') || key.startsWith('user_'))) {
          try {
            exportData.data[key] = JSON.parse(localStorage.getItem(key) || '{}');
          } catch {
            exportData.data[key] = localStorage.getItem(key);
          }
        }
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Update last backup time
      await saveSettings({ last_backup: new Date().toISOString() });
      
      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Import application data from JSON file
   */
  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const importData = JSON.parse(text);
          
          if (importData.data) {
            // Import all data
            Object.entries(importData.data).forEach(([key, value]) => {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            });
            
            // Update settings if available
            if (importData.settings) {
              setSettings(importData.settings);
              if (importData.settings.theme) {
                setTheme(importData.settings.theme);
              }
            }
            
            toast({
              title: "Import réussi",
              description: "Vos données ont été importées",
            });
            
            // Reload page to apply changes
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Erreur d'import",
            description: "Fichier invalide ou corrompu",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      setIsImporting(false);
    }
  };

  /**
   * Clear all application data
   */
  const handleClearData = async () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      try {
        // Clear all app-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('app_') || key.startsWith('user_'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reset settings to default
        const defaultSettings = {
          theme: 'system' as const,
          auto_save: true,
          compact_view: false,
          show_notifications: true,
          language: 'fr' as const
        };
        
        setSettings(defaultSettings);
        setTheme('system');
        
        toast({
          title: "Données effacées",
          description: "Toutes les données ont été supprimées",
        });
        
        // Reload page
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Clear data error:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'effacer les données",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5" />
            Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span className="font-medium">Thème clair</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Interface avec couleurs claires
                </p>
              </div>
              <Switch
                checked={settings.theme === 'light'}
                onCheckedChange={() => handleThemeChange('light')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="font-medium">Thème sombre</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Interface avec couleurs sombres
                </p>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={() => handleThemeChange('dark')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium">Automatique</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suit les préférences du système
                </p>
              </div>
              <Switch
                checked={settings.theme === 'system'}
                onCheckedChange={() => handleThemeChange('system')}
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            Préférences d'affichage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Sauvegarde automatique</span>
              <p className="text-sm text-muted-foreground">
                Sauvegarder automatiquement les modifications
              </p>
            </div>
            <Switch
              checked={settings.auto_save}
              onCheckedChange={(checked) => saveSettings({ auto_save: checked })}
              disabled={isSaving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Vue compacte</span>
              <p className="text-sm text-muted-foreground">
                Affichage plus dense des listes
              </p>
            </div>
            <Switch
              checked={settings.compact_view}
              onCheckedChange={(checked) => saveSettings({ compact_view: checked })}
              disabled={isSaving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Notifications</span>
              <p className="text-sm text-muted-foreground">
                Afficher les notifications de l'application
              </p>
            </div>
            <Switch
              checked={settings.show_notifications}
              onCheckedChange={(checked) => saveSettings({ show_notifications: checked })}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HardDrive className="w-5 h-5" />
            Gestion des données
            <Badge variant="outline" className="text-xs">
              Local uniquement
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              className="w-full"
            >
              {isExporting ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-pulse" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter les données
                </>
              )}
            </Button>
            
            <Button
              onClick={handleImportData}
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              {isImporting ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-pulse" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importer les données
                </>
              )}
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Effacer toutes les données
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Cette action est irréversible. Pensez à exporter vos données avant.
            </p>
          </div>
          
          {settings.last_backup && (
            <div className="text-center p-3 border rounded-lg bg-card">
              <p className="text-sm text-card-foreground">
                Dernière sauvegarde :
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(settings.last_backup), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;
