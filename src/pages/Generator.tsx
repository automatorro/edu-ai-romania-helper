import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerateMaterial } from '@/hooks/useGenerateMaterial';
import { Loader2, Download, Save, Share, BookOpen, FileText, Presentation, Lightbulb, GraduationCap } from 'lucide-react';

interface GeneratedMaterial {
  type: string;
  subject: string;
  difficulty: string;
  content: any;
  createdAt: string;
}

const Generator = () => {
  const { user } = useAuth();
  const { mutate: generateMaterial, isPending: isGenerating } = useGenerateMaterial();
  const [formData, setFormData] = useState({
    subject: '',
    difficulty: '',
    materialType: '',
    gradeLevel: '',
    additionalInfo: ''
  });
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedMaterial | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.materialType || !formData.subject || !formData.difficulty) {
      return;
    }

    generateMaterial({
      materialType: formData.materialType as any,
      subject: formData.subject,
      gradeLevel: formData.gradeLevel || 'general',
      difficulty: formData.difficulty,
      additionalInfo: formData.additionalInfo
    }, {
      onSuccess: (data) => {
        if (data.data) {
          setGeneratedMaterial({
            type: data.data.type,
            subject: data.data.subject || formData.subject,
            difficulty: data.data.difficulty || formData.difficulty,
            content: data.data.content,
            createdAt: data.data.created_at
          });
        }
      }
    });
  };

  const generateMockContent = (type: string, subject: string, difficulty: string) => {
    switch (type) {
      case 'quiz':
        return {
          title: `Quiz ${subject} - Nivel ${difficulty}`,
          questions: [
            {
              question: `Care este principalul concept în ${subject}?`,
              options: ['Opțiunea A', 'Opțiunea B', 'Opțiunea C', 'Opțiunea D'],
              correct: 0,
              explanation: 'Explicația detaliată pentru această întrebare...'
            },
            {
              question: `Cum se aplică ${subject} în viața de zi cu zi?`,
              options: ['Prin exemple practice', 'Prin teorie', 'Prin exerciții', 'Prin toate variantele'],
              correct: 3,
              explanation: 'Această întrebare testează înțelegerea aplicativă...'
            },
            // ... încă 8 întrebări similare
          ]
        };
      
      case 'plan_lectie':
        return {
          title: `Plan de lecție ${subject}`,
          duration: '50 minute',
          objectives: [
            `Elevii vor înțelege conceptele de bază din ${subject}`,
            `Elevii vor putea aplica cunoștințele în situații practice`,
            `Elevii vor dezvolta gândirea critică în domeniu`
          ],
          activities: [
            { name: 'Introducere', duration: '10 min', description: 'Prezentarea subiectului și obiectivelor' },
            { name: 'Dezvoltare', duration: '25 min', description: 'Explicarea conceptelor principale cu exemple' },
            { name: 'Aplicare', duration: '10 min', description: 'Exerciții practice și diskuții' },
            { name: 'Încheiere', duration: '5 min', description: 'Recapitulare și teme pentru acasă' }
          ],
          resources: ['Manual', 'Prezentare PowerPoint', 'Fișe de lucru', 'Resurse online'],
          evaluation: 'Evaluare continuă prin întrebări și exerciții practice'
        };
      
      case 'prezentare':
        return {
          title: `Prezentare ${subject}`,
          slides: [
            { title: `Introducere în ${subject}`, content: 'Prezentarea subiectului și importanța acestuia' },
            { title: 'Concepte principale', content: 'Definițiile și explicațiile de bază' },
            { title: 'Exemple practice', content: 'Aplicații din viața reală și cazuri de studiu' },
            { title: 'Exerciții', content: 'Probleme și întrebări pentru consolidare' },
            { title: 'Concluzii', content: 'Rezumatul punctelor cheie și direcții viitoare' }
          ]
        };
      
      case 'analogie':
        return {
          title: `Analogii și exemple pentru ${subject}`,
          analogies: [
            {
              concept: `Primul concept din ${subject}`,
              analogy: 'Ca și cum ai construi o casă - ai nevoie de fundații solide',
              explanation: 'Această analogie ajută la înțelegerea importanței conceptelor de bază'
            },
            {
              concept: `Al doilea concept din ${subject}`,
              analogy: 'Precum rețeta unei prăjituri - fiecare ingredient are rolul său',
              explanation: 'Demonstrează cum diferitele elemente lucrează împreună'
            }
          ],
          examples: [
            `Exemplu 1: Aplicarea ${subject} în bucătărie`,
            `Exemplu 2: Folosirea ${subject} în sport`,
            `Exemplu 3: ${subject} în tehnologie`
          ]
        };
      
      case 'evaluare':
        return {
          title: `Evaluare finală ${subject}`,
          questions: [
            {
              question: `Definește conceptul principal din ${subject}`,
              type: 'descriptive',
              points: 10
            },
            {
              question: `Exemplifică aplicarea ${subject} în două domenii diferite`,
              type: 'application',
              points: 15
            }
          ],
          answers: [
            {
              question: 1,
              answer: 'Răspuns complet pentru cadrul didactic...',
              keyPoints: ['Punct cheie 1', 'Punct cheie 2', 'Punct cheie 3']
            }
          ],
          gradingRubric: 'Criteriile de evaluare și punctajul pentru fiecare secțiune'
        };
      
      default:
        return { message: 'Material generat cu succes!' };
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'quiz': 'Quiz',
      'plan_lectie': 'Plan de lecție',
      'prezentare': 'Prezentare',
      'analogie': 'Analogii și exemple',
      'evaluare': 'Evaluare finală'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <FileText className="h-5 w-5" />;
      case 'plan_lectie': return <BookOpen className="h-5 w-5" />;
      case 'prezentare': return <Presentation className="h-5 w-5" />;
      case 'analogie': return <Lightbulb className="h-5 w-5" />;
      case 'evaluare': return <GraduationCap className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderGeneratedContent = () => {
    if (!generatedMaterial) return null;

    const { content, type } = generatedMaterial;

    switch (type) {
      case 'quiz':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{content.title}</h3>
            <div className="space-y-4">
              {content.questions.map((q: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">Întrebarea {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className={`p-2 rounded ${optIndex === q.correct ? 'bg-green-100 text-green-800' : 'bg-gray-50'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === q.correct && ' ✓'}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Explicație:</strong> {q.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'plan_lectie':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{content.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Obiective</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.objectives.map((obj: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span className="text-sm">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activități ({content.duration})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.activities.map((activity: any, index: number) => (
                      <div key={index} className="border-l-2 border-eduai-blue pl-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{activity.name}</span>
                          <span className="text-sm text-gray-500">{activity.duration}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'prezentare':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{content.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.slides.map((slide: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Slide {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">{slide.title}</h4>
                    <p className="text-sm text-gray-600">{slide.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'analogie':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{content.title}</h3>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analogii</CardTitle>
                </CardHeader>
                <CardContent>
                  {content.analogies.map((analogy: any, index: number) => (
                    <div key={index} className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">{analogy.concept}</h4>
                      <p className="text-yellow-700 italic">"{analogy.analogy}"</p>
                      <p className="text-sm text-yellow-600 mt-2">{analogy.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'evaluare':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">{content.title}</h3>
            <div className="space-y-4">
              {content.questions.map((q: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base flex justify-between">
                      Întrebarea {index + 1}
                      <Badge className="bg-eduai-blue text-white">{q.points} puncte</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2">{q.question}</p>
                    <p className="text-sm text-gray-500">Tip: {q.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Material generat cu succes!</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Generator materiale educaționale 🤖
            </h1>
            <p className="text-gray-600">
              Generează automat quiz-uri, planuri de lecții, prezentări și materiale educaționale personalizate cu AI
            </p>
            {!user && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>🎯 Testează acum fără cont!</strong> Poți genera materiale demo pentru a testa funcționalitatea. 
                      Pentru materiale complete generate cu AI și salvare, creează un cont gratuit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formular */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Configurare material</CardTitle>
                  <CardDescription>
                    Completează detaliile pentru a genera materialul perfect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="subject">Subiect / Materie</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="ex. Matematică clasa a 8-a, Istorie BAC"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gradeLevel">Clasa / Nivel</Label>
                      <Input
                        id="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                        placeholder="ex. Clasa a 8-a, Liceu, BAC"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Nivel de dificultate</Label>
                      <Select onValueChange={(value) => handleInputChange('difficulty', value)} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selectează nivelul" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="începător">🟢 Începător</SelectItem>
                          <SelectItem value="intermediar">🟡 Intermediar</SelectItem>
                          <SelectItem value="avansat">🔴 Avansat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="materialType">Tip material</Label>
                      <Select onValueChange={(value) => handleInputChange('materialType', value)} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selectează tipul" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>Quiz (10 întrebări)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="plan_lectie">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4" />
                              <span>Plan de lecție</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="prezentare">
                            <div className="flex items-center space-x-2">
                              <Presentation className="h-4 w-4" />
                              <span>Prezentare</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="analogie">
                            <div className="flex items-center space-x-2">
                              <Lightbulb className="h-4 w-4" />
                              <span>Analogii și exemple</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="evaluare">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>Evaluare finală</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Informații suplimentare (opțional)</Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        placeholder="ex. Focusează pe teorema lui Pitagora, Include exemple din viața reală"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-eduai-blue hover:bg-eduai-blue/90"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se generează...
                        </>
                      ) : (
                        <>
                          {formData.materialType && getTypeIcon(formData.materialType)}
                          <span className="ml-2">
                            {user ? 'Generează material' : 'Generează material demo'}
                          </span>
                        </>
                      )}
                    </Button>

                    {user && (
                      <div className="text-sm text-center text-gray-500">
                        Materiale folosite: {user.materialsCount}/{user.materialsLimit}
                        {user.subscription === 'gratuit' && user.materialsCount >= user.materialsLimit && (
                          <p className="text-red-500 mt-1">
                            Limită atinsă. <a href="/pricing" className="underline">Upgrade la Premium</a>
                          </p>
                        )}
                      </div>
                    )}

                    {!user && (
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-800">
                          <strong>🎯 Testare gratuită:</strong> Poți genera materiale demo fără cont pentru a testa funcționalitatea.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Pentru materiale complete cu AI și salvare, creează un cont gratuit.
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Rezultat */}
            <div className="lg:col-span-2">
              {generatedMaterial ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(generatedMaterial.type)}
                        <CardTitle>Material generat</CardTitle>
                        {!user && <Badge variant="outline">Demo</Badge>}
                      </div>
                      <div className="flex space-x-2">
                        {user && (
                          <Button variant="outline" size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            Salvează
                          </Button>
                        )}
                        {user?.subscription === 'premium' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          Partajează
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {getTypeLabel(generatedMaterial.type)} pentru {generatedMaterial.subject} 
                      • Nivel {generatedMaterial.difficulty}
                      {!user && ' • Versiune demo'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderGeneratedContent()}
                    
                    {!user && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <h4 className="font-semibold text-blue-900 mb-2">🚀 Vrei materiale complete generate cu AI?</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Creează un cont gratuit pentru materiale complete, salvare automată și funcții avansate!
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" className="bg-eduai-blue hover:bg-eduai-blue/90">
                              <a href="/register">Creează cont gratuit</a>
                            </Button>
                            <Button variant="outline" size="sm">
                              <a href="/login">Am deja cont</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {user ? 'Gata să generez materiale educaționale!' : 'Testează generarea de materiale!'}
                    </h3>
                    <p className="text-gray-600">
                      {user 
                        ? 'Completează formularul din stânga și voi crea materialul perfect pentru nevoile tale educaționale.'
                        : 'Completează formularul din stânga pentru a testa generarea de materiale demo fără să ai nevoie de cont!'
                      }
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

export default Generator;
