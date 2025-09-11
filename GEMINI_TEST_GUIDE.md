# Guide de Test - API Gemini avec AI Coach

## Vue d'ensemble
Ce guide vous aide à tester l'intégration de l'API Gemini avec l'outil AI Coach après avoir configuré votre clé API.

## Prérequis
- Clé API Gemini configurée dans l'interface de l'application
- Serveur de développement en cours d'exécution (`npm run dev`)
- Console du navigateur ouverte (F12)

## Étapes de Test

### 1. Accéder à l'outil AI Coach
1. Ouvrir l'application dans le navigateur : `http://localhost:5173`
2. Naviguer vers la section "Outils" ou "Career Tools"
3. Cliquer sur "AI Coach" ou "Coach IA"

### 2. Données de Test à Saisir

#### Profil de Test Simple
```
Nom: Jean Dupont
Poste actuel: Développeur Frontend
Expérience: 3 ans
Compétences: React, JavaScript, CSS
Objectifs: Devenir Tech Lead
```

#### Profil de Test Complexe
```
Nom: Marie Martin
Poste actuel: Chef de Projet Digital
Expérience: 5 ans en gestion de projet, 2 ans en développement
Compétences: Scrum, Agile, Python, SQL, Leadership
Objectifs: Transition vers Data Science
Défis: Manque de connaissances en Machine Learning
Formation: Master en Informatique
```

### 3. Vérification des Logs Console

#### Ouvrir la Console
1. Appuyer sur `F12` dans le navigateur
2. Aller dans l'onglet "Console"
3. Filtrer par "Info", "Warn", et "Error"

#### Logs à Rechercher

**Logs de Succès (API Gemini fonctionnelle) :**
```
✅ [LLM Manager] Starting analysis with provider: google
✅ [LLM Manager] Profile data length: [nombre] characters
✅ [Google API] Making request to: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
✅ [Google API] Request body prepared successfully
✅ [Google API] Response status: 200
✅ [Google API] Response received successfully
✅ [AI Coach] Analysis completed successfully
```

**Logs d'Erreur (à investiguer) :**
```
❌ [Google API] Request failed with status: [code]
❌ [Google API] Error details: [message]
❌ [AI Coach] Analysis failed: [error]
❌ Network error or parsing failed: [details]
```

### 4. Réponses Attendues

#### Structure de Réponse Valide
L'API Gemini devrait retourner une analyse structurée contenant :
- **Évaluation des compétences** : Points forts et axes d'amélioration
- **Recommandations de carrière** : Étapes concrètes pour atteindre les objectifs
- **Plan de développement** : Formations et certifications suggérées
- **Opportunités** : Postes ou projets recommandés

#### Exemple de Réponse Réussie
```json
{
  "strengths": ["Expertise technique solide", "Expérience pratique"],
  "improvements": ["Leadership", "Communication"],
  "recommendations": ["Formation en management", "Certification Scrum Master"],
  "opportunities": ["Tech Lead", "Architect Solution"]
}
```

### 5. Troubleshooting

#### Erreur 401 - Unauthorized
**Cause :** Clé API invalide ou expirée
**Solution :**
1. Vérifier la clé API dans les paramètres
2. Régénérer une nouvelle clé sur Google AI Studio
3. Redémarrer l'application

#### Erreur 429 - Rate Limit
**Cause :** Trop de requêtes simultanées
**Solution :**
1. Attendre quelques minutes
2. Réessayer avec un profil plus court
3. Vérifier les quotas sur Google Cloud Console

#### Erreur 400 - Bad Request
**Cause :** Format de requête incorrect
**Solution :**
1. Vérifier les logs de préparation du body
2. S'assurer que le profil ne contient pas de caractères spéciaux
3. Réduire la taille du profil de test

#### Pas de Logs Visibles
**Cause :** Console filtrée ou logs désactivés
**Solution :**
1. Effacer les filtres de la console
2. Actualiser la page
3. Vérifier que le mode développement est activé

#### Réponse Vide ou Incomplète
**Cause :** Problème de parsing ou timeout
**Solution :**
1. Vérifier les logs de parsing
2. Tester avec un profil plus simple
3. Vérifier la connexion réseau

### 6. Tests de Performance

#### Test de Charge
1. Soumettre plusieurs profils rapidement
2. Vérifier les temps de réponse dans les logs
3. Observer les erreurs de rate limiting

#### Test de Robustesse
1. Tester avec des profils très longs (>2000 caractères)
2. Tester avec des caractères spéciaux
3. Tester avec des profils vides

### 7. Validation des Résultats

#### Critères de Succès
- ✅ Logs de requête visibles
- ✅ Status 200 de l'API
- ✅ Réponse structurée reçue
- ✅ Interface utilisateur mise à jour
- ✅ Pas d'erreurs dans la console

#### Critères d'Échec
- ❌ Erreurs 4xx ou 5xx
- ❌ Timeouts répétés
- ❌ Réponses malformées
- ❌ Interface bloquée ou non responsive

## Notes Importantes

- **Sécurité** : Ne jamais exposer la clé API dans les logs
- **Performance** : Les réponses peuvent prendre 5-15 secondes
- **Quotas** : Respecter les limites de l'API Gemini
- **Debugging** : Conserver les logs pour analyse ultérieure

## Support

En cas de problème persistant :
1. Copier les logs d'erreur complets
2. Noter les étapes de reproduction
3. Vérifier la documentation officielle Gemini API
4. Contacter l'équipe de développement avec les détails