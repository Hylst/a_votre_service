
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Eye, Clock, Globe, BookOpen, 
  Target, FileText, Download, Zap, AlertCircle, CheckCircle,
  Languages, Brain, PieChart, Search
} from 'lucide-react';

interface TextAnalyzerProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const TextAnalyzer = ({ data, onDataChange }: TextAnalyzerProps) => {
  const [text, setText] = useState(data.text || '');
  const [analysis, setAnalysis] = useState({
    // Basic metrics
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    
    // Language detection
    detectedLanguage: 'unknown',
    languageConfidence: 0,
    
    // Advanced readability
    readabilityScore: 0,
    fleschKincaid: 0,
    smogIndex: 0,
    colemanLiau: 0,
    
    // Text complexity
    lexicalDiversity: 0,
    avgSyllablesPerWord: 0,
    complexWordsPercentage: 0,
    
    // Enhanced sentiment
    sentiment: 'neutral',
    sentimentScore: 0,
    sentimentConfidence: 0,
    
    // Text structure
    questionMarks: 0,
    exclamationMarks: 0,
    uppercasePercentage: 0,
    
    // Writing style
    passiveVoicePercentage: 0,
    adverbPercentage: 0,
    conjunctionPercentage: 0,
    
    // SEO metrics
    titleSuggestions: [],
    metaDescriptionLength: 0,
    keywordDensity: [],
    
    // Additional metrics
    avgWordsPerSentence: 0,
    avgCharsPerWord: 0,
    uniqueWords: 0,
    repeatedWords: 0
  });

  // Debounced analysis for performance
  const debouncedAnalyzeText = useCallback(
    debounce((inputText: string) => {
      analyzeText(inputText);
    }, 300),
    []
  );

  useEffect(() => {
    if (onDataChange && data && text !== data.text) {
      onDataChange({ ...data, text });
    }
  }, [text, data, onDataChange]);

