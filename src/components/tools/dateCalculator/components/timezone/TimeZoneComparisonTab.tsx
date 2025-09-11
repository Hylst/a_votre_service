/**
 * TimeZoneComparisonTab.tsx
 * Side-by-side timezone comparison with detailed view and analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Copy, Plus, X, Clock, Calendar, Sunrise, Sunset, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

interface ComparisonData {
  timezone: string;
  city: string;
  country: string;
  currentTime: string;
  currentDate: string;
  offset: string;
  abbreviation: string;
  isDaytime: boolean;
}

export const TimeZoneComparisonTab: React.FC = () => {
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['Europe/Paris', 'America/New_York']);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  
  const { toast } = useToast();
  const { timeZones, currentTime, getTimeInTimezone, getDateInTimezone } = useTimeZoneContext();

  // Update comparison data when timezones or time changes
  useEffect(() => {
    const data = selectedTimezones.map(tzName => {
      const tz = timeZones.find(t => t.name === tzName);
      if (!tz) return null;
      
      const timeInZone = getTimeInTimezone(tzName);
      const dateInZone = getDateInTimezone(tzName);
      const hour = parseInt(timeInZone.split(':')[0]);
      const isDaytime = hour >= 6 && hour < 20;
      
      return {
        timezone: tzName,
        city: tz.city,
        country: tz.country,
        currentTime: timeInZone,
        currentDate: dateInZone,
        offset: tz.offset,
        abbreviation: tz.abbreviation,
        isDaytime
      };
    }).filter(Boolean) as ComparisonData[];
    
    setComparisonData(data);
  }, [selectedTimezones, currentTime, timeZones, getTimeInTimezone, getDateInTimezone]);

  // Add timezone to comparison
  const addTimezone = () => {
    if (!selectedTimezone) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner un fuseau horaire à ajouter.',
        variant: 'destructive'
      });
      return;
    }
    
    if (selectedTimezones.includes(selectedTimezone)) {
      toast({
        title: 'Déjà ajouté',
        description: 'Ce fuseau horaire est déjà dans la comparaison.',
        variant: 'destructive'
      });
      return;
    }
    
    if (selectedTimezones.length >= 6) {
      toast({
        title: 'Limite atteinte',
        description: 'Vous pouvez comparer jusqu\'à 6 fuseaux horaires à la fois.',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedTimezones([...selectedTimezones, selectedTimezone]);
    setSelectedTimezone('');
  };

  // Remove timezone from comparison
  const removeTimezone = (tzName: string) => {
    if (selectedTimezones.length <= 1) {
      toast({
        title: 'Minimum requis',
        description: 'Vous devez garder au moins un fuseau horaire pour la comparaison.',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedTimezones(selectedTimezones.filter(tz => tz !== tzName));
  };

  // Calculate time difference between two timezones
  const getTimeDifference = (tz1: ComparisonData, tz2: ComparisonData) => {
    const time1 = new Date(currentTime.toLocaleString('en-US', {timeZone: tz1.timezone}));
    const time2 = new Date(currentTime.toLocaleString('en-US', {timeZone: tz2.timezone}));
    const diffMs = time2.getTime() - time1.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours === 0) return 'Même heure';
    
    const absHours = Math.abs(diffHours);
    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours % 1) * 60);
    
    const sign = diffHours > 0 ? '+' : '-';
    return `${sign}${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
  };

  // Copy comparison data
  const copyComparison = () => {
    const textToCopy = comparisonData.map(data => 
      `${data.city} (${data.country}): ${data.currentTime} - ${data.currentDate}`
    ).join('\n');
    
    navigator.clipboard.writeText(`Comparaison des fuseaux horaires:\n${textToCopy}`);
    toast({
      title: 'Comparaison copiée',
      description: 'Les données de comparaison ont été copiées dans le presse-papiers.',
    });
  };

  // Get available timezones for selection (excluding already selected)
  const availableTimezones = timeZones.filter(tz => !selectedTimezones.includes(tz.name));

  return (
    <div className="space-y-6">
      {/* Add Timezone Control */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Comparaison Détaillée des Fuseaux Horaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fuseau horaire à ajouter..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableTimezones.map((tz) => (
                    <SelectItem key={tz.name} value={tz.name}>
                      {tz.city} ({tz.country}) - {tz.offset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={addTimezone}
                className="flex items-center gap-2"
                disabled={!selectedTimezone}
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
              <Button 
                onClick={copyComparison}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier tout
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Comparaison de {comparisonData.length} fuseau{comparisonData.length > 1 ? 'x' : ''} horaire{comparisonData.length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonData.map((data, index) => (
          <Card 
            key={data.timezone} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              data.isDaytime 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700'
                : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700'
            }`}
          >
            <CardContent className="p-6">
              {/* Header with Remove Button */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                    {data.city}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {data.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {data.isDaytime ? (
                    <Sunrise className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  )}
                  {selectedTimezones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimezone(data.timezone)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Time Display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {data.currentTime}
                </div>
                <div className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  {data.currentDate}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-sm ${
                    data.isDaytime 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  }`}
                >
                  {data.abbreviation} ({data.offset})
                </Badge>
              </div>

              {/* Day/Night Indicator */}
              <div className="text-center mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  data.isDaytime 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                }`}>
                  {data.isDaytime ? (
                    <>
                      <Sunrise className="w-4 h-4" />
                      Jour
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Nuit
                    </>
                  )}
                </div>
              </div>

              {/* Time Differences with other timezones */}
              {comparisonData.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Différences:
                  </h4>
                  {comparisonData
                    .filter((_, i) => i !== index)
                    .slice(0, 3)
                    .map((otherData) => (
                      <div 
                        key={otherData.timezone}
                        className="flex justify-between items-center text-xs bg-white/50 dark:bg-slate-800/50 p-2 rounded"
                      >
                        <span className="text-slate-600 dark:text-slate-400">
                          {otherData.city}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getTimeDifference(data, otherData)}
                        </Badge>
                      </div>
                    ))
                  }
                  {comparisonData.length > 4 && index === 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      +{comparisonData.length - 4} autres...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      {comparisonData.length > 1 && (
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Tableau de Comparaison Détaillé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Ville</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Heure Locale</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Fuseau</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Période</th>
                    {comparisonData.length === 2 && (
                      <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Différence</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((data, index) => (
                    <tr key={data.timezone} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {data.city}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {data.country}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100">
                          {data.currentTime}
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {data.currentDate}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {data.abbreviation}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className={`inline-flex items-center gap-1 ${
                          data.isDaytime ? 'text-yellow-600' : 'text-indigo-600'
                        }`}>
                          {data.isDaytime ? (
                            <Sunrise className="w-4 h-4" />
                          ) : (
                            <Moon className="w-4 h-4" />
                          )}
                          {data.isDaytime ? 'Jour' : 'Nuit'}
                        </div>
                      </td>
                      {comparisonData.length === 2 && index === 1 && (
                        <td className="p-3">
                          <Badge variant="outline">
                            {getTimeDifference(comparisonData[0], comparisonData[1])}
                          </Badge>
                        </td>
                      )}
                      {comparisonData.length === 2 && index === 0 && (
                        <td className="p-3 text-slate-400 dark:text-slate-500">
                          Référence
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};