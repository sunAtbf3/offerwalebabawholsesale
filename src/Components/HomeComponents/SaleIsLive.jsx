import React, { useEffect } from 'react';
import { ArrowRight, Flame, Zap } from 'lucide-react';
import { useGetProductsByTagQuery } from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPageForTag,
  addProductsForTag,
} from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice';
import WholesaleProductCard from '../ProductCard/WholesaleProductCard';
import { Link } from 'react-router-dom';

const SaleIsLive = () => {
  const dispatch = useDispatch();

  const page = useSelector(
    (state) => state.userProducts.tagPage?.['on-sale'] ?? 1
  );

  const storedProducts = useSelector(
    (state) => state.userProducts.tagProducts?.['on-sale'] ?? []
  );

  const { data, isLoading, isFetching, isError } =
    useGetProductsByTagQuery({
      tag: 'on-sale',
      page,
      limit: 4,
      _cb: '1',
    });

  const hasMore = data?.hasNextPage ?? false;

  // ✅ Append new products
  useEffect(() => {
    if (data?.products) {
      dispatch(
        addProductsForTag({
          tag: 'on-sale',
          products: data.products,
        })
      );
    }
  }, [data, dispatch]);

  const handleLoadMore = () => {
    dispatch(setPageForTag({ tag: 'on-sale', page: page + 1 }));
  };

  if (isError) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-col justify-between items-start gap-4 mb-6 sm:mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full animate-pulse shadow-lg shadow-orange-200">
              <Flame size={18} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Live Now
              </span>
            </div>
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </div>
          </div>
        </div>
         <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full'>
             <div>
            
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl flex items-center gap-3 sm:gap-4 font-black text-[#0F172A] tracking-tighter uppercase">
            Sale <span className="text-[#F59E0B]">is Live</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            Exclusive Bulk Inventory for Partners{' '}
            <Zap size={14} className="text-[#F59E0B]" fill="currentColor" />
          </p>
          </div>
          <Link to="/on-sale"
  className="w-full sm:w-auto text-center flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-yellow-500 uppercase tracking-widest bg-white px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm hover:bg-yellow-500 hover:text-white">View All</Link>
          </div>
      </div>

      {/* Loading */}
      {isLoading && storedProducts.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
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
          No sale products available right now.
        </div>
      ) : (
        <>
          {/* ✅ Use accumulated products */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {storedProducts.map((product, index) => (
              <WholesaleProductCard
                key={product._id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {/* Load More */}
         {hasMore && (
  <div className="flex justify-center mt-10">
    <button
      onClick={handleLoadMore}
      disabled={isFetching}
className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F172A] uppercase tracking-widest group bg-white border border-slate-200 px-6 sm:px-10 py-3 sm:py-4 rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all shadow-sm disabled:opacity-50"    >
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
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default SaleIsLive;
