import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoLogoWhatsapp, IoLogoFacebook, IoLogoInstagram } from "react-icons/io5";
import { FaTelegram } from "react-icons/fa6";
import {
  Star, Heart, Minus, Plus, ShoppingCart,
  CheckCircle2, Truck, AlertCircle,
  RefreshCw, ArrowLeft, Loader2, ArrowRight,
  Package, ShieldCheck, RotateCcw,
  Tag, Share2, ChevronRight, TrendingUp,
  Check, ThumbsUp, MapPin, Shield, Eye, ShoppingBag,
} from "lucide-react";

import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";

import {
  setCurrentProduct,
  clearCurrentProduct,
} from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice";

// ── Cart slice (same paths as WholesaleProductCard) ──────────────────────────
// ── Cart slice
import {
  addGuestCartItem,
  updateGuestCartItem,
  removeGuestCartItem,
  selectCartItemBySlug,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";

// ── Wishlist slice
import {
  addGuestItem,
  removeGuestItem,
  selectIsWishlisted,
  addToWishlist,
  removeFromWishlist,
} from "../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice";

import { toast } from "react-toastify";
import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={13}
      className={
        i < Math.floor(rating)
          ? "fill-yellow-400 text-yellow-400"
          : "fill-gray-200 text-gray-200"
      }
    />
  ));

function formatCount(count = 0) {
  if (count < 100) return count.toString();
  return Math.floor(count / 100) * 100 + "+";
}

const getAvailabilityMeta = (availability) => {
  const status = availability?.status || "IN_STOCK";
  if (status === "OUT_OF_STOCK") return { label: "Out of stock", className: "text-red-600" };
  if (status === "MOQ_UNMET") return { label: "MOQ not met", className: "text-amber-600" };
  if (status === "NOT_LISTED") return { label: "Not available", className: "text-gray-500" };
  return { label: "In stock", className: "text-green-700" };
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">
      <div className="flex gap-3">
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 bg-gray-200 rounded-2xl" style={{ minHeight: 440 }} />
      </div>
      <div className="space-y-4 pt-2">
        <div className="h-7 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-2/5" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Related Card (with working cart) ─────────────────────────────────────────
const RelatedCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItem   = useSelector(selectCartItemBySlug(product?.slug));
  const isInCart   = !!cartItem;
  const currentQty = cartItem?.quantity ?? 0;

  const variant   = product?.variants?.[0] ?? {};
  const title     = product?.title || product?.name || "Product";
  const imgUrl    = variant.images?.[0]?.url ?? product?.image ?? null;
  const salePrice = variant.finalPrice ?? variant.price?.sale ?? variant.price?.base ?? product?.wholesalePrice ?? null;
  const basePrice = variant.price?.base ?? product?.mrp ?? null;
  const disc      = basePrice && salePrice && basePrice > salePrice;
  const discPct   = disc ? Math.round(((basePrice - salePrice) / basePrice) * 100) : null;
  const maxStock  = variant.inventory?.trackInventory ? (variant.inventory?.quantity ?? 0) : Infinity;
  const inStock   = maxStock > 0;
  const isAtMax   = currentQty >= maxStock && maxStock !== Infinity;
  // const isAtMax = isAtMaxStock; // alias — handleIncrement use karta hai yeh

  const [adding, setAdding] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!inStock || !product?.slug || adding) return;
    setAdding(true);
    dispatch(addGuestCartItem({
      productId:   product._id,
      productSlug: product.slug,
      variantId:   variant?._id?.toString() || "",
      quantity:    1,
    }));
    toast.success("Added to cart");
    setTimeout(() => setAdding(false), 400);
  };

  const handleInc = (e) => {
    e.stopPropagation();
    if (isAtMax) { toast.warning(`Max stock: ${maxStock}`); return; }
    dispatch(updateGuestCartItem({ productSlug: product.slug, variantId: variant?._id?.toString() || "", quantity: currentQty + 1 }));
  };

  const handleDec = (e) => {
    e.stopPropagation();
    if (currentQty - 1 <= 0) {
      dispatch(removeGuestCartItem({ productSlug: product.slug, variantId: variant?._id?.toString() || "" }));
      toast.info("Removed from cart");
    } else {
      dispatch(updateGuestCartItem({ productSlug: product.slug, variantId: variant?._id?.toString() || "", quantity: currentQty - 1 }));
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col hover:shadow-md hover:border-yellow-400"
    >
      <div className="relative aspect-square bg-amber-50 flex items-center justify-center p-3 overflow-hidden">
        {discPct && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            {discPct}% OFF
          </span>
        )}
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package size={36} className="text-gray-300" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-yellow-600 transition-colors">
          {title}
        </h4>
        <div className="flex items-baseline gap-1.5 mt-auto mb-3 flex-wrap">
          <span className="text-sm font-bold text-gray-900">{fmt(salePrice)}</span>
          {disc && <span className="text-xs text-gray-400 line-through">{fmt(basePrice)}</span>}
        </div>

        {/* Cart controls */}
        <div onClick={(e) => e.stopPropagation()}>
          {!inStock ? (
            <button disabled className="w-full text-xs font-bold py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
              Out of Stock
            </button>
          ) : !isInCart ? (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full text-gray-900 text-xs font-bold py-2 rounded-lg transition-all bg-yellow-400 hover:bg-yellow-300 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <ShoppingBag size={12} />}
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center border-2 border-yellow-400 rounded-xl overflow-hidden">
              <button
                onClick={handleDec}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition"
              >
                <Minus size={12} />
              </button>
              <div className="flex-1 text-center text-xs font-bold text-gray-900">{currentQty}</div>
              <button
                onClick={handleInc}
                disabled={isAtMax}
                className="w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main WholesaleProductDetail ──────────────────────────────────────────────
const WholesaleProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── RTK Query ─────────────────────────────────────────────────────────────
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
    status,
  } = useGetProductBySlugQuery(slug, { skip: !slug });

  const canRefetch = status !== "uninitialized";

  const { data: related = [] } = useGetRelatedProductsQuery(
    { slug, limit: 5 },
    { skip: !slug || !product }
  );

  // ── Redux selectors ───────────────────────────────────────────────────────
  const wishlisted = useSelector(selectIsWishlisted(product?.slug));
  const cartItem   = useSelector(selectCartItemBySlug(product?.slug));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInCart   = !!cartItem;
  const currentQty = cartItem?.quantity ?? 0;
  // const { isLoggedIn } = useSelector((state) => state.auth); // uncomment when auth ready

  // ── Local UI state ────────────────────────────────────────────────────────
  const [activeThumb, setActiveThumb]     = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [activeTab, setActiveTab]         = useState("desc");
  const [openDesc, setOpenDesc]           = useState(false);
  const [shareOpen, setShareOpen]         = useState(false);
  const [showZoom, setShowZoom]           = useState(false);
  const [isMobile, setIsMobile]           = useState(false);
  const [isVisible, setIsVisible]         = useState(false);
  const [qty, setQty]                     = useState(1);

  const [localLoading, setLocalLoading] = useState({
    add: false, update: false, remove: false, wishlist: false,
  });
  const setL = (key, val) => setLocalLoading((p) => ({ ...p, [key]: val }));
  const isProcessing = localLoading.add || localLoading.update || localLoading.remove;

  const containerRef = useRef(null);
  const lensRef      = useRef(null);
  const zoomRef      = useRef(null);
  const rafRef       = useRef(null);
  const targetRef    = useRef({ x: 0.5, y: 0.5 });
  const currentRef   = useRef({ x: 0.5, y: 0.5 });

  // ── Sync to redux slice ───────────────────────────────────────────────────
  useEffect(() => {
    if (product) dispatch(setCurrentProduct(product));
    return () => dispatch(clearCurrentProduct());
  }, [product, dispatch]);

  // ── Scroll + reset on slug change ────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveThumb(0);
    setSelectedAttrs({});
    setActiveTab("desc");
  }, [slug]);

  // ── Mobile detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const check = () =>
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Close share on outside click ─────────────────────────────────────────
  useEffect(() => {
    const close = () => setShareOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── RAF zoom loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;
      const { x, y } = currentRef.current;
      if (lensRef.current) {
        lensRef.current.style.left = `${x * 100}%`;
        lensRef.current.style.top  = `${y * 100}%`;
      }
      if (zoomRef.current) {
        zoomRef.current.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const updatePosition = (clientX, clientY) => {
    if (!containerRef.current) return;
    const rect    = containerRef.current.getBoundingClientRect();
    const padding = 0.05;
    targetRef.current = {
      x: Math.max(padding, Math.min(1 - padding, (clientX - rect.left) / rect.width)),
      y: Math.max(padding, Math.min(1 - padding, (clientY - rect.top) / rect.height)),
    };
  };

  // ── Variant logic ─────────────────────────────────────────────────────────
  const activeVariants = useMemo(
    () => (product?.variants ?? []).filter((v) => v.isActive === true),
    [product]
  );

  const attrKeys = useMemo(() => {
    const s = new Set();
    activeVariants.forEach((v) => v.attributes?.forEach((a) => s.add(a.key)));
    return [...s];
  }, [activeVariants]);

  const getAllValues = useCallback(
    (key) => {
      const s = new Set();
      activeVariants.forEach((v) =>
        v.attributes?.filter((a) => a.key === key).forEach((a) => s.add(a.value))
      );
      return [...s];
    },
    [activeVariants]
  );

  const isAvailable = useCallback(
    (key, value) =>
      activeVariants.some((v) => v.attributes?.some((a) => a.key === key && a.value === value)),
    [activeVariants]
  );

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;
    if (!Object.keys(selectedAttrs).length) return activeVariants[0];
    let best = activeVariants[0], bestScore = -1;
    activeVariants.forEach((v) => {
      const score = Object.entries(selectedAttrs).filter(([k, val]) =>
        v.attributes?.some((a) => a.key === k && a.value === val)
      ).length;
      if (score > bestScore) { bestScore = score; best = v; }
    });
    return best;
  }, [activeVariants, selectedAttrs]);

  useEffect(() => {
    if (!activeVariants.length) return;
    const init = {};
    activeVariants[0].attributes?.forEach((a) => { init[a.key] = a.value; });
    setSelectedAttrs(init);
    setActiveThumb(0);
  }, [activeVariants]);

  useEffect(() => { setActiveThumb(0); }, [selectedVariant?._id]);

  // ── Derived values ────────────────────────────────────────────────────────
  const images    = selectedVariant?.images ?? [];
  const activeImg = images[activeThumb]?.url ?? product?.image ?? null;

  const wholesalePrice = selectedVariant?.finalPrice ?? selectedVariant?.price?.sale ?? product?.wholesalePrice ?? null;
  const mrp            = selectedVariant?.price?.base ?? product?.mrp ?? null;
  const hasDisc        = mrp != null && wholesalePrice != null && mrp > wholesalePrice;
  const discPct        = hasDisc ? Math.round(((mrp - wholesalePrice) / mrp) * 100) : null;
  const marginPercent  = product?.marginPercent ?? (hasDisc ? discPct : null);

  const stock = selectedVariant?.inventory?.quantity ?? product?.stock ?? null;
  const availability = selectedVariant?.availability || null;
  const availabilityMeta = getAvailabilityMeta(availability);
  const fallbackInStock = product?.inStock ?? (stock == null || stock > 0);
  const inStock = availability?.purchasable ?? fallbackInStock;
  const lowStock = stock != null && stock > 0 && stock <= 10;
  const isAtMaxStock = currentQty >= maxStock && maxStock !== Infinity;

  const moq            = selectedVariant?.minimumOrderQuantity ?? selectedVariant?.price?.minimumOrderQuantity ?? null;;
  const casePack       = product?.casePack ?? 1;
  const leadTime       = product?.leadTime ?? "3–5 days";
  const returnPolicy   = product?.returnPolicy ?? "7 days";
  const title          = product?.title || product?.name || "Product";
  const rating         = product?.rating?.value ?? product?.rating ?? 4.5;
  const ratingCnt      = product?.rating?.count ?? product?.reviewCount ?? 0;
  const soldInfo       = product?.soldInfo?.count ?? product?.soldCount ?? 0;
  const brand          = product?.brand ?? null;
  const sellingPriceRange = product?.sellingPriceRange ?? null;
  const earnPerUnit    = product?.earnPerUnit ?? null;
  const volumePricing  = product?.volumePricing ?? [];

  const currentTier = volumePricing.find((t) => qty >= t.min && qty <= t.max) || volumePricing[0];
  const unitPrice   = currentTier?.price ?? wholesalePrice;
  const totalPrice  = unitPrice != null ? unitPrice * qty : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  // ── Cart handlers ─────────────────────────────────────────────────────────
  const handleWishlist = async (e) => {
   e.stopPropagation();
   if (!product?.slug || localLoading.wishlist) return;
   setL("wishlist", true);
   try {
     if (isAuthenticated) {
       // Logged-in user — API call
       if (wishlisted) {
         await dispatch(removeFromWishlist({ productSlug: product.slug })).unwrap();
         toast.success("Removed from wishlist", { icon: "💔" });
       } else {
         await dispatch(addToWishlist({
           productSlug: product.slug,
           variantId: variant?._id?.toString() || "",
         })).unwrap();
         toast.success("Saved to wishlist", { icon: "❤️" });
       }
     } else {
       // Guest user — localStorage
       if (wishlisted) {
         dispatch(removeGuestItem(product.slug));
         toast.success("Removed", { icon: "💔" });
       } else {
         dispatch(addGuestItem(product.slug));
         toast.success("Saved to wishlist", { icon: "❤️" });
       }
     }
   } catch (err) {
     toast.error(err?.message || "Wishlist action failed");
   } finally {
     setL("wishlist", false);
   }
 };
   useEffect(() => {
  setQty(moq || 1);
}, [moq]);
 
   // ── Cart — guest only abhi ke liye ───────────────────────────────────────
  // ── handleAddToCart fix ───────────────────────────────────────────
 const handleAddToCart = async (e) => {
   e.stopPropagation();
      if (!inStock) {
      if (availability?.status === "MOQ_UNMET") {
        toast.warning(`MOQ not met: Min qty ${minRequiredQty}, available ${availability?.quantity ?? stock ?? 0}`);
      }
      return;
    }
   if (isInCart || isProcessing || !inStock || !product?.slug) return;
   setL("add", true);
   try {
     if (isAuthenticated) {
       // ✅ Logged-in user — API call
       await dispatch(addToCart({
         productSlug: product.slug,
         productId:   product._id,
         variantId:   variant?._id?.toString() || "",
         quantity:    moq || 1,
       })).unwrap();
     } else {
       // Guest user — localStorage
       dispatch(addGuestCartItem({
         productId:   product._id,
         productSlug: product.slug,
         variantId:   variant?._id?.toString() || "",
         quantity:    moq || 1,
       }));
     }
     toast.success("Added to cart");
   } catch (err) {
     toast.error(err?.message || "Failed to add to cart");
   } finally {
     setL("add", false);
   }
 };
 
 // ── handleIncrement fix ───────────────────────────────────────────
 const handleIncrement = async (e) => {
   e.stopPropagation();
   if (isAtMaxStock) { toast.warning(`Max stock: ${maxStock}`); return; }
   if (isProcessing) return;
   setL("update", true);
   try {
     if (isAuthenticated) {
       // ✅ Logged-in user — API call
       await dispatch(updateCartItem({
         productId:   product._id,
         variantId:   variant?._id?.toString() || "",
         quantity:    currentQty + 1,
         productSlug: product.slug,
       })).unwrap();
     } else {
       dispatch(updateGuestCartItem({
         productSlug: product.slug,
         variantId:   variant?._id?.toString() || "",
         quantity:    currentQty + 1,
       }));
     }
   } catch (err) {
     toast.error(err?.message || "Failed to update");
   } finally {
     setL("update", false);
   }
 };
 
 // ── handleDecrement fix ───────────────────────────────────────────
 const handleDecrement = async (e) => {
  e.stopPropagation();
  if (isProcessing) return;
  const newQty = currentQty - 1;
  try {
    // ✅ moq se kam nahi jaayega — remove kar do
    if (newQty < (moq || 1)) {
      setL("remove", true);
      if (isAuthenticated) {
        await dispatch(removeCartItem({
          productId:   product._id,
          variantId:   variant?._id?.toString() || "",
          productSlug: product.slug,
        })).unwrap();
      } else {
        dispatch(removeGuestCartItem({
          productSlug: product.slug,
          variantId:   variant?._id?.toString() || "",
        }));
      }
      toast.info("Removed from cart");
    } else {
      setL("update", true);
      if (isAuthenticated) {
        await dispatch(updateCartItem({
          productId:   product._id,
          variantId:   variant?._id?.toString() || "",
          quantity:    newQty,
          productSlug: product.slug,
        })).unwrap();
      } else {
        dispatch(updateGuestCartItem({
          productSlug: product.slug,
          variantId:   variant?._id?.toString() || "",
          quantity:    newQty,
        }));
      }
    }
  } catch (err) {
    toast.error(err?.message || "Failed to update");
  } finally {
    setL("update", false);
    setL("remove", false);
  }
};

  const share = (type) => {
    const url = window.location.href;
    const message = `🛒 *OfferWaleBaba* — WHOLESALE & RETAIL\n\n` +
      `🏭 From Maker | 🛍️ Market & Grow | 📈 E-Business\n\n` +
      `Check out this product: *${title}*\n` +
      `💰 Price: ${fmt(unitPrice)}\n\n` +
      `🔗 ${url}\n\n` +
      `🌐 https://offerwalebaba.com/\n` +
      `📞 +91 93706 86008\n` +
      `📍 Ulhasnagar, Maharashtra - 421004\n\n` +
      `Wholesale & Retail — Best Deals, Direct Prices! 🔥`;

    const map = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`🛒 OfferWaleBaba — Check out: ${title} | Best Deals, Direct Prices! 🔥`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🛒 OfferWaleBaba — ${title}\n💰 ${fmt(unitPrice)}\nWholesale & Retail — Best Deals, Direct Prices! 🔥`)}`,
    };
    if (map[type]) window.open(map[type], "_blank");
    if (type === "instagram") {
      navigator?.clipboard?.writeText(
        `🛒 OfferWaleBaba — ${title}\n💰 ${fmt(unitPrice)}\n🔗 ${url}\n📞 +91 93706 86008\nWholesale & Retail — Best Deals, Direct Prices! 🔥`
      );
      toast.success("Link & details copied! Paste on Instagram 📋");
    }
  };

  // ── Tab content ───────────────────────────────────────────────────────────
  const tabs = [
    { key: "desc",    label: "Description" },
    { key: "specs",   label: "Specifications" },
    { key: "reviews", label: `Reviews (${ratingCnt})` },
    { key: "margin",  label: "Margin Info" },
  ];

  const tabContent = {
    desc: (
      <div className="p-5 text-sm text-gray-600 leading-relaxed space-y-4">
        <p>{product?.description}</p>
        {product?.bulletPoints?.length > 0 && (
          <ul className="space-y-2">
            {product.bulletPoints.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Check size={13} className="text-green-600 shrink-0 mt-0.5" /> {bp}
              </li>
            ))}
          </ul>
        )}
        {product?.attributes?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Highlights:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              {product.attributes.map((attr, i) => (
                <li key={i}><span className="font-medium">{attr.key}:</span> {attr.value}</li>
              ))}
            </ul>
          </div>
        )}
        {product?.shipping && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Dimensions:</p>
            <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-600">
              <span>Weight</span><span>{product.shipping.weight} kg</span>
              <span>Length</span><span>{product.shipping.dimensions?.length} cm</span>
              <span>Width</span><span>{product.shipping.dimensions?.width} cm</span>
              <span>Height</span><span>{product.shipping.dimensions?.height} cm</span>
            </div>
          </div>
        )}
      </div>
    ),
    specs: (
      <div className="p-5">
        {product?.specs?.length > 0 ? (
          <table className="w-full text-xs">
            <tbody>
              {product.specs.map((spec, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-amber-50" : "bg-white"}>
                  <td className="py-2.5 px-3 font-bold text-gray-800 w-[35%]">{spec.label}</td>
                  <td className="py-2.5 px-3 text-gray-600">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 p-5">No specifications available.</p>
        )}
      </div>
    ),
    reviews: (
      <div className="p-5">
        {product?.reviews?.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((rev, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-yellow-600"
                    style={{ backgroundColor: rev.avatarBg ?? "#FEF3C7" }}
                  >
                    {rev.initials ?? rev.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{rev.name}</span>
                      {rev.verified && (
                        <span className="text-[8px] font-bold text-green-700 bg-green-100 px-1.5 py-px rounded">VERIFIED</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <MapPin size={9} /> {rev.location} · {rev.date}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-1">{renderStars(rev.rating)}</div>
                <h4 className="text-xs font-bold text-gray-800 mb-1">{rev.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{rev.text}</p>
                <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors">
                  <ThumbsUp size={11} /> Helpful ({rev.helpfulCount ?? 0})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        )}
      </div>
    ),
    margin: (
      <div className="p-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-green-800 mb-3">Margin Calculator</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Your cost</span>
              <div className="text-gray-900 font-extrabold text-lg">{fmt(unitPrice)}</div>
            </div>
            <div>
              <span className="text-gray-500">Sell at</span>
              <div className="text-gray-900 font-extrabold text-lg">{sellingPriceRange ?? "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Earn per unit</span>
              <div className="text-green-700 font-extrabold text-lg">{earnPerUnit ?? "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Margin</span>
              <div className="text-green-700 font-extrabold text-lg">{marginPercent != null ? `${marginPercent}%+` : "—"}</div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          * Margins are estimates based on typical retail pricing. Actual margins may vary.
        </p>
      </div>
    ),
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading) return <div className="bg-gray-50 min-h-screen"><Skeleton /></div>;
  if (isError || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-gray-600 text-sm text-center max-w-sm">
        {error?.data?.message || error?.message || "Product not found."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => canRefetch && refetch()}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          <RefreshCw size={14} /> Retry
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile image lightbox ── */}
      {isVisible && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex items-end"
          onClick={() => setIsVisible(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-4 pt-4 pb-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-800">{activeThumb + 1} / {images.length}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
              >✕</button>
            </div>
            <div className="w-full flex items-center justify-center bg-amber-50 rounded-2xl overflow-hidden mb-4 relative" style={{ aspectRatio: "1/1" }}>
              {activeImg
                ? <img src={activeImg} loading="lazy" alt={title} className="w-full h-full object-contain p-4" onContextMenu={(e) => e.preventDefault()} />
                : <Package size={48} className="text-gray-300" />}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveThumb((p) => (p - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600">‹</button>
                  <button onClick={() => setActiveThumb((p) => (p + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600">›</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveThumb(i)}
                    className={`rounded-full transition-all duration-200 ${activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"}`} />
                ))}
              </div>
            )}
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveThumb(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${activeThumb === i ? "border-yellow-400 shadow-md scale-[1.04]" : "border-gray-200"}`}>
                  <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-5 flex-wrap">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight size={11} />
          {product?.category?.name && (
            <>
              <span
                className="hover:text-gray-700 cursor-pointer transition-colors"
                onClick={() => navigate(`/category/${product.category.slug}`)}
              >{product.category.name}</span>
              <ChevronRight size={11} />
            </>
          )}
          <span className="text-gray-700 font-semibold">{title}</span>
        </nav>

        {/* ═══════════ PDP GRID ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">

            {/* Image Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex flex-row">

                {/* Thumbnail sidebar */}
                {images.length > 0 && (
                  <div className="hidden lg:flex flex-col items-center gap-0 py-3 px-2 border-r border-gray-100 bg-gray-50 flex-shrink-0 w-[76px]">
                    {images.length > 5 && (
                      <button
                        onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: -70, behavior: "smooth" }); }}
                        className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
                      >▲</button>
                    )}
                    <div id="thumb-list-ws" className="flex flex-col gap-2 overflow-y-auto scrollbar-hide overflow-x-hidden flex-1" style={{ maxHeight: 380 }}>
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setActiveThumb(i)}
                          className={`flex-shrink-0 w-[56px] h-[56px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeThumb === i ? "border-yellow-400 shadow-md scale-[1.04]" : "border-gray-200 hover:border-yellow-300"}`}>
                          <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    {images.length > 5 && (
                      <button
                        onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: 70, behavior: "smooth" }); }}
                        className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
                      >▼</button>
                    )}
                  </div>
                )}

                {/* Main image + zoom */}
                <div className="flex-1 flex flex-col">
                  <div
                    ref={containerRef}
                    className="relative w-full cursor-pointer flex items-center justify-center overflow-hidden"
                    style={{ maxHeight: 680 }}
                    onClick={() => { if (isMobile) setIsVisible(true); }}
                    onMouseEnter={() => { if (!isMobile) setShowZoom(true); }}
                    onMouseLeave={() => { if (!isMobile) setShowZoom(false); }}
                    onMouseMove={!isMobile ? (e) => updatePosition(e.clientX, e.clientY) : undefined}
                  >
                    {activeImg
                      ? <img src={activeImg} alt={title} className="w-full h-full rounded-md object-contain p-6 sm:p-8" />
                      : <Package size={64} className="text-gray-200" />}

                    {showZoom && !isMobile && (
                      <div
                        ref={lensRef}
                        className="absolute pointer-events-none"
                        style={{
                          width: "10rem", height: "11rem",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "rgba(173, 93, 248, 0.2)",
                          backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
                          backgroundSize: "6px 6px",
                          border: "1.5px solid rgba(186, 124, 236, 0.5)",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                        }}
                      />
                    )}
                  </div>

                  {/* Mobile dots */}
                  {images.length > 1 && (
                    <div className="lg:hidden flex items-center justify-center gap-1.5 py-3">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setActiveThumb(i)}
                          className={`rounded-full transition-all duration-200 ${activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Zoom panel (desktop) — rendered inside left col, positioned absolutely */}
            {showZoom && !isMobile && activeImg && (
              <div
                ref={zoomRef}
                className="hidden lg:block fixed left-[60%] top-[26%] z-30 w-[26rem] h-[38rem] rounded-2xl shadow-xl bg-white border border-gray-100 pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImg})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "250%",
                }}
              />
            )}

            {/* Tabs Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-max px-4 py-3 text-xs font-bold border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? "text-gray-900 border-yellow-400" : "text-gray-400 border-transparent hover:text-gray-700"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {tabContent[activeTab]}
            </div>

            {/* Related Products */}
            {related.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-yellow-400 rounded-full" />
                    Customers also bought
                  </h2>
                  <button
                    onClick={() => navigate(`/category/${product?.category?.slug}`)}
                    className="hidden sm:flex text-xs text-gray-400 hover:text-yellow-600 items-center gap-1 transition font-medium"
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {related.map((p) => <RelatedCard key={p._id || p.slug} product={p} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Sticky ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-[74px]">

            {/* Main info card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

              {/* Title area */}
              <div className="p-4 sm:p-5">
                {product?.category?.name && (
                  <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider mb-1">
                    {product.category.name}{product?.subcategory ? ` / ${product.subcategory}` : ""}
                  </div>
                )}
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug mb-2">{title}</h1>
                {brand && (
                  <p className="text-xs text-gray-400 mb-2">
                    by <span className="text-yellow-600 font-semibold">{brand}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">{renderStars(rating)}</div>
                  <span className="text-xs font-bold text-gray-800">{rating}</span>
                  <span className="text-xs text-gray-400">({ratingCnt} reviews)</span>
                </div>
                {soldInfo > 0 && (
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} />
                      <span className="font-bold text-red-500">{formatCount(soldInfo)} bought</span> in past month
                    </span>
                    {product?.sku && <span>SKU: {product.sku}</span>}
                  </div>
                )}
              </div>

              {/* Price area */}
              <div className="bg-amber-50 border-t border-b border-yellow-100 px-4 sm:px-5 py-3">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{fmt(unitPrice)}</span>
                  {hasDisc && <span className="text-sm text-gray-400 line-through">{fmt(mrp)}</span>}
                  {marginPercent != null && (
                    <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {marginPercent}% margin
                    </span>
                  )}
                </div>
                {(sellingPriceRange || earnPerUnit) && (
                  <div className="text-xs text-gray-600">
                    {sellingPriceRange && <>Sell at <span className="font-bold text-gray-800">{sellingPriceRange}</span>{" "}</>}
                    {earnPerUnit && <>· Earn <span className="font-bold text-green-700">{earnPerUnit}</span>/unit</>}
                  </div>
                )}
              </div>

              {/* Volume pricing */}
              {volumePricing.length > 0 && (
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Volume Pricing</div>
                  <div className="space-y-1.5">
                    {volumePricing.map((tier, i) => (
                      <div
                        key={i}
                        onClick={() => setQty(tier.min)}
                        className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors ${qty >= tier.min && qty <= tier.max ? "bg-yellow-50 border border-yellow-300" : "bg-gray-50 border border-transparent hover:border-gray-200"}`}
                      >
                        <span className="font-semibold text-gray-800">
                          {tier.min}–{tier.max === 9999 ? "∞" : tier.max} units
                          {tier.best && (
                            <span className="ml-2 text-[8px] font-extrabold text-yellow-700 bg-yellow-100 px-1.5 py-px rounded">BEST VALUE</span>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-gray-900">{fmt(tier.price)}</span>
                          {tier.save > 0 && <span className="text-green-600 font-bold">Save {fmt(tier.save)}</span>}
                          {tier.margin && <span className="text-green-700 font-bold bg-green-100 px-1.5 py-px rounded text-[9px]">{tier.margin}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics strip */}
              <div className="grid grid-cols-3 border-b border-gray-100 text-center divide-x divide-gray-100">
                <div className="py-3 px-2">
                  <Truck size={15} className="mx-auto text-yellow-500 mb-1" />
                  <div className="text-[10px] font-bold text-gray-700">{leadTime}</div>
                  <div className="text-[8px] text-gray-400">Delivery</div>
                </div>
                <div className="py-3 px-2">
                  <Package size={15} className="mx-auto text-yellow-500 mb-1" />
                  <div className="text-[10px] font-bold text-gray-700">{casePack} units</div>
                  <div className="text-[8px] text-gray-400">Case pack</div>
                </div>
                <div className="py-3 px-2">
                  <RotateCcw size={15} className="mx-auto text-yellow-500 mb-1" />
                  <div className="text-[10px] font-bold text-gray-700">{returnPolicy}</div>
                  <div className="text-[8px] text-gray-400">Returns</div>
                </div>
              </div>

              {/* Stock strip */}
              <div className={`flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-gray-100 ${inStock ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                  <span className={`text-xs font-bold ${inStock ? "text-green-700" : "text-red-600"}`}>
                    {inStock ? (lowStock ? `Only ${stock} left` : "In Stock") : "Out of Stock"}
                  </span>
                </div>
                {stock != null && inStock && (
                  <span className="text-[10px] text-gray-400">{stock.toLocaleString("en-IN")} units available</span>
                )}
              </div>

              {/* Quantity + CTA */}
              <div className="px-4 sm:px-5 py-4 space-y-3">
                {/* Qty row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Quantity <span className="font-normal text-gray-400">(MOQ: {minRequiredQty})</span>
                  </span>
                  {totalPrice != null && (
                    <span className="text-xs font-extrabold text-gray-900">Total: {fmt(totalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty((q) => Math.max(minRequiredQty, q - minRequiredQty))}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
                  >−</button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Math.max(minRequiredQty, Number(e.target.value)))}
                    className="flex-1 h-10 text-center border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-yellow-400"
                  />
                  <button
                    onClick={() => setQty((q) => q + minRequiredQty)}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
                  >+</button>
                </div>

                {/* Variant attrs */}
                {attrKeys.length > 0 && (
                  <div className="space-y-3 pt-1">
                    {attrKeys.map((key) => (
                      <div key={key}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                          {key}
                          {selectedAttrs[key] && (
                            <span className="ml-2 normal-case font-semibold text-gray-700 tracking-normal">: {selectedAttrs[key]}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {getAllValues(key).map((val) => {
                            const avail  = isAvailable(key, val);
                            const active = selectedAttrs[key] === val;
                            return (
                              <button
                                key={val}
                                onClick={() => avail && setSelectedAttrs((p) => ({ ...p, [key]: val }))}
                                disabled={!avail}
                                className={`px-3 py-1.5 text-xs rounded-xl border-2 font-medium transition-all duration-150 ${active ? "border-gray-900 bg-gray-900 text-white" : avail ? "border-gray-200 text-gray-700 hover:border-gray-900 bg-white" : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"}`}
                              >{val}</button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ADD TO CART / QTY CONTROLS ── */}
                {inStock ? (
                  !isInCart ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={localLoading.add}
                      className="w-full bg-yellow-400 text-gray-900 py-3 rounded-xl font-extrabold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {localLoading.add
                        ? <Loader2 size={16} className="animate-spin" />
                        : <ShoppingCart size={16} />}
                      Add To Cart — {totalPrice != null ? fmt(totalPrice) : "—"}
                    </button>
                  ) : (
                    <div className="flex items-center w-full border-2 border-yellow-400 rounded-xl overflow-hidden">
                      <button
                        onClick={handleDecrement}
                        disabled={isProcessing || currentQty <= (moq || 1)}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition disabled:opacity-40"
                      >
                        {localLoading.remove
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Minus size={16} />}
                      </button>
                      <div className="flex-1 text-center text-sm font-extrabold text-gray-900">
                        {localLoading.update
                          ? <Loader2 size={14} className="animate-spin mx-auto" />
                          : `${currentQty} in cart`}
                      </div>
                      <button
                        onClick={handleIncrement}
                        disabled={isAtMaxStock || isProcessing}
                        className="w-12 h-12 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-40"
                      >
                        {localLoading.update
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Plus size={16} />}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-extrabold text-sm text-center">
                    Out of Stock
                  </div>
                )}

                {/* Order Now */}
                <Link
                  to="/checkout"
                  className="w-full bg-gray-900 text-yellow-400 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
                >
                  <ShoppingCart size={16} />
                  {inStock ? `Add To Cart — ${totalPrice != null ? fmt(totalPrice) : "—"}` : availabilityMeta.label}
                </Link>
                {inStock ? (
                  <Link
                    to="/checkout"
                    className="w-full bg-gray-900 text-yellow-400 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
                  >
                    Order Now
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    {availabilityMeta.label}
                  </button>
                )}
                {availability?.status === "MOQ_UNMET" && (
                  <p className={`text-xs font-semibold ${availabilityMeta.className}`}>
                    Min qty {minRequiredQty}, available {availability?.quantity ?? stock ?? 0}
                  </p>
                )}

                {/* Wishlist + Share */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleWishlist}
                    disabled={localLoading.wishlist}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${wishlisted ? "border-red-200 text-red-500 bg-red-50" : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"} disabled:opacity-50`}
                  >
                    {localLoading.wishlist
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Heart size={14} className={wishlisted ? "fill-red-500 text-red-500" : ""} />}
                    {wishlisted ? "Wishlisted" : "Wishlist"}
                  </button>

                  <div className="relative flex-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareOpen((v) => !v); }}
                      className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${shareOpen ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                    >
                      <Share2 size={13} /> Share
                    </button>
                    {shareOpen && (
                      <div className="absolute bottom-[calc(100%+8px)] right-0 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg z-50 flex gap-3">
                        {[
                          { type: "whatsapp",  Icon: IoLogoWhatsapp,  cls: "bg-green-500 hover:bg-green-600" },
                          { type: "facebook",  Icon: IoLogoFacebook,  cls: "bg-blue-600 hover:bg-blue-700" },
                          { type: "instagram", Icon: IoLogoInstagram, cls: "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600" },
                          { type: "telegram",  Icon: FaTelegram,      cls: "bg-sky-500 hover:bg-sky-600" },
                        ].map(({ type, Icon, cls }) => (
                          <button key={type} onClick={() => { share(type); setShareOpen(false); }}
                            className={`w-9 h-9 rounded-full ${cls} text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-150 shadow-sm`}>
                            <Icon size={16} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-4 border-t border-gray-100 text-center divide-x divide-gray-100">
                {[
                  { icon: Shield,    label: "Secure" },
                  { icon: Truck,     label: "Fast Ship" },
                  { icon: RotateCcw, label: "Easy Return" },
                  { icon: Check,     label: "GST Invoice" },
                ].map((feat, i) => (
                  <div key={i} className="py-3 px-1">
                    <feat.icon size={13} className="mx-auto text-yellow-500 mb-1" />
                    <div className="text-[8px] font-bold text-gray-400">{feat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Offers</p>
              <div className="flex flex-col divide-y divide-gray-100">
                {[
                  { label: "Get Flat ₹100 OFF on orders above ₹2000", code: "100 OFB" },
                  { label: "Get Flat ₹150 OFF on orders above ₹3000", code: "150 OFB" },
                  { label: "Get Flat ₹50 OFF on orders above ₹1000",  code: "50 OFB" },
                ].map(({ label, code }) => (
                  <div key={code} className="flex items-start justify-between py-3 gap-3">
                    <div className="flex items-start gap-2.5">
                      <Tag size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Use code — <span className="font-semibold text-gray-600">{code}</span>
                        </p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-red-500 flex-shrink-0 hover:text-red-600 transition-colors">Details</button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">*Coupons can be applied at checkout</p>
            </div>

            {/* Product meta */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {product?.hsnCode && (<><span className="text-gray-400">HSN Code</span><span className="font-bold text-gray-800">{product.hsnCode}</span></>)}
                {product?.gstRate != null && (<><span className="text-gray-400">GST Rate</span><span className="font-bold text-gray-800">{product.gstRate}%</span></>)}
                <span className="text-gray-400">Origin</span>
                <span className="font-bold text-gray-800">{product?.origin ?? "India"}</span>
              </div>
            </div>

          </div>{/* end right column */}
        </div>{/* end grid */}
      </div>{/* end container */}
    </div>
  );
};

export default WholesaleProductDetail;