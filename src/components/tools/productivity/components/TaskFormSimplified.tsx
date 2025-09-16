import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DatePickerWithPresets } from '@/components/ui/DatePickerWithPresets';
import { DurationInputEnhanced } from '@/components/ui/DurationInputEnhanced';
import { Plus, Scissors, Brain, Calendar, Tag, AlertCircle, Clock, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import { Task } from '../hooks/useTaskManager';
import { useTaskDecomposition } from '../hooks/useTaskDecomposition';
import { CategoryPresets } from './CategoryPresets';
import { useToast } from '@/hooks/use-toast';
import { PresetSelectorTrigger } from './PresetSelector';
import { PresetSelection } from '@/types/taskPresets';
import { usePresetConverter } from '@/hooks/usePresetLibrary';

interface TaskFormProps {
  isEditing: boolean;
  editingTask: Task | null;
  newTask: {
    title: string;
    description: string;
    priority: Task['priority'];
    category: string;
    tags: string;
    dueDate: string;
    estimatedDuration: string;
  };
  setNewTask: (task: any) => void;
  onSubmit: () => void;
  onSplit?: () => void;
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>;
  onSuccess?: () => void;
}

export const TaskFormSimplified = ({
  isEditing,
  editingTask,
  newTask,
  setNewTask,
  onSubmit,
  onSplit,
  onTaskCreate,
  onSuccess
}: TaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { decomposeWithAI, splitTask, isProcessing, hasConfiguredProvider } = useTaskDecomposition();
  const { convertTaskPreset } = usePresetConverter();
  const { toast } = useToast();
  
  // Handle preset selection
  const handlePresetSelect = (selection: PresetSelection) => {
    const convertedTask = convertTaskPreset(selection.preset, selection.customizations);
    
    setNewTask({
      ...newTask,
      title: convertedTask.title,
      description: convertedTask.description || '',
      priority: convertedTask.priority,
      tags: convertedTask.tags || '',
      estimatedDuration: selection.preset.estimatedDuration?.toString() || ''
    });
    
    toast({
      title: "Preset appliqué !",
      description: `Le preset "${selection.preset.title}" a été appliqué au formulaire.`,
    });
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!newTask.title.trim()) {
      errors.push('Le titre est obligatoire');
    } else if (newTask.title.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }
    
    if (newTask.estimatedDuration) {
      const duration = parseInt(newTask.estimatedDuration);
      if (isNaN(duration) || duration < 1) {
        errors.push('La durée doit être supérieure à 0');
      } else if (duration > 525600) { // 1 year in minutes
        errors.push('La durée ne peut pas dépasser 1 an');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreurs de validation",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
      onSuccess?.();
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la tâche",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIDecompose = async () => {
    if (!validateForm()) return;

    const result = await decomposeWithAI(newTask, onTaskCreate);
    
    if (result.success) {
      // Réinitialiser les filtres et rafraîchir
      onSuccess?.();
      toast({
        title: "Décomposition terminée",
        description: `${result.count} sous-tâches créées avec succès`,
      });
    }
  };

  const handleSplit = async () => {
    if (!editingTask) return;
    
    const success = await splitTask(editingTask, onTaskCreate);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Plus className="w-5 h-5" />
          {isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Selector */}
        {!isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4" />
                Utiliser un preset
              </label>
              <Badge variant="secondary" className="text-xs">
                Nouveau !
              </Badge>
            </div>
            <PresetSelectorTrigger 
              type="task" 
              onSelect={handlePresetSelect}
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-dashed hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Choisir un preset de tâche</div>
                  <div className="text-xs text-muted-foreground">Modèles prédéfinis pour Tâches Pro</div>
                </div>
              </div>
            </PresetSelectorTrigger>
          </div>
        )}
        
        {!isEditing && <Separator className="my-4" />}
        
        {/* Erreurs de validation */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Erreurs à corriger :</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Titre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Titre * <span className="text-xs text-gray-500">({newTask.title.length}/200)</span>
          </label>
          <Input
            placeholder="Titre de la tâche..."
            value={newTask.title}
            onChange={(e) => {
              setNewTask({ ...newTask, title: e.target.value });
              setValidationErrors([]);
            }}
            className="border-blue-200 focus:border-blue-400"
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-xs text-gray-500">({newTask.description.length}/1000)</span>
          </label>
          <Textarea
            placeholder="Description détaillée pour une meilleure décomposition IA..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="min-h-20 border-blue-200 focus:border-blue-400"
            maxLength={1000}
          />
        </div>

        {/* Catégories avec couleurs */}
        <CategoryPresets 
          onCategorySelect={(category) => setNewTask({ ...newTask, category })}
          selectedCategory={newTask.category}
        />

        {/* Ligne 1: Priorité et Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Priorité
            </label>
            <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Faible</Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moyenne</Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">Élevée</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Tags (séparés par des virgules)
            </label>
            <Input
              placeholder="urgent, important, projet..."
              value={newTask.tags}
              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Ligne 2: Date et Durée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Date d'échéance
            </label>
            <DatePickerWithPresets
              value={newTask.dueDate}
              onChange={(value) => setNewTask({ ...newTask, dueDate: value })}
              placeholder="Sélectionner une date d'échéance"
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="space-y-2">
            <DurationInputEnhanced
              value={newTask.estimatedDuration}
              onChange={(value) => setNewTask({ ...newTask, estimatedDuration: value })}
              placeholder="Durée estimée"
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <Separator />

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </>
            )}
          </Button>

          {isEditing && onSplit && (
            <Button 
              variant="outline" 
              onClick={handleSplit}
              disabled={isSubmitting || isProcessing}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Diviser
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={handleAIDecompose}
            disabled={isProcessing || !newTask.title.trim() || !hasConfiguredProvider || isSubmitting}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                IA en cours...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                IA Décomposer
              </>
            )}
          </Button>
        </div>

        {/* Info IA */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4" />
            <strong>Décomposition IA intelligente</strong>
          </div>
          <p>• {hasConfiguredProvider ? '✅ API configurée' : '⚠️ Configurez vos clés API'}</p>
          <p>• L'IA créera 4-8 sous-tâches détaillées automatiquement</p>
        </div>
      </CardContent>
    </Card>
  );
};