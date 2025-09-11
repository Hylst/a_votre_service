import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, MessageCircle, Target, TrendingUp, User, CheckCircle, Star, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useLLMManager } from "@/components/tools/productivity/hooks/useLLMManager";
import { useToast } from "@/hooks/use-toast";

// AICoach.tsx - Enhanced AI-powered career coaching tool with LLM integration
// Provides personalized profile analysis and adaptive recommendations

interface ProfileAnalysis {
  strengths: string[];
  areasForImprovement: string[];
  careerSuggestions: string[];
  skillGaps: string[];
  nextSteps: string[];
}

interface AdaptiveRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  actionItems: string[];
}

export const AICoach = () => {
  const { toast } = useToast();
  const { hasConfiguredProvider, decomposeTaskWithAI, isLoading, defaultProvider, providers, reloadProviders } = useLLMManager();
  
  // Debug logs pour le hook useLLMManager
  console.log('🔍 [AICoach] useLLMManager state:');
  console.log('  - hasConfiguredProvider:', hasConfiguredProvider);
  console.log('  - defaultProvider:', defaultProvider);
  console.log('  - providers:', providers);
  console.log('  - isLoading:', isLoading);
  
  // Force reload providers when component mounts
  useEffect(() => {
    console.log('🔍 [AICoach] Component mounted, reloading providers');
    
    // Debug localStorage
    console.log('=== DEBUG LOCALSTORAGE ===');
    const llmProviders = localStorage.getItem('llm_providers');
    console.log('llm_providers dans localStorage:', llmProviders);
    
    if (llmProviders) {
      try {
        const parsed = JSON.parse(llmProviders);
        console.log('Providers parsés:', parsed);
        console.log('Nombre de providers:', parsed.length);
        
        parsed.forEach((provider, index) => {
          console.log(`Provider ${index + 1}:`);
          console.log('  - ID:', provider.id);
          console.log('  - Provider:', provider.provider);
          console.log('  - API Key:', provider.api_key ? `${provider.api_key.substring(0, 10)}...` : 'null');
          console.log('  - Is Default:', provider.is_default);
          console.log('  - Selected Model:', provider.selected_model);
        });
        
        const defaultProvider = parsed.find(p => p.is_default);
        console.log('Default provider trouvé:', defaultProvider ? `${defaultProvider.provider} (${defaultProvider.selected_model})` : 'aucun');
      } catch (error) {
        console.error('Erreur parsing localStorage:', error);
      }
    } else {
      console.log('Aucune donnée llm_providers dans localStorage');
    }
    console.log('=== FIN DEBUG LOCALSTORAGE ===');
    
    reloadProviders();
  }, [reloadProviders]);
  
  const [activeTab, setActiveTab] = useState("assessment");
  const [assessmentData, setAssessmentData] = useState({
    experience: "",
    currentRole: "",
    skills: "",
    goals: "",
    challenges: ""
  });
  
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [goals, setGoals] = useState([
    { id: 1, title: "Améliorer mes compétences en leadership", progress: 65, priority: "high" },
    { id: 2, title: "Obtenir une certification professionnelle", progress: 30, priority: "medium" },
    { id: 3, title: "Développer mon réseau professionnel", progress: 45, priority: "high" }
  ]);

  // Fallback recommendations when LLM is not available
  const fallbackRecommendations = [
    {
      category: "Compétences",
      items: [
        "Suivre une formation en gestion de projet",
        "Développer vos compétences en communication",
        "Apprendre les outils d'analyse de données"
      ]
    },
    {
      category: "Réseau",
      items: [
        "Rejoindre des associations professionnelles",
        "Participer à des événements de networking",
        "Créer du contenu sur LinkedIn"
      ]
    },
    {
      category: "Carrière",
      items: [
        "Définir un plan de carrière à 5 ans",
        "Identifier des mentors dans votre domaine",
        "Préparer votre prochaine évolution"
      ]
    }
  ];

  // LLM-powered profile analysis function
  const analyzeProfile = useCallback(async () => {
    // Debug logs pour hasConfiguredProvider
    console.log('🔍 [AICoach] analyzeProfile called');
    console.log('🔍 [AICoach] hasConfiguredProvider:', hasConfiguredProvider);
    console.log('🔍 [AICoach] defaultProvider:', defaultProvider);
    
    if (!hasConfiguredProvider) {
      console.log('❌ [AICoach] No configured provider, showing error toast');
      toast({
        title: "Configuration requise",
        description: "Pour bénéficier des fonctionnalités de l'outil, configurez une clef API LLM dans paramètres",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ [AICoach] Provider configured, proceeding with analysis');

    if (!assessmentData.currentRole || !assessmentData.skills || !assessmentData.goals) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir au minimum le poste actuel, les compétences et les objectifs",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysisPrompt = `Analyse ce profil professionnel et fournis des recommandations personnalisées :

Expérience: ${assessmentData.experience}
Poste actuel: ${assessmentData.currentRole}
Compétences: ${assessmentData.skills}
Objectifs: ${assessmentData.goals}
Défis: ${assessmentData.challenges}

Fournis une analyse structurée avec :
1. Forces identifiées
2. Axes d'amélioration
3. Suggestions de carrière
4. Lacunes en compétences
5. Prochaines étapes recommandées

Réponds en JSON avec cette structure :
{
  "strengths": ["force1", "force2"],
  "areasForImprovement": ["amélioration1", "amélioration2"],
  "careerSuggestions": ["suggestion1", "suggestion2"],
  "skillGaps": ["lacune1", "lacune2"],
  "nextSteps": ["étape1", "étape2"]
}`;

      const result = await decomposeTaskWithAI({
        taskTitle: "Analyse de profil professionnel",
        taskDescription: analysisPrompt,
        priority: "high"
      });

      if (result.success && result.subtasks.length > 0) {
        // Parse the analysis from the first subtask description
        try {
          const analysisText = result.subtasks[0].description;
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            setProfileAnalysis(analysis);
            await generateAdaptiveRecommendations(analysis);
            setActiveTab("recommendations");
          } else {
            throw new Error("Format de réponse invalide");
          }
        } catch (parseError) {
          console.error("Erreur parsing analyse:", parseError);
          generateFallbackAnalysis();
        }
      } else {
        generateFallbackAnalysis();
      }
    } catch (error) {
      console.error("Erreur analyse profil:", error);
      generateFallbackAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  }, [assessmentData, hasConfiguredProvider, decomposeTaskWithAI, toast]);

  // Generate adaptive recommendations based on profile analysis
  const generateAdaptiveRecommendations = useCallback(async (analysis: ProfileAnalysis) => {
    if (!hasConfiguredProvider) return;

    try {
      const recommendationPrompt = `Basé sur cette analyse de profil, génère des recommandations personnalisées :

Forces: ${analysis.strengths.join(", ")}
Axes d'amélioration: ${analysis.areasForImprovement.join(", ")}
Suggestions carrière: ${analysis.careerSuggestions.join(", ")}
Lacunes compétences: ${analysis.skillGaps.join(", ")}

Crée 4-6 recommandations avec cette structure JSON :
{
  "recommendations": [
    {
      "category": "Compétences",
      "title": "Titre de la recommandation",
      "description": "Description détaillée",
      "priority": "high",
      "timeframe": "3-6 mois",
      "actionItems": ["action1", "action2"]
    }
  ]
}`;

      const result = await decomposeTaskWithAI({
        taskTitle: "Génération de recommandations adaptatives",
        taskDescription: recommendationPrompt,
        priority: "high"
      });

      if (result.success && result.subtasks.length > 0) {
        try {
          const recommendationText = result.subtasks[0].description;
          const jsonMatch = recommendationText.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const recommendations = JSON.parse(jsonMatch[0]);
            setAdaptiveRecommendations(recommendations.recommendations || []);
          }
        } catch (parseError) {
          console.error("Erreur parsing recommandations:", parseError);
        }
      }
    } catch (error) {
      console.error("Erreur génération recommandations:", error);
    }
  }, [hasConfiguredProvider, decomposeTaskWithAI]);

  // Fallback analysis when LLM is not available
  const generateFallbackAnalysis = useCallback(() => {
    const fallbackAnalysis: ProfileAnalysis = {
      strengths: [
        "Expérience dans votre domaine",
        "Motivation pour l'amélioration continue",
        "Conscience de vos objectifs professionnels"
      ],
      areasForImprovement: [
        "Développement de nouvelles compétences",
        "Expansion du réseau professionnel",
        "Amélioration de la visibilité professionnelle"
      ],
      careerSuggestions: [
        "Explorer des opportunités de leadership",
        "Considérer une spécialisation dans votre domaine",
        "Envisager une formation complémentaire"
      ],
      skillGaps: [
        "Compétences numériques avancées",
        "Gestion d'équipe",
        "Communication stratégique"
      ],
      nextSteps: [
        "Définir un plan de développement personnel",
        "Identifier des opportunités de formation",
        "Établir des objectifs SMART"
      ]
    };
    
    setProfileAnalysis(fallbackAnalysis);
    setActiveTab("recommendations");
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Coach Professionnel IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assessment">Évaluation</TabsTrigger>
              <TabsTrigger value="goals">Objectifs</TabsTrigger>
              <TabsTrigger value="recommendations">Conseils</TabsTrigger>
              <TabsTrigger value="progress">Progrès</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Évaluation de Profil Professionnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Années d'expérience</Label>
                      <Select value={assessmentData.experience} onValueChange={(value) => setAssessmentData({...assessmentData, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre expérience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 ans</SelectItem>
                          <SelectItem value="3-5">3-5 ans</SelectItem>
                          <SelectItem value="6-10">6-10 ans</SelectItem>
                          <SelectItem value="10+">10+ ans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Poste actuel</Label>
                      <Input
                        id="currentRole"
                        placeholder="Ex: Développeur Senior"
                        value={assessmentData.currentRole}
                        onChange={(e) => setAssessmentData({...assessmentData, currentRole: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Compétences principales</Label>
                    <Textarea
                      id="skills"
                      placeholder="Listez vos compétences principales..."
                      value={assessmentData.skills}
                      onChange={(e) => setAssessmentData({...assessmentData, skills: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goals">Objectifs professionnels</Label>
                    <Textarea
                      id="goals"
                      placeholder="Décrivez vos objectifs à court et long terme..."
                      value={assessmentData.goals}
                      onChange={(e) => setAssessmentData({...assessmentData, goals: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="challenges">Défis actuels</Label>
                    <Textarea
                      id="challenges"
                      placeholder="Quels sont vos principaux défis professionnels ?"
                      value={assessmentData.challenges}
                      onChange={(e) => setAssessmentData({...assessmentData, challenges: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={analyzeProfile}
                    disabled={isAnalyzing || isLoading}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Analyser mon profil
                      </>
                    )}
                  </Button>
                  
                  {!hasConfiguredProvider && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Configuration LLM requise</p>
                        <p>Pour une analyse personnalisée, configurez une clé API LLM dans les paramètres.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Gestion des Objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Nouvel objectif..." className="flex-1" />
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            <Badge variant={goal.priority === 'high' ? 'destructive' : 'secondary'}>
                              {goal.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progrès</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
              {/* Loading State for Analysis */}
              {isAnalyzing && (
                <Card className="bg-card text-card-foreground border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="text-lg font-medium">Analyse de votre profil en cours...</span>
                    </div>
                    <p className="text-center text-muted-foreground mt-2">
                      Notre IA analyse vos informations pour générer des recommandations personnalisées.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Profile Analysis Results */}
              {profileAnalysis && !isAnalyzing && (
                <Card className="bg-card text-card-foreground border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Analyse de votre profil
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Forces identifiées</h4>
                          <ul className="space-y-1">
                            {profileAnalysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Star className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Axes d'amélioration</h4>
                          <ul className="space-y-1">
                            {profileAnalysis.areasForImprovement.map((area, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <TrendingUp className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Suggestions de carrière</h4>
                          <ul className="space-y-1">
                            {profileAnalysis.careerSuggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Target className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Prochaines étapes</h4>
                          <ul className="space-y-1">
                            {profileAnalysis.nextSteps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Adaptive Recommendations */}
              {adaptiveRecommendations.length > 0 && !isAnalyzing ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                    Recommandations personnalisées
                  </h3>
                  {adaptiveRecommendations.map((recommendation, index) => (
                      <Card key={index} className="bg-card text-card-foreground">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'default' : 'secondary'}>
                                {recommendation.priority === 'high' ? 'Priorité haute' : recommendation.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                              </Badge>
                              <Badge variant="outline">{recommendation.timeframe}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <h4 className="font-medium mb-2">Actions recommandées :</h4>
                            <ul className="space-y-1">
                              {recommendation.actionItems.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : !isAnalyzing && (
                   // Fallback recommendations
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-4">
                       <h3 className="text-lg font-semibold">Recommandations générales</h3>
                       {!hasConfiguredProvider && (
                         <Badge variant="outline" className="text-xs">
                           Mode basique
                         </Badge>
                       )}
                     </div>
                     <div className="grid gap-4">
                       {fallbackRecommendations.map((section, index) => (
                         <Card key={index}>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                               <Star className="h-4 w-4" />
                               Recommandations - {section.category}
                             </CardTitle>
                           </CardHeader>
                           <CardContent>
                             <div className="space-y-2">
                               {section.items.map((item, itemIndex) => (
                                 <div key={itemIndex} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                   <ArrowRight className="h-4 w-4 text-blue-500" />
                                   <span className="text-sm">{item}</span>
                                 </div>
                               ))}
                             </div>
                           </CardContent>
                         </Card>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tableau de Bord des Progrès
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-500">47%</div>
                        <div className="text-sm text-muted-foreground">Progrès global</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-500">3</div>
                        <div className="text-sm text-muted-foreground">Objectifs actifs</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-500">12</div>
                        <div className="text-sm text-muted-foreground">Recommandations</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Activité récente</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Évaluation de profil complétée</span>
                        <span className="text-muted-foreground ml-auto">Il y a 2 jours</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>Nouvel objectif ajouté</span>
                        <span className="text-muted-foreground ml-auto">Il y a 1 semaine</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>Recommandations mises à jour</span>
                        <span className="text-muted-foreground ml-auto">Il y a 1 semaine</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};