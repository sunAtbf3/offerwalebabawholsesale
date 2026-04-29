import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag, X, Minus, Plus, Trash2, RefreshCw,
  AlertCircle, ArrowRight, Star, Package,
  Tag, Loader2, CheckCircle2,
  MapPin, XCircle, Edit2, Truck
} from "lucide-react";

import {
  fetchCart,
  removeCartItem,
  updateCartItem,
  removeGuestCartItem,
  updateGuestCartItem,
  clearCartErrors,
  selectCartItems,
  selectCartGuestItems,
  selectCartTotalAmount,
  selectCartLoading,
  selectCartError,
  selectDisplayCartCount,
} from "../../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";
import {
  checkDelivery,
  selectDelivery,
  selectCheckoutLoading,
  selectCheckoutError,
} from '../../REDUX_FEATURES/REDUX_SLICES/checkoutSlice/checkoutSlice';
import { selectIsAuthenticated } from "../../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";

// ─── Price formatter ──────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

const logError = (context, error, info = {}) => {
  console.group(`🔴 [WholesaleCartSidebar] ERROR in ${context}`);
  console.error("Error:", error);
  console.log("Info:", info);
  console.groupEnd();
};

// ─────────────────────────────────────────────────────────────────────────────
// Wholesale price helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the best wholesale price from a variant object.
 * Priority: wholesaleSale → wholesaleBase → finalPrice → sale → base
 */
const getWholesalePrice = (variant) => {
  if (!variant) return null;
  return (
    variant.price?.wholesaleSale ??
    variant.price?.wholesaleBase ??
    variant.finalPrice ??
    variant.price?.sale ??
    variant.price?.base ??
    null
  );
};

/**
 * Extract the wholesale base (MRP) price for showing strike-through.
 */
const getWholesaleBasePrice = (variant) => {
  if (!variant) return null;
  return variant.price?.wholesaleBase ?? variant.price?.base ?? null;
};

/**
 * Find the active wholesale variant for a product.
 * Falls back to first active variant, then first variant.
 */
