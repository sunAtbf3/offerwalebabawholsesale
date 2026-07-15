import React, { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useGetFeaturedProductsQuery } from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";
import WholesaleProductCard from "../ProductCard/WholesaleProductCard";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";
import { openModal } from "../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";

// ── Skeleton ─────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="border rounded-2xl p-3 animate-pulse">
    <div className="w-full aspect-square bg-gray-200 rounded-xl" />
    <div className="h-3 bg-gray-200 mt-3 w-3/4 rounded" />
    <div className="h-3 bg-gray-200 mt-2 w-1/2 rounded" />
  </div>
);

const ExploreBestsellers = () => {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const loadingMoreRef = useRef(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const handleOpenAuth = () => {
      dispatch(openModal('login'));  // ✅ openModal is already imported
    };
    // Add this near the top with other hooks
const dispatch = useDispatch();

  const { data: apiData, isFetching } = useGetFeaturedProductsQuery({
    page,
    limit: 10,
  });

  // ── Sync products safely (pagination aware) ─────────────
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
      const filtered = incoming.filter((p) => !existingIds.has(p._id));
      return [...prev, ...filtered];
    });

    loadingMoreRef.current = false;
  }, [apiData]);

  // ── Load more (race-safe) ───────────────────────────────
  const loadMore = () => {
      if (!isAuthenticated) {
    dispatch(openModal('login'));
    return;
  }
    if (isFetching || loadingMoreRef.current) return;
    if (!apiData?.pagination?.hasNextPage) return;

    loadingMoreRef.current = true;
    setPage((p) => p + 1);
  };

  return (
   <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-14">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl sm:text-3xl lg:text-5xl text-navy flex items-center gap-2">
        <span className="w-1 h-5 sm:h-6 bg-gold rounded-full" />
        Explore <span className="text-[#D92243] ml-2">Bestsellers</span>
      </h2>
      <p className="text-[12px] sm:text-[14px] text-muted font-semibold uppercase mt-1 ml-3">
        Best bulk pricing tiers for your business
      </p>
    </div>
  </div>

  {/* GRID */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">

    {isFetching && products.length === 0 &&
      Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}

    {products.map((product, index) => (
      <WholesaleProductCard
        key={product._id}
        product={product}
        index={index}
      />
    ))}
  </div>

  {/* LOAD MORE */}
 {apiData?.pagination?.hasNextPage && (
  <div className="flex justify-center mt-6">
    <button
      onClick={loadMore}
      disabled={isFetching || loadingMoreRef.current}
      className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold border border-zinc-800 text-zinc-800 uppercase hover:bg-black hover:text-zinc-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
    >
      {isFetching ? (
        "Loading..."
      ) : !isAuthenticated ? (
        <> View More</>
      ) : (
        <>View More <ArrowRight size={14} /></>
      )}
    </button>
  </div>
)}

</section>
  );
};

export default ExploreBestsellers;