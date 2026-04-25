// ─────────────────────────────────────────────────────────────────────────────
// userProductsSlice.js  — STATE MANAGEMENT ONLY
// No createAsyncThunk. All API calls are in productsApi.js (RTK Query).
// This slice only holds UI state that RTK Query cache doesn't manage.
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Active filters per category slug — persisted across "load more" clicks
  categoryFilters: {},   // { [slug]: { price:[], availability:[], discount:[], onSale:false } }

  // Current page per slug — owned here so usePaginatedFetch can read/write it
  categoryPage: {},      // { [slug]: number }

  // Current product detail (set manually after RTK Query fetch)
  currentProduct: null,
};

const userProductsSlice = createSlice({
  name: "userProducts",
  initialState,
  reducers: {
    // ── Pagination ─────────────────────────────────────────────────────────────
    setPageForSlug: (state, action) => {
      const { slug, page } = action.payload;
      state.categoryPage[slug] = page;
    },
    resetPageForSlug: (state, action) => {
      const slug = action.payload;
      state.categoryPage[slug] = 1;
    },

    // ── Filters ───────────────────────────────────────────────────────────────
    setFiltersForSlug: (state, action) => {
      const { slug, filters } = action.payload;
      state.categoryFilters[slug] = filters;
    },
    clearFiltersForSlug: (state, action) => {
      const slug = action.payload;
      state.categoryFilters[slug] = {
        price: [], availability: [], discount: [], onSale: false,
      };
    },

    // ── Current product ───────────────────────────────────────────────────────
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
});

export const {
  setPageForSlug,
  resetPageForSlug,
  setFiltersForSlug,
  clearFiltersForSlug,
  setCurrentProduct,
  clearCurrentProduct,
} = userProductsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectPageForSlug   = (slug) => (state) =>
  state.userProducts.categoryPage[slug] ?? 1;

export const selectFiltersForSlug = (slug) => (state) =>
  state.userProducts.categoryFilters[slug] ?? {
    price: [], availability: [], discount: [], onSale: false,
  };

export const selectCurrentProduct = (state) => state.userProducts.currentProduct;

export default userProductsSlice.reducer;