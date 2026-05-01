// ─────────────────────────────────────────────────────────────────────────────
// productsApi.js  — RTK Query (wholesale)
// ALL async API calls live here. No createAsyncThunk anywhere.
// Uses wholesaleAxios so every request carries X-Store-Type: wholesale
// ─────────────────────────────────────────────────────────────────────────────

import { createApi } from "@reduxjs/toolkit/query/react";
import wholesaleAxios from "../../../../SERVICES/wholesaleAxios";    //right path

// ── Custom baseQuery wrapping wholesaleAxios ──────────────────────────────────
const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await wholesaleAxios({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        },
      };
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product", "CategoryProducts"],

  endpoints: (builder) => ({

    // ── GET products by category slug (paginated) ─────────────────────────────
    // This is what CatProducts page uses via usePaginatedFetch
   
    getProductsByCategory: builder.query({
      query: ({ slug, page = 1, limit = 12 }) => ({
        url: `/products/category/${slug}`,
        params: { page, limit },
      }),
      // Keep previous pages in cache — we merge manually in the hook
      serializeQueryArgs: ({ queryArgs }) => queryArgs.slug,
      // Merge incoming page into existing cached data
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1) {
          // Fresh load or slug changed — replace everything
          return newData;
        }
        // Load more — append without duplicates
        const existingIds = new Set(currentCache.products.map((p) => p._id));
        const fresh = newData.products.filter((p) => !existingIds.has(p._id));
        return {
          ...newData,
          products: [...currentCache.products, ...fresh],
        };
      },
      // Re-fetch when page arg changes
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.slug !== previousArg?.slug,
      providesTags: (_result, _err, { slug }) => [
        { type: "CategoryProducts", id: slug },
      ],
    }),

    // ── GET all products (generic listing) ────────────────────────────────────
  getAllProducts: builder.query({
  query: ({ page = 1, limit = 12, ...filters } = {}) => ({
    url: "/products/all",
    params: {
      page,
      limit,
      ...filters,
    },
  }),

  serializeQueryArgs: ({ queryArgs }) => {
    const { page, ...rest } = queryArgs || {};
    return JSON.stringify(rest);
  },

 merge: (currentCache, newData, { arg }) => {
  if (!currentCache || arg.page === 1) {
    return newData;
  }

  const existingIds = new Set(
    currentCache.products.map((p) => p._id)
  );

  const fresh = newData.products.filter(
    (p) => !existingIds.has(p._id)
  );

  return {
    ...newData,
    products: [...currentCache.products, ...fresh],
  };
},

forceRefetch: ({ currentArg, previousArg }) =>
  JSON.stringify(currentArg) !== JSON.stringify(previousArg),

  transformResponse: (res) => res,
  providesTags: ["Product"],
}),

    // ── GET single product by slug ────────────────────────────────────────────
    getProductBySlug: builder.query({
      query: (slug) => ({ url: `/products/${slug}` }),
      transformResponse: (res) => res.product || null,
      providesTags: (_result, _err, slug) => [{ type: "Product", id: slug }],
    }),

    // ── GET featured products ─────────────────────────────────────────────────
    getFeaturedProducts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/products/featured",
        params: { page, limit },
      }),
      transformResponse: (res) => res,
      providesTags: ["Product"],
    }),

    // ── GET related products ──────────────────────────────────────────────────
    getRelatedProducts: builder.query({
      query: ({ slug, limit = 8 }) => ({
        url: `/products/${slug}/related`,
        params: { limit },
      }),
      transformResponse: (res) => res.related || [],
      providesTags: (_result, _err, { slug }) => [{ type: "Product", id: `related-${slug}` }],
    }),

    // ── GET search results ────────────────────────────────────────────────────
    searchProducts: builder.query({
      query: ({ query, page = 1, limit = 12 }) => ({
        url: "/products/search",
        params: { q: query, page, limit },
      }),
      transformResponse: (res) => res,
    }),
     // ── GET products by tag ─────────────────────────────
   getProductsByTag: builder.query({
  query: ({ tag, page = 1, limit = 12 }) => ({
    url: "/products/all",
    params: { tags: tag, page, limit },
  }),

  serializeQueryArgs: ({ queryArgs }) =>
    JSON.stringify({ tag: queryArgs.tag }),

  merge: (currentCache, newData, { arg }) => {
    if (!currentCache || arg.page === 1) return newData;
    const existingIds = new Set(currentCache.products.map((p) => p._id));
    const fresh = newData.products.filter((p) => !existingIds.has(p._id));
    return {
      ...newData,
      products: [...currentCache.products, ...fresh],
    };
  },

  forceRefetch: ({ currentArg, previousArg }) =>
    currentArg?.page !== previousArg?.page ||
    currentArg?.tag !== previousArg?.tag,

  // ✅ FIX: pagination object ko flatten karo
  transformResponse: (res) => ({
    products: res.products || [],
    currentPage: res.pagination?.page || 1,
    totalPages: res.pagination?.totalPages || 1,
    total: res.pagination?.total || 0,
    hasNextPage: res.pagination?.hasNextPage || false,
    appliedTags: res.appliedTags || [],
  }),

  providesTags: (_result, _err, { tag }) => [
    { type: "Product", id: `tag-${tag}` },
  ],
}),
 // ── GET products by tag and category ─────────────────────────────
    getProductsByTagAndCategory: builder.query({
  query: ({
    slug,
    tag,
    page = 1,
    limit = 12,
  }) => ({
    url: `/products/category/${slug}`,
    params: {
      tags: tag,
      page,
      limit,
    },
  }),

  serializeQueryArgs: ({ queryArgs }) =>
    `${queryArgs.slug}-${queryArgs.tag}`,

  merge: (currentCache, newData, { arg }) => {
    if (!currentCache || arg.page === 1) {
      return newData;
    }

    const existingIds = new Set(
      currentCache.products.map((p) => p._id)
    );

    const fresh = newData.products.filter(
      (p) => !existingIds.has(p._id)
    );

    return {
      ...newData,
      products: [...currentCache.products, ...fresh],
    };
  },

  forceRefetch: ({ currentArg, previousArg }) =>
    currentArg?.page !== previousArg?.page ||
    currentArg?.slug !== previousArg?.slug ||
    currentArg?.tag !== previousArg?.tag,

  transformResponse: (res) => res,

  providesTags: (_result, _err, { slug, tag }) => [
    {
      type: "CategoryProducts",
      id: `${slug}-${tag}`,
    },
  ],
}),
getTaggedSections: builder.query({
  async queryFn(_arg, _api, _extraOptions, baseQuery) {
    const [onSale, todayArrival] = await Promise.all([
      baseQuery({
        url: "/products/all",
        params: {
          tags: "on-sale",
          page: 1,
          limit: 12,
        },
      }),
      baseQuery({
        url: "/products/all",
        params: {
          tags: "today-arrival",
          page: 1,
          limit: 12,
        },
      }),
    ]);

    if (onSale.error) return { error: onSale.error };
    if (todayArrival.error) return { error: todayArrival.error };

    return {
      data: {
        onSale: onSale.data,
        todayArrival: todayArrival.data,
      },
    };
  },

  providesTags: ["Product"],
}),
  }),
});

export const {
  useGetProductsByCategoryQuery,
  useGetAllProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetRelatedProductsQuery,
  useSearchProductsQuery,
    useGetProductsByTagQuery,
  useGetProductsByTagAndCategoryQuery,
  useGetTaggedSectionsQuery,
} = productsApi;