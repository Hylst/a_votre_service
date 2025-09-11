import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Upload, Zap, Star, BookOpen, Target, Award, Loader2, Sparkles } from 'lucide-react';
import { useDocumentLLM } from './hooks/useDocumentLLM';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, User, Briefcase, GraduationCap, MapPin, Phone, Mail, Globe, CheckCircle, XCircle, AlertCircle, Save, Copy } from "lucide-react";
import { toast } from 'sonner';

export const DocumentStudio = () => {
  const {
    optimizeCV,
    generateCoverLetter,
    analyzeATS,
    isOptimizing,
    isGenerating,
    hasConfiguredProvider,
    isLoading: llmLoading
  } = useDocumentLLM();

  const [activeTab, setActiveTab] = useState("cv-builder");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [cvData, setCvData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: ""
    },
    experience: [{
      company: "",
      position: "",
      duration: "",
      description: ""
    }],
    education: [{
      institution: "",
      degree: "",
      year: "",
      details: ""
    }],
    skills: [],
    languages: [],
    certifications: []
  });

  const [optimizedCV, setOptimizedCV] = useState('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsRecommendations, setAtsRecommendations] = useState<string[]>([]);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const templates = [
    { id: "modern", name: "Moderne", category: "Créatif", preview: "Template moderne avec design épuré" },
    { id: "classic", name: "Classique", category: "Traditionnel", preview: "Template traditionnel pour secteurs conservateurs" },
    { id: "tech", name: "Tech", category: "Technologie", preview: "Optimisé pour les métiers techniques" },
    { id: "executive", name: "Exécutif", category: "Management", preview: "Pour postes de direction et management" },
    { id: "creative", name: "Créatif", category: "Design", preview: "Pour métiers créatifs et artistiques" },
    { id: "academic", name: "Académique", category: "Recherche", preview: "Pour postes académiques et recherche" }
  ];

  // LLM-powered functions
  const handleOptimizeCV = async () => {
    const result = await optimizeCV(cvData, jobDescription);
    if (result.success) {
      setOptimizedCV(result.content || '');
      setAtsScore(result.score || null);
      setAtsRecommendations(result.recommendations || []);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobTitle || !companyName) {
      return;
    }
    
    const result = await generateCoverLetter({
      jobTitle,
      companyName,
      jobDescription,
      cvData,
      tone: 'professional'
    });
    
    if (result.success) {
      setGeneratedCoverLetter(result.content || '');
    }
  };

  const handleAnalyzeATS = async () => {
    const cvContent = optimizedCV || generateBasicCVText();
    const result = await analyzeATS({
      cvContent,
      jobDescription
    });
    
    if (result.success) {
      setAtsScore(result.score || null);
      setAtsRecommendations(result.recommendations || []);
    }
  };

  const generateBasicCVText = (): string => {
    return `${cvData.personalInfo.name}\n${cvData.personalInfo.email}\n\nExpérience:\n${cvData.experience.map(exp => `${exp.position} chez ${exp.company} (${exp.duration})\n${exp.description}`).join('\n\n')}\n\nFormation:\n${cvData.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.year})`).join('\n')}\n\nCompétences:\n${cvData.skills.join(', ')}`;
  };

  // Export functions
  const exportToPDF = (content: string, filename: string) => {
    // Create a simple HTML structure for PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1, h2, h3 { color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .contact-info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToWord = (content: string, filename: string) => {
    // Create a simple Word-compatible document
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${filename}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          h1, h2, h3 { color: #000; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20pt; }
        </style>
      </head>
      <body>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([wordContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCV = (format: 'pdf' | 'word') => {
    const cvContent = optimizedCV || generateBasicCVText();
    const filename = `CV_${cvData.personalInfo.name || 'Document'}`;
    
    if (format === 'pdf') {
      exportToPDF(cvContent, filename);
    } else {
      exportToWord(cvContent, filename);
    }
  };

  const handleExportCoverLetter = (format: 'pdf' | 'word') => {
    if (!generatedCoverLetter) {
      toast.error('Aucune lettre de motivation à exporter');
      return;
    }
    
    const filename = `Lettre_Motivation_${jobTitle || 'Poste'}_${companyName || 'Entreprise'}`;
    
    if (format === 'pdf') {
      exportToPDF(generatedCoverLetter, filename);
    } else {
      exportToWord(generatedCoverLetter, filename);
    }
  };

  const atsOptimizationTips = [
    { category: "Mots-clés", score: 85, status: "good", tip: "Utilisez les mots-clés de l'offre d'emploi" },
    { category: "Format", score: 92, status: "excellent", tip: "Format compatible ATS détecté" },
    { category: "Structure", score: 78, status: "warning", tip: "Améliorez la hiérarchie des sections" },
    { category: "Lisibilité", score: 88, status: "good", tip: "Police et taille appropriées" }
  ];

  const coverLetterTemplates = [
    { id: "standard", name: "Standard", description: "Lettre classique adaptée à tous secteurs" },
    { id: "creative", name: "Créative", description: "Pour métiers créatifs et startups" },
    { id: "executive", name: "Exécutive", description: "Pour postes de direction" },
    { id: "tech", name: "Technique", description: "Spécialisée pour l'IT et l'ingénierie" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "good": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Studio de Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cv-builder">CV Builder</TabsTrigger>
              <TabsTrigger value="cover-letter">Lettre de Motivation</TabsTrigger>
              <TabsTrigger value="ats-optimizer">Optimiseur ATS</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="cv-builder" className="space-y-4">
              {/* LLM Status Alert */}
              {!hasConfiguredProvider && (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Pour bénéficier des fonctionnalités d'optimisation IA, configurez une clef API LLM dans les paramètres.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* Job Context for Optimization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Contexte du poste (optionnel)
                      </CardTitle>
                      <CardDescription>
                        Ajoutez des informations sur le poste pour une optimisation personnalisée
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titre du poste</Label>
                          <Input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Développeur Full Stack"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Entreprise</Label>
                          <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="TechCorp"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description du poste</Label>
                        <Textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Collez ici la description du poste pour une optimisation ciblée..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informations Personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom complet</Label>
                          <Input 
                            placeholder="Jean Dupont"
                            value={cvData.personalInfo.name}
                            onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, name: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            type="email"
                            placeholder="jean.dupont@email.com"
                            value={cvData.personalInfo.email}
                            onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, email: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input 
                            placeholder="+33 6 12 34 56 78"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, phone: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Localisation</Label>
                          <Input 
                            placeholder="Paris, France"
                            value={cvData.personalInfo.location}
                            onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, location: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Site web / Portfolio</Label>
                          <Input 
                            placeholder="https://monportfolio.com"
                            value={cvData.personalInfo.website}
                            onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, website: e.target.value}})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Résumé professionnel</Label>
                        <Textarea 
                          placeholder="Décrivez votre profil en quelques lignes..."
                          rows={4}
                          value={cvData.personalInfo.summary}
                          onChange={(e) => setCvData({...cvData, personalInfo: {...cvData.personalInfo, summary: e.target.value}})}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Expérience Professionnelle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Poste</Label>
                              <Input placeholder="Développeur Full Stack" />
                            </div>
                            <div className="space-y-2">
                              <Label>Entreprise</Label>
                              <Input placeholder="Tech Corp" />
                            </div>
                            <div className="space-y-2">
                              <Label>Période</Label>
                              <Input placeholder="Jan 2022 - Présent" />
                            </div>
                            <div className="space-y-2">
                              <Label>Lieu</Label>
                              <Input placeholder="Paris, France" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Décrivez vos responsabilités et réalisations..." rows={3} />
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        + Ajouter une expérience
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Formation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Diplôme</Label>
                            <Input placeholder="Master en Informatique" />
                          </div>
                          <div className="space-y-2">
                            <Label>École/Université</Label>
                            <Input placeholder="Université de Paris" />
                          </div>
                          <div className="space-y-2">
                            <Label>Année</Label>
                            <Input placeholder="2020" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mention</Label>
                            <Input placeholder="Très Bien" />
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        + Ajouter une formation
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Aperçu CV
                        <Button
                          onClick={handleOptimizeCV}
                          disabled={isOptimizing || !cvData.personalInfo.name}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {isOptimizing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {isOptimizing ? 'Optimisation...' : 'Optimiser avec IA'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Optimization Progress */}
                      {isOptimizing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Optimisation en cours...</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="w-full" />
                        </div>
                      )}

                      {/* CV Preview */}
                      <div className="bg-background border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                        {optimizedCV ? (
                          <div className="space-y-4 text-sm">
                            <div className="border-b pb-2">
                              <h3 className="font-bold text-lg">{cvData.personalInfo.name}</h3>
                              <p className="text-muted-foreground">{cvData.personalInfo.email} | {cvData.personalInfo.phone}</p>
                              <p className="text-muted-foreground">{cvData.personalInfo.address}</p>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2">Résumé Professionnel</h4>
                                <p className="text-muted-foreground">{cvData.personalInfo.summary || 'Résumé optimisé par IA...'}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Expérience Professionnelle</h4>
                                {cvData.experience.map((exp, index) => (
                                  <div key={index} className="mb-3">
                                    <div className="font-medium">{exp.position} - {exp.company}</div>
                                    <div className="text-sm text-muted-foreground">{exp.duration}</div>
                                    <div className="text-sm mt-1">{exp.description}</div>
                                  </div>
                                ))}
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Compétences</h4>
                                <div className="flex flex-wrap gap-2">
                                  {cvData.skills.map((skill, index) => (
                                    <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            {cvData.personalInfo.name ? (
                              <div className="space-y-2">
                                <FileText className="h-12 w-12 mx-auto opacity-50" />
                                <p>Cliquez sur "Optimiser avec IA" pour générer un CV optimisé</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <User className="h-12 w-12 mx-auto opacity-50" />
                                <p>Remplissez vos informations personnelles pour commencer</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Export Options */}
                      {optimizedCV && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleExportCV('pdf')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleExportCV('word')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Word
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Compétences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Ajouter une compétence</Label>
                        <div className="flex gap-2">
                          <Input placeholder="JavaScript" className="flex-1" />
                          <Button size="sm">Ajouter</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                        <Badge variant="secondary">Python</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cover-letter" className="space-y-4">
              {/* LLM Status Alert */}
              {!hasConfiguredProvider && (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Pour bénéficier des fonctionnalités de génération IA, configurez une clef API LLM dans les paramètres.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Générateur de Lettre de Motivation
                      </CardTitle>
                      <CardDescription>
                        Générez une lettre personnalisée avec l'IA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un template" />
                          </SelectTrigger>
                          <SelectContent>
                            {coverLetterTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} - {template.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Entreprise cible *</Label>
                          <Input 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Nom de l'entreprise" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Poste visé *</Label>
                          <Input 
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Intitulé du poste" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Offre d'emploi (optionnel)</Label>
                        <Textarea 
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Collez l'offre d'emploi pour une personnalisation automatique..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Points clés à mettre en avant</Label>
                        <Textarea 
                          placeholder="Listez vos expériences et compétences pertinentes..."
                          rows={3}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleGenerateCoverLetter}
                        disabled={isGenerating || !companyName || !jobTitle}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Générer la lettre avec IA
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Aperçu de la Lettre
                        {generatedCoverLetter && (
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copier
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Generation Progress */}
                      {isGenerating && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Génération en cours...</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="w-full" />
                        </div>
                      )}

                      <div className="bg-muted/50 p-4 rounded-lg min-h-[500px]">
                        {generatedCoverLetter ? (
                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="font-medium">{cvData.personalInfo.name || 'Votre Nom'}</p>
                              <p className="text-muted-foreground">{cvData.personalInfo.address || 'Votre Adresse'}</p>
                              <p className="text-muted-foreground">{cvData.personalInfo.email || 'votre.email@exemple.com'}</p>
                              <p className="text-muted-foreground">{cvData.personalInfo.phone || 'Votre Téléphone'}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-muted-foreground">Paris, le {new Date().toLocaleDateString('fr-FR')}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium">{companyName}</p>
                              <p className="text-muted-foreground">Service Ressources Humaines</p>
                            </div>
                            
                            <div className="font-medium">
                              Objet : Candidature pour le poste de {jobTitle}
                            </div>
                            
                            <div className="whitespace-pre-line">
                              {generatedCoverLetter}
                            </div>
                            
                            <div className="text-right">
                              <p>Cordialement,</p>
                              <p className="font-medium mt-2">{cvData.personalInfo.name || 'Votre Nom'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            {companyName && jobTitle ? (
                              <div className="space-y-2">
                                <FileText className="h-12 w-12 mx-auto opacity-50" />
                                <p>Cliquez sur "Générer la lettre" pour créer votre lettre de motivation</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="h-12 w-12 mx-auto opacity-50" />
                                <p>Remplissez l'entreprise et le poste pour commencer</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {generatedCoverLetter && (
                          <div className="space-y-2 mt-4">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedCoverLetter);
                                toast.success('Lettre copiée dans le presse-papiers!');
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copier le texte
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleExportCoverLetter('pdf')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleExportCoverLetter('word')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Word
                              </Button>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ats-optimizer" className="space-y-4">
              {/* LLM Status Alert */}
              {!hasConfiguredProvider && (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Pour bénéficier des fonctionnalités d'analyse IA avancée, configurez une clef API LLM dans les paramètres.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Analyser votre CV
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm font-medium mb-2">Glissez votre CV ici ou cliquez pour sélectionner</p>
                        <p className="text-xs text-muted-foreground mb-4">Formats acceptés: PDF, DOC, DOCX</p>
                        <Button variant="outline">
                          Choisir un fichier
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Offre d'emploi cible (optionnel)</Label>
                        <Textarea 
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Collez l'offre d'emploi pour une analyse personnalisée..."
                          rows={4}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleAnalyzeATS}
                        disabled={!jobDescription}
                        className="w-full"
                      >
                        {hasConfiguredProvider ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyser avec IA
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Analyser le CV
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Score ATS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-500 mb-2">{atsScore || 86}%</div>
                        <p className="text-sm text-muted-foreground">Score de compatibilité ATS</p>
                      </div>
                      
                      <div className="space-y-3">
                        {atsOptimizationTips.map((tip, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(tip.status)}
                              <div>
                                <p className="font-medium text-sm">{tip.category}</p>
                                <p className="text-xs text-muted-foreground">{tip.tip}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">{tip.score}%</div>
                              <Progress value={tip.score} className="w-16 h-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {atsRecommendations.length > 0 ? (
                        atsRecommendations.map((rec, index) => (
                          <div key={index} className="space-y-2">
                            <Badge variant={index === 0 ? "destructive" : index === 1 ? "secondary" : "outline"}>
                              {index === 0 ? "Priorité Haute" : index === 1 ? "Priorité Moyenne" : "Priorité Basse"}
                            </Badge>
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Badge variant="destructive">Priorité Haute</Badge>
                            <p className="text-sm">Ajoutez plus de mots-clés techniques de l'offre d'emploi dans votre section compétences.</p>
                          </div>
                          <div className="space-y-2">
                            <Badge variant="secondary">Priorité Moyenne</Badge>
                            <p className="text-sm">Utilisez des puces simples plutôt que des symboles spéciaux pour améliorer la lisibilité ATS.</p>
                          </div>
                          <div className="space-y-2">
                            <Badge variant="outline">Priorité Basse</Badge>
                            <p className="text-sm">Considérez l'ajout d'une section "Réalisations" avec des métriques quantifiées.</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Bibliothèque de Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card key={template.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedTemplate(template.id)}>
                        <CardContent className="p-4">
                          <div className="aspect-[3/4] bg-muted/50 rounded-lg mb-3 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">{template.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{template.preview}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="h-3 w-3 mr-1" />
                                Aperçu
                              </Button>
                              <Button size="sm" className="flex-1">
                                Utiliser
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Conseils pour choisir un template</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Secteur traditionnel :</strong> Privilégiez les templates classiques</li>
                      <li>• <strong>Startups/Tech :</strong> Les designs modernes sont appréciés</li>
                      <li>• <strong>Métiers créatifs :</strong> Osez les templates originaux</li>
                      <li>• <strong>Postes de direction :</strong> Optez pour l'élégance et la sobriété</li>
                    </ul>
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