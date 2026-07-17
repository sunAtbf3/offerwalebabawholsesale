import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Star, Ghost, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  fetchWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist,
  removeGuestItem,
  clearWishlistErrors,
  selectWishlistItems,
  selectWishlistGuestItems,
  selectWishlistLoading,
  selectWishlistError,
  selectWishlistCount,
  getGuestWishlistSlug,
} from '../../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';

import {
  addToCart,
  addGuestCartItem,
} from '../../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
import { selectDisplayWishlistCount } from '../../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';
import { selectIsAuthenticated } from '../../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};

const logError = (context, error, info = {}) => {
  console.group(`🔴 [WishlistSidebar] ERROR in ${context}`);
  console.error('Error:', error);
  console.log('Info:', info);
  console.groupEnd();
};

// ─────────────────────────────────────────────────────────────────────────────
// WishlistItem
// Handles both logged-in (populated productId object) and guest (slug string) shapes
// ─────────────────────────────────────────────────────────────────────────────
const WishlistItem = ({ item, isLoggedIn, onRemove, onMoveToCart, onClose, isRemoving, isMoving, path }) => {

  const isPopulated = typeof item.product === 'object' && item.product !== null;
  const matchedVariant = isPopulated
    ? (item.product.variants?.find(
        (v) => String(v._id) === String(item.variantId)
      ) ?? item.product.variants?.[0] ?? null)
    : null;

  const slug = item.product?.slug || item.productSlug || null;
  const name = isPopulated
    ? (item.product.title || item.product.name)
    : (item.productName || item.name || slug?.replace(/-/g, ' ') || 'Product');
  const image =
    matchedVariant?.images?.[0]?.url ||
    item.product?.variants?.[0]?.images?.[0]?.url ||
    item.image ||
    null;
  const brand = item.product?.brand || item.brand || null;

  const maxStock = matchedVariant?.inventory?.trackInventory
    ? (matchedVariant?.inventory?.quantity ?? 0)
    : (item.inStock === false ? 0 : Infinity);
  const inStock = maxStock > 0;

  const price =
    matchedVariant?.price?.wholesaleSale ??
    matchedVariant?.price?.wholesaleBase ??
    matchedVariant?.price?.sale ??
    matchedVariant?.price?.base ??
    matchedVariant?.finalPrice ??
    item.wholesalePrice ??
    item.price ??
    null;

  const variantAttrs = item.variantAttributesSnapshot ?? matchedVariant?.attributes ?? [];

  return (
    <div className="flex gap-4 group py-4">

      {/* ── Image ── */}
      <Link
        to={path}
        onClick={onClose}
        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[20px] border border-gray-100 bg-gray-50 relative block"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              logError('WishlistItem img', new Error('Image load failed'), { name, image });
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <ShoppingBag size={24} className="text-gray-300" />
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[8px] font-black uppercase tracking-tighter bg-black text-white px-2 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Details ── */}
      <div className="flex flex-1 flex-col justify-between py-1 min-w-0">
        <div>
          <Link to={path} className="flex justify-between items-start gap-2"  onClick={onClose}>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1 flex-1">
              {name}
            </h3>
            {price != null && (
              <p className="text-xs font-black text-gray-900 whitespace-nowrap flex-shrink-0">
                {fmt(price)}
              </p>
            )}
          </Link>
          {/* Brand */}
          {brand && (
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {brand}
            </p>
          )}

          {/* Variant attributes */}
          {variantAttrs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {variantAttrs.map((a) => (
                <span
                  key={a._id || a.key}
                  className="text-[10px] text-gray-500 font-medium italic"
                >
                  {a.key}: {a.value}
                </span>
              ))}
            </div>
          )}

          {!isLoggedIn && item.variantLabel && (
            <p className="text-[9px] text-gray-400 uppercase font-medium tracking-wider mt-1">
              {item.variantLabel}
            </p>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between mt-3">

          {/* Move to Cart */}
          <button
            onClick={() => onMoveToCart(item)}
            disabled={!inStock || isMoving || isRemoving}
            className={`
              flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
              transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
              ${inStock ? 'text-[#478B8D] hover:text-black' : 'text-gray-300'}
            `}
          >
            {isMoving
              ? <Loader2 size={12} className="animate-spin" />
              : <ShoppingBag size={12} />
            }
            {isMoving ? 'Moving...' : 'Move to Cart'}
          </button>

          {/* Remove */}
          <button
            onClick={() => onRemove(item)}
            disabled={isRemoving || isMoving}
            className="text-gray-300 hover:text-red-500 transition-all p-1.5 cursor-pointer active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Remove from wishlist"
          >
            {isRemoving
              ? <RefreshCw size={15} className="animate-spin" />
              : <Trash2 size={15} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WishlistSidebar — Main Component
// ─────────────────────────────────────────────────────────────────────────────
const WishlistSidebar = ({ isOpen, onClose, onOpenAuth }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Per-item loading state — prevents ALL items spinning when ONE item is loading
  // Same pattern as CartSidebar's localLoading in ProductCard
  const [itemLoading, setItemLoading] = useState({});  // { [slug]: { removing, moving } }

  const setItemState = (slug, key, val) =>
    setItemLoading((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [key]: val },
    }));

  // ── Selectors ─────────────────────────────────────────────────────────────
  const items      = useSelector(selectWishlistItems);
  const guestItems = useSelector(selectWishlistGuestItems);
  const loading    = useSelector(selectWishlistLoading);
  const error      = useSelector(selectWishlistError);
  const totalCount = useSelector(selectDisplayWishlistCount);
const isLoggedIn = useSelector(selectIsAuthenticated);
  const isFetching    = loading.fetch;
  const isMovingAll   = loading.moveToCart;
  const isClearingAll = loading.clear;
  const fetchFailed   = error.fetch;

  // Display items — logged-in uses DB items, guest uses slug array
  const currentItems = isLoggedIn ? items : guestItems;
  const displayCount = isLoggedIn ? totalCount : guestItems.length;

  // ── Fetch wishlist when sidebar opens (logged in only) ────────────────────
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      console.log('💛 [WishlistSidebar] opened — refreshing wishlist from DB');
      dispatch(fetchWishlist())
        .unwrap()
        .then(() => console.log('✅ [WishlistSidebar] wishlist refreshed'))
        .catch((e) => logError('fetchWishlist on open', e));
    }
  }, [isOpen, isLoggedIn, dispatch]);

  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // ── Clear errors when closing ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) dispatch(clearWishlistErrors());
  }, [isOpen, dispatch]);

  // ── Remove handler ────────────────────────────────────────────────────────
  const handleRemove = async (item) => {
    const slug = isLoggedIn
      ? (item.product?.slug || item.productSlug)
      : getGuestWishlistSlug(item);

    if (!slug) {
      logError('handleRemove', new Error('Missing slug'), { item });
      return;
    }

    setItemState(slug, 'removing', true);
    try {
      if (isLoggedIn) {
        await dispatch(removeFromWishlist({ productSlug: slug })).unwrap();
        toast.success('Removed from wishlist', { icon: '💔' });
        console.log(`✅ [WishlistSidebar] removed slug="${slug}"`);
      } else {
        dispatch(removeGuestItem(slug));
        toast.success('Removed from wishlist', { icon: '💔' });
        console.log(`✅ [WishlistSidebar] guest removed slug="${slug}"`);
      }
    } catch (e) {
      logError('handleRemove', e, { slug });
      toast.error(e?.message || 'Failed to remove from wishlist');
    } finally {
      setItemState(slug, 'removing', false);
    }
  };
   const handleWIshlist = useCallback(() => {
      if (!isLoggedIn) { onOpenAuth?.(); onClose(); }
      else { onClose(); navigate("/wishlist"); }
    }, [isLoggedIn, onOpenAuth, onClose, navigate]);

  // ── Move single item to cart ───────────────────────────────────────────────
  const handleMoveToCart = async (item) => {
    const slug = item.product?.slug || item.productSlug;
    const variant = item.product?.variants?.find(
      (v) => String(v._id) === String(item.variantId)
    ) ?? item.product?.variants?.[0];
    const variantId = variant?._id?.toString() || item.variantId || '';
    const moq =
      variant?.minimumOrderQuantity ??
      variant?.price?.minimumOrderQuantity ??
      item.product?.moq ??
      item.moq ??
      1;

    if (!slug) {
      logError('handleMoveToCart', new Error('Missing slug'), { item });
      return;
    }

    setItemState(slug, 'moving', true);
    try {
      if (isLoggedIn) {
        await dispatch(addToCart({
          productSlug: slug,
          variantId,
          quantity: moq,
        })).unwrap();
        await dispatch(removeFromWishlist({ productSlug: slug })).unwrap();
        toast.success('Moved to cart 🛒');
        console.log(`✅ [WishlistSidebar] moved to cart slug="${slug}"`);
      } else {
        dispatch(addGuestCartItem({
          productId:          item.productId,
          productSlug:        slug,
          variantId,
          quantity:           moq,
          moq,
          wholesalePrice:     item.wholesalePrice ?? item.price ?? null,
          wholesaleBasePrice: item.wholesaleBasePrice ?? null,
          productName:        item.productName || item.name || null,
          image:              item.image ?? null,
          variantLabel:       item.variantLabel ?? null,
          discountPercentage: item.discountPercentage ?? 0,
        }));
        dispatch(removeGuestItem(slug));
        toast.success('Moved to cart 🛒');
        console.log(`✅ [WishlistSidebar] guest moved to cart slug="${slug}"`);
      }
    } catch (e) {
      logError('handleMoveToCart', e, { slug });
      toast.error(e?.message || 'Failed to move to cart');
    } finally {
      setItemState(slug, 'moving', false);
    }
  };

  // ── Move ALL to cart (logged-in only) ─────────────────────────────────────
  const handleMoveAllToCart = async () => {
    if (!isLoggedIn || items.length === 0) return;

    try {
      console.log(`💛 [WishlistSidebar] Moving all ${items.length} items to cart...`);
      await dispatch(moveToCart({ moveAll: true })).unwrap();
      // Re-fetch wishlist so it's empty after move
      dispatch(fetchWishlist());
      toast.success(`All ${items.length} items moved to cart 🛒`);
      console.log('✅ [WishlistSidebar] all items moved to cart');
    } catch (e) {
      logError('handleMoveAllToCart', e);
      toast.error(e?.message || 'Failed to move all items to cart');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-[300] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[1001] shadow-[0_0_50px_rgba(0,0,0,0.2)] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
      >

        {/* ── Header ── */}
        <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <Heart size={20} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-gray-900 leading-none">
                Wishlist
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                {displayCount} Saved Item{displayCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-300 cursor-pointer border border-transparent hover:border-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Error Banner ── */}
        {(fetchFailed || error.add || error.remove || error.moveToCart) && (
          <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700">
                {fetchFailed?.message ||
                  error.add?.message ||
                  error.remove?.message ||
                  error.moveToCart?.message ||
                  'Something went wrong'}
              </p>
            </div>
            <button
              onClick={() => dispatch(clearWishlistErrors())}
              className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Initial loading */}
          {isFetching && currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="text-gray-300 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                Loading your wishlist…
              </p>
            </div>

          /* Fetch failed + empty */
          ) : fetchFailed && currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle size={32} className="text-red-300" />
              <p className="text-sm text-gray-500 font-medium">
                {fetchFailed.message || 'Failed to load wishlist'}
              </p>
              <button
                onClick={() => dispatch(fetchWishlist())}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#F7A221] text-white px-5 py-2.5 rounded-xl hover:bg-[#e6941e] transition-colors active:scale-95"
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </div>

          /* Items list */
          ) : currentItems.length > 0 ? (
            <div className="divide-y divide-gray-50">

              {/* Logged-in items — full product data */}
              {isLoggedIn && items.map((item) => {
                const slug = item.product?.slug || item.productSlug || item._id;
                const state = itemLoading[slug] || {};
                return (
                  <WishlistItem
                    key={item._id || slug}
                    item={item}
                    isLoggedIn={isLoggedIn}
                    onRemove={handleRemove}
                    onMoveToCart={handleMoveToCart}
                    isRemoving={!!state.removing}
                    isMoving={!!state.moving}
                    path={`/product/${item.product?.slug || item.productSlug}`}
                    onClose={onClose}
                  />
                );
              })}

              {/* Guest items — stored metadata from add-time */}
              {!isLoggedIn && guestItems.map((rawItem) => {
                const item = typeof rawItem === 'string' ? { productSlug: rawItem } : rawItem;
                const slug = getGuestWishlistSlug(item);
                const state = itemLoading[slug] || {};
                return (
                  <WishlistItem
                    key={slug}
                    item={item}
                    isLoggedIn={isLoggedIn}
                    onRemove={handleRemove}
                    onMoveToCart={handleMoveToCart}
                    isRemoving={!!state.removing}
                    isMoving={!!state.moving}
                    path={slug ? `/product/${slug}` : '#'}
                    onClose={onClose}
                  />
                );
              })}

              {/* Guest sign-in nudge */}
              {!isLoggedIn && (
                <div className="my-6 p-5 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
                  <div className="flex items-start gap-3">
                    <Star size={16} className="text-[#478B8D] mt-1 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight text-gray-900">
                        Sign in to sync
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                        Don't lose your favorites. Log in to sync across all your devices.
                      </p>
                      <button
                        onClick={() => { onOpenAuth(); onClose(); }}
                        className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#478B8D] hover:underline cursor-pointer"
                      >
                        Login Now →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          /* Empty state */
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Ghost size={40} className="text-gray-200" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Your list is lonely
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-2 max-w-[200px]">
                Add your favorite pieces here to keep an eye on them.
              </p>
              <button
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F7A221] transition-all cursor-pointer active:scale-95"
              >
                Start Exploring
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {currentItems.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-50 space-y-3">

            {/* Move all to cart — logged in only */}
            {isLoggedIn && (
              <button
                onClick={handleMoveAllToCart}
                disabled={isMovingAll || isClearingAll}
                className={`
                  w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px]
                  flex items-center justify-center gap-3
                  transition-all active:scale-95 shadow-xl shadow-black/5 cursor-pointer
                  ${isMovingAll
                    ? 'bg-zinc-400 text-white cursor-wait'
                    : 'bg-black text-white hover:bg-[#F7A221]'
                  }
                `}
              >
                {isMovingAll ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Moving…
                  </>
                ) : (
                  <>
                    Add All to Bag
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            {/* View full wishlist page */}
            <Link
              onClick={handleWIshlist}
              className="w-full bg-white border-2 border-black text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
            >
              View Full Wishlist
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistSidebar;