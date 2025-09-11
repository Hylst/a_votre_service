/**
 * TimeZoneFavoritesTab.tsx
 * Manage favorite timezones with organization, groups, and quick access
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  Heart, 
  Clock, 
  Copy, 
  Trash2, 
  Edit, 
  Plus, 
  FolderPlus, 
  Folder, 
  Search,
  Download,
  Upload,
  Settings,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTimeZoneContext } from '../TimeZoneAdvanced';

interface FavoriteGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  timezones: string[];
  createdAt: Date;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'time' | 'group' | 'added';
type SortDirection = 'asc' | 'desc';

const DEFAULT_COLORS = [
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
];

export const TimeZoneFavoritesTab: React.FC = () => {
  const [groups, setGroups] = useState<FavoriteGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FavoriteGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_COLORS[0]);
  
  const { toast } = useToast();
  const { timeZones, favorites, toggleFavorite, getTimeInTimezone, getDateInTimezone } = useTimeZoneContext();

  // Load groups from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('timezone-favorite-groups');
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        setGroups(parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt)
        })));
      } catch (error) {
        console.error('Error loading favorite groups:', error);
      }
    }
  }, []);

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem('timezone-favorite-groups', JSON.stringify(groups));
  }, [groups]);

  // Get favorite timezones with their data
  const favoriteTimezones = favorites.map(tzName => {
    const tz = timeZones.find(t => t.name === tzName);
    if (!tz) return null;
    
    const time = getTimeInTimezone(tzName);
    const date = getDateInTimezone(tzName);
    const group = groups.find(g => g.timezones.includes(tzName));
    
    return {
      ...tz,
      currentTime: time,
      currentDate: date,
      group: group || null
    };
  }).filter(Boolean);

  // Filter and sort favorites
  const filteredAndSortedFavorites = favoriteTimezones
    .filter(tz => {
      if (!tz) return false;
      
      // Text search
      const matchesSearch = !searchTerm || 
        tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tz.group && tz.group.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Group filter
      const matchesGroup = selectedGroup === 'all' || 
        (selectedGroup === 'ungrouped' && !tz.group) ||
        (tz.group && tz.group.id === selectedGroup);

      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.city.localeCompare(b.city);
          break;
        case 'time':
          comparison = a.currentTime.localeCompare(b.currentTime);
          break;
        case 'group':
          const groupA = a.group?.name || 'Zzz';
          const groupB = b.group?.name || 'Zzz';
          comparison = groupA.localeCompare(groupB);
          break;
        case 'added':
          // For simplicity, sort by timezone name as proxy for added order
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Create new group
  const createGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du groupe est requis.',
        variant: 'destructive'
      });
      return;
    }

    const newGroup: FavoriteGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      color: newGroupColor,
      timezones: [],
      createdAt: new Date()
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor(DEFAULT_COLORS[0]);
    setIsCreateGroupOpen(false);
    
    toast({
      title: 'Groupe créé',
      description: `Le groupe "${newGroup.name}" a été créé avec succès.`,
    });
  };

  // Update group
  const updateGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return;

    const updatedGroups = groups.map(g => 
      g.id === editingGroup.id 
        ? { ...g, name: newGroupName.trim(), description: newGroupDescription.trim(), color: newGroupColor }
        : g
    );
    
    setGroups(updatedGroups);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor(DEFAULT_COLORS[0]);
    
    toast({
      title: 'Groupe modifié',
      description: `Le groupe a été modifié avec succès.`,
    });
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    setGroups(groups.filter(g => g.id !== groupId));
    
    toast({
      title: 'Groupe supprimé',
      description: `Le groupe "${group.name}" a été supprimé.`,
    });
  };

  // Add timezone to group
  const addToGroup = (timezoneName: string, groupId: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          timezones: [...g.timezones.filter(tz => tz !== timezoneName), timezoneName]
        };
      } else {
        return {
          ...g,
          timezones: g.timezones.filter(tz => tz !== timezoneName)
        };
      }
    });
    
    setGroups(updatedGroups);
  };

  // Remove timezone from group
  const removeFromGroup = (timezoneName: string) => {
    const updatedGroups = groups.map(g => ({
      ...g,
      timezones: g.timezones.filter(tz => tz !== timezoneName)
    }));
    
    setGroups(updatedGroups);
  };

  // Copy timezone info
  const copyTimezoneInfo = (tz: any) => {
    const textToCopy = `${tz.city} (${tz.country})\nHeure locale: ${tz.currentTime}\nDate: ${tz.currentDate}\nFuseau: ${tz.abbreviation} (${tz.offset})\nGroupe: ${tz.group?.name || 'Aucun'}`;
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Informations copiées',
      description: `Les informations de ${tz.city} ont été copiées.`,
    });
  };

  // Export favorites
  const exportFavorites = () => {
    const exportData = {
      favorites,
      groups,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timezone-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export réussi',
      description: 'Vos favoris ont été exportés avec succès.',
    });
  };

  // Import favorites
  const importFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        if (importData.groups) {
          setGroups(importData.groups.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt)
          })));
        }
        
        toast({
          title: 'Import réussi',
          description: 'Vos favoris ont été importés avec succès.',
        });
      } catch (error) {
        toast({
          title: 'Erreur d\'import',
          description: 'Le fichier sélectionné n\'est pas valide.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              Mes Fuseaux Favoris ({favorites.length})
            </span>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importFavorites}
                className="hidden"
                id="import-favorites"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-favorites')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportFavorites}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les favoris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les favoris</SelectItem>
                <SelectItem value="ungrouped">Sans groupe</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.timezones.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View and Sort Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Affichage:</span>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Trier par:</span>
              {(['name', 'time', 'group', 'added'] as SortOption[]).map(option => (
                <Button
                  key={option}
                  variant={sortBy === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option)}
                  className="text-xs"
                >
                  {option === 'name' && 'Nom'}
                  {option === 'time' && 'Heure'}
                  {option === 'group' && 'Groupe'}
                  {option === 'added' && 'Ajouté'}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Management */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Folder className="w-5 h-5 text-blue-600" />
              Groupes ({groups.length})
            </span>
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  Nouveau Groupe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau groupe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Nom du groupe</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Travail, Famille, Voyages..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-description">Description (optionnelle)</Label>
                    <Textarea
                      id="group-description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Description du groupe..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Couleur</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DEFAULT_COLORS.map((color, index) => (
                        <button
                          key={index}
                          className={`w-8 h-8 rounded-full border-2 ${color} ${
                            newGroupColor === color ? 'border-slate-800 dark:border-slate-200' : 'border-slate-300'
                          }`}
                          onClick={() => setNewGroupColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createGroup}>
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <Badge
                key={group.id}
                className={`${group.color} cursor-pointer flex items-center gap-2 px-3 py-2`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <span>{group.name} ({group.timezones.length})</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-4 w-4 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                      setNewGroupName(group.name);
                      setNewGroupDescription(group.description);
                      setNewGroupColor(group.color);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-4 w-4 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-group-name">Nom du groupe</Label>
              <Input
                id="edit-group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-group-description">Description</Label>
              <Textarea
                id="edit-group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DEFAULT_COLORS.map((color, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full border-2 ${color} ${
                      newGroupColor === color ? 'border-slate-800 dark:border-slate-200' : 'border-slate-300'
                    }`}
                    onClick={() => setNewGroupColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingGroup(null)}>
                Annuler
              </Button>
              <Button onClick={updateGroup}>
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Favorites Display */}
      {filteredAndSortedFavorites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {favorites.length === 0 ? 'Aucun favori' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500">
              {favorites.length === 0 
                ? 'Ajoutez des fuseaux horaires à vos favoris depuis les autres onglets.'
                : 'Essayez de modifier vos critères de recherche ou de filtre.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {filteredAndSortedFavorites.map((tz) => {
            if (!tz) return null;
            
            return (
              <Card 
                key={tz.name}
                className={`transition-all duration-300 hover:shadow-lg ${
                  viewMode === 'list' ? 'flex items-center' : ''
                } ${
                  tz.group 
                    ? 'border-l-4 border-l-blue-400'
                    : 'border-l-4 border-l-gray-200'
                }`}
              >
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center justify-between w-full' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-3'}>
                    {/* Header */}
                    <div className={viewMode === 'list' ? 'flex items-center gap-3' : 'flex justify-between items-start'}>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                          {tz.city}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {tz.country}
                        </p>
                      </div>
                      {viewMode === 'grid' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(tz.name)}
                            className="p-1 text-yellow-500"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTimezoneInfo(tz)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Time Display */}
                    <div className={viewMode === 'list' ? 'text-center' : 'text-center'}>
                      <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                        {tz.currentTime}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {tz.currentDate}
                      </div>
                    </div>

                    {/* Group and Controls */}
                    <div className={viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-2'}>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {tz.abbreviation} ({tz.offset})
                        </Badge>
                        {tz.group && (
                          <Badge className={`text-xs ${tz.group.color}`}>
                            {tz.group.name}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Group Assignment */}
                      <Select
                        value={tz.group?.id || 'none'}
                        onValueChange={(value) => {
                          if (value && value !== 'none') {
                            addToGroup(tz.name, value);
                          } else {
                            removeFromGroup(tz.name);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Groupe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun groupe</SelectItem>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(tz.name)}
                        className="p-1 text-yellow-500"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyTimezoneInfo(tz)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};