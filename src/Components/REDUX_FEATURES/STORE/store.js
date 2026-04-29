
// ─────────────────────────────────────────────────────────────────────────────
// store.js — MERGED WITH ADMIN PANEL REDUCERS & APIS FROM FIRST FILE
// ─────────────────────────────────────────────────────────────────────────────

import { configureStore } from "@reduxjs/toolkit";

// ========== YOUR EXISTING IMPORTS (PRESERVED) ==========
import { categoriesApi } from "../REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
import userCategoriesReducer from "../REDUX_SLICES/SHOP_BY_CATEGORY/userCategoriesSlice";
import userCartReducer from "../REDUX_SLICES/UserCart/userCartSlice";

import { productsApi } from "../REDUX_SLICES/ProductsApi/productsApi";
import userProductsReducer from "../REDUX_SLICES/ProductsApi/userProductsSlice";

// ── Wholesaler ───────────────────────────────────────────────────────────────
import { wholesalerApi } from "../REDUX_SLICES/WHOLESALE/wholesalerApi";
import wholesalerReducer from "../REDUX_SLICES/WHOLESALE/wholesalerSlice";

import { authApi } from "../REDUX_SLICES/authApi/authApi";
import authReducer from "../REDUX_SLICES/authApi/authSlice";

// ========== ADMIN PANEL IMPORTS (EXTRACTED FROM FIRST FILE) ==========
import adminProductCreateReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/adminProductCreateSlice";
import adminGetProductsReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/adminGetProductsSlice";
import adminEditProductReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/adminEditProductSlice";
import adminArchivedReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/adminArchivedSlice";
import adminBulkUploadReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/bulkUploadSlice";
import categoriesReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/categoriesSlice";
import { userAnalyticsApi } from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/userAnalyticsApi";
import { seoAnalyticsApi, seoUiReducer } from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/adminSeoAnalytics";
import adminOrdersUiReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/order_management/adminOrdersSlice";
import { adminOrdersApi } from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/order_management/adminOrdersApi";
import staffReducer from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/staffSlice";
import { wholesalerApi as adminWholesalerApi } from "../../ADMIN_SEGMENT/ADMIN_REDUX_MANAGEMENT/wholesalerApi/wholesalerApi";
import userWishlistReducer from "../REDUX_SLICES/UserWIshlist/userWishlistSLice";
import userAddressReducer from "../REDUX_SLICES/Useraddressslice";
import { searchApi } from "../REDUX_SLICES/searchApi";
import orderReducer from "../REDUX_SLICES/orderSlice";
import checkoutReducer from "../REDUX_SLICES/checkoutSlice/checkoutSlice";

export const store = configureStore({
  reducer: {
    // ========== YOUR EXISTING REDUCERS (PRESERVED) ==========
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [wholesalerApi.reducerPath]: wholesalerApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    userCategories: userCategoriesReducer,
    userProducts: userProductsReducer,
    wholesaler: wholesalerReducer,
     userCart: userCartReducer,
     userWishlist: userWishlistReducer,
     userAddress: userAddressReducer,
       orders: orderReducer,
           checkout: checkoutReducer,


    // ========== ADMIN PANEL REDUCERS (EXTRACTED FROM FIRST FILE) ==========
    adminProductCreate: adminProductCreateReducer,
    adminGetProducts: adminGetProductsReducer,
    adminEditProduct: adminEditProductReducer,
    adminArchived: adminArchivedReducer,
    adminBulkUpload: adminBulkUploadReducer,
    categories: categoriesReducer,
    staff: staffReducer,
    seoUi: seoUiReducer,
    adminOrdersUi: adminOrdersUiReducer,
    [userAnalyticsApi.reducerPath]: userAnalyticsApi.reducer,
    [seoAnalyticsApi.reducerPath]: seoAnalyticsApi.reducer,
    [adminOrdersApi.reducerPath]: adminOrdersApi.reducer,
    [adminWholesalerApi.reducerPath]: adminWholesalerApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          "wholesaler.formData.idProofFile",
          "wholesaler.formData.businessAddressProofFile",
        ],
      },
    }).concat(
      // YOUR EXISTING MIDDLEWARES
      categoriesApi.middleware,
      productsApi.middleware,
      wholesalerApi.middleware,
      authApi.middleware,
      searchApi.middleware,
      // ADMIN MIDDLEWARES (EXTRACTED FROM FIRST FILE)
      userAnalyticsApi.middleware,
      seoAnalyticsApi.middleware,
      adminOrdersApi.middleware,
      adminWholesalerApi.middleware,
    ),
  
  devTools: import.meta.env.MODE !== "production",
});

export default store;
// CODE IS WOKRING BUT TRY TO ADD ADMIN SEGMENTS 
// // ─────────────────────────────────────────────────────────────────────────────
// // store.js  — add these two things for RTK Query to work
// // ─────────────────────────────────────────────────────────────────────────────

// import { configureStore } from "@reduxjs/toolkit";
// import { categoriesApi } from "../REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";
// import userCategoriesReducer from "../REDUX_SLICES/SHOP_BY_CATEGORY/userCategoriesSlice";

// import { productsApi }      from "../REDUX_SLICES/ProductsApi/productsApi";
// import userProductsReducer   from "../REDUX_SLICES/ProductsApi/userProductsSlice";

// // ── Wholesaler ───────────────────────────────────────────────────────────────
// import { wholesalerApi }   from "../REDUX_SLICES/WHOLESALE/wholesalerApi";
// import wholesalerReducer   from "../REDUX_SLICES/WHOLESALE/wholesalerSlice";

// import { authApi } from "../REDUX_SLICES/authApi/authApi";
// import authReducer from "../REDUX_SLICES/authApi/authSlice";
// // ... your other reducers

// export const store = configureStore({
//   reducer: {

//       auth: authReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     // ── RTK Query reducer (required) ─────────────────────────────────────────
//     [categoriesApi.reducerPath]: categoriesApi.reducer,
//      [productsApi.reducerPath]:   productsApi.reducer,
//       [wholesalerApi.reducerPath]: wholesalerApi.reducer,
//     // ── Slice reducers ───────────────────────────────────────────────────────
//     userCategories: userCategoriesReducer,
//     userProducts:   userProductsReducer,
//      wholesaler:     wholesalerReducer,
//     // ...other slices
//   },

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // File objects (File/Blob) are not serializable — ignore them
//         ignoredPaths: [
//           "wholesaler.formData.idProofFile",
//           "wholesaler.formData.businessAddressProofFile",
//         ],
//       },
//     }).concat(
//       categoriesApi.middleware,
//       productsApi.middleware,
//       wholesalerApi.middleware,
//       authApi.middleware // ← required for caching, invalidation, polling
//     ),
// });