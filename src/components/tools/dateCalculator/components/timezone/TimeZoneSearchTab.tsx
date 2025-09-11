/**
 * TimeZoneSearchTab.tsx
 * Advanced search and timezone discovery with filtering and detailed information
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Globe, Star, Copy, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

type SortOption = 'name' | 'time' | 'offset' | 'country';
type SortDirection = 'asc' | 'desc';

interface FilterOptions {
  continent: string;
  offsetRange: string;
  isDaytime: string;
}

export const TimeZoneSearchTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    continent: 'all',
    offsetRange: 'all',
    isDaytime: 'all'
  });
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { timeZones, favorites, toggleFavorite, getTimeInTimezone, getDateInTimezone } = useTimeZoneContext();

  // Get unique continents from timezone data
  const continents = Array.from(new Set(
    timeZones.map(tz => tz.name.split('/')[0])
  )).sort();

  // Get offset ranges
  const offsetRanges = [
    { label: 'UTC-12 à UTC-6', min: -12, max: -6 },
    { label: 'UTC-5 à UTC-1', min: -5, max: -1 },
    { label: 'UTC+0 à UTC+5', min: 0, max: 5 },
    { label: 'UTC+6 à UTC+12', min: 6, max: 12 },
    { label: 'UTC+13 à UTC+14', min: 13, max: 14 }
  ];

  // Parse offset string to number
  const parseOffset = (offsetStr: string): number => {
    const match = offsetStr.match(/([+-]?)(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2]);
    const minutes = parseInt(match[3]);
    return sign * (hours + minutes / 60);
  };

  // Check if timezone is in daytime
  const isDaytime = (timezoneName: string): boolean => {
    const time = getTimeInTimezone(timezoneName);
    const hour = parseInt(time.split(':')[0]);
    return hour >= 6 && hour < 20;
  };

  // Filter and sort timezones
  const filteredAndSortedTimezones = timeZones
    .filter(tz => {
      // Text search
      const matchesSearch = !searchTerm || 
        tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Continent filter
      const matchesContinent = !filters.continent || filters.continent === 'all' || 
        tz.name.startsWith(filters.continent);

      // Offset range filter
      const matchesOffset = !filters.offsetRange || filters.offsetRange === 'all' || (() => {
        const range = offsetRanges.find(r => r.label === filters.offsetRange);
        if (!range) return true;
        const tzOffset = parseOffset(tz.offset);
        return tzOffset >= range.min && tzOffset <= range.max;
      })();

      // Daytime filter
      const matchesDaytime = !filters.isDaytime || filters.isDaytime === 'all' || (() => {
        const isDay = isDaytime(tz.name);
        return filters.isDaytime === 'day' ? isDay : !isDay;
      })();

      return matchesSearch && matchesContinent && matchesOffset && matchesDaytime;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.city.localeCompare(b.city);
          break;
        case 'time':
          const timeA = getTimeInTimezone(a.name);
          const timeB = getTimeInTimezone(b.name);
          comparison = timeA.localeCompare(timeB);
          break;
        case 'offset':
          const offsetA = parseOffset(a.offset);
          const offsetB = parseOffset(b.offset);
          comparison = offsetA - offsetB;
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      continent: 'all',
      offsetRange: 'all',
      isDaytime: 'all'
    });
    setSearchTerm('');
  };

  // Copy timezone info
  const copyTimezoneInfo = (tz: any) => {
    const time = getTimeInTimezone(tz.name);
    const date = getDateInTimezone(tz.name);
    const textToCopy = `${tz.city} (${tz.country})\nHeure locale: ${time}\nDate: ${date}\nFuseau: ${tz.abbreviation} (${tz.offset})\nIdentifiant: ${tz.name}`;
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Informations copiées',
      description: `Les informations de ${tz.city} ont été copiées.`,
    });
  };

  // Get timezone details for selected timezone
  const getTimezoneDetails = (timezoneName: string) => {
    const tz = timeZones.find(t => t.name === timezoneName);
    if (!tz) return null;
    
    const time = getTimeInTimezone(timezoneName);
    const date = getDateInTimezone(timezoneName);
    const isDay = isDaytime(timezoneName);
    const offset = parseOffset(tz.offset);
    
    return {
      ...tz,
      currentTime: time,
      currentDate: date,
      isDaytime: isDay,
      numericOffset: offset
    };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Search className="w-5 h-5 text-purple-600" />
            Recherche Avancée de Fuseaux Horaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par ville, pays ou identifiant de fuseau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.continent} onValueChange={(value) => setFilters({...filters, continent: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les continents</SelectItem>
                {continents.map(continent => (
                  <SelectItem key={continent} value={continent}>
                    {continent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.offsetRange} onValueChange={(value) => setFilters({...filters, offsetRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Décalage UTC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les décalages</SelectItem>
                {offsetRanges.map(range => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.isDaytime} onValueChange={(value) => setFilters({...filters, isDaytime: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Jour et nuit</SelectItem>
                <SelectItem value="day">Jour seulement</SelectItem>
                <SelectItem value="night">Nuit seulement</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Effacer
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Trier par:</span>
            {(['name', 'time', 'offset', 'country'] as SortOption[]).map(option => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option)}
                className="text-xs"
              >
                {option === 'name' && 'Nom'}
                {option === 'time' && 'Heure'}
                {option === 'offset' && 'Décalage'}
                {option === 'country' && 'Pays'}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortDirection}
              className="flex items-center gap-1"
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredAndSortedTimezones.length} fuseau{filteredAndSortedTimezones.length > 1 ? 'x' : ''} horaire{filteredAndSortedTimezones.length > 1 ? 's' : ''} trouvé{filteredAndSortedTimezones.length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedTimezones.map((tz) => {
          const isFavorite = favorites.includes(tz.name);
          const time = getTimeInTimezone(tz.name);
          const date = getDateInTimezone(tz.name);
          const isDay = isDaytime(tz.name);
          
          return (
            <Card 
              key={tz.name}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedTimezone === tz.name 
                  ? 'border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-2 border-slate-200 dark:border-slate-600'
              } ${
                isDay 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10'
                  : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10'
              }`}
              onClick={() => setSelectedTimezone(selectedTimezone === tz.name ? null : tz.name)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                      {tz.city}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {tz.country}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tz.name);
                      }}
                      className={`p-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyTimezoneInfo(tz);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-center mb-3">
                  <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                    {time}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {date}
                  </div>
                </div>

                {/* Timezone Info */}
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-xs">
                      {tz.abbreviation} ({tz.offset})
                    </Badge>
                  </div>
                  
                  <div className="flex justify-center">
                    <Badge 
                      className={`text-xs ${
                        isDay 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                      }`}
                    >
                      {isDay ? '☀️ Jour' : '🌙 Nuit'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-center text-slate-500 dark:text-slate-400">
                    {tz.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedTimezone && (() => {
        const details = getTimezoneDetails(selectedTimezone);
        if (!details) return null;
        
        return (
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-2 border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Informations Détaillées - {details.city}
                </span>
                <Button
                  onClick={() => copyTimezoneInfo(details)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">Informations de base</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Ville:</span> {details.city}</div>
                    <div><span className="font-medium">Pays:</span> {details.country}</div>
                    <div><span className="font-medium">Identifiant:</span> {details.name}</div>
                    <div><span className="font-medium">Abréviation:</span> {details.abbreviation}</div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">Heure actuelle</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Heure:</span> {details.currentTime}</div>
                    <div><span className="font-medium">Date:</span> {details.currentDate}</div>
                    <div><span className="font-medium">Décalage UTC:</span> {details.offset}</div>
                    <div><span className="font-medium">Période:</span> {details.isDaytime ? '☀️ Jour' : '🌙 Nuit'}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">Informations supplémentaires</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Continent:</span> {details.name.split('/')[0]}</div>
                    <div><span className="font-medium">Décalage numérique:</span> UTC{details.numericOffset >= 0 ? '+' : ''}{details.numericOffset}</div>
                    <div><span className="font-medium">Favori:</span> {favorites.includes(details.name) ? '⭐ Oui' : '❌ Non'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
};