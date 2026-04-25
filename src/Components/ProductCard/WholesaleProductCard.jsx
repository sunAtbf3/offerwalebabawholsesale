// ─────────────────────────────────────────────────────────────────────────────
// WholesaleProductCard.jsx
// Same visual structure as ecom ProductCard.
// Key differences:
//   1. Shows variant.price.base as the wholesale price
//   2. Shows MOQ badge (variant.minimumOrderQuantity)
//   3. "Add to Bag" button is placeholder — cart integration in next phase
//   4. Navigates to /products/:slug (same route as ecom — same website, same backend)
//   5. No Redux cart/wishlist calls yet — just UI
//
// Data shape (from backend with X-Store-Type: wholesale):
//   variant.price.base              → wholesale base price
//   variant.price.sale              → sale price (ignore isSaleActive / finalPrice)
//   variant.minimumOrderQuantity    → MOQ
//   variant.wholesale               → true (confirms wholesale variant)
//   variant.channelVisibility.wholesale → "active"
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Star, ShoppingBag, Package } from "lucide-react";
import LazyImage from "./LazyImage/LazyImage"; // same LazyImage as ecom

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
};

const formatCount = (count) => {
  if (!count) return "0";
  if (count < 100) return count.toString();
  return Math.floor(count / 100) * 100 + "+";
};

// ── WholesaleProductCard ──────────────────────────────────────────────────────
const WholesaleProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();

  if (!product) return null;

  // ── Derived from API response ─────────────────────────────────────────────
  const variant  = product.variants?.[0] ?? {};

  // Price — read base & sale directly, ignore finalPrice/isSaleActive
  const basePrice  = variant.price?.base ?? null;
  const salePrice  = variant.price?.sale ?? null;
  // Only show discount if sale is genuinely lower than base
  const hasDiscount = basePrice != null && salePrice != null && salePrice < basePrice;
  const discountPct = hasDiscount
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : null;

  // MOQ — lives at variant level
  const moq = variant.minimumOrderQuantity ?? variant.price?.minimumOrderQuantity ?? null;

  // Image
  const imgUrl = variant.images?.[0]?.url || null;

  // Stock
  const maxStock = variant.inventory?.trackInventory
    ? (variant.inventory?.quantity ?? 0)
    : Infinity;
  const inStock = maxStock > 0;

  // Meta
  const title    = product.title || product.name || "Product";
  const category = typeof product.category === "object"
    ? product.category?.name
    : product.category || "";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCardClick = () => {
    if (product?.slug) navigate(`/products/${product.slug}`);
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (product?.slug) navigate(`/products/${product.slug}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="group relative flex flex-col cursor-pointer rounded-2xl bg-white border border-zinc-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleCardClick}
    >
      {/* ── IMAGE ── */}
      <div className="relative w-full aspect-square bg-zinc-50 overflow-hidden">
        <LazyImage
          src={imgUrl}
          alt={title}
          aspectRatio="1/1"
          objectFit="cover"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] md:text-[13px] font-black uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && inStock && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] bg-[#EB4C4C] text-white px-2 py-0.5 rounded-md shadow-sm font-bold">
              {discountPct}% OFF
            </span>
          </div>
        )}

        {/* MOQ badge — top left below discount or standalone */}
        {moq && (
          <div className={`absolute ${discountPct ? "top-8" : "top-2"} left-2 z-10`}>
            <span className="flex items-center gap-1 text-[10px] bg-[#F7A221] text-white px-2 py-0.5 rounded-md shadow-sm font-bold">
              <Package size={9} />
              MOQ: {moq}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10
          md:translate-x-10 md:opacity-0
          md:group-hover:translate-x-0 md:group-hover:opacity-100
          transition-all duration-300"
        >
          <button
            onClick={handleView}
            aria-label="View product"
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all active:scale-90"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1">

        {/* Category */}
        {category && (
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-400 font-medium truncate">
            {category}
          </span>
        )}

        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-2 group-hover:text-[#F7A221] transition-colors leading-snug flex-1">
            {title}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-semibold text-zinc-600">4.3</span>
          </div>
        </div>

        {/* Sold info */}
        {product?.soldInfo?.count > 0 && (
          <p className="text-[9px] sm:text-[10px] text-zinc-500 hidden sm:block">
            <span className="font-bold text-red-500">
              {formatCount(product.soldInfo.count)} bought
            </span>{" "}
            in past month
          </p>
        )}

        {/* ── PRICE SECTION (wholesale) ─────────────────────────────────────── */}
        <div className="flex flex-col gap-0.5 mt-1">
          {/* Wholesale label */}
          <span className="text-[9px] uppercase tracking-widest text-[#F7A221] font-bold">
            Wholesale Price
          </span>

          <div className="flex items-center gap-1.5">
            {/* Show sale price as main if available and lower, else show base */}
            <span className="text-sm sm:text-base font-bold text-zinc-900">
              ₹{formatPrice(hasDiscount ? salePrice : basePrice)}
            </span>

            {/* Strikethrough base if there's a discount */}
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                ₹{formatPrice(basePrice)}
              </span>
            )}
          </div>

          {/* MOQ info line below price */}
          {moq && (
            <p className="text-[10px] text-zinc-500 font-medium">
              Min. order:{" "}
              <span className="text-zinc-800 font-bold">{moq} pcs</span>
            </p>
          )}
        </div>

        {/* ── ADD TO BAG (placeholder — cart integration in next phase) ── */}
        <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          {!inStock ? (
            <button
              disabled
              className="w-full py-2 text-[10px] font-bold bg-zinc-100 text-zinc-400 rounded-xl cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: cart integration in next phase
                handleCardClick();
              }}
              className="w-full py-2 sm:py-3 text-[10px] sm:text-xs font-bold rounded-xl bg-zinc-900 text-white hover:bg-[#F7A221] transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={12} />
              ADD TO BAG
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WholesaleProductCard;