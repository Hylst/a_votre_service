/**
 * fileNaming.ts - Utilitaires pour la génération de noms de fichiers
 * Gère la création de noms de fichiers slugifiés avec nom d'app et utilisateur
 */

/**
 * Slugifie une chaîne de caractères pour l'utiliser dans un nom de fichier
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Évite les tirets multiples
    .replace(/^-|-$/g, ''); // Supprime les tirets en début/fin
}

/**
 * Génère un nom de fichier avec le nom de l'app et l'utilisateur
 */
export function generateFileName({
  appName = 'a-votre-service',
  username,
  format,
  extension,
  encrypted = false,
  timestamp = Date.now()
}: {
  appName?: string;
  username?: string;
  format: string;
  extension: string;
  encrypted?: boolean;
  timestamp?: number;
}): string {
  const parts: string[] = [];
  
  // Nom de l'app slugifié
  const slugifiedAppName = slugify(appName);
  if (slugifiedAppName) {
    parts.push(slugifiedAppName);
  }
  
  // Nom d'utilisateur slugifié (si connecté)
  if (username && username.trim()) {
    const slugifiedUsername = slugify(username.trim());
    if (slugifiedUsername) {
      parts.push(slugifiedUsername);
    }
  }
  
  // Format
  const slugifiedFormat = slugify(format);
  if (slugifiedFormat) {
    parts.push(slugifiedFormat);
  }
  
  // Timestamp
  const date = new Date(timestamp);
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  parts.push(`${dateString}_${timeString}`);
  
  // Assemblage du nom de base
  let fileName = parts.join('_');
  
  // Ajout du suffixe de chiffrement si nécessaire
  if (encrypted) {
    fileName += '_encrypted';
  }
  
  // Ajout de l'extension
  fileName += `.${extension}`;
  
  return fileName;
}

/**
 * Génère un nom de fichier pour l'export de mots de passe
 */
export function generatePasswordExportFileName({
  appName = 'a-votre-service',
  username,
  format,
  extension,
  encrypted = false,
  passwordCount = 0
}: {
  appName?: string;
  username?: string;
  format: string;
  extension: string;
  encrypted?: boolean;
  passwordCount?: number;
}): string {
  const baseFileName = generateFileName({
    appName,
    username,
    format: `passwords-${format}`,
    extension,
    encrypted
  });
  
  // Ajouter le nombre de mots de passe dans le nom si pertinent
  if (passwordCount > 0) {
    const parts = baseFileName.split('.');
    const nameWithoutExt = parts.slice(0, -1).join('.');
    const ext = parts[parts.length - 1];
    return `${nameWithoutExt}_${passwordCount}items.${ext}`;
  }
  
  return baseFileName;
}

/**
 * Obtient le nom d'utilisateur depuis différentes sources possibles
 */
export function getCurrentUsername(): string | undefined {
  // Essayer de récupérer depuis le localStorage
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.username || user.name || user.email;
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  
  // Essayer de récupérer depuis sessionStorage
  try {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.username || user.name || user.email;
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  
  // Essayer de récupérer depuis d'autres sources possibles
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const auth = JSON.parse(authData);
      return auth.user?.username || auth.user?.name || auth.user?.email;
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  
  return undefined;
}

/**
 * Valide un nom de fichier pour s'assurer qu'il est sûr
 */
export function validateFileName(fileName: string): boolean {
  // Vérifier la longueur
  if (fileName.length === 0 || fileName.length > 255) {
    return false;
  }
  
  // Vérifier les caractères interdits
  const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (forbiddenChars.test(fileName)) {
    return false;
  }
  
  // Vérifier les noms réservés Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
  if (reservedNames.test(fileName)) {
    return false;
  }
  
  return true;
}

/**
 * Nettoie un nom de fichier pour le rendre sûr
 */
export function sanitizeFileName(fileName: string): string {
  // Remplacer les caractères interdits
  let sanitized = fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  
  // Limiter la longueur
  if (sanitized.length > 255) {
    const parts = sanitized.split('.');
    if (parts.length > 1) {
      const extension = parts.pop()!;
      const nameWithoutExt = parts.join('.');
      const maxNameLength = 255 - extension.length - 1;
      sanitized = nameWithoutExt.substring(0, maxNameLength) + '.' + extension;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }
  
  // Vérifier les noms réservés
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
  if (reservedNames.test(sanitized)) {
    sanitized = '_' + sanitized;
  }
  
  return sanitized;
}