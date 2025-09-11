import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Award, BookOpen, CheckCircle, XCircle, Star, Target, Clock, Users, Code, Database, Globe, Smartphone, Palette, BarChart3, Lightbulb, Shield } from "lucide-react";
import { useState } from "react";

export const SkillsAssessment = () => {
  const [activeTab, setActiveTab] = useState("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});

  // Sample quiz questions
  const quizQuestions = [
    {
      id: 1,
      skill: "JavaScript",
      question: "Quelle est la différence entre 'let' et 'var' en JavaScript?",
      options: [
        "Aucune différence",
        "'let' a une portée de bloc, 'var' a une portée de fonction",
        "'var' est plus récent que 'let'",
        "'let' ne peut pas être redéclaré"
      ],
      correct: 1
    },
    {
      id: 2,
      skill: "React",
      question: "Qu'est-ce qu'un Hook en React?",
      options: [
        "Une fonction qui permet d'utiliser l'état dans les composants fonctionnels",
        "Un composant de classe",
        "Une méthode de cycle de vie",
        "Un gestionnaire d'événements"
      ],
      correct: 0
    }
  ];

  // Sample skill categories
  const skillCategories = [
    {
      name: "Développement Frontend",
      icon: Code,
      skills: ["JavaScript", "React", "Vue.js", "Angular", "TypeScript", "CSS", "HTML"]
    },
    {
      name: "Développement Backend",
      icon: Database,
      skills: ["Node.js", "Python", "Java", "C#", "PHP", "Ruby", "Go"]
    },
    {
      name: "Base de Données",
      icon: Database,
      skills: ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch"]
    },
    {
      name: "Cloud & DevOps",
      icon: Globe,
      skills: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform"]
    },
    {
      name: "Mobile",
      icon: Smartphone,
      skills: ["React Native", "Flutter", "iOS", "Android", "Xamarin"]
    },
    {
      name: "Design",
      icon: Palette,
      skills: ["UI/UX", "Figma", "Adobe XD", "Photoshop", "Illustrator"]
    }
  ];

  // Sample learning resources
  const learningResources = [
    {
      skill: "JavaScript",
      resources: [
        { name: "MDN Web Docs", type: "Documentation", url: "#", rating: 5 },
        { name: "JavaScript.info", type: "Tutorial", url: "#", rating: 5 },
        { name: "Eloquent JavaScript", type: "Livre", url: "#", rating: 4 }
      ]
    },
    {
      skill: "React",
      resources: [
        { name: "React Documentation", type: "Documentation", url: "#", rating: 5 },
        { name: "React Course - Scrimba", type: "Cours", url: "#", rating: 4 },
        { name: "React Patterns", type: "Guide", url: "#", rating: 4 }
      ]
    }
  ];

  const handleQuizAnswer = (questionId: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateSkillScore = (skill: string) => {
    // Simple scoring logic based on quiz answers
    const relatedQuestions = quizQuestions.filter(q => q.skill === skill);
    if (relatedQuestions.length === 0) return 0;
    
    const correctAnswers = relatedQuestions.filter(q => 
      quizAnswers[q.id] === q.options[q.correct]
    ).length;
    
    return Math.round((correctAnswers / relatedQuestions.length) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Évaluation des Compétences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="mapping">Cartographie</TabsTrigger>
              <TabsTrigger value="analysis">Analyse</TabsTrigger>
              <TabsTrigger value="learning">Formation</TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quiz d'Évaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skill-select">Choisir une compétence à évaluer</Label>
                      <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une compétence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                          <SelectItem value="React">React</SelectItem>
                          <SelectItem value="Node.js">Node.js</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSkill && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Question {currentQuestion + 1} sur {quizQuestions.length}</h3>
                          <Progress value={(currentQuestion + 1) / quizQuestions.length * 100} className="w-32" />
                        </div>

                        {quizQuestions[currentQuestion] && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3">{quizQuestions[currentQuestion].question}</h4>
                              <div className="space-y-2">
                                {quizQuestions[currentQuestion].options.map((option, index) => (
                                  <Button
                                    key={index}
                                    variant={quizAnswers[quizQuestions[currentQuestion].id] === option ? "default" : "outline"}
                                    className="w-full justify-start"
                                    onClick={() => handleQuizAnswer(quizQuestions[currentQuestion].id, option)}
                                  >
                                    {option}
                                  </Button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                          >
                            Précédent
                          </Button>
                          <Button 
                            onClick={() => setCurrentQuestion(Math.min(quizQuestions.length - 1, currentQuestion + 1))}
                            disabled={currentQuestion === quizQuestions.length - 1}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cartographie des Compétences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillCategories.map((category, index) => {
                      const IconComponent = category.icon;
                      return (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <IconComponent className="h-4 w-4 text-blue-500" />
                              <h3 className="font-semibold">{category.name}</h3>
                            </div>
                            <div className="space-y-2">
                              {category.skills.map((skill, skillIndex) => {
                                const score = calculateSkillScore(skill) || Math.floor(Math.random() * 100);
                                return (
                                  <div key={skillIndex} className="flex items-center justify-between">
                                    <span className="text-sm">{skill}</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={score} className="w-16 h-2" />
                                      <span className="text-xs text-muted-foreground w-8">{score}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analyse des Compétences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-lg">12</h3>
                        <p className="text-sm text-muted-foreground">Compétences Maîtrisées</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h3 className="font-semibold text-lg">8</h3>
                        <p className="text-sm text-muted-foreground">En Développement</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-lg">5</h3>
                        <p className="text-sm text-muted-foreground">Objectifs Fixés</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommandations Prioritaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">Approfondir TypeScript</h4>
                            <p className="text-sm text-muted-foreground">Compétence très demandée dans votre secteur</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                          <Shield className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-medium">Sécurité Web</h4>
                            <p className="text-sm text-muted-foreground">Lacune identifiée par rapport aux exigences du marché</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                          <Users className="h-5 w-5 text-purple-500" />
                          <div>
                            <h4 className="font-medium">Leadership Technique</h4>
                            <p className="text-sm text-muted-foreground">Compétence clé pour votre évolution de carrière</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Ressources de Formation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="learning-skill">Choisir une compétence</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une compétence à développer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="nodejs">Node.js</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {learningResources.map((resource, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{resource.skill}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {resource.resources.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                    <p className="text-xs text-muted-foreground">{item.type}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, starIndex) => (
                                        <Star 
                                          key={starIndex} 
                                          className={`h-3 w-3 ${
                                            starIndex < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                          }`} 
                                        />
                                      ))}
                                    </div>
                                    <Button size="sm" variant="outline">Voir</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Certifications Recommandées
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Award className="h-6 w-6 text-blue-500" />
                            <div>
                              <h4 className="font-medium">AWS Certified Developer</h4>
                              <p className="text-sm text-muted-foreground">Niveau: Associé</p>
                              <Badge variant="outline" className="mt-1">Recommandé</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Award className="h-6 w-6 text-green-500" />
                            <div>
                              <h4 className="font-medium">React Developer Certification</h4>
                              <p className="text-sm text-muted-foreground">Niveau: Professionnel</p>
                              <Badge variant="outline" className="mt-1">Priorité</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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