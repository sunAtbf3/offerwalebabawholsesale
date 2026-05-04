import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ChevronRight } from "lucide-react";

import ProductCard from "../../../ProductCard/WholesaleProductCard";

import {
  useGetProductsByTagQuery,
} from "../../REDUX_SLICES/ProductsApi/productsApi";

import {
  setPageForTag,
  addProductsForTag,
  resetPageForTag,
  clearProductsForTag,
  clearCurrentProduct,
} from "../../REDUX_SLICES/ProductsApi/userProductsSlice";

const TAG_META = {
  "on-sale": { title: "On Sale", subtitle: "Best deals, handpicked for you" },
  "today-arrival": { title: "Today's Arrival", subtitle: "Fresh drops, just in" },
};

const TagProducts = () => {
  const { tag } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const normalizedTag = useMemo(() => tag?.replace("_", "-"), [tag]);

  const page = useSelector(
    (state) => state.userProducts.tagPage?.[normalizedTag] ?? 1
  );

  const storedProducts =
    useSelector(
      (state) => state.userProducts.tagProducts?.[normalizedTag]
    ) ?? [];

  const meta = TAG_META[normalizedTag] || {
    title: normalizedTag,
    subtitle: "",
  };

  // ───────── FILTER STATE ─────────
  const [filters, setFilters] = useState({
    price: [],
    availability: [],
    discount: [],
    sort: "default",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ───────── API ─────────
  const { data, isFetching, isLoading } = useGetProductsByTagQuery({
    tag: normalizedTag,
    page,
    limit: 22,
  });

  const hasMore = data?.hasNextPage ?? false;

  // ───────── RESET ON TAG CHANGE ─────────
  useEffect(() => {
    dispatch(resetPageForTag(normalizedTag));
    dispatch(clearProductsForTag(normalizedTag));
    dispatch(clearCurrentProduct());

    setFilters({
      price: [],
      availability: [],
      discount: [],
      sort: "default",
    });
  }, [normalizedTag]);

  // ───────── APPEND PRODUCTS ─────────
  useEffect(() => {
    if (data?.products?.length) {
      dispatch(
        addProductsForTag({
          tag: normalizedTag,
          products: data.products,
        })
      );
    }
  }, [data]);

  // ───────── FILTER LOGIC ─────────
  const filteredProducts = useMemo(() => {
    let arr = [...storedProducts];

    return arr.filter((p) => {
      const v = p.variants?.[0];
      const base = v?.price?.base ?? 0;
      const sale = v?.price?.sale ?? base;
      const qty = v?.inventory?.quantity ?? 0;

      const discount =
        base > 0 ? Math.round(((base - sale) / base) * 100) : 0;

      // PRICE
      if (filters.price.length) {
         const ok = filters.price.some((x) => {
    const price = v?.price?.sale ?? v?.price?.base ?? 0;

    if (x === "u1000") return price < 1000;
    if (x === "1000-4000") return price >= 1000 && price <= 4000;
    if (x === "4000-10000") return price >= 4000 && price <= 10000;
    if (x === "o10000") return price > 10000;

    return false;
         })
           if (!ok) return false;   // 🔥 THIS WAS MISSING
      }

      // STOCK
      if (filters.availability.length) {
        const ok = filters.availability.some((x) => {
          if (x === "instock") return qty > 0;
          if (x === "outofstock") return qty <= 0;
        });
        if (!ok) return false;
      }

      // DISCOUNT
      if (filters.discount.length) {
        const ok = filters.discount.some((x) => discount >= Number(x));
        if (!ok) return false;
      }

      return true;
    });
  }, [storedProducts, filters]);

  // ───────── SORT ─────────
  const sortedProducts = useMemo(() => {
    let arr = [...filteredProducts];

    if (filters.sort === "price_low") {
      arr.sort(
        (a, b) =>
          (a.variants?.[0]?.price?.sale ?? 0) -
          (b.variants?.[0]?.price?.sale ?? 0)
      );
    }

    if (filters.sort === "price_high") {
      arr.sort(
        (a, b) =>
          (b.variants?.[0]?.price?.sale ?? 0) -
          (a.variants?.[0]?.price?.sale ?? 0)
      );
    }

    return arr;
  }, [filteredProducts, filters.sort]);

  // ───────── HANDLERS ─────────
  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const exists = prev[type].includes(value);

      return {
        ...prev,
        [type]: exists
          ? prev[type].filter((v) => v !== value)
          : [...prev[type], value],
      };
    });
  };

  const handleLoadMore = () => {
    if (!hasMore) return;

    dispatch(
      setPageForTag({
        tag: normalizedTag,
        page: page + 1,
      })
    );
  };

return (
  <div className="bg-white min-h-screen">

    {/* CENTER WRAPPER */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
      {isFilterOpen && (
  <div
    onClick={() => setIsFilterOpen(false)}
    className="fixed inset-0 bg-black/40 z-[998] lg:hidden"
  />
)}

      {/* ───────── SIDEBAR ───────── */}
      <aside className={`
    fixed lg:static top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[999]
    transform transition-transform duration-300
    ${isFilterOpen ? "translate-x-0" : "translate-x-full"}
    lg:translate-x-0 lg:w-64 lg:h-screen
    border-l lg:border-r
    overflow-y-auto
  `}>
    <div className="flex items-center justify-between px-4 py-3 border-b lg:hidden">
  <span className="font-bold text-sm">Filters</span>
  <button onClick={() => setIsFilterOpen(false)}>✕</button>
</div>
<div className="px-4 py-4">
     <h2 className="font-bold mb-4 lg:mb-6 text-xs sm:text-sm tracking-wider uppercase">
          Filters
        </h2>

        {/* PRICE */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold mb-3 text-gray-600">
            PRICE RANGE
          </h3>

          {[
            ["u1000", "Under ₹1000"],
            ["1000-4000", "₹1000 - 4000"],
            ["4000-10000", "4000 - 10000"],
            ["o10000", "Over ₹10000"],
          ].map(([k, label]) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm mb-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.price.includes(k)}
                onChange={() => toggleFilter("price", k)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* STOCK */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold mb-3 text-gray-600">
            AVAILABILITY
          </h3>

          {[
            ["instock", "In stock"],
            ["outofstock", "Out of stock"],
          ].map(([k, label]) => (
            <label
              key={k}
              className="flex items-center gap-2 text-sm mb-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.availability.includes(k)}
                onChange={() => toggleFilter("availability", k)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* SORT */}
        <div>
          <h3 className="text-xs font-semibold mb-3 text-gray-600">
            SORT BY
          </h3>

          <select
            className="border w-full p-2 text-xs sm:text-sm rounded"
            value={filters.sort}
            onChange={(e) =>
              setFilters((p) => ({ ...p, sort: e.target.value }))
            }
          >
            <option value="default">Default</option>
            <option value="price_low">Price Low</option>
            <option value="price_high">Price High</option>
          </select>
        </div>
</div>
      </aside>

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="flex-1 py-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              {meta.title}
            </h1>
            <p className="text-gray-500 text-sm">{meta.subtitle}</p>
          </div>

          <div className="text-[10px] sm:text-xs border px-3 sm:px-4 py-1.5 rounded-full self-start sm:self-auto">
            {sortedProducts.length} PRODUCTS
          </div>
          <button
  onClick={() => setIsFilterOpen(true)}
  className="lg:hidden flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold uppercase"
>
  ⚙️ Filters
</button>
        </div>

        {/* GRID */}
        {isLoading && storedProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No products found
          </div>
        ) : (
          <>
            {/* CENTER GRID ALIGN FIX */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {sortedProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white text-[10px] sm:text-xs uppercase tracking-widest rounded hover:opacity-90"                >
                  {isFetching ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  </div>
);
};

export default TagProducts;