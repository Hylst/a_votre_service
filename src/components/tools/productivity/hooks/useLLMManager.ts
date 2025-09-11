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

console.log('📦 [useLLMManager] Module loaded - this should appear immediately');

export const useLLMManager = () => {
  console.log('🚀 [useLLMManager] Hook initialized - component is using the hook');
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<LLMProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Immediate localStorage check on hook initialization
  console.log('🔍 [useLLMManager] Immediate localStorage check:');
  console.log('  - llm_providers exists:', !!localStorage.getItem('llm_providers'));
  console.log('  - llm_api_keys exists:', !!localStorage.getItem('llm_api_keys'));
  
  // Force create provider immediately if none exists
  const existingProviders = localStorage.getItem('llm_providers');
  if (!existingProviders) {
    console.log('🔧 [useLLMManager] No providers in localStorage, creating fallback immediately');
    const immediateProvider = {
      id: `immediate-${Date.now()}`,
      provider: 'google',
      api_key: 'AIzaSyDSyFgKU1Y4J2soMMRQZMKFazQmci_Mq0k',
      is_default: true,
      selected_model: 'gemini-1.5-flash'
    };
    localStorage.setItem('llm_providers', JSON.stringify([immediateProvider]));
    localStorage.setItem('llm_api_keys', JSON.stringify({ google: immediateProvider.api_key }));
    console.log('✅ [useLLMManager] Immediate fallback provider created');
  }

  // Enhanced debugging for user authentication and provider loading
  console.log('🔍 [useLLMManager] User state:', {
    exists: !!user,
    id: user?.id || 'null',
    email: user?.email || 'null'
  });

  // Helper function to load providers from localStorage with detailed debugging
  const loadProvidersFromLocalStorage = useCallback(() => {
    console.log('🔍 [useLLMManager] Loading from localStorage only');
    
    // Check all possible localStorage keys
    const llmProviders = localStorage.getItem('llm_providers');
    const llmApiKeys = localStorage.getItem('llm_api_keys');
    
    console.log('🔍 [useLLMManager] localStorage contents:');
    console.log('  - llm_providers:', llmProviders ? 'exists' : 'null');
    console.log('  - llm_api_keys:', llmApiKeys ? 'exists' : 'null');
    
    // Check for environment variables or other sources (using Vite env vars)
    const envGeminiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔍 [useLLMManager] Environment Gemini key:', envGeminiKey ? 'found' : 'not found');
    
    // If no localStorage data but we have environment key, create provider
    if (!llmProviders && !llmApiKeys && envGeminiKey) {
      console.log('🔧 [useLLMManager] Creating provider from environment key');
      const envProvider = {
        id: `env-${Date.now()}`,
        provider: 'google',
        api_key: envGeminiKey,
        is_default: true,
        selected_model: 'gemini-1.5-flash'
      };
      setProviders([envProvider]);
      setDefaultProvider(envProvider);
      // Save to localStorage for future use
      localStorage.setItem('llm_providers', JSON.stringify([envProvider]));
      return;
    }
    
    if (llmProviders) {
      try {
        const parsedProviders = JSON.parse(llmProviders);
        console.log('🔍 [useLLMManager] Parsed providers from localStorage:', parsedProviders);
        setProviders(parsedProviders);
        const defaultProv = parsedProviders.find((p: LLMProvider) => p.is_default);
        console.log('🔍 [useLLMManager] Default provider from localStorage:', defaultProv);
        setDefaultProvider(defaultProv || null);
      } catch (error) {
        console.error('❌ [useLLMManager] Error parsing localStorage providers:', error);
      }
    } else if (llmApiKeys) {
      try {
        const parsedKeys = JSON.parse(llmApiKeys);
        console.log('🔍 [useLLMManager] Converting API keys to providers:', parsedKeys);
        const convertedProviders = Object.entries(parsedKeys).map(([provider, api_key], index) => ({
          id: `local-${Date.now()}-${index}`,
          provider,
          api_key: api_key as string,
          is_default: index === 0,
          selected_model: provider === 'google' ? 'gemini-1.5-flash' : null
        }));
        setProviders(convertedProviders);
        setDefaultProvider(convertedProviders[0] || null);
        // Save converted format
        localStorage.setItem('llm_providers', JSON.stringify(convertedProviders));
      } catch (error) {
        console.error('❌ [useLLMManager] Error parsing localStorage API keys:', error);
      }
    } else {
      console.log('⚠️ [useLLMManager] No providers found in localStorage');
      
      // Last resort: Create Gemini provider with known API key from LLM config
      console.log('🔧 [useLLMManager] Creating fallback Gemini provider with configured API key');
      const fallbackProvider = {
        id: `fallback-${Date.now()}`,
        provider: 'google',
        api_key: 'AIzaSyDSyFgKU1Y4J2soMMRQZMKFazQmci_Mq0k',
        is_default: true,
        selected_model: 'gemini-1.5-flash'
      };
      setProviders([fallbackProvider]);
      setDefaultProvider(fallbackProvider);
      // Save to localStorage for future use
      localStorage.setItem('llm_providers', JSON.stringify([fallbackProvider]));
      localStorage.setItem('llm_api_keys', JSON.stringify({ google: fallbackProvider.api_key }));
      console.log('✅ [useLLMManager] Fallback Gemini provider created and saved');
    }
  }, []);

  const loadProviders = useCallback(async () => {
    console.log('🔍 [useLLMManager] Début du chargement des providers');
    
    // First, always check localStorage content
    const llmProviders = localStorage.getItem('llm_providers');
    const llmApiKeys = localStorage.getItem('llm_api_keys');
    console.log('🔍 [useLLMManager] localStorage check:');
    console.log('  - llm_providers content:', llmProviders);
    console.log('  - llm_api_keys content:', llmApiKeys);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 [useLLMManager] Supabase user check:', {
        exists: !!user,
        id: user?.id || 'null',
        email: user?.email || 'null'
      });
      
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

  // Force reload function for manual testing
  const forceReloadProviders = useCallback(() => {
    console.log('🔄 [useLLMManager] Force reloading providers...');
    console.log('🔍 [useLLMManager] Current localStorage state:');
    console.log('  - llm_providers:', localStorage.getItem('llm_providers'));
    console.log('  - llm_api_keys:', localStorage.getItem('llm_api_keys'));
    
    if (user) {
      console.log('🔄 [useLLMManager] User exists, calling loadProviders');
      loadProviders();
    } else {
      console.log('🔄 [useLLMManager] No user, calling loadProvidersFromLocalStorage');
      loadProvidersFromLocalStorage();
    }
  }, [user, loadProviders, loadProvidersFromLocalStorage]);

  // useEffect hooks after function definitions
  useEffect(() => {
    console.log('🔍 [useLLMManager] useEffect triggered, user:', !!user);
    console.log('🔍 [useLLMManager] Current providers state:', providers.length);
    console.log('🔍 [useLLMManager] Current defaultProvider state:', defaultProvider?.provider || 'null');
    
    if (user) {
      console.log('🔍 [useLLMManager] User authenticated, calling loadProviders');
      loadProviders();
    } else {
      console.log('🔍 [useLLMManager] No user, attempting to load from localStorage anyway');
      // Force load from localStorage even without user
      loadProvidersFromLocalStorage();
    }
  }, [user, loadProviders, loadProvidersFromLocalStorage]);

  // Force load providers on component mount regardless of user state
  useEffect(() => {
    console.log('🔍 [useLLMManager] Component mounted, forcing provider check');
    loadProviders();
    
    // Additional fallback: if still no providers after 1 second, force create one
    const fallbackTimer = setTimeout(() => {
      if (providers.length === 0 && !defaultProvider) {
        console.log('⚡ [useLLMManager] No providers found after mount, creating emergency fallback');
        loadProvidersFromLocalStorage();
      }
    }, 1000);
    
    return () => clearTimeout(fallbackTimer);
  }, [loadProviders, providers.length, defaultProvider, loadProvidersFromLocalStorage]);

  const decomposeTaskWithAI = useCallback(async (
    request: DecompositionRequest
  ): Promise<DecompositionResult> => {
    console.log('🚀 [decomposeTaskWithAI] Starting AI decomposition request');
    console.log('🔍 [decomposeTaskWithAI] Request details:', {
      taskTitle: request.taskTitle,
      taskDescription: request.taskDescription?.substring(0, 100) + '...',
      priority: request.priority,
      estimatedDuration: request.estimatedDuration
    });
    
    if (!defaultProvider) {
      console.error('❌ [decomposeTaskWithAI] No default provider configured');
      return {
        success: false,
        subtasks: [],
        error: 'Aucun fournisseur LLM configuré par défaut'
      };
    }

    console.log('✅ [decomposeTaskWithAI] Using provider:', {
      provider: defaultProvider.provider,
      model: defaultProvider.selected_model,
      hasApiKey: !!defaultProvider.api_key,
      apiKeyLength: defaultProvider.api_key?.length || 0
    });

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

      console.log('📝 [decomposeTaskWithAI] Prompt prepared, length:', prompt.length);

      let rawResult: string;

      console.log('🌐 [decomposeTaskWithAI] Making API call to provider:', defaultProvider.provider);
      
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
        console.error('❌ [decomposeTaskWithAI] Unsupported provider:', defaultProvider.provider);
        throw new Error(`Fournisseur ${defaultProvider.provider} non supporté`);
      }

      console.log('✅ [decomposeTaskWithAI] API call successful, response length:', rawResult?.length || 0);
      console.log('🤖 [decomposeTaskWithAI] Raw response preview:', rawResult?.substring(0, 300) + '...');

      // Utiliser le nouveau parseur robuste
      console.log('🔄 [decomposeTaskWithAI] Parsing AI response...');
      const parseResult = AIJsonParser.parseWithRecovery(rawResult);
      
      if (!parseResult.success) {
        console.error('❌ [decomposeTaskWithAI] JSON parsing failed:', parseResult.error);
        throw new Error(parseResult.error || 'Échec du parsing JSON');
      }

      console.log(`✅ [decomposeTaskWithAI] Successfully parsed ${parseResult.subtasks.length} subtasks using method: ${parseResult.recoveryMethod}`);

      // Enrichir les sous-tâches avec les données de la requête
      const enrichedSubtasks = parseResult.subtasks.map((subtask, index) => ({
        ...subtask,
        priority: subtask.priority || request.priority || 'medium',
        estimatedDuration: subtask.estimatedDuration || 
          (request.estimatedDuration ? Math.round(request.estimatedDuration / parseResult.subtasks.length) : 30),
        order: index + 1
      }));

      console.log('🎯 [decomposeTaskWithAI] Final enriched subtasks:', enrichedSubtasks.map(st => ({ title: st.title, priority: st.priority, duration: st.estimatedDuration })));

      return {
        success: true,
        subtasks: enrichedSubtasks
      };
    } catch (error) {
      console.error('❌ [decomposeTaskWithAI] Error during AI decomposition:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: defaultProvider?.provider,
        hasApiKey: !!defaultProvider?.api_key
      });
      
      // Génération de sous-tâches de secours en utilisant la fonction standalone
      console.log('🔄 [decomposeTaskWithAI] Falling back to emergency subtasks generation');
      const fallbackSubtasks = generateEmergencySubtasks(request);
      
      return {
        success: true,
        subtasks: fallbackSubtasks,
        error: `Utilisé les sous-tâches de secours: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    } finally {
      setIsLoading(false);
      console.log('🏁 [decomposeTaskWithAI] Request completed, loading state reset');
    }
  }, [defaultProvider]);

  const callOpenAI = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'gpt-4o';
    console.log('🔵 [callOpenAI] Starting OpenAI API call');
    console.log('🔵 [callOpenAI] Request details:', {
      model,
      promptLength: prompt.length,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...'
    });

    const requestBody = {
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
    };

    console.log('🔵 [callOpenAI] Request body prepared:', {
      model: requestBody.model,
      messagesCount: requestBody.messages.length,
      maxTokens: requestBody.max_tokens,
      temperature: requestBody.temperature
    });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔵 [callOpenAI] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [callOpenAI] API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Erreur OpenAI: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [callOpenAI] Success:', {
        hasChoices: !!data.choices,
        choicesCount: data.choices?.length || 0,
        usage: data.usage
      });
      
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ [callOpenAI] Network or parsing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };

  const callAnthropic = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'claude-3-5-sonnet-20241022';
    console.log('🟣 [callAnthropic] Starting Anthropic API call');
    console.log('🟣 [callAnthropic] Request details:', {
      model,
      promptLength: prompt.length,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...'
    });

    const requestBody = {
      model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    };

    console.log('🟣 [callAnthropic] Request body prepared:', {
      model: requestBody.model,
      messagesCount: requestBody.messages.length,
      maxTokens: requestBody.max_tokens
    });
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🟣 [callAnthropic] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [callAnthropic] API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Erreur Anthropic: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [callAnthropic] Success:', {
        hasContent: !!data.content,
        contentCount: data.content?.length || 0,
        usage: data.usage
      });
      
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('❌ [callAnthropic] Network or parsing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };

  const callGoogle = async (apiKey: string, prompt: string, selectedModel?: string | null): Promise<string> => {
    const model = selectedModel || 'gemini-2.0-flash-exp';
    console.log('🟢 [callGoogle] Starting Google/Gemini API call');
    console.log('🟢 [callGoogle] Request details:', {
      model,
      promptLength: prompt.length,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...'
    });

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Vous êtes un assistant spécialisé dans la décomposition de tâches. Répondez uniquement en JSON valide, sans texte supplémentaire, sans markdown, sans backticks.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      }
    };

    console.log('🟢 [callGoogle] Request body prepared:', {
      model,
      contentsCount: requestBody.contents.length,
      maxOutputTokens: requestBody.generationConfig.maxOutputTokens,
      temperature: requestBody.generationConfig.temperature
    });
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🟢 [callGoogle] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error('❌ [callGoogle] API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorData
        });
        
        throw new Error(`Erreur Google/Gemini: ${response.status} ${response.statusText} - ${errorData.error?.message || errorText}`);
      }

      const data = await response.json();
      console.log('✅ [callGoogle] Success:', {
        hasCandidates: !!data.candidates,
        candidatesCount: data.candidates?.length || 0,
        hasContent: !!data.candidates?.[0]?.content,
        partsCount: data.candidates?.[0]?.content?.parts?.length || 0,
        usage: data.usageMetadata
      });
      
      const result = data.candidates[0]?.content?.parts[0]?.text || '';
      console.log('🟢 [callGoogle] Extracted text length:', result.length);
      
      return result;
    } catch (error) {
      console.error('❌ [callGoogle] Network or parsing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
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

  // Manual reload functions for testing
  const reloadProviders = useCallback(() => {
    console.log('🔄 [useLLMManager] Manual reload triggered');
    loadProviders();
  }, [loadProviders]);

  const reloadFromLocalStorage = useCallback(() => {
    console.log('🔄 [useLLMManager] Manual localStorage reload triggered');
    loadProvidersFromLocalStorage();
  }, [loadProvidersFromLocalStorage]);

  return {
    providers,
    defaultProvider,
    decomposeTaskWithAI,
    isLoading,
    hasConfiguredProvider,
    reloadProviders,
    reloadFromLocalStorage,
    forceReloadProviders,
  };
};
