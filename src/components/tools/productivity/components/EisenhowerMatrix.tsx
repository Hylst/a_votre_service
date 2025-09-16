/**
 * EisenhowerMatrix.tsx - Matrice d'Eisenhower pour la priorisation des tâches
 * Composant pour organiser les tâches selon leur urgence et importance
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useKeyboardShortcuts, getEisenhowerShortcuts, AccessibilityUtils } from '../utils/keyboardShortcuts';
import { KeyboardShortcutsHelp, getEisenhowerShortcutsHelp } from './KeyboardShortcutsHelp';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  MoreVertical, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Archive,
  ArrowRight,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useTaskManager, Task } from '../hooks/useTaskManager';
import { useToast } from '@/hooks/use-toast';
import EisenhowerAnalytics from './EisenhowerAnalytics';
import AISuggestions from './AISuggestions';
import { exportEisenhowerData, ExportOptions } from '../utils/exportUtils';

// Interface pour les quadrants de la matrice
interface MatrixQuadrant {
  id: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';
  tasks: Task[];
}

// Définition des quadrants de la matrice d'Eisenhower
const MATRIX_QUADRANTS: Omit<MatrixQuadrant, 'tasks'>[] = [
  {
    id: 'urgent-important',
    title: 'Urgent & Important',
    description: 'À faire immédiatement',
    color: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
    priority: 'urgent-important'
  },
  {
    id: 'important-not-urgent',
    title: 'Important & Non Urgent',
    description: 'À planifier',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Target,
    priority: 'important-not-urgent'
  },
  {
    id: 'urgent-not-important',
    title: 'Urgent & Non Important',
    description: 'À déléguer',
    color: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: Zap,
    priority: 'urgent-not-important'
  },
  {
    id: 'not-urgent-not-important',
    title: 'Non Urgent & Non Important',
    description: 'À éliminer',
    color: 'bg-gray-50 dark:bg-gray-950/30',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: Archive,
    priority: 'not-urgent-not-important'
  }
];

// Composant pour une carte de tâche dans la matrice
interface MatrixTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, newQuadrant: string) => void;
  currentQuadrant: string;
}

const MatrixTaskCard: React.FC<MatrixTaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onMove, 
  currentQuadrant 
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getOtherQuadrants = () => {
    return MATRIX_QUADRANTS.filter(q => q.id !== currentQuadrant);
  };

  return (
    <Card className="mb-2 transition-all duration-200 hover:shadow-md bg-card text-card-foreground">
      <CardContent className="p-3">
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight flex-1 pr-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="w-3 h-3 mr-2" />
                Modifier
              </DropdownMenuItem>
              {getOtherQuadrants().map((quadrant) => (
                <DropdownMenuItem 
                  key={quadrant.id}
                  onClick={() => onMove(task.id, quadrant.id)}
                >
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Vers {quadrant.title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="w-3 h-3 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <KeyboardShortcutsHelp shortcuts={getEisenhowerShortcutsHelp()} />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Badges et métadonnées */}
        <div className="space-y-2">
          {/* Priorité et catégorie */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)} text-white`}
            >
              {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {task.category}
            </Badge>
          </div>

          {/* Date d'échéance et durée estimée */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedDuration}min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour un quadrant de la matrice
interface MatrixQuadrantProps {
  quadrant: MatrixQuadrant;
  onAddTask: (quadrantId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newQuadrant: string) => void;
}

const MatrixQuadrantComponent: React.FC<MatrixQuadrantProps> = ({
  quadrant,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask
}) => {
  const IconComponent = quadrant.icon;

  return (
    <Card className={`h-full ${quadrant.color} ${quadrant.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <IconComponent className="w-4 h-4" />
            <div>
              <div>{quadrant.title}</div>
              <div className="text-xs font-normal text-muted-foreground">
                {quadrant.description}
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {quadrant.tasks.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(quadrant.id)}
              className="h-6 w-6 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        {quadrant.tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <IconComponent className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune tâche</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {quadrant.tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                currentQuadrant={quadrant.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant principal EisenhowerMatrix
export const EisenhowerMatrix: React.FC = () => {
  const {
    allTasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    loadTasks
  } = useTaskManager();
  
  const { toast } = useToast();
  const [quadrants, setQuadrants] = useState<MatrixQuadrant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: '',
    tags: '',
    dueDate: '',
    estimatedDuration: ''
  });

  /**
   * Organise les tâches dans les quadrants selon leurs tags
   */
  const organizeTasksIntoQuadrants = useCallback(() => {
    const tasksByQuadrant = {
      'urgent-important': allTasks.filter(task => 
        task.tags.includes('urgent') && task.tags.includes('important')
      ),
      'important-not-urgent': allTasks.filter(task => 
        task.tags.includes('important') && !task.tags.includes('urgent')
      ),
      'urgent-not-important': allTasks.filter(task => 
        task.tags.includes('urgent') && !task.tags.includes('important')
      ),
      'not-urgent-not-important': allTasks.filter(task => 
        !task.tags.includes('urgent') && !task.tags.includes('important')
      )
    };

    const newQuadrants = MATRIX_QUADRANTS.map(quadrant => ({
      ...quadrant,
      tasks: tasksByQuadrant[quadrant.priority] || []
    }));

    setQuadrants(newQuadrants);
  }, [allTasks]);

  /**
   * Gère le déplacement d'une tâche entre quadrants
   */
  const handleMoveTask = useCallback(async (taskId: string, newQuadrantId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    let newTags = task.tags.filter(tag => !['urgent', 'important'].includes(tag));

    switch (newQuadrantId) {
      case 'urgent-important':
        newTags.push('urgent', 'important');
        break;
      case 'important-not-urgent':
        newTags.push('important');
        break;
      case 'urgent-not-important':
        newTags.push('urgent');
        break;
      case 'not-urgent-not-important':
        // Pas de tags spéciaux
        break;
    }

    try {
      await updateTask(taskId, { tags: newTags });
      toast({
        title: "Tâche déplacée",
        description: `"${task.title}" a été déplacée vers ${MATRIX_QUADRANTS.find(q => q.id === newQuadrantId)?.title}`,
      });
      await loadTasks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déplacer la tâche",
        variant: "destructive",
      });
    }
  }, [allTasks, updateTask, loadTasks, toast]);

  /**
   * Ouvre le dialogue d'ajout de tâche pour un quadrant spécifique
   */
  const handleAddTask = useCallback((quadrantId: string) => {
    setSelectedQuadrantId(quadrantId);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: categories[0] || 'Personnel',
      tags: '',
      dueDate: '',
      estimatedDuration: ''
    });
    setIsAddDialogOpen(true);
  }, [categories]);

  /**
   * Ouvre le dialogue d'édition pour une tâche existante
   */
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      tags: task.tags.join(', '),
      dueDate: task.dueDate || '',
      estimatedDuration: task.estimatedDuration?.toString() || ''
    });
    setIsEditDialogOpen(true);
  }, []);

  /**
   * Soumet le formulaire d'ajout de tâche
   */
  const handleSubmitNewTask = useCallback(async () => {
    if (!newTask.title.trim()) return;

    let initialTags = newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    // Ajouter les tags appropriés selon le quadrant de destination
    switch (selectedQuadrantId) {
      case 'urgent-important':
        initialTags.push('urgent', 'important');
        break;
      case 'important-not-urgent':
        initialTags.push('important');
        break;
      case 'urgent-not-important':
        initialTags.push('urgent');
        break;
      case 'not-urgent-not-important':
        // Pas de tags spéciaux
        break;
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      completed: false,
      status: 'pending' as const,
      priority: newTask.priority,
      category: newTask.category,
      tags: initialTags,
      dueDate: newTask.dueDate || undefined,
      estimatedDuration: newTask.estimatedDuration ? parseInt(newTask.estimatedDuration) : undefined
    };

    try {
      await addTask(taskData);
      setIsAddDialogOpen(false);
      await loadTasks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche",
        variant: "destructive",
      });
    }
  }, [newTask, selectedQuadrantId, addTask, loadTasks, toast]);

  /**
   * Soumet le formulaire d'édition de tâche
   */
  const handleSubmitEditTask = useCallback(async () => {
    if (!editingTask || !newTask.title.trim()) return;

    const updates = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      dueDate: newTask.dueDate || undefined,
      estimatedDuration: newTask.estimatedDuration ? parseInt(newTask.estimatedDuration) : undefined
    };

    try {
      await updateTask(editingTask.id, updates);
      setIsEditDialogOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la tâche",
        variant: "destructive",
      });
    }
  }, [editingTask, newTask, updateTask, loadTasks, toast]);

  /**
   * Gère la suppression d'une tâche
   */
  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  }, [deleteTask, loadTasks, toast]);

  /**
   * Gère l'export des données
   */
  const handleExport = useCallback(async (format: 'pdf' | 'csv') => {
    try {
      const options: ExportOptions = {
        format,
        includeMetrics: true,
        includeAnalytics: true
      };
      await exportEisenhowerData(allTasks, options);
      toast({
        title: "Export réussi",
        description: `Les données ont été exportées au format ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  }, [allTasks, toast]);

  /**
   * Gère l'ouverture du dialogue d'ajout de tâche
   */
  const handleOpenAddDialog = useCallback(() => {
    setIsAddDialogOpen(true);
    AccessibilityUtils.announceToScreenReader('Dialogue d\'ajout de tâche ouvert');
  }, []);

  /**
   * Gère l'affichage/masquage des analytiques
   */
  const handleToggleAnalytics = useCallback(() => {
    setShowAnalytics(prev => !prev);
    AccessibilityUtils.announceToScreenReader(
      showAnalytics ? 'Analytiques masquées' : 'Analytiques affichées'
    );
  }, [showAnalytics]);

  /**
   * Gère le focus sur la recherche
   */
  const handleFocusSearch = useCallback(() => {
    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  // Configuration des raccourcis clavier
  const shortcuts = getEisenhowerShortcuts({
    onAddTask: handleOpenAddDialog,
    onToggleAnalytics: handleToggleAnalytics,
    onExportPDF: () => handleExport('pdf'),
    onExportCSV: () => handleExport('csv'),
    onFocusSearch: handleFocusSearch
  });

  useKeyboardShortcuts(shortcuts);

  // Réorganiser les tâches quand elles changent
  useEffect(() => {
    organizeTasksIntoQuadrants();
  }, [organizeTasksIntoQuadrants]);

  return (
    <div className="space-y-4">
      {/* En-tête de la matrice */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Matrice d'Eisenhower</h2>
          <p className="text-muted-foreground">Priorisez vos tâches selon leur urgence et importance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {allTasks.length} tâches
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter en CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Analytiques Eisenhower */}
      {showAnalytics && <EisenhowerAnalytics tasks={allTasks} className="mb-6" />}

      {/* Suggestions IA */}
      <AISuggestions tasks={allTasks} onApplySuggestion={(taskId, suggestion) => {
        // Logique pour appliquer les suggestions IA
        console.log('Applying suggestion:', taskId, suggestion);
      }} />

      {/* Grille des quadrants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
        {quadrants.map((quadrant) => (
          <MatrixQuadrantComponent
            key={quadrant.id}
            quadrant={quadrant}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        ))}
      </div>

      {/* Dialogue d'ajout de tâche */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Titre de la tâche"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optionnelle)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Tags (séparés par des virgules)"
              value={newTask.tags}
              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Durée estimée (min)"
                value={newTask.estimatedDuration}
                onChange={(e) => setNewTask({ ...newTask, estimatedDuration: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitNewTask}>
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition de tâche */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Titre de la tâche"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optionnelle)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Tags (séparés par des virgules)"
              value={newTask.tags}
              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Durée estimée (min)"
                value={newTask.estimatedDuration}
                onChange={(e) => setNewTask({ ...newTask, estimatedDuration: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitEditTask}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EisenhowerMatrix;