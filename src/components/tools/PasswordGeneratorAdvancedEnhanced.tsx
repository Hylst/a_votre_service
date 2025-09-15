import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Settings, BarChart, Heart, Sparkles, Upload, Shield } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-7 h-9">
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
          <TabsTrigger value="cybersecurity" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Conseils
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

        <TabsContent value="cybersecurity" className="space-y-3 mt-3">
          <CybersecurityGuide />
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

// Composant Guide de Cybersécurité
const CybersecurityGuide = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Introduction */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Guide des Bonnes Pratiques en Cybersécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            La cybersécurité est devenue essentielle dans notre monde numérique. Ce guide vous présente 
            les bases indispensables pour protéger vos données personnelles et professionnelles contre 
            les menaces en ligne.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Pourquoi c'est important ?</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Chaque jour, des millions d'attaques cybernétiques ont lieu. Une seule faille peut compromettre 
              toutes vos données personnelles, financières et professionnelles.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mots de passe sécurisés */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleSection('passwords')}
          >
            <CardTitle className="flex items-center gap-2">
              🔐 Mots de passe sécurisés
            </CardTitle>
            <span className="text-2xl">{expandedSections.includes('passwords') ? '−' : '+'}</span>
          </Button>
        </CardHeader>
        {expandedSections.includes('passwords') && (
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Scénario réel</h4>
              <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                En 2023, un employé utilise le même mot de passe "motdepasse123" pour son email professionnel 
                et personnel. Un pirate accède à sa boîte mail personnelle et utilise les informations pour 
                compromettre le système de l'entreprise, causant 2 millions d'euros de dégâts.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Bonnes pratiques</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Un mot de passe unique par compte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Utiliser un gestionnaire de mots de passe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Activer l'authentification à deux facteurs (2FA)</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">❌ À éviter absolument</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Mots de passe basés sur des informations personnelles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Réutiliser le même mot de passe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Stocker les mots de passe dans un fichier non chiffré</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Partager ses mots de passe par email ou SMS</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Astuce technique</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Passphrase :</strong> Utilisez une phrase secrète comme "MonChat!Mange3Souris@Minuit" 
                - plus facile à retenir et très sécurisée (entropie élevée).
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phishing et ingénierie sociale */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleSection('phishing')}
          >
            <CardTitle className="flex items-center gap-2">
              🎣 Phishing et Ingénierie Sociale
            </CardTitle>
            <span className="text-2xl">{expandedSections.includes('phishing') ? '−' : '+'}</span>
          </Button>
        </CardHeader>
        {expandedSections.includes('phishing') && (
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Scénario réel</h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Vous recevez un email "urgent" de votre banque demandant de vérifier votre compte. 
                Le lien vous mène vers un site identique à celui de votre banque, mais l'URL est 
                "banque-verification-securite.com" au lieu de "banque.fr". Vous saisissez vos identifiants...
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">🔍 Comment identifier une tentative de phishing :</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-orange-600">Signaux d'alerte dans les emails :</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Urgence artificielle ("Votre compte sera fermé")</li>
                    <li>• Fautes d'orthographe et de grammaire</li>
                    <li>• Adresse expéditeur suspecte</li>
                    <li>• Demande d'informations confidentielles</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-orange-600">Vérifications à effectuer :</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Survoler les liens sans cliquer</li>
                    <li>• Vérifier l'URL complète</li>
                    <li>• Contacter directement l'organisme</li>
                    <li>• Vérifier les certificats SSL</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🛡️ Protection</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Règle d'or :</strong> Aucune organisation légitime ne vous demandera jamais vos mots de passe 
                ou informations sensibles par email. En cas de doute, contactez directement l'organisme par téléphone.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mises à jour et sauvegardes */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleSection('updates')}
          >
            <CardTitle className="flex items-center gap-2">
              🔄 Mises à jour et Sauvegardes
            </CardTitle>
            <span className="text-2xl">{expandedSections.includes('updates') ? '−' : '+'}</span>
          </Button>
        </CardHeader>
        {expandedSections.includes('updates') && (
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Cas réel : WannaCry (2017)</h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Le ransomware WannaCry a infecté plus de 300 000 ordinateurs dans 150 pays, paralysant 
                des hôpitaux, entreprises et administrations. La faille exploitée était corrigée par Microsoft 
                2 mois avant l'attaque, mais beaucoup n'avaient pas installé la mise à jour.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Mises à jour essentielles</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Système d'exploitation (Windows, macOS, Linux)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Navigateurs web (Chrome, Firefox, Safari)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Antivirus et pare-feu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Applications et plugins</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">💾 Stratégie de sauvegarde 3-2-1</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>3</strong> copies de vos données importantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>2</strong> supports différents (disque dur + cloud)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>1</strong> copie hors site (cloud sécurisé)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚡ Automatisation</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Activez les mises à jour automatiques pour les correctifs de sécurité critiques. 
                Programmez des sauvegardes automatiques hebdomadaires de vos données importantes.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Wi-Fi et réseaux */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleSection('wifi')}
          >
            <CardTitle className="flex items-center gap-2">
              📶 Sécurité Wi-Fi et Réseaux
            </CardTitle>
            <span className="text-2xl">{expandedSections.includes('wifi') ? '−' : '+'}</span>
          </Button>
        </CardHeader>
        {expandedSections.includes('wifi') && (
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Piège du Wi-Fi public</h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Dans un café, vous vous connectez au Wi-Fi "Cafe_Gratuit". Un pirate a créé ce faux point d'accès 
                pour intercepter toutes vos communications : emails, mots de passe, données bancaires...
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">🔒 Sécurisation de votre réseau domestique :</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-green-600">Configuration du routeur :</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Changer le mot de passe administrateur par défaut</li>
                    <li>• Utiliser le chiffrement WPA3 (ou WPA2 minimum)</li>
                    <li>• Désactiver le WPS</li>
                    <li>• Masquer le nom du réseau (SSID)</li>
                    <li>• Mettre à jour le firmware régulièrement</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-orange-600">Wi-Fi public - Précautions :</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Utiliser un VPN fiable</li>
                    <li>• Éviter les sites sensibles (banque, email)</li>
                    <li>• Vérifier le nom exact du réseau</li>
                    <li>• Désactiver le partage de fichiers</li>
                    <li>• Utiliser HTTPS uniquement</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔧 Termes techniques</h4>
              <div className="space-y-2 text-sm">
                <p><strong>VPN (Virtual Private Network) :</strong> Tunnel chiffré qui masque votre adresse IP et chiffre vos données.</p>
                <p><strong>WPA3/WPA2 :</strong> Protocoles de sécurité Wi-Fi. WPA3 est le plus récent et le plus sécurisé.</p>
                <p><strong>HTTPS :</strong> Version sécurisée du protocole HTTP, identifiable par le cadenas dans l'URL.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Checklist de sécurité */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ Checklist de Sécurité Mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">🔄 Actions mensuelles</h4>
              <div className="space-y-2">
                {[
                  'Vérifier les mises à jour système',
                  'Analyser les connexions suspectes',
                  'Nettoyer les mots de passe inutilisés',
                  'Vérifier les sauvegardes',
                  'Réviser les paramètres de confidentialité'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">🛡️ Vérifications trimestrielles</h4>
              <div className="space-y-2">
                {[
                  'Audit complet des mots de passe',
                  'Test de restauration des sauvegardes',
                  'Formation cybersécurité équipe',
                  'Révision des accès et permissions',
                  'Mise à jour du plan de réponse aux incidents'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};