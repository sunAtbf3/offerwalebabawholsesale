import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  mergeCart,
  loadGuestCart,
  clearGuestCartItems,
  getGuestCart,
} from "../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";
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

const useCartInit = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ── On app boot — always load guest cart from localStorage into Redux ──────
  useEffect(() => {
    dispatch(loadGuestCart());
  }, [dispatch]);

  // ── If user logs out, re-load guest cart to keep UI in sync ──────────────
  useEffect(() => {
    if (isAuthenticated) return;
    dispatch(loadGuestCart());
  }, [isAuthenticated, dispatch]);

  // ── When login state changes ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !hasWholesaleCustomerSession()) return;

    const init = async () => {
      try {
        const guestItems = getGuestCart();

        if (guestItems.length > 0) {
          await dispatch(mergeCart({ items: guestItems })).unwrap();
          dispatch(clearGuestCartItems());
        }

        await dispatch(fetchCart()).unwrap();
      } catch (error) {
        if (isSilentPortalScopePayload(error)) return;
        console.group("🔴 [useCartInit] ERROR during cart init");
        console.error(error);
        console.groupEnd();
      }
    };

    init();
  }, [isAuthenticated, dispatch]);
};

export default useCartInit;
