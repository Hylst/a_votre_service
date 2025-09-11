
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Timer, CalendarDays, Target, CheckCircle, Copy, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useDateCalculationsEnhanced } from "../hooks/useDateCalculationsEnhanced";

export const AgeCalculatorTabEnhanced = () => {
  const { toast } = useToast();
  const { calculateAge } = useDateCalculationsEnhanced();
  const [birthDate, setBirthDate] = useState("");
  const [textInput, setTextInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [result, setResult] = useState<any>("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le résultat a été copié dans le presse-papiers.",
    });
  };

  // Validation function for DD/MM/YYYY format
  const validateDateInput = (input: string): boolean => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(input)) return false;
    
    const [, day, month, year] = input.match(dateRegex) || [];
    const parsedDate = parse(input, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) && 
           parseInt(day) <= 31 && 
           parseInt(month) <= 12 && 
           parseInt(year) >= 1900 && 
           parseInt(year) <= new Date().getFullYear();
  };

  // Handle text input change
  const handleTextInputChange = (value: string) => {
    setTextInput(value);
    setInputError("");
    
    if (value.length === 10) {
      if (validateDateInput(value)) {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        setBirthDate(format(parsedDate, "yyyy-MM-dd"));
      } else {
        setInputError("Format invalide. Utilisez DD/MM/YYYY");
      }
    }
  };

  // Handle date picker change
  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      setBirthDate(format(date, "yyyy-MM-dd"));
      setTextInput(format(date, "dd/MM/yyyy"));
      setInputError("");
    }
  };

  const handleCalculate = () => {
    if (!birthDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre date de naissance.",
        variant: "destructive"
      });
      return;
    }
    
    const calculatedResult = calculateAge(birthDate);
    setResult(calculatedResult);
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <Timer className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
          Calculateur d'Âge Précis & Avancé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6">
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Date de naissance</Label>
          
          {/* Text Input for DD/MM/YYYY */}
          <div className="space-y-2">
            <Label htmlFor="birth-date-input" className="text-xs text-gray-600">Saisie manuelle (DD/MM/YYYY)</Label>
            <Input
              id="birth-date-input"
              type="text"
              placeholder="JJ/MM/AAAA"
              value={textInput}
              onChange={(e) => handleTextInputChange(e.target.value)}
              className={`border-2 ${inputError ? 'border-red-400' : 'border-gray-300 hover:border-orange-400'}`}
              maxLength={10}
            />
            {inputError && (
              <p className="text-red-500 text-xs">{inputError}</p>
            )}
          </div>

          {/* Enhanced Date Picker */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Ou sélectionnez avec le calendrier</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-2 hover:border-orange-400"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {birthDate ? format(new Date(birthDate), "dd MMMM yyyy", { locale: fr }) : "Sélectionnez votre date de naissance"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-2" align="start">
                <EnhancedCalendar
                  selected={birthDate ? new Date(birthDate) : undefined}
                  onSelect={handleDatePickerChange}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={handleCalculate}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          disabled={!birthDate}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculer mon âge
        </Button>

        {result && typeof result === "object" && (
          <div className="space-y-4 lg:space-y-6">
            <div className="p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40 rounded-2xl border-2 border-orange-200 dark:border-orange-700 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                <h3 className="font-bold text-lg lg:text-xl text-gray-800 dark:text-gray-100">Votre Âge Détaillé</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(typeof result === "object" ? result.primary : "")}
                  className="text-orange-600 hover:text-orange-700 self-start"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                    {result.primary}
                  </p>
                  <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-400 break-words">
                    {result.details}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Prochain anniversaire
                  </h4>
                  <p className="text-orange-600 dark:text-orange-400 text-sm lg:text-base">{result.nextBirthday}</p>
                </div>
                
                {result.milestones?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Jalons atteints
                    </h4>
                    <div className="space-y-2">
                      {result.milestones.map((milestone: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced Calendar Component with Year/Month Dropdowns
interface EnhancedCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ selected, onSelect, disabled }) => {
  const [currentMonth, setCurrentMonth] = useState(selected ? selected.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(selected ? selected.getFullYear() : new Date().getFullYear());

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i).reverse();

  const handleMonthChange = (month: string) => {
    setCurrentMonth(months.indexOf(month));
  };

  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Month/Year Selection */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          <Select value={months[currentMonth]} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <CalendarComponent
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        month={new Date(currentYear, currentMonth)}
        onMonthChange={(date) => {
          setCurrentMonth(date.getMonth());
          setCurrentYear(date.getFullYear());
        }}
        locale={fr}
        className="pointer-events-auto"
      />
    </div>
  );
};
