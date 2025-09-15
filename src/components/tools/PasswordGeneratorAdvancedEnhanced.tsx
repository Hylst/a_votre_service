import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Settings, BarChart, Heart, Sparkles, Upload } from "lucide-react";

// Import enhanced components
import { PasswordAnalyzerEnhanced } from "./passwordGenerator/PasswordAnalyzerEnhanced";
import { PasswordTemplatesEnhanced } from "./passwordGenerator/PasswordTemplatesEnhanced";
import { PasswordSettingsAdvanced } from "./passwordGenerator/PasswordSettingsAdvanced";
import { PasswordHistoryAdvanced } from "./passwordGenerator/PasswordHistoryAdvanced";
import { PasswordDisplayAdvanced } from "./passwordGenerator/PasswordDisplayAdvanced";
import { PasswordMetadataForm } from "./passwordGenerator/components/PasswordMetadataForm";
import { PasswordExportAdvanced } from "./passwordGenerator/components/PasswordExportAdvanced";
import { PasswordImportAdvanced } from "./passwordGenerator/PasswordImportAdvanced";

// Import enhanced hook
import { usePasswordGeneratorEnhanced } from "./passwordGenerator/hooks/usePasswordGeneratorEnhanced";

export const PasswordGeneratorAdvancedEnhanced = () => {
  const {
    currentPassword,
    settings,
    currentStrength,
    isGenerating,
    history,
    templates,
    stats,
    templateFavorites,
    generatePassword,
    analyzeStrength,
    updateSettings,
    applyTemplate,
    toggleTemplateFavorite,
    toggleFavorite,
    markAsCopied,
    exportUniversalData,
    importUniversalData
  } = usePasswordGeneratorEnhanced();

  const [activeTab, setActiveTab] = useState("generator");
  const [siteName, setSiteName] = useState("");
  const [username, setUsername] = useState("");

  const handleCopyPassword = async (password: string, entryId?: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Mot de passe copié !");
      if (entryId) {
        markAsCopied(entryId);
      }
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleGenerateAndCopy = async () => {
    const password = await generatePassword(undefined, siteName, username);
    if (password) {
      handleCopyPassword(password);
    }
  };

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-lg">Génération en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Générateur de mot de passe
              </CardTitle>
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs px-2 py-0.5">Génération</Badge>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">Analyse</Badge>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">Import/Export</Badge>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">Historique</Badge>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">Chiffrement</Badge>
              </div>
            </div>
            
            {/* General Statistics moved to top right */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded text-center min-w-0">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Total</span>
                <span className="text-sm font-bold text-purple-600">{stats.totalGenerated}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-center min-w-0">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Force Moy.</span>
                <span className="text-sm font-bold text-blue-600">{stats.averageStrength}%</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-center min-w-0">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Forts</span>
                <span className="text-sm font-bold text-green-600">{stats.strongPasswords}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded text-center min-w-0">
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Longueur</span>
                <span className="text-sm font-bold text-indigo-600">{stats.mostUsedLength}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <PasswordDisplayAdvanced
            password={currentPassword}
            strength={currentStrength || { 
              score: 0, level: '', color: '', feedback: [], entropy: 0
            }}
            onCopy={handleCopyPassword}
            stats={stats}
          />
          
          {/* Generate buttons + Password characteristics */}
          <div className="flex flex-col lg:flex-row gap-3 mt-3">
            {/* Generate buttons */}
            <div className="flex gap-2 lg:flex-1">
              <Button 
                onClick={() => generatePassword(undefined, siteName, username)}
                disabled={isGenerating}
                className="flex-1 h-9"
              >
                {isGenerating ? 'Génération...' : 'Générer'}
              </Button>
              <Button 
                onClick={handleGenerateAndCopy}
                disabled={isGenerating}
                variant="outline"
                className="h-9 whitespace-nowrap"
              >
                <Copy className="w-4 h-4 mr-1" />
                Générer & Copier
              </Button>
            </div>
            

          </div>
          
          {/* Metadata Form */}
          <PasswordMetadataForm
            siteName={siteName}
            username={username}
            onSiteNameChange={setSiteName}
            onUsernameChange={setUsername}
            className="mt-3"
          />
        </CardContent>
      </Card>

      {/* Interface à onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-9">
          <TabsTrigger value="generator" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="text-xs">
            <BarChart className="w-3 h-3 mr-1" />
            Analyseur
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <Heart className="w-3 h-3 mr-1" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="import" className="text-xs">
            <Upload className="w-3 h-3 mr-1" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-3 mt-3">
          <PasswordSettingsAdvanced
            settings={settings}
            onSettingsChange={updateSettings}
            templates={templates}
            onApplyTemplate={applyTemplate}
          />
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-3 mt-3">
          <PasswordAnalyzerEnhanced
            password={currentPassword}
            analyzeStrength={analyzeStrength}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-3 mt-3">
          <PasswordTemplatesEnhanced
            templates={templates}
            onApplyTemplate={applyTemplate}
            onToggleFavorite={toggleTemplateFavorite}
            favorites={templateFavorites}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-3">
          <PasswordHistoryAdvanced
            history={history}
            templates={templates}
            onCopy={handleCopyPassword}
            onToggleFavorite={toggleFavorite}
          />
        </TabsContent>

        <TabsContent value="import" className="space-y-3 mt-3">
          <PasswordImportAdvanced
            onImport={(passwords) => {
              // Intégrer les mots de passe importés dans l'historique
              passwords.forEach(password => {
                importUniversalData({
                  passwords: [password],
                  settings: password.settings || settings,
                  templates: [],
                  favorites: []
                });
              });
              toast.success(`${passwords.length} mots de passe importés avec succès !`);
            }}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-3 mt-3">
          <PasswordExportAdvanced
            passwords={history}
            onExport={(format, encrypted) => {
              console.log(`Export completed: ${format}, encrypted: ${encrypted}`);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};