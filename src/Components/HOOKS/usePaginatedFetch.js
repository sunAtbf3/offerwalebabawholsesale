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
 */
const usePaginatedFetch = ({ useQuery, baseArgs, limit = 12, dataKey = "products" }) => {
  const [page, setPage] = useState(1);
  // Track whether this is a "load more" vs fresh/first load
  const isFetchingMoreRef = useRef(false);

  // When baseArgs change (e.g. slug changes) → reset to page 1
  const prevArgsRef = useRef(baseArgs);
  useEffect(() => {
    const prevSlug = prevArgsRef.current?.slug;
    const nextSlug = baseArgs?.slug;
    if (prevSlug !== nextSlug) {
      setPage(1);
      isFetchingMoreRef.current = false;
    }
    prevArgsRef.current = baseArgs;
  }, [baseArgs?.slug]);

  const { data: rawData, isLoading, isFetching, isError, error, refetch } = useQuery(
    { ...baseArgs, page, limit },
    { skip: !baseArgs?.slug }  // don't fire until we have a slug
  );

  // RTK Query's merge gives us the full accumulated array in rawData
  const data       = rawData?.[dataKey]        ?? [];
  const total      = rawData?.total            ?? 0;
  const totalPages = rawData?.totalPages       ?? Math.ceil(total / limit);
  const hasNextPage = page < totalPages;

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage: page > 1,
  };

  // isFetchingMore = we already have data AND we're fetching the next page
  const isFetchingMore = isFetching && data.length > 0 && page > 1;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetching) return;
    isFetchingMoreRef.current = true;
    setPage((prev) => prev + 1);
  }, [hasNextPage, isFetching]);

  const reset = useCallback(() => {
    isFetchingMoreRef.current = false;
    setPage(1);
  }, []);

  return {
    data,
    isLoading: isLoading && data.length === 0, // true only on first load
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