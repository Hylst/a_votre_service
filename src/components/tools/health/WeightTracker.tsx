
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, TrendingUp, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

export const WeightTracker = ({ data: propData, onDataChange }: WeightTrackerProps) => {
  // localStorage key for weight tracker data
  const STORAGE_KEY = 'weight-tracker-data';
  
  // Local state for weight data
  const [data, setData] = useState<WeightData>({
    entries: [],
    targetWeight: '',
    lastUpdated: new Date().toISOString()
  });
  
  const [currentWeight, setCurrentWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Memoize onDataChange to prevent infinite re-renders
  const memoizedOnDataChange = useCallback(onDataChange, []);

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

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        memoizedOnDataChange(data);
      } catch (error) {
        console.error('Error saving weight data to localStorage:', error);
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder les données",
          variant: "destructive"
        });
      }
    }
  }, [data, isLoading, memoizedOnDataChange]);

  const addEntry = () => {
    if (!currentWeight) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre poids",
        variant: "destructive"
      });
      return;
    }

    const entry: WeightEntry = {
      id: crypto.randomUUID(),
      weight: parseFloat(currentWeight),
      date: new Date().toISOString().split('T')[0],
      notes: notes || undefined
    };

    const newData = {
      ...data,
      entries: [entry, ...data.entries],
      lastUpdated: new Date().toISOString()
    };

    setData(newData);
    setCurrentWeight('');
    setNotes('');

    toast({
      title: "Poids enregistré",
      description: `${currentWeight}kg ajouté à votre suivi`,
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

  const getWeightTrend = () => {
    if (data.entries.length < 2) return null;
    const recent = data.entries.slice(0, 2);
    const diff = recent[0].weight - recent[1].weight;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      amount: Math.abs(diff)
    };
  };

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

  const trend = getWeightTrend();

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
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Nouveau poids
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              step="0.1"
              placeholder="Poids (kg)"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
            <Input
              placeholder="Notes (optionnel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={addEntry} className="w-full">
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objectif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              step="0.1"
              placeholder="Poids cible (kg)"
              value={data.targetWeight}
              onChange={(e) => updateTargetWeight(e.target.value)}
            />
            {data.entries.length > 0 && data.targetWeight && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-sm">À perdre/gagner</div>
                <div className="text-lg font-bold">
                  {(data.entries[0].weight - parseFloat(data.targetWeight)).toFixed(1)}kg
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendance */}
      {trend && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className={`w-4 h-4 ${
                trend.direction === 'up' ? 'text-red-500' : 
                trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
              }`} />
              <span className="text-sm">
                {trend.direction === 'up' ? 'Augmentation' : 
                 trend.direction === 'down' ? 'Diminution' : 'Stable'} 
                de {trend.amount.toFixed(1)}kg
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {data.entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-medium">{entry.weight}kg</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{entry.date}</div>
                  </div>
                  {entry.notes && <div className="text-sm text-gray-500">{entry.notes}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={exportData}>
              📤 Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) importData(file);
              };
              input.click();
            }}>
              📥 Import
            </Button>
            <Button size="sm" variant="destructive" onClick={resetData}>
              🔄 Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
