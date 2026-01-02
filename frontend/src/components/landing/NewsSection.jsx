import React from 'react';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { actualites } from '../../data/mock';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const categoryColors = {
  Reboisement: 'bg-emerald-100 text-emerald-700',
  Formation: 'bg-sky-100 text-sky-700',
  Partenariat: 'bg-amber-100 text-amber-700'
};

const NewsCard = ({ article, featured = false }) => {
  return (
    <article
      className={cn(
        'group bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100',
        'hover:shadow-xl transition-all duration-300',
        featured ? 'lg:col-span-2 lg:grid lg:grid-cols-2' : ''
      )}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden',
        featured ? 'h-64 lg:h-full' : 'h-48'
      )}>
        <img
          src={article.image}
          alt={article.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            categoryColors[article.categorie] || 'bg-gray-100 text-gray-700'
          )}>
            {article.categorie}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          {article.date}
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors',
          featured ? 'text-2xl' : 'text-lg'
        )}>
          {article.titre}
        </h3>

        {/* Summary */}
        <p className={cn(
          'text-gray-600 mb-4 line-clamp-3',
          featured ? 'text-base' : 'text-sm'
        )}>
          {article.resume}
        </p>

        {/* Read More */}
        <a
          href="#"
          className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors"
        >
          Lire l'article
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
};

const NewsSection = () => {
  return (
    <section id="actualites" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              Actualités
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Dernières nouvelles
            </h2>
          </div>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 self-start sm:self-auto"
          >
            Voir toutes les actualités
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {actualites.map((article, index) => (
            <NewsCard
              key={article.id}
              article={article}
              featured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
