import React, { useRef, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import data from '../../Data/data.json';
const variantStyles = {
  white: 'border-2 border-slate-100 bg-white',
  minimal: 'border-[1.5px] border-slate-200 bg-white',
  gold: 'border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white',
};

const brandBadgeStyles = {
  white: 'border border-blue-200 text-blue-600 bg-blue-50',
  minimal: 'border border-slate-200 text-slate-900 bg-slate-50',
  gold: 'border border-amber-300 text-amber-700 bg-amber-100',
};

const TrendingProducts = () => {
  const scrollRef = useRef(null);

  // const trendingCards = [
  //   { id: 101, brand: "realme", brandBadge: "OWS", name: "realme P4x 5G", price: "₹16,999", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop", variant: "white", specChips: ["D7400", "7000 mAh", "144 Hz"] },
  //   { id: 102, brand: "realme", brandBadge: "OWB", name: "realme P4x 5G", price: "₹16,999", image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop", variant: "minimal", specChips: ["D7400", "7000 mAh", "144 Hz"] },
  //   { id: 103, brand: "realme", brandBadge: "OWB", name: "realme P4x 5G", price: "₹16,999", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop", variant: "gold", specChips: ["D7400", "7000 mAh", "144 Hz"] },
  //   { id: 104, brand: "Samsung", brandBadge: "NEW", name: "Galaxy M54 5G", price: "₹24,999", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop", variant: "white", specChips: ["Exynos 1380", "6000 mAh", "120 Hz"] },
  //   { id: 105, brand: "Apple", brandBadge: "STOCK", name: "iPhone 15 Pro", price: "₹1,04,999", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop", variant: "minimal", specChips: ["A17 Pro", "Dynamic Island", "Titanium"] }
  // ];

  const { trendingCards } = data;

  // Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        // If we reached the end, scroll back to start, else scroll right
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll(1);
        }
      }
    }, 4000); // 4 seconds interval

    return () => clearInterval(interval);
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Scroll by one full container width for a clean slide
      const scrollAmount = container.offsetWidth;
      container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-10 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <span className="w-1.5 h-7 bg-amber-500 rounded-full" />
            Trending Products
          </h2>
          <p className="text-sm text-slate-500 mt-1 ml-4 font-medium">Bulk inventory moving fast</p>
        </div>
        <button className="text-xs font-black text-amber-600 flex items-center gap-1.5 hover:text-amber-500 transition-all uppercase tracking-wider group">
          VIEW ALL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative">
        {/* Navigation Buttons - PERMANENTLY VISIBLE */}
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl hover:bg-slate-900 hover:text-white transition-all duration-300 hidden md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl hover:bg-slate-900 hover:text-white transition-all duration-300 hidden md:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-hide pb-6 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {trendingCards.map((card) => (
            <div
              key={card.id}
              className={`
                ${variantStyles[card.variant]} 
                rounded-3xl p-6 
                /* 100% Responsive: 1 card mobile, 2 tablet, 3 desktop */
                w-[100%] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] 
                flex-shrink-0 snap-center
                cursor-pointer 
                transition-all duration-300
                hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1
              `}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 tracking-tight">{card.brand}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${brandBadgeStyles[card.variant]}`}>
                    {card.brandBadge}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900 mb-1 leading-tight line-clamp-1">{card.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 font-medium">
                    From <span className="text-slate-900 font-black text-lg">{card.price}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1">
                    {card.specChips.map((chip, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-slate-200 mx-2 font-light">|</span>}
                        <span className="text-[11px] font-bold text-slate-500">{chip}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Indicator (Only visible on mobile) */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
        <div className="w-2 h-1 bg-slate-200 rounded-full"></div>
        <div className="w-2 h-1 bg-slate-200 rounded-full"></div>
      </div>
    </section>
  );
};

export default TrendingProducts;