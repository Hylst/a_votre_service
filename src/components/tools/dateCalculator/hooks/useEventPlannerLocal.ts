/**
 * useEventPlannerLocal.ts
 * Hook pour la gestion des événements en mode local uniquement (sans Supabase)
 * Utilise uniquement le stockage local avec Dexie/IndexedDB
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedDexieManager } from '@/hooks/useUnifiedDexieManager';

export interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  type: 'event' | 'meeting' | 'deadline' | 'reminder' | 'birthday' | 'anniversary';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  location?: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface EventsData {
  events: Event[];
  categories: string[];
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    todayEvents: number;
    overdueEvents: number;
  };
}

interface UserSettings {
  offlineMode: boolean;
  lastSync?: string;
}

const defaultEventsData: EventsData = {
  events: [],
  categories: ['Personnel', 'Travail', 'Famille', 'Santé', 'Loisirs'],
  stats: {
    totalEvents: 0,
    upcomingEvents: 0,
    todayEvents: 0,
    overdueEvents: 0
  }
};

const defaultSettings: UserSettings = {
  offlineMode: true // Toujours en mode local
};

export const useEventPlannerLocal = () => {
  const { toast } = useToast();
  const { saveData, loadData, isInitialized } = useUnifiedDexieManager();
  
  const [eventsData, setEventsData] = useState<EventsData>(defaultEventsData);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Calculer les statistiques
  const updateStats = useCallback((events: Event[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const stats = {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) > today).length,
      todayEvents: events.filter(e => e.date === todayStr).length,
      overdueEvents: events.filter(e => new Date(e.date) < today && e.type === 'deadline').length
    };
    
    return stats;
  }, []);

  // Charger les paramètres utilisateur depuis le stockage local
  const loadUserSettings = useCallback(async (): Promise<UserSettings> => {
    if (!isInitialized) return defaultSettings;

    try {
      const localSettings = await loadData('events-planner', 'user-settings');
      if (localSettings) {
        return {
          offlineMode: true, // Toujours en mode local
          lastSync: localSettings.lastSync || undefined
        };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error loading user settings from local storage:', error);
      return defaultSettings;
    }
  }, [isInitialized, loadData]);

  // Sauvegarder les paramètres utilisateur localement
  const saveUserSettings = useCallback(async (settings: UserSettings) => {
    if (!isInitialized) return;

    try {
      const syncTime = new Date().toISOString();
      const settingsToSave = {
        ...settings,
        lastSync: syncTime
      };
      
      await saveData('events-planner', 'user-settings', settingsToSave);
      setUserSettings(settingsToSave);
      setLastSyncTime(syncTime);
      console.log('✅ Paramètres utilisateur sauvegardés localement');
    } catch (error) {
      console.error('Error saving user settings to local storage:', error);
    }
  }, [isInitialized, saveData]);

  // Charger les événements depuis le stockage local unifié
  const loadEventsFromLocal = useCallback(async (): Promise<EventsData> => {
    if (!isInitialized) return defaultEventsData;

    try {
      const localData = await loadData('events-planner', 'main-data');
      if (localData?.events) {
        const events = localData.events || [];
        return {
          ...defaultEventsData,
          ...localData,
          stats: updateStats(events)
        };
      }
    } catch (error) {
      console.error('Error loading events from local storage:', error);
    }

    return defaultEventsData;
  }, [isInitialized, loadData, updateStats]);

  // Sauvegarder les événements localement
  const saveEventsToLocal = useCallback(async (data: EventsData) => {
    if (!isInitialized) return;

    try {
      await saveData('events-planner', 'main-data', data);
      console.log('✅ Événements sauvegardés localement avec Dexie unifié');
    } catch (error) {
      console.error('Error saving events to local storage:', error);
    }
  }, [isInitialized, saveData]);

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialized) return;
      
      setIsLoading(true);
      
      try {
        console.log('🔄 Chargement initial des données événements (mode local)...');
        
        // Charger les paramètres utilisateur
        const settings = await loadUserSettings();
        setUserSettings(settings);
        setLastSyncTime(settings.lastSync || null);

        // Charger les événements depuis le stockage local unifié
        const finalEventsData = await loadEventsFromLocal();
        setEventsData(finalEventsData);
        
        console.log('✅ Chargement initial terminé (mode local)');
      } catch (error) {
        console.error('Error loading initial data:', error);
        const localData = await loadEventsFromLocal();
        setEventsData(localData);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isInitialized, loadUserSettings, loadEventsFromLocal]);

  // Ajouter un événement
  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tags: eventData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Mettre à jour l'état local immédiatement
      const newEvents = [...eventsData.events, newEvent].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const newEventsData = {
        ...eventsData,
        events: newEvents,
        stats: updateStats(newEvents)
      };
      
      setEventsData(newEventsData);
      await saveEventsToLocal(newEventsData);

      toast({
        title: "Événement ajouté",
        description: `"${newEvent.name}" a été ajouté avec succès`,
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'événement",
        variant: "destructive",
      });
    }
  }, [eventsData, saveEventsToLocal, updateStats, toast]);

  // Mettre à jour un événement
  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    try {
      const newEvents = eventsData.events.map(event =>
        event.id === eventId
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      );

      const newEventsData = {
        ...eventsData,
        events: newEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        stats: updateStats(newEvents)
      };

      setEventsData(newEventsData);
      await saveEventsToLocal(newEventsData);

      toast({
        title: "Événement modifié",
        description: "L'événement a été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'événement",
        variant: "destructive",
      });
    }
  }, [eventsData, saveEventsToLocal, updateStats, toast]);

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const newEvents = eventsData.events.filter(event => event.id !== eventId);
      const newEventsData = {
        ...eventsData,
        events: newEvents,
        stats: updateStats(newEvents)
      };

      setEventsData(newEventsData);
      await saveEventsToLocal(newEventsData);

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
  }, [eventsData, saveEventsToLocal, updateStats, toast]);



  // Basculer le mode offline/online (toujours offline en mode local)
  const toggleOfflineMode = useCallback(async () => {
    toast({
      title: "Mode local uniquement",
      description: "Cette application fonctionne uniquement en mode local",
    });
  }, [toast]);

  // Exporter les données
  const exportData = useCallback(() => {
    try {
      const dataToExport = {
        tool: 'event-planner',
        exportDate: new Date().toISOString(),
        version: "2.0",
        data: eventsData
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Les événements ont été exportés avec succès",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  }, [eventsData, toast]);

  // Importer les données
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      if (!importedData.data || importedData.tool !== 'event-planner') {
        throw new Error('Format de fichier incorrect');
      }
      
      const importedEventsData = {
        ...defaultEventsData,
        ...importedData.data,
        stats: updateStats(importedData.data.events || [])
      };
      
      setEventsData(importedEventsData);
      await saveEventsToLocal(importedEventsData);
      
      toast({
        title: "Import réussi",
        description: "Les événements ont été importés avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Erreur d'import",
        description: "Format de fichier incorrect ou données corrompues",
        variant: "destructive",
      });
      return false;
    }
  }, [saveEventsToLocal, updateStats, toast]);

  return {
    events: eventsData.events,
    categories: eventsData.categories,
    stats: eventsData.stats,
    userSettings,
    isLoading,
    isSyncing: false, // Toujours false en mode local
    lastSyncTime,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleOfflineMode,
    exportData,
    importData
  };
};