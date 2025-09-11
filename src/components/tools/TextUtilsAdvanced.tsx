
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextAnalyzer } from './textUtils/TextAnalyzer';
import { TextFormatter } from './textUtils/TextFormatter';
import { TextTransformer } from './textUtils/TextTransformer';
import { TextGenerator } from './textUtils/TextGenerator';
import { TextComparator } from './textUtils/TextComparator';
import { MarkdownTools } from './textUtils/MarkdownTools';
import { SEOAnalyzer } from './textUtils/SEOAnalyzer';
import { TextExtractor } from './textUtils/TextExtractor';
import { SyntaxHighlighter } from './textUtils/SyntaxHighlighter';
import { EmojiManager } from './textUtils/EmojiManager';
import { MarkdownEditor } from './textUtils/MarkdownEditor';
import { DataImportExport } from './common/DataImportExport';
import { useOfflineDataManager } from '@/hooks/useOfflineDataManager';
import { FileText, BarChart3, Type, Shuffle, Copy, FileCode, Search, FileDown, Code, Smile, Edit } from 'lucide-react';

export const TextUtilsAdvanced = () => {
  const {
    data: textUtilsData,
    setData,
    exportData,
    importData,
    resetData,
    isOnline,
    isSyncing,
    lastSyncTime
  } = useOfflineDataManager<Record<string, any>>({
    toolName: 'text-utils-advanced',
    defaultData: {}
  });

  const [activeTab, setActiveTab] = useState('analyzer');

  const handleDataChange = (newData: any) => {
    const currentData = textUtilsData && typeof textUtilsData === 'object' ? textUtilsData : {};
    const updatedData = {
      ...currentData,
      [activeTab]: newData,
      lastModified: new Date().toISOString()
    };
    setData(updatedData);
  };

  const tabs = [
    {
      id: 'analyzer',
      label: 'Analyseur',
      icon: BarChart3,
      component: TextAnalyzer,
      category: 'Analyse'
    },
    {
      id: 'formatter',
      label: 'Formatage',
      icon: Type,
      component: TextFormatter,
      category: 'Édition'
    },
    {
      id: 'transformer',
      label: 'Transformation',
      icon: Shuffle,
      component: TextTransformer,
      category: 'Édition'
    },
    {
      id: 'generator',
      label: 'Générateur',
      icon: Copy,
      component: TextGenerator,
      category: 'Création'
    },
    {
      id: 'comparator',
      label: 'Comparaison',
      icon: FileText,
      component: TextComparator,
      category: 'Analyse'
    },
    {
      id: 'syntax-highlighter',
      label: 'Colorisation',
      icon: Code,
      component: SyntaxHighlighter,
      category: 'Code'
    },
    {
      id: 'emoji-manager',
      label: 'Emojis',
      icon: Smile,
      component: EmojiManager,
      category: 'Créativité'
    },
    {
      id: 'markdown-editor',
      label: 'Markdown Editor',
      icon: Edit,
      component: MarkdownEditor,
      category: 'Édition'
    },
    {
      id: 'markdown',
      label: 'Markdown Utils',
      icon: FileCode,
      component: MarkdownTools,
      category: 'Code'
    },
    {
      id: 'seo',
      label: 'SEO',
      icon: Search,
      component: SEOAnalyzer,
      category: 'Analyse'
    },
    {
      id: 'extractor',
      label: 'Extraction',
      icon: FileDown,
      component: TextExtractor,
      category: 'Analyse'
    }
  ];

  const categories = [...new Set(tabs.map(tab => tab.category))];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11 h-auto p-1 gap-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 p-2 text-xs min-h-16"
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="text-center leading-tight">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {tabs.map((tab) => {
              const TabComponent = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className="p-3 lg:p-6">
                  <TabComponent
                    data={textUtilsData?.[tab.id] || {}}
                    onDataChange={handleDataChange}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
