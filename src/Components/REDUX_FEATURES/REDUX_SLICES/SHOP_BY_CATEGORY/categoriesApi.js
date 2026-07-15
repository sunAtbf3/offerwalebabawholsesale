import { createApi } from "@reduxjs/toolkit/query/react"; // ← /react is required for hooks
import wholesaleAxios from "../../../../SERVICES/Wholesaleaxios";

// ─────────────────────────────────────────────────────────────────────────────
// Custom baseQuery using wholesaleAxios so every call gets:
//   • X-Store-Type: wholesale  (set in wholesaleAxios defaults)
//   • Authorization: Bearer <token>  (set in wholesaleAxios interceptor)
//   • auto-refresh on 401  (handled in wholesaleAxios interceptor)
// ─────────────────────────────────────────────────────────────────────────────
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
// Categories API  (RTK Query)
// Handles ALL async calls — no createAsyncThunk needed
// ─────────────────────────────────────────────────────────────────────────────
export const categoriesApi = createApi({
  reducerPath: "categoriesApi", // must be added to store
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Category"],

  endpoints: (builder) => ({

    // ── GET all categories (hierarchical) ─────────────────────────────────────
    getAllCategories: builder.query({
      query: () => ({ url: "/categories/categories" }),
      transformResponse: (response) => response.categories || [],
      providesTags: ["Category"],
    }),

    // ── GET single category by ID ─────────────────────────────────────────────
    getCategoryById: builder.query({
      query: (id) => ({ url: `/categories/categories/${id}` }),
      transformResponse: (response) => response.category || null,
      providesTags: (_result, _err, id) => [{ type: "Category", id }],
    }),

    // ── GET category by slug ──────────────────────────────────────────────────
    // Hits /products/category/:slug?page=1&limit=1 to resolve slug → category object
    getCategoryBySlug: builder.query({
      query: (slug) => ({
        url: `/products/category/${slug}`,
        params: { page: 1, limit: 1 },
      }),
      transformResponse: (response) => response.category || null,
      providesTags: (_result, _err, slug) => [{ type: "Category", id: slug }],
    }),
  }),
});

// Auto-generated hooks — use these in components
export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
} = categoriesApi;