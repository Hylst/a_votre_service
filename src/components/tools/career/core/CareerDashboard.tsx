import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Users, Plus, CheckCircle, Clock, AlertCircle, Star, Calendar, Briefcase, Trophy } from "lucide-react";
import { useState } from "react";

export const CareerDashboard = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "Obtenir une certification AWS", progress: 65, deadline: "2024-03-15", priority: "high", status: "in_progress" },
    { id: 2, title: "Améliorer compétences en leadership", progress: 30, deadline: "2024-04-30", priority: "medium", status: "in_progress" },
    { id: 3, title: "Négocier une augmentation", progress: 0, deadline: "2024-02-28", priority: "high", status: "planned" }
  ]);
  
  const [newGoal, setNewGoal] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        id: Date.now(),
        title: newGoal,
        progress: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "medium",
        status: "planned"
      };
      setGoals([...goals, goal]);
      setNewGoal("");
      setShowAddGoal(false);
    }
  };

  const updateGoalProgress = (id: number, progress: number) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { ...goal, progress, status: progress === 100 ? "completed" : "in_progress" }
        : goal
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "planned": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const completedGoals = goals.filter(g => g.status === "completed").length;
  const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
  const averageProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profil Complété</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +5% depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectifs Actifs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals} terminés, {inProgressGoals} en cours
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réseau</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +12 nouveaux contacts ce mois
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression Globale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <Progress value={averageProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne de vos objectifs
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="actions">Actions Rapides</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Gestion des Objectifs
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowAddGoal(!showAddGoal)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel Objectif
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddGoal && (
                <div className="p-4 border rounded-lg space-y-3">
                  <Label>Nouvel objectif</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Obtenir une certification..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    />
                    <Button onClick={addGoal}>Ajouter</Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(goal.status)}
                        <h4 className="font-medium">{goal.title}</h4>
                      </div>
                      <Badge variant={getPriorityColor(goal.priority)}>
                        {goal.priority === "high" ? "Haute" : goal.priority === "medium" ? "Moyenne" : "Basse"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 25))}
                        >
                          +25%
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 100)}
                        >
                          Terminer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recommandations Personnalisées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <p className="text-sm font-medium">Optimisez votre profil LinkedIn</p>
                  <p className="text-xs text-muted-foreground">Votre profil pourrait attirer 40% plus de recruteurs</p>
                </div>
                <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                  <p className="text-sm font-medium">Développez vos compétences en IA</p>
                  <p className="text-xs text-muted-foreground">Tendance forte dans votre secteur (+65%)</p>
                </div>
                <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                  <p className="text-sm font-medium">Élargissez votre réseau</p>
                  <p className="text-xs text-muted-foreground">Connectez-vous avec 5 personnes cette semaine</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  Réalisations Récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">CV optimisé</p>
                    <p className="text-xs text-muted-foreground">Score ATS amélioré de 15%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Nouveau contact LinkedIn</p>
                    <p className="text-xs text-muted-foreground">Réseau élargi dans votre secteur</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Compétence évaluée</p>
                    <p className="text-xs text-muted-foreground">JavaScript - Niveau confirmé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Target className="h-6 w-6" />
                  <span className="text-sm">Évaluer mes compétences</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Contacter un mentor</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Analyser le marché</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Planifier un entretien</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Star className="h-6 w-6" />
                  <span className="text-sm">Optimiser mon CV</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  <span className="text-sm">Suivre mes candidatures</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};