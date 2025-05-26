
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-eduai-blue to-eduai-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EA</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EduAI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Tablou de bord
                </Link>
                <Link to="/generator" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Generator
                </Link>
                <Link to="/consultant" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Consultant AI
                </Link>
              </>
            ) : (
              <>
                <Link to="/pricing" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Prețuri
                </Link>
                <Link to="/generator" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Demo
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Cont
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Delogare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Autentificare</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-eduai-blue hover:bg-eduai-blue/90">
                    Începe gratuit
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Tablou de bord
                  </Link>
                  <Link to="/generator" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Generator
                  </Link>
                  <Link to="/consultant" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Consultant AI
                  </Link>
                  <Link to="/account" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Cont
                  </Link>
                  <button onClick={handleLogout} className="px-3 py-2 text-left text-gray-600 hover:text-eduai-blue">
                    Delogare
                  </button>
                </>
              ) : (
                <>
                  <Link to="/pricing" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Prețuri
                  </Link>
                  <Link to="/generator" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Demo
                  </Link>
                  <Link to="/login" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Autentificare
                  </Link>
                  <Link to="/register" className="px-3 py-2 text-gray-600 hover:text-eduai-blue">
                    Începe gratuit
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
