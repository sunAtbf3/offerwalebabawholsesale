// ─────────────────────────────────────────────────────────────────────────────
// CatProducts.jsx  —  Wholesale version  |  Fully Responsive
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useCallback, useState, useRef, useMemo, useEffect,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, AlertCircle, RefreshCw, ChevronRight,
  Filter, X, SlidersHorizontal, Loader2, ChevronDown,
  Package,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import WholesaleProductCard from "../../ProductCard/WholesaleProductCard";
import SkeletonCard from "../../ProductCard/Skelleton/SkeletonCard";

import { useGetProductsByCategoryQuery } from "../../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";
import { useGetCategoryBySlugQuery } from "../../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
import usePaginatedFetch from "../../HOOKS/usePaginatedFetch";
// Import images from your assets folder
import HomeKitchenImg from "../../../assets/Home & Kitchen.png";
import BabyItemsImg from "../../../assets/Baby Items.png";
import CleaningSuppliesImg from "../../../assets/Cleaning & Housekeeping Supplies.png";
import ToursTravelsImg from "../../../assets/Tours & Travels.png";
import GiftsImg from "../../../assets/Gifts.png";
import CarAccessoriesImg from "../../../assets/Car Accessories.png";
import SmartLifeGadgetsImg from "../../../assets/Smart Life Gadget.png";
import StationaryImg from "../../../assets/Stationary.png";
import SportsFitnessImg from "../../../assets/Sports & Fitness.png";
import FashionWorldImg from "../../../assets/Fashion World.png";
import MixItemsImg from "../../../assets/Mix Items.png";
// ── Column count helper ───────────────────────────────────────────────────────
const getColumnCount = () => {
  const w = window.innerWidth;

 if (w >= 1536) return 5;
if (w >= 1024) return 4;
if (w >= 768) return 3;
return 2;
};



export const categoriesImage = [
  { name: "Home & Kitchen", image: HomeKitchenImg, color:"#9e5041" },
  { name: "Baby Items", image: BabyItemsImg, color:"#935aa6" },
{ name: "Cleaning & Housekeeping Supplies", image: CleaningSuppliesImg, color:"#54596b" },
{ name: "Mix Items", image: MixItemsImg, color:"#5c0a1e" },
  { name: "Tours & Travels", image: ToursTravelsImg, color:"#466e57" },
  { name: "Gifts", image: GiftsImg, color:"#9e6c48" },
  { name: "Car Accessories", image: CarAccessoriesImg, color:"#063027" },
  { name: "Smart Life Gadgets", image: SmartLifeGadgetsImg, color:"#273857" },
  { name: "Stationary", image: StationaryImg, color:"#5a2a42" },
  { name: "Sports & Fitness", image: SportsFitnessImg, color:"#3b172b" },
  { name: "Fashion World", image: FashionWorldImg, color:"#786045" },
  // { name: "Mix-Items", image: MixItemsImg },
];

const LOAD_MORE_SKELETON_COUNT = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getVariantPrice = (variant) => {
  if (!variant) return { base: 0, sale: 0 };
  const base = variant.price?.base ?? 0;
  const sale = variant.price?.sale ?? variant.finalPrice ?? base;
  return { base, sale };
};

const getVariantStock = (variant, product) => {
  if (!variant) return product?.inStock ? Infinity : 0;
  if (variant.inventory?.trackInventory) return variant.inventory?.quantity ?? 0;
  return product?.inStock !== false ? Infinity : 0;
};

const getDiscountPct = (base, sale) => {
  if (!base || base <= 0 || sale >= base) return 0;
  return Math.round(((base - sale) / base) * 100);
};

