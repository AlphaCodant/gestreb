import React from 'react';
import { ArrowRight, TreePine, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { centreInfo } from '../../data/mock';

const HeroSection = () => {
  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/35382336/pexels-photo-35382336.jpeg"
          alt="Forêt tropicale"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-emerald-800/60 to-emerald-900/80" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
            <Calendar className="w-4 h-4" />
            <span>Depuis {centreInfo.dateCreation} au service de la forêt ivoirienne</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Centre de Gestion</span>
            <span className="block mt-2 bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              de Gagnoa
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            {centreInfo.description}
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <MapPin className="w-5 h-5 text-lime-300" />
              <span className="text-white font-semibold">{centreInfo.superficieGeree}</span>
              <span className="text-white/70">gérés</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <TreePine className="w-5 h-5 text-lime-300" />
              <span className="text-white font-semibold">{centreInfo.nombreForets}</span>
              <span className="text-white/70">forêts classées</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-white/90 font-semibold px-8 py-6 text-base shadow-xl shadow-black/20 transition-all hover:scale-105"
            >
              Découvrir nos activités
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base backdrop-blur-sm"
            >
              Accéder à GESTREB
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
