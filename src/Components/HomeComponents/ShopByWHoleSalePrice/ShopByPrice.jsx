// // ─────────────────────────────────────────────────────────────────────────────
// // ShopByPrice.jsx
// // URL: /shop-by-price/:priceSlug
// // priceSlug options: under-299 | 299-499 | 499-799 | above-999
// //
// // Flow:
// // 1. useGetAllProductsQuery → saare products fetch karo (paginated)
// // 2. priceSlug se price range nikalo
// // 3. Frontend pe filter karo — price range + availability + discount + category
// // ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ShopByPrice.jsx  —  Fully Responsive Version
// URL: /shop-by-price/:priceSlug
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useCallback, useState, useRef, useMemo, useEffect,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, AlertCircle, RefreshCw, ChevronRight,
  Filter, X, SlidersHorizontal, Loader2, ChevronDown,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import WholesaleProductCard from "../../ProductCard/WholesaleProductCard";
import SkeletonCard from "../../ProductCard/Skelleton/SkeletonCard";

import { useGetAllProductsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";
import usePaginatedFetch from "../../HOOKS/usePaginatedFetch";

// ─────────────────────────────────────────────────────────────────────────────
// Column count helper
// ─────────────────────────────────────────────────────────────────────────────
const getColumnCount = () => {
  const w = window.innerWidth;
  if (w >= 1280) return 5;  // xl
  if (w >= 1024) return 4;  // lg
  if (w >= 768)  return 3;  // md
  return 2;                 // sm + base
};

const LOAD_MORE_SKELETON_COUNT = 12;

// ─────────────────────────────────────────────────────────────────────────────
// VirtualizedProductGrid
// ─────────────────────────────────────────────────────────────────────────────
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
    for (let i = 0; i < products.length; i += cols)
      result.push(products.slice(i, i + cols));
    return result;
  }, [products, cols]);

  const skeletonRowCount = loadingMore ? Math.ceil(LOAD_MORE_SKELETON_COUNT / cols) : 0;
  const totalRows = rows.length + skeletonRowCount;

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420,
    overscan: 3,
  });

  return (
    <div ref={parentRef} style={{ width: "100%" }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isSkeletonRow = virtualRow.index >= rows.length;
          const rowItems = isSkeletonRow ? Array(cols).fill(null) : rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0, left: 0, width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-5 items-stretch">
                {isSkeletonRow
                  ? Array(cols).fill(null).map((_, i) => (
                      <SkeletonCard key={`skel-${virtualRow.index}-${i}`} />
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

// ─────────────────────────────────────────────────────────────────────────────
// ShopByPrice
// ─────────────────────────────────────────────────────────────────────────────
const ShopByPrice = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();

  const PRICE_FILTERS = {
    "under-299":  { maxPrice: 299  },
    "under-999":  { maxPrice: 999  },
    "under-2999": { maxPrice: 2999 },
    "under-4999": { maxPrice: 4999 },
    "above-5000": { minPrice: 5000 },
  };

  const PRICE_LABELS = {
    "under-299":  "Under ₹299",
    "under-999":  "Under ₹999",
    "under-2999": "Under ₹2,999",
    "under-4999": "Under ₹4,999",
    "above-5000": "Above ₹5,000",
  };

  const priceLabel = PRICE_LABELS[slug] || "All Products";

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy]             = useState("priceLowHigh");
  const [filters, setFilters]           = useState({
    availability: [],
    discount:     [],
    onSale:       false,
    category:     [],
  });

  useEffect(() => {
    setFilters({ availability: [], discount: [], onSale: false, category: [] });
    setSortBy("priceLowHigh");
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const baseArgs = PRICE_FILTERS[slug] || {};

  // ── Paginated fetch ───────────────────────────────────────────────────────────
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
    useQuery: useGetAllProductsQuery,
    baseArgs,
    limit:   15,
    dataKey: "products",
    skip:    false,
  });

  // ── Available categories ──────────────────────────────────────────────────────
  const availableCategories = useMemo(() => {
    if (!products?.length) return [];
    return [...new Set(products.map((p) => p.category?.name).filter(Boolean))].sort();
  }, [products]);

  const pageIsLoading = isLoading && products.length === 0;
  const hasError      = !pageIsLoading && productsError;
  const hasMore       = pagination?.hasNextPage ?? false;

  // ── Filter helpers ────────────────────────────────────────────────────────────
  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ availability: [], discount: [], onSale: false, category: [] });
  }, []);

  // ── Filter logic ──────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!products?.length) return [];
    const priceRange = PRICE_FILTERS[slug] || {};

    return products.filter((product) => {
      const variants = product.variants || [];
      if (!variants.length) return false;

      const prices = variants.map((v) => ({
        current: v.price?.current ?? v.price?.sale ?? v.price?.base ?? 0,
        qty:     v.inventory?.quantity ?? 0,
        base:    v.price?.base ?? 0,
        sale:    v.price?.sale ?? null,
      }));

      const lowestPrice = Math.min(...prices.map((p) => p.current));
      if (priceRange.maxPrice !== undefined && lowestPrice > priceRange.maxPrice) return false;
      if (priceRange.minPrice !== undefined && lowestPrice < priceRange.minPrice) return false;

      const maxDiscount = Math.max(
        ...prices.map((p) =>
          p.base > 0 && p.sale != null ? Math.round(((p.base - p.sale) / p.base) * 100) : 0
        )
      );
      const totalQty  = prices.reduce((sum, p) => sum + p.qty, 0);
      const isOnSale  = prices.some((p) => p.sale != null && p.sale < p.base);
      const catName   = product.category?.name ?? "";

      if (filters.availability.length > 0) {
        const match = filters.availability.some((a) =>
          a === "instock" ? totalQty > 0 : totalQty <= 0
        );
        if (!match) return false;
      }
      if (filters.discount.length > 0) {
        if (!filters.discount.some((d) => maxDiscount >= Number(d))) return false;
      }
      if (filters.onSale && !isOnSale) return false;
      if (filters.category.length > 0 && !filters.category.includes(catName)) return false;

      return true;
    });
  }, [products, filters, slug]);

  const getLowestPrice    = (p) => Math.min(...(p.variants || []).map((v) => v.price?.sale ?? v.price?.base ?? 0).filter(Boolean));
  const getHighestDiscount = (p) => Math.max(...(p.variants || []).map((v) => {
    const base = v.price?.base ?? 0;
    const sale = v.price?.sale ?? base;
    return base > 0 ? ((base - sale) / base) * 100 : 0;
  }));

  // ── Sort ──────────────────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    const data = [...filteredProducts];
    switch (sortBy) {
      case "priceLowHigh": return data.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      case "priceHighLow": return data.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      case "discount":     return data.sort((a, b) => getHighestDiscount(b) - getHighestDiscount(a));
      case "az":           return data.sort((a, b) => a.name.localeCompare(b.name));
      case "za":           return data.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":       return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:             return data;
    }
  }, [filteredProducts, sortBy]);

  const activeFilterCount = useMemo(
    () => filters.availability.length + filters.discount.length + filters.category.length + (filters.onSale ? 1 : 0),
    [filters]
  );

  const handleRetry = useCallback(() => { resetPage(); refetch(); }, [resetPage, refetch]);

  // ── Filter Panel (shared between sidebar + drawer) ────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6 font-['satoshi']">

      {/* Availability */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Availability
        </h4>
        <div className="space-y-2">
          {[{ label: "In stock", val: "instock" }, { label: "Out of stock", val: "outofstock" }].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("availability", val)}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                ${filters.availability.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}>
                {filters.availability.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm select-none ${filters.availability.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Discount */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Discount
        </h4>
        <div className="space-y-2">
          {[{ label: "10% or more", val: "10" }, { label: "25% or more", val: "25" }, { label: "50% or more", val: "50" }].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("discount", val)}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                ${filters.discount.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}>
                {filters.discount.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm select-none ${filters.discount.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      {/* On Sale */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Deals
        </h4>
        <label
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setFilters((prev) => ({ ...prev, onSale: !prev.onSale }))}
        >
          <button
            type="button"
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${filters.onSale ? "bg-zinc-900" : "bg-zinc-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filters.onSale ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm select-none ${filters.onSale ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
            On sale only
          </span>
        </label>
      </div>

      {/* Category */}
      {availableCategories.length > 0 && (
        <>
          <div className="h-px bg-zinc-100" />
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
              Category
            </h4>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {availableCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("category", cat)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                    ${filters.category.includes(cat) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}>
                    {filters.category.includes(cat) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm select-none ${filters.category.includes(cat) ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── STICKY BREADCRUMB ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

          {/* Left: back + breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 flex-shrink-0 rounded-md hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Breadcrumb — truncate on very small screens */}
            <nav className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-zinc-400 min-w-0">
              <Link to="/" className="hover:text-zinc-900 flex-shrink-0">Home</Link>
              <ChevronRight size={9} className="flex-shrink-0" />
              {/* Hide "Shop by Price" on xs screens */}
              <Link to="/shop-by-price" className="hover:text-zinc-900 hidden xs:block flex-shrink-0">Shop by Price</Link>
              <ChevronRight size={9} className="hidden xs:block flex-shrink-0" />
              <span className="text-zinc-900 font-bold truncate">{priceLabel}</span>
            </nav>
          </div>

          {/* Right: mobile filter button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 py-1.5 px-3 text-zinc-700 rounded-full border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors flex-shrink-0 text-xs font-semibold"
          >
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-[28vh] sm:h-[35vh] md:h-[45vh] flex items-end overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F7A221]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-7 sm:pb-10 md:pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[#F7A221] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-2 sm:mb-3 flex items-center gap-2">
                <span className="w-4 sm:w-6 h-[2px] bg-[#F7A221] inline-block" />
                Wholesale Deals
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase leading-none tracking-tighter">
                {priceLabel}
              </h1>
              <p className="mt-2 sm:mt-4 max-w-xs sm:max-w-md text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">
                Best wholesale prices — bulk savings on every order
              </p>
            </div>

            {/* Product count — hide on mobile */}
            {!pageIsLoading && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <span className="text-3xl md:text-5xl font-black text-white leading-none">
                  {sortedProducts.length}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 mt-1">
                  Products
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-10 py-6 sm:py-8 lg:py-12 flex flex-col md:flex-row gap-5 sm:gap-8 lg:gap-10">

        {/* ── SIDEBAR (desktop only) ─────────────────────────────────────────── */}
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

        {/* ── PRODUCT GRID AREA ─────────────────────────────────────────────── */}
        <div className="flex-grow min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-8">

            {/* Sort */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase text-zinc-500 tracking-[0.1em] hidden xs:block">
                Sort:
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white px-2.5 sm:px-3 pr-8 sm:pr-9 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-800 rounded-md border border-zinc-200 hover:border-zinc-400 focus:border-black outline-none cursor-pointer"
                >
                  <option value="priceLowHigh">Price: Low → High</option>
                  <option value="priceHighLow">Price: High → Low</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="az">A–Z</option>
                  <option value="za">Z–A</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Product count pill */}
            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <span className="text-sm sm:text-base font-semibold text-zinc-800">{sortedProducts.length}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400">Products</span>
            </div>
          </div>

          {/* ── Content area ────────────────────────────────────────────────── */}
          <div className="relative min-h-[50vh]">

            {/* Error */}
            {hasError && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center animate-in fade-in duration-500">
                <div className="p-3 sm:p-4 rounded-full bg-red-50 mb-4">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="text-zinc-600 text-sm mb-6 max-w-xs sm:max-w-sm px-4">
                  {productsErrorDetail?.message || "Something went wrong loading products."}
                </p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 border border-zinc-300 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {pageIsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2.5">
                    <div className="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg" />
                    <div className="h-2.5 bg-zinc-200 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Products grid */}
            {!pageIsLoading && !hasError && sortedProducts.length > 0 && (
              <div className="animate-in fade-in duration-700">
                <VirtualizedProductGrid
                  key={slug}
                  products={sortedProducts}
                  loadingMore={loadingMore}
                />

                {/* Load more */}
                <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
                  {hasMore ? (
                    <div className="space-y-4 sm:space-y-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-8 sm:px-10 py-2.5 sm:py-3 text-xs rounded-full bg-zinc-800 text-zinc-100 hover:bg-[#F7A221] transition-all duration-300 disabled:opacity-60"
                      >
                        <span className="flex items-center gap-2 font-semibold uppercase tracking-widest">
                          {loadingMore ? <Loader2 size={13} className="animate-spin" /> : "Load More"}
                        </span>
                      </button>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        {products.length} / {pagination?.total || 0} loaded
                      </p>
                    </div>
                  ) : (
                    products.length > 0 && (
                      <p className="text-xs uppercase tracking-[0.4em] text-zinc-300 py-8 sm:py-10">
                        End of Collection
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* No results after filter */}
            {!pageIsLoading && !hasError && sortedProducts.length === 0 && products.length > 0 && (
              <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 mb-2">No products found</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">Try different filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* No products from API */}
            {!pageIsLoading && !hasError && products.length === 0 && (
              <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <div className="p-3 sm:p-4 rounded-full bg-zinc-100 mb-4">
                  <AlertCircle size={24} className="text-zinc-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 mb-2">No Products Found</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">
                  No products available in {priceLabel} range
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition"
                >
                  <ArrowLeft size={13} /> Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ─────────────────────────────────────────────── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col"
               style={{ maxHeight: "88vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-tighter">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel />
            </div>

            {/* Sticky CTA */}
            <div className="px-5 py-4 border-t border-zinc-100 flex-shrink-0 safe-area-pb">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-zinc-900 text-white py-3.5 text-xs font-black uppercase tracking-widest rounded-md active:bg-zinc-800 transition-colors"
              >
                Show {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByPrice;
// import React, {
//   useCallback, useState, useRef, useMemo, useEffect,
// } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import {
//   ArrowLeft, AlertCircle, RefreshCw, ChevronRight,
//   Filter, X, SlidersHorizontal, Loader2, ChevronDown,
// } from "lucide-react";
// import { useVirtualizer } from "@tanstack/react-virtual";

// import WholesaleProductCard from "../../ProductCard/WholesaleProductCard";
// import SkeletonCard from "../../ProductCard/Skelleton/SkeletonCard";

// import { useGetAllProductsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";
// import usePaginatedFetch from "../../HOOKS/usePaginatedFetch";

// // ─────────────────────────────────────────────────────────────────────────────
// // Price slug config
// // Slug se → { label, filterFn } milta hai
// // ─────────────────────────────────────────────────────────────────────────────

// // ─────────────────────────────────────────────────────────────────────────────
// // Column count helper
// // ─────────────────────────────────────────────────────────────────────────────
// const getColumnCount = () => {
//   const w = window.innerWidth;
//   if (w >= 1280) return 5;   // xl
//   if (w >= 1024) return 4;   // lg
//   if (w >= 768) return 3;    // md
//   if (w >= 640) return 2;    // sm
//   return 2;                  // base
// };

// const LOAD_MORE_SKELETON_COUNT = 12;

// // ─────────────────────────────────────────────────────────────────────────────
// // VirtualizedProductGrid — same as CatProducts
// // ─────────────────────────────────────────────────────────────────────────────
// const VirtualizedProductGrid = ({ products, loadingMore }) => {
//   const parentRef = useRef(null);
//   const [cols, setCols] = useState(getColumnCount);

//   useEffect(() => {
//     const onResize = () => setCols(getColumnCount());
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const rows = useMemo(() => {
//     const result = [];
//     for (let i = 0; i < products.length; i += cols)
//       result.push(products.slice(i, i + cols));
//     return result;
//   }, [products, cols]);

//   const skeletonRowCount = loadingMore
//     ? Math.ceil(LOAD_MORE_SKELETON_COUNT / cols)
//     : 0;
//   const totalRows = rows.length + skeletonRowCount;

//   const rowVirtualizer = useVirtualizer({
//     count: totalRows,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 420,
//     overscan: 3,
//   });

//   return (
//     <div ref={parentRef} style={{ width: "100%" }}>
//       <div
//         style={{
//           height: `${rowVirtualizer.getTotalSize()}px`,
//           width: "100%",
//           position: "relative",
//         }}
//       >
//         {rowVirtualizer.getVirtualItems().map((virtualRow) => {
//           const isSkeletonRow = virtualRow.index >= rows.length;
//           const rowItems = isSkeletonRow
//             ? Array(cols).fill(null)
//             : rows[virtualRow.index];

//           return (
//             <div
//               key={virtualRow.key}
//               data-index={virtualRow.index}
//               ref={rowVirtualizer.measureElement}
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 transform: `translateY(${virtualRow.start}px)`,
//               }}
//             >
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 items-stretch">
//                 {isSkeletonRow
//                   ? Array(cols)
//                       .fill(null)
//                       .map((_, i) => (
//                         <SkeletonCard
//                           key={`skel-${virtualRow.index}-${i}`}
//                         />
//                       ))
//                   : rowItems.map((product, i) => (
//                       <WholesaleProductCard
//                         key={product._id || i}
//                         product={product}
//                         index={virtualRow.index * cols + i}
//                       />
//                     ))}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // ShopByPrice
// // ─────────────────────────────────────────────────────────────────────────────
// const ShopByPrice = () => {
//   const {slug} = useParams(); // "under-299" | "299-499" | "499-799" | "above-999"
//   console.log("Slug =", slug);
  
  
//   const navigate = useNavigate();
//  const PRICE_FILTERS = {
//   "under-299": { maxPrice: 299 },
//   "under-999": { maxPrice: 999 },
//   "under-2999": { maxPrice: 2999 },
//   "under-4999": { maxPrice: 4999 },
//   "above-5000": { minPrice: 5000 },
// };

// // Slug se label nikalo
// const PRICE_LABELS = {
//   "under-299": "Under ₹299",
//   "under-999": "Under ₹999",
//   "under-2999": "Under ₹2999",
//   "under-4999": "Under ₹4999",
//   "above-5000": "Above ₹5000",
// };

// const priceLabel = PRICE_LABELS[slug] || "All Products";
//   // ── UI state ────────────────────────────────────────────────────────────────
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [sortBy, setSortBy]             = useState("priceLowHigh"); // default price sort
//   const [filters, setFilters]           = useState({
//     availability: [],   // "instock" | "outofstock"
//     discount:     [],   // "10" | "25" | "50"
//     onSale:       false,
//     category:     [],   // product.category.name values
//   });

//   // Slug change hone pe filters reset karo
//   useEffect(() => {
//     setFilters({ availability: [], discount: [], onSale: false, category: [] });
//     setSortBy("priceLowHigh");
//   }, [slug]);
//  console.log("slug =", slug);
// console.log("PRICE_FILTERS[slug] =", PRICE_FILTERS[slug]);

// const baseArgs = PRICE_FILTERS[slug] || {};

// console.log("baseArgs =", baseArgs);

//   // ── Fetch ALL products (paginated) ──────────────────────────────────────────
//   const {
//     data: products,
//     isLoading,
//     isFetchingMore: loadingMore,
//     pagination,
//     loadMore: handleLoadMore,
//     reset: resetPage,
//     isError: productsError,
//     error: productsErrorDetail,
//     refetch,
//   } = usePaginatedFetch({
//     useQuery: useGetAllProductsQuery,
//     baseArgs: baseArgs,
//     limit:     15,
//     dataKey:  "products",
//      skip: false,
//   });
//   console.log("baseArgs =", baseArgs);  

//   // ── Unique categories nikalo fetched products se (for category filter) ──────
//   const availableCategories = useMemo(() => {
//     if (!products?.length) return [];
//     const cats = new Set(
//       products
//         .map((p) => p.category?.name)
//         .filter(Boolean)
//     );
//     return [...cats].sort();
//   }, [products]);

//   // ── Derived ─────────────────────────────────────────────────────────────────
//   const pageIsLoading = isLoading && products.length === 0;
//   const hasError      = !pageIsLoading && productsError;
//   const hasMore       = pagination?.hasNextPage ?? false;

//   // ── Filter toggle ────────────────────────────────────────────────────────────
//   const toggleFilter = useCallback((key, value) => {
//     setFilters((prev) => {
//       const exists = prev[key].includes(value);
//       return {
//         ...prev,
//         [key]: exists
//           ? prev[key].filter((v) => v !== value)
//           : [...prev[key], value],
//       };
//     });
//   }, []);

//   const clearFilters = useCallback(() => {
//     setFilters({ availability: [], discount: [], onSale: false, category: [] });
//   }, []);

//   // ── Filter logic ─────────────────────────────────────────────────────────────
//   // Step 1: Price slug filter (main filter — ye hamesha lagega)
//   // Step 2: Baaki filters (availability, discount, onSale, category)
//  const filteredProducts = useMemo(() => {
//   if (!products?.length) return [];

//   const priceRange = PRICE_FILTERS[slug] || {};

//   return products.filter((product) => {
//     const variants = product.variants || [];
//     if (!variants.length) return false; // ✅ empty variants skip

//     const prices = variants.map(v => ({
//       // ✅ current field use karo — backend already calculate karta hai
//       current: v.price?.current ?? v.price?.sale ?? v.price?.base ?? 0,
//       qty: v.inventory?.quantity ?? 0,
//       base: v.price?.base ?? 0,
//       sale: v.price?.sale ?? null,
//     }));

//     const lowestPrice = Math.min(...prices.map(p => p.current));

//     // ✅ Price slug filter
//     if (priceRange.maxPrice !== undefined && lowestPrice > priceRange.maxPrice) return false;
//     if (priceRange.minPrice !== undefined && lowestPrice < priceRange.minPrice) return false;

//     const maxDiscount = Math.max(
//       ...prices.map(p =>
//         p.base > 0 && p.sale != null
//           ? Math.round(((p.base - p.sale) / p.base) * 100)
//           : 0
//       )
//     );

//     const totalQty = prices.reduce((sum, p) => sum + p.qty, 0);
//     const isOnSale = prices.some(p => p.sale != null && p.sale < p.base);
//     const catName = product.category?.name ?? "";

//     if (filters.availability.length > 0) {
//       const match = filters.availability.some((a) => {
//         if (a === "instock") return totalQty > 0;
//         if (a === "outofstock") return totalQty <= 0;
//         return false;
//       });
//       if (!match) return false;
//     }

//     if (filters.discount.length > 0) {
//       const match = filters.discount.some((d) => maxDiscount >= Number(d));
//       if (!match) return false;
//     }

//     if (filters.onSale && !isOnSale) return false;

//     if (filters.category.length > 0) {
//       if (!filters.category.includes(catName)) return false;
//     }

//     return true;
//   });
// }, [products, filters, slug]);// ✅ slug add karo dependency mein
//  const getLowestPrice = (product) => {
//   const prices = (product.variants || [])
//     .map(v => v.price?.sale ?? v.price?.base)
//     .filter(Boolean);

//   return prices.length ? Math.min(...prices) : 0;
// };

// const getHighestDiscount = (product) => {
//   const discounts = (product.variants || []).map((v) => {
//     const base = v.price?.base ?? 0;
//     const sale = v.price?.sale ?? base;

//     return base > 0 ? ((base - sale) / base) * 100 : 0;
//   });

//   return discounts.length ? Math.max(...discounts) : 0;
// };

//   // ── Sort logic ───────────────────────────────────────────────────────────────
//   const sortedProducts = useMemo(() => {
//     const data = [...filteredProducts];
//     switch (sortBy) {
//     case "priceLowHigh":
//   return data.sort(
//     (a, b) => getLowestPrice(a) - getLowestPrice(b)
//   );

// case "priceHighLow":
//   return data.sort(
//     (a, b) => getLowestPrice(b) - getLowestPrice(a)
//   );

// case "discount":
//   return data.sort(
//     (a, b) => getHighestDiscount(b) - getHighestDiscount(a)
//   );  case "az":     return data.sort((a, b) => a.name.localeCompare(b.name));
//       case "za":     return data.sort((a, b) => b.name.localeCompare(a.name));
//       case "newest": return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       default:       return data;
//     }
//   }, [filteredProducts, sortBy]);

//   const activeFilterCount = useMemo(
//     () =>
//       filters.availability.length +
//       filters.discount.length +
//       filters.category.length +
//       (filters.onSale ? 1 : 0),
//     [filters]
//   );

//   useEffect(()=>{
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }, [])

//   const handleRetry = useCallback(() => {
//     resetPage();
//     refetch();
//   }, [resetPage, refetch]);
//    useEffect(() => {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }, [])

//   // ── Filter Panel ─────────────────────────────────────────────────────────────
//   const FilterPanel = () => (
//     <div className="space-y-7 font-['satoshi']">

//       {/* Availability */}
//       <div>
//         <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
//           Availability
//         </h4>
//         <div className="space-y-1.5">
//           {[
//             { label: "In stock",     val: "instock"    },
//             { label: "Out of stock", val: "outofstock" },
//           ].map(({ label, val }) => (
//             <label key={val} className="flex items-center gap-3 cursor-pointer group">
//               <div
//                 className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
//                   ${filters.availability.includes(val)
//                     ? "bg-zinc-900 border-zinc-900"
//                     : "border-zinc-300 group-hover:border-zinc-500"}`}
//                 onClick={() => toggleFilter("availability", val)}
//               >
//                 {filters.availability.includes(val) && (
//                   <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
//                     <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                   </svg>
//                 )}
//               </div>
//               <span
//                 className={`text-sm ${filters.availability.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
//                 onClick={() => toggleFilter("availability", val)}
//               >
//                 {label}
//               </span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="h-px bg-zinc-100" />

//       {/* Discount */}
//       <div>
//         <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
//           Discount
//         </h4>
//         <div className="space-y-1.5">
//           {[
//             { label: "10% or more", val: "10" },
//             { label: "25% or more", val: "25" },
//             { label: "50% or more", val: "50" },
//           ].map(({ label, val }) => (
//             <label key={val} className="flex items-center gap-3 cursor-pointer group">
//               <div
//                 className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
//                   ${filters.discount.includes(val)
//                     ? "bg-zinc-900 border-zinc-900"
//                     : "border-zinc-300 group-hover:border-zinc-500"}`}
//                 onClick={() => toggleFilter("discount", val)}
//               >
//                 {filters.discount.includes(val) && (
//                   <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
//                     <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                   </svg>
//                 )}
//               </div>
//               <span
//                 className={`text-sm ${filters.discount.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
//                 onClick={() => toggleFilter("discount", val)}
//               >
//                 {label}
//               </span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="h-px bg-zinc-100" />

//       {/* On Sale */}
//       <div>
//         <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
//           Deals
//         </h4>
//         <label className="flex items-center gap-3 cursor-pointer">
//           <button
//             onClick={() =>
//               setFilters((prev) => ({ ...prev, onSale: !prev.onSale }))
//             }
//             className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
//               filters.onSale ? "bg-zinc-900" : "bg-zinc-200"
//             }`}
//           >
//             <span
//               className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
//                 filters.onSale ? "translate-x-4" : "translate-x-0"
//               }`}
//             />
//           </button>
//           <span
//             className={`text-sm ${
//               filters.onSale ? "text-zinc-900 font-medium" : "text-zinc-800"
//             }`}
//           >
//             On sale only
//           </span>
//         </label>
//       </div>

//       <div className="h-px bg-zinc-100" />

//       {/* Category — dynamic, products se nikala */}
//       {availableCategories.length > 0 && (
//         <div>
//           <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
//             Category
//           </h4>
//           <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
//             {availableCategories.map((cat) => (
//               <label key={cat} className="flex items-center gap-3 cursor-pointer group">
//                 <div
//                   className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
//                     ${filters.category.includes(cat)
//                       ? "bg-zinc-900 border-zinc-900"
//                       : "border-zinc-300 group-hover:border-zinc-500"}`}
//                   onClick={() => toggleFilter("category", cat)}
//                 >
//                   {filters.category.includes(cat) && (
//                     <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
//                       <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   )}
//                 </div>
//                 <span
//                   className={`text-sm ${filters.category.includes(cat) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
//                   onClick={() => toggleFilter("category", cat)}
//                 >
//                   {cat}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Clear all */}
//       {activeFilterCount > 0 && (
//         <button
//           onClick={clearFilters}
//           className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
//         >
//           Clear all filters
//         </button>
//       )}
//     </div>
//   );
//   console.log('Total products from API:', products?.length);
// console.log('After filter:', filteredProducts?.length);
// console.log('Price range:', PRICE_FILTERS[slug]);
// console.log('Sample product price:', products?.[0]?.variants?.[0]?.price);

//   // ── Render ───────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

//       {/* STICKY BREADCRUMB */}
//       <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
//         <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="p-1 text-zinc-500 hover:text-zinc-900"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <nav className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
//               <Link to="/" className="hover:text-zinc-900">Home</Link>
//               <ChevronRight size={10} />
//               <Link to="/shop-by-price" className="hover:text-zinc-900">Shop by Price</Link>
//               <ChevronRight size={10} />
//               <span className="text-zinc-900 font-bold">{priceLabel}</span>
//             </nav>
//           </div>
//           <button
//             onClick={() => setIsFilterOpen(true)}
//             className="md:hidden flex items-center gap-2 p-2 text-zinc-900"
//           >
//             <Filter size={18} />
//             {activeFilterCount > 0 && (
//               <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
//                 {activeFilterCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* HERO */}
//       <section className="relative h-[35vh] sm:h-[40vh] md:h-[50vh] flex items-end overflow-hidden bg-gray-900">
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
//         <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F7A221]" />
//         <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-10 md:pb-14">
//           <div className="flex items-end justify-between gap-6">
//             <div>
//               <p className="text-[#F7A221] text-[10px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
//                 <span className="w-6 h-[2px] bg-[#F7A221] inline-block" />
//                 Wholesale Deals
//               </p>
//               <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase leading-none tracking-tighter">
//                 {priceLabel}  {/* "Under ₹299" etc */}
//               </h1>
//               <p className="mt-4 max-w-md text-gray-400 text-sm leading-relaxed font-medium">
//                 Best wholesale prices — bulk savings on every order
//               </p>
//             </div>
//             {!pageIsLoading && (
//               <div className="hidden md:flex flex-col items-end flex-shrink-0">
//                 <span className="text-5xl font-black text-white leading-none">
//                   {sortedProducts.length}
//                 </span>
//                 <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">
//                   Products
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* MAIN CONTENT */}
//       <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex flex-col md:flex-row gap-6 sm:gap-10">

//         {/* SIDEBAR */}
//         <aside className="hidden md:block w-64 flex-shrink-0">
//           <div className="sticky top-24">
//             <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
//               <div className="flex items-center gap-2">
//                 <SlidersHorizontal size={15} />
//                 <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
//               </div>
//               {activeFilterCount > 0 && (
//                 <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
//                   {activeFilterCount}
//                 </span>
//               )}
//             </div>
//             <FilterPanel />
//           </div>
//         </aside>

//         {/* PRODUCT GRID AREA */}
//         <div className="flex-grow">

//           {/* Toolbar */}
//        <div className="flex items-center justify-between flex-wrap gap-3 mb-8 sm:mb-10">

//   {/* LEFT SIDE */}
//   <div className="flex items-center gap-3 sm:gap-4">

//     {/* FILTER BUTTON (ADD THIS) */}
//     <button
//       onClick={() => setIsFilterOpen(true)}
//       className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border rounded-lg hover:bg-black hover:text-white transition md:hidden"
//     >
//       ⚙️ Filter
//       {activeFilterCount > 0 && (
//         <span className="ml-1 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
//           {activeFilterCount}
//         </span>
//       )}
//     </button>

//     {/* SORT */}
//     <div className="flex items-center gap-2">
//       <p className="text-xs font-semibold uppercase text-zinc-800 tracking-[0.1em]">
//         Sort By:
//       </p>

//       <div className="relative">
//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="appearance-none bg-white px-3 pr-10 py-2 text-sm font-semibold text-zinc-800 rounded-md border border-zinc-200 hover:border-zinc-400 focus:border-black outline-none cursor-pointer"
//         >
//           <option value="priceLowHigh">Price: Low to High</option>
//           <option value="priceHighLow">Price: High to Low</option>
//           <option value="discount">Biggest Discount</option>
//           <option value="az">A-Z</option>
//           <option value="za">Z-A</option>
//           <option value="newest">Newest</option>
//         </select>

//         <ChevronDown
//           size={16}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
//         />
//       </div>
//     </div>
//   </div>

//   {/* RIGHT SIDE */}
//   <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-full border">
//     <span className="text-lg font-semibold text-zinc-800">
//       {sortedProducts.length}
//     </span>
//     <span className="text-[10px] uppercase tracking-widest text-zinc-400">
//       Products
//     </span>
//   </div>
// </div>

//           {/* Content */}
//           <div className="relative min-h-[60vh]">

//             {/* Error */}
//             {hasError && (
//               <div className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in duration-500">
//                 <div className="p-4 rounded-full bg-red-50 mb-4">
//                   <AlertCircle size={28} className="text-red-400" />
//                 </div>
//                 <p className="text-zinc-600 text-sm mb-6 max-w-sm">
//                   {productsErrorDetail?.message || "Something went wrong loading products."}
//                 </p>
//                 <button
//                   onClick={handleRetry}
//                   className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-5 py-2 border border-zinc-300 rounded-full hover:bg-black hover:text-white transition-all"
//                 >
//                   <RefreshCw size={14} /> Retry
//                 </button>
//               </div>
//             )}

//             {/* Loading skeleton */}
//             {pageIsLoading && (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
//                 {[...Array(8)].map((_, i) => (
//                   <div key={i} className="animate-pulse space-y-3">
//                     <div className="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg" />
//                     <div className="h-3 bg-zinc-200 rounded w-3/4" />
//                     <div className="h-3 bg-zinc-100 rounded w-1/2" />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Products grid */}
//             {!pageIsLoading && !hasError && sortedProducts.length > 0 && (
//               <div className="animate-in fade-in duration-700">
//                <VirtualizedProductGrid
//   key={slug}
//   products={sortedProducts}
//   loadingMore={loadingMore}
// />

//                 {/* Load more */}
//                 <div className="mt-20 text-center">
//                   {hasMore ? (
//                     <div className="space-y-6">
//                       <button
//                         onClick={handleLoadMore}
//                         disabled={loadingMore}
//                         className="px-6 sm:px-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-full hover:bg-[#F7A221] duration-300 bg-zinc-800 text-zinc-100 transition-all disabled:opacity-60"
//                       >
//                         <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
//                           {loadingMore ? (
//                             <Loader2 size={14} className="animate-spin" />
//                           ) : (
//                             "Load More"
//                           )}
//                         </span>
//                       </button>
//                       <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
//                         {products.length} / {pagination?.total || 0} loaded
//                       </p>
//                     </div>
//                   ) : (
//                     products.length > 0 && (
//                       <p className="text-xs uppercase tracking-[0.4em] text-zinc-300 py-10">
//                         End of Collection
//                       </p>
//                     )
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* No results after filter */}
//             {!pageIsLoading && !hasError && sortedProducts.length === 0 && products.length > 0 && (
//               <div className="py-32 flex flex-col items-center text-center animate-in fade-in">
//                 <h2 className="text-xl font-semibold text-zinc-700 mb-2">
//                   No products found
//                 </h2>
//                 <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">
//                   Try different filters
//                 </p>
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition"
//                 >
//                   Reset Filters
//                 </button>
//               </div>
//             )}
//             {!pageIsLoading && !hasError && products.length === 0 && (
//   <div className="py-32 flex flex-col items-center text-center animate-in fade-in">
//     <div className="p-4 rounded-full bg-zinc-100 mb-4">
//       <AlertCircle size={28} className="text-zinc-400" />
//     </div>
//     <h2 className="text-xl font-semibold text-zinc-700 mb-2">No Products Found</h2>
//     <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">
//       No products available in {priceLabel} range
//     </p>
//     <button
//       onClick={() => navigate(-1)}
//       className="flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition"
//     >
//       <ArrowLeft size={14} /> Go Back
//     </button>
//   </div>
// )}
//           </div>
//         </div>
//       </div>

//       {/* MOBILE FILTER DRAWER */}
//       {isFilterOpen && (
//         <div className="fixed inset-0 z-[100] md:hidden">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => setIsFilterOpen(false)}
//           />
//           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
//             <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
//               <div className="flex items-center gap-2">
//                 <h3 className="text-base font-bold uppercase tracking-tighter">Filters</h3>
//                 {activeFilterCount > 0 && (
//                   <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
//                     {activeFilterCount}
//                   </span>
//                 )}
//               </div>
//               <button onClick={() => setIsFilterOpen(false)}>
//                 <X size={22} />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto px-6 py-4">
//               <FilterPanel />
//             </div>
//             <div className="px-6 py-4 border-t border-zinc-100">
//               <button
//                 onClick={() => setIsFilterOpen(false)}
//                 className="w-full bg-zinc-900 text-white py-4 text-xs font-black uppercase tracking-widest"
//               >
//                 Show {sortedProducts.length} products
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShopByPrice;