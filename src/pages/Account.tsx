
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Settings, Crown, FileText, Brain, Calendar, Download, Trash2 } from 'lucide-react';

const Account = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    userType: user?.userType || 'profesor'
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acces restricționat</CardTitle>
              <CardDescription>
                Trebuie să te autentifici pentru a accesa această pagină.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="bg-eduai-blue hover:bg-eduai-blue/90">
                Autentifică-te
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = () => {
    // Simulare salvare profil
    toast({
      title: "Profil actualizat!",
      description: "Modificările au fost salvate cu succes.",
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (confirm('Ești sigur că vrei să îți ștergi contul? Această acțiune nu poate fi anulată.')) {
      toast({
        title: "Cont șters",
        description: "Contul tău a fost șters cu succes.",
      });
      logout();
    }
  };

  // Mock data pentru activitate
  const recentActivity = [
    { type: 'Quiz generat', subject: 'Matematică clasa a 8-a', date: '2024-01-15', status: 'Salvat' },
    { type: 'Plan lecție', subject: 'Istorie România', date: '2024-01-14', status: 'Descărcat' },
    { type: 'Consultanță AI', subject: 'Pregătire BAC', date: '2024-01-13', status: 'Completat' },
    { type: 'Quiz generat', subject: 'Fizică', date: '2024-01-12', status: 'Salvat' }
  ];

  const savedMaterials = [
    { id: '1', title: 'Quiz Teorema lui Pitagora', type: 'Quiz', subject: 'Matematică', date: '2024-01-15', size: '2.3 MB' },
    { id: '2', title: 'Plan lecție Războaiele balcanice', type: 'Plan lecție', subject: 'Istorie', date: '2024-01-14', size: '1.8 MB' },
    { id: '3', title: 'Prezentare Sistemul solar', type: 'Prezentare', subject: 'Științe', date: '2024-01-13', size: '4.1 MB' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contul meu
            </h1>
            <p className="text-gray-600">
              Gestionează setările contului, abonamentul și activitatea ta pe EduAI
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="subscription">Abonament</TabsTrigger>
              <TabsTrigger value="materials">Materiale</TabsTrigger>
              <TabsTrigger value="activity">Activitate</TabsTrigger>
              <TabsTrigger value="settings">Setări</TabsTrigger>
            </TabsList>

            {/* Tab Profil */}
            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Informații profil</CardTitle>
                    <CardDescription>
                      Actualizează informațiile tale personale
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nume complet</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="userType">Tip de cont</Label>
                      <Select 
                        value={formData.userType} 
                        onValueChange={(value: User['userType']) => setFormData(prev => ({ ...prev, userType: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesor">👩‍🏫 Profesor / Cadru didactic</SelectItem>
                          <SelectItem value="elev">🎓 Elev / Student</SelectItem>
                          <SelectItem value="parinte">👪 Părinte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSaveProfile} className="bg-eduai-blue hover:bg-eduai-blue/90">
                            Salvează modificările
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Anulează
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Editează profilul
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {/* Status cont */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status cont</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tip cont:</span>
                          <Badge variant={user.userType === 'profesor' ? 'default' : 'secondary'}>
                            {user.userType}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Abonament:</span>
                          <Badge variant={user.subscription === 'premium' ? 'default' : 'secondary'}>
                            {user.subscription}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Membru din:</span>
                          <span className="text-sm">Ianuarie 2024</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Utilizare */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Utilizare luna aceasta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Materiale generate:</span>
                          <span className="text-sm font-medium">{user.materialsCount}/{user.materialsLimit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Consultări AI:</span>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Export PDF:</span>
                          <span className="text-sm font-medium">
                            {user.subscription === 'premium' ? '12' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab Abonament */}
            <TabsContent value="subscription">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5" />
                      <span>Abonament actual</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Plan {user.subscription}</span>
                        <Badge variant={user.subscription === 'premium' ? 'default' : 'secondary'} className="text-sm">
                          {user.subscription === 'premium' ? 'Activ' : 'Gratuit'}
                        </Badge>
                      </div>
                      
                      {user.subscription === 'premium' ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Preț:</span>
                              <span className="text-sm font-medium">29 LEI/lună</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Următoarea plată:</span>
                              <span className="text-sm font-medium">15 februarie 2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Metoda de plată:</span>
                              <span className="text-sm font-medium">**** 1234</span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t space-y-2">
                            <Button variant="outline" className="w-full">
                              Gestionează abonamentul
                            </Button>
                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                              Anulează abonamentul
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Ai folosit {user.materialsCount} din {user.materialsLimit} materiale gratuite pentru luna aceasta.
                            </p>
                          </div>
                          
                          <div className="pt-4">
                            <Button className="w-full bg-eduai-blue hover:bg-eduai-blue/90">
                              Upgrade la Premium
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Beneficii abonament</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.subscription === 'premium' ? (
                        [
                          '✓ 20 materiale generate/lună',
                          '✓ Export PDF nelimitat',
                          '✓ Consultanță AI avansată',
                          '✓ Backup cloud automat',
                          '✓ Analize detaliate progres',
                          '✓ Suport prioritar'
                        ].map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-green-500 text-sm">{benefit}</span>
                          </div>
                        ))
                      ) : (
                        [
                          '✓ 5 materiale generate/lună',
                          '✓ Quiz-uri de bază',
                          '✓ Consultanță AI simplă',
                          '× Export PDF',
                          '× Backup cloud',
                          '× Analize detaliate'
                        ].map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className={`text-sm ${benefit.startsWith('✓') ? 'text-green-500' : 'text-gray-400'}`}>
                              {benefit}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Materiale */}
            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Materialele mele salvate</span>
                  </CardTitle>
                  <CardDescription>
                    Toate materialele pe care le-ai generat și salvat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <p className="text-sm text-gray-500">
                              {material.type} • {material.subject} • {material.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{material.size}</span>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Descarcă
                          </Button>
                          <Button variant="outline" size="sm">
                            Vezi
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button variant="outline">
                      Încarcă mai multe materiale
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Activitate */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Activitate recentă</span>
                  </CardTitle>
                  <CardDescription>
                    Istoricul activității tale pe platformă
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {activity.type === 'Quiz generat' && <FileText className="h-5 w-5 text-blue-500" />}
                            {activity.type === 'Plan lecție' && <FileText className="h-5 w-5 text-green-500" />}
                            {activity.type === 'Consultanță AI' && <Brain className="h-5 w-5 text-purple-500" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.type}</h4>
                            <p className="text-sm text-gray-500">{activity.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{activity.date}</p>
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button variant="outline">
                      Vezi toată activitatea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Setări */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferințe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificări email</h4>
                        <p className="text-sm text-gray-500">Primește actualizări prin email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurează
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Limba interfață</h4>
                        <p className="text-sm text-gray-500">Română (implicit)</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Schimbă
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Export automat</h4>
                        <p className="text-sm text-gray-500">Salvează materialele automat</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Activează
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Securitate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Schimbă parola
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      Descarcă datele mele
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      Delogare din toate dispozitivele
                    </Button>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Șterge contul
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
