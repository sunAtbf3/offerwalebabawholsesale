// ─────────────────────────────────────────────────────────────────────────────
// usePaginatedFetch.js
// Generic pagination hook that works with RTK Query's merge strategy.
// Replaces the old hook that relied on createAsyncThunk.
//
// Usage:
//   const { data, isLoading, isFetchingMore, pagination, loadMore, reset }
//     = usePaginatedFetch({ useQuery: useGetProductsByCategoryQuery, args: { slug }, limit: 8 })
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * @param {Function} useQuery   — RTK Query hook (e.g. useGetProductsByCategoryQuery)
 * @param {object}   baseArgs   — args passed to the hook (e.g. { slug })
 * @param {number}   limit      — items per page (default 12)
 * @param {string}   dataKey    — key in the response that holds the array (default "products")
 * @param {boolean}  skip       — whether to skip the query (default false)
 */
const usePaginatedFetch = ({ useQuery, baseArgs, limit = 12, dataKey = "products", skip = false }) => {
  const [page, setPage] = useState(1);
  const [resetKey, setResetKey] = useState(0); // ✅ force re-mount trick
  const isFetchingMoreRef = useRef(false);

  const prevArgsRef = useRef(baseArgs);
  useEffect(() => {
    if (JSON.stringify(prevArgsRef.current) !== JSON.stringify(baseArgs)) {
      setPage(1);
      setResetKey((k) => k + 1); // ✅ reset cache on slug change
      isFetchingMoreRef.current = false;
    }
    prevArgsRef.current = baseArgs;
  }, [baseArgs]);

  const { data: rawData, isLoading, isFetching, isError, error, refetch } = useQuery(
    { ...baseArgs, page, limit, _resetKey: resetKey }, // ✅ resetKey args mein pass karo
    { skip }
  );

  const data = rawData?.[dataKey] ?? [];
  const total = rawData?.total ?? 0;
  const currentPage = rawData?.page ?? 1;
  const currentLimit = rawData?.limit ?? limit;
  const totalPages = Math.ceil(total / currentLimit);
  const hasNextPage = currentPage < totalPages;

  const pagination = {
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    hasNextPage,
    hasPrevPage: currentPage > 1,
  };

  const isFetchingMore = isFetching && data.length > 0 && page > 1;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetching) return;
    isFetchingMoreRef.current = true;
    setPage((prev) => prev + 1);
  }, [hasNextPage, isFetching]);

  const reset = useCallback(() => {
    isFetchingMoreRef.current = false;
    setPage(1);
    setResetKey((k) => k + 1); // ✅ yahi key change karke cache bust hoga
  }, []);

  return {
    data,
    isLoading: isLoading && data.length === 0,
    isFetchingMore,
    isFetching,
    pagination,
    loadMore,
    reset,
    isError,
    error,
    refetch,
  };
};


export default usePaginatedFetch;