import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import BestsellerCard from '../BestsellerCard/BestsellerCard';
import data from '../../Data/data.json';

const ExploreBestsellers = () => {
  const { bestsellerCategories, bestsellerTabs } = data;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Explore <span className="text-gold">Bestsellers</span>
          </h2>
          <p className="text-[12px] text-muted mt-1 ml-3">Best bulk pricing tiers for your business</p>
        </div>
        <button className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors">
          VIEW ALL <ArrowRight size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scroll-hide pb-1">
        {bestsellerTabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === i
                ? 'bg-navy text-gold'
                : 'bg-panel text-muted border border-edge hover:border-gold hover:text-navy'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Category Image Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {bestsellerCategories.map((cat) => (
          <BestsellerCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};

export default ExploreBestsellers;