const getWholesaleVariant = (product, variantId) => {
  if (!product?.variants?.length) return null;
  // try exact variantId match first
  if (variantId) {
    const exact = product.variants.find(
      (v) => String(v._id) === String(variantId) && v.wholesale === true
    );
    if (exact) return exact;
  }
  // first active wholesale variant
  return (
    product.variants.find((v) => v.wholesale === true && v.isActive === true) ??
    product.variants.find((v) => v.isActive === true) ??
    product.variants[0] ??
    null
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GuestCartItem — uses wholesalePrice snapshot stored at add-time
// ─────────────────────────────────────────────────────────────────────────────
const GuestCartItem = ({ item, onRemove, onUpdateQty, isUpdating, isRemoving, productPath }) => {
  const productSlug = item.productSlug || item._productSlug;
  const qty         = item.quantity || 1;
  const displayName = item.productName
    ? item.productName
    : (productSlug?.replace(/-/g, " ") || "Product");

  // Guest items store wholesalePrice snapshot when added to cart
  const price     = item.wholesalePrice ?? item.price ?? null;
  const basePrice = item.wholesaleBasePrice ?? null;
  const itemTotal = price != null ? price * qty : null;
  const moq       = item.moq ?? 1;
  const image     = item.image ?? null;
  const variantLabel = item.variantLabel ?? null;
  const discountPct  = item.discountPercentage ?? 0;
  const path = productPath;

  return (
    <div className="flex gap-3 py-3 group">
      <Link to={path} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-amber-50 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={displayName}
            className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <Package size={22} className="text-gray-300" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xs font-bold text-gray-900 line-clamp-2 capitalize flex-1 leading-snug">
              {displayName}
            </h3>
            {itemTotal != null && (
              <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap flex-shrink-0">
                {fmt(itemTotal)}
              </p>
            )}
          </div>

          {variantLabel && (
            <p className="text-[9px] text-gray-400 uppercase font-medium tracking-wider mt-0.5">
              {variantLabel}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {price != null && (
              <p className="text-[10px] text-gray-400">{fmt(price)} × {qty} units</p>
            )}
            {basePrice && basePrice !== price && (
              <span className="text-[9px] text-gray-400 line-through">{fmt(basePrice)}</span>
            )}
            {discountPct > 0 && (
              <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 rounded">
                {discountPct}% OFF
              </span>
            )}
          </div>

          {moq > 1 && (
            <p className="text-[9px] text-gray-400 mt-0.5">
              MOQ: <span className="font-bold text-gray-600">{moq} units</span>
            </p>
          )}

          <p className="text-[10px] text-yellow-600 font-semibold mt-0.5">
            Sign in to sync your cart
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border-2 border-yellow-400 rounded-xl overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty - 1); }}
              disabled={qty <= (moq || 1) || isUpdating}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 text-xs font-bold min-w-[2rem] text-center">
              {isUpdating ? <Loader2 size={11} className="animate-spin mx-auto" /> : qty}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty + 1); }}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition-colors disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(item); }}
            disabled={isRemoving}
            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 disabled:opacity-40 rounded-lg hover:bg-red-50"
          >
            {isRemoving
              ? <RefreshCw size={15} className="animate-spin" />
              : <Trash2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CartItem — logged-in users (wholesale pricing)
// ─────────────────────────────────────────────────────────────────────────────
const CartItem = ({ item, onUpdateQty, onRemove, isUpdating, isRemoving, productPath, onClose }) => {
  const product = item.product ?? null;

  // Find the correct wholesale variant
  const matchedVariant = product
    ? getWholesaleVariant(product, item.variantId)
    : null;

  const name = product
    ? (product.title || product.name)
    : (item._productSlug?.replace(/-/g, " ") || "Product");

  const image =
    matchedVariant?.images?.[0]?.url ||
    product?.variants?.[0]?.images?.[0]?.url ||
    null;

  // ── Wholesale price resolution ───────────────────────────────────────────
  // item.price comes from the cart backend — check for wholesale fields first
  const price =
    item.price?.wholesaleSale ??
    item.price?.wholesaleBase ??
    item.price?.sale ??
    item.price?.base ??
    getWholesalePrice(matchedVariant) ??
    null;

  const basePrice =
    item.price?.wholesaleBase ??
    item.price?.base ??
    getWholesaleBasePrice(matchedVariant) ??
    null;

  const discountPct  = item.price?.discountPercentage ?? matchedVariant?.discountPercentage ?? 0;
  const brand        = product?.brand || null;
  const variantAttrs = item.variantAttributesSnapshot ?? matchedVariant?.attributes ?? [];
  const qty          = item.quantity || 1;
  const itemTotal    = price != null ? price * qty : null;
  const moq          = matchedVariant?.minimumOrderQuantity ?? product?.moq ?? 1;

  return (
    <div className="flex gap-3 py-3 group">
      <Link
        to={productPath}
        onClick={onClose}
        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-amber-50 block"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package size={22} className="text-gray-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <Link to={productPath} onClick={onClose} className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug hover:text-yellow-600 transition-colors">
                {name}
              </h3>
            </Link>
            {itemTotal != null && (
              <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap flex-shrink-0">
                {fmt(itemTotal)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-wrap mt-0.5">
            {brand && (
              <span className="text-[9px] text-yellow-600 uppercase font-bold tracking-wider">{brand}</span>
            )}
            {variantAttrs.map((a) => (
              <span key={a._id || a.key} className="text-[9px] text-gray-400 uppercase font-medium tracking-wider">
                · {a.key}: {a.value}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {price != null && (
              <p className="text-[10px] text-gray-400">{fmt(price)} × {qty} units</p>
            )}
            {basePrice && basePrice !== price && (
              <span className="text-[9px] text-gray-400 line-through">{fmt(basePrice)}</span>
            )}
            {discountPct > 0 && (
              <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 rounded">
                {discountPct}% OFF
              </span>
            )}
          </div>

          {moq > 1 && (
            <p className="text-[9px] text-gray-400 mt-0.5">
              MOQ: <span className="font-bold text-gray-600">{moq} units</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border-2 border-yellow-400 rounded-xl overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty - 1); }}
              disabled={qty <= 1 || isUpdating}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 text-xs font-bold min-w-[2rem] text-center">
              {isUpdating ? <Loader2 size={11} className="animate-spin mx-auto" /> : qty}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty + 1); }}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition-colors disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(item); }}
            disabled={isRemoving}
            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 disabled:opacity-40 rounded-lg hover:bg-red-50"
          >
            {isRemoving
              ? <RefreshCw size={15} className="animate-spin" />
              : <Trash2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DeliverySection
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DeliverySection — Clean & Improved UI (Wholesale Ready)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DeliverySection — Fixed (Guest + User) + Better UI
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DeliverySection — FINAL FIXED (Guest + Logged-in + Reload Safe)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// DeliverySection — FIXED (Reload Safe + Guest + Logged-in)
// ─────────────────────────────────────────────────────────────────────────────
const DeliverySection = ({ isLoggedIn, userPincode }) => {
  const dispatch        = useDispatch();
  const delivery        = useSelector(selectDelivery);
  const checkoutLoading = useSelector(selectCheckoutLoading);
  const checkoutError   = useSelector(selectCheckoutError);

  const [pincode,           setPincode]     = useState('');
  const [isEditing,         setIsEditing]   = useState(false);
  const [tempPincode,       setTempPincode] = useState('');
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);

  const hasAutoChecked = useRef(false);

  // ── Mount pe Redux se sync karo (reload safe) ──────────────
  useEffect(() => {
    if (delivery?.checkedPincode && !pincode) {
      setPincode(delivery.checkedPincode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login/userPincode change pe reset ───────────────────────
  useEffect(() => {
    setPincode('');
    setTempPincode('');
    setIsEditing(false);
    hasAutoChecked.current = false;
  }, [isLoggedIn, userPincode]);

  // ── Auto-check saved pincode for logged-in users ────────────
  useEffect(() => {
    if (
      isLoggedIn &&
      userPincode &&
      /^\d{6}$/.test(userPincode) &&
      !hasAutoChecked.current
    ) {
      hasAutoChecked.current = true;
      setPincode(userPincode);
      setIsDeliveryLoading(true);
      dispatch(checkDelivery({ pincode: userPincode }))
        .finally(() => setIsDeliveryLoading(false));
    }
  }, [isLoggedIn, userPincode, dispatch]);

  // ── Reset auto-check flag when userPincode changes ──────────
  useEffect(() => {
    hasAutoChecked.current = false;
  }, [userPincode]);

  // ── Handlers ────────────────────────────────────────────────
  const handleCheck = () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setIsDeliveryLoading(true);
    dispatch(checkDelivery({ pincode }))
      .finally(() => setIsDeliveryLoading(false));
  };

  const handleEditClick = () => {
    setTempPincode('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempPincode('');
    // Redux mein jo result hai wahi pincode sync karo
    if (delivery?.checkedPincode) {
      setPincode(delivery.checkedPincode);
    }
  };

  const handleTempCheck = () => {
    if (!/^\d{6}$/.test(tempPincode)) return;
    setIsDeliveryLoading(true);
    setPincode(tempPincode);
    dispatch(checkDelivery({ pincode: tempPincode }))
      .finally(() => {
        setIsDeliveryLoading(false);
        setIsEditing(false);
        setTempPincode('');
      });
  };

  const isChecking = !!(checkoutLoading?.delivery) || isDeliveryLoading;

  // ── sirf Redux pe based — reload + edit cancel dono safe ────
  const hasResult =
    delivery?.isDeliverable !== null &&
    !!delivery?.checkedPincode &&
    !isEditing;

  // ── View: spinner ───────────────────────────────────────────
  if (isChecking && !isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-100">
        <Loader2 size={14} className="animate-spin text-[#F7A221]" />
        <span className="text-[11px] font-medium text-gray-500">
          Checking delivery to {tempPincode || pincode || userPincode}…
        </span>
      </div>
    );
  }

  // ── View: result card ───────────────────────────────────────
  if (hasResult) {
    return (
      <div className="flex flex-col gap-2">
        <div
          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${
            delivery.isDeliverable
              ? 'bg-green-50 border-green-100'
              : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {delivery.isDeliverable ? (
              <>
                <Truck size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-green-800">
                    Delivery to{' '}
                    <span className="text-green-600">{delivery.checkedPincode}</span>
                  </p>
                  {delivery.estimatedDays && (
                    <p className="text-[10px] text-green-600 font-bold mt-0.5">
                      Arrives in{' '}
                      <span className="font-black">{delivery.estimatedDays} business days</span>
                      {delivery.courierName ? ` via ${delivery.courierName}` : ''}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-red-700">
                    Not deliverable to {delivery.checkedPincode}
                  </p>
                  <p className="text-[10px] text-red-500 font-medium mt-0.5">
                    {delivery.message || "We don't deliver to this pincode yet"}
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleEditClick}
            className="p-1.5 hover:bg-white/70 rounded-full transition-colors flex-shrink-0 cursor-pointer ml-2"
            aria-label="Change pincode"
            title="Check a different pincode"
          >
            <Edit2 size={14} className="text-gray-500" />
          </button>
        </div>

        {checkoutError?.delivery && (
          <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
            <XCircle size={11} /> {checkoutError.delivery.message}
          </p>
        )}
      </div>
    );
  }

  // ── View: input field ───────────────────────────────────────
  const inputValue    = isEditing ? tempPincode    : pincode;
  const setInputValue = isEditing ? setTempPincode : setPincode;
  const checkHandler  = isEditing ? handleTempCheck : handleCheck;
  const checkDisabled = inputValue.length !== 6 || isChecking;

  return (
    <div className="flex flex-col gap-2">
      {isEditing && (
        <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
          <MapPin size={10} className="text-[#F7A221]" />
          Check delivery for a different pincode
          {userPincode ? ` (saved: ${userPincode})` : ''}
        </p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 flex-1">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setInputValue(v);
            }}
            onKeyDown={(e) => e.key === 'Enter' && !checkDisabled && checkHandler()}
            placeholder="Enter pincode"
            className="bg-transparent text-xs font-bold outline-none w-full placeholder-gray-400"
            maxLength={6}
            autoFocus={isEditing}
          />
        </div>

        <button
          onClick={checkHandler}
          disabled={checkDisabled}
          className="text-xs font-black uppercase tracking-widest text-[#F7A221] hover:text-black disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0"
        >
          {isChecking ? <Loader2 size={12} className="animate-spin" /> : 'Check'}
        </button>

        {isEditing && (
          <button
            onClick={handleCancelEdit}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
          >
            Cancel
          </button>
        )}

        {/* Inline result pill — guest/no-address check ke liye */}
        {!isChecking && !isEditing && hasResult && (
          delivery.isDeliverable ? (
            <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
              <CheckCircle2 size={13} />
              <span className="text-[11px] font-black whitespace-nowrap">
                {delivery.estimatedDays ? `${delivery.estimatedDays}d` : '✓'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
              <XCircle size={13} />
              <span className="text-[11px] font-black whitespace-nowrap">N/A</span>
            </div>
          )
        )}
      </div>

      {checkoutError?.delivery && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
          <XCircle size={11} /> {checkoutError.delivery.message}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WholesaleCartSidebar — Main
// ─────────────────────────────────────────────────────────────────────────────
const WholesaleCartSidebar = ({ isOpen, onClose, onOpenAuth }) => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const fullAuthState = useSelector((state) => state.auth);
  const fullCartState = useSelector((state) => state.userCart);

  const items       = useSelector(selectCartItems);
  const guestItems  = useSelector(selectCartGuestItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const totalItems  = useSelector(selectDisplayCartCount);
  const loading     = useSelector(selectCartLoading);
  const error       = useSelector(selectCartError);
  const isLoggedIn  = useSelector(selectIsAuthenticated);

  const [itemLoading, setItemLoading] = useState({});

  const setItemState = useCallback((itemId, key, val) =>
    setItemLoading((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [key]: val } })),
  []);

  const currentItems = isLoggedIn ? items : guestItems;

  // ── Subtotal calculation — always uses wholesale prices ─────────────────
  const subtotal = useMemo(() => {
    if (isLoggedIn) {
      // For logged-in, sum up using wholesale price fields from cart items
      return items.reduce((sum, item) => {
        const price =
          item.price?.wholesaleSale ??
          item.price?.wholesaleBase ??
          item.price?.sale ??
          item.price?.base ??
          0;
        return sum + price * (item.quantity || 1);
      }, 0) || totalAmount;
    }
    // For guests, wholesalePrice snapshot was stored at add-time
    return guestItems.reduce(
      (sum, item) => sum + ((item.wholesalePrice ?? item.price ?? 0) * (item.quantity || 1)),
      0
    );
  }, [isLoggedIn, items, totalAmount, guestItems]);

  const totalUnits = useMemo(
    () => currentItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [currentItems]
  );

  // ── Fetch cart when sidebar opens ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen && isLoggedIn && items.length === 0) {
      dispatch(fetchCart()).unwrap().catch((e) => logError("fetchCart", e));
    }
  }, [isOpen, isLoggedIn, dispatch]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Clear errors on close ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) dispatch(clearCartErrors());
  }, [isOpen, dispatch]);

  // ── Item ID helper ────────────────────────────────────────────────────────
  const getItemId = useCallback((item) =>
    item._id ||
    `${item.product?.slug || item._productSlug || item.productSlug}-${item.variantId}`,
  []);

  // ── Remove ────────────────────────────────────────────────────────────────
  const handleRemove = useCallback(async (item) => {
    const itemId = getItemId(item);
    setItemState(itemId, "removing", true);
    try {
      if (isLoggedIn) {
        await dispatch(removeCartItem({
          productId:   String(item.productId),
          variantId:   String(item.variantId),
          productSlug: item.product?.slug || item._productSlug,
        })).unwrap();
      } else {
        dispatch(removeGuestCartItem({
          productSlug: item.productSlug || item._productSlug,
          variantId:   String(item.variantId),
        }));
        setTimeout(() => setItemState(itemId, "removing", false), 100);
        return;
      }
    } catch (e) {
      logError("removeCartItem", e, { itemId });
    } finally {
      setItemState(itemId, "removing", false);
    }
  }, [isLoggedIn, dispatch, getItemId, setItemState]);

  // ── Update quantity ───────────────────────────────────────────────────────
  const handleUpdateQty = useCallback(async (item, newQty) => {
    if (newQty < 1) { await handleRemove(item); return; }
    const itemId = getItemId(item);
    setItemState(itemId, "updating", true);
    try {
      if (isLoggedIn) {
        await dispatch(updateCartItem({
          productId:   String(item.productId),
          variantId:   String(item.variantId),
          quantity:    newQty,
          productSlug: item.product?.slug || item._productSlug,
        })).unwrap();
      } else {
        dispatch(updateGuestCartItem({
          productSlug: item.productSlug || item._productSlug,
          variantId:   String(item.variantId),
          quantity:    newQty,
        }));
        setTimeout(() => setItemState(itemId, "updating", false), 100);
        return;
      }
    } catch (e) {
      logError("updateCartItem", e, { newQty, itemId });
    } finally {
      setItemState(itemId, "updating", false);
    }
  }, [isLoggedIn, dispatch, getItemId, setItemState, handleRemove]);

  const getItemLoading = useCallback((item) => {
    const itemId = getItemId(item);
    return itemLoading[itemId] || { updating: false, removing: false };
  }, [itemLoading, getItemId]);

  const isFetching  = loading?.fetch;
  const fetchFailed = error?.fetch;

  const handleCheckoutClick = useCallback(() => {
    if (!isLoggedIn) { onOpenAuth?.(); onClose(); }
    else { onClose(); navigate("/checkout"); }
  }, [isLoggedIn, onOpenAuth, onClose, navigate]);

  const handleViewCart = useCallback(() => {
    if (!isLoggedIn) { onOpenAuth?.(); }
    else { navigate("/account/usercart"); }
    onClose();
  }, [isLoggedIn, onOpenAuth, navigate, onClose]);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Wholesale shopping cart"
      >
        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={18} className="text-gray-900" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight leading-none">
                Cart
                <span className="ml-2 text-xs font-bold text-gray-400 normal-case tracking-normal">
                  ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
              </h2>
              {totalUnits > 0 && (
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{totalUnits} total units</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Wholesale badge strip ── */}
        {currentItems.length > 0 && (
          <div className="px-5 py-2 bg-amber-50 border-b border-yellow-100 flex items-center gap-2">
            <Tag size={11} className="text-yellow-600 flex-shrink-0" />
            <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
              Wholesale pricing applied · GST Invoice included
            </p>
          </div>
        )}

        {/* ── Error banner ── */}
        {(fetchFailed || error?.update || error?.remove) && (
          <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-red-700 flex-1 min-w-0">
              {fetchFailed?.message || error?.update?.message || error?.remove?.message || "Something went wrong"}
            </p>
            <button onClick={() => dispatch(clearCartErrors())} className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0">
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── Item list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-2 scrollbar-hide">

          {isFetching && currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <RefreshCw size={22} className="text-gray-300 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Loading cart…</p>
            </div>

          ) : fetchFailed && currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle size={30} className="text-red-300" />
              <p className="text-sm text-gray-500 font-medium max-w-[200px]">
                {fetchFailed?.message || "Failed to load cart"}
              </p>
              <button
                onClick={() => dispatch(fetchCart())}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors active:scale-95"
              >
                <RefreshCw size={12} /> Try Again
              </button>
            </div>

          ) : currentItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {currentItems.map((item, index) => {
                const loadingState = getItemLoading(item);
                const itemKey      = item._id || `${item.product?.slug || item._productSlug || item.productSlug}-${item.variantId}-${index}`;
                const productSlug  = item.product?.slug || item._productSlug;
                const path         = productSlug ? `/product/${productSlug}` : "#";

                if (!isLoggedIn) {
                  return (
                    <GuestCartItem
                      key={itemKey}
                      item={item}
                      onUpdateQty={handleUpdateQty}
                      onRemove={handleRemove}
                      isUpdating={loadingState.updating}
                      isRemoving={loadingState.removing}
                                          productPath={path}

                    />
                  );
                }

                return (
                  <CartItem
                    key={itemKey}
                    item={item}
                    onUpdateQty={handleUpdateQty}
                    onRemove={handleRemove}
                    isUpdating={loadingState.updating}
                    isRemoving={loadingState.removing}
                    productPath={path}
                    onClose={onClose}
                  />
                );
              })}

              {/* Guest sign-in nudge */}
              {!isLoggedIn && (
                <div className="my-4 p-4 bg-amber-50 rounded-2xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star size={13} className="text-gray-900" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-tight text-gray-900">
                        Sign in to sync your cart
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                        Keep your wholesale cart across devices and unlock exclusive deals.
                      </p>
                      <button
                        onClick={() => { onOpenAuth?.(); onClose(); }}
                        className="mt-2.5 text-[10px] font-extrabold uppercase tracking-widest text-yellow-600 hover:text-gray-900 transition-colors"
                      >
                        Login Now →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                <ShoppingBag size={30} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-gray-800 font-extrabold uppercase text-xs tracking-widest">Your cart is empty</p>
                <p className="text-gray-400 text-xs mt-1 font-medium">Add wholesale products to get started</p>
              </div>
              <button
                onClick={onClose}
                className="text-yellow-600 font-extrabold text-xs uppercase underline underline-offset-4 hover:text-gray-900 transition-colors"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>

        {/* ── Footer — only when cart has items ── */}
        {currentItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white space-y-3">
            <DeliverySection isLoggedIn={isLoggedIn} userPincode={fullAuthState.user?.pincode} />

            <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Tag size={12} className="text-green-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-green-700">
                Use code <span className="text-green-900 font-extrabold">100 OFB</span> for ₹100 OFF on orders above ₹2000
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {subtotal > 0 ? fmt(subtotal) : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                <span>{currentItems.length} product{currentItems.length > 1 ? "s" : ""} · {totalUnits} units</span>
                <span>+ GST & shipping at checkout</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-yellow-400 text-gray-900 py-3.5 rounded-xl font-extrabold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all active:scale-95 shadow-md shadow-yellow-100"
              >
                {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
                <ArrowRight size={14} />
              </button>
              <button
                onClick={handleViewCart}
                className="w-full bg-white border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-extrabold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all active:scale-95"
              >
                View Full Cart
              </button>
            </div>

            <div className="grid grid-cols-3 pt-2 border-t border-gray-100 text-center">
              {["Secure Pay", "GST Invoice", "Easy Return"].map((label) => (
                <p key={label} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider py-1">{label}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WholesaleCartSidebar;
// import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   ShoppingBag, X, Minus, Plus, Trash2, RefreshCw,
//   AlertCircle, ArrowRight, Star, Package,
//   Tag, Loader2,CheckCircle2 ,
//   MapPin,XCircle 
// } from "lucide-react";

// // ── Cart slice ────────────────────────────────────────────────────────────────
// import {
//   fetchCart,
//   removeCartItem,
//   updateCartItem,
//   removeGuestCartItem,
//   updateGuestCartItem,
//   clearCartErrors,
//   selectCartItems,
//   selectCartGuestItems,
//   selectCartTotalAmount,
//   selectCartLoading,
//   selectCartError,
//   selectCartTotalItems,
//   selectDisplayCartCount,
// } from "../../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";
// import {
//   checkDelivery,
//   selectDelivery,
//   selectCheckoutLoading,
//   selectCheckoutError,
// } from '../../REDUX_FEATURES/REDUX_SLICES/checkoutSlice/checkoutSlice';
// import { selectIsAuthenticated } from "../../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";

// // ─── Price formatter ──────────────────────────────────────────────────────────
// const fmt = (n) => {
//   if (n == null) return "—";
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);
// };

// const logError = (context, error, info = {}) => {
//   console.group(`🔴 [WholesaleCartSidebar] ERROR in ${context}`);
//   console.error("Error:", error);
//   console.log("Info:", info);
//   console.groupEnd();
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GuestCartItem
// // ─────────────────────────────────────────────────────────────────────────────
// const GuestCartItem = ({ item, onRemove, onUpdateQty, isUpdating, isRemoving }) => {
//   const productSlug = item.productSlug || item._productSlug;
//   const qty         = item.quantity || 1;
//   const displayName = productSlug?.replace(/-/g, " ") || "Product";
//   const price       = item.price ?? null;
//   const itemTotal   = price != null ? price * qty : null;

//   return (
//     <div className="flex gap-3 py-3 group">
//       <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-amber-50 flex items-center justify-center">
//         <Package size={22} className="text-gray-300" />
//       </div>

//       <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
//         <div>
//           <div className="flex justify-between items-start gap-2">
//             <h3 className="text-xs font-bold text-gray-900 line-clamp-2 capitalize flex-1 leading-snug">
//               {displayName}
//             </h3>
//             {itemTotal != null && (
//               <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap flex-shrink-0">
//                 {fmt(itemTotal)}
//               </p>
//             )}
//           </div>
//           {price != null && (
//             <p className="text-[10px] text-gray-400 mt-0.5">{fmt(price)} × {qty} units</p>
//           )}
//           <p className="text-[10px] text-yellow-600 font-semibold mt-0.5">Sign in to see full details</p>
//         </div>

//         <div className="flex items-center justify-between mt-2">
//           <div className="flex items-center border-2 border-yellow-400 rounded-xl overflow-hidden">
//             <button
//               onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty - 1); }}
//               disabled={qty <= 1 || isUpdating}
//               className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
//             >
//               <Minus size={12} />
//             </button>
//             <span className="px-3 text-xs font-bold min-w-[2rem] text-center">
//               {isUpdating ? <Loader2 size={11} className="animate-spin mx-auto" /> : qty}
//             </span>
//             <button
//               onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty + 1); }}
//               disabled={isUpdating}
//               className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition-colors disabled:opacity-40"
//             >
//               <Plus size={12} />
//             </button>
//           </div>
//           <button
//             onClick={(e) => { e.stopPropagation(); onRemove(item); }}
//             disabled={isRemoving}
//             className="text-gray-300 hover:text-red-500 transition-colors p-1.5 disabled:opacity-40 rounded-lg hover:bg-red-50"
//           >
//             {isRemoving
//               ? <RefreshCw size={15} className="animate-spin" />
//               : <Trash2 size={15} />}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CartItem — logged-in users
// // ─────────────────────────────────────────────────────────────────────────────
// const CartItem = ({ item, onUpdateQty, onRemove, isUpdating, isRemoving, productPath, onClose }) => {
//   const product = item.product ?? null;

//   const matchedVariant = product
//     ? (product.variants?.find((v) => String(v._id) === String(item.variantId)) ?? product.variants?.[0] ?? null)
//     : null;

//   const name = product
//     ? (product.title || product.name)
//     : (item._productSlug?.replace(/-/g, " ") || "Product");

//   const image =
//     matchedVariant?.images?.[0]?.url ||
//     product?.variants?.[0]?.images?.[0]?.url ||
//     null;

//   const price =
//     item.price?.sale ??
//     item.price?.base ??
//     matchedVariant?.finalPrice ??
//     matchedVariant?.price?.sale ??
//     matchedVariant?.price?.base ??
//     null;

//   const basePrice    = item.price?.base ?? null;
//   const discountPct  = item.price?.discountPercentage ?? 0;
//   const brand        = product?.brand || null;
//   const variantAttrs = item.variantAttributesSnapshot ?? matchedVariant?.attributes ?? [];
//   const qty          = item.quantity || 1;
//   const itemTotal    = price != null ? price * qty : null;
//   const moq          = product?.moq ?? matchedVariant?.minimumOrderQuantity ?? 1;

//   return (
//     <div className="flex gap-3 py-3 group">
//       <Link
//         to={productPath}
//         onClick={onClose}
//         className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-amber-50 block"
//       >
//         {image ? (
//           <img
//             src={image}
//             alt={name}
//             className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
//             onError={(e) => { e.target.style.display = "none"; }}
//           />
//         ) : (
//           <div className="h-full w-full flex items-center justify-center">
//             <Package size={22} className="text-gray-300" />
//           </div>
//         )}
//       </Link>

//       <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
//         <div>
//           <div className="flex justify-between items-start gap-2">
//             <Link to={productPath} onClick={onClose} className="flex-1 min-w-0">
//               <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug hover:text-yellow-600 transition-colors">
//                 {name}
//               </h3>
//             </Link>
//             {itemTotal != null && (
//               <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap flex-shrink-0">
//                 {fmt(itemTotal)}
//               </p>
//             )}
//           </div>

//           <div className="flex items-center gap-1 flex-wrap mt-0.5">
//             {brand && (
//               <span className="text-[9px] text-yellow-600 uppercase font-bold tracking-wider">{brand}</span>
//             )}
//             {variantAttrs.map((a) => (
//               <span key={a._id || a.key} className="text-[9px] text-gray-400 uppercase font-medium tracking-wider">
//                 · {a.key}: {a.value}
//               </span>
//             ))}
//           </div>

//           <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
//             {price != null && (
//               <p className="text-[10px] text-gray-400">{fmt(price)} × {qty} units</p>
//             )}
//             {basePrice && basePrice !== price && (
//               <span className="text-[9px] text-gray-400 line-through">{fmt(basePrice)}</span>
//             )}
//             {discountPct > 0 && (
//               <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 rounded">{discountPct}% OFF</span>
//             )}
//           </div>

//           {moq > 1 && (
//             <p className="text-[9px] text-gray-400 mt-0.5">
//               MOQ: <span className="font-bold text-gray-600">{moq} units</span>
//             </p>
//           )}
//         </div>

//         <div className="flex items-center justify-between mt-2">
//           <div className="flex items-center border-2 border-yellow-400 rounded-xl overflow-hidden">
//             <button
//               onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty - 1); }}
//               disabled={qty <= 1 || isUpdating}
//               className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
//             >
//               <Minus size={12} />
//             </button>
//             <span className="px-3 text-xs font-bold min-w-[2rem] text-center">
//               {isUpdating ? <Loader2 size={11} className="animate-spin mx-auto" /> : qty}
//             </span>
//             <button
//               onClick={(e) => { e.stopPropagation(); onUpdateQty(item, qty + 1); }}
//               disabled={isUpdating}
//               className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition-colors disabled:opacity-40"
//             >
//               <Plus size={12} />
//             </button>
//           </div>
//           <button
//             onClick={(e) => { e.stopPropagation(); onRemove(item); }}
//             disabled={isRemoving}
//             className="text-gray-300 hover:text-red-500 transition-colors p-1.5 disabled:opacity-40 rounded-lg hover:bg-red-50"
//           >
//             {isRemoving
//               ? <RefreshCw size={15} className="animate-spin" />
//               : <Trash2 size={15} />}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// const DeliverySection = ({ userPincode }) => {
//   const dispatch        = useDispatch();
//   const isLoggedIn      = useSelector(selectIsAuthenticated);
//   const delivery        = useSelector(selectDelivery);
//   const checkoutLoading = useSelector(selectCheckoutLoading);
//   const checkoutError   = useSelector(selectCheckoutError);

//   // pincode used for the "free-type" input when no saved address / guest
//   const [pincode,           setPincode]           = useState('');
//   // editing mode — logged-in user with saved address wants to check a different pincode
//   const [isEditing,         setIsEditing]         = useState(false);
//   const [tempPincode,       setTempPincode]       = useState('');
//   const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);

//   // Prevent double auto-check on strict-mode double-mount
//   const hasAutoChecked = useRef(false);

//   // ── Auto-check saved pincode when the sidebar opens ──────────
//   useEffect(() => {
//     if (
//       isLoggedIn &&
//       userPincode &&
//       /^\d{6}$/.test(userPincode) &&
//       !hasAutoChecked.current
//     ) {
//       hasAutoChecked.current = true;
//       setPincode(userPincode);
//       setIsDeliveryLoading(true);
//       dispatch(checkDelivery({ pincode: userPincode }))
//         .finally(() => setIsDeliveryLoading(false));
//     }
//   }, [userPincode, dispatch, isLoggedIn]);

//   // ── Reset auto-check flag if userPincode changes (e.g. address updated) ──
//   useEffect(() => {
//     hasAutoChecked.current = false;
//   }, [userPincode]);

//   // ── Handlers ─────────────────────────────────────────────────
//   const handleCheck = () => {
//     if (!/^\d{6}$/.test(pincode)) return;
//     setIsDeliveryLoading(true);
//     dispatch(checkDelivery({ pincode }))
//       .finally(() => setIsDeliveryLoading(false));
//   };

//   const handleEditClick = () => {
//     setTempPincode('');
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setTempPincode('');
//     // Restore auto-checked result for saved pincode (already in Redux, no re-fetch needed)
//   };

//   const handleTempCheck = () => {
//     if (!/^\d{6}$/.test(tempPincode)) return;
//     setIsDeliveryLoading(true);
//     setPincode(tempPincode);
//     dispatch(checkDelivery({ pincode: tempPincode }))
//       .finally(() => {
//         setIsDeliveryLoading(false);
//         setIsEditing(false);
//         setTempPincode('');
//       });
//   };

//   const isChecking = !!(checkoutLoading?.delivery) || isDeliveryLoading;

//   // "Has result" means Redux has a checked pincode that matches what we're showing
//   const displayPincode = isEditing ? tempPincode : pincode;
//   const hasResult =
//     delivery?.isDeliverable !== null &&
//     delivery?.checkedPincode === pincode &&
//     !isEditing;

//   // ── View: spinner while auto-checking saved pincode ──────────
//   if (isChecking && isLoggedIn && userPincode && !isEditing) {
//     return (
//       <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-gray-50 border border-gray-100">
//         <Loader2 size={14} className="animate-spin text-[#F7A221]" />
//         <span className="text-[11px] font-medium text-gray-500">Checking delivery to {userPincode}…</span>
//       </div>
//     );
//   }

//   // ── View: saved pincode delivery result (not editing) ────────
//   if (isLoggedIn && userPincode && !isEditing && hasResult) {
//     return (
//       <div className="flex flex-col gap-2">
//         <div
//           className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${
//             delivery.isDeliverable
//               ? 'bg-green-50 border-green-100'
//               : 'bg-red-50 border-red-100'
//           }`}
//         >
//           <div className="flex items-start gap-2.5">
//             {delivery.isDeliverable ? (
//               <>
//                 <Truck size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <p className="text-[11px] font-black text-green-800">
//                     Delivery to{' '}
//                     <span className="text-green-600">{delivery.checkedPincode}</span>
//                   </p>
//                   {delivery.estimatedDays && (
//                     <p className="text-[10px] text-green-600 font-bold mt-0.5">
//                       Arrives in{' '}
//                       <span className="font-black">{delivery.estimatedDays} business days</span>
//                       {delivery.courierName ? ` via ${delivery.courierName}` : ''}
//                     </p>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <p className="text-[11px] font-black text-red-700">
//                     Not deliverable to {delivery.checkedPincode}
//                   </p>
//                   <p className="text-[10px] text-red-500 font-medium mt-0.5">
//                     {delivery.message || "We don't deliver to this pincode yet"}
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Edit / check different pincode */}
//           <button
//             onClick={handleEditClick}
//             className="p-1.5 hover:bg-white/70 rounded-full transition-colors flex-shrink-0 cursor-pointer ml-2"
//             aria-label="Change pincode"
//             title="Check a different pincode"
//           >
//             <Edit2 size={14} className="text-gray-500" />
//           </button>
//         </div>

//         {checkoutError?.delivery && (
//           <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
//             <XCircle size={11} /> {checkoutError.delivery.message}
//           </p>
//         )}
//       </div>
//     );
//   }

//   // ── View: input field for guests / no saved address / editing mode ──
//   // When in editing mode for a logged-in user with saved address, we show
//   // the temp input. For guests / no address, we show the regular input.
//   const inputValue    = isEditing ? tempPincode    : pincode;
//   const setInputValue = isEditing ? setTempPincode : setPincode;
//   const checkHandler  = isEditing ? handleTempCheck : handleCheck;
//   const checkDisabled = inputValue.length !== 6 || isChecking;

//   return (
//     <div className="flex flex-col gap-2">
//       {/* If editing, show a small hint */}
//       {isEditing && (
//         <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
//           <MapPin size={10} className="text-[#F7A221]" />
//           Check delivery for a different pincode (saved: {userPincode})
//         </p>
//       )}

//       <div className="flex items-center gap-2">
//         <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 flex-1">
//           <MapPin size={12} className="text-gray-400 flex-shrink-0" />
//           <input
//             type="text"
//             inputMode="numeric"
//             value={inputValue}
//             onChange={(e) => {
//               const v = e.target.value.replace(/\D/g, '').slice(0, 6);
//               setInputValue(v);
//             }}
//             onKeyDown={(e) => e.key === 'Enter' && checkHandler()}
//             placeholder="Enter pincode"
//             className="bg-transparent text-xs font-bold outline-none w-full placeholder-gray-400"
//             maxLength={6}
//             autoFocus={isEditing}
//           />
//         </div>

//         <button
//           onClick={checkHandler}
//           disabled={checkDisabled}
//           className="text-xs font-black uppercase tracking-widest text-[#F7A221] hover:text-black disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0"
//         >
//           {isChecking ? <Loader2 size={12} className="animate-spin" /> : 'Check'}
//         </button>

//         {/* Cancel only in editing mode */}
//         {isEditing && (
//           <button
//             onClick={handleCancelEdit}
//             className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
//           >
//             Cancel
//           </button>
//         )}

//         {/* Inline result pill — only for guest / no-address check (not editing mode) */}
//         {!isChecking && !isEditing && hasResult && (
//           delivery.isDeliverable ? (
//             <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
//               <CheckCircle2 size={13} />
//               <span className="text-[11px] font-black whitespace-nowrap">
//                 {delivery.estimatedDays ? `${delivery.estimatedDays}d` : '✓'}
//               </span>
//             </div>
//           ) : (
//             <div className="flex items-center gap-1 text-red-500 flex-shrink-0">
//               <XCircle size={13} />
//               <span className="text-[11px] font-black whitespace-nowrap">N/A</span>
//             </div>
//           )
//         )}
//       </div>

//       {checkoutError?.delivery && (
//         <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
//           <XCircle size={11} /> {checkoutError.delivery.message}
//         </p>
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // WholesaleCartSidebar — Main
// // ─────────────────────────────────────────────────────────────────────────────
// const WholesaleCartSidebar = ({ isOpen, onClose, onOpenAuth }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//     const fullAuthState = useSelector((state) => state.auth);
//   const fullCartState = useSelector((state) => state.userCart);

//   const items       = useSelector(selectCartItems);
//   const guestItems  = useSelector(selectCartGuestItems);
//   const totalAmount = useSelector(selectCartTotalAmount);
//   const totalItems  = useSelector(selectDisplayCartCount);
//   const loading     = useSelector(selectCartLoading);
//   const error       = useSelector(selectCartError);
// const isLoggedIn = useSelector(selectIsAuthenticated);
//   const [itemLoading, setItemLoading] = useState({});

//   const setItemState = useCallback((itemId, key, val) =>
//     setItemLoading((prev) => ({
//       ...prev,
//       [itemId]: { ...prev[itemId], [key]: val },
//     })), []);

//   const currentItems = isLoggedIn ? items : guestItems;

//   const subtotal = useMemo(() => {
//     if (isLoggedIn) return totalAmount;
//     return guestItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity || 1), 0);
//   }, [isLoggedIn, totalAmount, guestItems]);

//   const totalUnits = useMemo(() =>
//     currentItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
//   [currentItems]);

//   // ── Fetch cart when sidebar opens ─────────────────────────────────────────
//  useEffect(() => {
//   if (isOpen && isLoggedIn && items.length === 0) {
//     dispatch(fetchCart()).unwrap().catch((e) => logError("fetchCart", e));
//   }
// }, [isOpen, isLoggedIn, dispatch]);
//    useEffect(() => {
//     if (isOpen) {
//       console.log('🔍 AUTH STATE:', fullAuthState);
//       console.log('🔍 CART STATE:', fullCartState);
//       console.log('🔍 isLoggedIn:', isLoggedIn);
//       console.log('🔍 items:', items);
//       console.log('🔍 guestItems:', guestItems);
//       console.log('🔍 currentItems:', currentItems);
//     }
//   }, [isOpen]);

//   // ── Body scroll lock ──────────────────────────────────────────────────────
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; };
//   }, [isOpen]);

//   // ── Clear errors on close ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (!isOpen) dispatch(clearCartErrors());
//   }, [isOpen, dispatch]);

//   // ── Item ID helper ────────────────────────────────────────────────────────
//   const getItemId = useCallback((item) =>
//     item._id ||
//     `${item.product?.slug || item._productSlug || item.productSlug}-${item.variantId}`,
//   []);

//   // ── Remove ────────────────────────────────────────────────────────────────
//   const handleRemove = useCallback(async (item) => {
//     const itemId = getItemId(item);
//     setItemState(itemId, "removing", true);
//     try {
//       if (isLoggedIn) {
//         await dispatch(removeCartItem({
//           productId:   String(item.productId),
//           variantId:   String(item.variantId),
//           productSlug: item.product?.slug || item._productSlug,
//         })).unwrap();
//       } else {
//         dispatch(removeGuestCartItem({
//           productSlug: item.productSlug || item._productSlug,
//           variantId:   String(item.variantId),
//         }));
//         setTimeout(() => setItemState(itemId, "removing", false), 100);
//         return;
//       }
//     } catch (e) {
//       logError("removeCartItem", e, { itemId });
//     } finally {
//       setItemState(itemId, "removing", false);
//     }
//   }, [isLoggedIn, dispatch, getItemId, setItemState]);

//   // ── Update quantity ───────────────────────────────────────────────────────
//   const handleUpdateQty = useCallback(async (item, newQty) => {
//     if (newQty < 1) { await handleRemove(item); return; }
//     const itemId = getItemId(item);
//     setItemState(itemId, "updating", true);
//     try {
//       if (isLoggedIn) {
//         await dispatch(updateCartItem({
//           productId:   String(item.productId),
//           variantId:   String(item.variantId),
//           quantity:    newQty,
//           productSlug: item.product?.slug || item._productSlug,
//         })).unwrap();
//       } else {
//         dispatch(updateGuestCartItem({
//           productSlug: item.productSlug || item._productSlug,
//           variantId:   String(item.variantId),
//           quantity:    newQty,
//         }));
//         setTimeout(() => setItemState(itemId, "updating", false), 100);
//         return;
//       }
//     } catch (e) {
//       logError("updateCartItem", e, { newQty, itemId });
//     } finally {
//       setItemState(itemId, "updating", false);
//     }
//   }, [isLoggedIn, dispatch, getItemId, setItemState, handleRemove]);

//   const getItemLoading = useCallback((item) => {
//     const itemId = getItemId(item);
//     return itemLoading[itemId] || { updating: false, removing: false };
//   }, [itemLoading, getItemId]);

//   const isFetching  = loading?.fetch;
//   const fetchFailed = error?.fetch;

//   // ── Navigation handlers ───────────────────────────────────────────────────
//   const handleCheckoutClick = useCallback(() => {
//     if (!isLoggedIn) { onOpenAuth?.(); onClose(); }
//     else { onClose(); navigate("/checkout"); }
//   }, [isLoggedIn, onOpenAuth, onClose, navigate]);

//   const handleViewCart = useCallback(() => {
//     if (!isLoggedIn) { onOpenAuth?.(); }
//     else { navigate("/account/usercart"); }
//     onClose();
//   }, [isLoggedIn, onOpenAuth, navigate, onClose]);

//   // ── RENDER ────────────────────────────────────────────────────────────────
//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
//           isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={onClose}
//         aria-hidden="true"
//       />

//       {/* Drawer */}
//       <div
//         className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Wholesale shopping cart"
//       >
//         {/* ── Header ── */}
//         <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
//               <ShoppingBag size={18} className="text-gray-900" />
//             </div>
//             <div>
//               <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight leading-none">
//                 Cart
//                 <span className="ml-2 text-xs font-bold text-gray-400 normal-case tracking-normal">
//                   ({totalItems} {totalItems === 1 ? "item" : "items"})
//                 </span>
//               </h2>
//               {totalUnits > 0 && (
//                 <p className="text-[10px] text-gray-400 font-medium mt-0.5">
//                   {totalUnits} total units
//                 </p>
//               )}
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             aria-label="Close cart"
//             className="p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-200"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* ── Wholesale badge strip ── */}
//         {currentItems.length > 0 && (
//           <div className="px-5 py-2 bg-amber-50 border-b border-yellow-100 flex items-center gap-2">
//             <Tag size={11} className="text-yellow-600 flex-shrink-0" />
//             <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
//               Wholesale pricing applied · GST Invoice included
//             </p>
//           </div>
//         )}

//         {/* ── Error banner ── */}
//         {(fetchFailed || error?.update || error?.remove) && (
//           <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
//             <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
//             <p className="text-xs font-semibold text-red-700 flex-1 min-w-0">
//               {fetchFailed?.message || error?.update?.message || error?.remove?.message || "Something went wrong"}
//             </p>
//             <button
//               onClick={() => dispatch(clearCartErrors())}
//               className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
//             >
//               <X size={13} />
//             </button>
//           </div>
//         )}

//         {/* ── Item list ── */}
//         <div className="flex-1 overflow-y-auto px-5 py-2 scrollbar-hide">

//           {/* Loading state */}
//           {isFetching && currentItems.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center gap-3">
//               <RefreshCw size={22} className="text-gray-300 animate-spin" />
//               <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Loading cart…</p>
//             </div>

//           /* Fetch error */
//           ) : fetchFailed && currentItems.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
//               <AlertCircle size={30} className="text-red-300" />
//               <p className="text-sm text-gray-500 font-medium max-w-[200px]">
//                 {fetchFailed?.message || "Failed to load cart"}
//               </p>
//               <button
//                 onClick={() => dispatch(fetchCart())}
//                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors active:scale-95"
//               >
//                 <RefreshCw size={12} /> Try Again
//               </button>
//             </div>

//           /* Has items */
//           ) : currentItems.length > 0 ? (
//             <div className="divide-y divide-gray-100">
//               {currentItems.map((item, index) => {
//                 const loadingState = getItemLoading(item);
//                 const itemKey      = item._id || `${item.product?.slug || item._productSlug || item.productSlug}-${item.variantId}-${index}`;
//                 const productSlug  = item.product?.slug || item._productSlug;
//                 const path         = productSlug ? `/product/${productSlug}` : "#";

//                 if (!isLoggedIn) {
//                   return (
//                     <GuestCartItem
//                       key={itemKey}
//                       item={item}
//                       onUpdateQty={handleUpdateQty}
//                       onRemove={handleRemove}
//                       isUpdating={loadingState.updating}
//                       isRemoving={loadingState.removing}
//                     />
//                   );
//                 }

//                 return (
//                   <CartItem
//                     key={itemKey}
//                     item={item}
//                     onUpdateQty={handleUpdateQty}
//                     onRemove={handleRemove}
//                     isUpdating={loadingState.updating}
//                     isRemoving={loadingState.removing}
//                     productPath={path}
//                     onClose={onClose}
//                   />
//                 );
//               })}

//               {/* Guest sign-in nudge */}
//               {!isLoggedIn && (
//                 <div className="my-4 p-4 bg-amber-50 rounded-2xl border border-yellow-200">
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
//                       <Star size={13} className="text-gray-900" />
//                     </div>
//                     <div>
//                       <p className="text-[11px] font-extrabold uppercase tracking-tight text-gray-900">
//                         Sign in to sync your cart
//                       </p>
//                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
//                         Keep your wholesale cart across devices and unlock exclusive deals.
//                       </p>
//                       <button
//                         onClick={() => { onOpenAuth?.(); onClose(); }}
//                         className="mt-2.5 text-[10px] font-extrabold uppercase tracking-widest text-yellow-600 hover:text-gray-900 transition-colors"
//                       >
//                         Login Now →
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//           /* Empty cart */
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
//               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
//                 <ShoppingBag size={30} className="text-yellow-300" />
//               </div>
//               <div>
//                 <p className="text-gray-800 font-extrabold uppercase text-xs tracking-widest">
//                   Your cart is empty
//                 </p>
//                 <p className="text-gray-400 text-xs mt-1 font-medium">
//                   Add wholesale products to get started
//                 </p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="text-yellow-600 font-extrabold text-xs uppercase underline underline-offset-4 hover:text-gray-900 transition-colors"
//               >
//                 Browse Products
//               </button>
//             </div>
//           )}
//         </div>

//         {/* ── Footer — only when cart has items ── */}
//         {currentItems.length > 0 && (
//           <div className="border-t border-gray-100 px-5 py-4 bg-white space-y-3">
//             <DeliverySection userPincode={fullAuthState.user?.pincode} />

//             {/* Active offer strip */}
//             <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
//               <Tag size={12} className="text-green-600 flex-shrink-0" />
//               <p className="text-[10px] font-bold text-green-700">
//                 Use code{" "}
//                 <span className="text-green-900 font-extrabold">100 OFB</span>{" "}
//                 for ₹100 OFF on orders above ₹2000
//               </p>
//             </div>

//             {/* Subtotal row */}
//             <div className="space-y-1">
//               <div className="flex justify-between items-center">
//                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
//                 <span className="text-xl font-extrabold text-gray-900">
//                   {subtotal > 0 ? fmt(subtotal) : "—"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
//                 <span>{currentItems.length} product{currentItems.length > 1 ? "s" : ""} · {totalUnits} units</span>
//                 <span>+ GST & shipping at checkout</span>
//               </div>
//             </div>

//             {/* CTA buttons */}
//             <div className="space-y-2 pt-1">
//               <button
//                 onClick={handleCheckoutClick}
//                 className="w-full bg-yellow-400 text-gray-900 py-3.5 rounded-xl font-extrabold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all active:scale-95 shadow-md shadow-yellow-100"
//               >
//                 {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
//                 <ArrowRight size={14} />
//               </button>

//               <button
//                 onClick={handleViewCart}
//                 className="w-full bg-white border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-extrabold uppercase tracking-[0.15em] text-[11px] flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all active:scale-95"
//               >
//                 View Full Cart
//               </button>
//             </div>

//             {/* Trust strip */}
//             <div className="grid grid-cols-3 pt-2 border-t border-gray-100 text-center">
//               {["Secure Pay", "GST Invoice", "Easy Return"].map((label) => (
//                 <p key={label} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider py-1">
//                   {label}
//                 </p>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default WholesaleCartSidebar;