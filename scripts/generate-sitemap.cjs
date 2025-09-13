/**
 * generate-sitemap.js
 * Script to generate XML sitemap and robots.txt for the application
 */

const fs = require('fs');
const path = require('path');

// Simple sitemap generator without TypeScript dependencies
class SimpleSitemapGenerator {
  constructor(baseUrl, outputDir) {
    this.baseUrl = baseUrl;
    this.outputDir = outputDir;
  }

  // Detect tools from the Index.tsx file
  detectTools() {
    const indexPath = path.join(__dirname, '../src/pages/Index.tsx');
    if (!fs.existsSync(indexPath)) {
      console.warn('Index.tsx not found, using default tools');
      return this.getDefaultTools();
    }

    const content = fs.readFileSync(indexPath, 'utf8');
    const tools = [];

    // Extract tool sections from renderContent function
    const toolPatterns = [
      /case 'unit-converter'/g,
      /case 'calculator'/g,
      /case 'date-calculator-advanced'/g,
      /case 'text-tools'/g,
      /case 'image-tools'/g,
      /case 'developer-tools'/g,
      /case 'finance-tools'/g,
      /case 'productivity-tools'/g,
      /case 'conversion-tools'/g,
      /case 'utility-tools'/g
    ];

    toolPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const toolName = match.replace("case '", '').replace("'", '');
          tools.push({
            path: `/${toolName}`,
            name: this.formatToolName(toolName),
            category: this.getCategoryFromTool(toolName),
            priority: 0.8,
            changefreq: 'weekly'
          });
        });
      }
    });

    return tools.length > 0 ? tools : this.getDefaultTools();
  }

  getDefaultTools() {
    return [
      { path: '/', name: 'Accueil', category: 'main', priority: 1.0, changefreq: 'daily' },
      { path: '/unit-converter', name: 'Convertisseur d\'Unités', category: 'converter', priority: 0.9, changefreq: 'weekly' },
      { path: '/calculator', name: 'Calculatrice', category: 'calculator', priority: 0.9, changefreq: 'weekly' },
      { path: '/date-calculator-advanced', name: 'Calculatrice de Dates', category: 'calculator', priority: 0.8, changefreq: 'weekly' },
      { path: '/text-tools', name: 'Outils Texte', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/image-tools', name: 'Outils Image', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/developer-tools', name: 'Outils Développeur', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/finance-tools', name: 'Outils Finance', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/productivity-tools', name: 'Outils Productivité', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/conversion-tools', name: 'Outils Conversion', category: 'tools', priority: 0.8, changefreq: 'weekly' },
      { path: '/utility-tools', name: 'Outils Utilitaires', category: 'tools', priority: 0.8, changefreq: 'weekly' }
    ];
  }

  formatToolName(toolName) {
    return toolName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getCategoryFromTool(toolName) {
    if (toolName.includes('converter') || toolName.includes('conversion')) return 'converter';
    if (toolName.includes('calculator')) return 'calculator';
    if (toolName.includes('tools')) return 'tools';
    return 'utility';
  }

  generateXMLSitemap(tools, separate = false) {
    if (separate) {
      return this.generateSeparateSitemaps(tools);
    }

    const urls = tools.map(tool => {
      const lastmod = new Date().toISOString().split('T')[0];
      return `  <url>
    <loc>${this.baseUrl}${tool.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  generateSeparateSitemaps(tools) {
    const categories = {};
    tools.forEach(tool => {
      if (!categories[tool.category]) {
        categories[tool.category] = [];
      }
      categories[tool.category].push(tool);
    });

    const sitemaps = {};
    Object.keys(categories).forEach(category => {
      sitemaps[`sitemap-${category}.xml`] = this.generateXMLSitemap(categories[category]);
    });

    // Generate sitemap index
    const sitemapIndex = Object.keys(sitemaps).map(filename => {
      const lastmod = new Date().toISOString().split('T')[0];
      return `  <sitemap>
    <loc>${this.baseUrl}/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    }).join('\n');

    sitemaps['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndex}
</sitemapindex>`;

    return sitemaps;
  }

  generateRobotsTxt() {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml`;
  }

  async generate(options = {}) {
    const { separate = false, verbose = false } = options;
    
    if (verbose) {
      console.log('🚀 Starting sitemap generation...');
      console.log(`📍 Base URL: ${this.baseUrl}`);
      console.log(`📁 Output directory: ${this.outputDir}`);
    }

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Detect tools
    const tools = this.detectTools();
    if (verbose) {
      console.log(`🔍 Detected ${tools.length} tools/pages`);
    }

    // Generate sitemaps
    const sitemaps = separate ? 
      this.generateSeparateSitemaps(tools) : 
      { 'sitemap.xml': this.generateXMLSitemap(tools) };

    // Write sitemap files
    Object.keys(sitemaps).forEach(filename => {
      const filepath = path.join(this.outputDir, filename);
      fs.writeFileSync(filepath, sitemaps[filename]);
      if (verbose) {
        console.log(`✅ Generated: ${filename}`);
      }
    });

    // Generate robots.txt
    const robotsPath = path.join(this.outputDir, 'robots.txt');
    fs.writeFileSync(robotsPath, this.generateRobotsTxt());
    if (verbose) {
      console.log('✅ Generated: robots.txt');
    }

    return {
      sitemapsGenerated: Object.keys(sitemaps).length,
      toolsDetected: tools.length,
      outputDir: this.outputDir
    };
  }
}

const scriptDir = path.dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.VITE_APP_URL || 'https://a-votre-service.vercel.app',
  outputDir: process.env.SITEMAP_OUTPUT_DIR || path.join(scriptDir, '../public')
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  separate: args.includes('--separate'),
  verbose: args.includes('--verbose'),
  help: args.includes('--help')
};

// Show help
if (options.help) {
  console.log(`
Sitemap Generator

Usage: node generate-sitemap.js [options]

Options:
  --separate    Generate separate sitemaps by category
  --verbose     Show detailed output
  --help        Show this help message

Environment Variables:
  VITE_APP_URL           Base URL for the sitemap (default: https://a-votre-service.vercel.app)
  SITEMAP_OUTPUT_DIR     Output directory for generated files (default: ../public)
`);
  process.exit(0);
}

// Validate configuration
if (!config.baseUrl) {
  console.error('❌ Error: Base URL is required. Set VITE_APP_URL environment variable.');
  process.exit(1);
}

// Main execution
async function main() {
  try {
    const generator = new SimpleSitemapGenerator(config.baseUrl, config.outputDir);
    const result = await generator.generate(options);
    
    console.log('\n🎉 Sitemap generation completed successfully!');
    console.log(`📊 Generated ${result.sitemapsGenerated} sitemap file(s)`);
    console.log(`🔧 Detected ${result.toolsDetected} tools/pages`);
    console.log(`📁 Output directory: ${result.outputDir}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { SimpleSitemapGenerator };