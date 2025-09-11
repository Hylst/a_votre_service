# Test de l'intégration Gemini avec l'outil AI Coach

## Objectif
Tester l'API Gemini avec les nouveaux logs de débogage dans l'outil AI Coach.

## Étapes de test

### 1. Accéder à l'outil AI Coach
1. Ouvrir l'application sur http://localhost:5173/
2. Dans la barre latérale, cliquer sur "Carrière/Pro" (icône Briefcase)
3. Dans les onglets de la CareerSuite, cliquer sur "Coach IA" (icône BrainCircuit)

### 2. Tester l'analyse de profil
1. Remplir le formulaire d'évaluation de profil :
   - Nom : "Test User"
   - Poste actuel : "Développeur"
   - Expérience : "5 ans"
   - Compétences : "JavaScript, React, Node.js"
   - Objectifs : "Devenir Tech Lead"
2. Cliquer sur "Analyser mon profil"
3. Observer les logs dans la console du navigateur (F12)

### 3. Logs attendus
Avec les améliorations apportées, vous devriez voir :
- 🟢 [callGoogle] Starting Google/Gemini API call
- 🟢 [callGoogle] Request details (modèle, longueur du prompt, clé API)
- 🟢 [callGoogle] Request body prepared
- 🟢 [callGoogle] Response received (status, headers)
- ✅ [callGoogle] Success (candidats, contenu, usage)
- 🟢 [callGoogle] Extracted text length

### 4. En cas d'erreur
Les logs d'erreur incluront maintenant :
- ❌ [callGoogle] API error response (détails complets)
- ❌ [callGoogle] Network or parsing error (stack trace)

## Configuration requise
- Clé API Gemini configurée : AIzaSyDSyFgKU1Y4J2soMMRQZMKFazQmci_Mq0k
- Serveur de développement en cours d'exécution sur le port 5173

## Améliorations apportées
1. Logs détaillés dans la fonction callGoogle similaires aux autres providers
2. Gestion d'erreur améliorée avec détails complets
3. Logs de succès avec informations sur la réponse
4. Gestion des erreurs réseau et de parsing