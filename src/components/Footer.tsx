
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo și descriere */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-eduai-blue to-eduai-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduAI</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Platforma educațională AI pentru profesori, elevi și părinți din România. 
              Generează materiale educaționale și primește consultanță personalizată.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-gray-500">Made with ❤️ in România</span>
            </div>
          </div>

          {/* Produse */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produse</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/generator" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Generator materiale
                </Link>
              </li>
              <li>
                <Link to="/consultant" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Consultant AI
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Prețuri
                </Link>
              </li>
            </ul>
          </div>

          {/* Suport */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suport</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@eduai.ro" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Ghid utilizare
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-eduai-blue transition-colors">
                  Politica de confidențialitate
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 EduAI. Toate drepturile rezervate.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">🇷🇴 Produs în România</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
