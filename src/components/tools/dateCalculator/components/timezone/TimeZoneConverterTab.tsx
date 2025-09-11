/**
 * TimeZoneConverterTab.tsx
 * Timezone converter with date/time picker for converting time between different timezones
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Copy, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

export const TimeZoneConverterTab: React.FC = () => {
  const [sourceTimezone, setSourceTimezone] = useState('Europe/Paris');
  const [targetTimezone, setTargetTimezone] = useState('America/New_York');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [convertedResult, setConvertedResult] = useState<{
    sourceDateTime: string;
    targetDateTime: string;
    sourceFormatted: string;
    targetFormatted: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { timeZones, currentTime } = useTimeZoneContext();

  // Initialize with current date and time
  useEffect(() => {
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedTime(now.toTimeString().slice(0, 5));
  }, []);

  // Convert time between timezones
  const convertTime = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Données manquantes',
        description: 'Veuillez sélectionner une date et une heure.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create date object in source timezone
      const sourceDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Get the time in source timezone
      const sourceFormatted = sourceDateTime.toLocaleString('fr-FR', {
        timeZone: sourceTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Convert to target timezone
      const targetFormatted = sourceDateTime.toLocaleString('fr-FR', {
        timeZone: targetTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setConvertedResult({
        sourceDateTime: sourceDateTime.toISOString(),
        targetDateTime: sourceDateTime.toISOString(),
        sourceFormatted,
        targetFormatted
      });
    } catch (error) {
      toast({
        title: 'Erreur de conversion',
        description: 'Impossible de convertir l\'heure. Vérifiez vos données.',
        variant: 'destructive'
      });
    }
  };

  // Swap source and target timezones
  const swapTimezones = () => {
    const temp = sourceTimezone;
    setSourceTimezone(targetTimezone);
    setTargetTimezone(temp);
    if (convertedResult) {
      convertTime();
    }
  };

  // Copy result to clipboard
  const copyResult = () => {
    if (!convertedResult) return;
    
    const sourceCity = timeZones.find(tz => tz.name === sourceTimezone)?.city || sourceTimezone;
    const targetCity = timeZones.find(tz => tz.name === targetTimezone)?.city || targetTimezone;
    
    const textToCopy = `Conversion d'heure:\n${sourceCity}: ${convertedResult.sourceFormatted}\n${targetCity}: ${convertedResult.targetFormatted}`;
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Résultat copié',
      description: 'La conversion a été copiée dans le presse-papiers.',
    });
  };

  // Set current time
  const setCurrentTime = () => {
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedTime(now.toTimeString().slice(0, 5));
  };

  // Auto-convert when inputs change
  useEffect(() => {
    if (selectedDate && selectedTime && sourceTimezone && targetTimezone) {
      convertTime();
    }
  }, [selectedDate, selectedTime, sourceTimezone, targetTimezone]);

  return (
    <div className="space-y-6">
      {/* Converter Form */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            Convertisseur de Fuseaux Horaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure
              </Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={setCurrentTime}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Maintenant
              </Button>
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Fuseau horaire source</Label>
              <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeZones.map((tz) => (
                    <SelectItem key={tz.name} value={tz.name}>
                      {tz.city} ({tz.country}) - {tz.offset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={swapTimezones}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Inverser
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Fuseau horaire cible</Label>
              <Select value={targetTimezone} onValueChange={setTargetTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeZones.map((tz) => (
                    <SelectItem key={tz.name} value={tz.name}>
                      {tz.city} ({tz.country}) - {tz.offset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Result */}
      {convertedResult && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-200 dark:border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 text-green-600" />
                Résultat de la Conversion
              </span>
              <Button
                onClick={copyResult}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Time */}
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300 mb-2">
                  {timeZones.find(tz => tz.name === sourceTimezone)?.city || sourceTimezone}
                </h3>
                <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400 mb-1">
                  {convertedResult.sourceFormatted.split(' ')[1]}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {convertedResult.sourceFormatted.split(' ')[0]}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {timeZones.find(tz => tz.name === sourceTimezone)?.country}
                </div>
              </div>

              {/* Target Time */}
              <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg border">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300 mb-2">
                  {timeZones.find(tz => tz.name === targetTimezone)?.city || targetTimezone}
                </h3>
                <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {convertedResult.targetFormatted.split(' ')[1]}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {convertedResult.targetFormatted.split(' ')[0]}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {timeZones.find(tz => tz.name === targetTimezone)?.country}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Source:</span>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">
                    {timeZones.find(tz => tz.name === sourceTimezone)?.abbreviation} 
                    ({timeZones.find(tz => tz.name === sourceTimezone)?.offset})
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Cible:</span>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">
                    {timeZones.find(tz => tz.name === targetTimezone)?.abbreviation} 
                    ({timeZones.find(tz => tz.name === targetTimezone)?.offset})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Conversion Presets */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Conversions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { from: 'Europe/Paris', to: 'America/New_York', label: 'Paris → New York' },
              { from: 'Europe/Paris', to: 'Asia/Tokyo', label: 'Paris → Tokyo' },
              { from: 'Europe/Paris', to: 'Australia/Sydney', label: 'Paris → Sydney' },
              { from: 'America/New_York', to: 'Europe/London', label: 'New York → Londres' },
              { from: 'Asia/Tokyo', to: 'America/Los_Angeles', label: 'Tokyo → Los Angeles' },
              { from: 'Europe/London', to: 'Asia/Shanghai', label: 'Londres → Shanghai' }
            ].map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSourceTimezone(preset.from);
                  setTargetTimezone(preset.to);
                }}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};