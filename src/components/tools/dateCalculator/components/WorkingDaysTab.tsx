/**
 * WorkingDaysTab.tsx - French Working Days Calculator Component
 * Calculates working days, weekends, and French public holidays between two dates
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Copy, Settings, Briefcase, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface WorkingDaysTabProps {
  onResult?: (result: string) => void;
}

interface WorkingDaysResult {
  totalDays: number;
  workingDays: number;
  weekendDays: number;
  holidayDays: number;
  holidays: Array<{
    date: string;
    name: string;
  }>;
  breakdown: Array<{
    date: string;
    type: 'working' | 'weekend' | 'holiday';
    name?: string;
  }>;
}

interface DatePreset {
  label: string;
  startDate: Date;
  endDate: Date;
}

const WorkingDaysTab: React.FC<WorkingDaysTabProps> = ({ onResult }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [result, setResult] = useState<WorkingDaysResult | null>(null);
  const [workingDays, setWorkingDays] = useState<boolean[]>([true, true, true, true, true, false, false]); // Mon-Sun
  const [includeHolidays, setIncludeHolidays] = useState<string[]>([
    'new-year', 'easter-monday', 'labor-day', 'victory-day', 'ascension', 
    'whit-monday', 'bastille-day', 'assumption', 'all-saints', 'armistice', 'christmas'
  ]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // French holidays calculation functions
  const getEasterDate = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  const getFrenchHolidays = (year: number): Array<{ date: Date; name: string; id: string }> => {
    const easter = getEasterDate(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    
    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);
    
    const whitMonday = new Date(easter);
    whitMonday.setDate(easter.getDate() + 50);

    return [
      { date: new Date(year, 0, 1), name: 'Jour de l\'An', id: 'new-year' },
      { date: easterMonday, name: 'Lundi de Pâques', id: 'easter-monday' },
      { date: new Date(year, 4, 1), name: 'Fête du Travail', id: 'labor-day' },
      { date: new Date(year, 4, 8), name: 'Fête de la Victoire 1945', id: 'victory-day' },
      { date: ascension, name: 'Ascension', id: 'ascension' },
      { date: whitMonday, name: 'Lundi de Pentecôte', id: 'whit-monday' },
      { date: new Date(year, 6, 14), name: 'Fête Nationale', id: 'bastille-day' },
      { date: new Date(year, 7, 15), name: 'Assomption', id: 'assumption' },
      { date: new Date(year, 10, 1), name: 'Toussaint', id: 'all-saints' },
      { date: new Date(year, 10, 11), name: 'Armistice 1918', id: 'armistice' },
      { date: new Date(year, 11, 25), name: 'Noël', id: 'christmas' }
    ];
  };

  const getDatePresets = (): DatePreset[] => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    return [
      {
        label: 'Ce mois',
        startDate: new Date(currentYear, currentMonth, 1),
        endDate: new Date(currentYear, currentMonth + 1, 0)
      },
      {
        label: 'Mois prochain',
        startDate: new Date(currentYear, currentMonth + 1, 1),
        endDate: new Date(currentYear, currentMonth + 2, 0)
      },
      {
        label: 'Ce trimestre',
        startDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1),
        endDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 0)
      },
      {
        label: 'Cette année',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31)
      },
      {
        label: 'Année prochaine',
        startDate: new Date(currentYear + 1, 0, 1),
        endDate: new Date(currentYear + 1, 11, 31)
      }
    ];
  };

  const calculateWorkingDays = (): void => {
    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner les deux dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    // Get all holidays in the date range
    const years = [];
    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
      years.push(year);
    }

    const allHolidays = years.flatMap(year => getFrenchHolidays(year))
      .filter(holiday => includeHolidays.includes(holiday.id))
      .filter(holiday => holiday.date >= start && holiday.date <= end);

    let totalDays = 0;
    let workingDaysCount = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    const breakdown: Array<{ date: string; type: 'working' | 'weekend' | 'holiday'; name?: string }> = [];
    const holidaysList: Array<{ date: string; name: string }> = [];

    const current = new Date(start);
    while (current <= end) {
      totalDays++;
      const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Tue=1, ..., Sun=6
      
      const dateStr = current.toISOString().split('T')[0];
      const holiday = allHolidays.find(h => 
        h.date.toISOString().split('T')[0] === dateStr
      );

      if (holiday) {
        holidayDays++;
        breakdown.push({ date: dateStr, type: 'holiday', name: holiday.name });
        holidaysList.push({ date: dateStr, name: holiday.name });
      } else if (!workingDays[dayIndex]) {
        weekendDays++;
        breakdown.push({ date: dateStr, type: 'weekend' });
      } else {
        workingDaysCount++;
        breakdown.push({ date: dateStr, type: 'working' });
      }

      current.setDate(current.getDate() + 1);
    }

    const calculationResult: WorkingDaysResult = {
      totalDays,
      workingDays: workingDaysCount,
      weekendDays,
      holidayDays,
      holidays: holidaysList,
      breakdown
    };

    setResult(calculationResult);
    
    const resultText = `Période: ${formatDate(start)} - ${formatDate(end)}\n` +
      `Jours totaux: ${totalDays}\n` +
      `Jours ouvrables: ${workingDaysCount}\n` +
      `Week-ends: ${weekendDays}\n` +
      `Jours fériés: ${holidayDays}`;
    
    onResult?.(resultText);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyResult = (): void => {
    if (!result) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let text = `📅 CALCUL JOURS OUVRABLES\n\n`;
    text += `Période: ${formatDate(start)} - ${formatDate(end)}\n\n`;
    text += `📊 RÉSUMÉ:\n`;
    text += `• Jours totaux: ${result.totalDays}\n`;
    text += `• Jours ouvrables: ${result.workingDays}\n`;
    text += `• Week-ends: ${result.weekendDays}\n`;
    text += `• Jours fériés: ${result.holidayDays}\n\n`;
    
    if (result.holidays.length > 0) {
      text += `🎉 JOURS FÉRIÉS:\n`;
      result.holidays.forEach(holiday => {
        const date = new Date(holiday.date);
        text += `• ${formatDate(date)} - ${holiday.name}\n`;
      });
    }
    
    navigator.clipboard.writeText(text);
    toast.success('Résultat copié dans le presse-papiers');
  };

  const applyPreset = (preset: DatePreset): void => {
    setStartDate(preset.startDate.toISOString().split('T')[0]);
    setEndDate(preset.endDate.toISOString().split('T')[0]);
  };

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const holidayOptions = [
    { id: 'new-year', name: 'Jour de l\'An' },
    { id: 'easter-monday', name: 'Lundi de Pâques' },
    { id: 'labor-day', name: 'Fête du Travail' },
    { id: 'victory-day', name: 'Fête de la Victoire 1945' },
    { id: 'ascension', name: 'Ascension' },
    { id: 'whit-monday', name: 'Lundi de Pentecôte' },
    { id: 'bastille-day', name: 'Fête Nationale' },
    { id: 'assumption', name: 'Assomption' },
    { id: 'all-saints', name: 'Toussaint' },
    { id: 'armistice', name: 'Armistice 1918' },
    { id: 'christmas', name: 'Noël' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Calculateur de Jours Ouvrables</h3>
            <p className="text-sm text-gray-400">Calcul des jours travaillés et fériés (France)</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Date Presets */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Presets de dates</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {getDatePresets().map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Date de début</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Date de fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
          <h4 className="text-md font-semibold text-white">Paramètres</h4>
          
          {/* Working Days Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Jours ouvrables</label>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newWorkingDays = [...workingDays];
                    newWorkingDays[index] = !newWorkingDays[index];
                    setWorkingDays(newWorkingDays);
                  }}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    workingDays[index]
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Holidays Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Jours fériés à inclure</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {holidayOptions.map((holiday) => (
                <label key={holiday.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeHolidays.includes(holiday.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIncludeHolidays([...includeHolidays, holiday.id]);
                      } else {
                        setIncludeHolidays(includeHolidays.filter(id => id !== holiday.id));
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{holiday.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={calculateWorkingDays}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Calculer les jours ouvrables
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Résultats</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-300" />
              </button>
              <button
                onClick={copyResult}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{result.totalDays}</div>
              <div className="text-xs text-gray-500">jours</div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Ouvrables</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{result.workingDays}</div>
              <div className="text-xs text-gray-500">jours</div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Week-ends</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">{result.weekendDays}</div>
              <div className="text-xs text-gray-500">jours</div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Fériés</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{result.holidayDays}</div>
              <div className="text-xs text-gray-500">jours</div>
            </div>
          </div>

          {/* Holidays List */}
          {result.holidays.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h5 className="text-md font-semibold text-white mb-3">Jours fériés dans la période</h5>
              <div className="space-y-2">
                {result.holidays.map((holiday, index) => {
                  const date = new Date(holiday.date);
                  return (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-700 rounded">
                      <span className="text-gray-300">{holiday.name}</span>
                      <span className="text-sm text-gray-400">
                        {date.toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calendar View */}
          {showCalendar && result.breakdown.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h5 className="text-md font-semibold text-white mb-3">Vue calendrier</h5>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div key={index} className="p-2 text-center text-gray-400 font-medium">
                    {day}
                  </div>
                ))}
                {result.breakdown.slice(0, 42).map((day, index) => {
                  const date = new Date(day.date);
                  const dayNum = date.getDate();
                  let bgColor = 'bg-gray-700';
                  let textColor = 'text-gray-300';
                  
                  if (day.type === 'working') {
                    bgColor = 'bg-green-600';
                    textColor = 'text-white';
                  } else if (day.type === 'weekend') {
                    bgColor = 'bg-orange-600';
                    textColor = 'text-white';
                  } else if (day.type === 'holiday') {
                    bgColor = 'bg-red-600';
                    textColor = 'text-white';
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 text-center rounded ${bgColor} ${textColor}`}
                      title={day.name || day.type}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span className="text-gray-400">Ouvrable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-600 rounded"></div>
                  <span className="text-gray-400">Week-end</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  <span className="text-gray-400">Férié</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkingDaysTab;