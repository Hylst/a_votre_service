import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Calendar, MapPin, Target, Edit, CheckCircle, MessageCircle, Mail, Star, Plus, TrendingUp, Phone, Linkedin, Building, Clock, BarChart3, Network, UserPlus, MessageSquare } from "lucide-react";
import { useState } from "react";

export const NetworkingHub = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    position: "",
    company: "",
    email: "",
    phone: "",
    linkedin: "",
    relationship: "Moyenne",
    tags: "",
    notes: ""
  });
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "Meetup",
    organizer: "",
    attendees: 0,
    newContacts: 0,
    description: "",
    url: ""
  });
  
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Marie Dubois",
      company: "TechCorp",
      position: "Directrice RH",
      email: "marie.dubois@techcorp.com",
      phone: "+33 1 23 45 67 89",
      location: "Paris",
      relationship: "Forte",
      lastContact: "2024-01-15",
      notes: "Rencontrée lors de la conférence Tech Paris",
      tags: ["RH", "Tech", "Mentor"]
    },
    {
      id: 2,
      name: "Jean Martin",
      company: "StartupXYZ",
      position: "CEO",
      email: "jean@startupxyz.com",
      phone: "+33 6 12 34 56 78",
      location: "Lyon",
      relationship: "Moyenne",
      lastContact: "2024-01-10",
      notes: "Intéressé par une collaboration",
      tags: ["CEO", "Startup", "Collaboration"]
    }
  ]);
  
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Tech Conference Paris 2024",
      date: "2024-02-15",
      location: "Paris Expo",
      type: "Conférence",
      status: "Inscrit",
      attendees: 500,
      newContacts: 15,
      description: "La plus grande conférence tech de France"
    },
    {
      id: 2,
      name: "Startup Meetup Lyon",
      date: "2024-02-20",
      location: "La Cordée",
      type: "Meetup",
      status: "Intéressé",
      attendees: 50,
      newContacts: 8,
      description: "Rencontre mensuelle des entrepreneurs lyonnais"
    }
  ]);

  const addContact = () => {
    if (newContact.name && newContact.email) {
      const contact = {
        ...newContact,
        id: contacts.length + 1,
        lastContact: new Date().toISOString().split('T')[0],
        tags: newContact.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      setContacts([...contacts, contact]);
      setNewContact({
        name: "",
        position: "",
        company: "",
        email: "",
        phone: "",
        linkedin: "",
        relationship: "Moyenne",
        tags: "",
        notes: ""
      });
      setShowAddContact(false);
    }
  };

  const addEvent = () => {
    if (newEvent.name && newEvent.date) {
      const event = {
        ...newEvent,
        id: events.length + 1,
        attendees: Math.floor(Math.random() * 200) + 50,
        status: "Intéressé"
      };
      setEvents([...events, event]);
      setNewEvent({
        name: "",
        date: "",
        time: "",
        location: "",
        type: "Meetup",
        organizer: "",
        attendees: 0,
        newContacts: 0,
        description: "",
        url: ""
      });
      setShowAddEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Hub de Networking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="mapping">Cartographie</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Mes Contacts</h3>
                <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Ajouter un Nouveau Contact</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom complet *</Label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Poste</Label>
                        <Input
                          value={newContact.position}
                          onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                          placeholder="Développeur Senior"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Entreprise</Label>
                        <Input
                          value={newContact.company}
                          onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                          placeholder="TechCorp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          placeholder="jean.dupont@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          value={newContact.linkedin}
                          onChange={(e) => setNewContact({...newContact, linkedin: e.target.value})}
                          placeholder="linkedin.com/in/jeandupont"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Force de la relation</Label>
                        <Select value={newContact.relationship} onValueChange={(value) => setNewContact({...newContact, relationship: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Faible">Faible</SelectItem>
                            <SelectItem value="Moyenne">Moyenne</SelectItem>
                            <SelectItem value="Forte">Forte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (séparés par des virgules)</Label>
                        <Input
                          value={newContact.tags}
                          onChange={(e) => setNewContact({...newContact, tags: e.target.value})}
                          placeholder="Développement, Mentor, React"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={newContact.notes}
                          onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                          placeholder="Notes sur ce contact..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddContact(false)}>Annuler</Button>
                      <Button onClick={addContact}>Ajouter Contact</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Contacts</span>
                    </div>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Relations Fortes</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {contacts.filter(c => c.relationship === "Forte").length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">À Recontacter</span>
                    </div>
                    <p className="text-2xl font-bold">3</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Croissance</span>
                    </div>
                    <p className="text-2xl font-bold">+15%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{contact.name}</h4>
                            <Badge variant={contact.relationship === "Forte" ? "default" : "secondary"}>
                              {contact.relationship}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {contact.company} - {contact.position}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contact.location}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm mt-2">{contact.notes}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dernier contact: {contact.lastContact}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Événements Réseau</h3>
                <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Créer Événement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un Nouvel Événement</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom de l'événement *</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                          placeholder="Meetup React Paris"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type d'événement</Label>
                        <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conférence">Conférence</SelectItem>
                            <SelectItem value="Meetup">Meetup</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Networking">Networking</SelectItem>
                            <SelectItem value="Webinaire">Webinaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Heure</Label>
                        <Input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lieu</Label>
                        <Input
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                          placeholder="Paris, France ou En ligne"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Organisateur</Label>
                        <Input
                          value={newEvent.organizer}
                          onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                          placeholder="TechCorp Events"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre de participants estimé</Label>
                        <Input
                          type="number"
                          value={newEvent.attendees}
                          onChange={(e) => setNewEvent({...newEvent, attendees: parseInt(e.target.value) || 0})}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Objectif de networking</Label>
                        <Input
                          type="number"
                          value={newEvent.newContacts}
                          onChange={(e) => setNewEvent({...newEvent, newContacts: parseInt(e.target.value) || 0})}
                          placeholder="5"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                          placeholder="Description de l'événement..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddEvent(false)}>Annuler</Button>
                      <Button onClick={addEvent}>Créer Événement</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Événements à Venir</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {events.filter(e => new Date(e.date) > new Date()).length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Participants Total</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {events.reduce((sum, e) => sum + e.attendees, 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Nouveaux Contacts</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {events.reduce((sum, e) => sum + e.newContacts, 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{event.name}</h4>
                            <Badge variant={event.status === "Inscrit" ? "default" : "secondary"}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {event.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.attendees} participants
                            </div>
                          </div>
                          <p className="text-sm mt-2">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <h3 className="text-lg font-semibold">Cartographie du Réseau</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Répartition par Secteur</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Technologie</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Finance</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Consulting</span>
                        <span>20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Autres</span>
                        <span>15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Force des Relations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Relations Fortes</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Relations Moyennes</span>
                        <span>50%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Relations Faibles</span>
                        <span>20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Objectifs de Networking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Objectif Principal</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un objectif" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job">Recherche d'emploi</SelectItem>
                          <SelectItem value="business">Développement business</SelectItem>
                          <SelectItem value="mentoring">Mentorat</SelectItem>
                          <SelectItem value="knowledge">Partage de connaissances</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Secteur Cible</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technologie</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Stratégie Personnalisée</Label>
                    <Textarea 
                      placeholder="Décrivez votre stratégie de networking..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Générer Plan d'Action
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <h3 className="text-lg font-semibold">Templates de Messages</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Connexion LinkedIn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Template 1: Événement Commun</p>
                      <p>"Bonjour [Nom], j'ai eu le plaisir de vous rencontrer lors de [Événement]. J'ai été très intéressé(e) par votre présentation sur [Sujet]. J'aimerais échanger avec vous sur [Point spécifique]."</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Template 2: Intérêt Commun</p>
                      <p>"Bonjour [Nom], je suis [Votre poste] chez [Votre entreprise]. J'ai remarqué que nous partageons un intérêt pour [Domaine]. J'aimerais échanger sur [Sujet spécifique]."</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Personnaliser
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email de Suivi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Template 1: Après Rencontre</p>
                      <p>"Objet: Merci pour notre échange de ce jour\n\nBonjour [Nom],\n\nMerci pour le temps que vous m'avez accordé aujourd'hui. Comme convenu, je vous envoie [Document/Information]. J'espère que nous pourrons continuer nos échanges."</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Template 2: Relance</p>
                      <p>"Objet: Suite à notre conversation\n\nBonjour [Nom],\n\nJ'espère que vous allez bien. Je reviens vers vous concernant [Sujet]. Auriez-vous un moment pour en discuter cette semaine ?"</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Personnaliser
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Conseils pour un Networking Efficace
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Personnalisez toujours vos messages</li>
                    <li>• Mentionnez un point commun ou un intérêt partagé</li>
                    <li>• Soyez concis et précis dans vos demandes</li>
                    <li>• Proposez de la valeur en retour</li>
                    <li>• Suivez régulièrement vos contacts</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};