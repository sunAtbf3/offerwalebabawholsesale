// ─────────────────────────────────────────────────────────────────────────────
// ShopByCategory — Wholesale version
// Uses RTK Query hook (useGetAllCategoriesQuery) instead of static JSON
// Navigates to /category/:slug on click  →  <Route path="/category/:slug" element={<CatProducts />} />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
//                                       ↑ adjust path to wherever you put categoriesApi.js

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
              <div className="w-[120px] h-[120px] rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) return null; // silent fail — same pattern as your Categories component

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!categories.length) return null;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">

      {/* Header — same UI as your original static file */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Shop by Category
          </h2>
          <p className="text-[12px] text-muted mt-1 ml-3">
            Best bulk pricing tiers for your business
          </p>
        </div>
        <button
          onClick={() => navigate("/categories")}
          className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors"
        >
          VIEW ALL <ArrowRight size={14} />
        </button>
      </div>

      {/* Category circles — same UI, real data */}
      <div className="flex gap-6 overflow-x-auto scroll-hide pb-2">
        {categories.slice(0, 8).map((cat) => (
          <div
            key={cat._id || cat.id}
            onClick={() => handleCategoryClick(cat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat)}
            className="flex flex-col items-center gap-2.5 cursor-pointer group shrink-0 focus:outline-none"
          >
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-edge group-hover:border-gold transition-colors bg-panel">
              <img
                src={cat.image?.url || cat.image || "/placeholder-category.jpg"}
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
