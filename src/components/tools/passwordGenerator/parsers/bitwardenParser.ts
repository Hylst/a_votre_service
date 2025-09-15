/**
 * bitwardenParser.ts - Parseur pour les formats Bitwarden (.json, .csv)
 * Gère l'import et l'export des données Bitwarden
 */

import { PasswordEntry, PasswordParser, SupportedFormat } from './types';

// Interface pour les données Bitwarden JSON
interface BitwardenJSONExport {
  encrypted: boolean;
  folders: Array<{
    id: string;
    name: string;
  }>;
  items: BitwardenItem[];
}

interface BitwardenItem {
  id: string;
  organizationId?: string;
  folderId?: string;
  type: number; // 1 = Login, 2 = Secure Note, 3 = Card, 4 = Identity
  reprompt: number;
  name: string;
  notes?: string;
  favorite: boolean;
  login?: {
    username?: string;
    password?: string;
    totp?: string;
    uris?: Array<{
      match?: number;
      uri: string;
    }>;
  };
  collectionIds?: string[];
  revisionDate: string;
  creationDate: string;
}

// Interface pour les données Bitwarden CSV
interface BitwardenCSVEntry {
  folder: string;
  favorite: string;
  type: string;
  name: string;
  notes: string;
  fields: string;
  reprompt: string;
  login_uri: string;
  login_username: string;
  login_password: string;
  login_totp: string;
}

/**
 * Parseur pour le format Bitwarden JSON
 */
export const bitwardenJSONParser: PasswordParser = {
  format: 'bitwarden-json' as SupportedFormat,
  name: 'Bitwarden JSON',
  description: 'Format JSON natif de Bitwarden (export complet)',
  fileExtensions: ['.json'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const data = JSON.parse(text) as BitwardenJSONExport;
      
      return (
        typeof data === 'object' &&
        Array.isArray(data.items) &&
        typeof data.encrypted === 'boolean'
      );
    } catch {
      return false;
    }
  },

  parse: async (content: string | ArrayBuffer): Promise<PasswordEntry[]> => {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const data = JSON.parse(text) as BitwardenJSONExport;
    const entries: PasswordEntry[] = [];

    // Créer un map des dossiers pour la résolution des noms
    const folderMap = new Map<string, string>();
    if (data.folders) {
      data.folders.forEach(folder => {
        folderMap.set(folder.id, folder.name);
      });
    }

    for (const item of data.items) {
      // Filtrer seulement les entrées de type Login (type = 1)
      if (item.type !== 1 || !item.login) continue;

      const entry: PasswordEntry = {
        id: item.id,
        siteName: item.name,
        siteUrl: '',
        username: item.login.username || '',
        password: item.login.password || '',
        notes: item.notes || '',
        category: item.folderId ? folderMap.get(item.folderId) : undefined,
        isFavorite: item.favorite,
        createdAt: new Date(item.creationDate),
        updatedAt: new Date(item.revisionDate)
      };

      // Extraire l'URL principale
      if (item.login.uris && item.login.uris.length > 0) {
        entry.siteUrl = item.login.uris[0].uri;
      }

      entries.push(entry);
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const bitwardenExport: BitwardenJSONExport = {
      encrypted: false,
      folders: [],
      items: []
    };

    // Créer les dossiers uniques
    const categories = new Set(entries.map(e => e.category).filter(Boolean));
    const folderMap = new Map<string, string>();
    
    categories.forEach(category => {
      const folderId = crypto.randomUUID();
      folderMap.set(category!, folderId);
      bitwardenExport.folders.push({
        id: folderId,
        name: category!
      });
    });

    // Convertir les entrées
    for (const entry of entries) {
      const now = new Date().toISOString();
      const item: BitwardenItem = {
        id: entry.id || crypto.randomUUID(),
        type: 1, // Login
        reprompt: 0,
        name: entry.siteName,
        notes: entry.notes,
        favorite: entry.isFavorite || false,
        login: {
          username: entry.username,
          password: entry.password,
          uris: entry.siteUrl ? [{
            match: null,
            uri: entry.siteUrl
          }] : []
        },
        revisionDate: entry.updatedAt?.toISOString() || now,
        creationDate: entry.createdAt?.toISOString() || now
      };

      if (entry.category && folderMap.has(entry.category)) {
        item.folderId = folderMap.get(entry.category);
      }

      bitwardenExport.items.push(item);
    }

    return JSON.stringify(bitwardenExport, null, 2);
  }
};

/**
 * Parseur pour le format Bitwarden CSV
 */
export const bitwardenCSVParser: PasswordParser = {
  format: 'bitwarden-csv' as SupportedFormat,
  name: 'Bitwarden CSV',
  description: 'Format CSV exporté depuis Bitwarden',
  fileExtensions: ['.csv'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) return false;
      
      const headers = lines[0].toLowerCase();
      return headers.includes('name') && 
             headers.includes('login_username') && 
             headers.includes('login_password');
    } catch {
      return false;
    }
  },

  parse: async (content: string | ArrayBuffer): Promise<PasswordEntry[]> => {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const lines = text.trim().split('\n');
    
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const entries: PasswordEntry[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header.toLowerCase()] = values[index] || '';
      });

      // Filtrer seulement les entrées de type login
      if (rowData.type && rowData.type.toLowerCase() !== 'login') continue;

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        siteName: rowData.name || '',
        siteUrl: rowData.login_uri || '',
        username: rowData.login_username || '',
        password: rowData.login_password || '',
        notes: rowData.notes || '',
        category: rowData.folder || '',
        isFavorite: rowData.favorite === '1' || rowData.favorite?.toLowerCase() === 'true'
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = [
      'folder', 'favorite', 'type', 'name', 'notes', 'fields', 'reprompt',
      'login_uri', 'login_username', 'login_password', 'login_totp'
    ];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.category || ''),
        entry.isFavorite ? '1' : '0',
        'login',
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.notes || ''),
        '', // fields
        '0', // reprompt
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password),
        '' // totp
      ];
      csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
  }
};

/**
 * Utilitaire pour parser une ligne CSV en tenant compte des guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Utilitaire pour échapper les champs CSV
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Export des parseurs
export const bitwardenParsers = {
  'bitwarden-json': bitwardenJSONParser,
  'bitwarden-csv': bitwardenCSVParser
};