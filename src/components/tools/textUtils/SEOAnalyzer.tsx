/**
 * SEOAnalyzer.tsx - Advanced SEO Analysis Tool
 * Provides comprehensive SEO analysis with secondary keywords, link analysis,
 * content structure evaluation, and detailed reporting capabilities.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Search, AlertTriangle, CheckCircle, XCircle, Lightbulb, TrendingUp, Link, Image, FileText, Download, Eye, Target } from 'lucide-react'

interface SEOAnalyzerProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const SEOAnalyzer = ({ data, onDataChange }: SEOAnalyzerProps) => {
  const [content, setContent] = useState(data.content || '');
  const [keyword, setKeyword] = useState(data.keyword || '');
  const [secondaryKeywords, setSecondaryKeywords] = useState(data.secondaryKeywords || '');
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [analysis, setAnalysis] = useState({
    score: 0,
    keywordDensity: 0,
    secondaryKeywordsDensity: {},
    readabilityScore: 0,
    fleschScore: 0,
    issues: [],
    suggestions: [],
    stats: {
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
      avgWordsPerSentence: 0,
      complexSentences: 0
    },
    seoFactors: {
      titleLength: { value: 0, status: 'warning', message: '' },
      descriptionLength: { value: 0, status: 'warning', message: '' },
      keywordInTitle: { status: 'warning', message: '' },
      keywordInDescription: { status: 'warning', message: '' },
      keywordDensity: { value: 0, status: 'warning', message: '' },
      contentLength: { value: 0, status: 'warning', message: '' },
      headingStructure: { status: 'warning', message: '' }
    },
    linkAnalysis: {
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      brokenLinks: [],
      noFollowLinks: 0
    },
    imageAnalysis: {
      totalImages: 0,
      imagesWithAlt: 0,
      imagesWithoutAlt: 0,
      altTextQuality: 'good'
    },
    contentStructure: {
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      h4Count: 0,
      h5Count: 0,
      h6Count: 0,
      hierarchyIssues: []
    }
  });

  useEffect(() => {
    if (onDataChange && data) {
      onDataChange({ ...data, content, keyword, secondaryKeywords, title, description, analysis });
    }
  }, [content, keyword, secondaryKeywords, title, description, data, onDataChange]);

  useEffect(() => {
    analyzeSEO();
  }, [content, keyword, secondaryKeywords, title, description]);

  const analyzeSEO = () => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 250);
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const complexSentences = content.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length > 20).length;

    // Analyse des mots-clés principaux et secondaires
    const keywordCount = keyword ? 
      (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length : 0;
    const keywordDensity = words > 0 ? (keywordCount / words) * 100 : 0;
    
    // Analyse des mots-clés secondaires
    const secondaryKeywordsDensity = {};
    if (secondaryKeywords) {
      const secondaryList = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
      secondaryList.forEach(secKeyword => {
        const count = (content.toLowerCase().match(new RegExp(secKeyword.toLowerCase(), 'g')) || []).length;
        secondaryKeywordsDensity[secKeyword] = words > 0 ? (count / words) * 100 : 0;
      });
    }

    // Score de lisibilité Flesch amélioré
    const avgSentenceLength = sentences > 0 ? words / sentences : 0;
    const avgSyllablesPerWord = words > 0 ? estimateSyllables(content) / words : 0;
    const fleschScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    ));
    
    const readabilityScore = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 1.5) - (content.length / words * 0.1)
    ));

    // Analyses avancées
    const linkAnalysis = analyzeLinkStructure(content);
    const imageAnalysis = analyzeImageSEO(content);
    const contentStructure = analyzeContentStructure(content);
    
    // Analyse des facteurs SEO
    const seoFactors = {
      titleLength: analyzeTitle(title),
      descriptionLength: analyzeDescription(description),
      keywordInTitle: analyzeKeywordInTitle(title, keyword),
      keywordInDescription: analyzeKeywordInDescription(description, keyword),
      keywordDensity: analyzeKeywordDensity(keywordDensity),
      contentLength: analyzeContentLength(words),
      headingStructure: analyzeHeadingStructure(content)
    };

    // Calcul du score SEO global
    const factorScores = Object.values(seoFactors).map(factor => {
      switch (factor.status) {
        case 'good': return 100;
        case 'warning': return 60;
        case 'error': return 20;
        default: return 50;
      }
    });
    const score = Math.round(factorScores.reduce((sum, score) => sum + score, 0) / factorScores.length);

    // Génération des problèmes et suggestions
    const issues = [];
    const suggestions = [];

    Object.entries(seoFactors).forEach(([key, factor]) => {
      if (factor.status === 'error') {
        issues.push(factor.message);
      } else if (factor.status === 'warning') {
        suggestions.push(factor.message);
      }
    });

    setAnalysis({
      score,
      keywordDensity: Math.round(keywordDensity * 100) / 100,
      secondaryKeywordsDensity,
      readabilityScore: Math.round(readabilityScore),
      fleschScore: Math.round(fleschScore),
      issues,
      suggestions,
      stats: { words, sentences, paragraphs, readingTime, avgWordsPerSentence, complexSentences },
      seoFactors,
      linkAnalysis,
      imageAnalysis,
      contentStructure
    });
  };

  const analyzeTitle = (titleText: string) => {
    const length = titleText.length;
    if (length === 0) {
      return { value: length, status: 'error', message: 'Le titre est manquant' };
    } else if (length < 30) {
      return { value: length, status: 'warning', message: 'Le titre est trop court (< 30 caractères)' };
    } else if (length > 60) {
      return { value: length, status: 'warning', message: 'Le titre est trop long (> 60 caractères)' };
    } else {
      return { value: length, status: 'good', message: 'Longueur du titre optimale' };
    }
  };

  const analyzeDescription = (descText: string) => {
    const length = descText.length;
    if (length === 0) {
      return { value: length, status: 'error', message: 'La meta description est manquante' };
    } else if (length < 120) {
      return { value: length, status: 'warning', message: 'La meta description est trop courte (< 120 caractères)' };
    } else if (length > 160) {
      return { value: length, status: 'warning', message: 'La meta description est trop longue (> 160 caractères)' };
    } else {
      return { value: length, status: 'good', message: 'Longueur de la meta description optimale' };
    }
  };

  const analyzeKeywordInTitle = (titleText: string, keywordText: string) => {
    if (!keywordText) {
      return { status: 'warning', message: 'Aucun mot-clé défini' };
    }
    
    const hasKeyword = titleText.toLowerCase().includes(keywordText.toLowerCase());
    if (hasKeyword) {
      return { status: 'good', message: 'Le mot-clé principal est présent dans le titre' };
    } else {
      return { status: 'warning', message: 'Le mot-clé principal devrait être dans le titre' };
    }
  };

  const analyzeKeywordInDescription = (descText: string, keywordText: string) => {
    if (!keywordText) {
      return { status: 'warning', message: 'Aucun mot-clé défini' };
    }
    
    const hasKeyword = descText.toLowerCase().includes(keywordText.toLowerCase());
    if (hasKeyword) {
      return { status: 'good', message: 'Le mot-clé principal est présent dans la description' };
    } else {
      return { status: 'warning', message: 'Le mot-clé principal devrait être dans la description' };
    }
  };

  const analyzeKeywordDensity = (density: number) => {
    if (density === 0) {
      return { value: density, status: 'warning', message: 'Le mot-clé principal n\'apparaît pas dans le contenu' };
    } else if (density < 1) {
      return { value: density, status: 'warning', message: 'Densité du mot-clé trop faible (< 1%)' };
    } else if (density > 3) {
      return { value: density, status: 'error', message: 'Densité du mot-clé trop élevée (> 3%) - risque de sur-optimisation' };
    } else {
      return { value: density, status: 'good', message: 'Densité du mot-clé optimale (1-3%)' };
    }
  };

  const analyzeContentLength = (words: number) => {
    if (words === 0) {
      return { value: words, status: 'error', message: 'Le contenu est vide' };
    } else if (words < 300) {
      return { value: words, status: 'warning', message: 'Contenu trop court pour un bon référencement (< 300 mots)' };
    } else if (words > 2000) {
      return { value: words, status: 'warning', message: 'Contenu très long, vérifiez la structure' };
    } else {
      return { value: words, status: 'good', message: 'Longueur de contenu appropriée' };
    }
  };

  const analyzeHeadingStructure = (text: string) => {
    const h1Count = (text.match(/^# /gm) || []).length;
    const h2Count = (text.match(/^## /gm) || []).length;
    
    if (h1Count === 0) {
      return { status: 'error', message: 'Aucun titre H1 trouvé' };
    } else if (h1Count > 1) {
      return { status: 'warning', message: 'Plusieurs titres H1 détectés, un seul est recommandé' };
    } else if (h2Count === 0) {
      return { status: 'warning', message: 'Aucun sous-titre H2 trouvé, ajoutez de la structure' };
    } else {
      return { status: 'good', message: 'Structure des titres correcte' };
    }
  };

  // Fonctions d'analyse avancées
  const estimateSyllables = (text: string): number => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => {
      const syllables = word.match(/[aeiouy]+/g) || [];
      return total + Math.max(1, syllables.length);
    }, 0);
  };

  const analyzeLinkStructure = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...text.matchAll(linkRegex)];
    const totalLinks = links.length;
    
    let internalLinks = 0;
    let externalLinks = 0;
    
    links.forEach(link => {
      const url = link[2];
      if (url.startsWith('http') || url.startsWith('www')) {
        externalLinks++;
      } else {
        internalLinks++;
      }
    });
    
    return {
      totalLinks,
      internalLinks,
      externalLinks,
      brokenLinks: [],
      noFollowLinks: 0
    };
  };

  const analyzeImageSEO = (text: string) => {
    const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
    const images = [...text.matchAll(imageRegex)];
    const totalImages = images.length;
    const imagesWithAlt = images.filter(img => img[1] && img[1].trim().length > 0).length;
    const imagesWithoutAlt = totalImages - imagesWithAlt;
    
    let altTextQuality = 'good';
    if (imagesWithoutAlt > totalImages * 0.5) {
      altTextQuality = 'poor';
    } else if (imagesWithoutAlt > 0) {
      altTextQuality = 'average';
    }
    
    return {
      totalImages,
      imagesWithAlt,
      imagesWithoutAlt,
      altTextQuality
    };
  };

  const analyzeContentStructure = (text: string) => {
    const h1Count = (text.match(/^# /gm) || []).length;
    const h2Count = (text.match(/^## /gm) || []).length;
    const h3Count = (text.match(/^### /gm) || []).length;
    const h4Count = (text.match(/^#### /gm) || []).length;
    const h5Count = (text.match(/^##### /gm) || []).length;
    const h6Count = (text.match(/^###### /gm) || []).length;
    
    const hierarchyIssues = [];
    if (h1Count === 0) hierarchyIssues.push('Aucun H1 trouvé');
    if (h1Count > 1) hierarchyIssues.push('Plusieurs H1 détectés');
    if (h2Count === 0 && text.length > 500) hierarchyIssues.push('Aucun H2 pour structurer le contenu');
    
    return {
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      hierarchyIssues
    };
  };

  const exportReport = () => {
    const report = {
      title: 'Rapport d\'analyse SEO',
      date: new Date().toLocaleDateString('fr-FR'),
      url: title,
      score: analysis.score,
      keyword,
      secondaryKeywords,
      analysis
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Input Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Méta-données SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyword">Mot-clé principal</Label>
              <Input
                id="keyword"
                placeholder="ex: référencement naturel"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="secondaryKeywords">Mots-clés secondaires</Label>
              <Input
                id="secondaryKeywords"
                placeholder="SEO, optimisation, Google (séparés par des virgules)"
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="title">Titre de la page</Label>
              <Input
                id="title"
                placeholder="Titre SEO de votre page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {title.length}/60 caractères
              </div>
            </div>
            <div>
              <Label htmlFor="description">Meta description</Label>
              <Textarea
                id="description"
                placeholder="Description qui apparaîtra dans les résultats de recherche"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-background"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {description.length}/160 caractères
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contenu à analyser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Collez le contenu de votre page ici (Markdown supporté)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-background"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>{analysis.stats.words} mots</span>
              <span>{analysis.stats.readingTime} min de lecture</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Score Dashboard */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Score SEO Global
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(analysis.score >= 80 ? 'good' : analysis.score >= 60 ? 'warning' : 'error')}
              <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </span>
              <Button
                onClick={exportReport}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                analysis.score >= 80 ? 'bg-green-500' :
                analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">{Object.values(analysis.seoFactors).filter(f => f.status === 'good').length}</div>
              <div className="text-muted-foreground">Excellent</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">{Object.values(analysis.seoFactors).filter(f => f.status === 'warning').length}</div>
              <div className="text-muted-foreground">À améliorer</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{Object.values(analysis.seoFactors).filter(f => f.status === 'error').length}</div>
              <div className="text-muted-foreground">Critique</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{Math.round(analysis.fleschScore)}</div>
              <div className="text-muted-foreground">Lisibilité</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced SEO Analysis Tabs */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base">Analyse SEO Détaillée</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="factors">Facteurs</TabsTrigger>
              <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="technical">Technique</TabsTrigger>
              <TabsTrigger value="readability">Lisibilité</TabsTrigger>
              <TabsTrigger value="suggestions">Conseils</TabsTrigger>
            </TabsList>

            <TabsContent value="factors" className="mt-6">
              <div className="space-y-3">
                {analysis?.seoFactors && Object.entries(analysis.seoFactors).map(([key, factor]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(factor.status)}
                      <div>
                        <span className="font-medium">
                          {key === 'titleLength' ? 'Longueur du titre' :
                           key === 'descriptionLength' ? 'Longueur de la description' :
                           key === 'keywordInTitle' ? 'Mot-clé dans le titre' :
                           key === 'keywordInDescription' ? 'Mot-clé dans la description' :
                           key === 'keywordDensity' ? 'Densité du mot-clé' :
                           key === 'contentLength' ? 'Longueur du contenu' :
                           key === 'headingStructure' ? 'Structure des titres' : key}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">{factor.message}</p>
                      </div>
                    </div>
                    <Badge variant={factor.status === 'good' ? 'default' : factor.status === 'warning' ? 'secondary' : 'destructive'}>
                      {factor.status === 'good' ? 'OK' : factor.status === 'warning' ? 'Attention' : 'Erreur'}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-background">
                    <h4 className="font-medium mb-2">Mot-clé principal</h4>
                    <div className="text-2xl font-bold text-blue-600">{analysis.keywordDensity.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Densité recommandée: 1-3%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-background">
                    <h4 className="font-medium mb-2">Mots-clés secondaires</h4>
                    <div className="space-y-2">
                      {analysis?.secondaryKeywordsDensity && Object.entries(analysis.secondaryKeywordsDensity).map(([keyword, density]) => (
                        <div key={keyword} className="flex justify-between items-center">
                          <span className="text-sm">{keyword}</span>
                          <span className="text-sm font-medium">{density.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-blue-600">{analysis.stats.words}</div>
                  <div className="text-sm text-muted-foreground">Mots</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-green-600">{analysis.stats.sentences}</div>
                  <div className="text-sm text-muted-foreground">Phrases</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-purple-600">{analysis.stats.paragraphs}</div>
                  <div className="text-sm text-muted-foreground">Paragraphes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-orange-600">{analysis.stats.readingTime}</div>
                  <div className="text-sm text-muted-foreground">Min lecture</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg border bg-background">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Analyse des liens
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>Liens internes: <span className="font-medium">{analysis.linkAnalysis.internalLinks}</span></div>
                     <div>Liens externes: <span className="font-medium">{analysis.linkAnalysis.externalLinks}</span></div>
                   </div>
                </div>
                
                <div className="p-4 rounded-lg border bg-background">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Analyse des images
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>Images totales: <span className="font-medium">{analysis.imageAnalysis.totalImages}</span></div>
                     <div>Avec alt text: <span className="font-medium">{analysis.imageAnalysis.imagesWithAlt}</span></div>
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-background">
                  <h4 className="font-medium mb-2">Structure du contenu</h4>
                  <div className="space-y-2">
                     {analysis?.contentStructure && (
                       <>
                         <div className="flex justify-between items-center">
                           <span className="text-sm">H1</span>
                           <span className="text-sm font-medium">{analysis.contentStructure.h1Count}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm">H2</span>
                           <span className="text-sm font-medium">{analysis.contentStructure.h2Count}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm">H3</span>
                           <span className="text-sm font-medium">{analysis.contentStructure.h3Count}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm">H4</span>
                           <span className="text-sm font-medium">{analysis.contentStructure.h4Count}</span>
                         </div>
                       </>
                     )}
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="readability" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(analysis.fleschScore)}</div>
                  <div className="text-sm text-muted-foreground">Score Flesch</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.fleschScore >= 90 ? 'Très facile' :
                     analysis.fleschScore >= 80 ? 'Facile' :
                     analysis.fleschScore >= 70 ? 'Assez facile' :
                     analysis.fleschScore >= 60 ? 'Standard' :
                     analysis.fleschScore >= 50 ? 'Assez difficile' :
                     analysis.fleschScore >= 30 ? 'Difficile' : 'Très difficile'}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-green-600">{Math.round(analysis.stats.avgWordsPerSentence)}</div>
                  <div className="text-sm text-muted-foreground">Mots/phrase</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-purple-600">{analysis.stats.complexSentences}</div>
                  <div className="text-sm text-muted-foreground">Phrases complexes</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-6">
              <div className="space-y-4">
                {analysis.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Problèmes détectés
                    </h4>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" />
                      Suggestions d'amélioration
                    </h4>
                    <div className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-700">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
