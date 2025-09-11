import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DollarSign, MessageSquare, Target, TrendingUp, Calculator, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Star, Award, BookOpen, Users, Clock, ArrowUp, ArrowDown, Equal } from "lucide-react";
import { useState } from "react";

export const NegotiationCoach = () => {
  const [activeTab, setActiveTab] = useState("simulator");
  const [simulationStep, setSimulationStep] = useState(0);
  const [calculatorData, setCalculatorData] = useState({
    currentSalary: "",
    experience: "",
    sector: "",
    location: "",
    education: ""
  });
  const [negotiationData, setNegotiationData] = useState({
    targetSalary: "",
    currentRole: "",
    achievements: "",
    marketResearch: ""
  });

  const simulationScenarios = [
    {
      title: "Négociation d'embauche",
      situation: "L'employeur vous propose un salaire inférieur à vos attentes.",
      tips: ["Mettez en avant votre valeur ajoutée", "Négociez l'ensemble du package", "Restez professionnel et positif"]
    },
    {
      title: "Augmentation annuelle",
      situation: "Vous demandez une augmentation lors de votre évaluation.",
      tips: ["Préparez vos réalisations chiffrées", "Comparez avec le marché", "Proposez un plan de développement"]
    },
    {
      title: "Promotion interne",
      situation: "Vous postulez pour un poste supérieur dans votre entreprise.",
      tips: ["Démontrez votre impact actuel", "Présentez votre vision du nouveau poste", "Négociez les responsabilités"]
    }
  ];

  const marketData = {
    "Développeur Frontend": { min: 35000, max: 65000, avg: 50000 },
    "Développeur Backend": { min: 40000, max: 70000, avg: 55000 },
    "Chef de Projet": { min: 45000, max: 80000, avg: 62500 },
    "Data Scientist": { min: 50000, max: 85000, avg: 67500 },
    "UX Designer": { min: 35000, max: 60000, avg: 47500 }
  };

  const negotiationStrategies = [
    {
      title: "La Préparation",
      icon: BookOpen,
      description: "Recherchez les salaires du marché, préparez vos arguments et définissez vos objectifs.",
      steps: ["Analysez votre valeur", "Recherchez les données de marché", "Préparez vos arguments", "Définissez votre fourchette"]
    },
    {
      title: "L'Approche Collaborative",
      icon: Users,
      description: "Présentez la négociation comme une recherche de solution gagnant-gagnant.",
      steps: ["Écoutez les besoins de l'employeur", "Proposez des solutions créatives", "Mettez en avant les bénéfices mutuels", "Restez flexible"]
    },
    {
      title: "Le Timing Parfait",
      icon: Clock,
      description: "Choisissez le bon moment pour maximiser vos chances de succès.",
      steps: ["Après une réussite majeure", "Lors des évaluations", "Avant les budgets annuels", "Quand l'entreprise performe bien"]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Coach en Négociation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Maîtrisez l'art de la négociation salariale avec des simulations interactives, 
            des calculateurs de marché et des stratégies éprouvées.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="simulator">Simulateur</TabsTrigger>
              <TabsTrigger value="calculator">Calculateur</TabsTrigger>
              <TabsTrigger value="strategies">Stratégies</TabsTrigger>
              <TabsTrigger value="market">Marché</TabsTrigger>
            </TabsList>

            <TabsContent value="simulator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Simulateur de Négociation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {simulationScenarios.map((scenario, index) => (
                      <Card key={index} className={`cursor-pointer transition-colors ${
                        simulationStep === index ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20' : 'hover:bg-muted/50'
                      }`} onClick={() => setSimulationStep(index)}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{scenario.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{scenario.situation}</p>
                          <Badge variant={simulationStep === index ? "default" : "outline"}>
                            Scénario {index + 1}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {simulationStep !== null && (
                    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {simulationScenarios[simulationStep].title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-card p-4 rounded-lg border">
                          <h4 className="font-semibold mb-2">Situation :</h4>
                          <p className="text-sm">{simulationScenarios[simulationStep].situation}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="response">Votre réponse :</Label>
                          <Textarea 
                            id="response"
                            placeholder="Comment réagiriez-vous dans cette situation ?"
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="bg-green-500/10 dark:bg-green-500/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Conseils pour cette situation :
                          </h4>
                          <ul className="space-y-1">
                            {simulationScenarios[simulationStep].tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm flex items-start gap-2">
                                <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => setSimulationStep((prev) => Math.max(0, prev - 1))}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Scénario précédent
                          </Button>
                          <Button onClick={() => setSimulationStep((prev) => Math.min(simulationScenarios.length - 1, prev + 1))}>
                            Scénario suivant
                            <Play className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculateur de Valeur Marché
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentSalary">Salaire actuel (€)</Label>
                      <Input
                        id="currentSalary"
                        type="number"
                        placeholder="45000"
                        value={calculatorData.currentSalary}
                        onChange={(e) => setCalculatorData({...calculatorData, currentSalary: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Années d'expérience</Label>
                      <Select value={calculatorData.experience} onValueChange={(value) => setCalculatorData({...calculatorData, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
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
                      <Label htmlFor="sector">Secteur</Label>
                      <Select value={calculatorData.sector} onValueChange={(value) => setCalculatorData({...calculatorData, sector: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technologie</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="consulting">Conseil</SelectItem>
                          <SelectItem value="healthcare">Santé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Select value={calculatorData.location} onValueChange={(value) => setCalculatorData({...calculatorData, location: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paris">Paris</SelectItem>
                          <SelectItem value="lyon">Lyon</SelectItem>
                          <SelectItem value="marseille">Marseille</SelectItem>
                          <SelectItem value="remote">Télétravail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculer ma valeur marché
                  </Button>

                  {calculatorData.currentSalary && (
                    <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Analyse de votre profil</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <ArrowDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">Minimum</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600">42K€</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Equal className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Médiane</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">55K€</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <ArrowUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Maximum</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">68K€</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Votre position</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {negotiationStrategies.map((strategy, index) => {
                  const IconComponent = strategy.icon;
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          {strategy.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        <div className="space-y-2">
                          {strategy.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">{stepIndex + 1}</Badge>
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Phrases Clés pour Négocier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Phrases d'ouverture</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• "J'aimerais discuter de mon évolution salariale..."</li>
                        <li>• "Mes recherches montrent que le marché..."</li>
                        <li>• "Compte tenu de mes réalisations..."</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700">Phrases de négociation</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• "Pouvons-nous explorer d'autres options ?"</li>
                        <li>• "Que pensez-vous de cette proposition ?"</li>
                        <li>• "Comment pouvons-nous trouver un terrain d'entente ?"</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Données du Marché
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(marketData).map(([role, data]) => (
                      <Card key={role} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold">{role}</h3>
                            <Badge className="bg-blue-100 text-blue-800">
                              Moy. {data.avg.toLocaleString()}€
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Fourchette salariale</span>
                              <span>{data.min.toLocaleString()}€ - {data.max.toLocaleString()}€</span>
                            </div>
                            <Progress 
                              value={((data.avg - data.min) / (data.max - data.min)) * 100} 
                              className="h-2" 
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Min: {data.min.toLocaleString()}€</span>
                              <span>Max: {data.max.toLocaleString()}€</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Facteurs d'Influence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Facteurs positifs</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              Compétences rares/demandées
                            </li>
                            <li className="flex items-center gap-2">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              Certifications reconnues
                            </li>
                            <li className="flex items-center gap-2">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              Expérience internationale
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Facteurs limitants</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <ArrowDown className="h-3 w-3 text-red-500" />
                              Marché saturé
                            </li>
                            <li className="flex items-center gap-2">
                              <ArrowDown className="h-3 w-3 text-red-500" />
                              Localisation géographique
                            </li>
                            <li className="flex items-center gap-2">
                              <ArrowDown className="h-3 w-3 text-red-500" />
                              Secteur en difficulté
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};