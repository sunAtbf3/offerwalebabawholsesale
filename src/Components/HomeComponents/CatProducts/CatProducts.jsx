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

// ── Column count helper ───────────────────────────────────────────────────────
const getColumnCount = () => {
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640)  return 2;
  return 2; // always at least 2 on mobile
};

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
                position: "absolute", top: 0, left: 0, width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-5 lg:gap-6 pb-4 sm:pb-6 lg:pb-10">
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

// ── CatProducts ───────────────────────────────────────────────────────────────
const CatProducts = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy]             = useState("az");
  const [filters, setFilters]           = useState({
    price: [], availability: [], discount: [], onSale: false,
  });

  useEffect(() => {
    setFilters({ price: [], availability: [], discount: [], onSale: false });
    setSortBy("az");
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
    limit:    6,
    dataKey:  "products",
    skip:     !slug,
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const pageIsLoading = (isLoading || categoryLoading) && products.length === 0;
  const hasError      = !pageIsLoading && (productsError || categoryError);
  const hasMore       = pagination?.hasNextPage ?? false;
  const categoryName  = currentCategory?.name || slug?.replace(/-/g, " ") || "Collection";

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ price: [], availability: [], discount: [], onSale: false });
  }, []);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    if (!products?.length) return [];

    const filtered = products.filter((product) => {
      const variant        = product.variants?.[0];
      const { base, sale } = getVariantPrice(variant);
      const qty            = getVariantStock(variant, product);
      const discountPct    = getDiscountPct(base, sale);
      const isOnSale       = sale < base && base > 0;

      if (filters.price.length > 0) {
        const priceToCheck = sale || base;
        const match = filters.price.some((p) => {
          if (p === "u500")      return priceToCheck < 500;
          if (p === "500-999")   return priceToCheck >= 500  && priceToCheck <= 999;
          if (p === "1000-1999") return priceToCheck >= 1000 && priceToCheck <= 1999;
          if (p === "o2000")     return priceToCheck >= 2000;
          return false;
        });
        if (!match) return false;
      }

      if (filters.availability.length > 0) {
        const inStock = qty > 0;
        const match = filters.availability.some((a) =>
          a === "instock" ? inStock : !inStock
        );
        if (!match) return false;
      }

      if (filters.discount.length > 0) {
        if (!filters.discount.some((d) => discountPct >= Number(d))) return false;
      }

      if (filters.onSale && !isOnSale) return false;
      return true;
    });

    const data = [...filtered];
    switch (sortBy) {
      case "priceLowHigh": return data.sort((a, b) => getVariantPrice(a.variants?.[0]).sale - getVariantPrice(b.variants?.[0]).sale);
      case "priceHighLow": return data.sort((a, b) => getVariantPrice(b.variants?.[0]).sale - getVariantPrice(a.variants?.[0]).sale);
      case "discount":     return data.sort((a, b) => {
        const { base: ab, sale: as } = getVariantPrice(a.variants?.[0]);
        const { base: bb, sale: bs } = getVariantPrice(b.variants?.[0]);
        return getDiscountPct(bb, bs) - getDiscountPct(ab, as);
      });
      case "az":      return data.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || ""));
      case "za":      return data.sort((a, b) => (b.title || b.name || "").localeCompare(a.title || a.name || ""));
      case "newest":  return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:        return data;
    }
  }, [products, filters, sortBy]);

  const activeFilterCount = useMemo(() => (
    filters.price.length + filters.availability.length +
    filters.discount.length + (filters.onSale ? 1 : 0)
  ), [filters]);

  const handleRetry = useCallback(() => { resetPage(); refetch(); }, [resetPage, refetch]);

  // ── Filter Panel ───────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6 font-['satoshi']">

      {/* Price */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Price Range
        </h4>
        <div className="space-y-2">
          {[
            { label: "Under ₹500",    val: "u500"      },
            { label: "₹500 – ₹999",   val: "500-999"   },
            { label: "₹1000 – ₹1999", val: "1000-1999" },
            { label: "₹2000 & above", val: "o2000"     },
          ].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleFilter("price", val)}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                ${filters.price.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}>
                {filters.price.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm select-none ${filters.price.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Availability */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Availability
        </h4>
        <div className="space-y-2">
          {[{ label: "In stock", val: "instock" }, { label: "Out of stock", val: "outofstock" }].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleFilter("availability", val)}>
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
            <label key={val} className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleFilter("discount", val)}>
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

      {/* On sale toggle */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-3">
          Deals
        </h4>
        <label className="flex items-center gap-3 cursor-pointer"
          onClick={() => setFilters((prev) => ({ ...prev, onSale: !prev.onSale }))}>
          <button type="button"
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${filters.onSale ? "bg-zinc-900" : "bg-zinc-200"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filters.onSale ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm select-none ${filters.onSale ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
            On sale only
          </span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters}
          className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors rounded">
          Clear all filters
        </button>
      )}
    </div>
  );

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

          {/* Mobile filter button */}
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
      <section className="relative h-[28vh] sm:h-[35vh] md:h-[45vh] flex items-end overflow-hidden bg-gray-900">
        {currentCategory?.image?.url && (
          <img
            src={currentCategory.image.url}
            alt={categoryName}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F7A221]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-7 sm:pb-10 md:pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[#F7A221] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-2 sm:mb-3 flex items-center gap-2">
                <span className="w-4 sm:w-6 h-[2px] bg-[#F7A221] inline-block" />
                Wholesale Collection
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase leading-none tracking-tighter">
                {categoryName}
              </h1>
              {currentCategory?.description && (
                <p className="mt-2 sm:mt-4 max-w-xs sm:max-w-md text-gray-400 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
                  {currentCategory.description}
                </p>
              )}
            </div>

            {/* Product count — hidden on mobile */}
            {!pageIsLoading && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <span className="text-3xl md:text-5xl font-black text-white leading-none">
                  {sortedProducts.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mt-1">
                  Products
                </span>
              </div>
            )}
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
              <p className="text-[10px] sm:text-xs font-semibold uppercase text-zinc-500 tracking-[0.1em] hidden sm:block">
                Sort:
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/60 backdrop-blur-md px-2.5 sm:px-3 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-800 rounded-md border border-zinc-200 hover:border-zinc-400 focus:border-black outline-none cursor-pointer"
                >
                  <option value="az">A–Z</option>
                  <option value="za">Z–A</option>
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
                  {val === "u500" ? "Under ₹500" : val === "500-999" ? "₹500–₹999" : val === "1000-1999" ? "₹1000–₹1999" : "₹2000+"}
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
              {filters.discount.map((val) => (
                <button key={val} onClick={() => toggleFilter("discount", val)}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  {val}%+ Off <X size={10} />
                </button>
              ))}
              {filters.onSale && (
                <button onClick={() => setFilters((p) => ({ ...p, onSale: false }))}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold bg-zinc-900 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 transition-colors">
                  On Sale <X size={10} />
                </button>
              )}
              <button onClick={clearFilters}
                className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-zinc-200 rounded-full transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Content */}
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
                <button onClick={handleRetry}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 border border-zinc-300 rounded-full hover:bg-black hover:text-white transition-all">
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {pageIsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-5 lg:gap-6">
                {[...Array(8)].map((_, i) => (
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
                      <button onClick={handleLoadMore} disabled={loadingMore}
                        className="px-8 sm:px-10 py-2.5 sm:py-3 text-xs rounded-full bg-zinc-800 text-zinc-100 hover:bg-[#F7A221] transition-all duration-300 disabled:opacity-60">
                        <span className="flex items-center gap-2 font-semibold uppercase tracking-widest">
                          {loadingMore ? <Loader2 size={13} className="animate-spin" /> : "Load More"}
                        </span>
                      </button>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        {products.length} / {pagination?.total || 0} viewed
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

            {/* No results after filter */}
            {!pageIsLoading && !hasError && sortedProducts.length === 0 && products.length > 0 && (
              <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 mb-2">No products found</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">Try different filters</p>
                <button onClick={clearFilters}
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition">
                  Reset Filters
                </button>
              </div>
            )}

            {/* Empty collection */}
            {!pageIsLoading && !hasError && products.length === 0 && (
              <div className="py-24 sm:py-32 flex flex-col items-center text-center animate-in fade-in px-4">
                <div className="p-3 sm:p-4 rounded-full bg-zinc-100 mb-4">
                  <Package size={24} className="text-zinc-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-700 mb-2">No Products Found</h2>
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