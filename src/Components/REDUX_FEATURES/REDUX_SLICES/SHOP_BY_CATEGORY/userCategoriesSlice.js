import { createSlice } from "@reduxjs/toolkit";

// ─────────────────────────────────────────────────────────────────────────────
// userCategoriesSlice  — state management ONLY
// API calls live in categoriesApi.js (RTK Query)
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // Locally selected / active category (e.g. for CatProducts page)
  currentCategory: null,
};

const userCategoriesSlice = createSlice({
  name: "userCategories",
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
});

export const { setCurrentCategory, clearCurrentCategory } =
  userCategoriesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentCategory = (state) =>
  state.userCategories.currentCategory;

export default userCategoriesSlice.reducer;