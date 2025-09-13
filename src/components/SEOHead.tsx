/**
 * SEOHead.tsx - Dynamic SEO meta tags component with Schema.org structured data
 * Provides comprehensive SEO optimization with dynamic meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'tool' | 'calculator' | 'converter';
  toolCategory?: string;
  toolName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
}

interface StructuredDataProps {
  type: string;
  name: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  toolCategory?: string;
  applicationCategory?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  toolCategory,
  toolName,
  author = 'À Votre Service',
  publishedTime,
  modifiedTime,
  locale = 'fr_FR'
}) => {
  const location = useLocation();
  
  // Default values based on current route
  const getDefaultSEOData = () => {
    const baseUrl = window.location.origin;
    const currentUrl = url || `${baseUrl}${location.pathname}`;
    const defaultImage = `${baseUrl}/og-image.png`;
    
    const routeData: Record<string, any> = {
      '/': {
        title: 'À Votre Service - Suite d\'Outils Professionnels Tout-en-Un',
        description: 'Plus de 100 outils professionnels : convertisseurs, calculatrices, générateurs, outils de productivité et bien plus. Interface moderne avec thème sombre/clair.',
        keywords: ['outils en ligne', 'convertisseurs', 'calculatrices', 'productivité', 'générateurs', 'utilitaires web'],
        type: 'website'
      },
      '/auth': {
        title: 'Connexion - À Votre Service',
        description: 'Connectez-vous à votre compte À Votre Service pour accéder à vos outils personnalisés et sauvegarder vos données.',
        keywords: ['connexion', 'authentification', 'compte utilisateur']
      },
      '/settings': {
        title: 'Paramètres - À Votre Service',
        description: 'Personnalisez votre expérience avec À Votre Service : thème, préférences, gestion des données et plus.',
        keywords: ['paramètres', 'configuration', 'préférences', 'thème']
      },
      '/universal-data-manager': {
        title: 'Gestionnaire de Données Universel - À Votre Service',
        description: 'Gérez, exportez et importez toutes vos données d\'outils en un seul endroit. Sauvegarde et synchronisation simplifiées.',
        keywords: ['gestion données', 'export', 'import', 'sauvegarde', 'synchronisation']
      }
    };
    
    // Tool-specific SEO data
    const toolData: Record<string, any> = {
      'unit-converter': {
        title: 'Convertisseurs d\'Unités - À Votre Service',
        description: 'Convertisseurs d\'unités complets : longueur, poids, température, volume, surface, vitesse et plus. Interface intuitive et précise.',
        keywords: ['convertisseur unités', 'conversion', 'mesures', 'métrique', 'impérial'],
        type: 'tool',
        toolCategory: 'Convertisseurs',
        applicationCategory: 'UtilityApplication'
      },
      'calculator': {
        title: 'Calculatrices Avancées - À Votre Service',
        description: 'Suite complète de calculatrices : scientifique, graphique, programmeur, financière. Historique intelligent et fonctions avancées.',
        keywords: ['calculatrice', 'scientifique', 'graphique', 'programmeur', 'mathématiques'],
        type: 'calculator',
        toolCategory: 'Calculatrices',
        applicationCategory: 'UtilityApplication'
      },
      'date-calculator-advanced': {
        title: 'Calculateur de Dates Avancé - À Votre Service',
        description: 'Outils de calcul de dates complets : différences, ajouts, fuseaux horaires, calendriers et planification temporelle.',
        keywords: ['calculateur dates', 'différence dates', 'fuseaux horaires', 'calendrier', 'temps'],
        type: 'tool',
        toolCategory: 'Dates & Temps',
        applicationCategory: 'UtilityApplication'
      },
      'productivity-suite': {
        title: 'Suite de Productivité - À Votre Service',
        description: 'Outils de productivité avancés : gestion de tâches, notes, planification, suivi du temps et organisation personnelle.',
        keywords: ['productivité', 'tâches', 'notes', 'planification', 'organisation', 'GTD'],
        type: 'tool',
        toolCategory: 'Productivité',
        applicationCategory: 'ProductivityApplication'
      },
      'password-generator-advanced': {
        title: 'Générateur de Mots de Passe Sécurisés - À Votre Service',
        description: 'Générateur de mots de passe ultra-sécurisés avec options avancées, vérification de force et suggestions personnalisées.',
        keywords: ['générateur mot de passe', 'sécurité', 'cryptographie', 'authentification'],
        type: 'tool',
        toolCategory: 'Sécurité',
        applicationCategory: 'SecurityApplication'
      },
      'color-generator': {
        title: 'Outils de Créativité et Couleurs - À Votre Service',
        description: 'Suite créative complète : générateur de couleurs, palettes, codes couleurs, outils de design et inspiration visuelle.',
        keywords: ['couleurs', 'palette', 'design', 'créativité', 'hex', 'rgb', 'hsl'],
        type: 'tool',
        toolCategory: 'Créativité',
        applicationCategory: 'DesignApplication'
      },
      'career-generator': {
        title: 'Outils Carrière et Professionnel - À Votre Service',
        description: 'Outils professionnels avancés : CV, lettres de motivation, analyse de carrière, networking et développement professionnel.',
        keywords: ['carrière', 'CV', 'lettre motivation', 'professionnel', 'emploi', 'networking'],
        type: 'tool',
        toolCategory: 'Carrière',
        applicationCategory: 'BusinessApplication'
      },
      'health-wellness-suite': {
        title: 'Suite Santé et Bien-être - À Votre Service',
        description: 'Outils de santé complets : IMC, calories, nutrition, fitness, suivi médical et bien-être personnel.',
        keywords: ['santé', 'IMC', 'calories', 'nutrition', 'fitness', 'bien-être'],
        type: 'tool',
        toolCategory: 'Santé',
        applicationCategory: 'HealthApplication'
      },
      'text-utils-advanced': {
        title: 'Outils Texte Avancés - À Votre Service',
        description: 'Suite complète d\'outils texte : formatage, analyse, transformation, encodage, regex et manipulation de chaînes.',
        keywords: ['outils texte', 'formatage', 'regex', 'encodage', 'transformation', 'analyse'],
        type: 'tool',
        toolCategory: 'Texte',
        applicationCategory: 'UtilityApplication'
      }
    };
    
    // Get data based on current route or search params
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    
    if (section && toolData[section]) {
      return { ...toolData[section], currentUrl, defaultImage };
    }
    
    if (routeData[location.pathname]) {
      return { ...routeData[location.pathname], currentUrl, defaultImage };
    }
    
    return {
      title: 'À Votre Service - Outils Professionnels',
      description: 'Suite d\'outils professionnels tout-en-un pour améliorer votre productivité.',
      keywords: ['outils', 'productivité', 'utilitaires'],
      currentUrl,
      defaultImage,
      type: 'website'
    };
  };
  
  const defaultData = getDefaultSEOData();
  
  const finalTitle = title || defaultData.title;
  const finalDescription = description || defaultData.description;
  const finalKeywords = keywords.length > 0 ? keywords : defaultData.keywords;
  const finalImage = image || defaultData.defaultImage;
  const finalUrl = url || defaultData.currentUrl;
  const finalType = type || defaultData.type;
  const finalToolCategory = toolCategory || defaultData.toolCategory;
  const finalApplicationCategory = defaultData.applicationCategory;
  
  // Generate structured data
  const generateStructuredData = (): StructuredDataProps => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': finalType === 'tool' || finalType === 'calculator' || finalType === 'converter' ? 'SoftwareApplication' : 'WebSite',
      name: finalTitle,
      description: finalDescription,
      url: finalUrl,
      image: finalImage,
      author: {
        '@type': 'Organization',
        name: author,
        url: window.location.origin
      },
      publisher: {
        '@type': 'Organization',
        name: 'À Votre Service',
        url: window.location.origin,
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      },
      inLanguage: locale,
      datePublished: publishedTime || new Date().toISOString(),
      dateModified: modifiedTime || new Date().toISOString()
    };
    
    if (finalType === 'tool' || finalType === 'calculator' || finalType === 'converter') {
      return {
        ...baseData,
        '@type': 'SoftwareApplication',
        applicationCategory: finalApplicationCategory || 'UtilityApplication',
        operatingSystem: 'Web Browser',
        permissions: 'No special permissions required',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR'
        },
        featureList: finalKeywords.join(', ')
      };
    }
    
    return baseData;
  };
  
  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords.join(', '));
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', finalUrl, true);
    updateMetaTag('og:type', finalType === 'website' ? 'website' : 'article', true);
    updateMetaTag('og:site_name', 'À Votre Service', true);
    updateMetaTag('og:locale', locale, true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    updateMetaTag('twitter:site', '@avotreservice');
    updateMetaTag('twitter:creator', '@avotreservice');
    
    // Additional SEO tags
    if (finalToolCategory) {
      updateMetaTag('article:section', finalToolCategory, true);
    }
    
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);
    
    // JSON-LD Structured Data
    const structuredData = generateStructuredData();
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }
    
    jsonLd.textContent = JSON.stringify(structuredData, null, 2);
    
    // Cleanup function
    return () => {
      // Optional: Clean up meta tags when component unmounts
      // This is usually not necessary for SPA routing
    };
  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalUrl, finalType, finalToolCategory, author, publishedTime, modifiedTime, locale]);
  
  return null; // This component doesn't render anything visible
};

export default SEOHead;