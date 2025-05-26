
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      // Error handling este în AuthContext
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Autentificare</CardTitle>
              <CardDescription>
                Accesează-ți contul EduAI pentru a continua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialAuthButtons />

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Sau cu email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="introdu@email.ro"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Parolă</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Parola ta"
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-eduai-blue hover:bg-eduai-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se conectează...
                    </>
                  ) : (
                    'Autentificare'
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Nu ai cont?{' '}
                    <Link to="/register" className="text-eduai-blue hover:underline">
                      Creează cont gratuit
                    </Link>
                  </p>
                </div>

                {/* Demo accounts */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Conturi demo:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>📧 profesor@demo.ro | 🔑 demo123</p>
                    <p>📧 elev@demo.ro | 🔑 demo123</p>
                    <p>📧 parinte@demo.ro | 🔑 demo123</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
