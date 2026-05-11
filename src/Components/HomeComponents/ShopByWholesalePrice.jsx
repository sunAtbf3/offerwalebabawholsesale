import React from 'react';
import { ArrowRight } from 'lucide-react';
import data from '../../Data/data.json';
import { Link } from 'react-router-dom';

const ShopByWholesalePrice = () => {
  const { priceRanges } = data;
  const topRow = priceRanges.slice(0, 4);
  const bottomRow = priceRanges.slice(4);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Shop by wholesale price
          </h2>
          <p className="text-[12px] text-muted mt-1 ml-3">Best bulk pricing tiers for your business</p>
        </div>
      </div>

      {/* Top Row — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {topRow.map((range) => (
          <Link
            to={range.path}
            key={range.id}
            className="bg-navy rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
          >
            {/* Badge */}
            <span className={`${range.badgeColor} text-white text-[8px] font-extrabold px-2 py-0.5 rounded-sm inline-block mb-3`}>
              {range.badge}
            </span>
            {/* Price */}
            <h3 className="text-white text-xl font-extrabold mb-1">{range.label}</h3>
            <p className="text-slate-400 text-[10px] font-semibold mb-3">{range.sublabel}</p>
            {/* Arrow */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider">Explore</span>
              <ArrowRight size={14} className="text-gold group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full" />
          </Link>
        ))}
      </div>

      {/* Bottom Row — 2 cards (wider) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bottomRow.map((range) => (
          <Link
            key={range.id}
            to={range.path}
            className="bg-navy rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
          >
            <span className={`${range.badgeColor} text-white text-[8px] font-extrabold px-2 py-0.5 rounded-sm inline-block mb-3`}>
              {range.badge}
            </span>
            <h3 className="text-white text-xl font-extrabold mb-1">{range.label}</h3>
            <p className="text-slate-400 text-[10px] font-semibold mb-3">{range.sublabel}</p>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider">Explore</span>
              <ArrowRight size={14} className="text-gold group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByWholesalePrice;
