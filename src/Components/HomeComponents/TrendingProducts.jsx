import React, { useEffect } from 'react';
import { ArrowRight, Zap, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductsByTagQuery } from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi';
import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
import { selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  setPageForTag,
  addProductsForTag,
} from '../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice';
import WholesaleProductCard from '../ProductCard/WholesaleProductCard';
import { Link } from 'react-router-dom';

const TodayArrival = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const page = useSelector(
    (state) => state.userProducts.tagPage?.['today-arrival'] ?? 1
  );

  const storedProducts =
    useSelector((state) => state.userProducts.tagProducts?.['today-arrival']) ?? [];

  const { data, isLoading, isFetching, isError } = useGetProductsByTagQuery({
    tag: 'today-arrival',
    page,
    limit: 10,
  });

  const hasMore = data?.hasNextPage ?? false;

  // First product ka slug nikalo for "View All" link
  const categorySlug = storedProducts?.[0]?.category?.slug ?? null;

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
    if (!isAuthenticated) {
      dispatch(openModal('login'));
      return;
    }
    dispatch(setPageForTag({ tag: 'today-arrival', page: page + 1 }));
  };

  const handleViewAll = () => {
    if (!isAuthenticated) {
      dispatch(openModal('login'));
      return;
    }
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    }
  };

  if (isError) return null;

  return (
    <section className="  max-w-[1440px]
    mx-auto

  px-5
sm:px-5
md:px-7
lg:px-10
xl:px-12

    py-8
    sm:py-10
    lg:py-14">

      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#D92243] mb-4 text-white px-3 py-1 rounded-full shadow-lg shadow-[#D92243]">
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl flex items-center gap-3 sm:gap-4 text-[#0F172A] tracking-tighter uppercase">
              Today <span className="text-[#D92243]">Arrivals</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              Freshly stocked for bulk orders{' '}
              <Zap size={14} className="text-[#F59E0B]" fill="currentColor" />
            </p>
          </div>

          {/* View All — header mein, authenticated hone pe
          {isAuthenticated && categorySlug && (
            <Link
              to={`/TagProducts/today-arrival`}
              className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-widest group hover:text-[#2563EB] transition-colors"
            >
              View All
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )} */}
        </div>
      </div>

      {/* Loading Skeleton */}
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
          No new arrivals today. Check back soon!
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {storedProducts.map((product, index) => (
              <WholesaleProductCard
                key={product._id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {/* Bottom Buttons — View More + View All */}
          {hasMore && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">

              {/* View More */}
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F172A] uppercase tracking-widest group bg-white border border-zinc-800 px-6 sm:px-4 py-3 sm:py-4 hover:bg-[#0F172A] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                {isFetching ? 'Loading...' : 'View More'}
                {!isFetching && (
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          )}

          {/* Fetching Spinner */}
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