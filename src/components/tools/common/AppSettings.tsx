
/**
 * AppSettings.tsx - Application Settings Component
 * Manages user preferences for data storage modes (Local vs Supabase)
 * and synchronization settings with improved UI and terminology
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Cloud, CloudOff, Wifi, WifiOff, Loader2, RefreshCw, Database, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedDexieManager } from '@/hooks/useUnifiedDexieManager';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * User application settings interface
 * @interface UserAppSettings
 * @property {boolean} local_mode - True for local-only storage, false for Supabase sync
 * @property {boolean} sync_enabled - Enable automatic synchronization (only applies in Supabase mode)
 * @property {string} last_sync - ISO timestamp of last successful sync
 */
interface UserAppSettings {
  local_mode: boolean;  // Renamed from offline_mode for clarity
  sync_enabled: boolean;
  last_sync?: string;
}

/**
 * AppSettings Component - Main settings management component
 * Handles local vs Supabase storage modes with improved UX
 */
export const AppSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exportAllData } = useUnifiedDexieManager();
  
  // Initialize with local mode as default (as requested by user)
  const [settings, setSettings] = useState<UserAppSettings>({
    local_mode: true,  // Default to local mode
    sync_enabled: false  // Disabled by default in local mode
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Enhanced network connectivity detection with actual network testing
  // This replaces the unreliable navigator.onLine with real connectivity checks
  const { isOnline, isConnecting, lastChecked, checkNow, isReliable } = useNetworkStatus({
    checkInterval: 30000, // Check every 30 seconds
    timeout: 5000 // 5 second timeout for network tests
  });

  /**
   * Load user settings from Supabase with localStorage fallback
   * Maintains backward compatibility with old property names
   */
  useEffect(() => {
    const loadSettings = async () => {
      // Always try to load from localStorage first
      const localSettings = localStorage.getItem('app_settings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setSettings({
            local_mode: parsed.local_mode ?? parsed.offline_mode ?? true,  // Backward compatibility
            sync_enabled: parsed.sync_enabled ?? false,
            last_sync: parsed.last_sync
          });
        } catch (error) {
          console.error('Error parsing local settings:', error);
        }
      }

      // If user is logged in, try to load from Supabase
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_app_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors du chargement des paramètres:', error);
          return;
        }

        if (data) {
          const loadedSettings = {
            local_mode: data.local_mode ?? data.offline_mode ?? true,  // Backward compatibility
            sync_enabled: data.sync_enabled ?? false,
            last_sync: data.last_sync || undefined
          };
          setSettings(loadedSettings);
          
          // Also save to localStorage for faster access
          localStorage.setItem('app_settings', JSON.stringify(loadedSettings));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  /**
   * Save settings to localStorage first, then to Supabase if in Supabase mode
   * This ensures data is always saved locally before attempting remote sync
   */
  const saveSettings = async (newSettings: Partial<UserAppSettings>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const syncTime = new Date().toISOString();
      
      // Always save to localStorage first (as requested by user)
      localStorage.setItem('app_settings', JSON.stringify({
        ...updatedSettings,
        last_sync: syncTime
      }));
      
      // Update local state immediately
      setSettings({
        ...updatedSettings,
        last_sync: syncTime
      });

      // If user is logged in and not in local mode, also save to Supabase
      if (user && !updatedSettings.local_mode) {
        try {
          // Check if record exists
          const { data: existingData } = await supabase
            .from('user_app_settings')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingData) {
            // Update existing record
            const { error } = await supabase
              .from('user_app_settings')
              .update({
                local_mode: updatedSettings.local_mode,
                sync_enabled: updatedSettings.sync_enabled,
                last_sync: syncTime,
                updated_at: syncTime
              })
              .eq('user_id', user.id);

            if (error) throw error;
          } else {
            // Insert new record
            const { error } = await supabase
              .from('user_app_settings')
              .insert({
                user_id: user.id,
                local_mode: updatedSettings.local_mode,
                sync_enabled: updatedSettings.sync_enabled,
                last_sync: syncTime,
                updated_at: syncTime
              });

            if (error) throw error;
          }
        } catch (supabaseError) {
          console.error('Supabase save error (data still saved locally):', supabaseError);
          toast({
            title: "Sauvegarde partielle",
            description: "Paramètres sauvés localement, synchronisation échouée",
            variant: "destructive",
          });
          return;
        }
      }
      
      toast({
        title: "Paramètres sauvegardés",
        description: updatedSettings.local_mode 
          ? "Vos préférences ont été sauvées localement"
          : "Vos préférences ont été synchronisées",
      });
      
      console.log('✅ Paramètres utilisateur sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
   * Toggle between local mode and Supabase mode
   * Local mode: data saved only in localStorage (default)
   * Supabase mode: data saved in localStorage first, then synced to Supabase
   */
  const handleLocalModeToggle = async (enabled: boolean) => {
    await saveSettings({ local_mode: !enabled });
    
    toast({
      title: enabled ? "Mode en ligne activé" : "Mode hors ligne activé",
      description: enabled 
        ? "Synchronisation avec le serveur activée"
        : "Les données sont sauvegardées localement uniquement",
    });
  };

  /**
   * Toggle automatic synchronization when in Supabase mode
   * Only relevant when local_mode is false
   */
  const handleSyncToggle = async (enabled: boolean) => {
    await saveSettings({ sync_enabled: enabled });
  };

  /**
   * Manually trigger synchronization with Supabase
   * Only available when user is logged in and not in local mode
   */
  const handleManualSync = async () => {
    if (!user || settings.local_mode) {
      toast({
        title: "Synchronisation impossible",
        description: "Vous devez être connecté et en mode Supabase",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Force a save to Supabase with current settings
      const syncTime = new Date().toISOString();
      
      // Check if record exists
      const { data: existingData } = await supabase
        .from('user_app_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_app_settings')
          .update({
            local_mode: settings.local_mode,
            sync_enabled: settings.sync_enabled,
            last_sync: syncTime,
            updated_at: syncTime
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_app_settings')
          .insert({
            user_id: user.id,
            local_mode: settings.local_mode,
            sync_enabled: settings.sync_enabled,
            last_sync: syncTime,
            updated_at: syncTime
          });

        if (error) throw error;
      }
      
      // Update local state and localStorage
      const updatedSettings = { ...settings, last_sync: syncTime };
      setSettings(updatedSettings);
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      
      toast({
        title: "Synchronisation réussie",
        description: "Vos données ont été synchronisées avec Supabase",
      });
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec Supabase",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chargement des paramètres...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sauvegarde données
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Sauvegarde...
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Badge 
                variant={isOnline ? "default" : "secondary"} 
                className={`text-xs cursor-pointer transition-colors ${
                  isConnecting ? 'animate-pulse' : ''
                }`}
                onClick={checkNow}
                title={`Cliquez pour vérifier la connectivité${lastChecked ? ` • Dernière vérification: ${format(lastChecked, 'HH:mm:ss')}` : ''}`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Test...
                  </>
                ) : isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    En ligne {isReliable ? '✓' : '?'}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Hors ligne {isReliable ? '✗' : '?'}
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode local/supabase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {settings.local_mode ? (
                  <HardDrive className="w-4 h-4 text-orange-500" />
                ) : (
                  <Cloud className="w-4 h-4 text-blue-500" />
                )}
                <span className="font-medium">Mode de stockage</span>
              </div>
              <p className="text-sm text-gray-500">
                {settings.local_mode 
                  ? "Les données sont sauvegardées localement uniquement"
                  : "Synchronisation automatique avec le serveur"
                }
              </p>
            </div>
            <Switch
              checked={!settings.local_mode}
              onCheckedChange={handleLocalModeToggle}
              disabled={isSaving}
            />
          </div>

          {/* Mode Supabase */}
          {!settings.local_mode && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span className="text-sm font-medium">Mode Supabase</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Données sauvées localement puis synchronisées avec Supabase
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Actif
                </span>
              </div>
            </div>
          )}

          {/* Synchronisation automatique */}
          {!settings.local_mode && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Synchronisation automatique</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Synchroniser automatiquement avec Supabase en arrière-plan
                </p>
              </div>
              <Switch
                checked={settings.sync_enabled}
                onCheckedChange={handleSyncToggle}
                disabled={isSaving}
              />
            </div>
          )}
        </div>

        {/* Bouton de synchronisation manuelle */}
        {!settings.local_mode && isOnline && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleManualSync}
              disabled={isSyncing || isSaving}
              variant="outline"
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Synchronisation en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synchroniser maintenant
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Synchronisation manuelle des données locales vers le serveur
            </p>
          </div>
        )}

        {/* Indicateurs de statut */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg text-center bg-background">
            <div className="flex items-center justify-center gap-2 mb-2">
              {settings.local_mode ? (
                <HardDrive className="h-4 w-4 text-orange-500" />
              ) : (
                <Cloud className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm font-medium">
                {settings.local_mode ? 'Local' : 'Supabase'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.local_mode ? 'Navigateur uniquement' : 'Local + Cloud'}
            </p>
          </div>

          <div className="p-3 border rounded-lg text-center bg-background">
            <div className="flex items-center justify-center gap-2 mb-2">
              {settings.sync_enabled && !settings.local_mode ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : settings.local_mode ? (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {settings.local_mode ? 'N/A' : (settings.sync_enabled ? 'Activée' : 'Désactivée')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.local_mode ? 'Mode local' : 'Synchronisation'}
            </p>
          </div>
        </div>

        {/* Dernière synchronisation */}
        {settings.last_sync && !settings.local_mode && (
          <div className="text-center p-3 border rounded-lg bg-background">
            <p className="text-sm text-foreground">
              Dernière synchronisation :
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(settings.last_sync), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
