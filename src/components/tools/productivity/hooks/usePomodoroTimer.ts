
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTaskManager } from './useTaskManager';
import { usePomodoroDatabase, PomodoroSessionRecord } from '@/hooks/pomodoro/usePomodoroDatabase';
import { usePomodoroAudio } from '@/hooks/pomodoro/usePomodoroAudio';

export interface PomodoroSession {
  id: string;
  type: "work" | "break" | "longBreak";
  duration: number;
  completedAt: Date;
  taskId?: string;
}

export const usePomodoroTimer = () => {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [longBreakTime, setLongBreakTime] = useState(15 * 60);
  const [currentTime, setCurrentTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<"work" | "break" | "longBreak">("work");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { updateTaskTimeSpent } = useTaskManager();
  const { saveSession, loadTodaySessions } = usePomodoroDatabase();
  const {
    settings: audioSettings,
    isPlaying: isAudioPlaying,
    playStartSound,
    playEndSound,
    startFocusNoise,
    stopFocusNoise,
    updateSettings: updateAudioSettings
  } = usePomodoroAudio();
  
  // Extract specific property to avoid object reference in dependencies
  const focusNoiseEnabled = audioSettings.focusNoiseEnabled;

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    
    // Stop focus noise if playing
    if (isAudioPlaying) {
      stopFocusNoise();
    }
    
    // Play session end sound
    await playEndSound();
    
    const now = new Date();
    const plannedDuration = currentSession === "work" ? pomodoroTime : 
                           currentSession === "break" ? breakTime : longBreakTime;
    const actualDuration = sessionStartTime ? 
      Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000) : plannedDuration;
    
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type: currentSession,
      duration: plannedDuration,
      completedAt: now,
      taskId: currentTaskId || undefined
    };
    
    // Save to local state
    setSessions(prev => [...prev, session]);
    
    try {
      // Save to database with additional metadata
      await saveSession({
        type: currentSession,
        duration: plannedDuration,
        completedAt: now,
        taskId: currentTaskId || undefined,
        interrupted: actualDuration < plannedDuration * 0.9, // Consider interrupted if <90% completed
        actualDuration,
        notes: currentTaskId ? `Linked to task: ${currentTaskId}` : undefined
      });
      
      // Update task time tracking if linked to a task
      if (currentTaskId && currentSession === "work") {
        await updateTaskTimeSpent(currentTaskId, Math.floor(actualDuration / 60)); // Convert to minutes
      }
      
      // Show completion notification
      toast({
        title: `${currentSession === 'work' ? 'Work' : 'Break'} session completed!`,
        description: `Duration: ${Math.floor(actualDuration / 60)} minutes`,
      });
      
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error saving session",
        description: "Session completed but couldn't be saved to database",
        variant: "destructive"
      });
    }
    
    // Reset session start time
    setSessionStartTime(null);
    
    if (currentSession === "work") {
      setCompletedPomodoros(prev => prev + 1);
      if ((completedPomodoros + 1) % 4 === 0) {
        setCurrentSession("longBreak");
        setCurrentTime(longBreakTime);
      } else {
        setCurrentSession("break");
        setCurrentTime(breakTime);
      }
    } else {
      setCurrentSession("work");
      setCurrentTime(pomodoroTime);
    }
  }, [currentSession, pomodoroTime, breakTime, longBreakTime, completedPomodoros, isAudioPlaying, stopFocusNoise, playEndSound, sessionStartTime, currentTaskId, saveSession, updateTaskTimeSpent]);

  // Timer effect - runs the countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          if (prevTime <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentTime, handleSessionComplete]);

  const startPauseTimer = useCallback(async () => {
    if (!isRunning) {
      // Starting timer - record start time and play start sound
      setSessionStartTime(new Date());
      await playStartSound();
      
      // Start focus noise for work sessions
      if (currentSession === "work" && focusNoiseEnabled) {
        setTimeout(() => {
          startFocusNoise();
        }, 1000); // Start noise 1 second after start sound
      }
    } else {
      // Pausing timer - stop focus noise
      if (isAudioPlaying) {
        stopFocusNoise();
      }
    }
    setIsRunning(!isRunning);
  }, [isRunning, playStartSound, currentSession, focusNoiseEnabled, startFocusNoise, isAudioPlaying, stopFocusNoise]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    
    // Stop focus noise if playing
    if (isAudioPlaying) {
      stopFocusNoise();
    }
    
    setCurrentSession("work");
    setCurrentTime(pomodoroTime);
    setSessionStartTime(null);
  }, [pomodoroTime, isAudioPlaying, stopFocusNoise]);
  
  // Function to link current session to a task
  const linkToTask = useCallback((taskId: string) => {
    setCurrentTaskId(taskId);
  }, []);
  
  // Function to unlink from current task
  const unlinkFromTask = useCallback(() => {
    setCurrentTaskId(null);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTodaysStats = useCallback(async () => {
    try {
      const todaysSessions = await loadTodaySessions();
      const workSessions = todaysSessions.filter(s => s.type === "work").length;
      const totalFocusTime = todaysSessions
        .filter(s => s.type === "work")
        .reduce((total, session) => total + Math.floor(session.actualDuration / 60), 0);
      
      return {
        sessionsToday: todaysSessions.length,
        workSessions,
        focusTime: totalFocusTime,
        totalSessions: todaysSessions.length,
        completionRate: todaysSessions.length > 0 ? 
          (todaysSessions.filter(s => !s.interrupted).length / todaysSessions.length) * 100 : 0
      };
    } catch (error) {
      console.error('Error loading today\'s stats:', error);
      // Fallback to empty stats when database fails
      return {
        sessionsToday: 0,
        workSessions: 0,
        focusTime: 0,
        totalSessions: 0,
        completionRate: 0
      };
    }
  }, [loadTodaySessions]);

  return {
    currentTime,
    isRunning,
    currentSession,
    completedPomodoros,
    sessions,
    startPauseTimer,
    resetTimer,
    formatTime,
    getTodaysStats,
    pomodoroTime,
    breakTime,
    longBreakTime,
    setPomodoroTime,
    setBreakTime,
    setLongBreakTime,
    // New database and task integration features
    currentTaskId,
    linkToTask,
    unlinkFromTask,
    sessionStartTime,
    // Audio features
    audioSettings,
    isAudioPlaying,
    updateAudioSettings
  };
};
