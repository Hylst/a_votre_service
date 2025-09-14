
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, TrendingUp, Target, BarChart3, Calculator, Filter, Search, Calendar, ArrowUpDown, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Debounce utility function
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

interface WeightData {
  entries: WeightEntry[];
  targetWeight: string;
  lastUpdated: string;
}

interface WeightTrackerProps {
  data: any;
  onDataChange: (data: any) => void;
}

const WeightTracker = memo(({ data: propData, onDataChange }: WeightTrackerProps) => {
  // localStorage key for weight tracker data
  const STORAGE_KEY = 'weight-tracker-data';
  
  // Initialize data state with default values
  const [data, setData] = useState<WeightData>(propData || {
    entries: [],
    targetWeight: '',
    lastUpdated: new Date().toISOString()
  });
  
  const [currentWeight, setCurrentWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering and sorting state
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month', '3months', 'year', 'custom'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'weight-desc', 'weight-asc'
  const [searchTerm, setSearchTerm] = useState('');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Debounced onDataChange to prevent excessive calls
  const debouncedOnDataChange = useDebounce(onDataChange, 300);
  
  // Memoize onDataChange to prevent infinite re-renders
  const memoizedOnDataChange = useCallback(onDataChange, [onDataChange]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setData(parsedData);
        } else if (propData && Object.keys(propData).length > 0) {
          // Use prop data if no localStorage data exists
          setData(propData);
        }
      } catch (error) {
        console.error('Error loading weight data from localStorage:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données sauvegardées",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [propData]);

  // Save data to localStorage whenever data changes (debounced)
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Use debounced version to prevent excessive parent updates
        debouncedOnDataChange(data);
      } catch (error) {
        console.error('Error saving weight data to localStorage:', error);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder les données",
          variant: "destructive"
        });
      }
    }
  }, [data, isLoading, debouncedOnDataChange]);

  // Enhanced weight validation with comprehensive checks
  const validateWeight = useCallback((weight: number, previousEntries?: WeightEntry[]): { isValid: boolean; message?: string; severity?: 'error' | 'warning' } => {
    // Basic range validation
    if (weight < 20 || weight > 300) {
      return {
        isValid: false,
        message: "Le poids doit être entre 20kg et 300kg (limites physiologiques)",
        severity: 'error'
      };
    }
    
    // Decimal precision validation
    const decimalPlaces = weight.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 1) {
      return {
        isValid: false,
        message: "Le poids ne peut avoir qu'une décimale maximum (ex: 70.5kg)",
        severity: 'error'
      };
    }
    
    // Realistic daily change validation
    if (previousEntries && previousEntries.length > 0) {
      const lastEntry = previousEntries[0];
      const lastDate = new Date(lastEntry.date);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        const weightDiff = Math.abs(weight - lastEntry.weight);
        
        // Extreme daily changes (likely errors)
        if (weightDiff > 5) {
          return {
            isValid: false,
            message: `Changement de poids trop important (${weightDiff.toFixed(1)}kg en ${daysDiff} jour${daysDiff > 1 ? 's' : ''}). Vérifiez la valeur saisie.`,
            severity: 'error'
          };
        }
        
        // Significant but possible changes (warnings)
        if (weightDiff > 2) {
          return {
            isValid: true,
            message: `Changement important de ${weightDiff.toFixed(1)}kg détecté. Assurez-vous que cette valeur est correcte.`,
            severity: 'warning'
          };
        }
      }
    }
    
    // BMI extreme validation (assuming average height)
    const averageHeight = 170; // cm
    const bmi = weight / ((averageHeight / 100) ** 2);
    if (bmi < 12 || bmi > 50) {
      return {
        isValid: false,
        message: `Poids inhabituel détecté (IMC estimé: ${bmi.toFixed(1)}). Vérifiez la valeur saisie.`,
        severity: 'error'
      };
    }
    
    return { isValid: true };
  }, []);
  
  // Real-time input validation
  const validateCurrentWeight = useCallback((weightStr: string): { isValid: boolean; message?: string; severity?: 'error' | 'warning' } => {
    if (!weightStr.trim()) {
      return { isValid: false, message: "Veuillez saisir votre poids", severity: 'error' };
    }
    
    const weight = parseFloat(weightStr);
    if (isNaN(weight)) {
      return { isValid: false, message: "Le poids doit être un nombre valide", severity: 'error' };
    }
    
    if (weight <= 0) {
      return { isValid: false, message: "Le poids doit être positif", severity: 'error' };
    }
    
    return validateWeight(weight, data.entries);
  }, [validateWeight, data.entries]);

  const addEntry = () => {
    // Use enhanced validation
    const validation = validateCurrentWeight(currentWeight);
    
    if (!validation.isValid) {
      toast({
        title: validation.severity === 'warning' ? "Attention" : "Erreur",
        description: validation.message,
        variant: validation.severity === 'warning' ? "default" : "destructive"
      });
      if (validation.severity === 'error') return;
    }
    
    // Show warning but allow continuation
    if (validation.severity === 'warning') {
      toast({
        title: "⚠️ Attention",
        description: validation.message,
        variant: "default"
      });
    }
    
    const weight = parseFloat(currentWeight);

    const todayDate = new Date().toISOString().split('T')[0];
    // Check for duplicate dates
    const existingEntry = data.entries?.find(entry => entry.date === todayDate);
    if (existingEntry) {
      toast({
        title: "Attention",
        description: "Une entrée existe déjà pour aujourd'hui. Elle sera remplacée.",
        variant: "default"
      });
    }

    const entry: WeightEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      weight,
      date: todayDate,
      notes: notes || undefined
    };

    let updatedEntries;
    if (existingEntry) {
      // Replace existing entry
      updatedEntries = data.entries?.map(e => e.id === existingEntry.id ? entry : e) || [];
    } else {
      // Add new entry
      updatedEntries = [entry, ...(data.entries || [])];
    }

    const newData = {
      ...data,
      entries: updatedEntries,
      lastUpdated: new Date().toISOString()
    };

    // Check for achievements before updating state
    if (!existingEntry) {
      checkAchievements(weight, data.entries || []);
    }

    setData(newData);
    setCurrentWeight('');
    setNotes('');

    toast({
      title: "Poids enregistré",
      description: existingEntry ? "Entrée mise à jour avec succès" : `${currentWeight}kg ajouté à votre suivi`,
    });
  };

  const updateTargetWeight = (newTarget: string) => {
    const newData = {
      ...data,
      targetWeight: newTarget,
      lastUpdated: new Date().toISOString()
    };
    setData(newData);
  };

  // Memoize weight trend calculation
  const weightTrend = useMemo(() => {
    if (!data.entries || data.entries.length < 2) return null;
    const recent = data.entries.slice(0, 2);
    const diff = recent[0].weight - recent[1].weight;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      amount: Math.abs(diff)
    };
  }, [data.entries]);

  // Enhanced achievement system with detailed milestones
  const checkAchievements = useCallback((newWeight: number, previousEntries: WeightEntry[]) => {
    if (!data.targetWeight) return;
    
    const targetWeight = parseFloat(data.targetWeight);
    const previousWeight = previousEntries[0]?.weight;
    const startWeight = previousEntries[previousEntries.length - 1]?.weight;
    const isLosingWeight = targetWeight < (startWeight || newWeight);
    const isGainingWeight = targetWeight > (startWeight || newWeight);
    
    // Goal achievement with celebration
    if (previousWeight && 
        ((isLosingWeight && newWeight <= targetWeight) || 
         (isGainingWeight && newWeight >= targetWeight))) {
      toast({
        title: "🎉 OBJECTIF ATTEINT !",
        description: `Incroyable ! Vous avez atteint votre objectif de ${targetWeight}kg ! Temps de célébrer ! 🥳`,
        variant: "default"
      });
      
      // Additional celebration for significant achievements
      if (startWeight) {
        const totalProgress = Math.abs(startWeight - newWeight);
        if (totalProgress >= 10) {
          setTimeout(() => {
            toast({
              title: "🏆 TRANSFORMATION REMARQUABLE",
              description: `Vous avez transformé votre corps avec ${totalProgress.toFixed(1)}kg de différence ! Continuez comme ça !`,
              variant: "default"
            });
          }, 2000);
        }
      }
      return;
    }
    
    // Progress milestones (1kg, 2kg, 5kg, 10kg, etc.)
    if (startWeight) {
      const totalProgress = Math.abs(startWeight - newWeight);
      const milestones = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];
      
      for (const milestone of milestones) {
        if (totalProgress >= milestone) {
          const previousProgress = previousEntries.length > 1 ? 
            Math.abs(startWeight - previousEntries[1].weight) : 0;
          
          if (previousProgress < milestone) {
            let title, description;
            
            if (milestone === 1) {
              title = "🌟 Premier pas franchi !";
              description = "Excellent début ! Chaque kilo compte dans votre parcours.";
            } else if (milestone === 5) {
              title = "🔥 Momentum en marche !";
              description = "5kg de progrès ! Vous êtes sur la bonne voie !";
            } else if (milestone === 10) {
              title = "💪 Transformation visible !";
              description = "10kg ! Votre détermination porte ses fruits !";
            } else if (milestone >= 20) {
              title = "🏆 TRANSFORMATION MAJEURE !";
              description = `${milestone}kg de progrès ! Vous êtes une inspiration !`;
            } else {
              title = `🎯 ${milestone}kg de progrès !`;
              description = "Continuez, vous êtes formidable !";
            }
            
            toast({
              title,
              description,
              variant: "default"
            });
            break;
          }
        }
      }
    }
    
    // Weekly consistency rewards
    if (previousEntries.length >= 7) {
      const lastWeekEntries = previousEntries.slice(0, 7);
      const hasConsistentProgress = lastWeekEntries.every((entry, index) => {
        if (index === lastWeekEntries.length - 1) return true;
        const nextEntry = lastWeekEntries[index + 1];
        const daysDiff = Math.abs(new Date(entry.date).getTime() - new Date(nextEntry.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 2; // Allow up to 2 days gap
      });
      
      if (hasConsistentProgress) {
        toast({
          title: "📅 Régularité exemplaire !",
          description: "7 jours de suivi régulier ! La constance est la clé du succès !",
          variant: "default"
        });
      }
    }
    
    // Plateau breaking celebration
    if (previousEntries.length >= 5) {
      const last5Entries = previousEntries.slice(0, 5);
      const wasStagnant = last5Entries.slice(1).every(entry => 
        Math.abs(entry.weight - last5Entries[1].weight) < 0.5
      );
      const hasBreakthrough = Math.abs(newWeight - last5Entries[1].weight) >= 1;
      
      if (wasStagnant && hasBreakthrough) {
        toast({
          title: "🚀 Plateau brisé !",
          description: "Excellent ! Vous avez surmonté une période de stagnation !",
          variant: "default"
        });
      }
    }
  }, [data.targetWeight]);

  // Memoize weight statistics
  const weightStats = useMemo(() => {
    if (!data.entries || data.entries.length === 0) return null;
    
    const weights = data.entries.map(e => e.weight);
    const currentWeight = weights[0];
    const targetWeight = parseFloat(data.targetWeight) || null;
    
    // Calculate goal progress
    let goalProgress = 0;
    let daysToGoal = 0;
    if (targetWeight && data.entries && data.entries.length > 0) {
      const startWeight = Math.max(...weights);
      const totalNeeded = Math.abs(startWeight - targetWeight);
      const achieved = Math.abs(startWeight - currentWeight);
      goalProgress = totalNeeded > 0 ? (achieved / totalNeeded) * 100 : 0;
      
      // Estimate days to goal based on current trend
      if (data.entries && data.entries.length > 1) {
        const trend = data.entries[data.entries.length - 1].weight - data.entries[0].weight;
        if (trend < 0 && currentWeight > targetWeight) {
          const avgWeeklyLoss = Math.abs(trend) / (data.entries.length > 1 ? 
            (new Date(data.entries[data.entries.length - 1].date).getTime() - 
             new Date(data.entries[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000) : 1);
          const remainingWeight = currentWeight - targetWeight;
          daysToGoal = avgWeeklyLoss > 0 ? Math.ceil((remainingWeight / avgWeeklyLoss) * 7) : 0;
        }
      }
    }
    
    return {
      current: currentWeight,
      target: targetWeight,
      min: Math.min(...weights),
      max: Math.max(...weights),
      average: weights.reduce((a, b) => a + b, 0) / weights.length,
      totalEntries: data.entries?.length || 0,
      progressToTarget: targetWeight ? ((currentWeight - targetWeight) * -1) : null,
      progressPercentage: targetWeight ? Math.min(100, Math.max(0, ((targetWeight - currentWeight) / Math.abs(targetWeight - weights[weights.length - 1])) * 100)) : null,
      goalProgress: Math.round(goalProgress * 10) / 10,
      daysToGoal
    };
  }, [data.entries, data.targetWeight]);

  // Memoize filtered and sorted entries
  const filteredAndSortedEntries = useMemo(() => {
    if (!data.entries) return [];
    let filtered = [...data.entries];
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (dateFilter) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (customDateFrom && customDateTo) {
            filtered = filtered.filter(entry => {
              const entryDate = new Date(entry.date);
              return entryDate >= new Date(customDateFrom) && entryDate <= new Date(customDateTo);
            });
          }
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      if (dateFilter !== 'custom') {
        filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.weight.toString().includes(searchTerm) ||
        entry.date.includes(searchTerm)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'weight-asc':
          return a.weight - b.weight;
        case 'weight-desc':
          return b.weight - a.weight;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    
    return filtered;
  }, [data.entries, dateFilter, sortBy, searchTerm, customDateFrom, customDateTo]);

  // Memoize chart data
  const chartData = useMemo(() => {
    return filteredAndSortedEntries
      .slice(0, 30) // Last 30 entries
      .reverse() // Show chronological order for chart
      .map((entry, index) => ({
        date: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        weight: entry.weight,
        index
      }));
  }, [filteredAndSortedEntries]);
  
  // Memoize displayed entries (with pagination)
  const displayedEntries = useMemo(() => {
    return showAllEntries ? filteredAndSortedEntries : filteredAndSortedEntries.slice(0, 10);
  }, [filteredAndSortedEntries, showAllEntries]);

  // BMI calculation
  const calculateBMI = useCallback((weight: number, height: number) => {
    if (!weight || !height) return null;
    const bmi = weight / ((height / 100) ** 2);
    let category = '';
    
    if (bmi < 18.5) category = 'Insuffisance pondérale';
    else if (bmi < 25) category = 'Poids normal';
    else if (bmi < 30) category = 'Surpoids';
    else category = 'Obésité';
    
    return { value: bmi, category };
  }, []);

  // Weight categories
  const getWeightCategory = useCallback((bmi: number | null) => {
    if (!bmi) return { category: 'Non défini', color: 'text-gray-500' };
    
    if (bmi < 18.5) return { category: 'Insuffisance pondérale', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Poids normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Surpoids', color: 'text-yellow-600' };
    return { category: 'Obésité', color: 'text-red-600' };
  }, []);

  // Export data function
  const exportData = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weight-tracker-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées"
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  // Import data function
  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.entries && Array.isArray(importedData.entries)) {
          setData({
            ...importedData,
            lastUpdated: new Date().toISOString()
          });
          toast({
            title: "Import réussi",
            description: "Vos données ont été importées"
          });
        } else {
          throw new Error('Format de fichier invalide');
        }
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Format de fichier invalide",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  // Reset data function
  const resetData = () => {
    const defaultData = {
      entries: [],
      targetWeight: '',
      lastUpdated: new Date().toISOString()
    };
    setData(defaultData);
    toast({
      title: "Données réinitialisées",
      description: "Toutes les données ont été supprimées"
    });
  };



  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des données...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Weight Statistics Overview - Enhanced Mobile Layout */}
      {weightStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Actuel</div>
                <div className="text-lg sm:text-xl font-bold">{weightStats.current}kg</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Moyenne</div>
                <div className="text-lg sm:text-xl font-bold">{weightStats.average.toFixed(1)}kg</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Minimum</div>
                <div className="text-lg sm:text-xl font-bold">{weightStats.min}kg</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Maximum</div>
                <div className="text-lg sm:text-xl font-bold">{weightStats.max}kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight Progress Chart - Enhanced Mobile Layout with Chart Type Selection */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Évolution du poids
              </CardTitle>
              {/* Mobile-first chart type selector */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2 sm:justify-end">
                <Button
                  size="sm"
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  onClick={() => setChartType('line')}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">📈</span>
                  <span className="hidden sm:inline">📈 Ligne</span>
                </Button>
                <Button
                  size="sm"
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  onClick={() => setChartType('bar')}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">📊</span>
                  <span className="hidden sm:inline">📊 Barres</span>
                </Button>
                <Button
                  size="sm"
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  onClick={() => setChartType('area')}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">🏔️</span>
                  <span className="hidden sm:inline">🏔️ Zone</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' && (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}kg`, 'Poids']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    {data.targetWeight && (
                      <ReferenceLine 
                        y={parseFloat(data.targetWeight)} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        label="Objectif"
                      />
                    )}
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                )}
                {chartType === 'bar' && (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}kg`, 'Poids']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    {data.targetWeight && (
                      <ReferenceLine 
                        y={parseFloat(data.targetWeight)} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        label="Objectif"
                      />
                    )}
                    <Bar 
                      dataKey="weight" 
                      fill="#3b82f6" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}kg`, 'Poids']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    {data.targetWeight && (
                      <ReferenceLine 
                        y={parseFloat(data.targetWeight)} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        label="Objectif"
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Input and Goal Section - Enhanced Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Nouveau poids
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 70.5"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="mt-1 text-base sm:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optionnel)</Label>
              <Input
                id="notes"
                placeholder="Ex: Après le sport"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-base sm:text-sm"
              />
            </div>
            <Button onClick={addEntry} className="w-full h-11 text-base font-medium">
              ✅ Enregistrer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objectif & Progrès
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="target" className="text-sm font-medium">Poids cible (kg)</Label>
              <Input
                id="target"
                type="number"
                step="0.1"
                placeholder="Ex: 65.0"
                value={data.targetWeight}
                onChange={(e) => updateTargetWeight(e.target.value)}
                className="mt-1 text-base sm:text-sm"
              />
            </div>
            {weightStats && weightStats.target && (
              <div className="space-y-3">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">À perdre/gagner</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.abs(weightStats.current - weightStats.target).toFixed(1)}kg
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {weightStats.current > weightStats.target ? '📉 à perdre' : '📈 à gagner'}
                  </div>
                </div>
                {weightStats.progressPercentage !== null && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progrès vers l'objectif</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {weightStats.progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, Math.max(0, weightStats.progressPercentage))}%` }}
                      ></div>
                    </div>
                    {weightStats.daysToGoal > 0 && (
                      <div className="text-xs text-center text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        ⏱️ Estimation: {weightStats.daysToGoal} jours pour atteindre l'objectif
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI & Category Section - Enhanced Mobile Layout */}
        {data.entries && data.entries.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                IMC & Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">📊 IMC actuel</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {calculateBMI(data.entries[0].weight, 170)?.value.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">kg/m²</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">🏷️ Catégorie</div>
                  <div className={`text-base sm:text-lg font-bold ${getWeightCategory(calculateBMI(data.entries[0].weight, 170)?.value || null).color}`}>
                    {getWeightCategory(calculateBMI(data.entries[0].weight, 170)?.value || null).category}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const bmi = calculateBMI(data.entries[0].weight, 170)?.value || 0;
                      return bmi < 18.5 ? '⬇️' : bmi < 25 ? '✅' : bmi < 30 ? '⚠️' : '🔴';
                    })()}
                  </div>
                </div>
              </div>
              {weightStats && weightStats.goalProgress > 0 && (
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-sm">Progression globale</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {weightStats.goalProgress.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    vers votre objectif de {weightStats.target}kg
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                * Calcul basé sur une taille de 170cm (modifiable dans les paramètres)
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tendance et Motivations */}
      {weightTrend && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className={`w-4 h-4 ${
                weightTrend.direction === 'up' ? 'text-red-500' : 
                weightTrend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
              }`} />
              <span className="text-sm">
                {weightTrend.direction === 'up' ? 'Augmentation' : 
                 weightTrend.direction === 'down' ? 'Diminution' : 'Stable'} 
                de {weightTrend.amount.toFixed(1)}kg
              </span>
            </div>
            {/* Motivational messages */}
            {weightStats && weightStats.goalProgress > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                {weightStats.goalProgress >= 75 ? "🔥 Vous y êtes presque ! Continuez !" :
                 weightStats.goalProgress >= 50 ? "💪 Excellent progrès ! Restez motivé !" :
                 weightStats.goalProgress >= 25 ? "👍 Bon début ! Gardez le cap !" :
                 "🌟 Chaque pas compte ! Vous pouvez le faire !"}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.entries && data.entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Historique ({filteredAndSortedEntries.length} entrées)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced Search and Filter Controls */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="🔍 Rechercher par notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                />
              </div>
              
              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📅 Toutes les dates</SelectItem>
                    <SelectItem value="week">📆 7 derniers jours</SelectItem>
                    <SelectItem value="month">🗓️ 30 derniers jours</SelectItem>
                    <SelectItem value="3months">📊 3 derniers mois</SelectItem>
                    <SelectItem value="year">📈 Dernière année</SelectItem>
                    <SelectItem value="custom">🎯 Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">⬇️ Date (récent → ancien)</SelectItem>
                    <SelectItem value="date-asc">⬆️ Date (ancien → récent)</SelectItem>
                    <SelectItem value="weight-desc">📉 Poids (lourd → léger)</SelectItem>
                    <SelectItem value="weight-asc">📈 Poids (léger → lourd)</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Quick Actions */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                    setSortBy('date-desc');
                  }}
                  className="h-11 sm:h-10 text-base sm:text-sm font-medium flex items-center justify-center gap-2"
                >
                  🔄 Réinitialiser
                </Button>
              </div>
            </div>
            
            {/* Custom Date Range - Enhanced Mobile Layout */}
            {dateFilter === 'custom' && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium mb-3 text-center text-blue-700 dark:text-blue-300">
                  🎯 Sélectionnez une période personnalisée
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-blue-700 dark:text-blue-300">📅 Date de début</label>
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="h-11 sm:h-10 text-base sm:text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-blue-700 dark:text-blue-300">📅 Date de fin</label>
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="h-11 sm:h-10 text-base sm:text-sm border-blue-300 dark:border-blue-700 focus:border-blue-500"
                    />
                  </div>
                </div>
                {customDateFrom && customDateTo && (
                  <div className="mt-3 text-xs text-center text-blue-600 dark:text-blue-400">
                    ✅ Période sélectionnée: {new Date(customDateFrom).toLocaleDateString('fr-FR')} - {new Date(customDateTo).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            )}
            
            {/* Enhanced Entries List */}
            <div className="space-y-3">
              {displayedEntries.length > 0 ? (
                displayedEntries.map((entry, index) => {
                  const prevEntry = displayedEntries[index + 1];
                  const weightDiff = prevEntry ? entry.weight - prevEntry.weight : null;
                  const isToday = new Date(entry.date).toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={entry.id} className={`relative p-4 border rounded-xl hover:shadow-md transition-all duration-200 ${
                      isToday ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800' : 
                      'bg-card hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                      {isToday && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          🆕 Aujourd'hui
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {/* Weight and Change */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-2xl sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                              ⚖️ {entry.weight}kg
                            </div>
                            {weightDiff !== null && (
                              <div className={`text-sm px-3 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
                                weightDiff > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                weightDiff < 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {weightDiff > 0 ? '📈 +' : weightDiff < 0 ? '📉 ' : '➡️ '}
                                {Math.abs(weightDiff).toFixed(1)}kg
                              </div>
                            )}
                          </div>
                          
                          {/* Date */}
                          <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            📅 {new Date(entry.date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          {/* Notes */}
                          {entry.notes && (
                            <div className="text-sm text-muted-foreground p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-300 dark:border-blue-700">
                              💭 <span className="italic">{entry.notes}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex sm:flex-col gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-8 px-2"
                            onClick={() => {
                              navigator.clipboard.writeText(`${entry.weight}kg - ${new Date(entry.date).toLocaleDateString('fr-FR')}`);
                              toast({ title: "📋 Copié!", description: "Données copiées dans le presse-papiers" });
                            }}
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Filter className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucune entrée trouvée</h3>
                  <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter('all');
                      setSortBy('date-desc');
                    }}
                  >
                    🔄 Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
            
            {/* Enhanced Show More/Less Button */}
            {filteredAndSortedEntries.length > 10 && (
              <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {showAllEntries 
                      ? `📊 Affichage de toutes les ${filteredAndSortedEntries.length} entrées`
                      : `📊 Affichage de 10 sur ${filteredAndSortedEntries.length} entrées`
                    }
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllEntries(!showAllEntries)}
                    className="h-11 px-6 font-medium"
                  >
                    {showAllEntries 
                      ? `⬆️ Afficher moins (masquer ${filteredAndSortedEntries.length - 10} entrées)`
                      : `⬇️ Afficher tout (${filteredAndSortedEntries.length - 10} entrées supplémentaires)`
                    }
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick Actions - Mobile-First Design */}
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2 justify-center">
            ⚙️ Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={exportData} 
              className="h-12 text-base font-medium flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
            >
              📤 <span>Exporter les données</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) importData(file);
                };
                input.click();
              }} 
              className="h-12 text-base font-medium flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950"
            >
              📥 <span>Importer des données</span>
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données ?\n\nCette action est irréversible et supprimera:\n• Toutes vos pesées\n• Votre objectif de poids\n• Toutes vos notes\n\nVoulez-vous continuer ?')) {
                  resetData();
                }
              }} 
              className="h-12 text-base font-medium flex items-center justify-center gap-2"
            >
              🗑️ <span>Réinitialiser</span>
            </Button>
          </div>
          
          {/* Info Section */}
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>💾 Vos données sont sauvegardées localement</div>
              <div>🔒 Aucune donnée n'est envoyée sur internet</div>
              <div>📱 Compatible avec tous vos appareils</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default WeightTracker;
