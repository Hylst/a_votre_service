# Prompt de Redémarrage - Discussion IA de Développement

## Contexte de l'Application

Vous travaillez sur une application React TypeScript appelée "À Votre Service" qui comprend plusieurs sections d'outils :

### Sections Principales
1. **Career Pro Tools** - Outils de développement professionnel avec IA Coach
2. **Productivity Tools** - Gestionnaire de tâches, notes, objectifs, pomodoro
3. **Text & Content Tools** - Analyseur de texte, générateur, utilitaires
4. **Health & Wellness Tools** - Suivi santé et bien-être
5. **Creativity Tools** - Outils créatifs et artistiques

### Architecture Technique Actuelle
- **Frontend** : React 18 + TypeScript + Tailwind CSS + Vite
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **État Local** : IndexedDB via Dexie.js
- **Gestion LLM** : Hook personnalisé `useLLMManager`

## Problèmes Critiques Identifiés

### 1. Gestion Mémoire
- **Problème** : Fuites mémoire dans les hooks de gestion de données
- **Impact** : Performance dégradée, crashes potentiels
- **Fichiers concernés** :
  - `src/hooks/useUniversalDataManager.ts`
  - `src/hooks/useOptimizedDataManager.ts`
  - `src/hooks/useRobustDataManager.ts`

### 2. Intégration LLM API
- **Problème** : Le hook `useLLMManager` n'est pas utilisé dans les outils
- **Impact** : Contenu statique au lieu de génération IA
- **Outils affectés** :
  - TaskManager, NoteManager, GoalManager (Productivity)
  - TextAnalyzer, TextGenerator (Text & Content)
  - Tous les outils Career Pro sauf AICoach

### 3. Synchronisation Supabase
- **Problème** : `hasConfiguredProvider` ne détecte pas les clés API sauvegardées
- **Impact** : Fonctionnalités IA inaccessibles malgré configuration
- **Fichiers concernés** :
  - `src/hooks/useLLMManager.ts`
  - `src/components/tools/career/AICoach.tsx`

## Actions Techniques Prioritaires

### Phase 1 : Correction de la Détection LLM
```typescript
// Corriger hasConfiguredProvider dans useLLMManager
// Ajouter validation des clés API
// Implémenter fallback localStorage/Supabase
```

### Phase 2 : Intégration LLM dans les Outils
```typescript
// Importer useLLMManager dans :
// - TaskManagerEnhanced.tsx
// - NoteManager.tsx
// - GoalManagerEnhanced.tsx
// - TextAnalyzer.tsx
// - TextGenerator.tsx
```

### Phase 3 : Optimisation Mémoire
```typescript
// Implémenter cleanup dans useEffect
// Optimiser les re-renders
// Gérer les abonnements Supabase
```

## Spécifications Techniques

### Contraintes de Développement
- **Modularité** : Max 800 lignes par fichier
- **Thème** : Support dark/light avec `bg-card text-card-foreground`
- **Responsive** : Mobile-first design
- **Performance** : Lazy loading, memoization

### Structure de Données
```typescript
interface LLMProvider {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
}

interface ToolConfig {
  hasAI: boolean;
  provider?: LLMProvider;
  fallbackContent: string;
}
```

### Gestion d'État
```typescript
// Pattern recommandé pour les outils
const { 
  generateContent, 
  isLoading, 
  hasConfiguredProvider 
} = useLLMManager();

// Fallback si pas de provider
const content = hasConfiguredProvider 
  ? await generateContent(prompt)
  : staticFallbackContent;
```

## Critères de Validation

### Tests Fonctionnels
1. **Configuration LLM** : Sauvegarder clé API → Détection automatique
2. **Génération Contenu** : Outils utilisent IA au lieu de contenu statique
3. **Performance** : Pas de fuites mémoire après 10min d'utilisation
4. **Synchronisation** : Données cohérentes entre localStorage et Supabase

### Tests Techniques
```bash
# Vérifier les imports LLM
npm run lint

# Tester la performance
npm run build
npm run preview

# Vérifier la base de données
supabase status
```

## Priorités d'Implémentation

### Urgent (P0)
- [ ] Corriger `hasConfiguredProvider` dans useLLMManager
- [ ] Ajouter validation des clés API
- [ ] Implémenter fallback pour détection provider

### Important (P1)
- [ ] Intégrer useLLMManager dans TaskManager
- [ ] Intégrer useLLMManager dans NoteManager
- [ ] Intégrer useLLMManager dans TextAnalyzer

### Souhaitable (P2)
- [ ] Optimiser la gestion mémoire des hooks
- [ ] Améliorer la synchronisation Supabase
- [ ] Ajouter monitoring des performances

## Instructions pour l'IA de Développement

Quand vous travaillez sur cette application :

1. **Toujours vérifier** si un outil devrait utiliser `useLLMManager`
2. **Implémenter des fallbacks** pour le contenu statique
3. **Optimiser la mémoire** avec cleanup approprié
4. **Tester la synchronisation** Supabase après chaque modification
5. **Respecter les patterns** de thème (`bg-card text-card-foreground`)
6. **Documenter les changements** dans CHANGELOG.md

### Commandes Utiles
```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier la base de données
supabase status
supabase db reset

# Tests et validation
npm run lint
npm run build
```

Ce prompt vous donne le contexte complet pour résoudre efficacement les problèmes identifiés dans l'application.