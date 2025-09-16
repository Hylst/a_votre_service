/**
 * DurationInputEnhanced.tsx
 * Enhanced duration input component with months, days, hours, and minutes fields
 * Automatically calculates total duration in minutes for better task estimation ergonomics
 */

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Sun, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DurationInputEnhancedProps {
  value?: string; // Total duration in minutes as string
  onChange?: (totalMinutes: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface DurationBreakdown {
  months: string;
  days: string;
  hours: string;
  minutes: string;
}

export const DurationInputEnhanced: React.FC<DurationInputEnhancedProps> = ({
  value = '',
  onChange,
  className,
  disabled = false,
  placeholder = 'Durée estimée'
}) => {
  const [duration, setDuration] = useState<DurationBreakdown>({
    months: '',
    days: '',
    hours: '',
    minutes: ''
  });

  // Convert total minutes to breakdown when value changes from parent
  useEffect(() => {
    if (value && !isNaN(parseInt(value))) {
      const totalMinutes = parseInt(value);
      const breakdown = minutesToBreakdown(totalMinutes);
      setDuration(breakdown);
    } else if (!value) {
      setDuration({ months: '', days: '', hours: '', minutes: '' });
    }
  }, [value]);

  // Convert minutes to breakdown format
  const minutesToBreakdown = (totalMinutes: number): DurationBreakdown => {
    const months = Math.floor(totalMinutes / (30 * 24 * 60)); // Approximation: 30 days per month
    const remainingAfterMonths = totalMinutes % (30 * 24 * 60);
    
    const days = Math.floor(remainingAfterMonths / (24 * 60));
    const remainingAfterDays = remainingAfterMonths % (24 * 60);
    
    const hours = Math.floor(remainingAfterDays / 60);
    const minutes = remainingAfterDays % 60;

    return {
      months: months > 0 ? months.toString() : '',
      days: days > 0 ? days.toString() : '',
      hours: hours > 0 ? hours.toString() : '',
      minutes: minutes > 0 ? minutes.toString() : ''
    };
  };

  // Convert breakdown to total minutes
  const breakdownToMinutes = (breakdown: DurationBreakdown): number => {
    const months = parseInt(breakdown.months) || 0;
    const days = parseInt(breakdown.days) || 0;
    const hours = parseInt(breakdown.hours) || 0;
    const minutes = parseInt(breakdown.minutes) || 0;

    return (months * 30 * 24 * 60) + (days * 24 * 60) + (hours * 60) + minutes;
  };

  // Handle individual field changes
  const handleFieldChange = (field: keyof DurationBreakdown, fieldValue: string) => {
    // Validate input - only allow positive integers
    if (fieldValue && (isNaN(parseInt(fieldValue)) || parseInt(fieldValue) < 0)) {
      return;
    }

    const newDuration = { ...duration, [field]: fieldValue };
    setDuration(newDuration);

    // Calculate total minutes and notify parent
    const totalMinutes = breakdownToMinutes(newDuration);
    onChange?.(totalMinutes > 0 ? totalMinutes.toString() : '');
  };

  // Calculate total for display
  const totalMinutes = breakdownToMinutes(duration);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with total display */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {placeholder}
        </Label>
        {totalMinutes > 0 && (
          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            Total: {totalHours > 0 && `${totalHours}h `}{remainingMinutes > 0 && `${remainingMinutes}min`}
            {totalMinutes === 0 && '0min'}
          </div>
        )}
      </div>

      {/* Duration input fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Months */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Mois
          </Label>
          <Input
            type="number"
            min="0"
            max="12"
            placeholder="0"
            value={duration.months}
            onChange={(e) => handleFieldChange('months', e.target.value)}
            disabled={disabled}
            className="text-center border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Days */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Sun className="w-3 h-3" />
            Jours
          </Label>
          <Input
            type="number"
            min="0"
            max="365"
            placeholder="0"
            value={duration.days}
            onChange={(e) => handleFieldChange('days', e.target.value)}
            disabled={disabled}
            className="text-center border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Hours */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Heures
          </Label>
          <Input
            type="number"
            min="0"
            max="24"
            placeholder="0"
            value={duration.hours}
            onChange={(e) => handleFieldChange('hours', e.target.value)}
            disabled={disabled}
            className="text-center border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Minutes */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Timer className="w-3 h-3" />
            Minutes
          </Label>
          <Input
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={duration.minutes}
            onChange={(e) => handleFieldChange('minutes', e.target.value)}
            disabled={disabled}
            className="text-center border-blue-200 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Helper text */}
      {totalMinutes === 0 && (
        <p className="text-xs text-muted-foreground">
          Saisissez la durée estimée en utilisant les champs ci-dessus. Les valeurs s'additionnent automatiquement.
        </p>
      )}
    </div>
  );
};

export default DurationInputEnhanced;