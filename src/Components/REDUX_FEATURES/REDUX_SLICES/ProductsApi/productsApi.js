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
      query: (filters = {}) => ({ url: "/products/all", params: filters }),
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
  }),
});

export const {
  useGetProductsByCategoryQuery,
  useGetAllProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetRelatedProductsQuery,
  useSearchProductsQuery,
} = productsApi;