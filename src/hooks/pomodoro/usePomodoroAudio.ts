/**
 * usePomodoroAudio.ts
 * Audio management for Pomodoro Timer with Tone.js synthesis
 * Provides timer start sounds, focus background noise, and timer end sounds
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

// Audio settings interface
export interface PomodoroAudioSettings {
  startSoundEnabled: boolean;
  focusNoiseEnabled: boolean;
  endSoundEnabled: boolean;
  focusNoiseType: FocusNoiseType;
  volume: number; // 0-1
}

// Focus noise types
export type FocusNoiseType = 
  | 'white-noise'
  | 'brown-noise'
  | 'pink-noise'
  | 'rain'
  | 'ocean'
  | 'forest';

// Default audio settings
const DEFAULT_AUDIO_SETTINGS: PomodoroAudioSettings = {
  startSoundEnabled: true,
  focusNoiseEnabled: true,
  endSoundEnabled: true,
  focusNoiseType: 'white-noise',
  volume: 0.3
};

export const usePomodoroAudio = () => {
  const [settings, setSettings] = useState<PomodoroAudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Audio references
  const noiseRef = useRef<Tone.Noise | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  // Initialize audio context and components
  const initializeAudio = useCallback(async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Create audio components
      synthRef.current = new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.3,
          release: 1
        }
      });

      reverbRef.current = new Tone.Reverb({
        decay: 2,
        wet: 0.3
      });

      gainRef.current = new Tone.Gain(settings.volume);
      
      // Connect reverb and gain to destination
      synthRef.current.connect(reverbRef.current);
      reverbRef.current.connect(gainRef.current);
      gainRef.current.toDestination();

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, [settings.volume]);

  // Create focus noise based on type
  const createFocusNoise = useCallback((type: FocusNoiseType) => {
    if (noiseRef.current) {
      noiseRef.current.dispose();
    }
    if (filterRef.current) {
      filterRef.current.dispose();
    }

    switch (type) {
      case 'white-noise':
        noiseRef.current = new Tone.Noise('white');
        filterRef.current = new Tone.Filter({
          frequency: 1000,
          type: 'lowpass'
        });
        break;
      
      case 'brown-noise':
        noiseRef.current = new Tone.Noise('brown');
        filterRef.current = new Tone.Filter({
          frequency: 800,
          type: 'lowpass'
        });
        break;
      
      case 'pink-noise':
        noiseRef.current = new Tone.Noise('pink');
        filterRef.current = new Tone.Filter({
          frequency: 1200,
          type: 'lowpass'
        });
        break;
      
      case 'rain':
        noiseRef.current = new Tone.Noise('white');
        filterRef.current = new Tone.Filter({
          frequency: 2000,
          type: 'bandpass',
          Q: 0.5
        });
        break;
      
      case 'ocean':
        noiseRef.current = new Tone.Noise('brown');
        filterRef.current = new Tone.Filter({
          frequency: 400,
          type: 'lowpass',
          rolloff: -24
        });
        break;
      
      case 'forest':
        noiseRef.current = new Tone.Noise('pink');
        filterRef.current = new Tone.Filter({
          frequency: 1500,
          type: 'highpass'
        });
        break;
    }

    if (noiseRef.current && filterRef.current && gainRef.current) {
      noiseRef.current.connect(filterRef.current);
      filterRef.current.connect(gainRef.current);
      noiseRef.current.volume.value = -20; // Quiet background noise
    }
  }, []);

  // Play timer start sound
  const playStartSound = useCallback(async () => {
    if (!settings.startSoundEnabled || !isInitialized || !synthRef.current) return;
    
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Play ascending chord progression
      const now = Tone.now();
      synthRef.current.triggerAttackRelease('C4', '0.2', now);
      synthRef.current.triggerAttackRelease('E4', '0.2', now + 0.1);
      synthRef.current.triggerAttackRelease('G4', '0.3', now + 0.2);
    } catch (error) {
      console.error('Error playing start sound:', error);
    }
  }, [settings.startSoundEnabled, isInitialized]);

  // Play timer end sound
  const playEndSound = useCallback(async () => {
    if (!settings.endSoundEnabled || !isInitialized || !synthRef.current) return;
    
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Play completion melody
      const now = Tone.now();
      synthRef.current.triggerAttackRelease('G4', '0.3', now);
      synthRef.current.triggerAttackRelease('C5', '0.3', now + 0.2);
      synthRef.current.triggerAttackRelease('E5', '0.3', now + 0.4);
      synthRef.current.triggerAttackRelease('G5', '0.5', now + 0.6);
    } catch (error) {
      console.error('Error playing end sound:', error);
    }
  }, [settings.endSoundEnabled, isInitialized]);

  // Start focus background noise
  const startFocusNoise = useCallback(async () => {
    if (!settings.focusNoiseEnabled || isPlaying) return;
    
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      createFocusNoise(settings.focusNoiseType);
      
      if (noiseRef.current) {
        noiseRef.current.start();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error starting focus noise:', error);
    }
  }, [settings.focusNoiseEnabled, settings.focusNoiseType, isPlaying, createFocusNoise]);

  // Stop focus background noise
  const stopFocusNoise = useCallback(() => {
    if (noiseRef.current && isPlaying) {
      noiseRef.current.stop();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Update audio settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroAudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Update volume if changed
      if (newSettings.volume !== undefined && gainRef.current) {
        gainRef.current.gain.value = newSettings.volume;
      }
      
      // Restart noise if type changed and currently playing
      if (newSettings.focusNoiseType && isPlaying) {
        stopFocusNoise();
        setTimeout(() => {
          createFocusNoise(newSettings.focusNoiseType!);
          if (noiseRef.current) {
            noiseRef.current.start();
            setIsPlaying(true);
          }
        }, 100);
      }
      
      return updated;
    });
  }, [isPlaying, stopFocusNoise, createFocusNoise]);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isInitialized) {
        initializeAudio();
      }
    };

    // Listen for user interactions to initialize audio context
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isInitialized, initializeAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFocusNoise();
      
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (noiseRef.current) {
        noiseRef.current.dispose();
      }
      if (filterRef.current) {
        filterRef.current.dispose();
      }
      if (gainRef.current) {
        gainRef.current.dispose();
      }
      if (reverbRef.current) {
        reverbRef.current.dispose();
      }
    };
  }, [stopFocusNoise]);

  return {
    settings,
    isPlaying,
    isInitialized,
    playStartSound,
    playEndSound,
    startFocusNoise,
    stopFocusNoise,
    updateSettings,
    initializeAudio
  };
};

// Focus noise type options for UI
export const FOCUS_NOISE_OPTIONS: { value: FocusNoiseType; label: string; description: string }[] = [
  { value: 'white-noise', label: 'Bruit Blanc', description: 'Son uniforme et constant' },
  { value: 'brown-noise', label: 'Bruit Brun', description: 'Son grave et apaisant' },
  { value: 'pink-noise', label: 'Bruit Rose', description: 'Son équilibré et naturel' },
  { value: 'rain', label: 'Pluie', description: 'Simulation de pluie douce' },
  { value: 'ocean', label: 'Océan', description: 'Vagues et ressac' },
  { value: 'forest', label: 'Forêt', description: 'Ambiance forestière' }
];