# Guide de Déploiement Vercel - À Votre Service

## 🚀 Déploiement Initial

### 1. Préparation du Projet

#### Configuration Vercel
Créez un fichier `vercel.json` à la racine du projet :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Variables d'Environnement
Configurez les variables d'environnement dans Vercel Dashboard :

1. **Variables Supabase** (si utilisées) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Variables LLM** (si utilisées) :
   - `VITE_OPENAI_API_KEY`
   - `VITE_ANTHROPIC_API_KEY`
   - `VITE_GOOGLE_API_KEY`

3. **Variables Stripe** (si utilisées) :
   - `VITE_STRIPE_PUBLISHABLE_KEY`

### 2. Optimisations de Build

#### Package.json - Scripts Optimisés
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html"
  }
}
```

#### Vite Config - Optimisations Production
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

## 🔧 Meilleures Pratiques

### 1. Performance

#### Code Splitting
- Utilisez `React.lazy()` pour les composants lourds
- Implémentez le lazy loading pour les routes
- Optimisez les imports avec tree-shaking

#### Images
- Utilisez des formats modernes (WebP, AVIF)
- Implémentez le lazy loading des images
- Optimisez les tailles d'images

### 2. SEO et Métadonnées

#### Meta Tags dans index.html
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Collection d'outils utiles : convertisseurs, calculatrices, outils de productivité" />
  <meta name="keywords" content="outils, convertisseurs, calculatrices, productivité" />
  <meta property="og:title" content="À Votre Service - Outils Utiles" />
  <meta property="og:description" content="Une collection d'outils utiles pour votre quotidien" />
  <meta property="og:type" content="website" />
  <title>À Votre Service</title>
</head>
```

### 3. Sécurité

#### Headers de Sécurité
Ajoutez dans `vercel.json` :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🚀 Déploiement Automatique

### 1. Configuration Git

#### .gitignore Optimisé
```gitignore
# Production
dist/
build/

# Environment
.env
.env.local
.env.production

# Dependencies
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel
```

### 2. Workflow GitHub Actions (Optionnel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📊 Monitoring et Analytics

### 1. Vercel Analytics
Activez Vercel Analytics dans le dashboard pour :
- Métriques de performance
- Données d'utilisation
- Core Web Vitals

### 2. Error Monitoring
Intégrez Sentry ou similaire :

```typescript
// src/utils/errorReporting.ts
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production'
  })
}
```

## 🔍 Debugging et Troubleshooting

### Problèmes Courants

1. **Build Failures**
   - Vérifiez les types TypeScript
   - Contrôlez les imports manquants
   - Validez les variables d'environnement

2. **Routing Issues**
   - Assurez-vous que `rewrites` est configuré
   - Vérifiez les routes React Router

3. **Performance Issues**
   - Analysez le bundle avec `npm run build:analyze`
   - Optimisez les imports
   - Implémentez le code splitting

### Logs Vercel
```bash
# Voir les logs de déploiement
vercel logs [deployment-url]

# Logs en temps réel
vercel logs --follow
```

## 🎯 Recommandations Spécifiques

### Pour Votre Application

1. **Optimisations Immédiates**
   - Activez la compression Gzip/Brotli (automatique sur Vercel)
   - Configurez le cache des assets statiques
   - Implémentez le preloading des routes critiques

2. **Améliorations Futures**
   - Ajoutez un Service Worker pour le cache offline
   - Implémentez Progressive Web App (PWA)
   - Configurez les Web Push Notifications

3. **Monitoring**
   - Configurez des alertes de performance
   - Surveillez les erreurs JavaScript
   - Trackez les métriques d'engagement utilisateur

## 📝 Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] `vercel.json` créé et configuré
- [ ] Build local réussi (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Meta tags SEO ajoutés
- [ ] Headers de sécurité configurés
- [ ] Analytics activées
- [ ] Domaine personnalisé configuré (si applicable)
- [ ] SSL/HTTPS activé
- [ ] Performance testée (Lighthouse)

## 🔗 Ressources Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

---

**Note** : Ce guide est spécifiquement adapté à votre application "À Votre Service". Adaptez les configurations selon vos besoins spécifiques.