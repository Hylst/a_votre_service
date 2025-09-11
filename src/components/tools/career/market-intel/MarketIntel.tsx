import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, MapPin, Briefcase, BarChart3, Search, Building, Users } from "lucide-react";
import { useState } from "react";

export const MarketIntel = () => {
  const [activeTab, setActiveTab] = useState("salary");
  const [searchCriteria, setSearchCriteria] = useState({
    jobTitle: "",
    location: "",
    experience: "",
    industry: ""
  });

  const salaryData = [
    { role: "Développeur Full Stack", junior: "35-45k€", senior: "55-75k€", expert: "75-95k€", location: "Paris" },
    { role: "Data Scientist", junior: "40-50k€", senior: "60-80k€", expert: "80-110k€", location: "Lyon" },
    { role: "Product Manager", junior: "45-55k€", senior: "65-85k€", expert: "85-120k€", location: "Toulouse" },
    { role: "UX Designer", junior: "35-45k€", senior: "50-70k€", expert: "70-90k€", location: "Nantes" }
  ];

  const industryTrends = [
    { sector: "Intelligence Artificielle", growth: 85, demand: "Très forte", jobs: "12,500+" },
    { sector: "Cybersécurité", growth: 72, demand: "Forte", jobs: "8,200+" },
    { sector: "Cloud Computing", growth: 68, demand: "Forte", jobs: "15,800+" },
    { sector: "E-commerce", growth: 45, demand: "Modérée", jobs: "22,100+" },
    { sector: "Fintech", growth: 58, demand: "Forte", jobs: "6,700+" }
  ];

  const marketInsights = [
    { metric: "Taux de croissance IT", value: "12.5%", trend: "up" },
    { metric: "Postes vacants", value: "45,200", trend: "up" },
    { metric: "Salaire médian", value: "52,000€", trend: "up" },
    { metric: "Télétravail", value: "78%", trend: "stable" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Intelligence du Marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="salary">Salaires</TabsTrigger>
              <TabsTrigger value="trends">Tendances</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="search">Recherche</TabsTrigger>
            </TabsList>

            <TabsContent value="salary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Comparateur de Salaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Poste recherché</Label>
                      <Input 
                        placeholder="Ex: Développeur React"
                        value={searchCriteria.jobTitle}
                        onChange={(e) => setSearchCriteria({...searchCriteria, jobTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Localisation</Label>
                      <Select value={searchCriteria.location} onValueChange={(value) => setSearchCriteria({...searchCriteria, location: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une ville" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paris">Paris</SelectItem>
                          <SelectItem value="lyon">Lyon</SelectItem>
                          <SelectItem value="toulouse">Toulouse</SelectItem>
                          <SelectItem value="nantes">Nantes</SelectItem>
                          <SelectItem value="bordeaux">Bordeaux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expérience</Label>
                      <Select value={searchCriteria.experience} onValueChange={(value) => setSearchCriteria({...searchCriteria, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau d'expérience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior (0-3 ans)</SelectItem>
                          <SelectItem value="senior">Senior (3-8 ans)</SelectItem>
                          <SelectItem value="expert">Expert (8+ ans)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Comparer les salaires
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Données du marché</h4>
                    {salaryData.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{item.role}</h5>
                            <Badge variant="outline">{item.location}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Junior: </span>
                              <span className="font-medium">{item.junior}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Senior: </span>
                              <span className="font-medium">{item.senior}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expert: </span>
                              <span className="font-medium">{item.expert}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tendances Sectorielles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {industryTrends.map((trend, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{trend.sector}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={trend.demand === 'Très forte' ? 'destructive' : trend.demand === 'Forte' ? 'default' : 'secondary'}>
                              {trend.demand}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{trend.jobs} postes</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Croissance</span>
                            <span className="font-medium">{trend.growth}%</span>
                          </div>
                          <Progress value={trend.growth} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketInsights.map((insight, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-500 mb-1">{insight.value}</div>
                      <div className="text-sm text-muted-foreground mb-2">{insight.metric}</div>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className={`h-3 w-3 ${
                          insight.trend === 'up' ? 'text-green-500' : 
                          insight.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`} />
                        <span className="text-xs capitalize">{insight.trend === 'up' ? 'En hausse' : insight.trend === 'down' ? 'En baisse' : 'Stable'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Analyse Géographique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Top Régions - Opportunités IT</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Île-de-France</span>
                          <Badge>35,200 postes</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Auvergne-Rhône-Alpes</span>
                          <Badge>12,800 postes</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Occitanie</span>
                          <Badge>8,500 postes</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Nouvelle-Aquitaine</span>
                          <Badge>6,200 postes</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Salaires Moyens par Région</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Paris</span>
                          <span className="font-medium">58,000€</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Lyon</span>
                          <span className="font-medium">48,000€</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Toulouse</span>
                          <span className="font-medium">45,000€</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">Nantes</span>
                          <span className="font-medium">42,000€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Recherche d'Opportunités
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Secteur d'activité</Label>
                      <Select value={searchCriteria.industry} onValueChange={(value) => setSearchCriteria({...searchCriteria, industry: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technologies</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Santé</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="retail">Commerce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de contrat</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de contrat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cdi">CDI</SelectItem>
                          <SelectItem value="cdd">CDD</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="stage">Stage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Lancer la recherche
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Opportunités recommandées</h4>
                    <div className="space-y-2">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">Développeur React Senior</h5>
                            <Badge>CDI</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">TechCorp • Paris • 55-70k€</div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">25 candidats</span>
                            <MapPin className="h-3 w-3 ml-2" />
                            <span className="text-xs">Télétravail possible</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">Product Manager</h5>
                            <Badge>CDI</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">StartupXYZ • Lyon • 60-75k€</div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">12 candidats</span>
                            <MapPin className="h-3 w-3 ml-2" />
                            <span className="text-xs">Hybride</span>
                          </div>
                        </CardContent>
                      </Card>
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