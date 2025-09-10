
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Droplets, Moon, Dumbbell, Apple, Brain, Timer, Target, Activity, Scale, Info } from 'lucide-react';
import { HealthInfoModal } from '@/components/modals/HealthInfoModal';
import { BMICalculatorAdvanced } from './health/BMICalculatorAdvanced';
import { WaterTracker } from './health/WaterTracker';
import { SleepTracker } from './health/SleepTracker';
import { ExerciseTracker } from './health/ExerciseTracker';
import { NutritionTracker } from './health/NutritionTracker';
import { MentalHealthTracker } from './health/MentalHealthTracker';
import { MedicationReminder } from './health/MedicationReminder';
import { FitnessGoals } from './health/FitnessGoals';
import { HealthMetrics } from './health/HealthMetrics';
import { WeightTracker } from './health/WeightTracker';
// DataImportExport removed as requested
import { useOfflineDataManager } from '@/hooks/useOfflineDataManager';

interface HealthWellnessSuiteProps {
  spacing?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
}

export const HealthWellnessSuite = ({ spacing = 'md' }: HealthWellnessSuiteProps) => {
  console.log('HealthWellnessSuite component loading...');
  
  const {
    data: healthData,
    setData,
    exportData,
    importData,
    resetData,
    isOnline,
    isSyncing,
    lastSyncTime
  } = useOfflineDataManager<Record<string, any>>({
    toolName: 'health-wellness-suite',
    defaultData: {}
  });

  const [activeTab, setActiveTab] = useState('bmi');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleDataChange = (toolName: string, newData: any) => {
    console.log(`Data change for ${toolName}:`, newData);
    const currentData = healthData && typeof healthData === 'object' ? healthData : {};
    const updatedData = {
      ...currentData,
      [toolName]: newData,
      lastModified: new Date().toISOString()
    };
    setData(updatedData);
  };

  const tabs = [
    {
      id: 'bmi',
      label: 'IMC',
      icon: Scale,
      component: BMICalculatorAdvanced,
      category: 'Mesures'
    },
    {
      id: 'weight',
      label: 'Poids',
      icon: Activity,
      component: WeightTracker,
      category: 'Mesures'
    },
    {
      id: 'water',
      label: 'Hydratation',
      icon: Droplets,
      component: WaterTracker,
      category: 'Nutrition'
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: Apple,
      component: NutritionTracker,
      category: 'Nutrition'
    },
    {
      id: 'sleep',
      label: 'Sommeil',
      icon: Moon,
      component: SleepTracker,
      category: 'Bien-être'
    },
    {
      id: 'exercise',
      label: 'Exercices',
      icon: Dumbbell,
      component: ExerciseTracker,
      category: 'Fitness'
    },
    {
      id: 'goals',
      label: 'Objectifs',
      icon: Target,
      component: FitnessGoals,
      category: 'Fitness'
    },
    {
      id: 'mental',
      label: 'Mental',
      icon: Brain,
      component: MentalHealthTracker,
      category: 'Bien-être'
    },
    {
      id: 'medication',
      label: 'Médicaments',
      icon: Timer,
      component: MedicationReminder,
      category: 'Santé'
    },
    {
      id: 'metrics',
      label: 'Métriques',
      icon: Heart,
      component: HealthMetrics,
      category: 'Santé'
    }
  ];

  const categories = [...new Set(tabs.map(tab => tab.category))];

  console.log('HealthWellnessSuite rendering with tabs:', tabs.length);

  // Apply compact spacing based on prop
  const getSpacingClass = () => {
    switch (spacing) {
      case 'xxs': return 'space-y-1';
      case 'xs': return 'space-y-2';
      case 'sm': return 'space-y-3';
      case 'lg': return 'space-y-6 lg:space-y-8';
      default: return 'space-y-4 lg:space-y-6';
    }
  };

  const getGridGapClass = () => {
    switch (spacing) {
      case 'xxs': return 'gap-1';
      case 'xs': return 'gap-2';
      case 'sm': return 'gap-3';
      case 'lg': return 'gap-6 lg:gap-8';
      default: return 'gap-4 lg:gap-6';
    }
  };

  return (
    <div className={getSpacingClass()}>
      {/* Main Tools Panel */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 h-auto p-1 gap-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 p-2 text-xs min-h-16"
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="text-center leading-tight">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {tabs.map((tab) => {
              const TabComponent = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="p-3 lg:p-6">
                  <TabComponent
                    data={healthData?.[tab.id] || {}}
                    onDataChange={(data: any) => handleDataChange(tab.id, data)}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Health Tips Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            💡 Conseils Santé Complets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nutrition */}
          <div className="space-y-2">
            <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Nutrition
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• Consommez 5 portions de fruits et légumes par jour</li>
              <li>• Buvez au moins 1,5L d'eau quotidiennement</li>
              <li>• Privilégiez les céréales complètes et les protéines maigres</li>
              <li>• Limitez les sucres ajoutés et les aliments ultra-transformés</li>
            </ul>
          </div>

          {/* Activité Physique */}
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Activité Physique
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• 150 minutes d'activité modérée par semaine minimum</li>
              <li>• Intégrez des exercices de renforcement musculaire 2x/semaine</li>
              <li>• Marchez 10 000 pas par jour si possible</li>
              <li>• Alternez cardio, force et flexibilité</li>
            </ul>
          </div>

          {/* Sommeil */}
          <div className="space-y-2">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Sommeil
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• Dormez 7-9 heures par nuit régulièrement</li>
              <li>• Maintenez des horaires de coucher constants</li>
              <li>• Évitez les écrans 1h avant le coucher</li>
              <li>• Créez un environnement calme et sombre</li>
            </ul>
          </div>

          {/* Bien-être Mental */}
          <div className="space-y-2">
            <h4 className="font-medium text-pink-700 dark:text-pink-300 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Bien-être Mental
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• Pratiquez la méditation ou la relaxation quotidiennement</li>
              <li>• Maintenez des liens sociaux de qualité</li>
              <li>• Gérez le stress par des techniques de respiration</li>
              <li>• N'hésitez pas à consulter un professionnel si nécessaire</li>
            </ul>
          </div>

          {/* Prévention */}
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Prévention
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• Effectuez des bilans de santé réguliers</li>
              <li>• Maintenez vos vaccinations à jour</li>
              <li>• Surveillez votre tension artérielle et votre poids</li>
              <li>• Évitez le tabac et limitez l'alcool</li>
            </ul>
          </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Important : Ces conseils sont informatifs. Consultez toujours un professionnel de santé pour des recommandations personnalisées.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <HealthInfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
};
