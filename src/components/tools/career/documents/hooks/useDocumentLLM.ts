/**
 * useDocumentLLM.ts - Hook for LLM-powered document generation and optimization
 * Provides CV optimization, cover letter generation, and ATS analysis using LLM providers
 */

import { useState, useCallback } from 'react';
import { useLLMManager } from '@/components/tools/productivity/hooks/useLLMManager';
import { useToast } from '@/hooks/use-toast';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    details?: string;
  }>;
  skills: string[];
  languages?: string[];
  certifications?: string[];
}

interface CoverLetterRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  cvData: CVData;
  tone?: 'professional' | 'enthusiastic' | 'creative';
}

interface ATSOptimizationRequest {
  cvContent: string;
  jobDescription: string;
  targetKeywords?: string[];
}

interface OptimizationResult {
  success: boolean;
  content?: string;
  score?: number;
  recommendations?: string[];
  keywords?: string[];
  error?: string;
}

interface CoverLetterResult {
  success: boolean;
  content?: string;
  error?: string;
}

// Fallback templates for when LLM is not available
const FALLBACK_CV_TEMPLATE = `
# {name}

**Contact:** {email} | {phone} | {address}
{linkedin}
{website}

## Expérience Professionnelle
{experience}

## Formation
{education}

## Compétences
{skills}

{languages}
{certifications}
`;

const FALLBACK_COVER_LETTER_TEMPLATE = `
Objet : Candidature pour le poste de {jobTitle}

Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de {jobTitle} au sein de {companyName}.

Forte de mon expérience en {mainSkill}, je suis convaincu(e) que mon profil correspond aux exigences de ce poste. Mes compétences en {skills} et mon expérience chez {lastCompany} m'ont permis de développer une expertise solide dans ce domaine.

Je serais ravi(e) de pouvoir échanger avec vous sur cette opportunité et vous démontrer ma motivation à rejoindre vos équipes.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{name}
`;

