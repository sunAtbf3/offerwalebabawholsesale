import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useGetProductsByCategoryQuery } from '../../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi';
import WholesaleProductCard from '../../ProductCard/WholesaleProductCard';
import SkeletonCard from '../../ProductCard/Skelleton/SkeletonCard';
import useInViewFetch from '../../HOOKS/useInViewFetch';

const getColumnCount = () => {
  const w = window.innerWidth;
  if (w >= 1024) return 4;
  if (w >= 768)  return 3;
  return 2;
};

const VirtualizedProductGrid = ({ products, loadingMore }) => {
  const parentRef = useRef(null);
  const [cols, setCols] = useState(getColumnCount);

  useEffect(() => {
    const onResize = () => setCols(getColumnCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < products.length; i += cols)
      result.push(products.slice(i, i + cols));
    return result;
  }, [products, cols]);

  const skeletonRowCount = loadingMore ? Math.ceil(8 / cols) : 0;
  const totalRows = rows.length + skeletonRowCount;

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => (window.innerWidth < 768 ? 420 : 360), []),
    overscan: 2,
  });

  return (
    <div ref={parentRef} style={{ width: '100%' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isSkeletonRow = virtualRow.index >= rows.length;
          const rowItems = isSkeletonRow ? Array(cols).fill(null) : rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {isSkeletonRow
                  ? Array(cols).fill(null).map((_, i) => (
                      <SkeletonCard key={`skel-${virtualRow.index}-${i}`} seed={virtualRow.index * cols + i} />
                    ))
                  : rowItems.map((product, i) => (
                      <WholesaleProductCard
                        key={product._id}
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

// ── Main Component ────────────────────────────────────────────────────────────
const CategorySection = ({ slug, title }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const loadingMoreRef = useRef(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Slug change → full reset
  useEffect(() => {
    setPage(1);
    setProducts([]);
    loadingMoreRef.current = false;
    setShouldFetch(false);
  }, [slug]);

  const triggerFetch = useCallback(() => {
    setShouldFetch(true);
  }, []);

  const { ref: sentinelRef } = useInViewFetch(triggerFetch, {
    disabled: shouldFetch,
  });

  const { data: apiData, isFetching, isError, error, refetch } =
    useGetProductsByCategoryQuery(
      { slug, page, limit: 8 },
      { skip: !slug || !shouldFetch }
    );

  // Merge incoming data
  useEffect(() => {
    if (!apiData) return;

    const incoming = apiData.products || [];

    if (page === 1) {
      setProducts(incoming);
      loadingMoreRef.current = false;
      return;
    }

    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p._id));
      return [...prev, ...incoming.filter((p) => !existingIds.has(p._id))];
    });

    loadingMoreRef.current = false;
  }, [apiData, page]);

  const hasNextPage = apiData
    ? apiData.page * apiData.limit < apiData.total
    : false;

  const initialLoad  = isFetching && products.length === 0;
  const loadingMore  = isFetching && products.length > 0;

  useEffect(()=>{
    window.scrollTo({top:0, behavior: "smooth"})
  },[])

  const loadMore = () => {
    if (isFetching || loadingMoreRef.current || !hasNextPage) return;
    loadingMoreRef.current = true;
    setPage((p) => p + 1);
  };

  const handleRetry = () => {
    setPage(1);
    setProducts([]);
    refetch();
  };

  return (
    <section ref={sentinelRef} className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {!shouldFetch ? (
        // Placeholder to preserve layout before the section is visible.
        <div style={{ minHeight: '480px' }} aria-hidden="true" />
      ) : initialLoad ? (
        // ── Initial skeleton ────────────────────────────────────────────────
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} seed={i} />
            ))}
          </div>
        </>
      ) : isError && products.length === 0 ? (
        // ── Error ────────────────────────────────────────────────────────────
        <div className="py-12 text-center">
          <p className="text-red-500 mb-2 font-medium">Failed to load {title}</p>
          <p className="text-gray-400 text-sm mb-4">
            {error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:opacity-80 transition"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : (
        // ── Content ─────────────────────────────────────────────────────────
        <>
          {/* HEADER — same as ExploreBestsellers */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded-full" />
                {title}
              </h2>
              <p className="text-[12px] text-muted mt-1 ml-3">
                Best bulk pricing tiers for your business
              </p>
            </div>
            <button
              onClick={() => navigate(`/category/${slug}`)}
              className="text-[12px] font-bold text-gold-dark flex items-center gap-1 hover:text-gold transition-colors"
            >
              VIEW ALL <ArrowRight size={14} />
            </button>
          </div>

          {/* GRID */}
          {products.length > 0 ? (
            <>
              <VirtualizedProductGrid
                products={products}
                loadingMore={loadingMore}
              />

              {/* LOAD MORE — same as ExploreBestsellers */}
              {hasNextPage && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={isFetching || loadingMoreRef.current}
                    className="text-sm font-semibold border border-zinc-800 text-zinc-800 uppercase hover:bg-black px-4 py-2 flex items-center gap-2 hover:text-zinc-100 disabled:opacity-50 transition"
                  >
                    {isFetching ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}

              {/* VIEW ALL — jab sab load ho jaye */}
              {!hasNextPage && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => navigate(`/category/${slug}`)}
                    className="text-sm font-semibold border border-zinc-800 text-zinc-800 uppercase hover:bg-black px-4 py-2 flex items-center gap-2 hover:text-zinc-100 disabled:opacity-50 transition"
                  >
                    VIEW ALL <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // /* EMPTY STATE */
            <div className="py-20 text-center">
              <p className="text-sm text-muted mb-4">Coming Soon...</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:opacity-80 transition"
              >
                Explore All
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CategorySection;