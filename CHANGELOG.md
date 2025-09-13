# Changelog

## [2025-01-13] - CRITICAL SECURITY FIX: API Keys Hardcoded Removal

### 🚨 URGENT SECURITY PATCH

#### Problème de Sécurité Résolu
- **Suppression complète des clés API hardcodées** exposées publiquement sur GitHub
- **Clé API Google compromise** : `` supprimée de tous les fichiers
- **Mise en conformité sécuritaire** : L'application utilise désormais exclusivement les clés API saisies par l'utilisateur

#### Actions Correctives Effectuées

##### Suppression des Clés API Hardcodées
- **Fichier `debug-gemini-setup.js`** : Supprimé complètement (contenait une clé API hardcodée)
- **Fichier `useLLMManager.ts`** : Suppression des clés API hardcodées aux lignes 99 et 185
  - Remplacement du fallback provider par des messages d'erreur appropriés
  - Ajout de toasts informatifs pour guider l'utilisateur vers les paramètres
- **Fichier `.env`** : Suppression de toutes les clés API hardcodées
  - Variables `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `VITE_GOOGLE_API_KEY`, `VITE_GEMINI_API_KEY`

##### Amélioration de la Sécurité
- **Mise à jour `.gitignore`** : Ajout de protection pour les fichiers sensibles
  - `.env`, `.env.local`, `.env.*.local`
  - Fichiers de clés (`*.key`, `*.pem`, `*.p12`, `*.pfx`)
  - Dossiers et fichiers de credentials (`secrets/`, `api-keys.json`, `credentials.json`)
- **Création `.env.example`** : Template avec valeurs placeholder pour les développeurs
  - Documentation des variables d'environnement requises
  - Instructions pour obtenir les clés API des différents fournisseurs

##### Vérification du Code
- **Audit complet** : Recherche exhaustive de toutes les occurrences de clés API hardcodées
- **Validation** : Confirmation que l'application utilise uniquement les clés saisies par l'utilisateur
- **Interface utilisateur** : Vérification que le composant `LLMSettings` permet la saisie sécurisée des clés API

#### Impact Sécuritaire
- **AVANT** : Clés API exposées publiquement sur GitHub, risque d'utilisation malveillante
- **APRÈS** : Aucune clé API dans le code source, sécurité renforcée
- **Utilisateurs** : Doivent maintenant configurer leurs propres clés API via l'interface de paramètres

#### Recommandations Post-Correctif
1. **Révocation immédiate** de la clé API compromise ``
2. **Génération de nouvelles clés** pour tous les services LLM utilisés
3. **Configuration utilisateur** : Saisir les nouvelles clés via Paramètres > Configuration LLM
4. **Surveillance** : Monitoring des accès API pour détecter toute utilisation non autorisée

### 📁 Fichiers Modifiés/Supprimés

#### Fichiers Supprimés
- `debug-gemini-setup.js` - Contenait une clé API hardcodée

#### Fichiers Modifiés
- `src/components/tools/productivity/hooks/useLLMManager.ts` - Suppression clés API hardcodées
- `.env` - Nettoyage complet des clés API
- `.gitignore` - Ajout protection fichiers sensibles

#### Fichiers Créés
- `.env.example` - Template sécurisé pour les développeurs

---

## [2025-01-13] - SEO & Sitemap Implementation

### ✅ Done

#### SEO Meta Tags & Schema.org
- **Created SEOHead component** (`src/components/SEOHead.tsx`)
  - Dynamic meta tags based on current route
  - Schema.org structured data support (WebSite, WebApplication, BreadcrumbList)
  - Tool-specific and category-specific SEO optimization
  - Open Graph and Twitter Card meta tags
  - Automatic title and description generation

- **Integrated SEO component** with existing routing system
  - Added SEOHead component to main App.tsx
  - Automatic SEO updates on route changes
  - Maintains existing theming and architecture

#### XML Sitemap Generation
- **Created sitemap generation utility** (`src/utils/sitemapGenerator.ts`)
  - TypeScript-based SitemapGenerator class
  - Automatic tool and category detection
  - Support for both single and separate category sitemaps
  - Configurable priorities and change frequencies

- **Created sitemap build script** (`scripts/generate-sitemap.cjs`)
  - Node.js CommonJS script for build process
  - Command-line interface with options (--separate, --verbose, --help)
  - Environment variable support (VITE_APP_URL, SITEMAP_OUTPUT_DIR)
  - Automatic robots.txt generation
  - Error handling and validation

- **Updated build configuration**
  - Added sitemap generation scripts to package.json
  - Integrated sitemap generation into build process
  - Support for separate category sitemaps
  - Verbose logging option for debugging

#### Testing & Validation
- **Tested sitemap generation**
  - Successfully generates sitemap.xml with 11 detected tools/pages
  - Creates proper robots.txt with sitemap reference
  - Supports separate category-based sitemaps (5 files generated)
  - Validates XML structure and SEO best practices

- **Tested development server**
  - SEO component loads without errors
  - Dynamic meta tags functionality verified
  - Maintains existing application functionality

### 📁 Files Created/Modified

#### New Files
- `src/components/SEOHead.tsx` - Dynamic SEO meta tags component
- `src/utils/sitemapGenerator.ts` - Sitemap generation utility
- `scripts/generate-sitemap.cjs` - Build script for sitemap generation
- `public/sitemap.xml` - Generated XML sitemap
- `public/robots.txt` - Generated robots.txt file

#### Modified Files
- `src/App.tsx` - Integrated SEOHead component
- `package.json` - Added sitemap generation scripts

### 🚀 Features Implemented

1. **Dynamic Meta Tags**
   - Route-specific titles and descriptions
   - Schema.org structured data (JSON-LD)
   - Open Graph and Twitter Card support
   - Automatic tool categorization

2. **XML Sitemap Generation**
   - Automatic tool detection from routing
   - Configurable priorities and change frequencies
   - Support for single or category-separated sitemaps
   - Robots.txt generation with sitemap reference

3. **Build Process Integration**
   - Automated sitemap generation during build
   - Environment variable configuration
   - Command-line options for different use cases
   - Error handling and validation

### 🎯 SEO Benefits

- **Improved Search Engine Visibility**
  - Structured data helps search engines understand content
  - Proper meta tags improve click-through rates
  - XML sitemap ensures all pages are discoverable

- **Enhanced Social Media Sharing**
  - Open Graph tags for better Facebook/LinkedIn previews
  - Twitter Card support for rich Twitter previews
  - Dynamic descriptions based on tool functionality

- **Technical SEO Compliance**
  - Valid XML sitemap format
  - Proper robots.txt configuration
  - Schema.org markup for rich snippets

### 📋 To Do

- Monitor search engine indexing performance
- Consider adding more specific Schema.org types for individual tools
- Implement sitemap submission to search engines
- Add analytics tracking for SEO performance