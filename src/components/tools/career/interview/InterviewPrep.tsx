import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Play, BookOpen, BarChart, Mic, MicOff, Clock, CheckCircle, XCircle, Star, Target, Award } from "lucide-react";
import { useState } from "react";

export const InterviewPrep = () => {
  const [activeTab, setActiveTab] = useState("simulator");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [simulationSettings, setSimulationSettings] = useState({
    jobType: "",
    experience: "",
    duration: "30"
  });

  const questionBank = {
    general: [
      "Parlez-moi de vous",
      "Pourquoi voulez-vous travailler chez nous ?",
      "Quelles sont vos forces et faiblesses ?",
      "Où vous voyez-vous dans 5 ans ?",
      "Pourquoi quittez-vous votre poste actuel ?"
    ],
    technical: [
      "Expliquez votre approche pour résoudre un problème complexe",
      "Comment gérez-vous les délais serrés ?",
      "Décrivez un projet dont vous êtes fier",
      "Comment restez-vous à jour avec les nouvelles technologies ?",
      "Quelle est votre méthode de travail en équipe ?"
    ],
    behavioral: [
      "Décrivez une situation où vous avez dû gérer un conflit",
      "Parlez d'un échec et de ce que vous en avez appris",
      "Comment gérez-vous le stress et la pression ?",
      "Donnez un exemple de leadership que vous avez montré",
      "Décrivez une situation où vous avez pris une initiative"
    ]
  };

  const mockInterviewQuestions = [
    "Présentez-vous en 2 minutes",
    "Pourquoi ce poste vous intéresse-t-il ?",
    "Décrivez votre plus grande réussite professionnelle",
    "Comment gérez-vous les critiques ?",
    "Avez-vous des questions à nous poser ?"
  ];

  const performanceMetrics = [
    { category: "Communication", score: 85, feedback: "Excellente articulation" },
    { category: "Confiance", score: 78, feedback: "Bonne assurance, peut être renforcée" },
    { category: "Pertinence", score: 92, feedback: "Réponses très adaptées" },
    { category: "Structure", score: 88, feedback: "Bien organisé avec STAR" }
  ];

  const starMethod = {
    S: "Situation - Décrivez le contexte",
    T: "Tâche - Expliquez votre responsabilité",
    A: "Action - Détaillez ce que vous avez fait",
    R: "Résultat - Présentez les outcomes"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Préparateur d'Entretiens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="simulator">Simulateur</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="star">Méthode STAR</TabsTrigger>
            </TabsList>

            <TabsContent value="simulator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Simulateur d'Entretien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type de poste</Label>
                      <Select value={simulationSettings.jobType} onValueChange={(value) => setSimulationSettings({...simulationSettings, jobType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer">Développeur</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="designer">Designer</SelectItem>
                          <SelectItem value="sales">Commercial</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Niveau d'expérience</Label>
                      <Select value={simulationSettings.experience} onValueChange={(value) => setSimulationSettings({...simulationSettings, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior (0-3 ans)</SelectItem>
                          <SelectItem value="senior">Senior (3-8 ans)</SelectItem>
                          <SelectItem value="expert">Expert (8+ ans)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Durée (minutes)</Label>
                      <Select value={simulationSettings.duration} onValueChange={(value) => setSimulationSettings({...simulationSettings, duration: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Card className="bg-muted/50">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span className="text-lg font-medium">Question {currentQuestion + 1}/5</span>
                        </div>
                        <div className="text-xl font-semibold p-4 bg-background rounded-lg">
                          {mockInterviewQuestions[currentQuestion]}
                        </div>
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant={isRecording ? "destructive" : "default"}
                            onClick={() => setIsRecording(!isRecording)}
                            className="flex items-center gap-2"
                          >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            {isRecording ? "Arrêter" : "Commencer"} l'enregistrement
                          </Button>
                          {currentQuestion < mockInterviewQuestions.length - 1 && (
                            <Button
                              variant="outline"
                              onClick={() => setCurrentQuestion(currentQuestion + 1)}
                            >
                              Question suivante
                            </Button>
                          )}
                        </div>
                        {isRecording && (
                          <div className="flex items-center justify-center gap-2 text-red-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm">Enregistrement en cours...</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    <Label>Notes personnelles</Label>
                    <Textarea placeholder="Notez vos réflexions, points à améliorer..." rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Questions Générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {questionBank.general.map((question, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                        {question}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Questions Techniques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {questionBank.technical.map((question, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                        {question}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      Questions Comportementales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {questionBank.behavioral.map((question, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                        {question}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conseils pour bien répondre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        À faire
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Préparer des exemples concrets</li>
                        <li>• Utiliser la méthode STAR</li>
                        <li>• Rester positif et authentique</li>
                        <li>• Poser des questions pertinentes</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        À éviter
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Critiquer l'ancien employeur</li>
                        <li>• Réponses trop vagues</li>
                        <li>• Manquer de préparation</li>
                        <li>• Paraître désintéressé</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Analyse de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Scores par Catégorie</h4>
                      {performanceMetrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{metric.category}</span>
                            <span className="text-sm font-bold">{metric.score}%</span>
                          </div>
                          <Progress value={metric.score} className="h-2" />
                          <p className="text-xs text-muted-foreground">{metric.feedback}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Statistiques Globales</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-500">86%</div>
                            <div className="text-sm text-muted-foreground">Score Moyen</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-500">12</div>
                            <div className="text-sm text-muted-foreground">Simulations</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-500">4.2</div>
                            <div className="text-sm text-muted-foreground">Temps Moyen</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-500">+15%</div>
                            <div className="text-sm text-muted-foreground">Progression</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Recommandations d'Amélioration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge variant="outline">Priorité Haute</Badge>
                        <p className="text-sm">Travaillez votre confiance en vous : pratiquez devant un miroir et enregistrez-vous.</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary">Priorité Moyenne</Badge>
                        <p className="text-sm">Enrichissez vos exemples : préparez 3-4 histoires détaillées utilisant STAR.</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary">Priorité Basse</Badge>
                        <p className="text-sm">Améliorez votre langage corporel : maintenez le contact visuel et adoptez une posture ouverte.</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="star" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Méthode STAR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    La méthode STAR vous aide à structurer vos réponses aux questions comportementales de manière claire et convaincante.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(starMethod).map(([letter, description], index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {letter}
                            </div>
                            <h4 className="font-semibold">{description.split(' - ')[0]}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{description.split(' - ')[1]}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Exemple Pratique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h5 className="font-medium">Question : "Décrivez une situation où vous avez dû gérer un conflit"</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                          <strong>Situation :</strong> Dans mon équipe de développement, deux collègues étaient en désaccord sur l'architecture technique d'un projet critique.
                        </div>
                        <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                          <strong>Tâche :</strong> En tant que lead technique, je devais résoudre ce conflit rapidement pour respecter nos délais.
                        </div>
                        <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
                          <strong>Action :</strong> J'ai organisé une réunion avec les deux parties, écouté leurs arguments, et proposé une solution hybride qui combinait les meilleures idées de chacun.
                        </div>
                        <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                          <strong>Résultat :</strong> Le projet a été livré à temps, l'équipe était satisfaite de la solution, et nous avons établi un processus pour éviter de futurs conflits techniques.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Exercice Pratique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Choisissez une question pour vous entraîner</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une question" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leadership">Exemple de leadership</SelectItem>
                            <SelectItem value="challenge">Défi surmonté</SelectItem>
                            <SelectItem value="teamwork">Travail en équipe</SelectItem>
                            <SelectItem value="innovation">Initiative prise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Situation</Label>
                          <Textarea placeholder="Décrivez le contexte..." rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Tâche</Label>
                          <Textarea placeholder="Quelle était votre responsabilité ?" rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Action</Label>
                          <Textarea placeholder="Qu'avez-vous fait concrètement ?" rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label>Résultat</Label>
                          <Textarea placeholder="Quels ont été les outcomes ?" rows={3} />
                        </div>
                      </div>
                      <Button className="w-full">
                        Analyser ma réponse STAR
                      </Button>
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