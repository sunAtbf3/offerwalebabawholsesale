import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  mergeWishlist,
  loadGuestWishlist,
  clearGuestItems,
  getGuestWishlist,
} from "../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice";
import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";

const useWishlistInit = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ── On app boot — always load guest wishlist from localStorage into Redux ──
  useEffect(() => {
    console.log("💛 [useWishlistInit] Loading guest wishlist from localStorage...");
    dispatch(loadGuestWishlist());
  }, [dispatch]);

  // ── If user logs out, re-load guest wishlist to keep UI in sync ──────
  useEffect(() => {
    if (isAuthenticated) return;
    console.log("💛 [useWishlistInit] User logged out — reloading guest wishlist...");
    dispatch(loadGuestWishlist());
  }, [isAuthenticated, dispatch]);

  // ── When login state changes ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      try {
        console.log("💛 [useWishlistInit] User logged in — initializing wishlist...");

        // Step 1 — check if guest had any items
        const guestSlugs = getGuestWishlist();

        // Step 2 — merge guest items into DB if any exist
        if (guestSlugs.length > 0) {
          console.log(`💛 [useWishlistInit] Found ${guestSlugs.length} guest items — merging...`);
          await dispatch(mergeWishlist({ slugs: guestSlugs })).unwrap();
          dispatch(clearGuestItems()); // clear localStorage + state after merge
          console.log("✅ [useWishlistInit] Guest wishlist merged and cleared");
        }

        // Step 3 — fetch full wishlist from DB
        await dispatch(fetchWishlist()).unwrap();
        console.log("✅ [useWishlistInit] Wishlist fetched successfully");

      } catch (error) {
        // Non-fatal — log but don't crash app
        console.group("🔴 [useWishlistInit] ERROR during wishlist init");
        console.error(error);
        console.groupEnd();
      }
    };

    init();
  }, [isAuthenticated, dispatch]);
};

export default useWishlistInit;