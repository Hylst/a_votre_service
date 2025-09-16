/**
 * CrossToolManager.tsx
 * Interface pour gérer l'import/export et la conversion de données entre les outils de productivité
 * Corrige également les problèmes de nesting DOM en utilisant des structures HTML appropriées
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowRightLeft, 
  Download, 
  Upload, 
  FileJson, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  RefreshCw,
  BarChart3,
  Settings
} from 'lucide-react';
import { useCrossToolConverter, ImportExportStats } from '../hooks/useCrossToolConverter';
import { useToast } from '@/hooks/use-toast';

interface ToolOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    key: 'todo-tasks',
    label: 'To-Do List',
    description: 'Liste de tâches simple',
    icon: '📝'
  },
  {
    key: 'tasks-pro',
    label: 'Tâches Pro',
    description: 'Gestion avancée des tâches',
    icon: '⚡'
  },
  {
    key: 'goals-data',
    label: 'Objectifs',
    description: 'Gestion des objectifs et jalons',
    icon: '🎯'
  },
  {
    key: 'kanban-tasks',
    label: 'Kanban',
    description: 'Tableau Kanban',
    icon: '📋'
  },
  {
    key: 'eisenhower-tasks',
    label: 'Eisenhower',
    description: 'Matrice d\'Eisenhower',
    icon: '🔲'
  }
];

export const CrossToolManager: React.FC = () => {
  const { toast } = useToast();
  const {
    isProcessing,
    lastStats,
    importTasksBetweenTools,
    exportAllData,
    importFromJSON,
    downloadJSON,
    migrateFromLegacyFormats,
    analyzeCompatibility
  } = useCrossToolConverter();

  const [sourceKey, setSourceKey] = useState<string>('');
  const [targetKey, setTargetKey] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleImportBetweenTools = useCallback(async () => {
    if (!sourceKey || !targetKey) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner les outils source et cible",
        variant: "destructive"
      });
      return;
    }

    if (sourceKey === targetKey) {
      toast({
        title: "Sélection invalide",
        description: "L'outil source et cible doivent être différents",
        variant: "destructive"
      });
      return;
    }

    const sourceType = sourceKey.includes('goals') ? 'goals' : 
                      sourceKey.includes('kanban') ? 'kanban' :
                      sourceKey.includes('eisenhower') ? 'eisenhower' :
                      sourceKey.includes('tasks-pro') ? 'tasks-pro' : 'todo';
    
    const targetType = targetKey.includes('goals') ? 'goals' : 
                      targetKey.includes('kanban') ? 'kanban' :
                      targetKey.includes('eisenhower') ? 'eisenhower' :
                      targetKey.includes('tasks-pro') ? 'tasks-pro' : 'todo';

    await importTasksBetweenTools(sourceKey, targetKey, sourceType, targetType);
  }, [sourceKey, targetKey, importTasksBetweenTools, toast]);

  const handleExportAll = useCallback(async () => {
    const jsonData = await exportAllData();
    if (jsonData) {
      downloadJSON(jsonData, `productivity-export-${new Date().toISOString().split('T')[0]}.json`);
    }
  }, [exportAllData, downloadJSON]);

  const handleImportFromFile = useCallback(async () => {
    if (!importData.trim()) {
      toast({
        title: "Données manquantes",
        description: "Veuillez coller les données JSON à importer",
        variant: "destructive"
      });
      return;
    }

    if (!targetKey) {
      toast({
        title: "Outil cible manquant",
        description: "Veuillez sélectionner l'outil de destination",
        variant: "destructive"
      });
      return;
    }

    await importFromJSON(importData, targetKey);
    setImportData('');
    setShowImportDialog(false);
  }, [importData, targetKey, importFromJSON, toast]);

  const handleAnalyzeCompatibility = useCallback(async () => {
    if (!sourceKey || !targetKey) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner les outils à analyser",
        variant: "destructive"
      });
      return;
    }

    const result = await analyzeCompatibility(sourceKey, targetKey);
    setCompatibilityResult(result);
  }, [sourceKey, targetKey, analyzeCompatibility, toast]);

  const getToolOption = (key: string) => TOOL_OPTIONS.find(tool => tool.key === key);

  const StatsDisplay: React.FC<{ stats: ImportExportStats }> = ({ stats }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-4 h-4" />
          Statistiques de la dernière opération
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</div>
            <div className="text-xs text-muted-foreground">Total traité</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            <div className="text-xs text-muted-foreground">Réussi</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Échoué</div>
          </div>
        </div>
        
        {stats.totalProcessed > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux de réussite</span>
              <span>{Math.round((stats.successful / stats.totalProcessed) * 100)}%</span>
            </div>
            <Progress value={(stats.successful / stats.totalProcessed) * 100} className="h-2" />
          </div>
        )}

        {stats.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Avertissements :</div>
              <ul className="text-sm space-y-1">
                {stats.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {stats.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Erreurs :</div>
              <ul className="text-sm space-y-1">
                {stats.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Gestionnaire Inter-Outils
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Importez, exportez et convertissez vos données entre tous les outils de productivité
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import-export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
              <TabsTrigger value="migration">Migration</TabsTrigger>
              <TabsTrigger value="analysis">Analyse</TabsTrigger>
            </TabsList>

            <TabsContent value="import-export" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Import entre outils</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Copiez des tâches d'un outil vers un autre
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Outil source</Label>
                      <Select value={sourceKey} onValueChange={setSourceKey}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'outil source" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOL_OPTIONS.map(tool => (
                            <SelectItem key={tool.key} value={tool.key}>
                              <div className="flex items-center gap-2">
                                <span>{tool.icon}</span>
                                <div>
                                  <div className="font-medium">{tool.label}</div>
                                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                      <Label>Outil cible</Label>
                      <Select value={targetKey} onValueChange={setTargetKey}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'outil cible" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOL_OPTIONS.map(tool => (
                            <SelectItem key={tool.key} value={tool.key}>
                              <div className="flex items-center gap-2">
                                <span>{tool.icon}</span>
                                <div>
                                  <div className="font-medium">{tool.label}</div>
                                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleImportBetweenTools}
                      disabled={isProcessing || !sourceKey || !targetKey}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Import en cours...
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Importer les tâches
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Export/Import fichier</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Sauvegardez ou restaurez toutes vos données
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleExportAll}
                      disabled={isProcessing}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter toutes les données
                    </Button>

                    <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Importer depuis un fichier
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Importer des données JSON</DialogTitle>
                          <DialogDescription>
                            Collez le contenu du fichier JSON exporté précédemment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Outil de destination</Label>
                            <Select value={targetKey} onValueChange={setTargetKey}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'outil" />
                              </SelectTrigger>
                              <SelectContent>
                                {TOOL_OPTIONS.map(tool => (
                                  <SelectItem key={tool.key} value={tool.key}>
                                    <div className="flex items-center gap-2">
                                      <span>{tool.icon}</span>
                                      <span>{tool.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Données JSON</Label>
                            <Textarea
                              value={importData}
                              onChange={(e) => setImportData(e.target.value)}
                              placeholder="Collez ici le contenu du fichier JSON..."
                              rows={10}
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleImportFromFile} disabled={isProcessing}>
                              {isProcessing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Import...
                                </>
                              ) : (
                                <>
                                  <FileJson className="w-4 h-4 mr-2" />
                                  Importer
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="migration" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Migration des données</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Migrez vos données depuis les anciens formats vers le nouveau système unifié
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Cette opération convertira automatiquement toutes vos données existantes vers le nouveau format unifié, 
                      permettant une meilleure compatibilité entre les outils.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={migrateFromLegacyFormats}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Migration en cours...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Démarrer la migration
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analyse de compatibilité</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Vérifiez la compatibilité des données entre deux outils
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Premier outil</Label>
                      <Select value={sourceKey} onValueChange={setSourceKey}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un outil" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOL_OPTIONS.map(tool => (
                            <SelectItem key={tool.key} value={tool.key}>
                              <div className="flex items-center gap-2">
                                <span>{tool.icon}</span>
                                <span>{tool.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Deuxième outil</Label>
                      <Select value={targetKey} onValueChange={setTargetKey}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un outil" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOL_OPTIONS.map(tool => (
                            <SelectItem key={tool.key} value={tool.key}>
                              <div className="flex items-center gap-2">
                                <span>{tool.icon}</span>
                                <span>{tool.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAnalyzeCompatibility}
                    disabled={isProcessing || !sourceKey || !targetKey}
                    className="w-full"
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyser la compatibilité
                  </Button>

                  {compatibilityResult && (
                    <Card className="mt-4">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {compatibilityResult.compatible ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {compatibilityResult.compatible ? 'Compatible' : 'Non compatible'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {compatibilityResult.reason}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Source: </span>
                              {compatibilityResult.sourceCount} éléments
                            </div>
                            <div>
                              <span className="font-medium">Cible: </span>
                              {compatibilityResult.targetCount} éléments
                            </div>
                          </div>
                          
                          {compatibilityResult.warnings && compatibilityResult.warnings.length > 0 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="font-medium mb-1">Avertissements :</div>
                                <ul className="text-sm space-y-1">
                                  {compatibilityResult.warnings.map((warning: string, index: number) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-yellow-500 mt-0.5">•</span>
                                      <span>{warning}</span>
                                    </li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {lastStats && <StatsDisplay stats={lastStats} />}
    </div>
  );
};