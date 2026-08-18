import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  mergeWishlist,
  loadGuestWishlist,
  clearGuestItems,
  getGuestWishlistSlugs,
} from "../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice";
import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";
import { WHOLESALE_USER_ACCESS_TOKEN_KEY } from "../../SERVICES/Wholesaleaxios";
import {
  isCustomerTokenCompatible,
  isSilentPortalScopePayload,
} from "../../SERVICES/authPortalSession";

const hasWholesaleCustomerSession = () => {
  try {
    const token = localStorage.getItem(WHOLESALE_USER_ACCESS_TOKEN_KEY);
    return Boolean(token) && isCustomerTokenCompatible(token, "wholesale");
  } catch {
    return false;
  }
};

const useWishlistInit = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ── On app boot — always load guest wishlist from localStorage into Redux ──
  useEffect(() => {
    dispatch(loadGuestWishlist());
  }, [dispatch]);

  // ── If user logs out, re-load guest wishlist to keep UI in sync ──────
  useEffect(() => {
    if (isAuthenticated) return;
    dispatch(loadGuestWishlist());
  }, [isAuthenticated, dispatch]);

  // ── When login state changes ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !hasWholesaleCustomerSession()) return;

    const init = async () => {
      try {
        const guestSlugs = getGuestWishlistSlugs();

        if (guestSlugs.length > 0) {
          await dispatch(mergeWishlist({ slugs: guestSlugs })).unwrap();
          dispatch(clearGuestItems());
        }

        await dispatch(fetchWishlist()).unwrap();
      } catch (error) {
        if (isSilentPortalScopePayload(error)) return;
        console.group("🔴 [useWishlistInit] ERROR during wishlist init");
        console.error(error);
        console.groupEnd();
      }
    };

    init();
  }, [isAuthenticated, dispatch]);
};

export default useWishlistInit;
