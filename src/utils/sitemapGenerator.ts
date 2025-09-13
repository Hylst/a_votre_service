/**
 * sitemapGenerator.ts - Automatic XML sitemap generation utility
 * Generates comprehensive sitemaps with automatic tool and category detection
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface ToolInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

class SitemapGenerator {
  private baseUrl: string;
  private outputDir: string;
  private tools: ToolInfo[];
  private staticPages: SitemapUrl[];
  
  constructor(baseUrl: string = 'https://avotreservice.com', outputDir: string = './public') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.outputDir = outputDir;
    this.tools = this.getToolsData();
    this.staticPages = this.getStaticPages();
  }
  
  /**
   * Get comprehensive tools data with categories and metadata
   */
  private getToolsData(): ToolInfo[] {
    return [
      // Convertisseurs d'Unités
      {
        id: 'unit-converter',
        name: 'Convertisseurs d\'Unités',
        category: 'Convertisseurs',
        description: 'Convertisseurs d\'unités complets pour longueur, poids, température, volume et plus',
        keywords: ['convertisseur', 'unités', 'mesures', 'conversion', 'métrique', 'impérial'],
        priority: 0.9,
        changefreq: 'weekly'
      },
      
      // Calculatrices
      {
        id: 'calculator',
        name: 'Calculatrices Avancées',
        category: 'Calculatrices',
        description: 'Suite complète de calculatrices scientifique, graphique et programmeur',
        keywords: ['calculatrice', 'scientifique', 'graphique', 'programmeur', 'mathématiques'],
        priority: 0.9,
        changefreq: 'weekly'
      },
      
      // Dates & Temps
      {
        id: 'date-calculator-advanced',
        name: 'Calculateur de Dates Avancé',
        category: 'Dates & Temps',
        description: 'Outils de calcul de dates, fuseaux horaires et planification temporelle',
        keywords: ['dates', 'temps', 'fuseaux horaires', 'calendrier', 'planification'],
        priority: 0.8,
        changefreq: 'weekly'
      },
      
      // Productivité
      {
        id: 'productivity-suite',
        name: 'Suite de Productivité',
        category: 'Productivité',
        description: 'Outils de gestion de tâches, notes et organisation personnelle',
        keywords: ['productivité', 'tâches', 'notes', 'organisation', 'GTD', 'planification'],
        priority: 0.8,
        changefreq: 'daily'
      },
      
      // Sécurité
      {
        id: 'password-generator-advanced',
        name: 'Générateur de Mots de Passe',
        category: 'Sécurité',
        description: 'Générateur de mots de passe ultra-sécurisés avec options avancées',
        keywords: ['mot de passe', 'sécurité', 'cryptographie', 'authentification'],
        priority: 0.8,
        changefreq: 'monthly'
      },
      
      // Créativité
      {
        id: 'color-generator',
        name: 'Outils de Créativité',
        category: 'Créativité',
        description: 'Générateur de couleurs, palettes et outils de design créatif',
        keywords: ['couleurs', 'palette', 'design', 'créativité', 'hex', 'rgb'],
        priority: 0.7,
        changefreq: 'weekly'
      },
      
      // Carrière
      {
        id: 'career-generator',
        name: 'Outils Carrière',
        category: 'Carrière',
        description: 'Outils professionnels pour CV, lettres de motivation et développement de carrière',
        keywords: ['carrière', 'CV', 'lettre motivation', 'professionnel', 'emploi'],
        priority: 0.7,
        changefreq: 'weekly'
      },
      
      // Santé
      {
        id: 'health-wellness-suite',
        name: 'Suite Santé et Bien-être',
        category: 'Santé',
        description: 'Outils de santé complets : IMC, calories, nutrition et fitness',
        keywords: ['santé', 'IMC', 'calories', 'nutrition', 'fitness', 'bien-être'],
        priority: 0.7,
        changefreq: 'weekly'
      },
      
      // Outils Texte
      {
        id: 'text-utils-advanced',
        name: 'Outils Texte Avancés',
        category: 'Texte',
        description: 'Suite complète d\'outils de manipulation et analyse de texte',
        keywords: ['texte', 'formatage', 'regex', 'encodage', 'transformation'],
        priority: 0.7,
        changefreq: 'weekly'
      },
      
      // Gestion de Données
      {
        id: 'data-manager',
        name: 'Gestionnaire de Données',
        category: 'Données',
        description: 'Gestion, export et import de toutes vos données d\'outils',
        keywords: ['données', 'export', 'import', 'sauvegarde', 'synchronisation'],
        priority: 0.6,
        changefreq: 'monthly'
      }
    ];
  }
  
  /**
   * Get static pages configuration
   */
  private getStaticPages(): SitemapUrl[] {
    const now = new Date().toISOString();
    
    return [
      {
        loc: `${this.baseUrl}/`,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/auth`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/settings`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        loc: `${this.baseUrl}/universal-data-manager`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      }
    ];
  }
  
  /**
   * Generate tool URLs from tools data
   */
  private generateToolUrls(): SitemapUrl[] {
    const now = new Date().toISOString();
    
    return this.tools.map(tool => ({
      loc: `${this.baseUrl}/?section=${tool.id}`,
      lastmod: now,
      changefreq: tool.changefreq,
      priority: tool.priority
    }));
  }
  
  /**
   * Generate category URLs
   */
  private generateCategoryUrls(): SitemapUrl[] {
    const now = new Date().toISOString();
    const categories = [...new Set(this.tools.map(tool => tool.category))];
    
    return categories.map(category => ({
      loc: `${this.baseUrl}/?category=${encodeURIComponent(category)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    }));
  }
  
  /**
   * Generate XML sitemap content
   */
  private generateSitemapXML(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';
    
    const urlEntries = urls.map(url => {
      let entry = '  <url>\n';
      entry += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
      
      if (url.lastmod) {
        entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      
      entry += '  </url>';
      return entry;
    }).join('\n');
    
    return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
  }
  
  /**
   * Generate sitemap index XML for multiple sitemaps
   */
  private generateSitemapIndexXML(sitemaps: string[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const indexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const indexClose = '</sitemapindex>';
    const now = new Date().toISOString();
    
    const sitemapEntries = sitemaps.map(sitemap => {
      return `  <sitemap>\n    <loc>${this.baseUrl}/${sitemap}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`;
    }).join('\n');
    
    return `${xmlHeader}\n${indexOpen}\n${sitemapEntries}\n${indexClose}`;
  }
  
  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Generate main sitemap with all URLs
   */
  public generateMainSitemap(): void {
    this.ensureOutputDir();
    
    const allUrls = [
      ...this.staticPages,
      ...this.generateToolUrls(),
      ...this.generateCategoryUrls()
    ];
    
    // Sort URLs by priority (descending) and then by URL
    allUrls.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.loc.localeCompare(b.loc);
    });
    
    const sitemapXML = this.generateSitemapXML(allUrls);
    const sitemapPath = join(this.outputDir, 'sitemap.xml');
    
    writeFileSync(sitemapPath, sitemapXML, 'utf-8');
    console.log(`✅ Main sitemap generated: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${allUrls.length}`);
  }
  
  /**
   * Generate separate sitemaps for different content types
   */
  public generateSeparateSitemaps(): void {
    this.ensureOutputDir();
    
    const sitemaps: string[] = [];
    
    // Main pages sitemap
    const mainSitemapXML = this.generateSitemapXML(this.staticPages);
    const mainSitemapPath = join(this.outputDir, 'sitemap-main.xml');
    writeFileSync(mainSitemapPath, mainSitemapXML, 'utf-8');
    sitemaps.push('sitemap-main.xml');
    
    // Tools sitemap
    const toolUrls = this.generateToolUrls();
    const toolsSitemapXML = this.generateSitemapXML(toolUrls);
    const toolsSitemapPath = join(this.outputDir, 'sitemap-tools.xml');
    writeFileSync(toolsSitemapPath, toolsSitemapXML, 'utf-8');
    sitemaps.push('sitemap-tools.xml');
    
    // Categories sitemap
    const categoryUrls = this.generateCategoryUrls();
    const categoriesSitemapXML = this.generateSitemapXML(categoryUrls);
    const categoriesSitemapPath = join(this.outputDir, 'sitemap-categories.xml');
    writeFileSync(categoriesSitemapPath, categoriesSitemapXML, 'utf-8');
    sitemaps.push('sitemap-categories.xml');
    
    // Generate sitemap index
    const sitemapIndexXML = this.generateSitemapIndexXML(sitemaps);
    const sitemapIndexPath = join(this.outputDir, 'sitemap.xml');
    writeFileSync(sitemapIndexPath, sitemapIndexXML, 'utf-8');
    
    console.log(`✅ Separate sitemaps generated:`);
    console.log(`   - Main pages: ${this.staticPages.length} URLs`);
    console.log(`   - Tools: ${toolUrls.length} URLs`);
    console.log(`   - Categories: ${categoryUrls.length} URLs`);
    console.log(`   - Sitemap index: ${sitemapIndexPath}`);
  }
  
  /**
   * Generate robots.txt file
   */
  public generateRobotsTxt(): void {
    this.ensureOutputDir();
    
    const robotsContent = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?debug=*

# Allow important resources
Allow: /assets/
Allow: /images/
Allow: /css/
Allow: /js/`;
    
    const robotsPath = join(this.outputDir, 'robots.txt');
    writeFileSync(robotsPath, robotsContent, 'utf-8');
    
    console.log(`✅ Robots.txt generated: ${robotsPath}`);
  }
  
  /**
   * Get tools statistics for reporting
   */
  public getToolsStats(): { totalTools: number; categories: string[]; toolsByCategory: Record<string, number> } {
    const categories = [...new Set(this.tools.map(tool => tool.category))];
    const toolsByCategory: Record<string, number> = {};
    
    categories.forEach(category => {
      toolsByCategory[category] = this.tools.filter(tool => tool.category === category).length;
    });
    
    return {
      totalTools: this.tools.length,
      categories,
      toolsByCategory
    };
  }
  
  /**
   * Generate all SEO files (sitemap, robots.txt)
   */
  public generateAll(separateSitemaps: boolean = false): void {
    console.log('🚀 Starting sitemap generation...');
    
    if (separateSitemaps) {
      this.generateSeparateSitemaps();
    } else {
      this.generateMainSitemap();
    }
    
    this.generateRobotsTxt();
    
    const stats = this.getToolsStats();
    console.log('\n📈 Generation Summary:');
    console.log(`   - Total tools: ${stats.totalTools}`);
    console.log(`   - Categories: ${stats.categories.length}`);
    console.log(`   - Tools by category:`);
    Object.entries(stats.toolsByCategory).forEach(([category, count]) => {
      console.log(`     * ${category}: ${count} tools`);
    });
    
    console.log('\n✅ Sitemap generation completed!');
  }
}

export { SitemapGenerator, type ToolInfo, type SitemapUrl };
export default SitemapGenerator;