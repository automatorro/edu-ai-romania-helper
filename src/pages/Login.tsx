
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);
  
  const { login, register, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('User is logged in, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check if admin email is entered
  useEffect(() => {
    setShowAdminSetup(formData.email === 'admin@automator.ro');
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login submission error:', error);
      // Error handling este în AuthContext
    }
  };

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminPassword !== confirmAdminPassword) {
      alert('Parolele nu se potrivesc!');
      return;
    }
    
    if (adminPassword.length < 6) {
      alert('Parola trebuie să aibă cel puțin 6 caractere!');
      return;
    }

    setIsSettingUpAdmin(true);
    try {
      await register('admin@automator.ro', adminPassword, 'Administrator', 'profesor');
      // After successful registration, the user will be automatically logged in
    } catch (error) {
      console.error('Admin setup error:', error);
    } finally {
      setIsSettingUpAdmin(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Show loading if authentication is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {showAdminSetup ? 'Configurare Administrator' : 'Autentificare'}
              </CardTitle>
              <CardDescription>
                {showAdminSetup 
                  ? 'Configurează parola pentru contul de administrator'
                  : 'Accesează-ți contul EduAI pentru a continua'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showAdminSetup && <SocialAuthButtons />}

              {!showAdminSetup && (
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
              )}

              {showAdminSetup ? (
                <div className="mt-6">
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Configurare Administrator</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Setează parola pentru contul de administrator principal.
                    </p>
                  </div>

                  <form onSubmit={handleAdminSetup} className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email">Email Administrator</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value="admin@automator.ro"
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="admin-password">Parolă</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Parola administratorului"
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm-admin-password">Confirmă Parola</Label>
                      <Input
                        id="confirm-admin-password"
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Confirmă parola"
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-eduai-blue hover:bg-eduai-blue/90"
                      disabled={isSettingUpAdmin}
                    >
                      {isSettingUpAdmin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se configurează...
                        </>
                      ) : (
                        'Configurează Contul Admin'
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
