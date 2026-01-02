import React from 'react';
import { Sprout, Shovel, Leaf, TreeDeciduous, ArrowRight } from 'lucide-react';
import { activites } from '../../data/mock';
import { cn } from '../../lib/utils';

const iconMap = {
  Sprout: Sprout,
  Shovel: Shovel,
  Leaf: Leaf,
  TreeDeciduous: TreeDeciduous
};

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50',
    bgHover: 'group-hover:bg-emerald-100',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500'
  },
  sky: {
    bg: 'bg-sky-50',
    bgHover: 'group-hover:bg-sky-100',
    icon: 'text-sky-600',
    border: 'border-sky-200',
    accent: 'bg-sky-500'
  },
  lime: {
    bg: 'bg-lime-50',
    bgHover: 'group-hover:bg-lime-100',
    icon: 'text-lime-600',
    border: 'border-lime-200',
    accent: 'bg-lime-500'
  },
  amber: {
    bg: 'bg-amber-50',
    bgHover: 'group-hover:bg-amber-100',
    icon: 'text-amber-600',
    border: 'border-amber-200',
    accent: 'bg-amber-500'
  }
};

const ActivityCard = ({ activity, index }) => {
  const Icon = iconMap[activity.icon] || Leaf;
  const colors = colorMap[activity.color] || colorMap.emerald;

  return (
    <div
      className={cn(
        'group relative bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100',
        'hover:shadow-xl hover:-translate-y-2 transition-all duration-300',
        'overflow-hidden'
      )}
    >
      {/* Accent Line */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', colors.accent)} />
      
      {/* Number Badge */}
      <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 font-bold text-sm">0{index + 1}</span>
      </div>

      {/* Icon */}
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors',
        colors.bg,
        colors.bgHover
      )}>
        <Icon className={cn('w-8 h-8', colors.icon)} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {activity.titre}
      </h3>
      <p className="text-gray-600 leading-relaxed mb-6">
        {activity.description}
      </p>

      {/* Link */}
      <a
        href="#"
        className={cn(
          'inline-flex items-center gap-2 font-semibold text-sm transition-all',
          colors.icon,
          'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
        )}
      >
        En savoir plus
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
};

const ActivitiesSection = () => {
  return (
    <section id="activites" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Nos Activités
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Au cœur de la gestion forestière
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            De la production de plants au suivi sylvicole, nous accompagnons chaque étape 
            du cycle de vie des forêts pour garantir un reboisement durable et efficace.
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activites.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </div>

        {/* Process Flow */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">
            Le cycle du reboisement
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {['Pépinière', 'Préparation', 'Planting', 'Entretien', 'Croissance', 'Récolte'].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  {step}
                </div>
                {index < 5 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
