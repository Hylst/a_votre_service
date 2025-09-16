/**
 * KanbanBoard.tsx - Tableau Kanban avec fonctionnalité drag-and-drop mobile-responsive
 * Composant pour organiser et gérer les tâches dans un format visuel Kanban
 * Optimisé pour mobile avec touch gestures et design adaptatif
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useKeyboardShortcuts, getKanbanShortcuts, AccessibilityUtils } from '../utils/keyboardShortcuts';
import { KeyboardShortcutsHelp, getKanbanShortcutsHelp } from './KeyboardShortcutsHelp';
import { Separator } from '@/components/ui/separator';
import { usePerformanceOptimizations } from '../hooks/usePerformanceOptimizations';
import { useAccessibility } from '../hooks/useAccessibility';
import { useEnhancedUX } from '../hooks/useEnhancedUX';
import { useAdvancedFiltering } from '../hooks/useAdvancedFiltering';
import { useCrossToolIntegration } from '../hooks/useCrossToolIntegration';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import ErrorBoundary from './ErrorBoundary';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  MoreVertical, 
  Edit, 
  Trash2, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useTaskManager, Task } from '../hooks/useTaskManager';
import { useToast } from '@/hooks/use-toast';
import KanbanMetrics from './KanbanMetrics';
import AISuggestions from './AISuggestions';
import { exportKanbanData, ExportOptions } from '../utils/exportUtils';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useMobileResponsive, createTouchFriendlyDragHandlers } from '../hooks/useMobileResponsive';
import { UserGuide } from '@/components/ui/UserGuide';
import { getToolGuide } from '@/data/userGuides';

// Interface pour les colonnes Kanban
interface KanbanColumn {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  color: string;
  tasks: Task[];
}

// Colonnes par défaut du Kanban
const DEFAULT_COLUMNS: Omit<KanbanColumn, 'tasks'>[] = [
  { id: 'todo', title: 'À faire', status: 'todo', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'in-progress', title: 'En cours', status: 'in-progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'review', title: 'En révision', status: 'review', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'done', title: 'Terminé', status: 'done', color: 'bg-green-100 dark:bg-green-900/30' }
];

// Composant pour une carte de tâche
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggle: (taskId: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggle, isDragging, isSelected, onSelect }) => {
  const { announceToScreenReader, generateAriaLabel } = useAccessibility({ enableKeyboardNavigation: true, announceChanges: true });
  const { startInteractionMeasure, endInteractionMeasure } = usePerformanceMonitoring({ component: 'TaskCard' });
  const { isMobile, isTouchDevice } = useMobileResponsive();
  const [isPressed, setIsPressed] = useState(false);

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

  // Touch-friendly drag handlers for mobile
  const touchDragHandlers = useMemo(() => {
    if (!isTouchDevice) return {};
    
    return createTouchFriendlyDragHandlers({
      dragData: task.id,
      onDragStart: () => setIsPressed(true),
      onDragEnd: () => setIsPressed(false)
    });
  }, [isTouchDevice, task.id]);

  const handleCardClick = () => {
    startInteractionMeasure();
    if (onSelect) {
      onSelect(task.id);
      announceToScreenReader(`Tâche ${isSelected ? 'désélectionnée' : 'sélectionnée'}: ${task.title}`);
    }
    endInteractionMeasure();
  };

  const ariaLabel = generateAriaLabel(task, 'card');

  return (
    <Card 
      className={`mb-3 transition-all duration-200 hover:shadow-md bg-card text-card-foreground ${
        isDragging || isPressed ? 'opacity-75 scale-105 shadow-lg' : ''
      } ${
        isMobile ? 'touch-manipulation select-none' : 'cursor-move'
      } ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      draggable={!isTouchDevice}
      onDragStart={(e) => {
        if (!isTouchDevice) {
          e.dataTransfer.setData('text/plain', task.id);
          e.dataTransfer.effectAllowed = 'move';
        }
      }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      {...(isTouchDevice ? touchDragHandlers : {})}
      style={{
        touchAction: isMobile ? 'manipulation' : 'auto'
      }}
    >
      <CardContent className="p-3">
        {/* En-tête de la carte avec titre et actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium text-sm leading-tight flex-1">{task.title}</h4>
          </div>
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
              <DropdownMenuItem onClick={() => onToggle(task.id)}>
                <CheckCircle2 className="w-3 h-3 mr-2" />
                {task.completed ? 'Marquer non terminé' : 'Marquer terminé'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="w-3 h-3 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <KeyboardShortcutsHelp shortcuts={getKanbanShortcutsHelp()} />
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

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
              )}
            </div>
          )}

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

// Composant pour une colonne Kanban
interface KanbanColumnProps {
  column: KanbanColumn;
  onTaskDrop: (taskId: string, columnId: string) => void;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  bulkSelection: Set<string>;
  toggleBulkSelection: (taskId: string) => void;
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  onTaskDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  bulkSelection,
  toggleBulkSelection
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobile, isTouchDevice, screenSize } = useMobileResponsive();

  // Auto-collapse columns on small screens if more than 3 columns visible
  const shouldAutoCollapse = screenSize === 'mobile' && column.tasks.length === 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(taskId, column.id);
    }
  };

  // Touch drop zone handlers for mobile
  const handleTouchDrop = useCallback((taskId: string) => {
    onTaskDrop(taskId, column.id);
  }, [onTaskDrop, column.id]);

  return (
    <div className={`flex-1 ${
      isMobile ? 'min-w-[280px] max-w-full' : 'min-w-[280px] max-w-[320px]'
    }`}>
      <Collapsible 
        open={!isCollapsed && !shouldAutoCollapse} 
        onOpenChange={setIsCollapsed}
      >
        <Card className={`h-full ${column.color} transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
        } ${
          isMobile ? 'touch-manipulation' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                >
                  <CardTitle className="text-sm font-semibold">
                    {column.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                  {isMobile && (
                    <div className="ml-auto">
                      {isCollapsed || shouldAutoCollapse ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronUp className="w-4 h-4" />
                      }
                    </div>
                  )}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(column.id)}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent 
              className={`flex-1 transition-colors duration-200 ${
                isMobile ? 'min-h-[300px]' : 'min-h-[400px]'
              } ${
                isDragOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
              }`}
              onDragOver={!isTouchDevice ? handleDragOver : undefined}
              onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
              onDrop={!isTouchDevice ? handleDrop : undefined}
            >
              {column.tasks.length === 0 ? (
                <div className={`flex items-center justify-center h-32 text-muted-foreground ${
                  isTouchDevice ? 'border-2 border-dashed border-muted rounded-lg' : ''
                }`}>
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune tâche</p>
                    {isTouchDevice && (
                      <p className="text-xs mt-1 opacity-75">Zone de dépôt tactile</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggle={onToggleTask}
                      isSelected={bulkSelection.has(task.id)}
                      onSelect={toggleBulkSelection}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

// Composant principal KanbanBoard
export const KanbanBoard: React.FC = () => {
  const {
    allTasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadTasks
  } = useTaskManager();
  
  const kanbanGuide = getToolGuide('kanban');
  
  const { toast } = useToast();
  
  // Hooks d'optimisation Phase 4
  const { useMemoizedTasks, useDebouncedSearch, useVirtualScroll } = usePerformanceOptimizations();
  const { announceToScreenReader, handleKeyboardNavigation, generateAriaLabel } = useAccessibility({ enableKeyboardNavigation: true, announceChanges: true });
  const { 
    loadingState,
    startLoading, 
    stopLoading, 
    LoadingOverlay,
    undo: undoLastAction,
    redo: redoLastAction,
    canUndo,
    canRedo,
    bulkSelection,
    toggleBulkSelection,
    clearSelection,
    bulkUpdateTasks,
    isAnimating: isLoading
  } = useEnhancedUX({ enableAnimations: true, enableUndoRedo: true, maxHistorySize: 50, enableLoadingStates: true });
  const { 
    currentCriteria: activeFilters, 
    updateCriteria: setActiveFilters, 
    filterTasks: getFilteredTasks, 
    quickFilters, 
    applyQuickFilter,
    globalSearch,
    searchResults
  } = useAdvancedFiltering();
  
  // Create search query state and filtered tasks
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTasks = useMemo(() => {
    if (!searchQuery && !activeFilters) return allTasks;
    return getFilteredTasks(allTasks, activeFilters);
  }, [allTasks, activeFilters, searchQuery, getFilteredTasks]);
  const { notifications, markNotificationAsRead: markAsRead } = useCrossToolIntegration({ 
    enableNotifications: true, 
    enableCrossReferences: true, 
    enableComments: true, 
    enableActivityTimeline: true,
    notificationSettings: {
      email: false,
      push: true,
      inApp: true
    }
  });
  const { PerformancePanel, measureRenderTime, startInteractionMeasure, endInteractionMeasure } = usePerformanceMonitoring();
  const { isMobile, isTouchDevice, screenSize } = useMobileResponsive();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [mobileViewMode, setMobileViewMode] = useState<'kanban' | 'list'>('kanban');
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
   * Organise les tâches par statut dans les colonnes Kanban
   */
  const organizeTasksIntoColumns = useCallback(() => {
    const tasksByStatus = {
      'todo': allTasks.filter(task => !task.completed && !task.tags.includes('in-progress') && !task.tags.includes('review')),
      'in-progress': allTasks.filter(task => !task.completed && task.tags.includes('in-progress')),
      'review': allTasks.filter(task => !task.completed && task.tags.includes('review')),
      'done': allTasks.filter(task => task.completed)
    };

    const newColumns = DEFAULT_COLUMNS.map(col => ({
      ...col,
      tasks: tasksByStatus[col.status] || []
    }));

    setColumns(newColumns);
  }, [allTasks]);

  /**
   * Gère le déplacement d'une tâche entre les colonnes
   */
  const handleTaskDrop = useCallback(async (taskId: string, targetColumnId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    let updates: Partial<Task> = {};
    let newTags = task.tags.filter(tag => !['in-progress', 'review'].includes(tag));

    switch (targetColumnId) {
      case 'todo':
        updates = { completed: false };
        break;
      case 'in-progress':
        updates = { completed: false };
        newTags.push('in-progress');
        break;
      case 'review':
        updates = { completed: false };
        newTags.push('review');
        break;
      case 'done':
        updates = { completed: true };
        break;
    }

    updates.tags = newTags;

    try {
      await updateTask(taskId, updates);
      toast({
        title: "Tâche déplacée",
        description: `"${task.title}" a été déplacée vers ${DEFAULT_COLUMNS.find(c => c.id === targetColumnId)?.title}`,
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
   * Ouvre le dialogue d'ajout de tâche pour une colonne spécifique
   */
  const handleAddTask = useCallback((columnId: string) => {
    setSelectedColumnId(columnId);
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
    
    // Ajouter les tags appropriés selon la colonne de destination
    if (selectedColumnId === 'in-progress') {
      initialTags.push('in-progress');
    } else if (selectedColumnId === 'review') {
      initialTags.push('review');
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      completed: selectedColumnId === 'done',
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
  }, [newTask, selectedColumnId, addTask, loadTasks, toast]);

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
   * Gère le basculement du statut d'une tâche
   */
  const handleToggleTask = useCallback(async (taskId: string) => {
    try {
      await toggleTask(taskId);
      await loadTasks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la tâche",
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
      await exportKanbanData(allTasks, options);
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
   * Gère l'affichage/masquage des métriques
   */
  const handleToggleMetrics = useCallback(() => {
    setShowMetrics(prev => !prev);
    AccessibilityUtils.announceToScreenReader(
      showMetrics ? 'Métriques masquées' : 'Métriques affichées'
    );
  }, [showMetrics]);

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
  const shortcuts = getKanbanShortcuts({
    onAddTask: handleOpenAddDialog,
    onToggleMetrics: handleToggleMetrics,
    onExportPDF: () => handleExport('pdf'),
    onExportCSV: () => handleExport('csv'),
    onFocusSearch: handleFocusSearch
  });

  useKeyboardShortcuts(shortcuts);

  // Réorganiser les tâches quand elles changent
  useEffect(() => {
    organizeTasksIntoColumns();
  }, [organizeTasksIntoColumns]);

  // Utiliser les tâches filtrées au lieu de allTasks
  const tasksToDisplay = useMemoizedTasks(filteredTasks, {
    searchTerm: searchQuery || '',
    status: activeFilters.statuses?.[0] || 'all',
    priority: activeFilters.priorities?.[0] || 'all',
    category: activeFilters.categories?.[0] || 'all'
  });
  
  // Mesurer les performances de rendu
  useEffect(() => {
    measureRenderTime();
  });

  return (
    <ErrorBoundary>
      <div className={`space-y-4 ${isMobile ? 'px-2' : ''}`}>
        {/* Overlay de chargement */}
        <LoadingOverlay />
        
        {/* Panneau de performance (développement) */}
        <PerformancePanel />
        
        {/* Barre de recherche et filtres avancés */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Rechercher dans toutes les tâches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              aria-label="Recherche globale des tâches"
            />
            <div className="flex gap-2 flex-wrap">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={quickFilters.some(f => f.id === filter.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyQuickFilter(filter.id)}
                  aria-pressed={quickFilters.some(f => f.id === filter.id)}
                >
                  {filter.label || filter.id}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Actions en lot */}
          {bulkSelection.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">
                {bulkSelection.size} tâche(s) sélectionnée(s)
              </span>
              <Button
                size="sm"
                onClick={() => bulkUpdateTasks(Array.from(bulkSelection), { status: 'done' }, async (taskId: string, updates: Partial<Task>) => {
                  await updateTask(taskId, updates);
                })}
              >
                Marquer comme terminées
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
              >
                Désélectionner
              </Button>
            </div>
          )}
          
          {/* Contrôles Undo/Redo */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undoLastAction}
              disabled={!canUndo}
              aria-label="Annuler la dernière action"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redoLastAction}
              disabled={!canRedo}
              aria-label="Refaire la dernière action"
            >
              Refaire
            </Button>
          </div>
        </div>

        {/* En-tête du Kanban */}
        <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-4' : ''}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h2 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>Tableau Kanban</h2>
            <p className="text-muted-foreground">Organisez vos tâches visuellement</p>
          </div>
        <div className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full' : ''}`}>
          <div className="text-sm text-muted-foreground">
            Total: {allTasks.length} tâches
          </div>
          
          {/* Mobile view mode toggle */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant={mobileViewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMobileViewMode('kanban')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={mobileViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMobileViewMode('list')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Liste
              </Button>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={isMobile ? 'w-full' : ''}>
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

      {/* Métriques */}
      {showMetrics && <KanbanMetrics tasks={tasksToDisplay} className="mb-6" />}

      {/* Suggestions IA */}
      <AISuggestions tasks={tasksToDisplay} onApplySuggestion={(taskId, suggestion) => {
        // Logique pour appliquer les suggestions IA
        console.log('Applying suggestion:', taskId, suggestion);
        announceToScreenReader(`Suggestion appliquée pour la tâche ${taskId}`);
      }} />

      {/* Colonnes Kanban ou Vue Liste Mobile */}
      {isMobile && mobileViewMode === 'list' ? (
        <div className="space-y-4">
          {columns.map((column) => (
            <Card key={column.id} className="bg-card text-card-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  {column.title}
                  <Badge variant="secondary" className="ml-2">
                    {column.tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune tâche</p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onToggle={handleToggleTask}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`flex gap-4 overflow-x-auto pb-4 ${
          isMobile ? 'px-2 min-h-[400px]' : 'min-h-[600px]'
        }`}>
          {columns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              onTaskDrop={handleTaskDrop}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
              bulkSelection={bulkSelection}
              toggleBulkSelection={toggleBulkSelection}
            />
          ))}
        </div>
      )}

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
      
      {/* Guide d'utilisation */}
      {kanbanGuide && (
        <UserGuide
          toolName={kanbanGuide.toolName}
          toolIcon={kanbanGuide.toolIcon}
          sections={kanbanGuide.sections}
          quickTips={kanbanGuide.quickTips}
          shortcuts={kanbanGuide.shortcuts}
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default KanbanBoard;