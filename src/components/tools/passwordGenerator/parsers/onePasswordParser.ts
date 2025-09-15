/**
 * onePasswordParser.ts - Parseur pour les formats 1Password (.1pif, .csv)
 * Gère l'import et l'export des données 1Password
 */

import { PasswordEntry, PasswordParser, SupportedFormat } from './types';

// Interface pour les données 1Password 1PIF
interface OnePassword1PIFEntry {
  uuid: string;
  updatedAt: number;
  securityLevel: string;
  contentsHash: string;
  title: string;
  location?: string;
  secureContents?: {
    fields?: Array<{
      name: string;
      value: string;
      type: string;
      designation?: string;
    }>;
    URLs?: Array<{
      label: string;
      url: string;
    }>;
    notesPlain?: string;
  };
  typeName: string;
}

// Interface pour les données 1Password CSV
interface OnePasswordCSVEntry {
  Title: string;
  URL: string;
  Username: string;
  Password: string;
  Notes: string;
  Type: string;
}

/**
 * Parseur pour le format 1Password 1PIF
 */
export const onePassword1PIFParser: PasswordParser = {
  format: '1password-1pif' as SupportedFormat,
  name: '1Password 1PIF',
  description: 'Format natif 1Password (1Password Interchange Format)',
  fileExtensions: ['.1pif'],

  validate: (content: string | ArrayBuffer): boolean => {
    try {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      const lines = text.trim().split('\n');
      
      // Vérifier que chaque ligne est un JSON valide avec les propriétés 1Password
      for (const line of lines) {
        if (line.trim()) {
          const entry = JSON.parse(line) as OnePassword1PIFEntry;
          if (!entry.uuid || !entry.title || !entry.typeName) {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  parse: async (content: string | ArrayBuffer): Promise<PasswordEntry[]> => {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const lines = text.trim().split('\n');
    const entries: PasswordEntry[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const entry = JSON.parse(line) as OnePassword1PIFEntry;
        
        // Filtrer seulement les entrées de type Login
        if (entry.typeName !== 'webforms.WebForm') continue;

        const passwordEntry: PasswordEntry = {
          id: entry.uuid,
          siteName: entry.title,
          siteUrl: entry.location || '',
          username: '',
          password: '',
          notes: entry.secureContents?.notesPlain || '',
          createdAt: new Date(entry.updatedAt * 1000),
          updatedAt: new Date(entry.updatedAt * 1000)
        };

        // Extraire les champs sécurisés
        if (entry.secureContents?.fields) {
          for (const field of entry.secureContents.fields) {
            switch (field.designation || field.name.toLowerCase()) {
              case 'username':
              case 'email':
                passwordEntry.username = field.value;
                break;
              case 'password':
                passwordEntry.password = field.value;
                break;
            }
          }
        }

        // Extraire l'URL si disponible
        if (entry.secureContents?.URLs && entry.secureContents.URLs.length > 0) {
          passwordEntry.siteUrl = entry.secureContents.URLs[0].url;
        }

        entries.push(passwordEntry);
      } catch (error) {
        console.warn('Erreur lors du parsing d\'une entrée 1PIF:', error);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const lines: string[] = [];

    for (const entry of entries) {
      const onePasswordEntry: OnePassword1PIFEntry = {
        uuid: entry.id || crypto.randomUUID(),
        updatedAt: Math.floor((entry.updatedAt || new Date()).getTime() / 1000),
        securityLevel: 'SL5',
        contentsHash: '',
        title: entry.siteName,
        location: entry.siteUrl || '',
        typeName: 'webforms.WebForm',
        secureContents: {
          fields: [
            {
              name: 'username',
              value: entry.username,
              type: 'T',
              designation: 'username'
            },
            {
              name: 'password',
              value: entry.password,
              type: 'P',
              designation: 'password'
            }
          ],
          URLs: entry.siteUrl ? [{
            label: 'website',
            url: entry.siteUrl
          }] : [],
          notesPlain: entry.notes || ''
        }
      };

      lines.push(JSON.stringify(onePasswordEntry));
    }

    return lines.join('\n');
  }
};

/**
 * Parseur pour le format 1Password CSV
 */
export const onePasswordCSVParser: PasswordParser = {
  format: '1password-csv' as SupportedFormat,
  name: '1Password CSV',
  description: 'Format CSV exporté depuis 1Password',
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
        siteName: rowData.title || rowData.name || '',
        siteUrl: rowData.url || rowData.website || '',
        username: rowData.username || rowData.email || '',
        password: rowData.password || '',
        notes: rowData.notes || '',
        category: rowData.type || rowData.category || ''
      };

      if (entry.siteName && entry.password) {
        entries.push(entry);
      }
    }

    return entries;
  },

  export: async (entries: PasswordEntry[]): Promise<string> => {
    const headers = ['Title', 'URL', 'Username', 'Password', 'Notes', 'Type'];
    const csvLines = [headers.join(',')];

    for (const entry of entries) {
      const row = [
        escapeCSVField(entry.siteName),
        escapeCSVField(entry.siteUrl || ''),
        escapeCSVField(entry.username),
        escapeCSVField(entry.password),
        escapeCSVField(entry.notes || ''),
        escapeCSVField(entry.category || 'Login')
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
export const onePasswordParsers = {
  '1password-1pif': onePassword1PIFParser,
  '1password-csv': onePasswordCSVParser
};