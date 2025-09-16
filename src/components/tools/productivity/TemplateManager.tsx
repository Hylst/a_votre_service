/**
 * TemplateManager.tsx - Interface de gestion des templates de productivité
 * Permet de parcourir, sélectionner et appliquer des templates prédéfinis ou personnalisés
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  Upload,
  Star,
  Code,
  TrendingUp,
  Users,
  User,
  Clock,
  Tag,
  Trash2,
  Copy,
  Play
} from 'lucide-react';
import { TemplateManager, ProductivityTemplate, TemplateCategory, TEMPLATE_CATEGORIES } from './utils/templates';
import { Task } from './hooks/useTaskManager';

interface TemplateManagerProps {
  onApplyTemplate: (tasks: Task[], columns?: string[]) => void;
  currentTasks?: Task[];
  onCreateTemplate?: (template: ProductivityTemplate) => void;
}

interface CreateTemplateForm {
  name: string;
  description: string;
  type: 'kanban' | 'eisenhower' | 'hybrid';
  columns: string;
  tags: string;
}

const CATEGORY_ICONS = {
  development: Code,
  marketing: TrendingUp,
  management: Users,
  personal: User,
  custom: Star
};

const TemplateManagerComponent: React.FC<TemplateManagerProps> = ({
  onApplyTemplate,
  currentTasks = [],
  onCreateTemplate
}) => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProductivityTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTemplateForm>({
    name: '',
    description: '',
    type: 'kanban',
    columns: 'À faire, En cours, Terminé',
    tags: ''
  });

  // Charger les templates au montage du composant
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const allCategories = TemplateManager.getAllTemplates();
    setCategories(allCategories);
  };

  // Filtrer les templates selon la catégorie et la recherche
  const getFilteredTemplates = (): ProductivityTemplate[] => {
    let templates: ProductivityTemplate[] = [];
    
    if (selectedCategory === 'all') {
      templates = categories.flatMap(cat => cat.templates);
    } else {
      const category = categories.find(cat => cat.id === selectedCategory);
      templates = category ? category.templates : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return templates;
  };

  const handleApplyTemplate = (template: ProductivityTemplate) => {
    const tasks = TemplateManager.applyTemplate(template);
    onApplyTemplate(tasks, template.columns);
    toast.success(`Template "${template.name}" appliqué avec succès!`);
  };

  const handleCreateTemplate = () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (currentTasks.length === 0) {
      toast.error('Aucune tâche disponible pour créer un template');
      return;
    }

    try {
      const columns = createForm.columns.split(',').map(col => col.trim()).filter(col => col);
      const tags = createForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const newTemplate = TemplateManager.createTemplateFromTasks(currentTasks, {
        name: createForm.name,
        description: createForm.description,
        type: createForm.type,
        columns: columns.length > 0 ? columns : undefined,
        settings: {
          defaultPriority: 'medium'
        }
      });

      // Ajouter les tags personnalisés
      newTemplate.tags = [...newTemplate.tags, ...tags];
      
      loadTemplates();
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        description: '',
        type: 'kanban',
        columns: 'À faire, En cours, Terminé',
        tags: ''
      });
      
      toast.success('Template personnalisé créé avec succès!');
      onCreateTemplate?.(newTemplate);
    } catch (error) {
      toast.error('Erreur lors de la création du template');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (TemplateManager.deleteCustomTemplate(templateId)) {
      loadTemplates();
      toast.success('Template supprimé avec succès');
    } else {
      toast.error('Erreur lors de la suppression du template');
    }
  };

  const handleDuplicateTemplate = (template: ProductivityTemplate) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copie)`,
      id: undefined,
      createdAt: undefined,
      isDefault: false
    };
    
    const newTemplate = TemplateManager.saveCustomTemplate(duplicatedTemplate);
    loadTemplates();
    toast.success('Template dupliqué avec succès!');
  };

  const exportTemplates = () => {
    const data = TemplateManager.exportCustomTemplates();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity-templates.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Templates exportés avec succès!');
  };

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (TemplateManager.importCustomTemplates(content)) {
          loadTemplates();
          toast.success('Templates importés avec succès!');
        } else {
          toast.error('Erreur lors de l\'importation des templates');
        }
      } catch (error) {
        toast.error('Fichier invalide');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher des templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un template personnalisé</DialogTitle>
                <DialogDescription>
                  Créez un template basé sur vos tâches actuelles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nom du template *</Label>
                  <Input
                    id="template-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mon template personnalisé"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description *</Label>
                  <Textarea
                    id="template-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du template..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Type</Label>
                  <Select value={createForm.type} onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kanban">Kanban</SelectItem>
                      <SelectItem value="eisenhower">Eisenhower</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-columns">Colonnes (séparées par des virgules)</Label>
                  <Input
                    id="template-columns"
                    value={createForm.columns}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, columns: e.target.value }))}
                    placeholder="À faire, En cours, Terminé"
                  />
                </div>
                <div>
                  <Label htmlFor="template-tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="template-tags"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="productivité, personnel"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    Créer le template
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={exportTemplates}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importTemplates}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {TEMPLATE_CATEGORIES.map(category => {
            const Icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS];
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery ? 'Aucun template trouvé pour cette recherche' : 'Aucun template disponible'}
              </div>
              {!searchQuery && (
                <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => {
                const Icon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || Star;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        {!template.isDefault && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{template.tasks.length} tâches</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {Math.round(template.tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0) / 60)}h
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleApplyTemplate(template)}
                            className="flex-1"
                            size="sm"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Appliquer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowTemplateDialog(true);
                            }}
                          >
                            Détails
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de détails du template */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(CATEGORY_ICONS[selectedTemplate.category as keyof typeof CATEGORY_ICONS] || Star, { className: "h-5 w-5" })}
                  {selectedTemplate.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {selectedTemplate.type}
                  </div>
                  <div>
                    <span className="font-medium">Catégorie:</span> {selectedTemplate.category}
                  </div>
                  <div>
                    <span className="font-medium">Tâches:</span> {selectedTemplate.tasks.length}
                  </div>
                  <div>
                    <span className="font-medium">Durée estimée:</span>{' '}
                    {Math.round(selectedTemplate.tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0) / 60)}h
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedTemplate.columns && (
                  <div>
                    <h4 className="font-medium mb-2">Colonnes</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.columns.map(column => (
                        <Badge key={column} variant="outline">
                          {column}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Tâches incluses</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTemplate.tasks.map((task, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          {task.estimatedDuration && (
                            <span className="text-xs text-muted-foreground">
                              {task.estimatedDuration}min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      handleApplyTemplate(selectedTemplate);
                      setShowTemplateDialog(false);
                    }}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Appliquer ce template
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManagerComponent;