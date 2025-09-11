
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette, Image, Type, Zap, Sparkles, Paintbrush, Camera, Layers } from "lucide-react";
import { ColorGeneratorAdvanced } from "./components/ColorGeneratorAdvanced";
import { PaletteGenerator } from "./components/PaletteGenerator";
import { GradientGenerator } from "./components/GradientGenerator";
import { TypographyGenerator } from "./components/TypographyGenerator";
import { ImageFilters } from "./components/ImageFilters";
import { PatternGenerator } from "./components/PatternGenerator";
import { LogoMaker } from "./components/LogoMaker";
import { IconGenerator } from "./components/IconGenerator";

export const CreativitySuiteAdvanced = () => {
  return (
    <div className="space-y-2">
      {/* Navigation par onglets responsive avec espacement compact */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-2 h-auto">
          <TabsTrigger value="colors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Palette className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Couleurs</span>
          </TabsTrigger>
          <TabsTrigger value="palettes" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Paintbrush className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Palettes</span>
          </TabsTrigger>
          <TabsTrigger value="gradients" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Dégradés</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Type className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Typo</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Camera className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Filtres</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Image className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Motifs</span>
          </TabsTrigger>
          <TabsTrigger value="logos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Logos</span>
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Icônes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <ColorGeneratorAdvanced />
        </TabsContent>

        <TabsContent value="palettes">
          <PaletteGenerator />
        </TabsContent>

        <TabsContent value="gradients">
          <GradientGenerator />
        </TabsContent>

        <TabsContent value="typography">
          <TypographyGenerator />
        </TabsContent>

        <TabsContent value="filters">
          <ImageFilters />
        </TabsContent>

        <TabsContent value="patterns">
          <PatternGenerator />
        </TabsContent>

        <TabsContent value="logos">
          <LogoMaker />
        </TabsContent>

        <TabsContent value="icons">
          <IconGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
