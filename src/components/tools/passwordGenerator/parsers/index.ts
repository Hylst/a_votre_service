/**
 * index.ts - Point d'entrée centralisé pour tous les parseurs de formats
 * Exporte tous les parseurs et utilitaires de gestion des formats
 */

import { PasswordParser, SupportedFormat, FormatMetadata } from './types';
import { onePasswordParsers } from './onePasswordParser';
import { bitwardenParsers } from './bitwardenParser';
import { otherParsers } from './otherParsers';

// Regroupement de tous les parseurs
export const allParsers: Record<SupportedFormat, PasswordParser> = {
  ...onePasswordParsers,
  ...bitwardenParsers,
  ...otherParsers,
  // Le parseur app-json sera ajouté plus tard
} as Record<SupportedFormat, PasswordParser>;

// Métadonnées des formats supportés
export const formatMetadata: Record<SupportedFormat, FormatMetadata> = {
  '1password-1pif': {
    name: '1Password 1PIF',
    description: 'Format natif 1Password (1Password Interchange Format)',
    fileExtensions: ['.1pif'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['1Password']
  },
  '1password-csv': {
    name: '1Password CSV',
    description: 'Format CSV exporté depuis 1Password',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['1Password', 'Excel', 'Google Sheets']
  },
  'bitwarden-json': {
    name: 'Bitwarden JSON',
    description: 'Format JSON natif de Bitwarden (export complet)',
    fileExtensions: ['.json'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['Bitwarden']
  },
  'bitwarden-csv': {
    name: 'Bitwarden CSV',
    description: 'Format CSV exporté depuis Bitwarden',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['Bitwarden', 'Excel', 'Google Sheets']
  },
  'lastpass-csv': {
    name: 'LastPass CSV',
    description: 'Format CSV exporté depuis LastPass',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['LastPass', 'Excel', 'Google Sheets']
  },
  'keepass-csv': {
    name: 'KeePass CSV',
    description: 'Format CSV exporté depuis KeePass',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['KeePass', 'Excel', 'Google Sheets']
  },
  'keepass-kdbx': {
    name: 'KeePass KDBX',
    description: 'Format de base de données KeePass (non supporté actuellement)',
    fileExtensions: ['.kdbx'],
    supportsImport: false,
    supportsExport: false,
    requiresPassword: true,
    encrypted: true,
    compatibility: ['KeePass']
  },
  'chrome-csv': {
    name: 'Chrome CSV',
    description: 'Format CSV exporté depuis Chrome',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['Chrome', 'Edge', 'Excel', 'Google Sheets']
  },
  'edge-csv': {
    name: 'Edge CSV',
    description: 'Format CSV exporté depuis Microsoft Edge (identique à Chrome)',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['Edge', 'Chrome', 'Excel', 'Google Sheets']
  },
  'dashlane-csv': {
    name: 'Dashlane CSV',
    description: 'Format CSV exporté depuis Dashlane',
    fileExtensions: ['.csv'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: false,
    compatibility: ['Dashlane', 'Excel', 'Google Sheets']
  },
  'dashlane-json': {
    name: 'Dashlane JSON',
    description: 'Format JSON exporté depuis Dashlane',
    fileExtensions: ['.json'],
    supportsImport: true,
    supportsExport: true,
    encrypted: false,
    compatibility: ['Dashlane']
  },
  'app-json': {
    name: 'Application JSON',
    description: 'Format JSON natif de l\'application',
    fileExtensions: ['.json'],
    supportsImport: true,
    supportsExport: true,
    popular: true,
    encrypted: true,
    compatibility: ['Cette application']
  }
};

/**
 * Obtient un parseur par format
 */
export function getParser(format: SupportedFormat): PasswordParser | undefined {
  return allParsers[format];
}

/**
 * Obtient les métadonnées d'un format
 */
export function getFormatMetadata(format: SupportedFormat): FormatMetadata | undefined {
  return formatMetadata[format];
}

/**
 * Détecte automatiquement le format d'un fichier basé sur son contenu
 */
export async function detectFormat(content: string | ArrayBuffer, filename?: string): Promise<SupportedFormat | null> {
  // Essayer de détecter par extension de fichier d'abord
  if (filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    // Pour les fichiers JSON, essayer de détecter le type spécifique
    if (extension === '.json') {
      try {
        const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
        const data = JSON.parse(text);
        
        // Détecter Bitwarden JSON
        if (data.encrypted !== undefined && Array.isArray(data.items)) {
          return 'bitwarden-json';
        }
        
        // Détecter Dashlane JSON
        if (data.credentials && Array.isArray(data.credentials)) {
          return 'dashlane-json';
        }
        
        // Par défaut, considérer comme format app
        return 'app-json';
      } catch {
        // Si le parsing JSON échoue, continuer avec la détection par validation
      }
    }
    
    // Pour les fichiers 1PIF
    if (extension === '.1pif') {
      return '1password-1pif';
    }
  }
  
  // Essayer chaque parseur pour voir lequel peut valider le contenu
  for (const [format, parser] of Object.entries(allParsers)) {
    try {
      if (parser.validate(content)) {
        return format as SupportedFormat;
      }
    } catch {
      // Ignorer les erreurs de validation
    }
  }
  
  return null;
}

/**
 * Obtient tous les formats supportés pour l'import
 */
export function getImportFormats(): SupportedFormat[] {
  return Object.keys(formatMetadata)
    .filter(format => formatMetadata[format as SupportedFormat].supportsImport)
    .map(format => format as SupportedFormat);
}

/**
 * Obtient tous les formats supportés pour l'export
 */
export function getExportFormats(): SupportedFormat[] {
  return Object.keys(formatMetadata)
    .filter(format => formatMetadata[format as SupportedFormat].supportsExport)
    .map(format => format as SupportedFormat);
}

/**
 * Obtient les formats populaires
 */
export function getPopularFormats(): SupportedFormat[] {
  return Object.keys(formatMetadata)
    .filter(format => formatMetadata[format as SupportedFormat].popular)
    .map(format => format as SupportedFormat);
}

// Exports principaux
export * from './types';
export { onePasswordParsers } from './onePasswordParser';
export { bitwardenParsers } from './bitwardenParser';
export { otherParsers } from './otherParsers';