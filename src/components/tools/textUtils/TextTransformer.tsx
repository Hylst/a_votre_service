
/**
 * TextTransformer.tsx - Advanced text transformation utility
 * Provides multiple text transformation options with theme-aware UI and optimized performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Debounce utility function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface TextTransformerProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const TextTransformer = ({ data, onDataChange }: TextTransformerProps) => {
  const [text, setText] = useState(data.text || '');
  const [transformedTexts, setTransformedTexts] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Debounced transformation function to improve performance
  const debouncedTransform = useCallback(
    debounce((inputText: string) => {
      if (inputText.trim()) {
        performTransformations(inputText);
      } else {
        setTransformedTexts({});
        setErrors({});
        setIsProcessing(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (onDataChange && data) {
      onDataChange({ ...data, text, transformedTexts });
    }
  }, [text, transformedTexts, data, onDataChange]);

  useEffect(() => {
    setIsProcessing(true);
    debouncedTransform(text);
  }, [text, debouncedTransform]);

  /**
   * Performs all text transformations with error handling
   * @param inputText - The text to transform
   */
  const performTransformations = useCallback((inputText: string) => {
    const newTransforms: {[key: string]: string} = {};
    const newErrors: {[key: string]: string} = {};

    try {
      // Case transformations
      newTransforms.uppercase = inputText.toUpperCase();
      newTransforms.lowercase = inputText.toLowerCase();
      newTransforms.titleCase = inputText.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
      newTransforms.sentenceCase = inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase();
      
      // Programming case transformations
      newTransforms.camelCase = toCamelCase(inputText);
      newTransforms.pascalCase = toPascalCase(inputText);
      newTransforms.snakeCase = toSnakeCase(inputText);
      newTransforms.kebabCase = toKebabCase(inputText);
      
      // Text manipulations
      newTransforms.reverse = inputText.split('').reverse().join('');
      newTransforms.reverseWords = inputText.split(' ').reverse().join(' ');
      newTransforms.alternatingCase = inputText
        .split('')
        .map((char, index) => 
          index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
      
      // Filters
      newTransforms.removeVowels = inputText.replace(/[aeiouAEIOU]/g, '');
      newTransforms.removeConsonants = inputText.replace(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g, '');
      newTransforms.removeNumbers = inputText.replace(/[0-9]/g, '');
      newTransforms.removeSpecialChars = inputText.replace(/[^a-zA-Z0-9\s]/g, '');
      newTransforms.doubleSpace = inputText.replace(/ /g, '  ');
      newTransforms.singleSpace = inputText.replace(/\s+/g, ' ');
      
      // Encoding transformations with error handling
      newTransforms.rot13 = inputText.replace(/[a-zA-Z]/g, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
      });
      
      try {
        newTransforms.morse = textToMorse(inputText);
      } catch (error) {
        newErrors.morse = 'Erreur lors de la conversion en morse';
      }
      
      try {
        newTransforms.binary = textToBinary(inputText);
      } catch (error) {
        newErrors.binary = 'Erreur lors de la conversion en binaire';
      }
      
      try {
        newTransforms.base64 = safeBase64Encode(inputText);
      } catch (error) {
        newErrors.base64 = 'Erreur lors de l\'encodage Base64';
      }
      
      // URL and text processing
      newTransforms.slugify = inputText
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Analysis
      const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
      newTransforms.wordCount = `Mots: ${words.length}, Caractères: ${inputText.length}, Sans espaces: ${inputText.replace(/\s/g, '').length}`;
      
      // Letter extractions
      newTransforms.firstLetters = inputText.split(' ').map(word => word.charAt(0)).join('');
      newTransforms.lastLetters = inputText.split(' ').map(word => word.charAt(word.length - 1)).join('');
      
    } catch (error) {
      console.error('Error in performTransformations:', error);
    }

    setTransformedTexts(newTransforms);
    setErrors(newErrors);
    setIsProcessing(false);
  }, []);

  /**
   * Converts text to camelCase
   * @param text - Input text
   * @returns camelCase formatted text
   */
  const toCamelCase = (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  };

  /**
   * Converts text to PascalCase
   * @param text - Input text
   * @returns PascalCase formatted text
   */
  const toPascalCase = (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '');
  };

  /**
   * Converts text to snake_case
   * @param text - Input text
   * @returns snake_case formatted text
   */
  const toSnakeCase = (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  };

  /**
   * Converts text to kebab-case
   * @param text - Input text
   * @returns kebab-case formatted text
   */
  const toKebabCase = (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  };

  /**
   * Safely encodes text to Base64 with error handling
   * @param text - Input text
   * @returns Base64 encoded text or error message
   */
  const safeBase64Encode = (text: string): string => {
    try {
      // Handle special characters by using encodeURIComponent first
      return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (error) {
      throw new Error('Impossible d\'encoder en Base64');
    }
  };

  const textToMorse = (text: string): string => {
    const morseCode: {[key: string]: string} = {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
      '8': '---..', '9': '----.', ' ': '/'
    };
    
    return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
  };

  const textToBinary = (text: string): string => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const transformations = [
    { key: 'uppercase', label: 'MAJUSCULES', category: 'Casse' },
    { key: 'lowercase', label: 'minuscules', category: 'Casse' },
    { key: 'titleCase', label: 'Première Lettre Majuscule', category: 'Casse' },
    { key: 'sentenceCase', label: 'Phrase normale', category: 'Casse' },
    { key: 'alternatingCase', label: 'CaSe AlTeRnÉe', category: 'Casse' },
    { key: 'camelCase', label: 'camelCase', category: 'Programmation' },
    { key: 'pascalCase', label: 'PascalCase', category: 'Programmation' },
    { key: 'snakeCase', label: 'snake_case', category: 'Programmation' },
    { key: 'kebabCase', label: 'kebab-case', category: 'Programmation' },
    { key: 'slugify', label: 'url-slug', category: 'Programmation' },
    { key: 'reverse', label: 'Texte inversé', category: 'Manipulation' },
    { key: 'reverseWords', label: 'Mots inversés', category: 'Manipulation' },
    { key: 'firstLetters', label: 'Premières lettres', category: 'Manipulation' },
    { key: 'lastLetters', label: 'Dernières lettres', category: 'Manipulation' },
    { key: 'removeVowels', label: 'Sans voyelles', category: 'Filtres' },
    { key: 'removeConsonants', label: 'Sans consonnes', category: 'Filtres' },
    { key: 'removeNumbers', label: 'Sans chiffres', category: 'Filtres' },
    { key: 'removeSpecialChars', label: 'Sans caractères spéciaux', category: 'Filtres' },
    { key: 'rot13', label: 'ROT13', category: 'Encodage' },
    { key: 'morse', label: 'Code Morse', category: 'Encodage' },
    { key: 'binary', label: 'Binaire', category: 'Encodage' },
    { key: 'base64', label: 'Base64', category: 'Encodage' },
    { key: 'wordCount', label: 'Statistiques', category: 'Analyse' }
  ];

  const categories = [...new Set(transformations.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shuffle className="w-4 h-4" />
            Texte à transformer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Saisissez votre texte ici..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full bg-background text-foreground"
          />
          {isProcessing && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Transformation en cours...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display errors if any */}
      {text && Object.keys(errors).length > 0 && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key} className="text-sm">
                  <strong>{key}:</strong> {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Transformations by Category */}
      {text && categories.map(category => (
        <Card key={category} className="bg-card text-card-foreground border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline">{category}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {transformations
                .filter(t => t.category === category)
                .map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{label}</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(transformedTexts[key] || '', label)}
                      disabled={isProcessing || !transformedTexts[key]}
                      className="h-8 w-8 p-0"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-secondary text-secondary-foreground rounded border text-sm font-mono break-all min-h-[60px] relative">
                    {errors[key] ? (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{errors[key]}</span>
                      </div>
                    ) : (
                      transformedTexts[key] || (
                        isProcessing ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Transformation...</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Aucun résultat</span>
                        )
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {!text && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shuffle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Prêt à transformer
            </h3>
            <p className="text-muted-foreground">
              Saisissez du texte ci-dessus pour voir toutes les transformations disponibles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
