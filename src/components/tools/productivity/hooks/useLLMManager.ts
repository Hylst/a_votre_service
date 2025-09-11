import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIJsonParser } from '../utils/aiJsonParser';

interface LLMProvider {
  id: string;
  provider: string;
  api_key: string;
  is_default: boolean;
  selected_model: string | null;
}

interface DecompositionRequest {
  taskTitle: string;
  taskDescription?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  estimatedDuration?: number;
  context?: string;
}

interface SubtaskData {
  title: string;
  description: string;
  estimatedDuration?: number;
  priority?: 'low' | 'medium' | 'high';
  order?: number;
}

interface DecompositionResult {
  success: boolean;
  subtasks: SubtaskData[];
  error?: string;
}

// Standalone function to generate emergency subtasks
const generateEmergencySubtasks = (request: DecompositionRequest): SubtaskData[] => {
  const baseTitle = request.taskTitle;
  const totalDuration = request.estimatedDuration || 120;
  const avgDuration = Math.round(totalDuration / 4);
  
  return [
    {
      title: `${baseTitle} - Phase 1: Analyse`,
      description: 'Analyser les exigences et définir les objectifs',
      estimatedDuration: avgDuration,
      priority: 'high' as const,
      order: 1
    },
    {
      title: `${baseTitle} - Phase 2: Préparation`,
      description: 'Préparer les ressources et outils nécessaires',
      estimatedDuration: avgDuration,
      priority: 'medium' as const,
      order: 2
    },
    {
      title: `${baseTitle} - Phase 3: Exécution`,
      description: 'Réaliser le travail principal',
      estimatedDuration: avgDuration,
      priority: 'high' as const,
      order: 3
    },
    {
      title: `${baseTitle} - Phase 4: Finalisation`,
      description: 'Réviser, tester et finaliser',
      estimatedDuration: avgDuration,
      priority: 'medium' as const,
      order: 4
    }
  ];
};

