
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useAuth, User } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '' as User['userType'] | ''
  });
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Parolele nu se potrivesc');
      return;
    }

    if (!formData.userType) {
      alert('Selectează tipul de cont');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.userType);
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

  const handleUserTypeChange = (value: User['userType']) => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Creează cont gratuit</CardTitle>
              <CardDescription>
                Alătură-te comunității EduAI și începe să folosești AI în educație
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
                  <Label htmlFor="name">Nume complet</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nume și prenume"
                    required
                    className="mt-1"
                  />
                </div>

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
                  <Label htmlFor="userType">Tip de cont</Label>
                  <Select onValueChange={handleUserTypeChange} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selectează tipul de cont" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profesor">👩‍🏫 Profesor / Cadru didactic</SelectItem>
                      <SelectItem value="elev">🎓 Elev / Student</SelectItem>
                      <SelectItem value="parinte">👪 Părinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="password">Parolă</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minim 6 caractere"
                    required
                    minLength={6}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmă parola</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repetă parola"
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
                      Se creează contul...
                    </>
                  ) : (
                    'Creează cont gratuit'
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Ai deja cont?{' '}
                    <Link to="/login" className="text-eduai-blue hover:underline">
                      Autentifică-te
                    </Link>
                  </p>
                </div>

                <div className="mt-6 p-4 bg-eduai-blue/5 rounded-lg">
                  <p className="text-sm text-center text-gray-600">
                    🎉 <strong>Gratuit:</strong> 5 materiale pe lună + consultanță de bază
                  </p>
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

export default Register;
