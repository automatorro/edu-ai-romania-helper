
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Link-ul de confirmare este invalid sau a expirat.');
          return;
        }

        console.log('Confirming email with token...');

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Eroare la confirmarea email-ului. Link-ul poate fi invalid sau expirat.');
          return;
        }

        console.log('Email confirmed successfully:', data);
        setStatus('success');
        setMessage('Email-ul a fost confirmat cu succes! Contul tău este acum activ.');
        
        toast({
          title: "Email confirmat!",
          description: "Contul tău este acum activ. Poți să te autentifici.",
        });

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (error: any) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Confirmare Email
              </CardTitle>
              <CardDescription>
                {status === 'loading' && 'Se confirmă email-ul...'}
                {status === 'success' && 'Email confirmat cu succes!'}
                {status === 'error' && 'Eroare la confirmare'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {status === 'loading' && (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-eduai-blue" />
                  <p className="text-gray-600">Se procesează confirmarea...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <p className="text-green-700">{message}</p>
                  <p className="text-sm text-gray-600">
                    Vei fi redirecționat către dashboard în câteva secunde...
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-eduai-blue hover:bg-eduai-blue/90"
                  >
                    Du-mă la Dashboard
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <XCircle className="h-12 w-12 mx-auto text-red-500" />
                  <p className="text-red-700">{message}</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => navigate('/register')}
                      className="w-full bg-eduai-blue hover:bg-eduai-blue/90"
                    >
                      Înregistrează-te din nou
                    </Button>
                    <Button 
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="w-full"
                    >
                      Mergi la Login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmEmail;
