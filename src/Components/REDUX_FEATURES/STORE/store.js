// ─────────────────────────────────────────────────────────────────────────────
// store.js  — add these two things for RTK Query to work
// ─────────────────────────────────────────────────────────────────────────────

import { configureStore } from "@reduxjs/toolkit";
import { categoriesApi } from "../REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
import userCategoriesReducer from "../REDUX_SLICES/SHOP_BY_CATEGORY/userCategoriesSlice";

import { productsApi }      from "../REDUX_SLICES/ProductsApi/productsApi";
import userProductsReducer   from "../REDUX_SLICES/ProductsApi/userProductsSlice";

// ... your other reducers

export const store = configureStore({
  reducer: {
    // ── RTK Query reducer (required) ─────────────────────────────────────────
    [categoriesApi.reducerPath]: categoriesApi.reducer,
     [productsApi.reducerPath]:   productsApi.reducer,

    // ── Slice reducers ───────────────────────────────────────────────────────
    userCategories: userCategoriesReducer,
    userProducts:   userProductsReducer,
    // ...other slices
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoriesApi.middleware,
      productsApi.middleware, // ← required for caching, invalidation, polling
    ),
});