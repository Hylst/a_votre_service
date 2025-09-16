/**
 * PomodoroAudioSettings.tsx
 * Audio settings component for Pomodoro Timer with toggle controls
 * Provides controls for start sound, focus noise, and end sound settings
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Volume2, Play, Waves, Bell } from "lucide-react";
import { PomodoroAudioSettings, FocusNoiseType, FOCUS_NOISE_OPTIONS } from '@/hooks/pomodoro/usePomodoroAudio';

interface PomodoroAudioSettingsProps {
  settings: PomodoroAudioSettings;
  onUpdateSettings: (settings: Partial<PomodoroAudioSettings>) => void;
  isPlaying?: boolean;
}

export const PomodoroAudioSettingsComponent: React.FC<PomodoroAudioSettingsProps> = ({
  settings,
  onUpdateSettings,
  isPlaying = false
}) => {
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    onUpdateSettings({ volume: value[0] });
  };

  // Handle focus noise type change
  const handleNoiseTypeChange = (value: FocusNoiseType) => {
    onUpdateSettings({ focusNoiseType: value });
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="w-5 h-5 text-primary" />
          Paramètres Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Volume général</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.volume]}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Start Sound Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Play className="w-4 h-4 text-green-600" />
            <div>
              <Label className="text-sm font-medium text-foreground">Son de démarrage</Label>
              <p className="text-xs text-muted-foreground">Joué au début de chaque session</p>
            </div>
          </div>
          <Switch
            checked={settings.startSoundEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ startSoundEnabled: checked })}
          />
        </div>

        {/* Focus Noise Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Waves className="w-4 h-4 text-blue-600" />
              <div>
                <Label className="text-sm font-medium text-foreground">Bruit de fond</Label>
                <p className="text-xs text-muted-foreground">
                  Ambiance sonore pendant les sessions de travail
                  {isPlaying && <span className="text-green-600 ml-1">• En cours</span>}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.focusNoiseEnabled}
              onCheckedChange={(checked) => onUpdateSettings({ focusNoiseEnabled: checked })}
            />
          </div>

          {/* Focus Noise Type Selector */}
          {settings.focusNoiseEnabled && (
            <div className="ml-7 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Type d'ambiance</Label>
              <Select value={settings.focusNoiseType} onValueChange={handleNoiseTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_NOISE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* End Sound Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-orange-600" />
            <div>
              <Label className="text-sm font-medium text-foreground">Son de fin</Label>
              <p className="text-xs text-muted-foreground">Joué à la fin de chaque session</p>
            </div>
          </div>
          <Switch
            checked={settings.endSoundEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ endSoundEnabled: checked })}
          />
        </div>

        {/* Audio Status Info */}
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="w-3 h-3" />
            <span>
              {settings.startSoundEnabled || settings.focusNoiseEnabled || settings.endSoundEnabled
                ? "Audio activé - Les sons seront joués selon vos préférences"
                : "Tous les sons sont désactivés"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroAudioSettingsComponent;