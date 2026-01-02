import React from 'react';
import { TreePine, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ExternalLink, ArrowUp } from 'lucide-react';
import { centreInfo, unitesGestion } from '../../data/mock';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/Logo_gestreb.jpg"
                alt="Logo Gestreb"
                className="h-12 w-auto rounded-lg"
              />
              <div>
                <span className="font-bold text-xl text-white">GESTREB</span>
                <p className="text-xs text-gray-400">CG Gagnoa</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Le Centre de Gestion de Gagnoa, acteur majeur de la gestion forestière 
              en Côte d'Ivoire depuis 1991.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Liens rapides</h3>
            <ul className="space-y-3">
              {['Accueil', 'À Propos', 'Activités', 'Actualités', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '')}`}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* UGF */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Nos UGF</h3>
            <ul className="space-y-3">
              {unitesGestion.slice(0, 5).map((ugf) => (
                <li key={ugf.id}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <TreePine className="w-4 h-4" />
                    {ugf.nom}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                <span className="text-gray-400 text-sm">{centreInfo.contact.adresse}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-400 text-sm">{centreInfo.contact.telephone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-400 text-sm">{centreInfo.contact.email}</span>
              </li>
            </ul>

            {/* GESTREB Button */}
            <a
              href="#"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Accéder à GESTREB
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Centre de Gestion de Gagnoa. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center transition-all hover:scale-110 z-40"
        aria-label="Retour en haut"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