  useEffect(() => {
    debouncedAnalyzeText(text);
  }, [text, debouncedAnalyzeText]);

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const analyzeText = (inputText: string) => {
    if (!inputText.trim()) {
      setAnalysis({
        characters: 0, charactersNoSpaces: 0, words: 0, sentences: 0, paragraphs: 0,
        readingTime: 0, detectedLanguage: 'unknown', languageConfidence: 0,
        readabilityScore: 0, fleschKincaid: 0, smogIndex: 0, colemanLiau: 0,
        lexicalDiversity: 0, avgSyllablesPerWord: 0, complexWordsPercentage: 0,
        sentiment: 'neutral', sentimentScore: 0, sentimentConfidence: 0,
        questionMarks: 0, exclamationMarks: 0, uppercasePercentage: 0,
        passiveVoicePercentage: 0, adverbPercentage: 0, conjunctionPercentage: 0,
        titleSuggestions: [], metaDescriptionLength: 0, keywordDensity: [],
        avgWordsPerSentence: 0, avgCharsPerWord: 0, uniqueWords: 0, repeatedWords: 0
      });
      return;
    }

    // Basic metrics
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).length;
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 250);

    // Language detection
    const { language, confidence } = detectLanguage(inputText);

    // Word analysis
    const wordList = inputText.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const uniqueWordSet = new Set(wordList);
    const uniqueWords = uniqueWordSet.size;
    const repeatedWords = words - uniqueWords;

    // Advanced readability metrics
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const avgCharsPerWord = words > 0 ? charactersNoSpaces / words : 0;
    const avgSyllablesPerWord = calculateAvgSyllables(wordList);
    
    const fleschKincaid = calculateFleschKincaid(avgWordsPerSentence, avgSyllablesPerWord);
    const smogIndex = calculateSMOG(sentences, wordList);
    const colemanLiau = calculateColemanLiau(characters, words, sentences);
    const readabilityScore = Math.round((fleschKincaid + smogIndex + colemanLiau) / 3);

    // Text complexity
    const lexicalDiversity = uniqueWords / Math.max(words, 1);
    const complexWords = wordList.filter(word => countSyllables(word) >= 3).length;
    const complexWordsPercentage = (complexWords / Math.max(words, 1)) * 100;

    // Enhanced sentiment analysis
    const sentimentResult = analyzeSentiment(inputText, language);

    // Text structure analysis
    const questionMarks = (inputText.match(/\?/g) || []).length;
    const exclamationMarks = (inputText.match(/!/g) || []).length;
    const uppercaseChars = (inputText.match(/[A-Z]/g) || []).length;
    const uppercasePercentage = (uppercaseChars / Math.max(characters, 1)) * 100;

    // Writing style metrics
    const passiveVoicePercentage = detectPassiveVoice(inputText, language);
    const adverbPercentage = detectAdverbs(wordList, language);
    const conjunctionPercentage = detectConjunctions(wordList, language);

    // SEO metrics
    const titleSuggestions = generateTitleSuggestions(inputText);
    const metaDescriptionLength = inputText.length > 160 ? 160 : inputText.length;

    // Keyword density
    const wordFreq: { [key: string]: number } = {};
    wordList.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const keywordDensity = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word, count]) => ({ 
        word, 
        count, 
        density: (count / words * 100).toFixed(1) 
      }));

    setAnalysis({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      detectedLanguage: language,
      languageConfidence: confidence,
      readabilityScore,
      fleschKincaid: Math.round(fleschKincaid),
      smogIndex: Math.round(smogIndex),
      colemanLiau: Math.round(colemanLiau),
      lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      complexWordsPercentage: Math.round(complexWordsPercentage),
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      sentimentConfidence: sentimentResult.confidence,
      questionMarks,
      exclamationMarks,
      uppercasePercentage: Math.round(uppercasePercentage),
      passiveVoicePercentage: Math.round(passiveVoicePercentage),
      adverbPercentage: Math.round(adverbPercentage),
      conjunctionPercentage: Math.round(conjunctionPercentage),
      titleSuggestions,
      metaDescriptionLength,
      keywordDensity,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
      uniqueWords,
      repeatedWords
    });
  };

  // Language detection function
  const detectLanguage = (text: string) => {
    const languagePatterns = {
      french: {
        words: ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'une', 'un', 'ce', 'que', 'qui', 'dans', 'pour', 'avec', 'sur', 'par', 'être', 'avoir'],
        chars: ['à', 'é', 'è', 'ê', 'ë', 'ç', 'ù', 'û', 'ü', 'ô', 'ö', 'î', 'ï', 'â', 'ä']
      },
      english: {
        words: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has'],
        chars: []
      },
      spanish: {
        words: ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'es', 'una', 'un', 'que', 'en', 'con', 'por', 'para', 'ser', 'estar', 'tener'],
        chars: ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü']
      },
      german: {
        words: ['der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'auf', 'zu', 'von', 'mit', 'bei', 'ist', 'sind', 'war', 'waren', 'sein', 'haben'],
        chars: ['ä', 'ö', 'ü', 'ß']
      },
      italian: {
        words: ['il', 'la', 'lo', 'gli', 'le', 'di', 'del', 'e', 'è', 'una', 'un', 'che', 'in', 'con', 'per', 'da', 'essere', 'avere'],
        chars: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú']
      }
    };

    const words = text.toLowerCase().split(/\W+/);
    const scores: { [key: string]: number } = {};

    Object.entries(languagePatterns).forEach(([lang, patterns]) => {
      let score = 0;
      patterns.words.forEach(word => {
        score += words.filter(w => w === word).length;
      });
      patterns.chars.forEach(char => {
        score += (text.match(new RegExp(char, 'gi')) || []).length;
      });
      scores[lang] = score;
    });

    const maxScore = Math.max(...Object.values(scores));
    const detectedLang = Object.keys(scores).find(lang => scores[lang] === maxScore) || 'unknown';
    const confidence = maxScore > 0 ? Math.min(100, (maxScore / words.length) * 100) : 0;

    return { language: detectedLang, confidence: Math.round(confidence) };
  };

  // Syllable counting function
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const calculateAvgSyllables = (wordList: string[]): number => {
    if (wordList.length === 0) return 0;
    const totalSyllables = wordList.reduce((sum, word) => sum + countSyllables(word), 0);
    return totalSyllables / wordList.length;
  };

  // Advanced readability calculations
  const calculateFleschKincaid = (avgWordsPerSentence: number, avgSyllablesPerWord: number): number => {
    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  };

  const calculateSMOG = (sentences: number, wordList: string[]): number => {
    const complexWords = wordList.filter(word => countSyllables(word) >= 3).length;
    return 1.0430 * Math.sqrt(complexWords * (30 / Math.max(sentences, 1))) + 3.1291;
  };

  const calculateColemanLiau = (characters: number, words: number, sentences: number): number => {
    const L = (characters / Math.max(words, 1)) * 100;
    const S = (sentences / Math.max(words, 1)) * 100;
    return 0.0588 * L - 0.296 * S - 15.8;
  };

  // Enhanced sentiment analysis
  const analyzeSentiment = (text: string, language: string) => {
    const sentimentWords = {
      french: {
        positive: ['bon', 'bien', 'excellent', 'parfait', 'génial', 'super', 'formidable', 'magnifique', 'fantastique', 'merveilleux', 'incroyable', 'extraordinaire', 'remarquable', 'splendide', 'admirable'],
        negative: ['mauvais', 'mal', 'terrible', 'horrible', 'nul', 'pire', 'affreux', 'épouvantable', 'détestable', 'abominable', 'catastrophique', 'désastreux', 'lamentable', 'pitoyable', 'misérable']
      },
      english: {
        positive: ['good', 'great', 'excellent', 'perfect', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding', 'superb', 'magnificent', 'marvelous', 'incredible', 'exceptional'],
        negative: ['bad', 'terrible', 'horrible', 'awful', 'worst', 'dreadful', 'appalling', 'disgusting', 'abysmal', 'atrocious', 'deplorable', 'disastrous', 'pathetic', 'miserable', 'wretched']
      }
    };

    const words = text.toLowerCase().split(/\W+/);
    const langWords = sentimentWords[language as keyof typeof sentimentWords] || sentimentWords.english;
    
    const positiveCount = words.filter(word => langWords.positive.includes(word)).length;
    const negativeCount = words.filter(word => langWords.negative.includes(word)).length;
    
    const totalSentimentWords = positiveCount + negativeCount;
    const score = totalSentimentWords > 0 ? (positiveCount - negativeCount) / totalSentimentWords : 0;
    const confidence = Math.min(100, (totalSentimentWords / Math.max(words.length, 1)) * 100 * 10);
    
    let sentiment = 'neutral';
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
    
    return { sentiment, score: Math.round(score * 100), confidence: Math.round(confidence) };
  };

  // Writing style detection functions
  const detectPassiveVoice = (text: string, language: string): number => {
    const passivePatterns = {
      french: /\b(est|sont|était|étaient|sera|seront|fut|furent)\s+\w+é[es]?\b/gi,
      english: /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi
    };
    
    const pattern = passivePatterns[language as keyof typeof passivePatterns] || passivePatterns.english;
    const matches = text.match(pattern) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return (matches.length / Math.max(sentences, 1)) * 100;
  };

  const detectAdverbs = (wordList: string[], language: string): number => {
    const adverbPatterns = {
      french: /ment$/,
      english: /ly$/
    };
    
    const pattern = adverbPatterns[language as keyof typeof adverbPatterns] || adverbPatterns.english;
    const adverbs = wordList.filter(word => pattern.test(word)).length;
    
    return (adverbs / Math.max(wordList.length, 1)) * 100;
  };

  const detectConjunctions = (wordList: string[], language: string): number => {
    const conjunctions = {
      french: ['et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'cependant', 'néanmoins', 'toutefois'],
      english: ['and', 'or', 'but', 'so', 'yet', 'for', 'nor', 'however', 'nevertheless', 'therefore']
    };
    
    const langConjunctions = conjunctions[language as keyof typeof conjunctions] || conjunctions.english;
    const conjunctionCount = wordList.filter(word => langConjunctions.includes(word)).length;
    
    return (conjunctionCount / Math.max(wordList.length, 1)) * 100;
  };

  // SEO helper function
  const generateTitleSuggestions = (text: string): string[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const suggestions = [];
    
    if (sentences.length > 0) {
      suggestions.push(sentences[0].trim().substring(0, 60));
    }
    
    const words = text.split(/\s+/);
    if (words.length >= 5) {
      suggestions.push(words.slice(0, 8).join(' '));
    }
    
    return suggestions.filter(s => s.length > 10).slice(0, 3);
  };

  // Export functionality
  const exportAnalysis = (format: 'json' | 'text') => {
    const data = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      analysis,
      timestamp: new Date().toISOString()
    };
    
    let content: string;
    let filename: string;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `text-analysis-${Date.now()}.json`;
    } else {
      content = `Analyse de Texte - ${new Date().toLocaleDateString()}\n\n`;
      content += `Texte analysé: ${data.text}\n\n`;
      content += `=== MÉTRIQUES DE BASE ===\n`;
      content += `Caractères: ${analysis.characters}\n`;
      content += `Mots: ${analysis.words}\n`;
      content += `Phrases: ${analysis.sentences}\n`;
      content += `Paragraphes: ${analysis.paragraphs}\n`;
      content += `Temps de lecture: ${analysis.readingTime} min\n\n`;
      content += `=== LANGUE ===\n`;
      content += `Langue détectée: ${analysis.detectedLanguage}\n`;
      content += `Confiance: ${analysis.languageConfidence}%\n\n`;
      content += `=== LISIBILITÉ ===\n`;
      content += `Score global: ${analysis.readabilityScore}/100\n`;
      content += `Flesch-Kincaid: ${analysis.fleschKincaid}\n`;
      content += `SMOG: ${analysis.smogIndex}\n`;
      content += `Coleman-Liau: ${analysis.colemanLiau}\n\n`;
      content += `=== SENTIMENT ===\n`;
      content += `Sentiment: ${analysis.sentiment}\n`;
      content += `Score: ${analysis.sentimentScore}\n`;
      content += `Confiance: ${analysis.sentimentConfidence}%\n`;
      filename = `text-analysis-${Date.now()}.txt`;
    }
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      english: '🇬🇧',
      spanish: '🇪🇸',
      german: '🇩🇪',
      italian: '🇮🇹',
      unknown: '🌐'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Texte à analyser
            </div>
            {text && (
              <div className="flex gap-2">
                <Button
                  onClick={() => exportAnalysis('json')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
                <Button
                  onClick={() => exportAnalysis('text')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Rapport
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Saisissez votre texte ici pour l'analyser..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full"
          />
        </CardContent>
      </Card>

      {text && (
        <>
          {/* Language Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="w-4 h-4" />
                Détection de langue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getLanguageFlag(analysis.detectedLanguage)}</span>
                  <div>
                    <div className="font-medium capitalize">{analysis.detectedLanguage}</div>
                    <div className="text-sm text-muted-foreground">Confiance: {analysis.languageConfidence}%</div>
                  </div>
                </div>
                <Progress value={analysis.languageConfidence} className="flex-1 h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.characters}</div>
                <div className="text-xs text-muted-foreground">Caractères</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.words}</div>
                <div className="text-xs text-muted-foreground">Mots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.sentences}</div>
                <div className="text-xs text-muted-foreground">Phrases</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.paragraphs}</div>
                <div className="text-xs text-muted-foreground">Paragraphes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{analysis.readingTime}</div>
                <div className="text-xs text-muted-foreground">Min lecture</div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Readability Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4" />
                Métriques de lisibilité avancées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Score global</span>
                      <span className={`text-sm font-bold ${getReadabilityColor(analysis.readabilityScore)}`}>
                        {analysis.readabilityScore}/100
                      </span>
                    </div>
                    <Progress value={analysis.readabilityScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-secondary p-3 rounded">
                      <div className="text-lg font-bold">{analysis.fleschKincaid.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Flesch-Kincaid</div>
                    </div>
                    <div className="bg-secondary p-3 rounded">
                      <div className="text-lg font-bold">{analysis.smogIndex.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">SMOG</div>
                    </div>
                    <div className="bg-secondary p-3 rounded">
                      <div className="text-lg font-bold">{analysis.colemanLiau.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Coleman-Liau</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Diversité lexicale</span>
                    <span className="font-medium">{analysis.lexicalDiversity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Syllabes par mot</span>
                    <span className="font-medium">{analysis.avgSyllablesPerWord.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mots complexes</span>
                    <span className="font-medium">{analysis.complexWordsPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment & Text Structure */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-4 h-4" />
                  Analyse de sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sentiment</span>
                  <Badge className={getSentimentColor(analysis.sentiment)}>
                    {analysis.sentiment === 'positive' ? '😊 Positif' : 
                     analysis.sentiment === 'negative' ? '😞 Négatif' : '😐 Neutre'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Score</span>
                  <span className="font-medium">{analysis.sentimentScore}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Confiance</span>
                    <span className="text-sm font-medium">{analysis.sentimentConfidence}%</span>
                  </div>
                  <Progress value={analysis.sentimentConfidence} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="w-4 h-4" />
                  Structure du texte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Points d'interrogation</span>
                  <span className="font-medium">{analysis.questionMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Points d'exclamation</span>
                  <span className="font-medium">{analysis.exclamationMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Majuscules</span>
                  <span className="font-medium">{analysis.uppercasePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mots uniques</span>
                  <span className="font-medium">{analysis.uniqueWords}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Writing Style Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-4 h-4" />
                Style d'écriture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.passiveVoicePercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Voix passive</div>
                  <Progress value={analysis.passiveVoicePercentage} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.adverbPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Adverbes</div>
                  <Progress value={analysis.adverbPercentage} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.conjunctionPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Conjonctions</div>
                  <Progress value={analysis.conjunctionPercentage} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="w-4 h-4" />
                Métriques SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Longueur méta-description</span>
                  <Badge variant={analysis.metaDescriptionLength >= 120 && analysis.metaDescriptionLength <= 160 ? 'default' : 'destructive'}>
                    {analysis.metaDescriptionLength} caractères
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (analysis.metaDescriptionLength / 160) * 100)} 
                  className="h-2" 
                />
              </div>
              
              {analysis.titleSuggestions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Suggestions de titres</div>
                  <div className="space-y-2">
                    {analysis.titleSuggestions.map((title, index) => (
                      <div key={index} className="bg-secondary p-2 rounded text-sm">
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4" />
                Mots-clés fréquents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.keywordDensity.length > 0 ? (
                <div className="space-y-2">
                  {analysis.keywordDensity.slice(0, 8).map((keyword, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{keyword.word}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {keyword.count}x ({keyword.density}%)
                        </span>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min(100, parseFloat(keyword.density) * 10)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun mot-clé détecté. Ajoutez du texte pour voir l'analyse.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4" />
                Statistiques détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="font-semibold">{analysis.charactersNoSpaces}</div>
                  <div className="text-xs text-muted-foreground">Caractères (sans espaces)</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="font-semibold">{analysis.wordsPerParagraph}</div>
                  <div className="text-xs text-muted-foreground">Mots par paragraphe</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="font-semibold">{analysis.wordsPerSentence}</div>
                  <div className="text-xs text-muted-foreground">Mots par phrase</div>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <div className="font-semibold">{analysis.charactersPerWord}</div>
                  <div className="text-xs text-muted-foreground">Caractères par mot</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
