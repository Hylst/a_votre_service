/**
 * types.ts - Types et interfaces pour les parseurs de formats de gestionnaires de mots de passe
 * Définit les structures de données communes pour l'import/export
 */

// Interface commune pour les entrées de mots de passe
export interface PasswordEntry {
  id?: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string;
  email?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastUsed?: Date;
}

// Types de formats supportés
export type SupportedFormat = 
  | '1password-1pif'
  | '1password-csv'
  | 'bitwarden-json'
  | 'bitwarden-csv'
  | 'lastpass-csv'
  | 'keepass-csv'
  | 'keepass-kdbx'
  | 'chrome-csv'
  | 'edge-csv'
  | 'dashlane-csv'
  | 'dashlane-json'
  | 'app-json';

// Interface pour les parseurs
export interface PasswordParser {
  format: SupportedFormat;
  name: string;
  description: string;
  fileExtensions: string[];
  parse: (content: string | ArrayBuffer) => Promise<PasswordEntry[]>;
  export: (entries: PasswordEntry[]) => Promise<string | ArrayBuffer>;
  validate: (content: string | ArrayBuffer) => boolean;
}

// Options d'import
export interface ImportOptions {
  format: SupportedFormat;
  skipDuplicates?: boolean;
  mergeStrategy?: 'replace' | 'merge' | 'skip';
  categoryMapping?: Record<string, string>;
}

// Options d'export
export interface ExportOptions {
  format: SupportedFormat;
  includePasswords?: boolean;
  includeNotes?: boolean;
  includeFavorites?: boolean;
  categoryFilter?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  encryption?: {
    enabled: boolean;
    password?: string;
  };
  filename?: string;
}

// Résultat d'import
export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  entries: PasswordEntry[];
}

// Résultat d'export
export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  format: SupportedFormat;
  encrypted: boolean;
}

// Métadonnées de format
export interface FormatMetadata {
  name: string;
  description: string;
  fileExtensions: string[];
  supportsImport: boolean;
  supportsExport: boolean;
  requiresPassword?: boolean;
  popular?: boolean;
  encrypted?: boolean;
  compatibility: string[];
}