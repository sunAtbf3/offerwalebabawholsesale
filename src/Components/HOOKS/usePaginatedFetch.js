import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Wholesale RTK Query pagination helper.
 *
 * Usage:
 *   usePaginatedFetch({
 *     useQuery: useGetProductsByCategoryQuery,
 *     baseArgs: { slug },
 *     limit: 10,
 *     dataKey: 'products',
 *     skip: !slug,
 *   })
 *
 * - Page only advances after a successful response (no skip on 429)
 * - Load-more lock prevents double-clicks
 * - isFetchingMore clears when the request settles (success or error)
 */
export default function usePaginatedFetch({
  useQuery,
  baseArgs = {},
  limit = 12,
  dataKey = 'products',
  skip = false,
}) {
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const pageRef = useRef(1);
  const loadMoreLockRef = useRef(false);
  const prevBaseArgsRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const baseArgsKey = useMemo(() => JSON.stringify(baseArgs || {}), [baseArgs]);

  // Reset to page 1 when filter/slug args change
  useEffect(() => {
    if (prevBaseArgsRef.current === null) {
      prevBaseArgsRef.current = baseArgsKey;
      return;
    }
    if (prevBaseArgsRef.current !== baseArgsKey) {
      prevBaseArgsRef.current = baseArgsKey;
      setPage(1);
      pageRef.current = 1;
      setIsFetchingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [baseArgsKey]);

  const queryArgs = useMemo(
    () => ({
      ...(baseArgs || {}),
      page,
      limit,
    }),
    [baseArgs, page, limit]
  );

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(queryArgs, {
    skip: Boolean(skip),
    // Keep prior list visible while fetching next page
    refetchOnMountOrArgChange: true,
  });

  const data = useMemo(() => {
    if (!rawData) return [];
    const list = rawData[dataKey];
    return Array.isArray(list) ? list : [];
  }, [rawData, dataKey]);

  const pagination = useMemo(() => {
    if (!rawData) {
      return {
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    const total = Number(rawData.total) || 0;
    const currentPage = Number(rawData.page) || page;
    const pageLimit = Number(rawData.limit) || limit;
    const totalPages =
      Number(rawData.totalPages) ||
      (pageLimit > 0 ? Math.ceil(total / pageLimit) : 0);
    const hasNextPage =
      rawData.hasNextPage != null
        ? Boolean(rawData.hasNextPage)
        : currentPage * pageLimit < total;

    return {
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages,
      hasNextPage,
      hasPrevPage: currentPage > 1,
    };
  }, [rawData, page, limit]);

  // Clear local load-more spinner when RTK fetch settles
  useEffect(() => {
    if (!isFetching && isFetchingMore) {
      setIsFetchingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [isFetching, isFetchingMore]);

  // On error during load-more, roll page back so retry hits the same page
  useEffect(() => {
    if (!isError || page <= 1) return;
    // Only roll back when this was a load-more (page advanced locally ahead of cache)
    if (Number(rawData?.page) > 0 && Number(rawData.page) < page) {
      setPage(Number(rawData.page));
      pageRef.current = Number(rawData.page);
    } else if (!rawData && page > 1) {
      setPage(1);
      pageRef.current = 1;
    }
    setIsFetchingMore(false);
    loadMoreLockRef.current = false;
  }, [isError, page, rawData]);

  const loadMore = useCallback(() => {
    if (skip) return;
    if (loadMoreLockRef.current || isFetching || isFetchingMore) return;
    if (!pagination.hasNextPage) return;

    const nextPage = pageRef.current + 1;
    if (pagination.totalPages > 0 && nextPage > pagination.totalPages) return;

    loadMoreLockRef.current = true;
    setIsFetchingMore(true);
    setPage(nextPage);
    pageRef.current = nextPage;
  }, [skip, isFetching, isFetchingMore, pagination.hasNextPage, pagination.totalPages]);

  const reset = useCallback(() => {
    setPage(1);
    pageRef.current = 1;
    setIsFetchingMore(false);
    loadMoreLockRef.current = false;
  }, []);

  return {
    data,
    isLoading: Boolean(isLoading && data.length === 0),
    isFetchingMore: Boolean(isFetchingMore || (isFetching && page > 1 && data.length > 0)),
    pagination,
    page,
    loadMore,
    reset,
    resetPage: reset,
    isError: Boolean(isError && data.length === 0),
    error: error || null,
    loadMoreError: Boolean(isError && data.length > 0) ? error : null,
    refetch,
  };
}