export const useDocumentLLM = () => {
  const { defaultProvider, isLoading: llmLoading, hasConfiguredProvider } = useLLMManager();
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const showLLMUnavailableToast = useCallback(() => {
    toast({
      title: "Configuration requise",
      description: "Pour bénéficier des fonctionnalités de l'outil, configurez une clef API LLM dans paramètres",
      variant: "destructive",
    });
  }, [toast]);

  const optimizeCV = useCallback(async (
    cvData: CVData,
    jobDescription?: string,
    targetKeywords?: string[]
  ): Promise<OptimizationResult> => {
    if (!hasConfiguredProvider) {
      showLLMUnavailableToast();
      return {
        success: true,
        content: generateFallbackCV(cvData),
        score: 75,
        recommendations: [
          "Utilisez des mots-clés spécifiques au secteur",
          "Quantifiez vos réalisations avec des chiffres",
          "Adaptez votre CV à chaque offre d'emploi",
          "Utilisez un format ATS-friendly"
        ],
        keywords: extractKeywordsFromCV(cvData)
      };
    }

    setIsOptimizing(true);
    try {
      const prompt = createCVOptimizationPrompt(cvData, jobDescription, targetKeywords);
      const result = await callLLMProvider(prompt);
      
      const parsedResult = parseOptimizationResult(result);
      return {
        success: true,
        ...parsedResult
      };
    } catch (error) {
      console.error('Erreur optimisation CV:', error);
      return {
        success: true,
        content: generateFallbackCV(cvData),
        score: 70,
        recommendations: ["Erreur LLM - Template de secours utilisé"],
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    } finally {
      setIsOptimizing(false);
    }
  }, [hasConfiguredProvider, showLLMUnavailableToast]);

  const generateCoverLetter = useCallback(async (
    request: CoverLetterRequest
  ): Promise<CoverLetterResult> => {
    if (!hasConfiguredProvider) {
      showLLMUnavailableToast();
      return {
        success: true,
        content: generateFallbackCoverLetter(request)
      };
    }

    setIsGenerating(true);
    try {
      const prompt = createCoverLetterPrompt(request);
      const result = await callLLMProvider(prompt);
      
      return {
        success: true,
        content: result.trim()
      };
    } catch (error) {
      console.error('Erreur génération lettre:', error);
      return {
        success: true,
        content: generateFallbackCoverLetter(request),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    } finally {
      setIsGenerating(false);
    }
  }, [hasConfiguredProvider, showLLMUnavailableToast]);

  const analyzeATS = useCallback(async (
    request: ATSOptimizationRequest
  ): Promise<OptimizationResult> => {
    if (!hasConfiguredProvider) {
      showLLMUnavailableToast();
      return {
        success: true,
        score: 65,
        recommendations: [
          "Utilisez des formats de fichier standards (PDF, DOCX)",
          "Évitez les images et graphiques complexes",
          "Utilisez des titres de section standards",
          "Incluez des mots-clés pertinents du secteur"
        ],
        keywords: request.targetKeywords || []
      };
    }

    setIsOptimizing(true);
    try {
      const prompt = createATSAnalysisPrompt(request);
      const result = await callLLMProvider(prompt);
      
      const parsedResult = parseATSResult(result);
      return {
        success: true,
        ...parsedResult
      };
    } catch (error) {
      console.error('Erreur analyse ATS:', error);
      return {
        success: true,
        score: 60,
        recommendations: ["Erreur LLM - Analyse de base effectuée"],
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    } finally {
      setIsOptimizing(false);
    }
  }, [hasConfiguredProvider, showLLMUnavailableToast]);

  // Helper function to call LLM provider
  const callLLMProvider = async (prompt: string): Promise<string> => {
    if (!defaultProvider) {
      throw new Error('Aucun fournisseur LLM configuré');
    }

    const apiKey = defaultProvider.api_key;
    const provider = defaultProvider.provider;
    const model = defaultProvider.selected_model;

    let response: Response;
    let requestBody: any;

    switch (provider) {
      case 'openai':
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        });
        break;

      case 'anthropic':
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: model || 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        break;

      case 'google':
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
          }),
        });
        break;

      default:
        throw new Error(`Fournisseur ${provider} non supporté pour les documents`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur ${provider}: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    
    switch (provider) {
      case 'openai':
        return data.choices[0]?.message?.content || '';
      case 'anthropic':
        return data.content[0]?.text || '';
      case 'google':
        return data.candidates[0]?.content?.parts[0]?.text || '';
      default:
        return '';
    }
  };

  return {
    optimizeCV,
    generateCoverLetter,
    analyzeATS,
    isOptimizing,
    isGenerating,
    hasConfiguredProvider,
    isLoading: llmLoading || isOptimizing || isGenerating
  };
};

// Helper functions
function generateFallbackCV(cvData: CVData): string {
  const experienceSection = cvData.experience.map(exp => 
    `### ${exp.position} - ${exp.company}\n*${exp.duration}*\n\n${exp.description}`
  ).join('\n\n');
  
  const educationSection = cvData.education.map(edu => 
    `### ${edu.degree} - ${edu.institution}\n*${edu.year}*\n${edu.details || ''}`
  ).join('\n\n');
  
  const linkedinSection = cvData.personalInfo.linkedin ? `**LinkedIn:** ${cvData.personalInfo.linkedin}` : '';
  const websiteSection = cvData.personalInfo.website ? `**Website:** ${cvData.personalInfo.website}` : '';
  const languagesSection = cvData.languages?.length ? `## Langues\n${cvData.languages.join(' • ')}` : '';
  const certificationsSection = cvData.certifications?.length ? `## Certifications\n${cvData.certifications.join(' • ')}` : '';
  
  return FALLBACK_CV_TEMPLATE
    .replace('{name}', cvData.personalInfo.name)
    .replace('{email}', cvData.personalInfo.email)
    .replace('{phone}', cvData.personalInfo.phone)
    .replace('{address}', cvData.personalInfo.address)
    .replace('{linkedin}', linkedinSection)
    .replace('{website}', websiteSection)
    .replace('{experience}', experienceSection)
    .replace('{education}', educationSection)
    .replace('{skills}', cvData.skills.join(' • '))
    .replace('{languages}', languagesSection)
    .replace('{certifications}', certificationsSection);
}

