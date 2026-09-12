import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';

/**
 * Guest wholesale catalog: first-page preview is public.
 * Extra pages / full-category browse require login (same as home View All / View More).
 */
export default function useWholesaleGuestCatalogGate() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const requireLogin = useCallback(() => {
    dispatch(openModal('login'));
  }, [dispatch]);

  const guardLoadMore = useCallback(
    (loadMoreFn) => {
      if (!isAuthenticated) {
        requireLogin();
        return false;
      }
      if (typeof loadMoreFn === 'function') loadMoreFn();
      return true;
    },
    [isAuthenticated, requireLogin]
  );

  const guardCategoryNavigate = useCallback(
    (event) => {
      if (isAuthenticated) return false;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      requireLogin();
      return true;
    },
    [isAuthenticated, requireLogin]
  );

  return {
    isAuthenticated,
    requireLogin,
    guardLoadMore,
    guardCategoryNavigate,
  };
}
