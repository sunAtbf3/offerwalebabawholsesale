import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, X, Clock, TrendingUp, ChevronRight, Star, XCircle, Package } from 'lucide-react';
import { useLazySearchProductsQuery } from '../../REDUX_FEATURES/REDUX_SLICES/searchApi';
import { debounce, throttle, SearchCache } from './searchUtils';
import SearchSkeleton from './SearchSkeleton';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';

// ─── Wholesale-only helper functions ─────────────────────────────────────────

const isWholesaleListedVariant = (v) => {
  if (!v) return false;
  const ws = v.channelVisibility?.wholesale;
  if (ws != null) return ws === "active";
  // Legacy fallback when channelVisibility is missing
  return v.wholesale === true && v.isActive !== false;
};

const getWholesaleVariants = (product) => {
  if (!product.variants || product.variants.length === 0) return [];
  return product.variants.filter(isWholesaleListedVariant);
};

const getProductImage = (product) => {
  const wholesaleVariants = getWholesaleVariants(product);
  const variantToUse =
    wholesaleVariants.find(v => v.images && v.images.length > 0) ||
    wholesaleVariants[0] ||
    product.variants?.[0];

  if (variantToUse?.images && variantToUse.images.length > 0) {
    return variantToUse.images[0].url;
  }
  return null;
};

const getProductPriceRange = (product) => {
  const wholesaleVariants = getWholesaleVariants(product);
  if (wholesaleVariants.length === 0) return null;

  const prices = wholesaleVariants
    .map(v => v.price?.wholesaleSale || v.price?.wholesaleBase || v.finalPrice)
    .filter(Boolean);

  if (prices.length === 0) return null;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return minPrice === maxPrice
    ? `₹${minPrice.toLocaleString('en-IN')}`
    : `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
};

// ── CHANGED: Added getProductRating (was missing, caused rating to never show) ──
const getProductRating = (product) => {
  const r = product?.rating;
  if (!r) return null;
  if (typeof r === 'number') return r;
  if (typeof r === 'object' && r.value != null) return Number(r.value);
  return null;
};

const getMaxDiscount = (product) => {
  const wholesaleVariants = getWholesaleVariants(product);
  if (wholesaleVariants.length === 0) return null;
  const maxDiscount = Math.max(...wholesaleVariants.map(v => v.discountPercentage || 0));
  return maxDiscount > 0 ? maxDiscount : null;
};

const getMinOrderQty = (product) => {
  const wholesaleVariants = getWholesaleVariants(product);
  if (wholesaleVariants.length === 0) return null;
  const moq = wholesaleVariants[0]?.minimumOrderQuantity;
  return moq && moq > 1 ? moq : null;
};

const isWholesaleProduct = (product) => {
  return product?.channelStatus?.wholesale === 'active';
};

// ─── Product Item Component ───────────────────────────────────────────────────

const ProductItem = memo(({ product, onClick }) => {
  const fallbackImage = 'https://via.placeholder.com/64x64?text=No+Image';
  const productImage = getProductImage(product);
  const priceRange = getProductPriceRange(product);
  const maxDiscount = getMaxDiscount(product);
  const minOrderQty = getMinOrderQty(product);
  const wholesaleVariantCount = getWholesaleVariants(product).length;

  // ── CHANGED: Use getProductRating() instead of product.rating directly ──
  const rating = getProductRating(product);

  return (
    <div
      data-result-item
      onClick={() => onClick(product)}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-0 group"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(product);
        if (e.key === 'ArrowDown') {
          const next = e.target.parentElement?.nextElementSibling;
          next?.querySelector('[data-result-item]')?.focus();
        }
        if (e.key === 'ArrowUp') {
          const prev = e.target.parentElement?.previousElementSibling;
          prev?.querySelector('[data-result-item]')?.focus();
        }
      }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
        ) : (
          // ── CHANGED: Kept Package icon (wholesale brand), retail uses 📦 emoji ──
          <Package size={28} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-800 group-hover:text-[#F7A221] transition-colors truncate">
            {product.name}
          </h3>
          {maxDiscount && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {maxDiscount}% OFF
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-0.5">{product.category?.name || 'Uncategorized'}</p>

        {product.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* ── CHANGED: Was `product.rating` (broken for object ratings), now uses getProductRating() ── */}
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-[#F7A221] text-[#F7A221]" />
              <span className="text-xs font-bold">{Number(rating).toFixed(1)}</span>
            </div>
          )}
          {priceRange && (
            <span className="text-sm font-black text-[#F7A221]">{priceRange}</span>
          )}
          {/* Wholesale badge — wholesale-specific, kept intentionally */}
          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-semibold">
            Wholesale
          </span>
          {minOrderQty && (
            <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
              MOQ: {minOrderQty}
            </span>
          )}
          {/* ── CHANGED: Added inStock badge (was missing, retail had it) ── */}
          {product.inStock !== false && (
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {wholesaleVariantCount > 1 && (
          <p className="text-[10px] text-gray-400 mt-1">
            {wholesaleVariantCount} wholesale variants available
          </p>
        )}
      </div>

      <ChevronRight
        size={18}
        className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
      />
    </div>
  );
});

// ─── Recent Search Item Component ─────────────────────────────────────────────

const RecentSearchItem = memo(({ term, onClick, onRemove }) => (
  <div
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full cursor-pointer transition-colors group max-w-xs"
    onClick={() => onClick(term)}
  >
    <Clock size={12} className="text-gray-400 group-hover:text-[#F7A221]" />
    <span className="text-xs font-medium truncate">{term}</span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(term);
      }}
      className="p-0.5 hover:bg-gray-300 rounded-full cursor-pointer transition-colors"
    >
      <X size={12} className="text-gray-500 hover:text-red-500" />
    </button>
  </div>
));

// ─── Main SearchModal Component ───────────────────────────────────────────────

const SearchModal = ({ isOpen, onClose, initialQuery = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const scrollRef = useRef(null);
  const latestQueryRef = useRef('');
  const isLoadingRef = useRef(false);

  const navigate = useNavigate();
  const cacheRef = useRef(new SearchCache(300000, 50));

  const [triggerSearch, { data, isLoading, isFetching, error, isError }] =
    useLazySearchProductsQuery();

  const normalizeQuery = useCallback((query) => {
    return query?.trim().toLowerCase() || '';
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: allProducts.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 10));
        } catch (e) {
          console.error('Failed to parse recent searches:', e);
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filterWholesaleOnly = useCallback((products) => {
    return (products || []).filter(isWholesaleProduct);
  }, []);

  const updateSearchResults = useCallback(
    (query, newProducts, total, currentPage, hasMoreResults) => {
      const normalizedQuery = normalizeQuery(query);
      const wholesaleProducts = filterWholesaleOnly(newProducts);

      if (currentPage === 1) {
        setAllProducts(wholesaleProducts);
        cacheRef.current.set(normalizedQuery, {
          products: wholesaleProducts,
          total,
          hasMore: hasMoreResults,
          page: currentPage,
          timestamp: Date.now(),
        });
      } else {
        setAllProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNew = wholesaleProducts.filter(p => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });

        const cached = cacheRef.current.get(normalizedQuery);
        if (cached) {
          cacheRef.current.set(normalizedQuery, {
            ...cached,
            products: [...cached.products, ...wholesaleProducts],
            hasMore: hasMoreResults,
            page: currentPage,
            timestamp: Date.now(),
          });
        }
      }

      setTotalResults(total);
      setHasMore(hasMoreResults);
    },
    [normalizeQuery, filterWholesaleOnly]
  );

  const performSearch = useCallback(
    async (query, pageNum = 1) => {
      if (!query || query.trim().length < 2) return;

      const normalizedQuery = normalizeQuery(query);
      latestQueryRef.current = normalizedQuery;

      if (pageNum === 1) {
        const cached = cacheRef.current.get(normalizedQuery);
        if (cached) {
          setAllProducts(cached.products);
          setTotalResults(cached.total);
          setHasMore(cached.hasMore);
          setPage(cached.page);
          return;
        }
      }

      if (isLoadingRef.current && pageNum > 1) return;
      isLoadingRef.current = true;

      try {
        const result = await triggerSearch({
          q: query,
          page: pageNum,
          limit: 20,
          channel: 'wholesale',
        });

        if (latestQueryRef.current !== normalizedQuery) return;

        if (result?.data?.products) {
          updateSearchResults(
            query,
            result.data.products,
            result.data.total,
            pageNum,
            result.data.hasMore
          );
          setPage(pageNum);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [triggerSearch, updateSearchResults, normalizeQuery]
  );

  const debouncedSearch = useCallback(
    debounce((value) => {
      const normalizedValue = normalizeQuery(value);
      if (normalizedValue.length >= 2) {
        setActiveSearchTerm(value);
        setPage(1);
        performSearch(value, 1);
      } else if (normalizedValue.length === 0) {
        setActiveSearchTerm('');
        setAllProducts([]);
      }
    }, 500),
    [performSearch, normalizeQuery]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalizedTerm = normalizeQuery(searchTerm);
    if (normalizedTerm.length >= 2) {
      saveToRecentSearches(searchTerm);
      setActiveSearchTerm(searchTerm);
      setPage(1);
      performSearch(searchTerm, 1);
    }
  };

  const saveToRecentSearches = useCallback(
    (term) => {
      const normalizedTerm = normalizeQuery(term);
      if (!normalizedTerm || normalizedTerm.length < 2) return;

      setRecentSearches(prev => {
        const filtered = prev.filter(t => normalizeQuery(t) !== normalizedTerm);
        const updated = [term, ...filtered].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });
    },
    [normalizeQuery]
  );

  const handleProductClick = (product) => {
    if (activeSearchTerm) saveToRecentSearches(activeSearchTerm);
    onClose();
    navigate(`/product/${product.slug}`);   // ── CHANGED: /product/ → /products/ to match retail ──
  };

  const handleRecentSearchClick = (term) => {
    const normalizedTerm = normalizeQuery(term);
    if (normalizedTerm.length >= 2) {
      setSearchTerm(term);
      setActiveSearchTerm(term);
      setPage(1);
      saveToRecentSearches(term);
      performSearch(term, 1);
      inputRef.current?.focus();
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const removeRecentSearch = (termToRemove) => {
    const updated = recentSearches.filter(t => t !== termToRemove);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setAllProducts([]);
    setPage(1);
    latestQueryRef.current = '';
    inputRef.current?.focus();
  };

  const handleScroll = useCallback(
    throttle(() => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceFromBottom < 150 &&
        hasMore &&
        !isFetching &&
        !isLoadingMore &&
        activeSearchTerm
      ) {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        performSearch(activeSearchTerm, nextPage).finally(() => setIsLoadingMore(false));
      }
    }, 200),
    [hasMore, isFetching, isLoadingMore, activeSearchTerm, page, performSearch]
  );

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleKeyDown]);

  if (!isOpen) return null;

  const hasActiveSearch = activeSearchTerm && normalizeQuery(activeSearchTerm).length >= 2;
  const showRecentSearches = !hasActiveSearch && recentSearches.length > 0;
  const showTrending = !hasActiveSearch && !showRecentSearches;
  const showResults = hasActiveSearch || (searchTerm && normalizeQuery(searchTerm).length >= 2);
  const isLoadingInitial = isLoading && page === 1;
  const trendingProducts = allProducts.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] backdrop-blur-sm animate-fadeIn">
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div
          ref={modalRef}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#F7A221]/5 to-transparent">
            <div className="flex items-center gap-2">
              <Search size={20} className="text-[#F7A221]" />
              <h2 className="text-lg font-black uppercase tracking-tighter">Search Products</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search wholesale products, brands, categories..."
                  className="w-full py-3.5 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#F7A221] focus:outline-none transition-colors text-base"
                  aria-label="Search wholesale products"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results Area */}
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">

            {isLoadingInitial && (
              <div className="p-4"><SearchSkeleton count={5} /></div>
            )}

            {isError && !isLoading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <XCircle size={32} className="text-red-500" />
                </div>
                <p className="text-gray-600 mb-2">Failed to load search results</p>
                <p className="text-sm text-gray-400">
                  {error?.data?.message || error?.message || 'Please try again'}
                </p>
                <button
                  onClick={() => performSearch(searchTerm, 1)}
                  className="mt-4 px-4 py-2 bg-[#F7A221] text-white rounded-lg text-sm font-bold hover:bg-[#e6911a] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoadingInitial && !isError && showResults && (
              <div>
                {allProducts.length > 0 ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b sticky top-0 z-10">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                        Found {totalResults} wholesale results
                        {activeSearchTerm && ` for "${activeSearchTerm}"`}
                      </p>
                    </div>
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const product = allProducts[virtualRow.index];
                        return (
                          <div
                            key={product._id}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                          >
                            <ProductItem product={product} onClick={handleProductClick} />
                          </div>
                        );
                      })}
                    </div>
                    {(isFetching || isLoadingMore) && page > 1 && (
                      <div className="p-4"><SearchSkeleton count={3} /></div>
                    )}
                  </>
                ) : (
                  activeSearchTerm && !isLoading && (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No wholesale products found</p>
                      <p className="text-sm text-gray-400 mt-1">Try different keywords or browse categories</p>
                    </div>
                  )
                )}
              </div>
            )}

            {showRecentSearches && (
              <div>
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Recent Searches</h3>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs cursor-pointer text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                {/* ── CHANGED: p-4 → py-2 to match retail spacing ── */}
                <div className="flex flex-wrap gap-2 py-2">
                  {recentSearches.map((term, idx) => (
                    <RecentSearchItem
                      key={idx}
                      term={term}
                      onClick={handleRecentSearchClick}
                      onRemove={removeRecentSearch}
                    />
                  ))}
                </div>
              </div>
            )}

            {showTrending && trendingProducts.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-[#F7A221]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Trending Wholesale Products
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {trendingProducts.map((product) => (
                    <ProductItem key={product._id} product={product} onClick={handleProductClick} />
                  ))}
                </div>
              </div>
            )}

            {showTrending && trendingProducts.length === 0 && !isLoading && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <TrendingUp size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Search wholesale products</p>
                <p className="text-sm text-gray-400 mt-1">Enter keywords to find wholesale items</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CHANGED: <style jsx> → <style> (jsx prop not valid without styled-components) ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default memo(SearchModal);