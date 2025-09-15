/**
 * otherParsers.ts - Parseurs pour LastPass, KeePass, Chrome/Edge, et Dashlane
 * Gère l'import et l'export des données de ces gestionnaires de mots de passe
 */

import { PasswordEntry, PasswordParser, SupportedFormat } from './types';

/**
 * Parseur pour le format LastPass CSV
 */
export const lastPassCSVParser: PasswordParser = {
  format: 'lastpass-csv' as SupportedFormat,
  name: 'LastPass CSV',
  description: 'Format CSV exporté depuis LastPass',
  fileExtensions: ['.csv'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) return false;
      
      const headers = lines[0].toLowerCase();
      return headers.includes('url') && 
             headers.includes('username') && 
             headers.includes('password') &&
             headers.includes('name');
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

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        siteName: rowData.name || '',
        siteUrl: rowData.url || '',
        username: rowData.username || '',
        password: rowData.password || '',
        notes: rowData.extra || rowData.notes || '',
        category: rowData.grouping || rowData.folder || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password),
        escapeCSVField(entry.notes || ''),
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.category || ''),
        entry.isFavorite ? '1' : '0'
      ];
      csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
  }
};

/**
 * Parseur pour le format KeePass CSV
 */
export const keepassCSVParser: PasswordParser = {
  format: 'keepass-csv' as SupportedFormat,
  name: 'KeePass CSV',
  description: 'Format CSV exporté depuis KeePass',
  fileExtensions: ['.csv'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) return false;
      
      const headers = lines[0].toLowerCase();
      return headers.includes('title') && 
             headers.includes('username') && 
             headers.includes('password');
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

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        siteName: rowData.title || rowData.account || '',
        siteUrl: rowData.url || '',
        username: rowData.username || rowData['user name'] || '',
        password: rowData.password || '',
        notes: rowData.notes || '',
        category: rowData.group || rowData.folder || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = ['Account', 'Login Name', 'Password', 'Web Site', 'Comments'];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password),
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.notes || '')
      ];
      csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
  }
};

/**
 * Parseur pour le format Chrome/Edge CSV
 */
export const chromeCSVParser: PasswordParser = {
  format: 'chrome-csv' as SupportedFormat,
  name: 'Chrome/Edge CSV',
  description: 'Format CSV exporté depuis Chrome ou Edge',
  fileExtensions: ['.csv'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) return false;
      
      const headers = lines[0].toLowerCase();
      return headers.includes('name') && 
             headers.includes('url') && 
             headers.includes('username') && 
             headers.includes('password');
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

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        siteName: rowData.name || extractDomainFromUrl(rowData.url || ''),
        siteUrl: rowData.url || '',
        username: rowData.username || '',
        password: rowData.password || '',
        notes: rowData.note || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = ['name', 'url', 'username', 'password'];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password)
      ];
      csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
  }
};

/**
 * Parseur pour le format Dashlane CSV
 */
export const dashlaneCSVParser: PasswordParser = {
  format: 'dashlane-csv' as SupportedFormat,
  name: 'Dashlane CSV',
  description: 'Format CSV exporté depuis Dashlane',
  fileExtensions: ['.csv'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) return false;
      
      const headers = lines[0].toLowerCase();
      return headers.includes('title') && 
             headers.includes('url') && 
             headers.includes('username') && 
             headers.includes('password');
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

      const entry: PasswordEntry = {
        id: crypto.randomUUID(),
        siteName: rowData.title || '',
        siteUrl: rowData.url || '',
        username: rowData.username || rowData.email || '',
        password: rowData.password || '',
        notes: rowData.note || rowData.notes || '',
        category: rowData.category || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = ['title', 'url', 'username', 'password', 'note', 'category'];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password),
        escapeCSVField(entry.notes || ''),
        escapeCSVField(entry.category || '')
      ];
      csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
  }
};

/**
 * Parseur pour le format Dashlane JSON
 */
export const dashlaneJSONParser: PasswordParser = {
  format: 'dashlane-json' as SupportedFormat,
  name: 'Dashlane JSON',
  description: 'Format JSON exporté depuis Dashlane',
  fileExtensions: ['.json'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const data = JSON.parse(text);
      
      return Array.isArray(data) || (data.credentials && Array.isArray(data.credentials));
    } catch {
      return false;
    }
  },

  parse: async (content: string | ArrayBuffer): Promise<PasswordEntry[]> => {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const data = JSON.parse(text);
    const entries: PasswordEntry[] = [];

    // Dashlane peut exporter soit un array direct, soit un objet avec une propriété credentials
    const credentials = Array.isArray(data) ? data : (data.credentials || []);

    for (const item of credentials) {
      const entry: PasswordEntry = {
        id: item.id || crypto.randomUUID(),
        siteName: item.title || item.name || '',
        siteUrl: item.url || item.domain || '',
        username: item.username || item.email || '',
        password: item.password || '',
        notes: item.note || item.notes || '',
        category: item.category || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const dashlaneData = {
      credentials: entries.map(entry => ({
        id: entry.id || crypto.randomUUID(),
        title: entry.siteName,
        url: entry.siteUrl || '',
        username: entry.username,
        password: entry.password,
        note: entry.notes || '',
        category: entry.category || ''
      }))
    };

    return JSON.stringify(dashlaneData, null, 2);
  }
};

/**
 * Utilitaires partagés
 */

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

/**
 * Utilitaire pour extraire le domaine d'une URL
 */
function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Export des parseurs
export const otherParsers = {
  'lastpass-csv': lastPassCSVParser,
  'keepass-csv': keepassCSVParser,
  'chrome-csv': chromeCSVParser,
  'dashlane-csv': dashlaneCSVParser,
  'dashlane-json': dashlaneJSONParser
};