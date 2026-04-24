import React from 'react';
import { ArrowRight } from 'lucide-react';
import data from '../../Data/data.json';

const ShopByCategory = () => {
  const { categories } = data;

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Shop by Category
          </h2>
          <p className="text-[12px] text-muted mt-1 ml-3">Best bulk pricing tiers for your business</p>
        </div>
        <button className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors">
          VIEW ALL <ArrowRight size={14} />
        </button>
      </div>

      {/* Category Circles */}
      <div className="flex gap-6 overflow-x-auto scroll-hide pb-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center gap-2.5 cursor-pointer group shrink-0">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-edge group-hover:border-gold transition-colors bg-panel">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] font-bold text-navy text-center max-w-[80px] leading-tight group-hover:text-gold-dark transition-colors">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