// ── VirtualizedProductGrid ────────────────────────────────────────────────────
const VirtualizedProductGrid = ({ products, loadingMore }) => {
  const parentRef = useRef(null);
  const [cols, setCols] = useState(getColumnCount);

  useEffect(() => {
    const onResize = () => setCols(getColumnCount());

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rows = useMemo(() => {
    const result = [];

    for (let i = 0; i < products.length; i += cols) {
      result.push(products.slice(i, i + cols));
    }

    return result;
  }, [products, cols]);

  const skeletonRowCount = loadingMore
    ? Math.ceil(LOAD_MORE_SKELETON_COUNT / cols)
    : 0;

  const totalRows = rows.length + skeletonRowCount;

 const rowVirtualizer = useVirtualizer({
  count: totalRows,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 500,
  overscan: 5,
});

  return (
 <div
  ref={parentRef}
  className="w-full relative overflow-visible"
>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isSkeletonRow = virtualRow.index >= rows.length;

          const rowItems = isSkeletonRow
            ? Array(cols).fill(null)
            : rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2
sm:grid-cols-2
md:grid-cols-3
lg:grid-cols-4
2xl:grid-cols-5
gap-2
sm:gap-3
lg:gap-5
pb-4 sm:pb-6 lg:pb-10">
                {isSkeletonRow
                  ? Array(cols)
                      .fill(null)
                      .map((_, i) => (
                        <SkeletonCard
                          key={`skel-${virtualRow.index}-${i}`}
                        />
                      ))
                  : rowItems.map((product, i) => (
                      <WholesaleProductCard
                        key={product._id || i}
                        product={product}
                        index={virtualRow.index * cols + i}
                      />
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── CatProducts ───────────────────────────────────────────────────────────────
const CatProducts = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy]             = useState("newest");
  const [filters, setFilters]           = useState({
    price: [], availability: [], discount: [], moqMax: '', deals: [],
  });
  const [allProductsFetched, setAllProductsFetched] = useState(false);

  useEffect(() => {
    setFilters({ price: [], availability: [], discount: [], moqMax: '', deals: [] });
    setSortBy("newest");
      setAllProductsFetched(false); // ✅ add karo
  }, [slug]);

  useEffect(() => {
  setFilters({ price: [], availability: [], discount: [], moqMax: '', deals: [] });
  setSortBy("newest");
  setAllProductsFetched(false); // ✅ reset
}, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Category metadata ──────────────────────────────────────────────────────
  const {
    data: currentCategory,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetCategoryBySlugQuery(slug, { skip: !slug });

  // ── Paginated products ─────────────────────────────────────────────────────
  const {
    data: products,
    isLoading,
    isFetchingMore: loadingMore,
    pagination,
    loadMore: handleLoadMore,
    reset: resetPage,
    isError: productsError,
    error: productsErrorDetail,
    refetch,
  } = usePaginatedFetch({
    useQuery: useGetProductsByCategoryQuery,
    baseArgs: { slug },
    limit:    10,
    dataKey:  "products",
    skip:     !slug,
  });
  const currentCategoryImage = useMemo(() => {
  if (!currentCategory?.name) return null;
  const found = categoriesImage.find(
    (cat) => cat.name.toLowerCase() === currentCategory.name.toLowerCase()
  );
  return found?.image || null;
}, [currentCategory])

  // ── Derived ────────────────────────────────────────────────────────────────
  const pageIsLoading = (isLoading || categoryLoading) && products.length === 0;
  const hasError      = !pageIsLoading && (productsError || categoryError);
  const hasMore       = pagination?.hasNextPage ?? false;
  const categoryName  = currentCategory?.name || slug?.replace(/-/g, " ") || "Collection";
  
  const resetToFirstPage = useCallback(() => {
  setAllProductsFetched(false);
  resetPage(); // usePaginatedFetch ka reset
    // refetch();    // ✅ fresh data force karo

}, [resetPage]);

  // ── Filter helpers ─────────────────────────────────────────────────────────
 const toggleFilter = useCallback((key, value) => {
  setFilters((prev) => {
    const updated = {
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    };

    // ✅ Check if all filters are now empty after this toggle
    const newCount =
      updated.price.length +
      updated.availability.length +
      updated.discount.length +
      updated.deals.length +
      (updated.moqMax !== '' ? 1 : 0);

    if (newCount === 0) {
      // schedule reset after state settles
      setTimeout(() => resetToFirstPage(), 0);
    }

    return updated;
  });
}, [resetToFirstPage]);

 const clearFilters = useCallback(() => {
  setFilters({ price: [], availability: [], discount: [], moqMax: '', deals: [] });
  resetToFirstPage(); // ✅ products bhi reset
}, [resetToFirstPage]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    if (!products?.length) return [];

    const filtered = products.filter((product) => {
      const variant        = product.variants?.[0];
      const { base, sale } = getVariantPrice(variant);
      const qty            = getVariantStock(variant, product);
      const discountPct    = getDiscountPct(base, sale);
      const moqVal         = variant?.minimumOrderQuantity ?? variant?.price?.minimumOrderQuantity ?? null;

      // ✅ appliedTags — correct field from backend
      const productTags    = product?.appliedTags ?? [];

      // Price filter
      if (filters.price.length > 0) {
        const priceToCheck = sale || base;
        const match = filters.price.some((p) => {
          if (p === "u29")   return priceToCheck < 29;
          if (p === "29-49") return priceToCheck >= 29  && priceToCheck <= 49;
          if (p === "49-79") return priceToCheck >= 49  && priceToCheck <= 79;
          if (p === "o99")   return priceToCheck >= 99;
          return false;
        });
        if (!match) return false;
      }

      // Availability filter
      if (filters.availability.length > 0) {
        const inStock = qty > 0;
        const match = filters.availability.some((a) =>
          a === "instock" ? inStock : !inStock
        );
        if (!match) return false;
      }

      // Discount filter
    if (filters.discount.length > 0) {

  const match = filters.discount.some((d) => {

   if (d === "0-24") {
  return discountPct >= 0 && discountPct <= 24;
}

if (d === "25-49") {
  return discountPct >= 25 && discountPct <= 49;
}

if (d === "50+") {
  return discountPct >= 50;
}

    return false;
  });

  if (!match) return false;
}

      // ✅ MOQ filter — Alibaba style input (moqMax)
      if (filters.moqMax !== '') {
        const maxAllowed = Number(filters.moqMax);
        if (!moqVal || moqVal > maxAllowed) return false;
      }

      // ✅ Deals filter — appliedTags based
// Deals filter
if (filters.deals.length > 0) {
  const match = filters.deals.some((deal) => {

   if (deal === "on-sale") {
  return productTags.includes("on-sale");
}

    if (deal === "today-arrival") {
      return productTags.includes("today-arrival");
    }

    return false;
  });

  if (!match) return false;
}

      return true;
    });

    const data = [...filtered];
    switch (sortBy) {
      case "priceLowHigh": return data.sort((a, b) => getVariantPrice(a.variants?.[0]).sale - getVariantPrice(b.variants?.[0]).sale);
      case "priceHighLow": return data.sort((a, b) => getVariantPrice(b.variants?.[0]).sale - getVariantPrice(a.variants?.[0]).sale);
      case "discount":     return data.sort((a, b) => {
        const { base: ab, sale: as_ } = getVariantPrice(a.variants?.[0]);
        const { base: bb, sale: bs  } = getVariantPrice(b.variants?.[0]);
        return getDiscountPct(bb, bs) - getDiscountPct(ab, as_);
      });
      case "newest": return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:       return data;
    }
  }, [products, filters, sortBy]);

  const activeFilterCount = useMemo(() => (
    filters.price.length +
    filters.availability.length +
    filters.discount.length +
    filters.deals.length +
    (filters.moqMax !== '' ? 1 : 0)
  ), [filters]);

  useEffect(() => {
  if (activeFilterCount === 0) return;
  if (allProductsFetched) return;
  if (!hasMore) { setAllProductsFetched(true); return; }
  if (loadingMore) return;
  handleLoadMore();
}, [activeFilterCount, hasMore, loadingMore, allProductsFetched, handleLoadMore]);

  const handleRetry = useCallback(() => { resetPage(); refetch(); }, [resetPage, refetch]);
  console.log("products", products.length);
console.log("total", pagination?.total);
console.log("hasMore", hasMore);

  // ── Reusable Checkbox ──────────────────────────────────────────────────────
  const FilterCheckbox = ({ filterKey, val, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(filterKey, val)}>
      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
        ${filters[filterKey].includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}>
        {filters[filterKey].includes(val) && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm select-none ${filters[filterKey].includes(val) ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
        {label}
      </span>
    </label>
  );

  // ── Filter Panel ───────────────────────────────────────────────────────────
  const FilterPanel = () => {
    const [moqInput, setMoqInput] = useState(filters.moqMax);

    const applyMoq = () => {
      setFilters((prev) => ({ ...prev, moqMax: moqInput }));
    };

    return (
      <div className="space-y-6 font-['satoshi']">

        {/* Price */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">Price Range</h4>
          <div className="space-y-2">
            {[
              { label: "Under ₹29",    val: "u29"   },
              { label: "₹29 – ₹49",   val: "29-49" },
              { label: "₹49 – ₹79",   val: "49-79" },
              { label: "₹99 & above", val: "o99"   },
            ].map(({ label, val }) => (
              <FilterCheckbox key={val} filterKey="price" val={val} label={label} />
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Availability */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">Availability</h4>
          <div className="space-y-2">
            {[
              { label: "In stock",     val: "instock"    },
              { label: "Out of stock", val: "outofstock" },
            ].map(({ label, val }) => (
              <FilterCheckbox key={val} filterKey="availability" val={val} label={label} />
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {/* ✅ MOQ — Alibaba style input */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">Min. Order</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="Max"
              value={moqInput}
              onChange={(e) => setMoqInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyMoq()}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-zinc-900 transition-colors"
            />
            <button
              onClick={(e) => { e.stopPropagation(); applyMoq(); }}
              className="px-4 py-2 text-xs font-bold border border-zinc-200 rounded-full hover:border-zinc-900 hover:text-zinc-900 transition-colors whitespace-nowrap"
            >
              OK
            </button>
          </div>
          {filters.moqMax && (
            <p className="text-[10px] text-zinc-400 mt-1.5">
              Showing MOQ ≤ {filters.moqMax} pcs
            </p>
          )}
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Discount */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">Discount</h4>
          <div className="space-y-2">
            {[
               { label: "Under 10% or more", val: "0-24" },
  { label: "25% or more", val: "25-49" },
  { label: "50% or more", val: "50+" },
            ].map(({ label, val }) => (
              <FilterCheckbox key={val} filterKey="discount" val={val} label={label} />
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {/* ✅ Deals — appliedTags based */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">Deals</h4>
          <div className="space-y-2">
            {[
              { label: "On Sale",          val: "on-sale"       },
              { label: "Today's Deal",  val: "today-arrival" },
            ].map(({ label, val }) => (
              <FilterCheckbox key={val} filterKey="deals" val={val} label={label} />
            ))}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors rounded"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── STICKY BREADCRUMB ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button onClick={() => navigate(-1)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 flex-shrink-0 rounded-md hover:bg-zinc-50 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <nav className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-zinc-400 min-w-0">
              <Link to="/" className="hover:text-zinc-900 flex-shrink-0">Home</Link>
              <ChevronRight size={9} className="flex-shrink-0" />
              <span className="text-zinc-900 font-bold truncate">{categoryName}</span>
            </nav>
          </div>

          <button onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 py-1.5 px-3 text-zinc-700 rounded-full border border-zinc-200 hover:border-zinc-400 transition-colors flex-shrink-0 text-xs font-semibold">
            <Filter size={14} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[40vh] md:h-[24vh] flex flex-col overflow-hidden bg-gray-900">
  {currentCategoryImage && (
    <img
      src={currentCategoryImage}
      alt={categoryName}
            className="absolute inset-0 w-full h-full object-cover"
    />
  )}

  <div className="absolute inset-0 bg-black/30 md:bg-black/25" />
  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F7A221]" />

  <div className="relative z-10 flex flex-1 flex-col justify-end min-h-0 w-full max-w-7xl mx-auto px-4 md:px-8 pb-0">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[9px] sm:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-2 sm:mb-3 flex items-center gap-2 text-white">
          <span className="w-4 sm:w-6 h-[2px] bg-white inline-block" />
          Wholesale Collection
        </p>

        <h1
          className="text-2xl sm:text-4xl md:text-5xl uppercase leading-none font-black"
          style={{
            color:
              categoriesImage.find(
                (cat) =>
                  cat.name.toLowerCase() ===
                  currentCategory?.name?.toLowerCase()
              )?.color || "#fff",
          }}
        >
          {categoryName}
        </h1>

        {currentCategory?.description && (
          <p className="mt-2 sm:mt-3 max-w-xs sm:max-w-md text-gray-200 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
            {currentCategory.description}
          </p>
        )}
      </div>
    </div>
  </div>
</section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 lg:py-12 flex flex-col md:flex-row gap-5 sm:gap-8 lg:gap-10">

        {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
        <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── PRODUCT GRID AREA ─────────────────────────────────────────── */}
        <div className="flex-grow min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-10">
            <div className="flex items-center gap-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase text-zinc-500 tracking-[0.1em] hidden sm:block">Sort:</p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/60 backdrop-blur-md px-2.5 sm:px-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-800 rounded-md border border-zinc-200 hover:border-zinc-400 focus:border-black outline-none cursor-pointer"
                >
                  <option value="priceLowHigh">Price: Low → High</option>
                  <option value="priceHighLow">Price: High → Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <span className="text-sm sm:text-base font-semibold text-zinc-800">{sortedProducts.length}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400">
                {activeFilterCount > 0 ? "Filtered" : "Products"}
              </span>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {filters.price.map((val) => (
                <button key={val} onClick={() => toggleFilter("price", val)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  {val === "u29" ? "Under ₹29" : val === "29-49" ? "₹29–₹49" : val === "49-79" ? "₹49–₹79" : "₹99+"}
                  <X size={10} />
                </button>
              ))}
              {filters.availability.map((val) => (
                <button key={val} onClick={() => toggleFilter("availability", val)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  {val === "instock" ? "In Stock" : "Out of Stock"}
                  <X size={10} />
                </button>
              ))}
            {filters.moqMax && (
  <button onClick={() => {
    setFilters((p) => {
      const updated = { ...p, moqMax: '' };
      const count = updated.price.length + updated.availability.length +
                    updated.discount.length + updated.deals.length;
      if (count === 0) setTimeout(() => resetToFirstPage(), 0);
      return updated;
    });
  }}
    className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
    MOQ ≤ {filters.moqMax} pcs <X size={10} />
  </button>
)}
              {filters.discount.map((val) => (
                <button key={val} onClick={() => toggleFilter("discount", val)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  {val}%+ Off <X size={10} />
                </button>
              ))}
              {filters.deals.map((val) => (
                <button key={val} onClick={() => toggleFilter("deals", val)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  {val === "on-sale" ? "On Sale" : "Today's Arrival"}
                  <X size={10} />
                </button>
              ))}
              <button onClick={clearFilters}
                className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-zinc-200 rounded-full transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Content */}
          <div className="relative min-h-[50vh]">

            {hasError && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center animate-in fade-in duration-500">
                <div className="p-3 sm:p-4 rounded-full bg-red-50 mb-4">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="text-zinc-600 text-sm mb-6 max-w-xs sm:max-w-sm px-4">
                  {productsErrorDetail?.message || "Something went wrong loading products."}
                </p>
                <button onClick={handleRetry}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 border border-zinc-300 rounded-full hover:bg-black hover:text-white transition-all">
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            )}

            {pageIsLoading && (
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                  {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2.5">
                    <div className="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg" />
                    <div className="h-2.5 bg-zinc-200 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!pageIsLoading && !hasError && sortedProducts.length > 0 && (
              <div className="animate-in fade-in duration-700">
                <VirtualizedProductGrid
                  key={slug}
                  products={sortedProducts}
                  loadingMore={loadingMore}
                />
                <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
                 {hasMore && !activeFilterCount ? (
  <div className="space-y-4 sm:space-y-6">
    <button onClick={handleLoadMore} disabled={loadingMore}
      className="px-8 sm:px-10 py-2.5 sm:py-3 text-xs bg-zinc-800 text-zinc-100 hover:bg-zinc-50 transition-all hover:text-zinc-800 border hover:border-zinc-800 duration-300 disabled:opacity-60">
      <span className="flex items-center gap-2 font-semibold uppercase tracking-widest">
        {loadingMore ? <Loader2 size={13} className="animate-spin" /> : "Load More"}
      </span>
    </button>
    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
      {products.length} / {pagination?.total || 0} viewed
    </p>
  </div>
) : hasMore && activeFilterCount > 0 ? (
  <div className="flex flex-col items-center gap-2 py-6">
    <Loader2 size={18} className="animate-spin text-zinc-400" />
    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
      Loading all products for filter…
    </p>
  </div>
) : (
  <p className="text-xs uppercase tracking-[0.4em] text-zinc-300 py-8 sm:py-10">
    End of Collection
  </p>
)}
                </div>
              </div>
            )}

{!pageIsLoading && !hasError && sortedProducts.length === 0 && products.length > 0
  && !(activeFilterCount > 0 && hasMore) && (
                  <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 mb-2">No results found</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">Try different filters</p>
                <button onClick={clearFilters}
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition">
                  Reset Filters
                </button>
              </div>
            )}

            {!pageIsLoading && !hasError && products.length === 0 && (
              <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <div className="p-3 sm:p-4 rounded-full bg-zinc-100 mb-4">
                  <Package size={24} className="text-zinc-400" />
                </div>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">
                  This collection is empty right now
                </p>
                <button onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition">
                  <ArrowLeft size={13} /> Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ──────────────────────────────────────────── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col"
               style={{ maxHeight: "88vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-tighter">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel />
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex-shrink-0">
              <button onClick={() => setIsFilterOpen(false)}
                className="w-full bg-zinc-900 text-white py-3.5 text-xs font-black uppercase tracking-widest rounded-md active:bg-zinc-800 transition-colors">
                Show {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatProducts;