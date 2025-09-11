/**
 * TimeZoneClockTab.tsx
 * World clocks display tab with search, favorites, and comparison functionality
 * Extracted from the original TimeZoneTab component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Copy, Clock, MapPin, Heart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

export const TimeZoneClockTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const { toast } = useToast();
  
  const {
    currentTime,
    favorites,
    selectedForComparison,
    timeZones,
    toggleFavorite,
    toggleComparison,
    getTimeInTimezone,
    getDateInTimezone
  } = useTimeZoneContext();

  // Filter timezones based on search and favorites
  const filteredTimeZones = timeZones.filter(tz => {
    const matchesSearch = tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tz.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = showFavoritesOnly ? favorites.includes(tz.name) : true;
    return matchesSearch && matchesFavorites;
  });

  // Toggle comparison mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  // Copy time to clipboard
  const copyTime = (timezoneName: string, time: string) => {
    const timezone = timeZones.find(tz => tz.name === timezoneName);
    const textToCopy = `${timezone?.city}: ${time} (${getDateInTimezone(timezoneName)})`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Heure copiée',
      description: `L'heure de ${timezone?.city} a été copiée dans le presse-papiers.`,
    });
  };

  // Handle comparison toggle with limit check
  const handleComparisonToggle = (timezoneName: string) => {
    if (selectedForComparison.includes(timezoneName)) {
      toggleComparison(timezoneName);
    } else if (selectedForComparison.length < 4) {
      toggleComparison(timezoneName);
    } else {
      toast({
        title: 'Limite atteinte',
        description: 'Vous pouvez comparer jusqu\'à 4 fuseaux horaires à la fois.',
        variant: 'destructive'
      });
    }
  };

  // Calculate time difference between two timezones
  const getTimeDifference = (tz1: string, tz2: string) => {
    const time1 = new Date(currentTime.toLocaleString('en-US', {timeZone: tz1}));
    const time2 = new Date(currentTime.toLocaleString('en-US', {timeZone: tz2}));
    const diff = Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
    return `${Math.floor(diff)}h${Math.round((diff % 1) * 60)}min`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="shadow-lg border-2">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une ville ou un pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={compareMode ? 'default' : 'outline'} 
                size="sm" 
                onClick={toggleCompareMode}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Comparaison {selectedForComparison.length > 0 && `(${selectedForComparison.length})`}
              </Button>
              <Button 
                variant={showFavoritesOnly ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Favoris {showFavoritesOnly && `(${favorites.length})`}
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horloges ({filteredTimeZones.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Panel */}
      {compareMode && selectedForComparison.length > 1 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <Heart className="w-5 h-5 text-blue-600" />
              Comparaison des Fuseaux Horaires ({selectedForComparison.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {selectedForComparison.map((tzName) => {
                const tz = timeZones.find(t => t.name === tzName);
                if (!tz) return null;
                
                return (
                  <div key={tzName} className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-1">
                      {tz.city}
                    </h4>
                    <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">
                      {getTimeInTimezone(tzName)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {getDateInTimezone(tzName)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Time Differences */}
            {selectedForComparison.length === 2 && (
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Différence: {getTimeDifference(selectedForComparison[0], selectedForComparison[1])}
                </p>
              </div>
            )}
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  selectedForComparison.forEach(tz => toggleComparison(tz));
                  setCompareMode(false);
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Effacer la comparaison
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timezone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTimeZones.map((tz) => {
          const isFavorite = favorites.includes(tz.name);
          const isSelected = selectedForComparison.includes(tz.name);
          const timeInZone = getTimeInTimezone(tz.name);
          const dateInZone = getDateInTimezone(tz.name);
          
          return (
            <Card 
              key={tz.name} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isSelected 
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-400 dark:border-blue-500' 
                  : 'bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 border-2 border-slate-200 dark:border-slate-600'
              }`}
            >
              <CardContent className="p-6">
                {/* Header with City, Favorite, and Selection */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                      {tz.city}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {tz.country}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {compareMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComparisonToggle(tz.name)}
                        className={`p-1 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(tz.name)}
                      className={`p-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {timeInZone}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {dateInZone}
                  </div>
                </div>

                {/* Timezone Info */}
                <div className="flex justify-center mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {tz.abbreviation} ({tz.offset})
                  </Badge>
                </div>

                {/* Comparison Info */}
                {isSelected && selectedForComparison.length > 1 && (
                  <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-center">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Sélectionné pour comparaison
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTime(tz.name, timeInZone)}
                    className="flex-1 flex items-center gap-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copier
                  </Button>
                  {compareMode ? (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleComparisonToggle(tz.name)}
                      className="flex-1 flex items-center gap-1 text-xs"
                    >
                      <Heart className="w-3 h-3" />
                      {isSelected ? 'Retiré' : 'Ajouter'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCompareMode(true);
                        handleComparisonToggle(tz.name);
                      }}
                      className="flex-1 flex items-center gap-1 text-xs"
                    >
                      <MapPin className="w-3 h-3" />
                      Comparer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};