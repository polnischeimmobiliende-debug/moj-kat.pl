import { useState, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, navigate } from './Router';
import {
  Home,
  Search,
  PlusCircle,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  LogIn
} from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <Home className="w-7 h-7 text-teal-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                mój-kąt<span className="text-teal-600">.pl</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors no-underline"
              >
                <Search className="w-4 h-4" />
                Szukaj
              </Link>

              {user && (
                <>
                  <Link
                    to="/add"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors no-underline"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Dodaj ogłoszenie
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors no-underline"
                  >
                    <Heart className="w-4 h-4" />
                    Ulubione
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors no-underline"
                  >
                    <User className="w-4 h-4" />
                    Moje konto
                  </Link>
                </>
              )}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors no-underline"
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj
                </Link>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg no-underline"
              >
                <Search className="w-4 h-4" />
                Szukaj nieruchomości
              </Link>

              {user && (
                <>
                  <Link
                    to="/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg no-underline"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Dodaj ogłoszenie
                  </Link>

                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg no-underline"
                  >
                    <Heart className="w-4 h-4" />
                    Ulubione
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg no-underline"
                  >
                    <User className="w-4 h-4" />
                    Moje konto
                  </Link>
                </>
              )}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj się
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg no-underline"
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-6 h-6 text-teal-400" />
                <span className="text-lg font-bold text-white">
                  mój-kąt<span className="text-teal-400">.pl</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Twój portal nieruchomości. Znajdź wymarzone mieszkanie, dom lub działkę w całej Polsce.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Nawigacja</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-teal-400 no-underline">
                    Szukaj nieruchomości
                  </Link>
                </li>
                <li>
                  <Link to="/add" className="text-gray-400 hover:text-teal-400 no-underline">
                    Dodaj ogłoszenie
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Kontakt</h3>
              <ul className="space-y-2 text-sm">
                <li>rafal.wichorowski@gmail.com</li>
                <li>+48 790 308 338</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; 2026 mój-kąt.pl. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}