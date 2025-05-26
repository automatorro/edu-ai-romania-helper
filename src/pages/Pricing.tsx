
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, Zap, Crown, Users } from 'lucide-react';

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = (planType: string) => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Pentru a te abona, trebuie să te autentifici mai întâi.",
        variant: "destructive",
      });
      return;
    }

    // Simulare proces de plată - în aplicația reală va fi înlocuit cu Stripe
    toast({
      title: "Redirecționare către plată",
      description: `Vei fi redirecționat către procesarea plății pentru planul ${planType}.`,
    });
  };

  const plans = [
    {
      name: 'Gratuit',
      description: 'Perfect pentru a testa platforma',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 materiale generate/lună',
        'Quiz-uri de bază',
        'Consultanță AI simplă',
        'Suport email',
        'Salvare materiale (7 zile)'
      ],
      limitations: [
        'Export PDF nu este disponibil',
        'Funcții avansate limitate',
        'Fără backup cloud',
        'Fără analize detaliate'
      ],
      buttonText: 'Începe gratuit',
      isPopular: false,
      icon: <Users className="h-6 w-6" />
    },
    {
      name: 'Premium',
      description: 'Ideal pentru profesori și elevi dedicați',
      price: { monthly: 29, yearly: 290 }, // 2 luni gratuite la plata anuală
      features: [
        '20 materiale generate/lună',
        'Toate tipurile de materiale',
        'Consultanță AI avansată',
        'Export PDF nelimitat',
        'Backup cloud automat',
        'Analize detaliate progres',
        'Suport prioritar',
        'Integrări externe',
        'Materiale personalizabile',
        'Planuri de studiu complexe'
      ],
      limitations: [],
      buttonText: user?.subscription === 'premium' ? 'Plan activ' : 'Upgrade acum',
      isPopular: true,
      icon: <Crown className="h-6 w-6" />
    }
  ];

  const faq = [
    {
      question: 'Pot să îmi schimb planul oricând?',
      answer: 'Da, poți să îți upgrazi sau downgrezi planul oricând. Modificările vor fi aplicate în următorul ciclu de facturare.'
    },
    {
      question: 'Există garanție de returnare a banilor?',
      answer: 'Oferim o garanție de 14 zile pentru returnarea banilor, fără întrebări, pentru planul Premium.'
    },
    {
      question: 'Materialele generate sunt adaptate la programa românească?',
      answer: 'Da, toate materialele sunt create special pentru sistemul educațional din România, incluzând programa de BAC și Evaluare Națională.'
    },
    {
      question: 'Pot să folosesc platforma pentru mai multe clase/materii?',
      answer: 'Absolut! Nu există limitări privind materiile sau clasele pentru care poți genera materiale educaționale.'
    },
    {
      question: 'Ce AI folosiți pentru generarea materialelor?',
      answer: 'Folosim o combinație de modele AI avansate, incluzând GPT și modele specializate pentru educație, optimizate pentru conținut în română.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Planuri și prețuri transparente
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Alege planul potrivit pentru nevoile tale educaționale. 
              Toate planurile includ accesul la AI-ul nostru educațional de ultimă generație.
            </p>
            
            {/* Yearly/Monthly Toggle */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Lunar
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800">
                  Economisești 20%
                </Badge>
              )}
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.isPopular ? 'border-2 border-eduai-blue shadow-lg' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-eduai-blue text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Cel mai popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${plan.isPopular ? 'bg-eduai-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-gray-500 ml-1">
                        LEI
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{isYearly ? 'an' : 'lună'}
                      </span>
                    </div>
                    {isYearly && plan.price.yearly > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Economisești {(plan.price.monthly * 12 - plan.price.yearly)} LEI/an
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900">Inclus în plan:</h4>
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 mb-6 pb-6 border-b">
                      <h4 className="font-semibold text-gray-900">Limitări:</h4>
                      {plan.limitations.map((limitation, lIndex) => (
                        <div key={lIndex} className="flex items-start space-x-2">
                          <span className="text-gray-400 mt-0.5">×</span>
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="mt-6">
                    {plan.name === 'Gratuit' ? (
                      user ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled={user.subscription === 'gratuit'}
                        >
                          {user.subscription === 'gratuit' ? 'Plan activ' : 'Schimbă la gratuit'}
                        </Button>
                      ) : (
                        <Link to="/register">
                          <Button className="w-full bg-eduai-blue hover:bg-eduai-blue/90">
                            {plan.buttonText}
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Button
                        className={`w-full ${plan.isPopular ? 'bg-eduai-blue hover:bg-eduai-blue/90' : 'bg-gray-900 hover:bg-gray-800'}`}
                        onClick={() => handleUpgrade(plan.name)}
                        disabled={user?.subscription === 'premium'}
                      >
                        {user?.subscription === 'premium' ? 'Plan activ' : plan.buttonText}
                      </Button>
                    )}
                  </div>

                  {plan.name === 'Premium' && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Plata se procesează prin Stripe. Poți anula oricând.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-eduai-blue to-eduai-green text-white">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    De ce să alegi EduAI Premium?
                  </h2>
                  <p className="text-xl opacity-90">
                    Investește în educația ta cu cele mai avansate unelte AI
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Economisește timp</h3>
                    <p className="text-sm opacity-90">
                      În medie, profesorii economisesc 10+ ore pe săptămână cu materialele noastre auto-generate
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Calitate superioară</h3>
                    <p className="text-sm opacity-90">
                      Toate materialele sunt revizuite și adaptate pentru programa românească
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Suport dedicat</h3>
                    <p className="text-sm opacity-90">
                      Echipa noastră de experți educaționali te susține în fiecare etapă
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Întrebări frecvente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faq.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gata să transformi educația cu AI?
                </h2>
                <p className="text-gray-600 mb-6">
                  Alătură-te celor peste 500 de profesori din România care folosesc deja EduAI 
                  pentru a crea experiențe educaționale extraordinare.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <Link to="/register">
                        <Button className="bg-eduai-blue hover:bg-eduai-blue/90" size="lg">
                          Începe cu planul gratuit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => handleUpgrade('Premium')}
                      >
                        Încearcă Premium
                      </Button>
                    </>
                  ) : user.subscription === 'gratuit' ? (
                    <Button 
                      className="bg-eduai-blue hover:bg-eduai-blue/90" 
                      size="lg"
                      onClick={() => handleUpgrade('Premium')}
                    >
                      Upgrade la Premium
                    </Button>
                  ) : (
                    <p className="text-green-600 font-semibold">
                      ✓ Ai deja planul Premium activ!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
