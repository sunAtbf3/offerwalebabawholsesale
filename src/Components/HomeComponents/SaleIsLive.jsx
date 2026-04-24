import React from 'react';
import { ArrowRight, Flame, Zap } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import data from '../../Data/data.json';

const SaleIsLive = () => {
  const saleProducts = data.products.filter(p => p.isSaleLive);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      {/* 1. Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full animate-pulse shadow-lg shadow-orange-200">
              <Flame size={18} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Live Now</span>
            </div>
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase">
            Sale is <span className="text-[#F59E0B]">Live</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            Exclusive Bulk Inventory for Partners <Zap size={14} className="text-[#F59E0B]" fill="currentColor" />
          </p>
        </div>

        <button className="hidden md:flex items-center gap-2 text-[11px] font-black text-[#0F172A] uppercase tracking-widest group bg-white border border-slate-200 px-6 py-3.5 rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all shadow-sm">
          View All Deals <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {saleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default SaleIsLive;
