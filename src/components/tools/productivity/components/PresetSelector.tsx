/**
 * PresetSelector.tsx - UI component for selecting task presets
 * Provides an intuitive interface to browse and select presets by category
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Clock, 
  Tag, 
  Star, 
  Plus, 
  BookOpen,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { usePresetLibrary, usePresetConverter } from '@/hooks/usePresetLibrary';
import { Preset, TaskPreset, ObjectivePreset, PomodoroPreset, PresetSelection, BasePreset } from '@/types/taskPresets';
import { cn } from '@/lib/utils';

interface PresetSelectorProps {
  type?: 'task' | 'objective' | 'pomodoro' | 'all';
  onSelect: (selection: PresetSelection) => void;
  onClose?: () => void;
  className?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  type = 'all',
  onSelect,
  onClose,
  className
}) => {
  const {
    filteredPresets,
    categories,
    filters,
    setFilters,
    searchPresets,
    isLoading
  } = usePresetLibrary();
  
  const { convertTaskPreset, convertObjectivePreset, convertPomodoroPreset } = usePresetConverter();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizations, setCustomizations] = useState({
    title: '',
    description: '',
    priority: 'medium' as BasePreset['priority'],
    tags: [] as string[]
  });

  // Filter presets by type if specified
  const typeFilteredPresets = useMemo(() => {
    if (type === 'all') return filteredPresets;
    return filteredPresets.filter(preset => preset.type === type);
  }, [filteredPresets, type]);

  // Group presets by category
  const presetsByCategory = useMemo(() => {
    const grouped: Record<string, Preset[]> = {};
    typeFilteredPresets.forEach(preset => {
      if (!grouped[preset.category]) {
        grouped[preset.category] = [];
      }
      grouped[preset.category].push(preset);
    });
    return grouped;
  }, [typeFilteredPresets]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    searchPresets(searchTerm);
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters({ category: categoryId === 'all' ? undefined : categoryId });
  };

  // Handle preset selection
  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setCustomizations({
      title: preset.title,
      description: preset.description || '',
      priority: preset.priority,
      tags: [...preset.tags]
    });
    setShowCustomization(true);
  };

  // Handle final selection with customizations
  const handleFinalSelect = () => {
    if (!selectedPreset) return;
    
    const selection: PresetSelection = {
      preset: selectedPreset,
      customizations: {
        title: customizations.title !== selectedPreset.title ? customizations.title : undefined,
        description: customizations.description !== (selectedPreset.description || '') ? customizations.description : undefined,
        priority: customizations.priority !== selectedPreset.priority ? customizations.priority : undefined,
        tags: customizations.tags.length !== selectedPreset.tags.length || 
              !customizations.tags.every(tag => selectedPreset.tags.includes(tag)) ? customizations.tags : undefined
      }
    };
    
    onSelect(selection);
    setShowCustomization(false);
    setSelectedPreset(null);
    onClose?.();
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get type icon
  const getTypeIcon = (presetType: string) => {
    switch (presetType) {
      case 'task': return '✅';
      case 'objective': return '🎯';
      case 'pomodoro': return '🍅';
      default: return '📋';
    }
  };

  // Render preset card
  const renderPresetCard = (preset: Preset) => {
    const category = categories.find(cat => cat.id === preset.category);
    
    return (
      <Card 
        key={preset.id} 
        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-card text-card-foreground"
        onClick={() => handlePresetSelect(preset)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{preset.icon || getTypeIcon(preset.type)}</span>
              <h3 className="font-medium text-sm line-clamp-1">{preset.title}</h3>
            </div>
            <Badge className={getPriorityColor(preset.priority)} variant="secondary">
              {preset.priority}
            </Badge>
          </div>
          
          {preset.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {preset.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>{category?.icon}</span>
              <span>{category?.name}</span>
            </div>
            
            {preset.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{preset.estimatedDuration}min</span>
              </div>
            )}
          </div>
          
          {preset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {preset.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {preset.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{preset.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des presets..."
              className="pl-10"
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preset grid */}
      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement des presets...</p>
            </div>
          </div>
        ) : typeFilteredPresets.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucun preset trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              {filters.searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Aucun preset disponible pour cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(presetsByCategory).map(([categoryId, presets]) => {
              const category = categories.find(cat => cat.id === categoryId);
              if (selectedCategory !== 'all' && selectedCategory !== categoryId) return null;
              
              return (
                <div key={categoryId}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{category?.icon}</span>
                    <h2 className="text-lg font-semibold text-foreground">{category?.name}</h2>
                    <Badge variant="secondary" className="ml-auto">
                      {presets.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {presets.map(renderPresetCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Customization Dialog */}
      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Personnaliser le preset
            </DialogTitle>
          </DialogHeader>
          
          {selectedPreset && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={customizations.title}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la tâche"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={customizations.description}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optionnel)"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priorité</label>
                <Select 
                  value={customizations.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setCustomizations(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Haute</SelectItem>
                    <SelectItem value="medium">🟡 Moyenne</SelectItem>
                    <SelectItem value="low">🟢 Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomization(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleFinalSelect} className="flex-1">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Utiliser
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Preset selector trigger button
interface PresetSelectorTriggerProps {
  type?: 'task' | 'objective' | 'pomodoro' | 'all';
  onSelect: (selection: PresetSelection) => void;
  children?: React.ReactNode;
  className?: string;
}

export const PresetSelectorTrigger: React.FC<PresetSelectorTriggerProps> = ({
  type = 'all',
  onSelect,
  children,
  className
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className={cn("w-full", className)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Choisir un preset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Bibliothèque de presets
          </DialogTitle>
        </DialogHeader>
        <PresetSelector 
          type={type} 
          onSelect={onSelect} 
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};