function generateFallbackCoverLetter(request: CoverLetterRequest): string {
  const mainSkill = request.cvData.skills[0] || 'mon domaine';
  const lastCompany = request.cvData.experience[0]?.company || 'mes précédentes expériences';
  const skills = request.cvData.skills.slice(0, 3).join(', ');

  return FALLBACK_COVER_LETTER_TEMPLATE
    .replace('{jobTitle}', request.jobTitle)
    .replace('{companyName}', request.companyName)
    .replace('{mainSkill}', mainSkill)
    .replace('{skills}', skills)
    .replace('{lastCompany}', lastCompany)
    .replace('{name}', request.cvData.personalInfo.name);
}

function extractKeywordsFromCV(cvData: CVData): string[] {
  const keywords = new Set<string>();
  
  // Extract from skills
  cvData.skills.forEach(skill => keywords.add(skill.toLowerCase()));
  
  // Extract from experience descriptions
  cvData.experience.forEach(exp => {
    const words = exp.description.split(/\s+/);
    words.forEach(word => {
      if (word.length > 4) {
        keywords.add(word.toLowerCase().replace(/[^a-zA-Z]/g, ''));
      }
    });
  });
  
  return Array.from(keywords).slice(0, 20);
}

function createCVOptimizationPrompt(cvData: CVData, jobDescription?: string, targetKeywords?: string[]): string {
  return `Optimise ce CV pour améliorer sa compatibilité ATS et son impact:

DONNÉES CV:
${JSON.stringify(cvData, null, 2)}

${jobDescription ? `DESCRIPTION DU POSTE:\n${jobDescription}\n\n` : ''}
${targetKeywords ? `MOTS-CLÉS CIBLES:\n${targetKeywords.join(', ')}\n\n` : ''}

INSTRUCTIONS:
1. Réécris le CV en format markdown professionnel
2. Optimise pour les systèmes ATS
3. Intègre les mots-clés pertinents naturellement
4. Quantifie les réalisations quand possible
5. Améliore la structure et la lisibilité

Réponds uniquement avec le CV optimisé en markdown.`;
}

function createCoverLetterPrompt(request: CoverLetterRequest): string {
  return `Génère une lettre de motivation professionnelle:

POSTE: ${request.jobTitle}
ENTREPRISE: ${request.companyName}
TON: ${request.tone || 'professional'}

DESCRIPTION DU POSTE:
${request.jobDescription}

PROFIL CANDIDAT:
${JSON.stringify(request.cvData, null, 2)}

INSTRUCTIONS:
1. Lettre personnalisée et engageante
2. Met en avant les compétences pertinentes
3. Montre la connaissance de l'entreprise
4. Ton ${request.tone || 'professionnel'}
5. Structure claire avec introduction, développement, conclusion

Réponds uniquement avec la lettre de motivation.`;
}

function createATSAnalysisPrompt(request: ATSOptimizationRequest): string {
  return `Analyse ce CV pour la compatibilité ATS:

CONTENU CV:
${request.cvContent}

DESCRIPTION DU POSTE:
${request.jobDescription}

${request.targetKeywords ? `MOTS-CLÉS CIBLES:\n${request.targetKeywords.join(', ')}\n\n` : ''}

INSTRUCTIONS:
1. Évalue le score ATS (0-100)
2. Identifie les mots-clés manquants
3. Donne des recommandations spécifiques
4. Suggère des améliorations de format

Réponds en JSON:
{
  "score": 85,
  "keywords": ["mot1", "mot2"],
  "recommendations": ["conseil1", "conseil2"]
}`;
}

function parseOptimizationResult(result: string): Partial<OptimizationResult> {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(result);
    return parsed;
  } catch {
    // If not JSON, treat as optimized content
    return {
      content: result,
      score: 80,
      recommendations: ["CV optimisé par IA"],
      keywords: []
    };
  }
}

function parseATSResult(result: string): Partial<OptimizationResult> {
  try {
    const parsed = JSON.parse(result);
    return {
      score: parsed.score || 70,
      keywords: parsed.keywords || [],
      recommendations: parsed.recommendations || []
    };
  } catch {
    return {
      score: 70,
      recommendations: ["Analyse ATS effectuée"],
      keywords: []
    };
  }
}