/**
 * TimeZoneMeetingTab.tsx
 * Meeting scheduler with multiple participants and suggested optimal meeting times
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, X, Clock, Calendar, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

interface Participant {
  id: string;
  name: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
}

interface MeetingSuggestion {
  time: string;
  participants: {
    name: string;
    localTime: string;
    isWorkingHours: boolean;
    timezone: string;
  }[];
  score: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const TimeZoneMeetingTab: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Organisateur',
      timezone: 'Europe/Paris',
      workingHours: { start: '09:00', end: '18:00' }
    }
  ]);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    timezone: '',
    workingStart: '09:00',
    workingEnd: '18:00'
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [meetingSuggestions, setMeetingSuggestions] = useState<MeetingSuggestion[]>([]);
  
  const { toast } = useToast();
  const { timeZones, currentTime } = useTimeZoneContext();

  // Initialize with current date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Add participant
  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.timezone) {
      toast({
        title: 'Données manquantes',
        description: 'Veuillez remplir le nom et le fuseau horaire.',
        variant: 'destructive'
      });
      return;
    }

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      timezone: newParticipant.timezone,
      workingHours: {
        start: newParticipant.workingStart,
        end: newParticipant.workingEnd
      }
    };

    setParticipants([...participants, participant]);
    setNewParticipant({
      name: '',
      timezone: '',
      workingStart: '09:00',
      workingEnd: '18:00'
    });
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    if (participants.length <= 1) {
      toast({
        title: 'Minimum requis',
        description: 'Vous devez garder au moins un participant.',
        variant: 'destructive'
      });
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Check if time is within working hours
  const isWorkingHours = (time: string, workingHours: { start: string; end: string }) => {
    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;
    
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  // Generate meeting suggestions
  const generateSuggestions = () => {
    if (!selectedDate || participants.length === 0) {
      toast({
        title: 'Données manquantes',
        description: 'Veuillez sélectionner une date et ajouter des participants.',
        variant: 'destructive'
      });
      return;
    }

    const suggestions: MeetingSuggestion[] = [];
    const baseDate = new Date(`${selectedDate}T00:00:00`);

    // Generate suggestions for every hour from 6 AM to 10 PM in the first participant's timezone
    for (let hour = 6; hour <= 22; hour++) {
      const meetingTime = new Date(baseDate);
      meetingTime.setHours(hour, 0, 0, 0);

      const participantTimes = participants.map(participant => {
        const localTime = meetingTime.toLocaleString('en-US', {
          timeZone: participant.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const isWorking = isWorkingHours(localTime, participant.workingHours);

        return {
          name: participant.name,
          localTime,
          isWorkingHours: isWorking,
          timezone: participant.timezone
        };
      });

      // Calculate score based on how many participants are in working hours
      const workingCount = participantTimes.filter(p => p.isWorkingHours).length;
      const score = (workingCount / participants.length) * 100;

      let quality: 'excellent' | 'good' | 'fair' | 'poor';
      if (score === 100) quality = 'excellent';
      else if (score >= 75) quality = 'good';
      else if (score >= 50) quality = 'fair';
      else quality = 'poor';

      suggestions.push({
        time: meetingTime.toLocaleString('fr-FR', {
          timeZone: participants[0].timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        participants: participantTimes,
        score,
        quality
      });
    }

    // Sort by score (best first)
    suggestions.sort((a, b) => b.score - a.score);
    setMeetingSuggestions(suggestions.slice(0, 8)); // Show top 8 suggestions
  };

  // Copy meeting details
  const copyMeetingDetails = (suggestion: MeetingSuggestion) => {
    const details = [
      `Réunion proposée pour le ${selectedDate}`,
      `Heure de référence: ${suggestion.time} (${participants[0].timezone})`,
      '',
      'Participants:'
    ];

    suggestion.participants.forEach(p => {
      const tz = timeZones.find(t => t.name === p.timezone);
      const city = tz?.city || p.timezone;
      const status = p.isWorkingHours ? '✅ Heures de travail' : '⚠️ Hors heures de travail';
      details.push(`• ${p.name} (${city}): ${p.localTime} - ${status}`);
    });

    navigator.clipboard.writeText(details.join('\n'));
    toast({
      title: 'Détails copiés',
      description: 'Les détails de la réunion ont été copiés dans le presse-papiers.',
    });
  };

  // Auto-generate suggestions when date or participants change
  useEffect(() => {
    if (selectedDate && participants.length > 0) {
      generateSuggestions();
    }
  }, [selectedDate, participants]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'fair': return <AlertCircle className="w-4 h-4" />;
      case 'poor': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Meeting Setup */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            Planificateur de Réunion Multi-Fuseaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date de la réunion
              </Label>
              <Input
                id="meeting-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Add Participant */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-lg mb-4">Ajouter un participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Nom du participant"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select 
                  value={newParticipant.timezone} 
                  onValueChange={(value) => setNewParticipant({...newParticipant, timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeZones.map((tz) => (
                      <SelectItem key={tz.name} value={tz.name}>
                        {tz.city} ({tz.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Heures de travail</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newParticipant.workingStart}
                    onChange={(e) => setNewParticipant({...newParticipant, workingStart: e.target.value})}
                  />
                  <Input
                    type="time"
                    value={newParticipant.workingEnd}
                    onChange={(e) => setNewParticipant({...newParticipant, workingEnd: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={addParticipant}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => {
              const tz = timeZones.find(t => t.name === participant.timezone);
              return (
                <div key={participant.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100">
                      {participant.name}
                    </h4>
                    {participants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    {tz?.city} ({tz?.country})
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Heures de travail: {participant.workingHours.start} - {participant.workingHours.end}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Suggestions */}
      {meetingSuggestions.length > 0 && (
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Créneaux Suggérés pour le {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meetingSuggestions.map((suggestion, index) => (
                <Card key={index} className={`border-2 ${getQualityColor(suggestion.quality)}`}>
                  <CardContent className="p-4">
                    {/* Suggestion Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        {getQualityIcon(suggestion.quality)}
                        <span className="font-medium text-lg">
                          {suggestion.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getQualityColor(suggestion.quality)}>
                          {Math.round(suggestion.score)}% optimal
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMeetingDetails(suggestion)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Participants Times */}
                    <div className="space-y-2">
                      {suggestion.participants.map((p, pIndex) => {
                        const tz = timeZones.find(t => t.name === p.timezone);
                        return (
                          <div key={pIndex} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{p.name}</span>
                              <span className="text-slate-500 ml-2">({tz?.city})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{p.localTime}</span>
                              {p.isWorkingHours ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quality Description */}
                    <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                      {suggestion.quality === 'excellent' && 'Tous les participants sont dans leurs heures de travail'}
                      {suggestion.quality === 'good' && 'La plupart des participants sont dans leurs heures de travail'}
                      {suggestion.quality === 'fair' && 'Environ la moitié des participants sont dans leurs heures de travail'}
                      {suggestion.quality === 'poor' && 'Peu de participants sont dans leurs heures de travail'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};