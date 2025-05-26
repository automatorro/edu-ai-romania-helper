
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, Clock, Target, BookOpen, TrendingUp } from 'lucide-react';

interface Consultation {
  objectives: string;
  timeframe: string;
  currentLevel: string;
  plan: any;
  createdAt: string;
}

const Consultant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    objectives: '',
    timeframe: '',
    currentLevel: '',
    specificNeeds: ''
  });
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);

    // Simulare consultanță AI - în aplicația reală va fi înlocuită cu API-uri AI reale
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockPlan = generateMockPlan(formData);
      
      const newConsultation: Consultation = {
        objectives: formData.objectives,
        timeframe: formData.timeframe,
        currentLevel: formData.currentLevel,
        plan: mockPlan,
        createdAt: new Date().toISOString()
      };

      setConsultation(newConsultation);
      
      toast({
        title: "Plan personalizat generat! 🎯",
        description: "Consultantul AI a creat recomandări specifice pentru obiectivele tale.",
      });

    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut genera consultanța. Încearcă din nou.",
        variant: "destructive",
      });
    }
    
    setIsGenerating(false);
  };

  const generateMockPlan = (data: typeof formData) => {
    const timeFrameWeeks = data.timeframe === 'scurt' ? 4 : data.timeframe === 'mediu' ? 8 : 12;
    
    return {
      summary: `Plan personalizat pe ${timeFrameWeeks} săptămâni pentru atingerea obiectivelor tale educaționale`,
      timeEstimate: `${timeFrameWeeks} săptămâni`,
      difficulty: data.currentLevel,
      weeklyPlan: Array.from({ length: Math.min(timeFrameWeeks, 4) }, (_, index) => ({
        week: index + 1,
        title: `Săptămâna ${index + 1}: ${getWeekTitle(index, data.objectives)}`,
        goals: getWeekGoals(index, data.objectives),
        activities: getWeekActivities(index, data.objectives),
        timeRequired: '5-7 ore/săptămână',
        resources: getWeekResources(index, data.objectives)
      })),
      recommendations: [
        `Bazându-te pe nivelul ${data.currentLevel}, recomand să începi cu exerciții fundamentale`,
        `Pentru obiectivele tale, este important să dedici timp zilnic practicii`,
        `Monitorizează progresul săptămânal și ajustează planul dacă este necesar`,
        `Folosește materialele generate de EduAI pentru a-ți consolida cunoștințele`
      ],
      assessmentSchedule: [
        { week: 2, type: 'Evaluare intermediară', description: 'Verificarea progresului și ajustări' },
        { week: 4, type: 'Evaluare finală', description: 'Testarea cunoștințelor dobândite' }
      ],
      nextSteps: [
        'Continuă cu materiale de nivel superior',
        'Aplică cunoștințele în proiecte practice',
        'Caută feedback de la profesori sau colegi',
        'Explorează domenii conexe pentru o înțelegere completă'
      ]
    };
  };

  const getWeekTitle = (weekIndex: number, objectives: string) => {
    const titles = [
      'Fundamentele și conceptele de bază',
      'Aplicarea practică și exerciții',
      'Consolidarea cunoștințelor',
      'Evaluare și perfecționare'
    ];
    return titles[weekIndex] || 'Dezvoltare continuă';
  };

  const getWeekGoals = (weekIndex: number, objectives: string) => {
    const goals = [
      ['Înțelegerea conceptelor fundamentale', 'Stabilirea bazelor teoretice'],
      ['Aplicarea cunoștințelor în exerciții', 'Dezvoltarea abilităților practice'],
      ['Consolidarea prin repetare', 'Rezolvarea problemelor complexe'],
      ['Evaluarea progresului', 'Pregătirea pentru următoarea etapă']
    ];
    return goals[weekIndex] || ['Continuarea dezvoltării', 'Menținerea progresului'];
  };

  const getWeekActivities = (weekIndex: number, objectives: string) => {
    const activities = [
      ['Studierea materialelor teoretice', 'Quiz-uri de verificare', 'Notarea conceptelor cheie'],
      ['Exerciții practice zilnice', 'Rezolvarea problemelor', 'Discuții și clarificări'],
      ['Repetarea materialului', 'Exerciții avansate', 'Pregătirea pentru evaluare'],
      ['Test de evaluare', 'Analiza rezultatelor', 'Planificarea următoarelor pași']
    ];
    return activities[weekIndex] || ['Activități de menținere', 'Progres continuu'];
  };

  const getWeekResources = (weekIndex: number, objectives: string) => {
    const resources = [
      ['Manual de bază', 'Materiale online', 'Video-uri explicative'],
      ['Exerciții practice', 'Aplicații interactive', 'Exemple rezolvate'],
      ['Teste de verificare', 'Fișe de recapitulare', 'Resurse suplimentare'],
      ['Teste de evaluare', 'Feedback personalizat', 'Planuri de dezvoltare']
    ];
    return resources[weekIndex] || ['Resurse generale', 'Materiale de susținere'];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consultant AI educațional 🧠
            </h1>
            <p className="text-gray-600">
              Primește recomandări personalizate, planuri de studiu și strategii educaționale adaptate nevoilor tale
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formular consultanță */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Descrie obiectivele tale</CardTitle>
                  <CardDescription>
                    Spune-mi ce vrei să realizezi și voi crea un plan personalizat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="objectives">Obiective educaționale</Label>
                      <Textarea
                        id="objectives"
                        value={formData.objectives}
                        onChange={(e) => handleInputChange('objectives', e.target.value)}
                        placeholder="ex. Pregătire BAC la matematică, îmbunătățire note la română, pregătire admitere facultate"
                        required
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeframe">Timp disponibil</Label>
                      <Select onValueChange={(value) => handleInputChange('timeframe', value)} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Cât timp ai la dispoziție?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scurt">📅 Scurt termen (1-4 săptămâni)</SelectItem>
                          <SelectItem value="mediu">🗓️ Mediu termen (1-2 luni)</SelectItem>
                          <SelectItem value="lung">📆 Lung termen (3+ luni)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currentLevel">Nivelul actual</Label>
                      <Select onValueChange={(value) => handleInputChange('currentLevel', value)} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Cum îți evaluezi nivelul actual?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="începător">🟢 Începător</SelectItem>
                          <SelectItem value="intermediar">🟡 Intermediar</SelectItem>
                          <SelectItem value="avansat">🔴 Avansat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="specificNeeds">Nevoi specifice (opțional)</Label>
                      <Textarea
                        id="specificNeeds"
                        value={formData.specificNeeds}
                        onChange={(e) => handleInputChange('specificNeeds', e.target.value)}
                        placeholder="ex. Am dificultăți cu algebră, prefer învățarea vizuală, am timp limitat"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-eduai-green hover:bg-eduai-green/90"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se analizează...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Primește plan personalizat
                        </>
                      )}
                    </Button>

                    {!user && (
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-green-800">
                          <strong>Demo gratuit:</strong> Poți primi o consultanță demonstrativă fără cont.
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Pentru consultanță completă și urmărirea progresului, creează un cont.
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Rezultat consultanță */}
            <div className="lg:col-span-2">
              {consultation ? (
                <div className="space-y-6">
                  {/* Sumar plan */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-eduai-green" />
                        <CardTitle>Planul tău personalizat</CardTitle>
                      </div>
                      <CardDescription>
                        {consultation.plan.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{consultation.plan.timeEstimate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Nivel {consultation.plan.difficulty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Progres urmărit</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan săptămânal */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan săptămânal detaliat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {consultation.plan.weeklyPlan.map((week: any, index: number) => (
                          <div key={index} className="border-l-4 border-eduai-green pl-4">
                            <h3 className="font-semibold text-lg">{week.title}</h3>
                            <p className="text-sm text-gray-500 mb-3">{week.timeRequired}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">🎯 Obiective</h4>
                                <ul className="text-sm space-y-1">
                                  {week.goals.map((goal: string, gIndex: number) => (
                                    <li key={gIndex} className="flex items-start space-x-1">
                                      <span className="text-eduai-green">•</span>
                                      <span>{goal}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">📝 Activități</h4>
                                <ul className="text-sm space-y-1">
                                  {week.activities.map((activity: string, aIndex: number) => (
                                    <li key={aIndex} className="flex items-start space-x-1">
                                      <span className="text-eduai-blue">•</span>
                                      <span>{activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">📚 Resurse</h4>
                                <ul className="text-sm space-y-1">
                                  {week.resources.map((resource: string, rIndex: number) => (
                                    <li key={rIndex} className="flex items-start space-x-1">
                                      <span className="text-purple-500">•</span>
                                      <span>{resource}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recomandări și evaluări */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>💡 Recomandări personalizate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {consultation.plan.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 mt-1">💡</span>
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>📊 Program evaluări</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {consultation.plan.assessmentSchedule.map((assessment: any, index: number) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-blue-900">{assessment.type}</span>
                                <span className="text-sm text-blue-600">Săpt. {assessment.week}</span>
                              </div>
                              <p className="text-sm text-blue-700 mt-1">{assessment.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pași următori */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🚀 Pași următori</CardTitle>
                      <CardDescription>
                        Ce să faci după finalizarea acestui plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultation.plan.nextSteps.map((step: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-eduai-green font-bold">{index + 1}</span>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acțiuni */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {user && (
                      <Button variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Salvează planul
                      </Button>
                    )}
                    <Button variant="outline">
                      <Target className="mr-2 h-4 w-4" />
                      Începe planul
                    </Button>
                    {user?.subscription === 'premium' && (
                      <Button variant="outline">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Monitorizare progres
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">🧠</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Consultantul tău AI personal
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Descrie-mi obiectivele tale educaționale și voi crea un plan personalizat 
                      cu recomandări specifice, timeline realist și resurse adaptate.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Consultant;
