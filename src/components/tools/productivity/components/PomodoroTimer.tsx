
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Play, Pause, RotateCcw, BookOpen, Sparkles, History, Link, Unlink, Settings } from "lucide-react";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { useTaskManager } from "../hooks/useTaskManager";
import { PresetSelectorTrigger } from "./PresetSelector";
import { usePresetConverter } from "@/hooks/usePresetLibrary";
import { useToast } from "@/hooks/use-toast";
import { PresetSelection } from "@/types/taskPresets";
import { UserGuide } from "@/components/ui/UserGuide";
import { getToolGuide } from "@/data/userGuides";
import { PomodoroHistory } from "./PomodoroHistory";
import { PomodoroAudioSettingsComponent } from "./PomodoroAudioSettings";
import React, { useState } from "react";

// Initial stats object to prevent recreation on each render
const INITIAL_STATS = { sessionsToday: 0, workSessions: 0, focusTime: 0, totalSessions: 0, completionRate: 0 };

// Priority indicator styles to prevent recreation
const PRIORITY_STYLES = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

// Session badge styles to prevent recreation
const SESSION_BADGE_STYLES = {
  work: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  break: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  longBreak: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
};

// Timer display styles to prevent recreation
const TIMER_STYLES = {
  work: 'text-red-600',
  break: 'text-green-600',
  longBreak: 'text-green-600'
};

// Session labels to prevent recreation
const SESSION_LABELS = {
  work: '🎯 Travail',
  break: '☕ Pause',
  longBreak: '🌟 Pause longue'
};

// Helper functions to prevent template literal recreation (moved outside component)
const getPriorityClassName = (priority: string) => `w-2 h-2 rounded-full ${PRIORITY_STYLES[priority as keyof typeof PRIORITY_STYLES]}`;
const getTimerClassName = (session: string) => `text-4xl lg:text-6xl font-mono font-bold transition-colors ${TIMER_STYLES[session as keyof typeof TIMER_STYLES]}`;
const getSessionBadgeClassName = (session: string) => `text-xs lg:text-sm ${SESSION_BADGE_STYLES[session as keyof typeof SESSION_BADGE_STYLES]}`;

