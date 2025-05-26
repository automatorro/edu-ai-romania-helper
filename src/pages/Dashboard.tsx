
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Brain, Users, Calendar, TrendingUp, FileText, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acces restricționat</CardTitle>
              <CardDescription>
                Trebuie să te autentifici pentru a accesa tabloul de bord.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/login">
                <Button className="bg-eduai-blue hover:bg-eduai-blue/90">
                  Autentifică-te
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const progressPercentage = (user.materialsCount / user.materialsLimit) * 100;

  // Mock data pentru materiale recente
  const recentMaterials = [
    {
      id: '1',
      title: 'Quiz Matematică Clasa a 8-a',
      type: 'quiz',
      subject: 'Matematică',
      createdAt: '2024-01-15',
      difficulty: 'intermediar'
    },
    {
      id: '2',
      title: 'Plan lecție Istoria României',
      type: 'plan',
      subject: 'Istorie',
      createdAt: '2024-01-14',
      difficulty: 'avansat'
    },
    {
      id: '3',
      title: 'Prezentare Sistemul solar',
      type: 'prezentare',
      subject: 'Științe',
      createdAt: '2024-01-13',
      difficulty: 'începător'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'plan': return '📋';
      case 'prezentare': return '📊';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'începător': return 'bg-green-100 text-green-800';
      case 'intermediar': return 'bg-yellow-100 text-yellow-800';
      case 'avansat': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bine ai venit, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              {user.userType === 'profesor' && 'Gestionează-ți materialele educaționale și monitorizează progresul elevilor.'}
              {user.userType === 'elev' && 'Explorează materialele personalizate și urmărește-ți progresul în învățare.'}
              {user.userType === 'parinte' && 'Monitorizează progresul copilului tău și primește recomandări educaționale.'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Utilizare materiale */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materiale folosite</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.materialsCount}/{user.materialsLimit}</div>
                <Progress value={progressPercentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {user.subscription === 'gratuit' ? 'Plan gratuit' : 'Plan premium'}
                </p>
              </CardContent>
            </Card>

            {/* Progres această săptămână */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progres săptămâna</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+15%</div>
                <p className="text-xs text-muted-foreground">
                  Mai multe materiale generate decât săptămâna trecută
                </p>
              </CardContent>
            </Card>

            {/* Consultări AI */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultări AI</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Recomandări primite luna aceasta
                </p>
              </CardContent>
            </Card>

            {/* Timp economisit */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Timp economisit</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12h</div>
                <p className="text-xs text-muted-foreground">
                  Față de pregătirea manuală
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Acțiuni rapide */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Acțiuni rapide</CardTitle>
                  <CardDescription>
                    Generează noi materiale sau primește consultanță AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/generator">
                      <Button className="w-full h-20 bg-eduai-blue hover:bg-eduai-blue/90 flex flex-col items-center justify-center">
                        <BookOpen className="h-6 w-6 mb-2" />
                        Generează materiale
                      </Button>
                    </Link>
                    <Link to="/consultant">
                      <Button className="w-full h-20 bg-eduai-green hover:bg-eduai-green/90 flex flex-col items-center justify-center">
                        <Brain className="h-6 w-6 mb-2" />
                        Consultant AI
                      </Button>
                    </Link>
                    {user.subscription === 'gratuit' && (
                      <Link to="/pricing" className="md:col-span-2">
                        <Button variant="outline" className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-eduai-blue hover:bg-eduai-blue/5">
                          <div className="text-center">
                            <p className="font-semibold">Upgrade la Premium</p>
                            <p className="text-sm text-gray-500">20 materiale/lună + funcții avansate</p>
                          </div>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Materiale recente */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Materialele mele recente</CardTitle>
                  <CardDescription>
                    Ultimele materiale generate și salvate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(material.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <p className="text-sm text-gray-500">{material.subject} • {material.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(material.difficulty)}>
                            {material.difficulty}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Vezi
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Vezi toate materialele
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Progres și recomandări */}
            <div className="space-y-6">
              {/* Status abonament */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Abonament
                    <Badge variant={user.subscription === 'premium' ? 'default' : 'secondary'}>
                      {user.subscription}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.subscription === 'gratuit' ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Ai folosit {user.materialsCount} din {user.materialsLimit} materiale gratuite
                      </p>
                      <Link to="/pricing">
                        <Button className="w-full bg-eduai-blue hover:bg-eduai-blue/90">
                          Upgrade la Premium
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-2">✓ Materiale nelimitate</p>
                      <p className="text-sm text-green-600 mb-2">✓ Consultanță avansată</p>
                      <p className="text-sm text-green-600">✓ Export PDF</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recomandări AI */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomandări AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">💡 Sugestie zilnică</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {user.userType === 'profesor' && 'Încearcă să generezi quiz-uri interactive pentru a îmbunătăți angajamentul elevilor.'}
                        {user.userType === 'elev' && 'Programează 30 min zilnic pentru rezolvarea quiz-urilor generate.'}
                        {user.userType === 'parinte' && 'Verifică progresul copilului tău săptămânal și oferă feedback pozitiv.'}
                      </p>
                    </div>
                    
                    <Link to="/consultant">
                      <Button variant="outline" className="w-full">
                        <Brain className="mr-2 h-4 w-4" />
                        Primește plan personalizat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar și events */}
              <Card>
                <CardHeader>
                  <CardTitle>Activități programate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Azi: Evaluare matematică</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Mâine: Quiz istorie BAC</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Vineri: Consultanță AI</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
