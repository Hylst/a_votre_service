/**
 * TimeZoneAdvanced.tsx
 * Enhanced timezone tool with 6 tabs: Horloges, Convertisseur, Comparaison, Réunions, Recherche, Favoris
 * Provides comprehensive timezone management with modern tabbed interface
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Clock, ArrowRightLeft, BarChart3, Users, Search, Star } from 'lucide-react';

// Import tab components
import { TimeZoneClockTab } from './timezone/TimeZoneClockTab';
import { TimeZoneConverterTab } from './timezone/TimeZoneConverterTab';
import { TimeZoneComparisonTab } from './timezone/TimeZoneComparisonTab';
import { TimeZoneMeetingTab } from './timezone/TimeZoneMeetingTab';
import { TimeZoneSearchTab } from './timezone/TimeZoneSearchTab';
import { TimeZoneFavoritesTab } from './timezone/TimeZoneFavoritesTab';

// Timezone data interface
export interface TimeZoneData {
  name: string;
  city: string;
  country: string;
  abbreviation: string;
  offset: string;
}

// Shared state context
interface TimeZoneContextType {
  currentTime: Date;
  favorites: string[];
  selectedForComparison: string[];
  timeZones: TimeZoneData[];
  toggleFavorite: (timezoneName: string) => void;
  toggleComparison: (timezoneName: string) => void;
  getTimeInTimezone: (timezoneName: string) => string;
  getDateInTimezone: (timezoneName: string) => string;
}

const TimeZoneContext = createContext<TimeZoneContextType | undefined>(undefined);

export const useTimeZoneContext = () => {
  const context = useContext(TimeZoneContext);
  if (!context) {
    throw new Error('useTimeZoneContext must be used within TimeZoneAdvanced');
  }
  return context;
};

export const TimeZoneAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('horloges');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [favorites, setFavorites] = useState<string[]>(['Europe/Paris', 'America/New_York']);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Extended timezone data
  const timeZones: TimeZoneData[] = [
    { name: 'Europe/Paris', city: 'Paris', country: 'France', abbreviation: 'CET', offset: '+1' },
    { name: 'Europe/London', city: 'Londres', country: 'Royaume-Uni', abbreviation: 'GMT', offset: '+0' },
    { name: 'America/New_York', city: 'New York', country: 'États-Unis', abbreviation: 'EST', offset: '-5' },
    { name: 'America/Los_Angeles', city: 'Los Angeles', country: 'États-Unis', abbreviation: 'PST', offset: '-8' },
    { name: 'Asia/Tokyo', city: 'Tokyo', country: 'Japon', abbreviation: 'JST', offset: '+9' },
    { name: 'Asia/Shanghai', city: 'Shanghai', country: 'Chine', abbreviation: 'CST', offset: '+8' },
    { name: 'Australia/Sydney', city: 'Sydney', country: 'Australie', abbreviation: 'AEDT', offset: '+11' },
    { name: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brésil', abbreviation: 'BRT', offset: '-3' },
    { name: 'Europe/Berlin', city: 'Berlin', country: 'Allemagne', abbreviation: 'CET', offset: '+1' },
    { name: 'Asia/Dubai', city: 'Dubaï', country: 'EAU', abbreviation: 'GST', offset: '+4' },
    { name: 'America/Chicago', city: 'Chicago', country: 'États-Unis', abbreviation: 'CST', offset: '-6' },
    { name: 'Asia/Singapore', city: 'Singapour', country: 'Singapour', abbreviation: 'SGT', offset: '+8' },
    { name: 'Europe/Moscow', city: 'Moscou', country: 'Russie', abbreviation: 'MSK', offset: '+3' },
    { name: 'Asia/Mumbai', city: 'Mumbai', country: 'Inde', abbreviation: 'IST', offset: '+5:30' },
    { name: 'Europe/Rome', city: 'Rome', country: 'Italie', abbreviation: 'CET', offset: '+1' },
    { name: 'America/Mexico_City', city: 'Mexico', country: 'Mexique', abbreviation: 'CST', offset: '-6' },
    { name: 'Africa/Cairo', city: 'Le Caire', country: 'Égypte', abbreviation: 'EET', offset: '+2' },
    { name: 'Asia/Seoul', city: 'Séoul', country: 'Corée du Sud', abbreviation: 'KST', offset: '+9' },
    { name: 'Europe/Madrid', city: 'Madrid', country: 'Espagne', abbreviation: 'CET', offset: '+1' },
    { name: 'America/Toronto', city: 'Toronto', country: 'Canada', abbreviation: 'EST', offset: '-5' },
    { name: 'Asia/Bangkok', city: 'Bangkok', country: 'Thaïlande', abbreviation: 'ICT', offset: '+7' },
    { name: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Pays-Bas', abbreviation: 'CET', offset: '+1' }
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle favorite timezone
  const toggleFavorite = (timezoneName: string) => {
    setFavorites(prev => 
      prev.includes(timezoneName) 
        ? prev.filter(fav => fav !== timezoneName)
        : [...prev, timezoneName]
    );
  };

  // Toggle comparison selection
  const toggleComparison = (timezoneName: string) => {
    setSelectedForComparison(prev => 
      prev.includes(timezoneName)
        ? prev.filter(tz => tz !== timezoneName)
        : prev.length < 4 ? [...prev, timezoneName] : prev
    );
  };

  // Get time in specific timezone
  const getTimeInTimezone = (timezoneName: string) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezoneName,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString('fr-FR');
    }
  };

  // Get date in specific timezone
  const getDateInTimezone = (timezoneName: string) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezoneName,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleDateString('fr-FR');
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'horloges', label: 'Horloges', icon: Clock, component: TimeZoneClockTab },
    { id: 'convertisseur', label: 'Convertisseur', icon: ArrowRightLeft, component: TimeZoneConverterTab },
    { id: 'comparaison', label: 'Comparaison', icon: BarChart3, component: TimeZoneComparisonTab },
    { id: 'reunions', label: 'Réunions', icon: Users, component: TimeZoneMeetingTab },
    { id: 'recherche', label: 'Recherche', icon: Search, component: TimeZoneSearchTab },
    { id: 'favoris', label: 'Favoris', icon: Star, component: TimeZoneFavoritesTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TimeZoneClockTab;

  const contextValue: TimeZoneContextType = {
    currentTime,
    favorites,
    selectedForComparison,
    timeZones,
    toggleFavorite,
    toggleComparison,
    getTimeInTimezone,
    getDateInTimezone
  };

  return (
    <TimeZoneContext.Provider value={contextValue}>
      <div className="space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
              <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
              Fuseaux Horaires Avancés
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Card
                key={tab.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isActive 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl border-0' 
                    : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mb-2 flex justify-center ${
                    isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {tab.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[600px]">
          <ActiveComponent />
        </div>
      </div>
    </TimeZoneContext.Provider>
  );
};