// ─────────────────────────────────────────────────────────────────────────────
// ShopByCategory — Wholesale version
// Uses RTK Query hook (useGetAllCategoriesQuery) instead of static JSON
// Navigates to /category/:slug on click  →  <Route path="/category/:slug" element={<CatProducts />} />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const ShopByCategory = () => {
  const navigate = useNavigate();

  // RTK Query — handles loading, error, caching automatically
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useGetAllCategoriesQuery();

  // ── Navigate to /category/:slug ────────────────────────────────────────────
  const handleCategoryClick = (cat) => {
    const slug =
      cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");
    navigate(`/category/${slug}`);
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 shrink-0">
              <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) return null;

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!categories.length) return null;

  return (
    <section className="w-full bg-white py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-navy flex items-center gap-2">
              <span className="w-1 h-5 sm:h-6 bg-gold rounded-full" />
              Shop by Category
            </h2>
            <p className="text-[10px] sm:text-[12px] text-muted mt-1 ml-3">
              Best bulk pricing tiers for your business
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-1 sm:gap-2">
            <button className="custom-prev swiper-button-disabled w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:bg-gold-light transition-all duration-300 cursor-pointer">
              <ChevronLeft size={14} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
            </button>
            <button className="custom-next w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:bg-gold-light transition-all duration-300 cursor-pointer">
              <ChevronRight size={14} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
            </button>
          </div>
        </div>

        {/* Swiper Slider - Fixed Container */}
        <div className="relative w-full overflow-hidden">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            spaceBetween={12}
            slidesPerView="auto"
            breakpoints={{
              320: {
                slidesPerView: 2.2,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 2.5,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 3.2,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 16,
              },
              1200: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
            className="category-slider"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat._id || cat.id}>
                <div
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-none w-full"
                >
                  {/* Circle Image Container */}
                  <div className="relative w-full aspect-square max-w-[130px] mx-auto">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-gold transition-all duration-300 bg-gray-50">
                      <img
                        src={cat.image?.url || cat.image || "/placeholder-category.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <span className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold text-center text-gray-700 group-hover:text-gold-dark transition-colors px-1 line-clamp-2 min-h-[32px] sm:min-h-[36px] flex items-center">
                    {cat.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .category-slider {
          overflow: visible !important;
          width: 100%;
        }
        
        .category-slider .swiper-wrapper {
          align-items: stretch;
        }
        
        .category-slider .swiper-slide {
          height: auto !important;
          display: flex !important;
          flex-direction: column;
          justify-content: flex-start;
        }
        
        /* Hide default Swiper navigation buttons */
        .category-slider .swiper-button-next,
        .category-slider .swiper-button-prev {
          display: none !important;
        }
        
        /* Custom navigation button states */
        .custom-prev.swiper-button-disabled,
        .custom-next.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
        
        /* Fix for line-clamp utility (if not using Tailwind) */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
        }
        
        /* Mobile touch optimizations */
        @media (max-width: 768px) {
          .category-slider {
            touch-action: pan-y pinch-zoom;
          }
        }
        
        /* Ensure images maintain aspect ratio */
        .aspect-square {
          aspect-ratio: 1 / 1;
        }
      `}</style>
    </section>
  );
};

export default ShopByCategory;

// // ─────────────────────────────────────────────────────────────────────────────
// // ShopByCategory — Wholesale version
// // Uses RTK Query hook (useGetAllCategoriesQuery) instead of static JSON
// // Navigates to /category/:slug on click  →  <Route path="/category/:slug" element={<CatProducts />} />
// // ─────────────────────────────────────────────────────────────────────────────

// import React from "react";
// import { ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useGetAllCategoriesQuery } from "../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
// //                                       ↑ right path

// const ShopByCategory = () => {
//   const navigate = useNavigate();

//   // RTK Query — handles loading, error, caching automatically
//   const {
//     data: categories = [],
//     isLoading,
//     isError,
//   } = useGetAllCategoriesQuery();

//   // ── Navigate to /category/:slug ────────────────────────────────────────────
//   const handleCategoryClick = (cat) => {
//     const slug =
//       cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");
//     navigate(`/category/${slug}`);
//   };

//   // ── Loading skeleton ───────────────────────────────────────────────────────
//   if (isLoading) {
//     return (
//       <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
//         <div className="flex items-center justify-between mb-8">
//           <div className="space-y-2">
//             <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
//             <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
//           </div>
//         </div>
//         <div className="flex gap-6 overflow-x-auto pb-2">
//           {[...Array(8)].map((_, i) => (
//             <div key={i} className="flex flex-col items-center gap-2.5 shrink-0">
//               <div className="w-[120px] h-[120px] rounded-full bg-gray-200 animate-pulse" />
//               <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
//             </div>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   // ── Error state ────────────────────────────────────────────────────────────
//   if (isError) return null; // silent fail — same pattern as your Categories component

//   // ── Empty ──────────────────────────────────────────────────────────────────
//   if (!categories.length) return null;

//   // ── Main render ────────────────────────────────────────────────────────────
//   return (
//     <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">

//       {/* Header — same UI as your original static file */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
//             <span className="w-1 h-6 bg-gold rounded-full" />
//             Shop by Category
//           </h2>
//           <p className="text-[12px] text-muted mt-1 ml-3">
//             Best bulk pricing tiers for your business
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/categories")}
//           className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors"
//         >
//           VIEW ALL <ArrowRight size={14} />
//         </button>
//       </div>

//       {/* Category circles — same UI, real data */}
//       <div className="flex gap-6 overflow-x-auto scroll-hide pb-2 container-fluid">
//         {categories.map((cat) => (
//           <div
//             key={cat._id || cat.id}
//             onClick={() => handleCategoryClick(cat)}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat)}
//             className="flex flex-col items-center gap-2.5 cursor-pointer group shrink-0 focus:outline-none"
//           >
//             <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-edge group-hover:border-gold transition-colors bg-panel">
//               <img
//                 src={cat.image?.url || cat.image || "/placeholder-category.jpg"}
//                 alt={cat.name}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                 loading="lazy"
//               />
//             </div>
//             <span className="text-[11px] font-bold text-navy text-center max-w-[80px] leading-tight group-hover:text-gold-dark transition-colors">
//               {cat.name}
//             </span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ShopByCategory;

// import React from 'react';
// import { ArrowRight } from 'lucide-react';
// import data from '../../Data/data.json';

// const ShopByCategory = () => {
//   const { categories } = data;

//   return (
//     <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
//             <span className="w-1 h-6 bg-gold rounded-full" />
//             Shop by Category
//           </h2>
//           <p className="text-[12px] text-muted mt-1 ml-3">Best bulk pricing tiers for your business</p>
//         </div>
//         <button className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors">
//           VIEW ALL <ArrowRight size={14} />
//         </button>
//       </div>

//       {/* Category Circles */}
//       <div className="flex gap-6 overflow-x-auto scroll-hide pb-2">
//         {categories.slice(0,8).map((cat) => (
//           <div key={cat.id} className="flex flex-col items-center gap-2.5 cursor-pointer group shrink-0">
//             <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-edge group-hover:border-gold transition-colors bg-panel">
//               <img
//                 src={cat.image}
//                 alt={cat.name}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                 loading="lazy"
//               />
//             </div>
//             <span className="text-[11px] font-bold text-navy text-center max-w-[80px] leading-tight group-hover:text-gold-dark transition-colors">
//               {cat.name}
//             </span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ShopByCategory;
