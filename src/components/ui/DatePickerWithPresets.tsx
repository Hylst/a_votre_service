/**
 * DatePickerWithPresets.tsx - Ergonomic Date Picker with Preset Options
 * Provides a user-friendly date selector with common preset options
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DatePickerWithPresetsProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface DatePreset {
  label: string;
  value: () => string;
  description?: string;
}

const DATE_PRESETS: DatePreset[] = [
  {
    label: "Pas d'échéance définie",
    value: () => '',
    description: "Aucune date limite"
  },
  {
    label: "Aujourd'hui",
    value: () => new Date().toISOString().split('T')[0],
    description: "Date du jour"
  },
  {
    label: "Dans une semaine",
    value: () => addWeeks(new Date(), 1).toISOString().split('T')[0],
    description: "7 jours à partir d'aujourd'hui"
  },
  {
    label: "Dans un mois",
    value: () => addMonths(new Date(), 1).toISOString().split('T')[0],
    description: "30 jours à partir d'aujourd'hui"
  },
  {
    label: "Dans un an",
    value: () => addYears(new Date(), 1).toISOString().split('T')[0],
    description: "365 jours à partir d'aujourd'hui"
  }
];

export const DatePickerWithPresets: React.FC<DatePickerWithPresetsProps> = ({
  value = '',
  onChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Handle preset selection
  const handlePresetSelect = (preset: DatePreset) => {
    const newValue = preset.value();
    onChange(newValue);
    setIsOpen(false);
    setShowCalendar(false);
  };

  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      onChange(dateString);
      setShowCalendar(false);
      setIsOpen(false);
    }
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Clear date
  const handleClear = () => {
    onChange('');
  };

  // Format display value
  const getDisplayValue = () => {
    if (!value) return '';
    try {
      const date = new Date(value + 'T00:00:00');
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch {
      return value;
    }
  };

  // Get current preset label if value matches a preset
  const getCurrentPresetLabel = () => {
    if (!value) return "Pas d'échéance définie";
    
    const matchingPreset = DATE_PRESETS.find(preset => {
      const presetValue = preset.value();
      return presetValue === value;
    });
    
    return matchingPreset ? matchingPreset.label : null;
  };

  const currentPresetLabel = getCurrentPresetLabel();

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-background text-foreground",
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentPresetLabel || (value ? getDisplayValue() : placeholder)}
            {value && (
              <X 
                className="ml-auto h-4 w-4 hover:bg-muted rounded" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-card text-card-foreground" align="start">
          <div className="p-3">
            {/* Preset Options */}
            <div className="space-y-1 mb-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Options rapides</h4>
              {DATE_PRESETS.map((preset, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto p-2",
                    preset.value() === value && "bg-secondary text-secondary-foreground"
                  )}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div>
                    <div className="font-medium">{preset.label}</div>
                    {preset.description && (
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-border my-3"></div>

            {/* Manual Input */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Saisie manuelle</h4>
              <Input
                type="date"
                value={value}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                placeholder="YYYY-MM-DD"
              />
            </div>

            {/* Calendar Toggle */}
            <div className="mt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {showCalendar ? 'Masquer le calendrier' : 'Afficher le calendrier'}
              </Button>
            </div>

            {/* Calendar */}
            {showCalendar && (
              <div className="mt-3 border-t border-border pt-3">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value + 'T00:00:00') : undefined}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  className="bg-card"
                  locale={fr}
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePickerWithPresets;