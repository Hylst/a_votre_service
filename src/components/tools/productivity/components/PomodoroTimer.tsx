
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Timer, Play, Pause, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { PresetSelectorTrigger } from "./PresetSelector";
import { usePresetConverter } from "@/hooks/usePresetLibrary";
import { useToast } from "@/hooks/use-toast";
import { PresetSelection } from "@/types/taskPresets";

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
    setLongBreakTime
  } = usePomodoroTimer();

  const { convertPomodoroPreset } = usePresetConverter();
  const { toast } = useToast();
  const stats = getTodaysStats();

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

  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
          <Timer className="w-5 h-5 text-red-600" />
          Minuteur Pomodoro
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 text-center space-y-4 lg:space-y-6">
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
        
        <div className="space-y-3 lg:space-y-4">
          <div className={`text-4xl lg:text-6xl font-mono font-bold transition-colors ${
            currentSession === "work" ? "text-red-600" : "text-green-600"
          }`}>
            {formatTime(currentTime)}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Badge className={`text-xs lg:text-sm ${
              currentSession === "work" 
                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" 
                : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
            }`}>
              {currentSession === "work" ? "🎯 Travail" : 
               currentSession === "break" ? "☕ Pause" : "🌟 Pause longue"}
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
  );
};
