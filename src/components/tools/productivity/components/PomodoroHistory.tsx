/**
 * PomodoroHistory.tsx
 * Component for displaying Pomodoro session history with trend charts and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, TrendingUp, BarChart3, Target, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePomodoroDatabase, PomodoroSessionRecord, PomodoroStats } from '@/hooks/pomodoro/usePomodoroDatabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PomodoroHistoryProps {
  className?: string;
}

interface ChartDataPoint {
  date: string;
  sessions: number;
  workTime: number;
  breakTime: number;
  completionRate: number;
  focusScore: number;
}

const COLORS = {
  work: '#3b82f6',
  break: '#10b981',
  longBreak: '#f59e0b',
  interrupted: '#ef4444'
};

const DATE_FORMAT_OPTIONS = { locale: fr };

// Prevent recreation of class strings and style objects on each render (moved outside component)
const getCardClassName = (className?: string) => `bg-card text-card-foreground ${className || ''}`;
const getContainerClassName = (className?: string) => `space-y-6 ${className || ''}`;

// Constant style objects to prevent recreation
const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px'
};

// Helper functions for dynamic styles (moved outside component)
const getPieEntryStyle = (color: string) => ({ backgroundColor: color });
const getSessionStyle = (sessionType: keyof typeof COLORS) => ({ backgroundColor: COLORS[sessionType] });

export const PomodoroHistory: React.FC<PomodoroHistoryProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [sessions, setSessions] = useState<PomodoroSessionRecord[]>([]);
  const [stats, setStats] = useState<PomodoroStats[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { loadSessionsByDateRange, loadStatsByDateRange } = usePomodoroDatabase();

  // Memoized data loading function to prevent infinite loops
  const loadData = useCallback(async () => {
      setLoading(true);
      try {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, days - 1));
        
        const [sessionsData, statsData] = await Promise.all([
          loadSessionsByDateRange(startDate, endDate),
          loadStatsByDateRange(startDate, endDate)
        ]);
        
        setSessions(sessionsData);
        setStats(statsData);
        
        // Process data for charts inline to avoid dependency issues
        const data: ChartDataPoint[] = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayStats = statsData.find(s => s.date === dateStr);
          const daySessions = sessionsData.filter(s => 
            format(new Date(s.completedAt), 'yyyy-MM-dd') === dateStr
          );
          
          // Calculate focus score (completion rate + consistency)
          const completionRate = dayStats?.completionRate || 0;
          const sessionCount = daySessions.length;
          const consistencyBonus = Math.min(sessionCount * 5, 25); // Up to 25% bonus for consistency
          const focusScore = Math.min(completionRate + consistencyBonus, 100);
          
          data.push({
            date: format(date, 'MMM dd', DATE_FORMAT_OPTIONS),
            sessions: sessionCount,
            workTime: Math.floor((dayStats?.totalWorkTime || 0) / 60), // Convert to minutes
            breakTime: Math.floor((dayStats?.totalBreakTime || 0) / 60),
            completionRate,
            focusScore
          });
        }
        
        setChartData(data);
        
      } catch (error) {
        console.error('Error loading Pomodoro history:', error);
      } finally {
        setLoading(false);
      }
  }, [timeRange, loadSessionsByDateRange, loadStatsByDateRange]);

  // Load data based on selected time range
  useEffect(() => {
    loadData();
  }, [loadData]);



  // Calculate current streak
  const calculateStreak = useCallback((): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayHasSessions = sessions.some(s => 
        format(new Date(s.completedAt), 'yyyy-MM-dd') === dateStr && s.type === 'work'
      );
      
      if (dayHasSessions) {
        streak++;
      } else if (i > 0) { // Don't break streak on first day (today) if no sessions yet
        break;
      }
    }
    
    return streak;
  }, [sessions]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalSessions = sessions.length;
    const workSessions = sessions.filter(s => s.type === 'work');
    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.actualDuration, 0);
    const averageSessionLength = workSessions.length > 0 ? totalWorkTime / workSessions.length : 0;
    const completedSessions = sessions.filter(s => !s.interrupted);
    const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;
    
    return {
      totalSessions,
      workSessions: workSessions.length,
      totalWorkTime: Math.floor(totalWorkTime / 60), // Convert to minutes
      averageSessionLength: Math.floor(averageSessionLength / 60),
      completionRate: Math.round(completionRate),
      streak: calculateStreak()
    };
  }, [sessions, calculateStreak]);

  // Session type distribution for pie chart
  const sessionTypeData = React.useMemo(() => {
    const workCount = sessions.filter(s => s.type === 'work').length;
    const breakCount = sessions.filter(s => s.type === 'break').length;
    const longBreakCount = sessions.filter(s => s.type === 'longBreak').length;
    
    return [
      { name: 'Travail', value: workCount, color: COLORS.work },
      { name: 'Pause courte', value: breakCount, color: COLORS.break },
      { name: 'Pause longue', value: longBreakCount, color: COLORS.longBreak }
    ].filter(item => item.value > 0);
  }, [sessions]);

  if (loading) {
    return (
      <Card className={getCardClassName(className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={getContainerClassName(className)}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Historique Pomodoro</h2>
          <p className="text-muted-foreground">Analyse de vos sessions et tendances de productivité</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Sessions totales</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalSessions}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Temps de travail</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.totalWorkTime}min</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Taux de réussite</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.completionRate}%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Série actuelle</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summaryStats.streak} jours</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="distribution">Répartition</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sessions par jour
              </CardTitle>
              <CardDescription>Évolution du nombre de sessions quotidiennes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke={COLORS.work} 
                    fill={COLORS.work}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Temps de travail quotidien</CardTitle>
              <CardDescription>Minutes de travail effectif par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line 
                    type="monotone" 
                    dataKey="workTime" 
                    stroke={COLORS.work} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.work, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Répartition des sessions</CardTitle>
                <CardDescription>Types de sessions effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sessionTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sessionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {sessionTypeData.map((entry, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={getPieEntryStyle(entry.color)}
                      />
                      {entry.name}: {entry.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Sessions récentes</CardTitle>
                <CardDescription>Dernières sessions effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={getSessionStyle(session.type)}
                        />
                        <span className="text-sm font-medium">
                          {session.type === 'work' ? 'Travail' : 
                           session.type === 'break' ? 'Pause' : 'Pause longue'}
                        </span>
                        {session.interrupted && (
                          <Badge variant="destructive" className="text-xs">Interrompu</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(session.completedAt), 'dd/MM HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Score de focus</CardTitle>
              <CardDescription>Évaluation de votre concentration quotidienne</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar 
                    dataKey="focusScore" 
                    fill={COLORS.work}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};