import React, { useState, useEffect } from 'react';
import { Menu, X, TreePine, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'À Propos', href: '#apropos' },
    { label: 'Activités', href: '#activites' },
    { label: 'Actualités', href: '#actualites' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#accueil" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/Logo_gestreb.jpg"
                alt="Logo Gestreb"
                className="h-12 w-auto rounded-lg shadow-md transition-transform group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <span className={cn(
                'font-bold text-xl tracking-tight transition-colors',
                isScrolled ? 'text-emerald-700' : 'text-white'
              )}>
                GESTREB
              </span>
              <p className={cn(
                'text-xs font-medium transition-colors',
                isScrolled ? 'text-gray-500' : 'text-white/80'
              )}>
                CG Gagnoa
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all hover:bg-white/10',
                  isScrolled
                    ? 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button
              className={cn(
                'font-semibold transition-all',
                isScrolled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white text-emerald-700 hover:bg-white/90'
              )}
            >
              Accéder à GESTREB
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled ? 'text-gray-700' : 'text-white'
            )}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg font-medium transition-all',
                    isScrolled
                      ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                      : 'text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accéder à GESTREB
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
