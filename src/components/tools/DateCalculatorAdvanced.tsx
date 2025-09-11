
/**
 * DateCalculatorAdvanced.tsx
 * Modern card-based date calculator with enhanced tab navigation and comprehensive date/time tools
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Calculator, Clock, MapPin, History, Users, Briefcase } from 'lucide-react';

// Import components with named imports
import { DateCalculationTabEnhancedV2 } from './dateCalculator/components/DateCalculationTabEnhancedV2';
import { AgeCalculatorTabEnhanced } from './dateCalculator/components/AgeCalculatorTabEnhanced';
import { DateDifferenceTab } from './dateCalculator/components/DateDifferenceTab';
import EventPlannerTabEnhanced from './dateCalculator/components/EventPlannerTabEnhanced';
import { TimeZoneAdvanced } from './dateCalculator/components/TimeZoneAdvanced';
import { CalculationHistoryTab } from './dateCalculator/components/CalculationHistoryTab';
import WorkingDaysTab from './dateCalculator/components/WorkingDaysTab';

const DateCalculatorAdvanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState("calculations");

  const tabs = [
    { id: "calculations", label: "Calculs", icon: Calculator, component: DateCalculationTabEnhancedV2 },
    { id: "age", label: "Âge", icon: Users, component: AgeCalculatorTabEnhanced },
    { id: "difference", label: "Différence", icon: Calendar, component: DateDifferenceTab },
    { id: "working-days", label: "Jours Ouvrables", icon: Briefcase, component: WorkingDaysTab },
    { id: "planning", label: "Planning", icon: Calendar, component: EventPlannerTabEnhanced },
    { id: "timezone", label: "Fuseaux", icon: MapPin, component: TimeZoneAdvanced },
    { id: "history", label: "Historique", icon: History, component: CalculationHistoryTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DateCalculationTabEnhancedV2;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Modern Card-Based Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 p-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Card 
              key={tab.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl border-0' 
                  : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`mb-2 flex justify-center ${
                  isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {tab.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="px-4">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default DateCalculatorAdvanced;
