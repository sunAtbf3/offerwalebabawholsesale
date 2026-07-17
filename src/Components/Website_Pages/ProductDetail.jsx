// import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { IoLogoWhatsapp, IoLogoFacebook, IoLogoInstagram } from "react-icons/io5";
// import { FaTelegram } from "react-icons/fa6";
// import {
//   Star, Heart, Minus, Plus, ShoppingCart,
//   CheckCircle2, Truck, AlertCircle,
//   RefreshCw, ArrowLeft, Loader2, ArrowRight,
//   Package, ShieldCheck, RotateCcw,
//   Tag, Share2, ChevronRight, TrendingUp,
//   Check, ThumbsUp, MapPin, Shield, Eye, ShoppingBag,
//   Loader,
// } from "lucide-react";

// import {
//   useGetProductBySlugQuery,
//   useGetRelatedProductsQuery,
// } from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";

// import {
//   setCurrentProduct,
//   clearCurrentProduct,
// } from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice";

// import {
//   addGuestCartItem,
//   updateGuestCartItem,
//   removeGuestCartItem,
//   selectCartItemBySlug,
//   addToCart,
//   updateCartItem,
//   removeCartItem,
// } from "../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";

// import {
//   addGuestItem,
//   removeGuestItem,
//   selectIsWishlisted,
//   addToWishlist,
//   removeFromWishlist,
// } from "../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice";

// import { toast } from "react-toastify";
// import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";

// // ✅ WholesaleProductCard import — RelatedCard replaced
// import WholesaleProductCard from "../ProductCard/WholesaleProductCard";
//  const MobileImageSwiper = ({ images, activeThumb, setActiveThumb, title, onTap }) => {
//   // ── touch state ──────────────────────────────────────────────────────────
//   const touchStartX  = useRef(null);
//   const touchStartY  = useRef(null);
//   const [dragDelta,  setDragDelta]  = useState(0);   // live px offset while dragging
//   const [isDragging, setIsDragging] = useState(false);
//   const [isLocked,   setIsLocked]   = useState(false); // locked to horizontal scroll
 
//   const THRESHOLD = 50; // px to count as intentional swipe
 
//   const onTouchStart = useCallback((e) => {
//     touchStartX.current = e.touches[0].clientX;
//     touchStartY.current = e.touches[0].clientY;
//     setDragDelta(0);
//     setIsDragging(true);
//     setIsLocked(false);
//   }, []);
 
//   const onTouchMove = useCallback((e) => {
//     if (!isDragging) return;
//     const dx = e.touches[0].clientX - touchStartX.current;
//     const dy = e.touches[0].clientY - touchStartY.current;
 
//     // Determine scroll axis on first significant movement
//     if (!isLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
//       if (Math.abs(dx) >= Math.abs(dy)) {
//         setIsLocked(true);       // horizontal → we own it
//       } else {
//         setIsDragging(false);    // vertical → let page scroll
//         return;
//       }
//     }
 
//     if (isLocked) {
//       e.preventDefault();        // stop page scroll while swiping images
//       // Clamp: can't drag beyond first/last with resistance
//       const atStart = activeThumb === 0 && dx > 0;
//       const atEnd   = activeThumb === images.length - 1 && dx < 0;
//       setDragDelta(atStart || atEnd ? dx * 0.25 : dx);
//     }
//   }, [isDragging, isLocked, activeThumb, images.length]);
 
//   const onTouchEnd = useCallback((e) => {
//     setIsDragging(false);
//     setIsLocked(false);
//     const dx = dragDelta;
 
//     if (Math.abs(dx) < 8) {
//       // Tap — open lightbox
//       onTap?.();
//     } else if (dx < -THRESHOLD && activeThumb < images.length - 1) {
//       setActiveThumb(activeThumb + 1);
//     } else if (dx > THRESHOLD && activeThumb > 0) {
//       setActiveThumb(activeThumb - 1);
//     }
//     setDragDelta(0);
//   }, [dragDelta, activeThumb, images.length, setActiveThumb, onTap]);
 
//   const translateX = `calc(${-activeThumb * 100}% + ${dragDelta}px)`;
 
//   return (
//     <div
//       className="relative w-full overflow-hidden select-none"
//       style={{ aspectRatio: "1 / 1", touchAction: "pan-y" }}
//       onTouchStart={onTouchStart}
//       onTouchMove={onTouchMove}
//       onTouchEnd={onTouchEnd}
//     >
//       {/* Slide track */}
//       <div
//         className="flex h-full"
//         style={{
//           width: `${images.length * 100}%`,
//           transform: `translateX(${translateX})`,
//           transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
//           willChange: "transform",
//         }}
//       >
//         {images.map((img, i) => (
//           <div
//             key={i}
//             className="flex-shrink-0 flex items-center justify-center bg-white"
//             style={{ width: `${100 / images.length}%`, height: "100%" }}
//           >
//             {img?.url
//               ? <img
//                   src={img.url}
//                   alt={`${title} ${i + 1}`}
//                   className="w-full h-full object-contain p-5"
//                   draggable={false}
//                   onContextMenu={(e) => e.preventDefault()}
//                 />
//               : <Package size={48} className="text-gray-200" />
//             }
//           </div>
//         ))}
//       </div>
 
//       {/* Image counter badge — top right */}
//       {images.length > 1 && (
//         <div className="absolute top-3 right-3 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
//           {activeThumb + 1} / {images.length}
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt = (n) => {
//   if (n == null) return "—";
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);
// };

// const renderStars = (rating = 0) =>
//   Array.from({ length: 5 }, (_, i) => (
//     <Star
//       key={i}
//       size={13}
//       className={
//         i < Math.floor(rating)
//           ? "fill-yellow-400 text-yellow-400"
//           : "fill-gray-200 text-gray-200"
//       }
//     />
//   ));

// function formatCount(count = 0) {
//   if (count < 100) return count.toString();
//   return Math.floor(count / 100) * 100 + "+";
// }

// // ── From V1: full availability meta with MOQ_UNMET / NOT_LISTED support ───────
// const getAvailabilityMeta = (availability) => {
//   const status = availability?.status || "IN_STOCK";
//   if (status === "OUT_OF_STOCK") return { label: "Out of stock", className: "text-red-600" };
//   if (status === "MOQ_UNMET")    return { label: "MOQ not met",  className: "text-amber-600" };
//   if (status === "NOT_LISTED")   return { label: "Not available", className: "text-gray-500" };
//   return { label: "In stock", className: "text-green-700" };
// };

// // ─── Skeleton ─────────────────────────────────────────────────────────────────
// const Skeleton = () => (
//   <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
//     <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">
//       <div className="flex gap-3">
//         <div className="flex flex-col gap-2">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl" />
//           ))}
//         </div>
//         <div className="flex-1 bg-gray-200 rounded-2xl" style={{ minHeight: 440 }} />
//       </div>
//       <div className="space-y-4 pt-2">
//         <div className="h-7 bg-gray-200 rounded w-4/5" />
//         <div className="h-4 bg-gray-200 rounded w-1/3" />
//         <div className="h-10 bg-gray-200 rounded w-2/5" />
//         <div className="h-24 bg-gray-200 rounded-xl" />
//         <div className="h-12 bg-gray-200 rounded-xl" />
//         <div className="h-12 bg-gray-200 rounded-xl" />
//       </div>
//     </div>
//   </div>
// );

// // ─── Main WholesaleProductDetail ──────────────────────────────────────────────
// const WholesaleProductDetail = () => {
//   const { slug } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const {
//     data: product,
//     isLoading,
//     isError,
//     error,
//     refetch,
//     status,
//   } = useGetProductBySlugQuery(slug, { skip: !slug });

//   const canRefetch = status !== "uninitialized";

//   const { data: related = [] } = useGetRelatedProductsQuery(
//     { slug, limit: 5 },
//     { skip: !slug || !product }
//   );

//   const wishlisted      = useSelector(selectIsWishlisted(product?.slug));
//   const cartItem        = useSelector(selectCartItemBySlug(product?.slug));
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const isInCart        = !!cartItem;
//   const currentQty      = cartItem?.quantity ?? 0;
//   const variantRef = useRef(null);

//   const [activeThumb, setActiveThumb] = useState(0);
//   const [selectedAttrs, setSelectedAttrs] = useState({});
//   const [activeTab, setActiveTab]     = useState("desc");
//   const [openDesc, setOpenDesc]       = useState(false);
//   const [shareOpen, setShareOpen]     = useState(false);
//   const [showZoom, setShowZoom]       = useState(false);
//   const [isMobile, setIsMobile]       = useState(false);
//   const [isVisible, setIsVisible]     = useState(false);
//   const [qty, setQty]                 = useState(1);
//   const volumetricWeight =
//   product?.shipping?.dimensions?.length &&
//   product?.shipping?.dimensions?.width &&
//   product?.shipping?.dimensions?.height
//     ? (
//         (
//           product.shipping.dimensions.length *
//           product.shipping.dimensions.width *
//           product.shipping.dimensions.height
//         ) / 5000
//       ).toFixed(2)
//     : null;
//   const [localLoading, setLocalLoading] = useState({
//     add: false, update: false, remove: false, wishlist: false,
//   });
//   const isLoggedIn  = useSelector(selectIsAuthenticated)
//   const setL         = (key, val) => setLocalLoading((p) => ({ ...p, [key]: val }));
//   const isProcessing = localLoading.add || localLoading.update || localLoading.remove;
//   const containerRef = useRef(null);
//   const lensRef      = useRef(null);
//   const zoomRef      = useRef(null);
//   const rafRef       = useRef(null);
//   const targetRef    = useRef({ x: 0.5, y: 0.5 });
//   const currentRef   = useRef({ x: 0.5, y: 0.5 });

//   useEffect(() => {
//     if (product) dispatch(setCurrentProduct(product));
//     return () => dispatch(clearCurrentProduct());
//   }, [product, dispatch]);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//     setActiveThumb(0);
//     setSelectedAttrs({});
//     setActiveTab("desc");
//   }, [slug]);

//   useEffect(() => {
//     const check = () =>
//       setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   useEffect(() => {
//     const close = () => setShareOpen(false);
//     document.addEventListener("click", close);
//     return () => document.removeEventListener("click", close);
//   }, []);

//   useEffect(() => {
//     const animate = () => {
//       currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
//       currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;
//       const { x, y } = currentRef.current;
//       if (lensRef.current) {
//         lensRef.current.style.left = `${x * 100}%`;
//         lensRef.current.style.top  = `${y * 100}%`;
//       }
//       if (zoomRef.current) {
//         zoomRef.current.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
//       }
//       rafRef.current = requestAnimationFrame(animate);
//     };
//     rafRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, []);

//   const updatePosition = (clientX, clientY) => {
//     if (!containerRef.current) return;
//     const rect    = containerRef.current.getBoundingClientRect();
//     const padding = 0.05;
//     targetRef.current = {
//       x: Math.max(padding, Math.min(1 - padding, (clientX - rect.left) / rect.width)),
//       y: Math.max(padding, Math.min(1 - padding, (clientY - rect.top) / rect.height)),
//     };
//   };

//   // ── Variant logic ─────────────────────────────────────────────────────────
//   const activeVariants = useMemo(
//     () => (product?.variants ?? []).filter((v) => v.isActive === true),
//     [product]
//   );
//   console.log("productvariant", product?.variants);

//   const attrKeys = useMemo(() => {
//     const s = new Set();
//     activeVariants.forEach((v) => v.attributes?.forEach((a) => s.add(a.key)));
//     return [...s];
//   }, [activeVariants]);

//   const getAllValues = useCallback(
//     (key) => {
//       const s = new Set();      
//       activeVariants.forEach((v) =>
//         v.attributes?.filter((a) => a.key === key).forEach((a) => s.add(a.value))
//       );
//       return [...s];
//     },
//     [activeVariants]
//   );

//   const isAvailable = useCallback(
//     (key, value) =>
//       activeVariants.some((v) => v.attributes?.some((a) => a.key === key && a.value === value)),
//     [activeVariants]
//   );

//   const selectedVariant = useMemo(() => {
//     if (!activeVariants.length) return null;
//     if (!Object.keys(selectedAttrs).length) return activeVariants[0];
//     let best = activeVariants[0], bestScore = -1;
//     activeVariants.forEach((v) => {
//       const score = Object.entries(selectedAttrs).filter(([k, val]) =>
//         v.attributes?.some((a) => a.key === k && a.value === val)
//       ).length;
//       if (score > bestScore) { bestScore = score; best = v; }
//     });
//     return best;
//   }, [activeVariants, selectedAttrs]);

//   useEffect(() => {
//     if (!activeVariants.length) return;
//     const init = {};
//     activeVariants[0].attributes?.forEach((a) => { init[a.key] = a.value; });
//     setSelectedAttrs(init);
//     setActiveThumb(0);
//   }, [activeVariants]);

//   useEffect(() => { setActiveThumb(0); }, [selectedVariant?._id]);

//   // ── Outside click → reset variant ────────────────────────────────────────
//   useEffect(() => {
//     const handleOutsideClick = (e) => {
//       if (variantRef.current && !variantRef.current.contains(e.target)) {
//         if (!activeVariants.length) return;
//         const init = {};
//         activeVariants[0].attributes?.forEach((a) => { init[a.key] = a.value; });
//         setSelectedAttrs(init);
//         setActiveThumb(0);
//       }
//     };
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, [activeVariants]);

//   // ── Derived values ─────────────────────────────────────────────────────────
//   const images    = selectedVariant?.images ?? [];
//   const activeImg = images[activeThumb]?.url ?? product?.image ?? null;

//   const variant = selectedVariant || {};

//   const wholesalePrice = selectedVariant?.finalPrice ?? selectedVariant?.price?.sale ?? product?.wholesalePrice ?? null;
//   const mrp            = selectedVariant?.price?.base ?? product?.mrp ?? null;
//   const hasDisc        = mrp != null && wholesalePrice != null && mrp > wholesalePrice;
//   const discPct        = hasDisc ? Math.round(((mrp - wholesalePrice) / mrp) * 100) : null;
//   const marginPercent  = product?.marginPercent ?? (hasDisc ? discPct : null);

//   const maxStock = selectedVariant?.inventory?.trackInventory
//     ? (selectedVariant?.inventory?.quantity ?? 0)
//     : Infinity;
//   const stock    = selectedVariant?.inventory?.quantity ?? product?.stock ?? null;

//   const availability     = selectedVariant?.availability || null;
//   const availabilityMeta = getAvailabilityMeta(availability);
//   const fallbackInStock  = product?.inStock ?? (maxStock === Infinity || maxStock > 0);
//   const inStock          = availability?.purchasable ?? fallbackInStock;
//   const lowStock         = stock != null && stock > 0 && stock <= 10;
//   const isAtMaxStock     = currentQty >= maxStock && maxStock !== Infinity;

//   const moq           = selectedVariant?.minimumOrderQuantity
//     ?? selectedVariant?.price?.minimumOrderQuantity
//     ?? product?.moq
//     ?? 1;
//   const casePack      = product?.casePack ?? 1;
//   const leadTime      = product?.leadTime ?? "3–5 days";
//   const returnPolicy  = product?.returnPolicy ?? "7 days";
//   const title         = product?.title || product?.name || "Product";
//   // const rating        = product?.rating?.value ?? product?.rating ?? 4.5;
//   const rating =
//   typeof product?.rating === "object"
//     ? (
//         typeof product?.rating?.value === "object"
//           ? product?.rating?.value?.value
//           : product?.rating?.value
//       ) ?? 4.5
//     : product?.rating ?? 4.5;
//   const ratingCnt     = product?.rating?.count ?? product?.reviewCount ?? 0;
//   const soldInfo      = product?.soldInfo?.count ?? product?.soldCount ?? 0;
//   const brand         = product?.brand ?? null;
//   const sellingPriceRange = product?.sellingPriceRange ?? null;
//   const earnPerUnit   = product?.earnPerUnit ?? null;
//   const volumePricing = product?.volumePricing ?? [];

//   const currentTier = volumePricing.find((t) => qty >= t.min && qty <= t.max) || volumePricing[0];
//   const unitPrice   = currentTier?.price ?? wholesalePrice;
//   const totalPrice  = unitPrice != null ? unitPrice * qty : null;

//   useEffect(() => {
//     setQty(moq || 1);
//   }, [moq]);

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const handleWishlist = async (e) => {
//     e.stopPropagation();
//     if (!product?.slug || localLoading.wishlist) return;
//     setL("wishlist", true);
//     try {
//       if (isAuthenticated) {
//         if (wishlisted) {
//           await dispatch(removeFromWishlist({ productSlug: product.slug })).unwrap();
//           toast.success("Removed from wishlist", { icon: "💔" });
//         } else {
//           await dispatch(addToWishlist({
//             productSlug: product.slug,
//             variantId:   variant?._id?.toString() || "",
//           })).unwrap();
//           toast.success("Saved to wishlist", { icon: "❤️" });
//         }
//       } else {
//         if (wishlisted) {
//           dispatch(removeGuestItem(product.slug));
//           toast.success("Removed", { icon: "💔" });
//         } else {
//           dispatch(addGuestItem(product.slug));
//           toast.success("Saved to wishlist", { icon: "❤️" });
//         }
//       }
//     } catch (err) {
//       toast.error(err?.message || "Wishlist action failed");
//     } finally {
//       setL("wishlist", false);
//     }
//   };

//   const handleAddToCart = async (e) => {
//     e.stopPropagation();
//     if (!inStock) {
//       if (availability?.status === "MOQ_UNMET") {
//         toast.warning(`MOQ not met: Min qty ${moq}, available ${availability?.quantity ?? stock ?? 0}`);
//       }
//       return;
//     }
//     if (isInCart || isProcessing || !product?.slug) return;
//     setL("add", true);
//     try {
//       if (isAuthenticated) {
//         await dispatch(addToCart({
//           productSlug: product.slug,
//           productId:   product._id,
//           variantId:   variant?._id?.toString() || "",
//           quantity:    moq || 1,
//         })).unwrap();
//       } else {
//         dispatch(addGuestCartItem({
//           productId:   product._id,
//           productSlug: product.slug,
//           variantId:   variant?._id?.toString() || "",
//           quantity:    moq || 1,
//         }));
//       }
//       toast.success("Added to cart");
//     } catch (err) {
//       toast.error(err?.message || "Failed to add to cart");
//     } finally {
//       setL("add", false);
//     }
//   };

//   const handleIncrement = async (e) => {
//     e.stopPropagation();
//     if (isAtMaxStock) { toast.warning(`Max stock: ${maxStock}`); return; }
//     if (isProcessing) return;
//     setL("update", true);
//     try {
//       if (isAuthenticated) {
//         await dispatch(updateCartItem({
//           productId:   product._id,
//           variantId:   variant?._id?.toString() || "",
//           quantity:    currentQty + 1,
//           productSlug: product.slug,
//         })).unwrap();
//       } else {
//         dispatch(updateGuestCartItem({
//           productSlug: product.slug,
//           variantId:   variant?._id?.toString() || "",
//           quantity:    currentQty + 1,
//         }));
//       }
//     } catch (err) {
//       toast.error(err?.message || "Failed to update");
//     } finally {
//       setL("update", false);
//     }
//   };

//   const handleDecrement = async (e) => {
//     e.stopPropagation();
//     if (isProcessing) return;
//     const newQty = currentQty - 1;
//     try {
//       if (newQty < (moq || 1)) {
//         setL("remove", true);
//         if (isAuthenticated) {
//           await dispatch(removeCartItem({
//             productId:   product._id,
//             variantId:   variant?._id?.toString() || "",
//             productSlug: product.slug,
//           })).unwrap();
//         } else {
//           dispatch(removeGuestCartItem({
//             productSlug: product.slug,
//             variantId:   variant?._id?.toString() || "",
//           }));
//         }
//         toast.info("Removed from cart");
//       } else {
//         setL("update", true);
//         if (isAuthenticated) {
//           await dispatch(updateCartItem({
//             productId:   product._id,
//             variantId:   variant?._id?.toString() || "",
//             quantity:    newQty,
//             productSlug: product.slug,
//           })).unwrap();
//         } else {
//           dispatch(updateGuestCartItem({
//             productSlug: product.slug,
//             variantId:   variant?._id?.toString() || "",
//             quantity:    newQty,
//           }));
//         }
//       }
//     } catch (err) {
//       toast.error(err?.message || "Failed to update");
//     } finally {
//       setL("update", false);
//       setL("remove", false);
//     }
//   };

//   const share = (type) => {
//     const url     = window.location.href;
//     const message = `🛒 *OfferWaleBaba* — WHOLESALE & RETAIL\n\n` +
//       `🏭 From Maker | 🛍️ Market & Grow | 📈 E-Business\n\n` +
//       `Check out this product: *${title}*\n` +
//       `💰 Price: ${fmt(unitPrice)}\n\n` +
//       `🔗 ${url}\n\n` +
//       `🌐 https://offerwalebaba.com/\n` +
//       `📞 +91 93706 86008\n` +
//       `📍 Ulhasnagar, Maharashtra - 421004\n\n` +
//       `Wholesale & Retail — Best Deals, Direct Prices! 🔥`;

//     const map = {
//       whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
//       facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`🛒 OfferWaleBaba — Check out: ${title} | Best Deals, Direct Prices! 🔥`)}`,
//       telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🛒 OfferWaleBaba — ${title}\n💰 ${fmt(unitPrice)}\nWholesale & Retail — Best Deals, Direct Prices! 🔥`)}`,
//     };
//     if (map[type]) window.open(map[type], "_blank");
//     if (type === "instagram") {
//       navigator?.clipboard?.writeText(
//         `🛒 OfferWaleBaba — ${title}\n💰 ${fmt(unitPrice)}\n🔗 ${url}\n📞 +91 93706 86008\nWholesale & Retail — Best Deals, Direct Prices! 🔥`
//       );
//       toast.success("Link & details copied! Paste on Instagram 📋");
//     }
//   };

//   // ── Tabs ──────────────────────────────────────────────────────────────────
//   const tabs = [
//     { key: "desc",    label: "Description" },
//     { key: "specs",   label: "Specifications" },
//     { key: "reviews", label: `Reviews (${ratingCnt})` },
//     { key: "margin",  label: "Margin Info" },
//   ];

//   const tabContent = {
//     desc: (
//       <div className="p-5 text-sm text-gray-600 leading-relaxed space-y-4">
//         <p>{product?.description}</p>
//         {product?.bulletPoints?.length > 0 && (
//           <ul className="space-y-2">
//             {product.bulletPoints.map((bp, i) => (
//               <li key={i} className="flex items-start gap-2 text-xs">
//                 <Check size={13} className="text-green-600 shrink-0 mt-0.5" /> {bp}
//               </li>
//             ))}
//           </ul>
//         )}
//         {product?.attributes?.length > 0 && (
//           <div>
//             <p className="font-semibold text-gray-800 mb-1">Highlights:</p>
//             <ul className="list-disc pl-5 space-y-1 text-xs">
//               {product.attributes.map((attr, i) => (
//                 <li key={i}><span className="font-medium">{attr.key}:</span> {attr.value}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//         {product?.shipping && (
//           <div>
//             <p className="font-semibold text-gray-800 mb-1">Dimensions:</p>
//             <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-600">
//               <span>Weight</span><span>{product.shipping.weight} kg</span>
//               <span>Length</span><span>{product.shipping.dimensions?.length} cm</span>
//               <span>Width</span><span>{product.shipping.dimensions?.width} cm</span>
//               <span>Height</span><span>{product.shipping.dimensions?.height} cm</span>
//           {volumetricWeight && (
//   <>
//     <span>Vol. Weight</span>
//     <span>{volumetricWeight} kg</span>
//   </>
// )}
//             </div>
//           </div>
//         )}
//       </div>
//     ),
//     specs: (
//       <div className="p-5">
//         {product?.specs?.length > 0 ? (
//           <table className="w-full text-xs">
//             <tbody>
//               {product.specs.map((spec, i) => (
//                 <tr key={i} className={i % 2 === 0 ? "bg-amber-50" : "bg-white"}>
//                   <td className="py-2.5 px-3 font-bold text-gray-800 w-[35%]">{spec.label}</td>
//                   <td className="py-2.5 px-3 text-gray-600">{spec.value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-sm text-gray-400 p-5">No specifications available.</p>
//         )}
//       </div>
//     ),
//     reviews: (
//       <div className="p-5">
//         {product?.reviews?.length > 0 ? (
//           <div className="space-y-4">
//             {product.reviews.map((rev, i) => (
//               <div key={i} className="border border-gray-200 rounded-xl p-4">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div
//                     className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-yellow-600"
//                     style={{ backgroundColor: rev.avatarBg ?? "#FEF3C7" }}
//                   >
//                     {rev.initials ?? rev.name?.[0]}
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs font-bold text-gray-800">{rev.name}</span>
//                       {rev.verified && (
//                         <span className="text-[8px] font-bold text-green-700 bg-green-100 px-1.5 py-px rounded">VERIFIED</span>
//                       )}
//                     </div>
//                     <div className="text-[10px] text-gray-400 flex items-center gap-1">
//                       <MapPin size={9} /> {rev.location} · {rev.date}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex gap-0.5 mb-1">{renderStars(rev.rating)}</div>
//                 <h4 className="text-xs font-bold text-gray-800 mb-1">{rev.title}</h4>
//                 <p className="text-xs text-gray-600 leading-relaxed mb-3">{rev.text}</p>
//                 <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors">
//                   <ThumbsUp size={11} /> Helpful ({rev.helpfulCount ?? 0})
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-400">No reviews yet.</p>
//         )}
//       </div>
//     ),
//     margin: (
//       <div className="p-5">
//         <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
//           <h4 className="text-sm font-bold text-green-800 mb-3">Margin Calculator</h4>
//           <div className="grid grid-cols-2 gap-3 text-xs">
//             <div>
//               <span className="text-gray-500">Your cost</span>
//               <div className="text-gray-900 font-extrabold text-lg">{fmt(unitPrice)}</div>
//             </div>
//             <div>
//               <span className="text-gray-500">Sell at</span>
//               <div className="text-gray-900 font-extrabold text-lg">{sellingPriceRange?.value ?? "—"}</div>
//             </div>
//             <div>
//               <span className="text-gray-500">Earn per unit</span>
//               <div className="text-green-700 font-extrabold text-lg">{earnPerUnit?.value ?? earnPerUnit ?? "—"}</div>
//             </div>
//             <div>
//               <span className="text-gray-500">Margin</span>
//               <div className="text-green-700 font-extrabold text-lg">{marginPercent != null ? `${marginPercent}%+` : "—"}</div>
//             </div>
//           </div>
//         </div>
//         <p className="text-[11px] text-gray-400">
//           * Margins are estimates based on typical retail pricing. Actual margins may vary.
//         </p>
//       </div>
//     ),
//   };

//   // ── Guards ────────────────────────────────────────────────────────────────
//   if (isLoading) return <div className="bg-gray-50 min-h-screen"><Skeleton /></div>;
//   if (isError || !product) return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
//       <AlertCircle size={32} className="text-red-400" />
//       <p className="text-gray-600 text-sm text-center max-w-sm">
//         {error?.data?.message || error?.message || "Product not found."}
//       </p>
//       <div className="flex gap-3">
//         <button
//           onClick={() => canRefetch && refetch()}
//           className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
//         >
//           <RefreshCw size={14} /> Retry
//         </button>
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl"
//         >
//           <ArrowLeft size={14} /> Go Back
//         </button>
//       </div>
//     </div>
//   );

//   // ── RENDER ────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* Mobile image lightbox */}
//       {isVisible && (
//         <div
//           className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex items-end"
//           onClick={() => setIsVisible(false)}
//         >
//           <div
//             className="w-full bg-white rounded-t-3xl px-4 pt-4 pb-8 max-h-[92vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
//             <div className="flex items-center justify-between mb-4">
//               <p className="text-sm font-bold text-gray-800">{activeThumb + 1} / {images.length}</p>
//               <button
//                 onClick={() => setIsVisible(false)}
//                 className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
//               >✕</button>
//             </div>
//             <div className="w-full flex items-center justify-center bg-amber-50 rounded-2xl overflow-hidden mb-4 relative" style={{ aspectRatio: "1/1" }}>
//               {activeImg
//                 ? <img src={activeImg} loading="lazy" alt={title} className="w-full h-full object-contain p-4" onContextMenu={(e) => e.preventDefault()} />
//                 : <Package size={48} className="text-gray-300" />}
//               {images.length > 1 && (
//                 <>
//                   <button onClick={() => setActiveThumb((p) => (p - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600">‹</button>
//                   <button onClick={() => setActiveThumb((p) => (p + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600">›</button>
//                 </>
//               )}
//             </div>
//             {images.length > 1 && (
//               <div className="flex justify-center gap-1.5 mb-5">
//                 {images.map((_, i) => (
//                   <button key={i} onClick={() => setActiveThumb(i)}
//                     className={`rounded-full transition-all duration-200 ${activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"}`} />
//                 ))}
//               </div>
//             )}
//             <div className="grid grid-cols-5 gap-2">
//               {images.map((img, i) => (
//                 <button key={i} onClick={() => setActiveThumb(i)}
//                   className={`rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${activeThumb === i ? "border-yellow-400 shadow-md scale-[1.04]" : "border-gray-200"}`}>
//                   <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

//         {/* Breadcrumb */}
//         <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-5 flex-wrap">
//           <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
//           <ChevronRight size={11} />
//           {product?.category?.name && (
//             <>
//               <span
//                 className="hover:text-gray-700 cursor-pointer transition-colors"
//                 onClick={() => navigate(`/category/${product.category.slug}`)}
//               >{product.category.name}</span>
//               <ChevronRight size={11} />
//             </>
//           )}
//           <span className="text-gray-700 font-semibold">{title}</span>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-start">

//           {/* LEFT COLUMN */}
//           <div className="flex flex-col gap-5">

//             {/* Image Card */}
//             <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//               <div className="flex flex-row">

//                 {/* Thumbnail sidebar */}
//                 {images.length > 0 && (
//                   <div className="hidden lg:flex flex-col items-center gap-0 py-3 px-2 border-r border-gray-100 bg-gray-50 flex-shrink-0 w-[76px]">
//                     {images.length > 5 && (
//                       <button
//                         onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: -70, behavior: "smooth" }); }}
//                         className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
//                       >▲</button>
//                     )}
//                     <div id="thumb-list-ws" className="flex flex-col gap-2 overflow-y-auto scrollbar-hide overflow-x-hidden flex-1" style={{ maxHeight: 380 }}>
//                       {images.map((img, i) => (
//                         <button key={i} onClick={() => setActiveThumb(i)}
//                           className={`flex-shrink-0 w-[56px] h-[56px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeThumb === i ? "border-yellow-400 shadow-md scale-[1.04]" : "border-gray-200 hover:border-yellow-300"}`}>
//                           <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
//                         </button>
//                       ))}
//                     </div>
//                     {images.length > 5 && (
//                       <button
//                         onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: 70, behavior: "smooth" }); }}
//                         className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
//                       >▼</button>
//                     )}
//                   </div>
//                 )}

//                 {/* Main image + zoom */}
//                <div className="flex-1 flex flex-col">
 
//   {isMobile ? (
//     // ── MOBILE: swipeable image carousel ──────────────────────────────────
//     <>
//       <MobileImageSwiper
//         images={images}
//         activeThumb={activeThumb}
//         setActiveThumb={setActiveThumb}
//         title={title}
//         onTap={() => setIsVisible(true)}
//       />
 
//       {images.length > 1 && (
//         <div className="flex items-center justify-center gap-1.5 py-3">
//           {images.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setActiveThumb(i)}
//               className={`rounded-full transition-all duration-200 ${
//                 activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"
//               }`}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   ) : (
//     // ── DESKTOP: zoom panel (completely unchanged) ─────────────────────────
//     <>
//       <div
//         ref={containerRef}
//         className="relative w-full cursor-pointer flex items-center justify-center overflow-hidden"
//         style={{ maxHeight: 680 }}
//         onMouseEnter={() => setShowZoom(true)}
//         onMouseLeave={() => setShowZoom(false)}
//         onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
//       >
//         {activeImg
//           ? <img src={activeImg} alt={title} className="w-full h-full rounded-md object-contain p-6 sm:p-8" />
//           : <Package size={64} className="text-gray-200" />}
 
//         {showZoom && (
//           <div
//             ref={lensRef}
//             className="absolute pointer-events-none"
//             style={{
//               width: "10rem", height: "11rem",
//               transform: "translate(-50%, -50%)",
//               backgroundColor: "rgba(173, 93, 248, 0.2)",
//               backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
//               backgroundSize: "6px 6px",
//               border: "1.5px solid rgba(186, 124, 236, 0.5)",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
//             }}
//           />
//         )}
//       </div>
 
//       {images.length > 1 && (
//         <div className="lg:hidden flex items-center justify-center gap-1.5 py-3">
//           {images.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setActiveThumb(i)}
//               className={`rounded-full transition-all duration-200 ${
//                 activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"
//               }`}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   )}
 
// </div>
//               </div>
//             </div>

//             {/* Zoom panel (desktop) */}
//             {showZoom && !isMobile && activeImg && (
//               <div
//                 ref={zoomRef}
//                 className="hidden lg:block fixed left-[60%] top-[26%] z-30 w-[26rem] h-[38rem] rounded-2xl shadow-xl bg-white border border-gray-100 pointer-events-none"
//                 style={{
//                   backgroundImage: `url(${activeImg})`,
//                   backgroundRepeat: "no-repeat",
//                   backgroundSize: "250%",
//                 }}
//               />
//             )}

//             {/* Tabs Card */}
//             <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//               <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
//                 {tabs.map((tab) => (
//                   <button key={tab.key} onClick={() => setActiveTab(tab.key)}
//                     className={`flex-1 min-w-max px-4 py-3 text-xs font-bold border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? "text-gray-900 border-yellow-400" : "text-gray-400 border-transparent hover:text-gray-700"}`}>
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>
//               {tabContent[activeTab]}
//             </div>
//           </div>

//           {/* RIGHT COLUMN — Sticky */}
//           <div className="flex flex-col gap-4 lg:sticky lg:top-[74px]">

//             <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" ref={variantRef}

// >

//               {/* Title area */}
//               <div className="p-4 sm:p-5">
//                 {product?.category?.name && (
//                   <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider mb-1">
//                     {product.category.name}{product?.subcategory ? ` / ${product.subcategory}` : ""}
//                   </div>
//                 )}
//                 <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug mb-2">{title}</h1>
//                 {brand && (
//                   <p className="text-xs text-gray-400 mb-2">
//                     by <span className="text-yellow-600 font-semibold">{brand}</span>
//                   </p>
//                 )}
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="flex gap-0.5">{renderStars(rating)}</div>
//                   <span className="text-xs font-bold text-gray-800">{rating}</span>
//                   <span className="text-xs text-gray-400">({ratingCnt} reviews)</span>
//                 </div>
//                 {soldInfo > 0 && (
//                   <div className="flex items-center gap-3 text-[10px] text-gray-400">
//                     <span className="flex items-center gap-1">
//                       <TrendingUp size={10} />
//                       <span className="font-bold text-red-500">{formatCount(soldInfo)} bought</span> in past month
//                     </span>
//                     {product?.sku && <span>SKU: {product.sku}</span>}
//                   </div>
//                 )}
//               </div>

//               {/* Price area */}
//               <div className="bg-amber-50 border-t border-b border-yellow-100 px-4 sm:px-5 py-3">
//                 <div className="flex items-baseline gap-3 mb-1 flex-wrap">
//                   <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{fmt(unitPrice)}</span>
//                   {hasDisc && <span className="text-sm text-gray-400 line-through">{fmt(mrp)}</span>}
//                   {marginPercent != null && (
//                     <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
//                       {marginPercent}% margin
//                     </span>
//                   )}
//                 </div>
//               {(sellingPriceRange || earnPerUnit) && (
//   <div className="text-xs text-gray-600">

//     {sellingPriceRange && (
//       <>
//         Sell at{" "}
//         <span className="font-bold text-gray-800">
//           {typeof sellingPriceRange === "object"
//             ? sellingPriceRange?.value
//             : sellingPriceRange}
//         </span>{" "}
//       </>
//     )}

//     {earnPerUnit && (
//       <>
//         · Earn{" "}
//         <span className="font-bold text-green-700">
//           {typeof earnPerUnit === "object"
//             ? earnPerUnit?.value
//             : earnPerUnit}
//         </span>
//         /unit
//       </>
//     )}

//   </div>
// )}
//               </div>

//               {/* Volume pricing */}
//               {volumePricing.length > 0 && (
//                 <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
//                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Volume Pricing</div>
//                   <div className="space-y-1.5">
//                     {volumePricing.map((tier, i) => (
//                       <div
//                         key={i}
//                         onClick={() => setQty(tier.min)}
//                         className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors ${qty >= tier.min && qty <= tier.max ? "bg-yellow-50 border border-yellow-300" : "bg-gray-50 border border-transparent hover:border-gray-200"}`}
//                       >
//                         <span className="font-semibold text-gray-800">
//                           {tier.min}–{tier.max === 9999 ? "∞" : tier.max} units
//                           {tier.best && (
//                             <span className="ml-2 text-[8px] font-extrabold text-yellow-700 bg-yellow-100 px-1.5 py-px rounded">BEST VALUE</span>
//                           )}
//                         </span>
//                         <div className="flex items-center gap-3">
//                           <span className="font-extrabold text-gray-900">{fmt(tier.price)}</span>
//                           {tier.save > 0 && <span className="text-green-600 font-bold">Save {fmt(tier.save)}</span>}
//                           {tier.margin && <span className="text-green-700 font-bold bg-green-100 px-1.5 py-px rounded text-[9px]">{tier.margin}%</span>}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Logistics strip */}
//               <div className="grid grid-cols-3 border-b border-gray-100 text-center divide-x divide-gray-100">
//                 <div className="py-3 px-2">
//                   <Truck size={15} className="mx-auto text-yellow-500 mb-1" />
//                   <div className="text-[10px] font-bold text-gray-700">{leadTime}</div>
//                   <div className="text-[8px] text-gray-400">Delivery</div>
//                 </div>
//                 <div className="py-3 px-2">
//                   <Package size={15} className="mx-auto text-yellow-500 mb-1" />
//                   <div className="text-[10px] font-bold text-gray-700">{casePack} units</div>
//                   <div className="text-[8px] text-gray-400">Case pack</div>
//                 </div>
//                 <div className="py-3 px-2">
//                   <RotateCcw size={15} className="mx-auto text-yellow-500 mb-1" />
//                   <div className="text-[10px] font-bold text-gray-700">{returnPolicy}</div>
//                   <div className="text-[8px] text-gray-400">Returns</div>
//                 </div>
//               </div>

//               {/* Stock strip */}
//               <div className={`flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-gray-100 ${inStock ? "bg-green-50" : "bg-red-50"}`}>
//                 <div className="flex items-center gap-1.5">
//                   <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
//                   <span className={`text-xs font-bold ${inStock ? "text-green-700" : "text-red-600"}`}>
//                     {inStock ? (lowStock ? `Only ${stock} left` : "In Stock") : "Out of Stock"}
//                   </span>
//                 </div>
//                 {stock != null && inStock && (
//                   <span className="text-[10px] text-gray-400">{stock.toLocaleString("en-IN")} units available</span>
//                 )}
//               </div>

//               {/* Quantity + CTA */}
//               <div className="px-4 sm:px-5 py-4 space-y-3">

//                 {!isInCart && (
//                   <>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs font-bold text-gray-700">
//                         Quantity <span className="font-normal text-gray-400">(MOQ: {moq})</span>
//                       </span>
//                       {totalPrice != null && (
//                         <span className="text-xs font-extrabold text-gray-900">Total: {fmt(totalPrice)}</span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => setQty((q) => Math.max(moq, q - moq))}
//                         className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
//                       >−</button>
//                       <input
//                         type="number"
//                         value={qty}
//                         onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
//                         className="flex-1 h-10 text-center border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-yellow-400"
//                       />
//                       <button
//                         onClick={() => setQty((q) => q + moq)}
//                         className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
//                       >+</button>
//                     </div>
//                   </>
//                 )}

//                 {/* Variant attrs — ref lagaya hai yahan */}
//                 {attrKeys.length > 0 && (
//                   <div className="space-y-3 w-fit pt-1">
//                     {attrKeys.map((key) => (
//                       <div className="" key={key}>
//                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
//                           {key}
//                           {selectedAttrs[key] && (
//                             <span className="ml-2 normal-case font-semibold text-gray-700 tracking-normal">: {selectedAttrs[key]}</span>
//                           )}
//                         </p>
//                         <div className="flex flex-wrap gap-1.5">
//                           {getAllValues(key).map((val) => {
//                             const avail  = isAvailable(key, val);
//                             const active = selectedAttrs[key] === val;
//                             return (
//                               <button
//                                 key={val}
//                                 onClick={() => { if (!avail) return;
//   setSelectedAttrs((p) => ({
//     ...p,
//     [key]: p[key] === val ? undefined : val,
//   }));}}
//                                 disabled={!avail}
//                                 className={`px-3 py-1.5 text-xs rounded-xl border-2 font-medium transition-all duration-150 ${active ? "border-gray-900 bg-gray-900 text-white" : avail ? "border-gray-200 text-gray-700 hover:border-gray-900 bg-white" : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"}`}
//                               >{val}</button>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* ADD TO CART / QTY CONTROLS */}
//                 {inStock ? (
//                   !isInCart ? (
//                     <button
//                       onClick={handleAddToCart}
//                       disabled={localLoading.add}
//                       className="w-full bg-yellow-400 text-gray-900 py-3 rounded-xl font-extrabold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
//                     >
//                       {localLoading.add
//                         ? <Loader2 size={16} className="animate-spin" />
//                         : <ShoppingCart size={16} />}
//                       Add To Cart — {totalPrice != null ? fmt(totalPrice) : "—"}
//                     </button>
//                   ) : (
//                     <div className="flex items-center w-full border-2 border-yellow-400 rounded-xl overflow-hidden">
//                       <button
//                         onClick={handleDecrement}
//                         disabled={isProcessing || currentQty <= (moq || 1)}
//                         className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white transition disabled:opacity-40"
//                       >
//                         {localLoading.remove
//                           ? <Loader2 size={14} className="animate-spin" />
//                           : <Minus size={16} />}
//                       </button>
//                       <div className="flex-1 text-center text-sm font-extrabold text-gray-900">
//                         {localLoading.update
//                           ? <Loader2 size={14} className="animate-spin mx-auto" />
//                           : `${currentQty} in cart`}
//                       </div>
//                       <button
//                         onClick={handleIncrement}
//                         disabled={isAtMaxStock || isProcessing}
//                         className="w-12 h-12 flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-40"
//                       >
//                         {localLoading.update
//                           ? <Loader2 size={14} className="animate-spin" />
//                           : <Plus size={16} />}
//                       </button>
//                     </div>
//                   )
//                 ) : (
//                   <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-extrabold text-sm text-center">
//                     {availabilityMeta.label}
//                   </div>
//                 )}

//                 {availability?.status === "MOQ_UNMET" && (
//                   <p className={`text-xs font-semibold ${availabilityMeta.className}`}>
//                     Min qty {moq}, available {availability?.quantity ?? stock ?? 0}
//                   </p>
//                 )}

//                 <Link
//                   to="/checkout"
//                    disabled={!inStock || localLoading.add || localLoading.orderNow}
//                    onClick={async () => {
//                                 if (isInCart) { navigate("/checkout"); return; }
//                                 setL("orderNow", true);
//                                 try {
//                                   if (isLoggedIn) {
//                                     await dispatch(addToCart({
//                                       productSlug: product.slug,
//                                       variantId: variant?._id?.toString(),
//                                       quantity: 1,
//                                     })).unwrap();
//                                   } else {
//                                     dispatch(addGuestCartItem({
//                                       productId: product._id,
//                                       productSlug: product.slug,
//                                       variantId: variant?._id?.toString() || "",
//                                       quantity: 1,
//                                     }));
//                                   }
//                                   navigate("/checkout");
//                                 } catch (err) {
//                                   toast.error(err?.message || "Failed to proceed");
//                                 } finally {
//                                   setL("orderNow", false);
//                                 }
//                               }}
//                   className="w-full bg-gray-900 text-yellow-400 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
//                 >
//                  {localLoading.orderNow
//                                 ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
//                                 : "Order Now"
//                               }
//                 </Link>

//                 {/* Wishlist + Share */}
//                 <div className="flex items-center gap-2 pt-1">
//                   <button
//                     onClick={handleWishlist}
//                     disabled={localLoading.wishlist}
//                     className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${wishlisted ? "border-red-200 text-red-500 bg-red-50" : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"} disabled:opacity-50`}
//                   >
//                     {localLoading.wishlist
//                       ? <Loader2 size={14} className="animate-spin" />
//                       : <Heart size={14} className={wishlisted ? "fill-red-500 text-red-500" : ""} />}
//                     {wishlisted ? "Wishlisted" : "Wishlist"}
//                   </button>

//                   <div className="relative flex-1">
//                     <button
//                       onClick={(e) => { e.stopPropagation(); setShareOpen((v) => !v); }}
//                       className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${shareOpen ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
//                     >
//                       <Share2 size={13} /> Share
//                     </button>
//                     {shareOpen && (
//                       <div className="absolute bottom-[calc(100%+8px)] right-0 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg z-50 flex gap-3">
//                         {[
//                          { type: "whatsapp",  Icon: IoLogoWhatsapp,  cls: "bg-green-500 hover:bg-green-600",  link: "https://wa.me/message/72BTQZMTQU2AG1" },
// { type: "facebook",  Icon: IoLogoFacebook,  cls: "bg-blue-600 hover:bg-blue-700",    link: "https://www.facebook.com/share/1Eej9auTBB/" },
// { type: "instagram", Icon: IoLogoInstagram, cls: "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600", link: "https://www.instagram.com/offer_wale_baba?igsh=Mjd6aG84bXV5dmRn" },
// { type: "telegram",  Icon: FaTelegram,      cls: "bg-sky-500 hover:bg-sky-600",      link: "https://t.me/OfferWaleBabaRetail" },
//                         ].map(({ type, Icon, cls, link }) => (
//                          <button key={type} onClick={() => { window.open(link, "_blank"); setShareOpen(false); }}
//                             className={`w-9 h-9 rounded-full ${cls} text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-150 shadow-sm`}>
//                             <Icon size={16} />
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Trust strip */}
//               <div className="grid grid-cols-4 border-t border-gray-100 text-center divide-x divide-gray-100">
//                 {[
//                   { icon: Shield,    label: "Secure" },
//                   { icon: Truck,     label: "Fast Ship" },
//                   { icon: RotateCcw, label: "Easy Return" },
//                   { icon: Check,     label: "GST Invoice" },
//                 ].map((feat, i) => (
//                   <div key={i} className="py-3 px-1">
//                     <feat.icon size={13} className="mx-auto text-yellow-500 mb-1" />
//                     <div className="text-[8px] font-bold text-gray-400">{feat.label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Offers card */}
//             <div className="bg-white border border-gray-200 rounded-2xl p-4">
//               <p className="text-sm font-bold text-gray-900 mb-3">Offers</p>
//               <div className="flex flex-col divide-y divide-gray-100">
//                 {[
//                   { label: "Get Flat ₹100 OFF on orders above ₹2000", code: "100 OFB" },
//                   { label: "Get Flat ₹150 OFF on orders above ₹3000", code: "150 OFB" },
//                   { label: "Get Flat ₹50 OFF on orders above ₹1000",  code: "50 OFB" },
//                 ].map(({ label, code }) => (
//                   <div key={code} className="flex items-start justify-between py-3 gap-3">
//                     <div className="flex items-start gap-2.5">
//                       <Tag size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-xs font-medium text-gray-800">{label}</p>
//                         <p className="text-[10px] text-gray-400 mt-0.5">
//                           Use code — <span className="font-semibold text-gray-600">{code}</span>
//                         </p>
//                       </div>
//                     </div>
//                     <button className="text-xs font-semibold text-red-500 flex-shrink-0 hover:text-red-600 transition-colors">Details</button>
//                   </div>
//                 ))}
//               </div>
//               <p className="text-[10px] text-gray-400 mt-1">*Coupons can be applied at checkout</p>
//             </div>

//           {/* Product Meta */}
// {(product?.hsnCode || product?.gstRate != null) && (

//   <div className="bg-white border border-gray-200 rounded-2xl p-4">

//     <div className="flex items-center gap-2 mb-4">

//       <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center">
//         <ShieldCheck size={16} className="text-yellow-600" />
//       </div>

//       <div>
//         <h3 className="text-sm font-bold text-gray-900">
//           Product Details
//         </h3>

//         <p className="text-[11px] text-gray-400">
//           Tax & product information
//         </p>
//       </div>
//     </div>

//     <div className="space-y-3">

//       {product?.hsnCode && (
//         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">

//           <span className="text-xs text-gray-500 font-medium">
//             HSN Code
//           </span>

//           <span className="text-xs font-bold text-gray-900">
//             {product.hsnCode}
//           </span>
//         </div>
//       )}

//       {product?.gstRate != null && (
//         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">

//           <span className="text-xs text-gray-500 font-medium">
//             GST Rate
//           </span>

//           <span className="text-xs font-bold text-green-700">
//             {product.gstRate}%
//           </span>
//         </div>
//       )}

//     </div>
//   </div>
// )}

//           </div>{/* end right column */}
//         </div>{/* end grid */}
//           {/* ✅ Related Products — WholesaleProductCard replace kiya RelatedCard se */}
//             {related.length > 0 && (
//               <div className="pt-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
//                     <span className="w-1 h-5 bg-yellow-400 rounded-full" />
//                     Customers also bought
//                   </h2>
//                   <button
//                     onClick={() => navigate(`/category/${product?.category?.slug}`)}
//                     className="hidden sm:flex text-xs text-gray-400 hover:text-yellow-600 items-center gap-1 transition font-medium"
//                   >
//                     View all <ArrowRight size={13} />
//                   </button>
//                 </div>
// <div
//   className="
//     grid
//     grid-cols-2
//     md:grid-cols-3
//     lg:grid-cols-4
//     xl:grid-cols-5
//     gap-x-3
//     gap-y-5
//   "
// >                  {related.map((p, i) => (
//                     <WholesaleProductCard key={p._id || p.slug} product={p} index={i} />
//                   ))}
//                 </div>
//               </div>
//             )}
//       </div>{/* end container */}
//     </div>
//   );
// };

// export default WholesaleProductDetail;
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
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
  Loader,
} from "lucide-react";

import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/productsApi";

import {
  setCurrentProduct,
  clearCurrentProduct,
} from "../REDUX_FEATURES/REDUX_SLICES/ProductsApi/userProductsSlice";

import {
  addGuestCartItem,
  updateGuestCartItem,
  removeGuestCartItem,
  selectCartItemBySlug,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice";

import {
  addGuestItem,
  removeGuestItem,
  selectIsWishlisted,
  addToWishlist,
  removeFromWishlist,
} from "../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice";

import { toast } from "react-toastify";
import { selectIsAuthenticated } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";
import { openModal } from "../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
// BEFORE: axiosInstance not imported in wholesale
// AFTER: add these

import axiosInstance from "../../SERVICES/Wholesaleaxios"; // adjust path to match your wholesale app's folder structure
import { getProductRatingDisplay, getFallbackDistribution } from "../../utils/productRatingDisplay"; // same
import {
  resolveVariantTitle,
  resolveVariantDescription,
  resolveVariantShipping,
} from "../../utils/variantCatalogForm";
import StarRatingInput from "../Common/StarRatingInput"; // adjust path

// ✅ WholesaleProductCard import — RelatedCard replaced
import WholesaleProductCard from "../ProductCard/WholesaleProductCard";
 // ─── MobileImageSwiper ────────────────────────────────────────────────────────
// Drop-in replacement. Fix: attaches touchmove via useEffect with { passive: false }
// so e.preventDefault() works without browser warnings.
// Replace the existing MobileImageSwiper in WholesaleProductDetail.jsx with this.


const MobileImageSwiper = ({ images, activeThumb, setActiveThumb, title, onTap }) => {
  const wrapperRef   = useRef(null);
  const touchStartX  = useRef(null);
  const touchStartY  = useRef(null);
  const dragDeltaRef = useRef(0);          // live delta — no re-render during drag
  const isDragging   = useRef(false);
  const isLocked     = useRef(false);      // locked to horizontal axis
  const trackRef     = useRef(null);       // the sliding div
  const activeRef    = useRef(activeThumb);// current index accessible inside handlers
  const autoPlayTimeout = useRef(null);

  const THRESHOLD = 50;
  const onTapRef = useRef(onTap);
useEffect(() => { onTapRef.current = onTap; }, [onTap]);

  // Keep activeRef in sync with prop
  useEffect(() => { activeRef.current = activeThumb; }, [activeThumb]);
const autoPlayRef = useRef(null);
  const applyTransform = useCallback((delta = 0, animated = false) => {
  if (!trackRef.current || !wrapperRef.current) return;

  const width = wrapperRef.current.offsetWidth;
  const x = -(activeRef.current * width) + delta;

  trackRef.current.style.transition = animated
  ? "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)"
    : "none";

  trackRef.current.style.transform = `translate3d(${x}px,0,0)`;
}, []);
useEffect(() => {
  applyTransform(0, false);
}, []);

// const autoPlayRef = useRef();

useEffect(() => {
  if (images.length <= 1) return;

  const startAutoPlay = () => {
    clearInterval(autoPlayRef.current);

    autoPlayRef.current = setInterval(() => {
      if (isDragging.current) return;

      const next =
        activeRef.current >= images.length - 1
          ? 0
          : activeRef.current + 1;

      activeRef.current = next;

      setActiveThumb(next);
      requestAnimationFrame(() => {
        applyTransform(0, true);
      });
    }, 8000);
  };

  startAutoPlay();

  return () => {
    clearInterval(autoPlayRef.current);
  };
}, [images.length, applyTransform]);

  // Apply transform directly on the track (no state → no re-render during drag)

  // ── Imperative touch handlers (passive: false allows preventDefault) ────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

  const onStart = (e) => {
  clearInterval(autoPlayRef.current);

  touchStartX.current = e.touches[0].clientX;
  touchStartY.current = e.touches[0].clientY;

  dragDeltaRef.current = 0;

  isDragging.current = true;
  isLocked.current = false;

  applyTransform(0, false);
};

    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Determine axis on first movement > 8px
      if (!isLocked.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          isLocked.current = true;   // horizontal — own the gesture
        } else {
          isDragging.current = false; // vertical — release to page scroll
          return;
        }
      }

      if (isLocked.current) {
        e.preventDefault();           // ✅ works because listener is non-passive
        const idx    = activeRef.current;
        const atStart = idx === 0 && dx > 0;
        const atEnd   = idx === images.length - 1 && dx < 0;
        const delta   = atStart || atEnd ? dx * 0.25 : dx;
        dragDeltaRef.current = delta;
        applyTransform(delta, false);
      }
    };

const onEnd = () => {
  isDragging.current = false;
  isLocked.current = false;

  const dx  = dragDeltaRef.current;
  const idx = activeRef.current;
  dragDeltaRef.current = 0;

  // TAP — no meaningful drag
  if (Math.abs(dx) < 8) {
    applyTransform(0, true);
    onTapRef.current?.();   // ← change this line
    return; // ← CRITICAL: was missing, caused tap to fall into swipe logic
  }

  let next = idx;

  if (dx < -THRESHOLD) {
    next = idx >= images.length - 1 ? 0 : idx + 1;
  } else if (dx > THRESHOLD) {
    next = idx <= 0 ? images.length - 1 : idx - 1;
  } else {
    // Sub-threshold drag — snap back, don't navigate
    applyTransform(0, true);
    return; // ← snap back without changing slide
  }

  activeRef.current = next;

  requestAnimationFrame(() => {
    setActiveThumb(next);
    applyTransform(0, true);
  });

  // Resume autoplay after interaction
  setTimeout(() => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (isDragging.current) return;
      const nextIndex =
        activeRef.current >= images.length - 1
          ? 0 : activeRef.current + 1;
      activeRef.current = nextIndex;
      requestAnimationFrame(() => {
        setActiveThumb(nextIndex);
        applyTransform(0, true);
      });
    }, 3000);
  }, 2500);
};

    el.addEventListener("touchstart", onStart, { passive: true  });
    el.addEventListener("touchmove",  onMove,  { passive: false }); // ← key fix
    el.addEventListener("touchend",   onEnd,   { passive: true  });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [images.length, setActiveThumb, applyTransform]);

  // When activeThumb changes (from swipe or dot tap), animate track to new position
useEffect(() => {
  activeRef.current = activeThumb;

  setTimeout(() => {
    applyTransform(0, true);
  }, 0);
}, [activeThumb, applyTransform]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden select-none"
      style={{ aspectRatio: "1 / 1", touchAction: "pan-y" }}
    >
      {/* Slide track — transformed imperatively, not via state */}
      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          width: `${images.length * 100}%`,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center bg-white"
            style={{ width: `${100 / images.length}%`, height: "100%" }}
          >
            {img?.url
              ? <img
                  src={img.url}
                  alt={`${title} ${i + 1}`}
                  className="w-full h-full object-contain p-5"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              : <Package size={48} className="text-gray-200" />
            }
          </div>
        ))}
      </div>

      {/* Counter badge */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
          {activeThumb + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

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
  if (count < 100) {
    return `${count}+`;
  }

  if (count < 1000) {
    return `${Math.floor(count / 100) * 100}+`;
  }

  if (count < 10000) {
    return `${Math.floor(count / 1000)}K+`;
  }

  return `${Math.floor(count / 1000)}K+`;
}


const formatPrice = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
};

const formatCouponLabel = (coupon) => {
  if (!coupon) return "";
  const code = String(coupon.code || "").trim().toUpperCase();
  const minOrderValue = Number(coupon.minOrderValue || 0);
  const discountValue = Number(coupon.discountValue || 0);
  const discountType = String(coupon.discountType || "").trim().toLowerCase();
  if (!code) return "";
  if (discountType === "percentage") {
    const base = `Use ${code} on ₹${formatPrice(minOrderValue)}+ for ${discountValue}% OFF`;
    return coupon.maxDiscountAmount ? `${base} (up to ₹${formatPrice(coupon.maxDiscountAmount)})` : base;
  }
  if (minOrderValue > 0) return `Use ${code} on ₹${formatPrice(minOrderValue)}+ for ₹${formatPrice(discountValue)} OFF`;
  return `Use ${code} for ₹${formatPrice(discountValue)} OFF`;
};

// ── From V1: full availability meta with MOQ_UNMET / NOT_LISTED support ───────
const getAvailabilityMeta = (availability) => {
  const status = availability?.status || "IN_STOCK";
  if (status === "OUT_OF_STOCK") return { label: "Out of stock", className: "text-red-600" };
  if (status === "MOQ_UNMET")    return { label: "MOQ not met",  className: "text-amber-600" };
  if (status === "NOT_LISTED")   return { label: "Not available", className: "text-gray-500" };
  return { label: "In stock", className: "text-green-700" };
};

// BEFORE: no helper, rating derived inline with fragile nested ternary
// AFTER: reusable helper matching retail's logic exactly

const getProductRating = (product) => {
  const r = product?.rating;
  if (!r) return null;
  if (typeof r === "number") return r;
  if (typeof r === "object" && r.value != null) return Number(r.value);
  return null;
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

// ─── Main WholesaleProductDetail ──────────────────────────────────────────────


const WholesaleProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
//   const wrapperRef = useRef(null);
// const trackRef = useRef(null);
// const autoPlayRef = useRef();

const {
  data: product,
  isLoading,
  isError,
  error,
  refetch,
  status,
  } = useGetProductBySlugQuery(slug, { skip: !slug });
  const handleMouseMove = (e) => {
  updatePosition(e.clientX, e.clientY);
};
  

  const canRefetch = status !== "uninitialized";
  
  const { data: related = [] } = useGetRelatedProductsQuery(
    { slug, limit: 5 },
    { skip: !slug || !product }
  );
  
  const wishlisted      = useSelector(selectIsWishlisted(product?.slug));
  const cartItem        = useSelector(selectCartItemBySlug(product?.slug));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInCart        = !!cartItem;
  const currentQty      = cartItem?.quantity ?? 0;
  const variantRef = useRef(null);
  
  const [activeThumb, setActiveThumb] = useState(0);
  // const activeRef = useRef(activeThumb);
  const desktopWrapperRef = useRef(null);
const desktopTrackRef = useRef(null);
const desktopAutoPlayRef = useRef(null);
const desktopActiveRef = useRef(activeThumb);
const showZoomRef = useRef(false);
const isHoveredRef = useRef(false);
const desktopDragging = useRef(false);
const activeImgRef = useRef(null);

const applyDesktopTransform = useCallback(
  (delta = 0, animated = false) => {
    if (!desktopTrackRef.current || !desktopWrapperRef.current) return;

    const width = desktopWrapperRef.current.offsetWidth;

    const x = -(desktopActiveRef.current * width) + delta;

    desktopTrackRef.current.style.transition = animated
      ? "transform 0.22s cubic-bezier(0.22,1,0.36,1)"
      : "none";

    desktopTrackRef.current.style.transform =
      `translate3d(${x}px,0,0)`;
  },
  []
);

useEffect(() => {
  desktopActiveRef.current = activeThumb;

  requestAnimationFrame(() => {
    applyDesktopTransform(0, true);
  });
}, [activeThumb, applyDesktopTransform]);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [activeTab, setActiveTab]     = useState("desc");
  const [openDesc, setOpenDesc]       = useState(false);
  const [shareOpen, setShareOpen]     = useState(false);
  const [showZoom, setShowZoom]       = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [isVisible, setIsVisible]     = useState(false);
  const [qty, setQty]                 = useState(1);
  // BEFORE: none of these exist in wholesale
// AFTER: add these alongside existing useState declarations

const [reviewSummary, setReviewSummary] = useState(null);
const [reviewsList, setReviewsList] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [myReview, setMyReview] = useState(null);
const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const [showReviewComment, setShowReviewComment] = useState(false);
const [visibleCount, setVisibleCount] = useState(3);
const [filterStar, setFilterStar] = useState(null);
const [publicCoupons, setPublicCoupons] = useState([]);
const [couponsLoading, setCouponsLoading] = useState(false);
const [copiedCouponCode, setCopiedCouponCode] = useState("");
const copyResetTimeoutRef = useRef(null);
  const volumetricWeight =
  product?.shipping?.dimensions?.length &&
  product?.shipping?.dimensions?.width &&
  product?.shipping?.dimensions?.height
    ? (
        (
          product.shipping.dimensions.length *
          product.shipping.dimensions.width *
          product.shipping.dimensions.height
        ) / 5000
      ).toFixed(2)
    : null;
  const [localLoading, setLocalLoading] = useState({
    add: false, update: false, remove: false, wishlist: false,  orderNow: false,
  });
  const isLoggedIn  = useSelector(selectIsAuthenticated)
  const setL         = (key, val) => setLocalLoading((p) => ({ ...p, [key]: val }));
  const isProcessing = localLoading.add || localLoading.update || localLoading.remove;
  const containerRef = useRef(null);
  const lensRef      = useRef(null);
  const zoomRef      = useRef(null);
  const rafRef       = useRef(null);
  const targetRef    = useRef({ x: 0.5, y: 0.5 });
  const currentRef   = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (product) dispatch(setCurrentProduct(product));
    return () => dispatch(clearCurrentProduct());
  }, [product, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveThumb(0);
    setSelectedAttrs({});
    setActiveTab("desc");
  }, [slug]);
  useEffect(() => {
  return () => {
    if (copyResetTimeoutRef.current) clearTimeout(copyResetTimeoutRef.current);
  };
}, []);
  // BEFORE: no review fetching in wholesale
// AFTER: add all three

// Fetch public review summary + list
useEffect(() => {
  const productId = product?._id;
  if (!productId) {
    setReviewSummary(null);
    setReviewsList([]);
    setMyReview(null);
    setShowReviewComment(false);
    return undefined;
  }
  setShowReviewComment(false);
  let cancelled = false;
  (async () => {
    setReviewsLoading(true);
    try {
      const pid = String(productId);
      const [sumRes, listRes] = await Promise.all([
        axiosInstance.get(`/product-reviews/public/${pid}/summary`),
        axiosInstance.get(`/product-reviews/public/${pid}`, { params: { limit: 50 } }),
      ]);
      if (cancelled) return;
      setReviewSummary(sumRes.data?.summary ?? null);
      setReviewsList(Array.isArray(listRes.data?.reviews) ? listRes.data.reviews : []);
    } catch (err) {
      if (!cancelled) { setReviewSummary(null); setReviewsList([]); }
    } finally {
      if (!cancelled) setReviewsLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [product?._id]);

// Fetch logged-in user's own review
useEffect(() => {
  const productId = product?._id;
  if (!productId || !isAuthenticated) {
    if (!isAuthenticated) { setMyReview(null); setShowReviewComment(false); }
    return undefined;
  }
  let cancelled = false;
  (async () => {
    try {
      const res = await axiosInstance.get(`/product-reviews/mine/${String(productId)}`);
      if (!cancelled) {
        const r = res.data?.review;
        setMyReview(r || null);
        setReviewForm(r ? { rating: r.rating, comment: r.comment || "" } : { rating: 5, comment: "" });
      }
    } catch (err) {
      if (!cancelled) setMyReview(null);
    }
  })();
  return () => { cancelled = true; };
}, [product?._id, isAuthenticated]);

 useEffect(() => {
  const check = () => {
    const val = "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    setIsMobile(val);
  };
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  useEffect(() => {
    const close = () => setShareOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  useEffect(() => {
  let cancelled = false;
  const loadPublicCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await axiosInstance.get("/public/coupons");
      const coupons = Array.isArray(res?.data?.coupons) ? res.data.coupons : [];
      if (!cancelled) setPublicCoupons(coupons);
    } catch (err) {
      if (!cancelled) setPublicCoupons([]);
    } finally {
      if (!cancelled) setCouponsLoading(false);
    }
  };
  loadPublicCoupons();
  return () => { cancelled = true; };
}, []);

useEffect(() => {
  const animate = () => {
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;

    const { x, y } = currentRef.current;

    if (lensRef.current) {
      lensRef.current.style.left = `${x * 100}%`;
      lensRef.current.style.top = `${y * 100}%`;
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

  // ── Variant logic (ecom parity) ───────────────────────────────────────────
  // API already returns storefront-listed variants; do not re-filter by legacy isActive.
  const listedVariants = useMemo(
    () => (product?.variants ?? []).filter(Boolean),
    [product?.variants]
  );
  // Alias kept so existing references below still compile during edit; prefer listedVariants.
  const activeVariants = listedVariants;
  console.log("productvariant", product?.variants);

  const topCoupons = useMemo(() => {
  return (Array.isArray(publicCoupons) ? publicCoupons : [])
    .map((coupon) => ({ ...coupon, label: formatCouponLabel(coupon) }))
    .filter((coupon) => coupon.label)
    .slice(0, 3);
}, [publicCoupons]);

  const attrKeys = useMemo(() => {
    const s = new Set();
    listedVariants.forEach((v) => v.attributes?.forEach((a) => s.add(a.key)));
    return [...s];
  }, [listedVariants]);

  const getAllValues = useCallback(
    (key) => {
      const s = new Set();
      listedVariants.forEach((v) =>
        v.attributes?.filter((a) => a.key === key).forEach((a) => s.add(a.value))
      );
      return [...s];
    },
    [listedVariants]
  );
  // BEFORE: no review submit handler in wholesale
// AFTER: add this

const submitProductReview = async (e) => {
  e.preventDefault();
  if (!product?._id || !isAuthenticated) {
    toast.info("Please log in to write a review");
    return;
  }
  setReviewSubmitting(true);
  try {
    const body = {
      productId: String(product._id),
      rating: Number(reviewForm.rating),
      comment: String(reviewForm.comment || "").trim(),
    };
    if (myReview?._id) {
      await axiosInstance.put(`/product-reviews/${myReview._id}`, body);
      toast.success("Review updated");
    } else {
      await axiosInstance.post("/product-reviews", body);
      toast.success("Thanks! Your review will appear after moderation.");
    }
    const pid = String(product._id);
    const [sumRes, listRes, mineRes] = await Promise.all([
      axiosInstance.get(`/product-reviews/public/${pid}/summary`),
      axiosInstance.get(`/product-reviews/public/${pid}`, { params: { limit: 50 } }),
      axiosInstance.get(`/product-reviews/mine/${pid}`),
    ]);
    setReviewSummary(sumRes.data?.summary ?? null);
    setReviewsList(Array.isArray(listRes.data?.reviews) ? listRes.data.reviews : []);
    const r = mineRes.data?.review;
    setMyReview(r || null);
    if (r) setReviewForm({ rating: r.rating, comment: r.comment || "" });
    setShowReviewComment(false);
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || "Could not save review");
  } finally {
    setReviewSubmitting(false);
  }
};

  const isAvailable = useCallback(
    (key, value) =>
      listedVariants.some((v) => v.attributes?.some((a) => a.key === key && a.value === value)),
    [listedVariants]
  );

  const useFlatVariantPicker = true;

  const variantKey = (v) => {
    if (!v) return "";
    if (v._id != null) return `id:${String(v._id)}`;
    if (v.productCode != null && v.productCode !== "") return `code:${String(v.productCode)}`;
    return "";
  };

  const isSameVariant = (a, b) => {
    const ka = variantKey(a);
    const kb = variantKey(b);
    return Boolean(ka && kb && ka === kb);
  };

  const variantSelectOptions = useMemo(() => {
    if (!listedVariants.length) return [];

    const attrsToMap = (attrs) =>
      Object.fromEntries(
        (attrs || [])
          .filter((a) => a?.key)
          .map((a) => [a.key, a.value])
      );

    // Single-key shortcut ONLY if EVERY variant has that key.
    // Primary 0990-1 has attributes:[] → must NOT collapse to only "var2".
    const singleKey = attrKeys.length === 1 ? attrKeys[0] : null;
    const allHaveSingleKey =
      Boolean(singleKey) &&
      listedVariants.every((v) =>
        (v.attributes || []).some((a) => a.key === singleKey)
      );

    if (allHaveSingleKey) {
      return getAllValues(singleKey).map((val) => {
        const variant =
          listedVariants.find((v) =>
            v.attributes?.some((a) => a.key === singleKey && a.value === val)
          ) || null;
        return {
          id: `${singleKey}:${val}`,
          label: val,
          attrs: { [singleKey]: val },
          variant,
        };
      });
    }

    // One chip per variant
    return listedVariants.map((v, i) => {
      const variantAttrs = Array.isArray(v.attributes) ? v.attributes : [];
      const primaryAttr = variantAttrs.find(
        (a) => a?.key && a?.value != null && String(a.value).trim() !== ""
      );
      const productPrimary = (product?.attributes || []).find(
        (a) => a?.key && a?.value != null && String(a.value).trim() !== ""
      );
      const label =
        primaryAttr?.value ||
        (variantAttrs.length === 0 ? productPrimary?.value : null) ||
        String(v.productCode || `Variant ${i + 1}`);

      const attrs =
        variantAttrs.length > 0
          ? attrsToMap(variantAttrs)
          : attrsToMap(product?.attributes);

      return {
        id: variantKey(v) || `idx-${i}`,
        label,
        attrs,
        variant: v,
      };
    });
  }, [listedVariants, attrKeys, getAllValues, product]);

  const selectedVariant = useMemo(() => {
    if (!listedVariants.length) return null;

    const activeEntries = Object.entries(selectedAttrs).filter(
      ([, val]) => val != null && val !== ""
    );
    if (!activeEntries.length) return listedVariants[0];

    const exact = listedVariants.find((v) => {
      const attrs = (v.attributes || []).filter((a) => a?.key);
      if (!attrs.length) return false;
      return activeEntries.every(([k, val]) =>
        attrs.some((a) => a.key === k && a.value === val)
      );
    });
    if (exact) return exact;

    // Primary has empty attributes[] — product-level attrs belong to primary
    const primary = listedVariants[0];
    const primaryEmpty = !(primary.attributes || []).some((a) => a?.key);
    if (primaryEmpty && product?.attributes?.length) {
      const productMatch = activeEntries.every(([k, val]) =>
        product.attributes.some((a) => a.key === k && a.value === val)
      );
      if (productMatch) return primary;
    }

    let best = listedVariants[0];
    let bestScore = -1;
    listedVariants.forEach((v) => {
      const score = activeEntries.filter(([k, val]) =>
        v.attributes?.some((a) => a.key === k && a.value === val)
      ).length;
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    });
    return best;
  }, [listedVariants, selectedAttrs, product]);

  const productCode = selectedVariant?.productCode || listedVariants[0]?.productCode || "";

  // Always seed primary variant attributes on product / variant list load (ecom)
  useEffect(() => {
    if (!listedVariants.length) return;
    const primary = listedVariants[0];
    const init = {};
    const sourceAttrs =
      primary.attributes?.length > 0
        ? primary.attributes
        : product?.attributes || [];
    sourceAttrs.forEach((a) => {
      if (a?.key) init[a.key] = a.value;
    });
    setSelectedAttrs(init);
    setActiveThumb(0);
  }, [product?._id, product?.slug, listedVariants]);

  useEffect(() => {
    setActiveThumb(0);
  }, [selectedVariant?._id, selectedVariant?.productCode]);

  const handleAttrSelect = (key, value) => {
    if (selectedAttrs[key] === value) return;
    const matched = listedVariants.find((v) =>
      v.attributes?.some((a) => a.key === key && a.value === value)
    );
    if (matched) {
      const next = {};
      matched.attributes?.forEach((a) => {
        if (a?.key) next[a.key] = a.value;
      });
      setSelectedAttrs(next);
    } else {
      setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
    }
    setActiveThumb(0);
  };

  const handleVariantOptionSelect = (option) => {
    if (!option?.variant) return;
    if (isSameVariant(selectedVariant, option.variant)) return;
    setSelectedAttrs(option.attrs || {});
    setActiveThumb(0);
  };

  // ── Outside click → reset variant ────────────────────────────────────────
  // useEffect(() => {
  //   // const handleOutsideClick = (e) => {
  //   //   if (variantRef.current && !variantRef.current.contains(e.target)) {
  //   //     if (!activeVariants.length) return;
  //   //     const init = {};
  //   //     activeVariants[0].attributes?.forEach((a) => { init[a.key] = a.value; });
  //   //     setSelectedAttrs(init);
  //   //     setActiveThumb(0);
  //   //   }
  //   // };
  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => document.removeEventListener("mousedown", handleOutsideClick);
  // }, [activeVariants]);

  // ── Derived values ─────────────────────────────────────────────────────────
const images = Array.isArray(selectedVariant?.images)
  ? selectedVariant.images
  : [];  // Desktop autoplay — arrows only, no drag
// Desktop autoplay — arrows only, no drag

// ── Autoplay useEffect — single source of truth ──────────────────────────
// Yeh ref restartAutoPlay function store karega
// FIND the entire autoplay useEffect and REPLACE with this:
useEffect(() => {
  if (isMobile || images.length <= 1) return;

  const tick = () => {
    if (isHoveredRef.current) return;  // pause on hover

    const next =
      desktopActiveRef.current >= images.length - 1
        ? 0
        : desktopActiveRef.current + 1;

    desktopActiveRef.current = next;
    setActiveThumb(next);
    requestAnimationFrame(() => applyDesktopTransform(0, true));
  };

  desktopAutoPlayRef.current = setInterval(tick, 3000);

  return () => clearInterval(desktopAutoPlayRef.current);
}, [images.length, isMobile]);  // NO applyDesktopTransform in deps

  useEffect(() => {
  if (!images.length) return;

  setActiveThumb((prev) => {
    if (prev >= images.length) return 0;
    return prev;
  });
}, [images]);
const safeIndex =
  activeThumb >= images.length ? 0 : activeThumb;

const actualActiveImg =
  images[safeIndex]?.url ||
  images[0]?.url ||
  product?.image ||
  null;

// const activeImg = showZoom
//   ? activeImgRef.current || actualActiveImg
//   : actualActiveImg;
// TO THIS:
const activeImg = actualActiveImg;

// Sync to ref immediately
  const variant = selectedVariant || {};

  const wholesalePrice = selectedVariant?.finalPrice ?? selectedVariant?.price?.sale ?? product?.wholesalePrice ?? null;
  const mrp            = selectedVariant?.price?.base ?? product?.mrp ?? null;
  const hasDisc        = mrp != null && wholesalePrice != null && mrp > wholesalePrice;
  const discPct        = hasDisc ? Math.round(((mrp - wholesalePrice) / mrp) * 100) : null;
  const marginPercent  = product?.marginPercent ?? (hasDisc ? discPct : null);

  const maxStock = selectedVariant?.inventory?.trackInventory
    ? (selectedVariant?.inventory?.quantity ?? 0)
    : Infinity;
  const stock    = selectedVariant?.inventory?.quantity ?? product?.stock ?? null;

  const availability     = selectedVariant?.availability || null;
  const availabilityMeta = getAvailabilityMeta(availability);
  const fallbackInStock  = product?.inStock ?? (maxStock === Infinity || maxStock > 0);
  const inStock          = availability?.purchasable ?? fallbackInStock;
  const lowStock         = stock != null && stock > 0 && stock <= 10;
  const isAtMaxStock     = currentQty >= maxStock && maxStock !== Infinity;

  const moq           = selectedVariant?.minimumOrderQuantity
    ?? selectedVariant?.price?.minimumOrderQuantity
    ?? product?.moq
    ?? 1;
  const casePack      = product?.casePack ?? 1;
  const leadTime      = product?.leadTime ?? "3–5 days";
  const returnPolicy  = product?.returnPolicy ?? "7 days";
  const title = resolveVariantTitle(selectedVariant, product);
  const desc = resolveVariantDescription(selectedVariant, product);
  const displayShipping = useMemo(
    () => resolveVariantShipping(selectedVariant, product),
    [selectedVariant, product]
  );
  const displayAttributes = useMemo(() => {
    const variantAttrs = Array.isArray(selectedVariant?.attributes)
      ? selectedVariant.attributes
      : [];
    if (variantAttrs.length > 0) return variantAttrs;
    return Array.isArray(product?.attributes) ? product.attributes : [];
  }, [selectedVariant, product]);

  const volumetricWeightFromDisplay = useMemo(() => {
    const d = displayShipping?.dimensions;
    if (!d?.length || !d?.width || !d?.height) return null;
    return ((Number(d.length) * Number(d.width) * Number(d.height)) / 5000).toFixed(2);
  }, [displayShipping]);

  // const rating        = product?.rating?.value ?? product?.rating ?? 4.5;
 // AFTER:
const rating = getProductRating(product) ?? 4.5;
const ratingCnt = product?.rating?.count ?? product?.reviewCount ?? 0;
  const soldInfo      = product?.soldInfo?.count ?? product?.soldCount ?? 0;
  const brand         = product?.brand ?? null;
  const sellingPriceRange = product?.sellingPriceRange ?? null;
  const earnPerUnit   = product?.earnPerUnit ?? null;
  const volumePricing = product?.volumePricing ?? [];

// AFTER — same placement, but add a safety guard on ratingDisplay:
const currentTier = volumePricing.find((t) => qty >= t.min && qty <= t.max) || volumePricing[0];
const unitPrice   = currentTier?.price ?? wholesalePrice;
const totalPrice  = unitPrice != null ? unitPrice * qty : null;

const ratingDisplay = useMemo(
  () => getProductRatingDisplay(product, reviewSummary),
  [product, reviewSummary]
);
const displayAvg = ratingDisplay?.average ?? 0;
const displayCount = ratingDisplay?.count ?? 0;
const ratingIsPlaceholder = ratingDisplay?.isPlaceholder ?? true;

useEffect(() => {
  setQty(moq || 1);
}, [moq]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const buildGuestCartPayload = (quantity) => ({
    productId:          product._id,
    productSlug:        product.slug,
    variantId:          variant?._id?.toString() || "",
    quantity,
    moq:                moq || 1,
    wholesalePrice:     selectedVariant?.price?.wholesaleSale ?? selectedVariant?.price?.wholesaleBase ?? selectedVariant?.price?.sale ?? wholesalePrice ?? null,
    wholesaleBasePrice: selectedVariant?.price?.wholesaleBase ?? selectedVariant?.price?.base ?? mrp ?? null,
    productName:        title,
    image:              selectedVariant?.images?.[0]?.url ?? product?.image ?? null,
    variantLabel:       selectedVariant?.attributes?.map((a) => `${a.key}: ${a.value}`).join(", ") || null,
    discountPercentage: discPct ?? 0,
  });

  const buildGuestWishlistPayload = () => ({
    productSlug:        product.slug,
    productId:          product._id,
    variantId:          variant?._id?.toString() || "",
    productName:        title,
    image:              selectedVariant?.images?.[0]?.url ?? product?.image ?? null,
    brand:              brand ?? null,
    wholesalePrice:     selectedVariant?.price?.wholesaleSale ?? selectedVariant?.price?.wholesaleBase ?? selectedVariant?.price?.sale ?? wholesalePrice ?? null,
    wholesaleBasePrice: selectedVariant?.price?.wholesaleBase ?? selectedVariant?.price?.base ?? mrp ?? null,
    variantLabel:       selectedVariant?.attributes?.map((a) => `${a.key}: ${a.value}`).join(", ") || null,
    moq:                moq || 1,
    discountPercentage: discPct ?? 0,
  });

  const handleOrderNow = async () => {
    if (!inStock || !product?.slug) return;

    if (!isAuthenticated) {
      dispatch(openModal("login"));
      return;
    }

    setL("orderNow", true);
    try {
      if (!isInCart) {
        await dispatch(addToCart({
          productSlug: product.slug,
          productId:   product._id,
          variantId:   variant?._id?.toString() || "",
          quantity:    moq || 1,
        })).unwrap();
      }
      navigate("/checkout");
    } catch (err) {
      toast.error(err?.message || "Failed to proceed");
    } finally {
      setL("orderNow", false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!product?.slug || localLoading.wishlist) return;
    setL("wishlist", true);
    try {
      if (isAuthenticated) {
        if (wishlisted) {
          await dispatch(removeFromWishlist({ productSlug: product.slug })).unwrap();
          toast.success("Removed from wishlist", { icon: "💔" });
        } else {
          await dispatch(addToWishlist({
            productSlug: product.slug,
            variantId:   variant?._id?.toString() || "",
          })).unwrap();
          toast.success("Saved to wishlist", { icon: "❤️" });
        }
      } else {
        if (wishlisted) {
          dispatch(removeGuestItem(product.slug));
          toast.success("Removed", { icon: "💔" });
        } else {
          dispatch(addGuestItem(buildGuestWishlistPayload()));
          toast.success("Saved to wishlist", { icon: "❤️" });
        }
      }
    } catch (err) {
      toast.error(err?.message || "Wishlist action failed");
    } finally {
      setL("wishlist", false);
    }
  };
  const handleCopyCouponCode = useCallback(async (couponCode) => {
  const code = String(couponCode || "").trim().toUpperCase();
  if (!code) return;
  try {
    await navigator.clipboard?.writeText(code);
    setCopiedCouponCode(code);
    if (copyResetTimeoutRef.current) clearTimeout(copyResetTimeoutRef.current);
    copyResetTimeoutRef.current = setTimeout(() => setCopiedCouponCode(""), 1000);
    toast.success(`Copied ${code}`);
  } catch(err) {
    toast.error("Unable to copy code");
    console.log("error", err);
    
  }
}, []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!inStock) {
      if (availability?.status === "MOQ_UNMET") {
        toast.warning(`MOQ not met: Min qty ${moq}, available ${availability?.quantity ?? stock ?? 0}`);
      }
      return;
    }
    if (isInCart || isProcessing || !product?.slug) return;
    setL("add", true);
    try {
      if (isAuthenticated) {
        await dispatch(addToCart({
          productSlug: product.slug,
          productId:   product._id,
          variantId:   variant?._id?.toString() || "",
          quantity:    moq || 1,
        })).unwrap();
      } else {
        dispatch(addGuestCartItem(buildGuestCartPayload(moq || 1)));
      }
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setL("add", false);
    }
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    if (isAtMaxStock) { toast.warning(`Max stock: ${maxStock}`); return; }
    if (isProcessing) return;
    setL("update", true);
    try {
      if (isAuthenticated) {
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

  const handleDecrement = async (e) => {
    e.stopPropagation();
    if (isProcessing) return;
    const newQty = currentQty - 1;
    try {
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
    const url     = window.location.href;
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

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "desc",    label: "Description" },
    { key: "specs",   label: "Specifications" },
    { key: "reviews", label: `Reviews (${displayCount})` },
  ];

  const tabContent = {
    desc: (
      <div className="p-5 text-sm text-gray-600 leading-relaxed space-y-4">
        {(desc?.trim() || title) && (
          <>
            <p className="font-bold text-gray-800">{title}</p>
            {desc?.trim() && <p>{desc}</p>}
          </>
        )}
        {product?.bulletPoints?.length > 0 && (
          <ul className="space-y-2">
            {product.bulletPoints.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Check size={13} className="text-green-600 shrink-0 mt-0.5" /> {bp}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
   specs: (
  <div className="p-5">
    {/* Highlights — selected variant attributes (ecom parity) */}
    {displayAttributes.some((a) => a?.key && a?.value) && (
      <div className="mb-5">
        <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Highlights</p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
          {displayAttributes
            .filter((a) => a?.key && a?.value)
            .map((attr, i) => (
              <li key={`${attr.key}-${i}`}>
                <span className="font-medium">{attr.key}:</span> {attr.value}
              </li>
            ))}
        </ul>
      </div>
    )}

    {/* Dimensions — selected variant shipping with product fallback */}
    {displayShipping && (
      <div>
        <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Dimensions & Weight</p>
        <table className="w-full text-xs">
          <tbody>
            {[
              { label: "Weight", value: displayShipping.weight ? `${displayShipping.weight} kg` : null },
              { label: "Length", value: displayShipping.dimensions?.length ? `${displayShipping.dimensions.length} cm` : null },
              { label: "Width",  value: displayShipping.dimensions?.width  ? `${displayShipping.dimensions.width} cm`  : null },
              { label: "Height", value: displayShipping.dimensions?.height ? `${displayShipping.dimensions.height} cm` : null },
              { label: "Volumetric Weight", value: volumetricWeightFromDisplay ? `${volumetricWeightFromDisplay} kg` : null },
            ]
              .filter((row) => row.value)
              .map((row, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-bold text-gray-800 w-[35%]">{row.label}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
),
  reviews: (
  <div className="p-5">
    {(() => {
      const totalReviews = reviewsList.length;
      const starCounts = ratingIsPlaceholder
        ? getFallbackDistribution(product).map(({ star, pct }) => ({ star, count: 0, pct }))
        : [5, 4, 3, 2, 1].map((star) => {
            const count = reviewsList.filter((r) => Math.round(r.rating) === star).length;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return { star, count, pct };
          });
      const filteredReviews = filterStar
        ? reviewsList.filter((r) => Math.round(r.rating) === filterStar)
        : reviewsList;
      const visibleReviews = filteredReviews.slice(0, visibleCount);

      return (
        <div className="flex flex-col gap-5">

          {/* Rating summary */}
          {reviewsLoading ? (
            <p className="text-sm text-gray-500 py-2">Loading reviews…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(displayAvg).toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      className={s <= Math.round(Number(displayAvg))
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {ratingIsPlaceholder
                    ? `${displayCount} ratings`
                    : `${displayCount} published ${displayCount === 1 ? "review" : "reviews"}`}
                </span>
              </div>

              {/* Star bars */}
              <div className="space-y-1.5">
                {starCounts.map(({ star, pct }) => {
                  const isActive = filterStar === star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => { setFilterStar(filterStar === star ? null : star); setVisibleCount(3); }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 py-1 rounded-lg transition-colors text-sm cursor-pointer ${isActive ? "bg-amber-50" : "hover:bg-gray-50"}`}
                    >
                      <span className="w-12 sm:w-14 text-left text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0">
                        {star} star
                      </span>
                      <div className="flex-1 h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-amber-500" : "bg-amber-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-gray-500 flex-shrink-0">{pct}%</span>
                    </button>
                  );
                })}
              </div>

              {filterStar !== null && (
                <button
                  type="button"
                  onClick={() => { setFilterStar(null); setVisibleCount(3); }}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  × Clear filter
                </button>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-gray-500">
                  <button type="button" className="text-red-600 font-bold hover:underline">
                    Log in
                  </button>{" "}
                  to leave a review
                </p>
              )}
            </>
          )}

          {/* Your review form */}
          {isAuthenticated && !reviewsLoading && (
            <form
              onSubmit={submitProductReview}
              className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 sm:p-4 space-y-3"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {myReview?._id ? "Your review" : "Rate this product"}
              </p>
              <StarRatingInput
                value={reviewForm.rating}
                onChange={(n) => setReviewForm((f) => ({ ...f, rating: n }))}
                disabled={reviewSubmitting}
                size={30}
              />
              {!showReviewComment ? (
                <button
                  type="button"
                  onClick={() => setShowReviewComment(true)}
                  className="text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:underline cursor-pointer"
                >
                  Write a comment <span className="font-normal text-gray-500">(optional)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Comment (optional)</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    maxLength={2000}
                    placeholder="Share your thoughts about this product…"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-300 transition"
                  />
                  <button
                    type="button"
                    disabled={reviewSubmitting}
                    onClick={() => setShowReviewComment(false)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Hide comment
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={reviewSubmitting || reviewForm.rating === 0}
                className="text-sm font-semibold px-5 py-2 rounded-lg transition cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                {reviewSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </span>
                ) : myReview?._id ? "Update review" : "Submit review"}
              </button>
            </form>
          )}

          {/* Published reviews list */}
          {!reviewsLoading && (
            reviewsList.length === 0 ? (
              <p className="text-sm text-gray-500">No published reviews yet.</p>
            ) : filteredReviews.length === 0 && filterStar !== null ? (
              <p className="text-sm text-gray-500">No reviews with {filterStar} stars.</p>
            ) : (
              <>
                <ul className="space-y-3 sm:space-y-4">
                  {visibleReviews.map((r) => (
                    <li key={r._id} className="border border-gray-100 rounded-xl p-3 sm:p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-zinc-700 uppercase">
                            {typeof r.author === "string" && r.author.length > 0 ? r.author.charAt(0) : "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">{r.author}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-1.5">
                            {Array.from({ length: Math.round(r.rating) }).map((_, i) => (
                              <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                          {r.comment ? (
                            <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No comment left</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {visibleCount < filteredReviews.length && (
                  <div className="flex flex-col items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 3)}
                      className="border border-zinc-200 rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-zinc-300 transition cursor-pointer"
                    >
                      Load more reviews
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Showing {Math.min(visibleCount, filteredReviews.length)} of {filteredReviews.length} reviews
                    </p>
                  </div>
                )}
              </>
            )
          )}

        </div>
      );
    })()}
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
              <div className="text-gray-900 font-extrabold text-lg">{sellingPriceRange?.value ?? "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Earn per unit</span>
              <div className="text-green-700 font-extrabold text-lg">{earnPerUnit?.value ?? earnPerUnit ?? "—"}</div>
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
   <>
    <div className="min-h-screen bg-gray-50">

      {/* Mobile image lightbox */}
      {/* {isVisible && (
      )} */}

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
          {/* <span className="text-gray-700 font-semibold">{title}</span> */}
        </nav>

<div className="relative grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-start">

  {/* ══ LEFT COLUMN — desktop only ══ */}
  <div className="flex flex-col gap-5 order-2 lg:order-1 relative">

    {/* Desktop Image Card — mobile pe hidden */}
    <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex flex-row">

        {/* Thumbnail sidebar */}
        {images.length > 0 && (
          <div className="hidden lg:flex flex-col items-center gap-0 py-3 px-2 border-r border-gray-100 bg-gray-50 flex-shrink-0 w-[76px]">
            {images.length > 5 && (
              <button onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: -70, behavior: "smooth" }); }}
                className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0">▲</button>
            )}
            <div id="thumb-list-ws" className="flex flex-col gap-2 overflow-y-auto scrollbar-hide overflow-x-hidden flex-1" style={{ maxHeight: 380 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => {
                  desktopActiveRef.current = i;
  setActiveThumb(i);
  requestAnimationFrame(() => {
  applyDesktopTransform(0, true);
});
  }}
                  className={`flex-shrink-0 w-[56px] h-[56px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeThumb === i ? "border-yellow-400 shadow-md scale-[1.04]" : "border-gray-200 hover:border-yellow-300"}`}>
                  <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {images.length > 5 && (
              <button onClick={() => { const el = document.getElementById("thumb-list-ws"); el?.scrollBy({ top: 70, behavior: "smooth" }); }}
                className="w-8 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0">▼</button>
            )}
          </div>
        )}

        {/* Desktop main image */}
        <div className="flex-1 flex flex-col">
        <div
  ref={(el) => {
    desktopWrapperRef.current = el;
    containerRef.current = el;
  }}
  className="relative w-full overflow-hidden select-none"
  style={{ aspectRatio: "1 / 1" }}

 // ── Mouse handlers on the desktop image wrapper div ──────────────────────
onMouseEnter={() => {
  if (isMobile) return;

  // ✅ stop EVERYTHING
  clearInterval(desktopAutoPlayRef.current);

  showZoomRef.current = true;
  isHoveredRef.current = true;

  // ✅ freeze current visible image
  activeImgRef.current = actualActiveImg;

  setShowZoom(true);
}}

onMouseLeave={(e) => {
  if (isMobile) return;

  if (
    zoomRef.current &&
    e.relatedTarget &&
    zoomRef.current.contains(e.relatedTarget)
  ) {
    return;
  }

  setShowZoom(false);
  showZoomRef.current = false;
  isHoveredRef.current = false;        // ← unblock the existing interval
  activeImgRef.current = null;

  currentRef.current = { x: 0.5, y: 0.5 };
  targetRef.current = { x: 0.5, y: 0.5 };
  // ← NO new setInterval here
}}

onMouseMove={(e) => {
  if (isMobile) return;
  handleMouseMove(e);
}}

// onMouseMove={(e) => {
//   if (desktopDragging.current) {
//     // Dragging — only move track, do NOT update zoom position
//     const rawDelta = e.clientX - desktopStartX.current;
//     desktopDelta.current = rawDelta;
//     requestAnimationFrame(() => {
//       applyDesktopTransform(rawDelta * 0.12, false);
//     });
//   } else {
//     // Just hovering — update zoom position only
//     updatePosition(e.clientX, e.clientY);
//   }
// }}
>
  <div
    ref={desktopTrackRef}
    className="flex h-full"
    style={{
      width: `${images.length * 100}%`,
      willChange: "transform",
    }}
  >
    {images.map((img, i) => (
      <div
        key={img?.url || i}
        className="flex-shrink-0 flex items-center justify-center bg-white relative"
        style={{
          width: `${100 / images.length}%`,
          height: "100%",
        }}
      >
        {img?.url ? (
          <img
            src={img.url}
            alt={`${title} ${i + 1}`}
            className="w-full h-full object-contain p-6 sm:p-8 pointer-events-none"
            draggable={false}
          />
        ) : (
          <Package size={64} className="text-gray-200" />
        )}
      </div>
    ))}
  </div>

  {/* LEFT ARROW */}
  {images.length > 1 && (
    <>
      {/* LEFT ARROW */}
<button
onClick={() => {
  const next =
    activeThumb <= 0
      ? images.length - 1
      : activeThumb - 1;

  desktopActiveRef.current = next;

  setActiveThumb(next);

 requestAnimationFrame(() => {
  applyDesktopTransform(0, true);
});
}}
  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10"
>‹</button>

      {/* RIGHT ARROW */}
    <button
 onClick={() => {
  const next =
    activeThumb >= images.length - 1
      ? 0
      : activeThumb + 1;

  desktopActiveRef.current = next;

  setActiveThumb(next);

 requestAnimationFrame(() => {
  applyDesktopTransform(0, true);
});
}}
  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10"
>›</button>
    </>
  )}

  {/* ZOOM LENS */}
  {showZoom && (
    <div
      ref={lensRef}
      className="absolute pointer-events-none"
      style={{
        width: "160px",
        height: "160px",
        transform: "translate(-50%, -50%)",
        border: "2px solid rgba(114, 67, 136, 0.6)",
        backgroundColor: "rgba(59, 12, 87, 0.08)",
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "4px",
        zIndex: 20,
      }}
    />
  )}
</div>
        </div>
      </div>
    </div>


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

  </div>
  {/* ══ LEFT COLUMN ends ══ */}

          {/* RIGHT COLUMN — Sticky */}
          <div className="flex flex-col gap-4 order-1 lg:order-2 lg:sticky lg:top-[74px]">

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden"

>

              {/* Title area */}
              <div className="p-4 sm:p-5">
                {product?.category?.name && (
                  <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider mb-1">
                    {product.category.name}{product?.subcategory ? ` / ${product.subcategory}` : ""}
                  </div>
                )}
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug mb-2">{title}</h1>
                {productCode && (
                  <div className="text-[15px] text-gray-700 font-mono mb-2">{productCode}</div>
                )}
                {(useFlatVariantPicker ? variantSelectOptions.length > 0 : attrKeys.length > 0) && (
                  <div className="mb-3" ref={variantRef}>
                    <div className="h-px bg-gray-100 mb-3" />
                    {useFlatVariantPicker ? (
                      <div className="flex flex-wrap gap-2">
                        {variantSelectOptions.map((opt) => {
                          const activeByVariant = isSameVariant(selectedVariant, opt.variant);
                          const activeByAttr =
                            attrKeys.length === 1 &&
                            selectedAttrs[attrKeys[0]] != null &&
                            selectedAttrs[attrKeys[0]] === opt.label;
                          const active = activeByVariant || activeByAttr;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleVariantOptionSelect(opt)}
                              className={`px-4 py-2 text-xs sm:text-sm rounded-xl cursor-pointer border-2 font-semibold transition-all duration-150 min-w-[4rem] ${
                                active
                                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                  : "border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 bg-white"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attrKeys.map((key) => (
                          <div key={key}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                              {key}
                              {selectedAttrs[key] ? (
                                <span className="ml-2 normal-case font-semibold text-gray-700 tracking-normal">
                                  : {selectedAttrs[key]}
                                </span>
                              ) : null}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {getAllValues(key).map((val) => {
                                const avail = isAvailable(key, val);
                                const active = selectedAttrs[key] === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => avail && handleAttrSelect(key, val)}
                                    disabled={!avail}
                                    className={`px-3 py-1.5 text-xs rounded-xl border-2 font-medium transition-all duration-150 ${
                                      active
                                        ? "border-gray-900 bg-gray-900 text-white"
                                        : avail
                                          ? "border-gray-200 text-gray-700 hover:border-gray-900 bg-white"
                                          : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                                     {/* ✅ Mobile Image — sirf mobile pe, desktop pe hidden */}
        <div className="lg:hidden -mx-4 mb-3">
          <MobileImageSwiper
            images={images}
            activeThumb={activeThumb}
            setActiveThumb={setActiveThumb}
            title={title}
            onTap={() => setIsVisible(true)}
          />
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-3">
              {images.map((_, i) => (
                <button key={i} onClick={() => {
                 desktopActiveRef.current = i;
  setActiveThumb(i);
    // applyDesktopTransform(0, true);  // ← yeh line missing thi
}}
                  className={`rounded-full transition-all duration-200 ${activeThumb === i ? "w-4 h-2 bg-yellow-400" : "w-2 h-2 bg-gray-300"}`} />
              ))}
            </div>
          )}
        </div>
       {brand && (
                  <p className="text-xs text-gray-400 mb-2">
                    by <span className="text-[#478B8D] font-semibold">{brand}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
<div className="flex gap-0.5">{renderStars(Number(displayAvg))}</div>
<span className="text-xs font-bold text-gray-800">{Number(displayAvg).toFixed(1)}</span>
<span className="text-xs text-gray-400">({displayCount} {displayCount === 1 ? "review" : "reviews"})</span>
                </div>
                {soldInfo > 0 && (
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} />
<span className="font-extrabold text-[#E11D48]">
  {formatCount(soldInfo)} bought
</span>

<span className="text-gray-500">
  in past month
</span>                    </span>
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

    {sellingPriceRange && (
      <>
        Sell at{" "}
        <span className="font-bold text-gray-800">
          {typeof sellingPriceRange === "object"
            ? sellingPriceRange?.value
            : sellingPriceRange}
        </span>{" "}
      </>
    )}

    {earnPerUnit && (
      <>
        · Earn{" "}
        <span className="font-bold text-green-700">
          {typeof earnPerUnit === "object"
            ? earnPerUnit?.value
            : earnPerUnit}
        </span>
        /unit
      </>
    )}

  </div>
)}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">

  {stock != null && stock <= 20 && stock > 0 && (
    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full animate-pulse">
      <Eye size={11} />
      <span className="text-[10px] font-bold">
        Only {stock} left
      </span>
    </div>
  )}

  <div className="flex items-center gap-1 bg-green-50 ml-4 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
    <ShoppingBag size={11} />
    <span className="text-[10px] font-bold">
      High demand
    </span>
  </div>

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

                {!isInCart && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">
                        Quantity <span className="font-normal text-gray-400">(MOQ: {moq})</span>
                      </span>
                      {totalPrice != null && (
                        <span className="text-xs font-extrabold text-gray-900">Total: {fmt(totalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty((q) => Math.max(moq, q - moq))}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
                      >−</button>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="flex-1 h-10 text-center border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={() => setQty((q) => q + moq)}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-yellow-400 transition-colors"
                      >+</button>
                    </div>
                  </>
                )}

                {/* ADD TO CART / QTY CONTROLS */}
                {inStock ? (
                  !isInCart ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={localLoading.add}
                      className="w-full bg-zinc-800 hover:bg-zinc-900 text-zinc-100/90 py-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {localLoading.add
                        ? <Loader2 size={16} className="animate-spin" />
                        : <ShoppingCart size={16} />}
                      Add To Cart — {totalPrice != null ? fmt(totalPrice) : "—"}
                    </button>
                  ) : (
                    <div className="flex items-center w-full border-2 border-[#478B8D] rounded-xl overflow-hidden">
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
                        className="w-12 h-12 flex items-center justify-center bg-[#478B8D] hover:bg-yellow-300 transition disabled:opacity-40"
                      >
                        {localLoading.update
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Plus size={16} />}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-extrabold text-sm text-center">
                    {availabilityMeta.label}
                  </div>
                )}

                {availability?.status === "MOQ_UNMET" && (
                  <p className={`text-xs font-semibold ${availabilityMeta.className}`}>
                    Min qty {moq}, available {availability?.quantity ?? stock ?? 0}
                  </p>
                )}

                {inStock && (
                  <button
                    type="button"
                    onClick={handleOrderNow}
                    disabled={localLoading.orderNow}
                    className="w-full bg-[#478B8D] hover:bg-[#478B8D]/50 text-zinc-50 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50"
                  >
                    {localLoading.orderNow
                      ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      : "Order Now"
                    }
                  </button>
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
                         { type: "whatsapp",  Icon: IoLogoWhatsapp,  cls: "bg-green-500 hover:bg-green-600",  link: "https://wa.me/message/72BTQZMTQU2AG1" },
{ type: "facebook",  Icon: IoLogoFacebook,  cls: "bg-blue-600 hover:bg-blue-700",    link: "https://www.facebook.com/share/1Eej9auTBB/" },
{ type: "instagram", Icon: IoLogoInstagram, cls: "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600", link: "https://www.instagram.com/offer_wale_baba?igsh=Mjd6aG84bXV5dmRn" },
{ type: "telegram",  Icon: FaTelegram,      cls: "bg-sky-500 hover:bg-sky-600",      link: "https://t.me/OfferWaleBabaRetail" },
                        ].map(({ type, Icon, cls, link }) => (
                         <button key={type} onClick={() => { window.open(link, "_blank"); setShareOpen(false); }}
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
                    <feat.icon size={13} className="mx-auto text-[#478B8D] mb-1" />
                    <div className="text-[8px] font-bold text-gray-400">{feat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers card */}
       <div className="bg-white border border-gray-200 rounded-2xl p-4">
  <p className="text-sm font-bold text-gray-900 mb-3">
    Offers
  </p>

  {couponsLoading ? (
    <p className="text-xs text-gray-400">
      Loading coupons...
    </p>
  ) : publicCoupons.length === 0 ? (
    <p className="text-xs text-gray-400">
      No offers available
    </p>
  ) : (
    <div className="flex flex-col divide-y divide-gray-100">
      {publicCoupons.slice(0, 3).map((coupon) => {
        const label = formatCouponLabel(coupon);

        return (
          <div
            key={coupon._id}
            className="flex items-start justify-between py-3 gap-3"
          >
            <div className="flex items-start gap-2.5">
              <Tag
                size={16}
                className="text-gray-400 mt-0.5 flex-shrink-0"
              />

              <div>
                <p className="text-xs font-medium text-gray-800">
                  {label}
                </p>

                <p className="text-[10px] text-gray-400 mt-0.5">
                  Use code —
                  <span className="font-semibold text-gray-600 ml-1">
                    {coupon.code}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCopyCouponCode(coupon.code)}
              className={`text-xs font-semibold flex-shrink-0 transition-colors ${
                copiedCouponCode === String(coupon.code).trim().toUpperCase()
                  ? "text-green-600"
                  : "text-red-500 hover:text-red-600"
              }`}
            >
              {copiedCouponCode === String(coupon.code).trim().toUpperCase()
                ? "Copied"
                : "Copy"}
            </button>
          </div>
        );
      })}
    </div>
  )}

  <p className="text-[10px] text-gray-400 mt-1">
    *Coupons can be applied at checkout
  </p>
</div>

          {/* Product Meta */}
{(product?.hsnCode || product?.gstRate != null) && (

  <div className="bg-white border border-gray-200 rounded-2xl p-4">

    <div className="flex items-center gap-2 mb-4">

      <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center">
        <ShieldCheck size={16} className="text-yellow-600" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Product Details
        </h3>

        <p className="text-[11px] text-gray-400">
          Tax & product information
        </p>
      </div>
    </div>

    <div className="space-y-3">

      {product?.hsnCode && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">

          <span className="text-xs text-gray-500 font-medium">
            HSN Code
          </span>

          <span className="text-xs font-bold text-gray-900">
            {product.hsnCode}
          </span>
        </div>
      )}

      {product?.gstRate != null && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">

          <span className="text-xs text-gray-500 font-medium">
            GST Rate
          </span>

          <span className="text-xs font-bold text-green-700">
            {product.gstRate}%
          </span>
        </div>
      )}

    </div>
  </div>
)}
{showZoom && !isMobile && activeImg && (
  <div
    ref={zoomRef}
    className="hidden lg:block w-[28rem] absolute z-10 h-[36rem] rounded-2xl shadow-lg bg-white border border-gray-200"
    style={{
      backgroundImage: `url(${activeImg})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "250%",
      top: "0px",
      left: "-1rem",   // positions it to the LEFT of the right column, over the image area
    }}
  />
)}

          </div>{/* end right column */}
        </div>{/* end grid */}
          {/* ✅ Related Products — WholesaleProductCard replace kiya RelatedCard se */}
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
<div
  className="
    grid
    grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
    gap-x-3
    gap-y-5
  "
>                  {related.map((p, i) => (
                    <WholesaleProductCard key={p._id || p.slug} product={p} index={i} />
                  ))}
                </div>
              </div>
            )}
   </div>
    </div>
  </>
  );
};


export default WholesaleProductDetail;