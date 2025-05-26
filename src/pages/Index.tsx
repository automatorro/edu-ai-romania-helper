
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Brain, Users, Zap, CheckCircle, Star } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Educația viitorului cu
            <span className="block text-yellow-300">Inteligența Artificială</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Generează materiale educaționale personalizate și primește consultanță AI 
            pentru profesori, elevi și părinți din România
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-eduai-blue hover:bg-gray-100 text-lg px-8 py-3">
                  Accesează tabloul de bord
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-eduai-blue hover:bg-gray-100 text-lg px-8 py-3">
                    Începe gratuit
                  </Button>
                </Link>
                <Link to="/generator">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-eduai-blue text-lg px-8 py-3">
                    Vezi demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tot ce ai nevoie pentru educație
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platformă completă cu AI pentru generarea de materiale educaționale și consultanță personalizată
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Generator materiale */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-eduai-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Generator materiale</CardTitle>
                <CardDescription>
                  Quiz-uri, planuri de lecții, prezentări și analogii generate automat
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Consultant AI */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-eduai-green rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Consultant AI</CardTitle>
                <CardDescription>
                  Recomandări personalizate și planuri de studiu adaptate nevoilor tale
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Multi-utilizator */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Pentru toți</CardTitle>
                <CardDescription>
                  Soluții pentru profesori, elevi și părinți cu funcții adaptate fiecăruia
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Rapid și eficient */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Rapid și eficient</CardTitle>
                <CardDescription>
                  Generează materiale în secunde și economisește ore de pregătire
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Despre EduAI România
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Prima platformă educațională cu AI dezvoltată special pentru sistemul educațional român. 
                Combinăm tehnologia avansată cu înțelegerea nevoilor educaționale locale.
              </p>
              
              <div className="space-y-4">
                {[
                  "Quiz-uri și planuri adaptate la programa românească",
                  "Consultanță AI în limba română",
                  "Materiale pentru toate nivelurile de învățământ", 
                  "Suport pentru pregătirea BAC și Evaluare Națională",
                  "Analogii și exemple din viața de zi cu zi"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-eduai-green flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-eduai-blue to-eduai-green p-8 rounded-2xl text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Statistici impresionante</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold">10K+</div>
                    <div className="text-sm opacity-90">Materiale generate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-sm opacity-90">Profesori activi</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-sm opacity-90">Satisfacție utilizatori</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Disponibilitate AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce spun utilizatorii noștri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Prof. Maria Popescu",
                role: "Profesor matematică",
                content: "EduAI mi-a revoluționat modul de pregătire a lecțiilor. Generez quiz-uri pentru clasa a 8-a în doar câteva minute!",
                rating: 5
              },
              {
                name: "Andrei Ionescu",
                role: "Elev clasa a XII-a",
                content: "Consultantul AI m-a ajutat să îmi fac un plan de studiu perfect pentru BAC. Recomandările sunt foarte precise.",
                rating: 5
              },
              {
                name: "Elena Moldovan",
                role: "Părinte",
                content: "Ca părinte, văd progresul copilului meu și știu exact pe ce să se concentreze. O platformă excepțională!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Gata să transformi educația cu AI?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Alătură-te comunității de educatori inovatori din România și descoperă puterea AI în educație.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-eduai-blue hover:bg-gray-100 text-lg px-8 py-3">
                  Începe gratuit astăzi
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-eduai-blue text-lg px-8 py-3">
                  Vezi planurile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
