
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Zap, Shield, Target, TrendingUp } from "lucide-react";

interface PasswordDisplayAdvancedProps {
  password: string;
  strength: {
    score: number;
    level: string;
    color: string;
    feedback: string[];
    entropy: number;
  };
  onCopy: (password: string) => void;
  stats: {
    totalGenerated: number;
    averageStrength: number;
    mostUsedLength: number;
    strongPasswords: number;
  };
}

export const PasswordDisplayAdvanced = ({ 
  password, 
  strength, 
  onCopy,
  stats
}: PasswordDisplayAdvancedProps) => {
  return (
    <div className="space-y-4">
      {/* Affichage principal du mot de passe */}
      <div className="p-4 lg:p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-xl shadow-inner border-2 border-purple-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-purple-200">Mot de passe généré</span>
            {strength.feedback.length > 0 && (
              <div className="text-xs text-purple-200">
                <span className="font-medium">Recommandations: </span>
                <span>{strength.feedback[0]}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-purple-800 text-purple-200">
              <Shield className="w-3 h-3 mr-1" />
              Sécurisé
            </Badge>
            {strength.entropy > 0 && (
              <Badge variant="secondary" className="bg-indigo-800 text-indigo-200">
                {strength.entropy} bits entropie
              </Badge>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Input
            value={password}
            readOnly
            className="font-mono pr-12 text-lg sm:text-xl lg:text-2xl bg-black/30 text-green-300 border-purple-600 placeholder:text-purple-300"
            placeholder="Aucun mot de passe généré"
          />
          {password && (
            <Button
              onClick={() => onCopy(password)}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-white hover:bg-purple-700/50"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {password && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-wrap items-center gap-3 text-sm text-purple-200">
                <span>
                  Force: <span className={`font-semibold ${strength.color === 'text-red-500' ? 'text-red-400' : 
                    strength.color === 'text-orange-500' ? 'text-orange-400' :
                    strength.color === 'text-yellow-500' ? 'text-yellow-400' :
                    strength.color === 'text-green-500' ? 'text-green-400' : 'text-green-300'}`}>
                    {strength.level} ({strength.score}%)
                  </span>
                </span>
                <span className="text-green-300">● Chiffré</span>
                <span>Caractères: <span className="font-medium text-blue-300">{password.length}</span></span>
                <span>Majuscules: <span className="font-medium text-blue-300">{(password.match(/[A-Z]/g) || []).length}</span></span>
                <span>Minuscules: <span className="font-medium text-blue-300">{(password.match(/[a-z]/g) || []).length}</span></span>
                <span>Spéciaux: <span className="font-medium text-blue-300">{(password.match(/[^A-Za-z0-9]/g) || []).length}</span></span>
              </div>
            </div>
            
            <Progress 
              value={strength.score} 
              className="h-3 bg-gray-800"
            />
          </div>
        )}
      </div>


    </div>
  );
};