export const useLLMManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<LLMProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProviders();
    }
  }, [user]);

  const loadProviders = useCallback(async () => {
    console.log('🔍 [useLLMManager] Début du chargement des providers');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 [useLLMManager] Utilisateur:', user ? 'connecté' : 'non connecté');
      
      if (user) {
        const { data, error } = await supabase
          .from('user_llm_api_keys')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ [useLLMManager] Erreur chargement providers Supabase:', error);
          // Fallback vers localStorage
          const localProviders = localStorage.getItem('llm_providers');
          console.log('🔍 [useLLMManager] Fallback localStorage:', localProviders ? 'trouvé' : 'vide');
          if (localProviders) {
            const parsedProviders = JSON.parse(localProviders);
            console.log('🔍 [useLLMManager] Providers localStorage:', parsedProviders.length, 'providers');
            setProviders(parsedProviders);
            const defaultProv = parsedProviders.find((p: LLMProvider) => p.is_default);
            console.log('🔍 [useLLMManager] Default provider localStorage:', defaultProv ? `${defaultProv.provider} (${defaultProv.selected_model})` : 'aucun');
            setDefaultProvider(defaultProv || null);
          }
          return;
        }

        if (data && data.length > 0) {
          console.log('✅ [useLLMManager] Providers Supabase chargés:', data.length, 'providers');
          setProviders(data);
          const defaultProv = data.find(provider => provider.is_default);
          console.log('🔍 [useLLMManager] Default provider Supabase:', defaultProv ? `${defaultProv.provider} (${defaultProv.selected_model})` : 'aucun');
          setDefaultProvider(defaultProv || null);
          // Sauvegarder en localStorage comme backup
          localStorage.setItem('llm_providers', JSON.stringify(data));
        } else {
          console.log('⚠️ [useLLMManager] Aucune donnée Supabase, essai localStorage');
          // Pas de données Supabase, essayer localStorage
          const localProviders = localStorage.getItem('llm_providers');
          if (localProviders) {
            const parsedProviders = JSON.parse(localProviders);
            console.log('🔍 [useLLMManager] Providers localStorage (fallback):', parsedProviders.length, 'providers');
            setProviders(parsedProviders);
            const defaultProv = parsedProviders.find((p: LLMProvider) => p.is_default);
            console.log('🔍 [useLLMManager] Default provider localStorage (fallback):', defaultProv ? `${defaultProv.provider} (${defaultProv.selected_model})` : 'aucun');
            setDefaultProvider(defaultProv || null);
          }
        }
      } else {
        console.log('👤 [useLLMManager] Utilisateur non connecté, utilisation localStorage');
        // Utilisateur non connecté, utiliser localStorage
        const localProviders = localStorage.getItem('llm_providers');
        if (localProviders) {
          const parsedProviders = JSON.parse(localProviders);
          console.log('🔍 [useLLMManager] Providers localStorage (non connecté):', parsedProviders.length, 'providers');
          setProviders(parsedProviders);
          const defaultProv = parsedProviders.find((p: LLMProvider) => p.is_default);
          console.log('🔍 [useLLMManager] Default provider localStorage (non connecté):', defaultProv ? `${defaultProv.provider} (${defaultProv.selected_model})` : 'aucun');
          setDefaultProvider(defaultProv || null);
        } else {
          console.log('⚠️ [useLLMManager] Aucun provider en localStorage');
        }
      }
    } catch (error) {
      console.error('❌ [useLLMManager] Erreur chargement providers:', error);
      // Fallback vers localStorage en cas d'erreur
      const localProviders = localStorage.getItem('llm_providers');
      if (localProviders) {
        const parsedProviders = JSON.parse(localProviders);
        console.log('🔍 [useLLMManager] Providers localStorage (erreur):', parsedProviders.length, 'providers');
        setProviders(parsedProviders);
        const defaultProv = parsedProviders.find((p: LLMProvider) => p.is_default);
        console.log('🔍 [useLLMManager] Default provider localStorage (erreur):', defaultProv ? `${defaultProv.provider} (${defaultProv.selected_model})` : 'aucun');
        setDefaultProvider(defaultProv || null);
      }
    }
  }, []);

  const decomposeTaskWithAI = useCallback(async (
    request: DecompositionRequest
  ): Promise<DecompositionResult> => {
    if (!defaultProvider) {
      return {
        success: false,
        subtasks: [],
        error: 'Aucun fournisseur LLM configuré par défaut'
      };
    }

    setIsLoading(true);
    try {
      // Prompt optimisé pour une meilleure génération JSON
      const prompt = `Tu es un expert en décomposition de tâches. Tu DOIS respecter ces règles ABSOLUMENT :

RÈGLES STRICTES :
1. Crée EXACTEMENT entre 4 et 8 sous-tâches (jamais moins, jamais plus)
2. Réponds UNIQUEMENT en JSON valide, AUCUN autre texte
3. Chaque sous-tâche doit être spécifique et actionnable
4. Ordonne logiquement les sous-tâches

TÂCHE À DÉCOMPOSER :
Titre: "${request.taskTitle}"
${request.taskDescription ? `Description: "${request.taskDescription}"` : ''}
${request.estimatedDuration ? `Durée totale estimée: ${request.estimatedDuration} minutes` : ''}
${request.priority ? `Priorité: ${request.priority}` : ''}
${request.category ? `Catégorie: ${request.category}` : ''}

INSTRUCTIONS :
- Divise cette tâche en étapes logiques et séquentielles
- Chaque étape doit prendre entre 15 et 90 minutes
- Assure-toi que toutes les étapes sont nécessaires pour accomplir la tâche principale

FORMAT JSON STRICT (réponds UNIQUEMENT avec ce JSON, rien d'autre) :
{
  "subtasks": [
    {
      "title": "Titre précis de l'étape 1",
      "description": "Description détaillée des actions à effectuer",
      "estimatedDuration": 45,
      "priority": "high",
      "order": 1
    },
    {
      "title": "Titre précis de l'étape 2", 
      "description": "Description détaillée des actions à effectuer",
      "estimatedDuration": 30,
      "priority": "medium",
      "order": 2
    }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, aucun texte avant ou après !`;

      let rawResult: string;

      // Appel à l'API selon le fournisseur
      if (defaultProvider.provider === 'openai') {
        rawResult = await callOpenAI(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else if (defaultProvider.provider === 'anthropic') {
        rawResult = await callAnthropic(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else if (defaultProvider.provider === 'google') {
        rawResult = await callGoogle(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else if (defaultProvider.provider === 'deepseek') {
        rawResult = await callDeepSeek(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else if (defaultProvider.provider === 'openrouter') {
        rawResult = await callOpenRouter(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else if (defaultProvider.provider === 'xgrok') {
        rawResult = await callXGrok(defaultProvider.api_key, prompt, defaultProvider.selected_model);
      } else {
        throw new Error(`Fournisseur ${defaultProvider.provider} non supporté`);
      }

      console.log('🤖 Réponse brute de l\'IA:', rawResult.substring(0, 300) + '...');

      // Utiliser le nouveau parseur robuste
      const parseResult = AIJsonParser.parseWithRecovery(rawResult);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Échec du parsing JSON');
      }

      console.log(`✅ ${parseResult.subtasks.length} sous-tâches générées avec méthode: ${parseResult.recoveryMethod}`);

      // Enrichir les sous-tâches avec les données de la requête
      const enrichedSubtasks = parseResult.subtasks.map((subtask, index) => ({
        ...subtask,
        priority: subtask.priority || request.priority || 'medium',
        estimatedDuration: subtask.estimatedDuration || 
          (request.estimatedDuration ? Math.round(request.estimatedDuration / parseResult.subtasks.length) : 30),
        order: index + 1
      }));

      return {
        success: true,
        subtasks: enrichedSubtasks
      };
    } catch (error) {
      console.error('❌ Erreur décomposition IA:', error);
      
      // Génération de sous-tâches de secours en utilisant la fonction standalone
      const fallbackSubtasks = generateEmergencySubtasks(request);
      
      return {
        success: true,
        subtasks: fallbackSubtasks,
        error: `Utilisé les sous-tâches de secours: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    } finally {
      setIsLoading(false);
    }
  }, [defaultProvider]);

  const callOpenAI = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'gpt-4o';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant spécialisé dans la décomposition de tâches. Répondez uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur OpenAI: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const callAnthropic = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'claude-3-5-sonnet-20241022';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur Anthropic: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  };

  const callGoogle = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'gemini-2.0-flash-exp';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur Google: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  };

  const callDeepSeek = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'deepseek-chat';
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant spécialisé dans la décomposition de tâches. Répondez uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur DeepSeek: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const callOpenRouter = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'deepseek/deepseek-r1';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant spécialisé dans la décomposition de tâches. Répondez uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur OpenRouter: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const callXGrok = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'grok-beta';
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant spécialisé dans la décomposition de tâches. Répondez uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur X/Grok: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Debug logs pour hasConfiguredProvider avec validation API key
  const hasConfiguredProvider = !!defaultProvider && !!defaultProvider.api_key && defaultProvider.api_key.trim() !== '';
  console.log('🔍 [useLLMManager] hasConfiguredProvider:', hasConfiguredProvider);
  console.log('🔍 [useLLMManager] defaultProvider:', defaultProvider ? `${defaultProvider.provider} (${defaultProvider.selected_model})` : 'null');
  console.log('🔍 [useLLMManager] defaultProvider API key:', defaultProvider?.api_key ? `${defaultProvider.api_key.substring(0, 10)}...` : 'null');
  console.log('🔍 [useLLMManager] providers count:', providers.length);
  
  // Debug détaillé de tous les providers
  providers.forEach((provider, index) => {
    console.log(`🔍 [useLLMManager] Provider ${index + 1}:`, {
      id: provider.id,
      provider: provider.provider,
      hasApiKey: !!provider.api_key,
      apiKeyLength: provider.api_key?.length || 0,
      isDefault: provider.is_default,
      selectedModel: provider.selected_model
    });
  });

  return {
    providers,
    defaultProvider,
    decomposeTaskWithAI,
    isLoading,
    hasConfiguredProvider,
    reloadProviders: loadProviders,
  };
};
