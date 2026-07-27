import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, ShieldCheck, Package, Truck } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const HeroBanner = () => {
  const slides = [
    // {
    //   id: 1,
    //   tag: "Bulk Deal",
    //   title: "Smartphones & Accessories",
    //   image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop",
    //   btnText: "Shop Electronics"
    // },
    // {
    //   id: 2,
    //   tag: "New Arrival",
    //   title: "Premium Men's Apparel",
    //   image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop",
    //   btnText: "View Wholesale Fashion"
    // },
    // {
    //   id: 3,
    //   tag: "Clearance",
    //   title: "Modern Office Furniture",
    //   image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop",
    //   btnText: "Explore Furniture"
    // }
  ];

  return (
    <section className="relative w-full bg-[#F8FAFC]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        loop={true}
        speed={800}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          el: '.hero-pagination',
          bulletClass: 'swiper-pagination-bullet !bg-white !opacity-40 !w-2 !h-2 !transition-all',
          bulletActiveClass: 'swiper-pagination-bullet-active !opacity-100 !w-8 !rounded-full !bg-[#F59E0B]'
        }}
        navigation={{ nextEl: '.hero-next', prevEl: '.hero-prev' }}
        className="w-full h-[450px] md:h-[600px] group"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Clean Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/40 to-transparent" />

              {/* Content Container */}
              <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center items-start text-white">
                <div className="flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                  <Zap size={12} fill="currentColor" /> {slide.tag}
                </div>

                <h1 className="text-3xl md:text-6xl font-black mb-8 tracking-tighter leading-tight max-w-2xl animate-in fade-in slide-in-from-left-6 duration-1000">
                  {slide.title}
                </h1>

                <button className="flex items-center gap-3 bg-white text-[#0F172A] px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#F59E0B] hover:text-white transition-all duration-300 shadow-2xl group/btn animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {slide.btnText}
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows (Visible on Desktop Hover) */}
        <button className="hero-prev absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#0F172A] hidden md:flex">
          <ChevronLeft size={24} />
        </button>
        <button className="hero-next absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#0F172A] hidden md:flex">
          <ChevronRight size={24} />
        </button>

        {/* Custom Pagination Progress Dots */}
        <div className="hero-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"></div>
      </Swiper>

      {/* Subtle Bottom Accent (Trust Strip) */}
      {/* Layer 2: Structural Trust Strip */}
      <div className="bg-white border-b border-edge py-4">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
          {[
            { icon: <ShieldCheck size={20} />, t: "GST Billing", d: "Input Tax Credit" },
            { icon: <Zap size={20} />, t: "Bulk Discounts", d: "Tiered Pricing" },
            { icon: <Package size={20} />, t: "Verified Sellers", d: "Sourced Direct" },
            { icon: <Truck size={20} />, t: "Pan India", d: "Doorstep Delivery" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-center gap-3 md:gap-5 ${i !== 3 ? 'md:border-r border-edge' : ''}`}
            >
              <div className="text-slate-400 shrink-0">{item.icon}</div>
              <div className="leading-tight uppercase">
                <h4 className="text-[12px] md:text-[13px] font-black text-navy tracking-tighter">
                  {item.t}
                </h4>
                <p className="text-[9px] md:text-[10px] font-bold text-muted tracking-widest opacity-70">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;