export const PomodoroTimer = () => {
  const {
    currentTime,
    isRunning,
    currentSession,
    completedPomodoros,
    startPauseTimer,
    resetTimer,
    formatTime,
    getTodaysStats,
    setPomodoroTime,
    setBreakTime,
    setLongBreakTime,
    currentTaskId,
    linkToTask,
    unlinkFromTask,
    audioSettings,
    isAudioPlaying,
    updateAudioSettings
  } = usePomodoroTimer();

  const { tasks } = useTaskManager();
  const { convertPomodoroPreset } = usePresetConverter();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const pomodoroGuide = getToolGuide('pomodoro');
  
  // Load stats asynchronously
  React.useEffect(() => {
    const loadStats = async () => {
      const todaysStats = await getTodaysStats();
      setStats(todaysStats);
    };
    loadStats();
  }, [getTodaysStats]);

  // Handle preset selection
  const handlePresetSelect = (selection: PresetSelection) => {
    if (selection.preset.type !== 'pomodoro') return;
    
    const pomodoroData = convertPomodoroPreset(selection.preset as any);
    
    // Apply preset configuration
    setPomodoroTime(pomodoroData.focusDuration * 60);
    setBreakTime(pomodoroData.breakDuration * 60);
    setLongBreakTime(pomodoroData.longBreakDuration * 60);
    
    // Reset timer with new settings
    resetTimer();
    
    toast({
      title: "Preset appliqué",
      description: `Configuration "${selection.preset.title}" appliquée avec succès.`,
    });
  };

  // Handle task linking
  const handleTaskLink = (taskId: string) => {
    if (taskId === 'none') {
      unlinkFromTask();
      toast({
        title: "Tâche dissociée",
        description: "Le minuteur n'est plus lié à une tâche spécifique."
      });
    } else {
      linkToTask(taskId);
      const task = tasks.find(t => t.id === taskId);
      toast({
         title: "Tâche associée",
         description: `Le minuteur est maintenant lié à "${task?.title}".`
       });
    }
  };

  if (showHistory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(false)}
            className="mb-4"
          >
            ← Retour au minuteur
          </Button>
        </div>
        <PomodoroHistory />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <Timer className="w-5 h-5 text-red-600" />
              Minuteur Pomodoro
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAudioSettings(!showAudioSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Audio
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Masquer' : 'Historique'}
              </Button>

            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 text-center space-y-4 lg:space-y-6">
        {/* Audio Settings */}
        {showAudioSettings && (
          <>
            <PomodoroAudioSettingsComponent
              settings={audioSettings}
              onUpdateSettings={updateAudioSettings}
              isPlaying={isAudioPlaying}
            />
            <Separator className="my-4" />
          </>
        )}
        
        {/* Preset Selector */}
        {!isRunning && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Presets Pomodoro</span>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Rapide
                </Badge>
              </div>
            </div>
            
            <PresetSelectorTrigger
              type="pomodoro"
              onSelect={handlePresetSelect}
              className="w-full mb-4"
            >
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Choisir une configuration
              </Button>
            </PresetSelectorTrigger>
            
            <Separator className="my-4" />
          </>
        )}
        
        {/* Task Linking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Lier à une tâche</span>
              {currentTaskId && (
                <Badge variant="secondary" className="text-xs">
                  Liée
                </Badge>
              )}
            </div>
          </div>
          
          <Select value={currentTaskId || 'none'} onValueChange={handleTaskLink}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner une tâche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Unlink className="w-4 h-4" />
                  Aucune tâche
                </div>
              </SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <div className="flex items-center gap-2">
                    <div className={getPriorityClassName(task.priority)} />
                    <span className="truncate max-w-[200px]">{task.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Separator className="my-4" />
        </div>
        
        <div className="space-y-3 lg:space-y-4">
          <div className={getTimerClassName(currentSession)}>
            {formatTime(currentTime)}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Badge className={getSessionBadgeClassName(currentSession)}>
              {SESSION_LABELS[currentSession]}
            </Badge>
            <Badge variant="outline" className="text-xs lg:text-sm">
              Session {completedPomodoros + 1}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4">
          <Button onClick={startPauseTimer} size="lg" className="w-full sm:w-auto">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Démarrer
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetTimer} size="lg" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Statistiques responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mt-6 lg:mt-8">
          <div className="p-3 lg:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2 text-sm lg:text-base">
              🍅 Pomodoros
            </h3>
            <p className="text-xl lg:text-2xl font-bold text-red-600">{completedPomodoros}</p>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">aujourd'hui</p>
          </div>
          <div className="p-3 lg:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-sm lg:text-base">
              ⏱️ Sessions
            </h3>
            <p className="text-xl lg:text-2xl font-bold text-blue-600">{stats.sessionsToday}</p>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">aujourd'hui</p>
          </div>
          <div className="p-3 lg:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 text-sm lg:text-base">
              📈 Focus
            </h3>
            <p className="text-xl lg:text-2xl font-bold text-green-600">
              {Math.round((stats.focusTime) / 60 * 10) / 10}h
            </p>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">temps de focus</p>
          </div>
        </div>
        </CardContent>
      </Card>
      
      {/* Guide d'utilisation */}
      {pomodoroGuide && (
        <UserGuide
          toolName={pomodoroGuide.toolName}
          toolIcon={pomodoroGuide.toolIcon}
          sections={pomodoroGuide.sections}
          quickTips={pomodoroGuide.quickTips}
          shortcuts={pomodoroGuide.shortcuts}
        />
      )}
    </div>
  );
};

export default PomodoroTimer;
