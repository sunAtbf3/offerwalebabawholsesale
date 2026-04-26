// ─────────────────────────────────────────────────────────────────────────────
// CatProducts.jsx  — Wholesale version
// Uses RTK Query (productsApi + categoriesApi) instead of createAsyncThunk.
// usePaginatedFetch is the new hook that wraps RTK Query pagination.
// WholesaleProductCard replaces ProductCard.
// Everything else (filters, virtualizer, sort, UI) is identical to ecom.
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

import { useGetProductsByCategoryQuery } from "../../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";
import { useGetCategoryBySlugQuery } from "../../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
import usePaginatedFetch from "../../HOOKS/usePaginatedFetch";

// ── Column count helper (must match Tailwind grid below) ─────────────────────
const getColumnCount = () => {
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  return 1;
};

const LOAD_MORE_SKELETON_COUNT = 12;

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
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 pb-10">
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
                    ))
                }
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
  const [isSortOpen, setIsSortOpen]     = useState(false);
  const [sortBy, setSortBy]             = useState("az");
  const [filters, setFilters]           = useState({
    price: [], availability: [], discount: [], onSale: false,
  });

  // Reset filters + sort when slug changes
  useEffect(() => {
    setFilters({ price: [], availability: [], discount: [], onSale: false });
    setSortBy("az");
  }, [slug]);

  // ── Category metadata (RTK Query) ──────────────────────────────────────────
  const {
    data: currentCategory,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetCategoryBySlugQuery(slug, { skip: !slug });

  // ── Paginated products (RTK Query via usePaginatedFetch) ───────────────────
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
    useQuery:  useGetProductsByCategoryQuery,
    baseArgs:  { slug },
    limit:     8,
    dataKey:   "products",
    skip: !slug, 
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const pageIsLoading = (isLoading || categoryLoading) && products.length === 0;
  const hasError      = !pageIsLoading && (productsError || categoryError);
  const hasMore       = pagination?.hasNextPage ?? false;
  const categoryName  = currentCategory?.name || slug?.replace(/-/g, " ") || "Collection";

  // ── Filter toggle ──────────────────────────────────────────────────────────
  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((v) => v !== value) : [...prev[key], value],
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ price: [], availability: [], discount: [], onSale: false });
  }, []);

  // ── Filter logic ───────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!products?.length) return [];

    return products.filter((product) => {
      const variant = product.variants?.[0];
      const base    = variant?.price?.base ?? 0;
      const sale    = variant?.price?.sale ?? base;
      const qty     = variant?.inventory?.quantity ?? 0;
      const discount = base > 0 ? Math.round(((base - sale) / base) * 100) : 0;
      const isOnSale = sale < base;

      if (filters.price.length > 0) {
        const match = filters.price.some((p) => {
          if (p === "u29")   return base < 29;
          if (p === "29-49") return base >= 29 && base <= 49;
          if (p === "49-79") return base >= 49 && base <= 79;
          if (p === "o99")   return base > 99;
          return false;
        });
        if (!match) return false;
      }

      if (filters.availability.length > 0) {
        const match = filters.availability.some((a) => {
          if (a === "instock")    return qty > 0;
          if (a === "outofstock") return qty <= 0;
          return false;
        });
        if (!match) return false;
      }

      if (filters.discount.length > 0) {
        const match = filters.discount.some((d) => discount >= Number(d));
        if (!match) return false;
      }

      if (filters.onSale && !isOnSale) return false;

      return true;
    });
  }, [products, filters]);

  // ── Sort logic ─────────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    const data = [...filteredProducts];
    switch (sortBy) {
      case "priceLowHigh":
        return data.sort((a, b) => {
          const ap = a.variants?.[0]?.price?.sale ?? a.variants?.[0]?.price?.base ?? 0;
          const bp = b.variants?.[0]?.price?.sale ?? b.variants?.[0]?.price?.base ?? 0;
          return ap - bp;
        });
      case "priceHighLow":
        return data.sort((a, b) => {
          const ap = a.variants?.[0]?.price?.sale ?? a.variants?.[0]?.price?.base ?? 0;
          const bp = b.variants?.[0]?.price?.sale ?? b.variants?.[0]?.price?.base ?? 0;
          return bp - ap;
        });
      case "discount":
        return data.sort((a, b) => {
          const getD = (p) => {
            const base = p.variants?.[0]?.price?.base ?? 0;
            const sale = p.variants?.[0]?.price?.sale ?? base;
            return base > 0 ? ((base - sale) / base) * 100 : 0;
          };
          return getD(b) - getD(a);
        });
      case "az": return data.sort((a, b) => a.name.localeCompare(b.name));
      case "za": return data.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default: return data;
    }
  }, [filteredProducts, sortBy]);

  const activeFilterCount = useMemo(() => (
    filters.price.length +
    filters.availability.length +
    filters.discount.length +
    (filters.onSale ? 1 : 0)
  ), [filters]);

  const handleRetry = useCallback(() => {
    resetPage();
    refetch();
  }, [resetPage, refetch]);

  // ── Filter Panel ───────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-7 font-['satoshi']">

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "Under ₹29", val: "u29" },
            { label: "₹29 - ₹49", val: "29-49" },
            { label: "₹49 - ₹79", val: "49-79" },
            { label: "Over ₹99",  val: "o99" },
          ].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                  ${filters.price.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}
                onClick={() => toggleFilter("price", val)}
              >
                {filters.price.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${filters.price.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
                onClick={() => toggleFilter("price", val)}
              >{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
          Availability
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "In stock",     val: "instock"    },
            { label: "Out of stock", val: "outofstock" },
          ].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                  ${filters.availability.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}
                onClick={() => toggleFilter("availability", val)}
              >
                {filters.availability.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${filters.availability.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
                onClick={() => toggleFilter("availability", val)}
              >{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
          Discount
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "10% or more", val: "10" },
            { label: "25% or more", val: "25" },
            { label: "50% or more", val: "50" },
          ].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                  ${filters.discount.includes(val) ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-500"}`}
                onClick={() => toggleFilter("discount", val)}
              >
                {filters.discount.includes(val) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${filters.discount.includes(val) ? "text-zinc-900 font-medium" : "text-zinc-800"}`}
                onClick={() => toggleFilter("discount", val)}
              >{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 mb-4">
          Deals
        </h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, onSale: !prev.onSale }))}
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${filters.onSale ? "bg-zinc-900" : "bg-zinc-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filters.onSale ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm ${filters.onSale ? "text-zinc-900 font-medium" : "text-zinc-800"}`}>
            On sale only
          </span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── STICKY BREADCRUMB ── */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1 text-zinc-500 hover:text-zinc-900">
              <ArrowLeft size={20} />
            </button>
            <nav className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
              <Link to="/" className="hover:text-zinc-900">Home</Link>
              <ChevronRight size={10} />
              <span className="text-zinc-900 font-bold">{categoryName}</span>
            </nav>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-2 p-2 text-zinc-900"
          >
            <Filter size={18} />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-end overflow-hidden bg-gray-900">
        {currentCategory?.image?.url && (
          <img
            src={currentCategory.image.url}
            alt={categoryName}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F7A221]" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-10 md:pb-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[#F7A221] text-[10px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#F7A221] inline-block" />
                Wholesale Collection
              </p>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase leading-none tracking-tighter">
                {categoryName}
              </h1>
              {currentCategory?.description && (
                <p className="mt-4 max-w-md text-gray-400 text-sm leading-relaxed font-medium">
                  {currentCategory.description}
                </p>
              )}
            </div>
            {!pageIsLoading && (
              <div className="hidden md:flex flex-col items-end flex-shrink-0">
                <span className="text-5xl font-black text-white leading-none">
                  {pagination?.total || 0}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">
                  Products
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-10">

        {/* ── SIDEBAR ── */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} />
                <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
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

        {/* Mobile sort sheet */}
        {isSortOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsSortOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6">
              <h3 className="text-sm font-bold mb-4 uppercase tracking-widest">Sort By</h3>
              <div className="space-y-4">
                {[
                  { label: "A-Z",              val: "az"           },
                  { label: "Z-A",              val: "za"           },
                  { label: "Price Low → High", val: "priceLowHigh" },
                  { label: "Price High → Low", val: "priceHighLow" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => { setSortBy(opt.val); setIsSortOpen(false); }}
                    className={`block w-full text-left text-sm ${sortBy === opt.val ? "font-bold text-black" : "text-zinc-500"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCT GRID AREA ── */}
        <div className="flex-grow">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold uppercase text-zinc-800 tracking-[0.1em]">Sort By:</p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/60 backdrop-blur-md px-3 pr-10 py-2 text-sm font-semibold text-zinc-800 rounded-md shadow-sm border border-zinc-200 hover:border-zinc-400 focus:border-black focus:ring-0 outline-none transition-all cursor-pointer"
                >
                  <option value="az">Alphabetically, A-Z</option>
                  <option value="za">Alphabetically, Z-A</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200">
              <span className="text-lg font-semibold text-zinc-800">{filteredProducts.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Products</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative min-h-[60vh]">

            {/* Error */}
            {hasError && (
              <div className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in duration-500">
                <div className="p-4 rounded-full bg-red-50 mb-4">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <p className="text-zinc-600 text-sm mb-6 max-w-sm">
                  {productsErrorDetail?.message || "Something went wrong loading products."}
                </p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-5 py-2 border border-zinc-300 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {pageIsLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Products grid */}
            {!pageIsLoading && !hasError && filteredProducts.length > 0 && (
              <div className="animate-in fade-in duration-700">
                <VirtualizedProductGrid
                  key={slug}
                  products={sortedProducts}
                  loadingMore={loadingMore}
                />

                {/* Load more */}
                <div className="mt-20 text-center">
                  {hasMore ? (
                    <div className="space-y-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-10 py-3 rounded-full hover:bg-[#F7A221] duration-300 bg-zinc-800 text-zinc-100 transition-all disabled:opacity-60"
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
                          {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Load More"}
                        </span>
                      </button>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        {products.length} / {pagination?.total || 0} viewed
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs uppercase tracking-[0.4em] text-zinc-300 py-10">
                      End of Collection
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No results after filter */}
            {!pageIsLoading && !hasError && filteredProducts.length === 0 && products.length > 0 && (
              <div className="py-32 flex flex-col items-center text-center animate-in fade-in">
                <h2 className="text-xl font-semibold text-zinc-700 mb-2">No products found</h2>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6">Try different filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider border border-zinc-300 rounded-full hover:bg-black hover:text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold uppercase tracking-tighter">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button onClick={() => setIsFilterOpen(false)}><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterPanel />
            </div>
            <div className="px-6 py-4 border-t border-zinc-100">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-zinc-900 text-white py-4 text-xs font-black uppercase tracking-widest"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatProducts;