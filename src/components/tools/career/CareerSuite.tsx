import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Users, 
  Target, 
  Handshake,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { CareerDashboard } from "./core/CareerDashboard";
import { AICoach } from "./ai-coach/AICoach";
import { MarketIntel } from "./market-intel/MarketIntel";
import { InterviewPrep } from "./interview/InterviewPrep";
import { DocumentStudio } from "./documents/DocumentStudio";
import { NetworkingHub } from "./networking/NetworkingHub";
import { SkillsAssessment } from "./skills/SkillsAssessment";
import { NegotiationCoach } from "./negotiation/NegotiationCoach";

export const CareerSuite = () => {
  const [activeTab, setActiveTab] = useState("ai-coach"); // Temporarily set to ai-coach for debugging

  // Handle URL-based navigation to specific career tools
  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log('🔍 [CareerSuite] Current path:', currentPath);
    
    if (currentPath.includes('/ai-coach')) {
      console.log('🎯 [CareerSuite] Setting active tab to ai-coach');
      setActiveTab('ai-coach');
    } else if (currentPath.includes('/market')) {
      setActiveTab('market');
    } else if (currentPath.includes('/interview')) {
      setActiveTab('interview');
    } else if (currentPath.includes('/documents')) {
      setActiveTab('documents');
    } else if (currentPath.includes('/networking')) {
      setActiveTab('networking');
    } else if (currentPath.includes('/skills')) {
      setActiveTab('skills');
    } else if (currentPath.includes('/negotiation')) {
      setActiveTab('negotiation');
    }
  }, []);
  return (
    <div className="space-y-2">
      {/* Navigation par onglets responsive avec espacement compact */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-2 h-auto">
          <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Tableau</span>
          </TabsTrigger>
          <TabsTrigger value="ai-coach" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <BrainCircuit className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Coach IA</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Marché</span>
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Entretiens</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="networking" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Réseau</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Target className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Compétences</span>
          </TabsTrigger>
          <TabsTrigger value="negotiation" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 lg:p-3">
            <Handshake className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Négociation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CareerDashboard />
        </TabsContent>

        <TabsContent value="ai-coach">
          <AICoach />
        </TabsContent>
        <TabsContent value="market">
          <MarketIntel />
        </TabsContent>
        <TabsContent value="interview">
          <InterviewPrep />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentStudio />
        </TabsContent>
        <TabsContent value="networking">
          <NetworkingHub />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsAssessment />
        </TabsContent>
        <TabsContent value="negotiation">
          <NegotiationCoach />
        </TabsContent>
      </Tabs>
    </div>
  );
};