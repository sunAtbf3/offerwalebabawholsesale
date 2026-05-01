import React, { useEffect } from 'react';
import { ArrowRight, Zap, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductsByTagQuery } from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi';
import {
  setPageForTag,
  addProductsForTag,
} from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice';
import WholesaleProductCard from '../ProductCard/WholesaleProductCard';
import { Link } from 'react-router-dom';

const TodayArrival = () => {
  const dispatch = useDispatch();

  const page = useSelector(
    (state) => state.userProducts.tagPage?.['today-arrival'] ?? 1
  );

  const storedProducts = useSelector(
    (state) => state.userProducts.tagProducts?.['today-arrival'] ?? []
  );

  const { data, isLoading, isFetching, isError } =
    useGetProductsByTagQuery({
      tag: 'today-arrival',
      page,
      limit: 8,
      _cb: '1',
    });

  const hasMore = data?.hasNextPage ?? false;

  // ✅ Append products (no overwrite)
  useEffect(() => {
    if (data?.products) {
      dispatch(
        addProductsForTag({
          tag: 'today-arrival',
          products: data.products,
        })
      );
    }
  }, [data, dispatch]);

  const handleLoadMore = () => {
    dispatch(setPageForTag({ tag: 'today-arrival', page: page + 1 }));
  };

  if (isError) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-500 mb-4 text-white px-3 py-1 rounded-full shadow-lg shadow-green-200">
              <Package size={15} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Fresh Stock
              </span>
            </div>
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </div>
          </div>
        </div>
         <div className='flex items-center justify-between w-full'>
                     <div>
                    
                  <h2 className="text-3xl md:text-5xl flex items-center gap-4 font-black text-[#0F172A] tracking-tighter uppercase">
                    Today <span className="text-[#F59E0B]">Arrivals</span>
                  </h2>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    Freshly stocked for bulk orders{' '}
                    <Zap size={14} className="text-[#F59E0B]" fill="currentColor" />
                  </p>
                  </div>
                  <Link to="/today-arrival" className='flex items-center gap-2 text-[0.8rem] font-bold text-yellow-500 uppercase tracking-widest group bg-white px-4 py-2 transition-all cursor-pointer shadow-sm disabled:opacity-50'>View All</Link>
                  </div>
      </div>

      {/* Loading */}
      {isLoading && storedProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-zinc-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-zinc-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-100 rounded w-1/3" />
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-4 bg-zinc-100 rounded w-1/2" />
                <div className="h-9 bg-zinc-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : storedProducts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No new arrivals today. Check back soon!
        </div>
      ) : (
        <>
          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storedProducts.map((product, index) => (
              <WholesaleProductCard
                key={product._id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {/* ✅ Bottom View More Button */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="flex items-center gap-2 text-sm font-bold text-[#0F172A] uppercase tracking-widest group bg-white border border-slate-200 px-10 py-4 rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                {isFetching ? 'Loading...' : 'View More'}
                {!isFetching && (
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
          )}

          {/* Spinner */}
          {isFetching && (
            <div className="flex justify-center mt-6">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default TodayArrival;