import React from 'react';
import { MapPin, Building2, Users, Target, TreePine, Award } from 'lucide-react';
import { centreInfo, unitesGestion, statistiques } from '../../data/mock';
import { cn } from '../../lib/utils';

const StatCard = ({ stat, index }) => {
  const icons = {
    MapPin: MapPin,
    Trees: TreePine,
    Building2: Building2,
    Award: Award
  };
  const Icon = icons[stat.icon] || MapPin;

  return (
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-emerald-900/5 border border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            {stat.suffix && (
              <span className="text-sm font-medium text-emerald-600">{stat.suffix}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
        </div>
      </div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <section id="apropos" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            À Propos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Le Centre de Gestion de Gagnoa
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {centreInfo.mission}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {statistiques.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image & UGF */}
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10">
              <img
                src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg"
                alt="Reboisement"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/80 text-sm mb-1">Direction du Centre</p>
                <p className="text-white font-semibold text-lg">{centreInfo.directeur}</p>
              </div>
            </div>

            {/* UGF Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Nos 7 Unités de Gestion Forestière
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unitesGestion.map((ugf) => (
                  <div
                    key={ugf.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium"
                  >
                    <TreePine className="w-4 h-4" />
                    {ugf.nom}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Zones & Info */}
          <div className="space-y-6">
            {/* Organization */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Organisation
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-300 mt-2" />
                  <span>01 Direction de Centre</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-300 mt-2" />
                  <span>02 Services (Technique & Commercial / Administratif & Financier)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-300 mt-2" />
                  <span>07 Unités de Gestion Forestière</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-300 mt-2" />
                  <span>01 Poste Avancé (Bounafla)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-300 mt-2" />
                  <span>02 Centres de production de plants</span>
                </li>
              </ul>
            </div>

            {/* Zones */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Zones de compétence
              </h3>
              <div className="space-y-2">
                {centreInfo.zones.map((zone, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{zone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
