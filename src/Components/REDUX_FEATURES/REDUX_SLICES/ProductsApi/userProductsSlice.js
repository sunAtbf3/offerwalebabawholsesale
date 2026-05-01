// userProductsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryFilters: {},
  categoryPage: {},
  tagPage: {},
  tagProducts: {},
  tagFilters: {},
  categoryTagPage: {},
  currentProduct: null,
};

const userProductsSlice = createSlice({
  name: "userProducts",
  initialState,
  reducers: {
    addProductsForTag: (state, action) => {
  const { tag, products } = action.payload;

  if (!state.tagProducts[tag]) {
    state.tagProducts[tag] = [];
  }

  const existingIds = new Set(
    state.tagProducts[tag].map((p) => p._id)
  );

  const newProducts = products.filter(
    (p) => !existingIds.has(p._id)
  );

  state.tagProducts[tag].push(...newProducts);
},
clearProductsForTag: (state, action) => {
  state.tagProducts[action.payload] = [];
},
    setPageForSlug: (state, action) => {
      const { slug, page } = action.payload;
      state.categoryPage[slug] = page;
    },
    resetPageForSlug: (state, action) => {
      state.categoryPage[action.payload] = 1;
    },
    setPageForTag: (state, action) => {
      const { tag, page } = action.payload;
      state.tagPage[tag] = page;
    },
    resetPageForTag: (state, action) => {
      state.tagPage[action.payload] = 1;
    },
    setFiltersForSlug: (state, action) => {
      const { slug, filters } = action.payload;
      state.categoryFilters[slug] = filters;
    },
    clearFiltersForSlug: (state, action) => {
      state.categoryFilters[action.payload] = {
        price: [], availability: [], discount: [], onSale: false,
      };
    },
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
  setPageForTag,
  resetPageForTag,
  setFiltersForSlug,
  clearFiltersForSlug,
  setCurrentProduct,
  addProductsForTag,
  clearProductsForTag,
  clearCurrentProduct,
} = userProductsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectPageForSlug = (slug) => (state) =>
  state.userProducts.categoryPage[slug] ?? 1;

export const selectPageForTag = (tag) => (state) =>
  state.userProducts.tagPage[tag] ?? 1;

export const selectFiltersForSlug = (slug) => (state) =>
  state.userProducts.categoryFilters[slug] ?? {
    price: [], availability: [], discount: [], onSale: false,
  };

export const selectCurrentProduct = (state) => state.userProducts.currentProduct;

export default userProductsSlice.reducer;