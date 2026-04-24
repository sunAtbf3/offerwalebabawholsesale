import React, { useState } from 'react';
import { Heart, Star, Package, TrendingUp, ShoppingBag, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const badgeConfig = {
  green: { bg: 'bg-emerald-500', text: 'text-white' },
  red: { bg: 'bg-rose-500', text: 'text-white' },
  orange: { bg: 'bg-orange-500', text: 'text-white' },
  purple: { bg: 'bg-violet-600', text: 'text-white' },
  blue: { bg: 'bg-blue-600', text: 'text-white' },
  amber: { bg: 'bg-amber-500', text: 'text-white' },
};

const VolumeTier = ({ tier }) => (
  <div className={`flex flex-col items-center py-1.5 px-1 ${tier.best ? 'bg-amber-50' : 'bg-slate-50'}`}>
    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{tier.min}+</span>
    <span className={`text-[10px] font-extrabold ${tier.best ? 'text-amber-600' : 'text-slate-700'}`}>
      ₹{tier.price.toLocaleString('en-IN')}
    </span>
  </div>
);

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  const {
    id, name, category, image,
    wholesalePrice, mrp, marginPercent,
    rating, reviewCount,
    badge, badgeColor,
    moq, stock,
    volumePricing, boughtPastMonth,
    casePack, leadTime,
  } = product;

  const handleAddToBag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const stockStatus =
    stock > 100
      ? { label: 'In stock', dot: 'bg-emerald-500', color: 'text-emerald-600' }
      : stock > 20
        ? { label: `Only ${stock} left`, dot: 'bg-orange-400', color: 'text-orange-500' }
        : { label: `Only ${stock} left`, dot: 'bg-rose-500', color: 'text-rose-600' };

  const badgeStyle = badgeConfig[badgeColor] || badgeConfig.green;

  return (
    <Link to={`/product/${id}`} className="no-underline block h-full">
      <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">

        {/* ── IMAGE ZONE ── */}
        <div className="relative overflow-hidden bg-slate-50">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* Subtle dark gradient on hover so heart is visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badge — top left */}
          {badge && (
            <span className={`absolute top-2.5 left-2.5 ${badgeStyle.bg} ${badgeStyle.text} text-[9px] font-black px-2 py-0.5 rounded-md tracking-wide uppercase`}>
              {badge}
            </span>
          )}

          {/* MOQ — top right */}
          <span className="absolute top-2.5 right-2.5 bg-[#0F172A]/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-md">
            MOQ: {moq}
          </span>

          {/* Wishlist heart — slides in on card hover, bottom right of image */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`
              absolute bottom-4 right-3 w-8 h-8 rounded-full flex items-center justify-center
              shadow-md transition-all duration-300 cursor-pointer
              ${wishlisted
                ? 'bg-rose-500 opacity-100 scale-100'
                : 'bg-white/90 backdrop-blur-sm opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}
              hover:scale-110
            `}
          >
            <Heart
              size={15}
              className={wishlisted ? 'text-white' : 'text-slate-500'}
              fill={wishlisted ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* ── CONTENT ZONE ── */}
        <div className="flex flex-col flex-1 p-3.5 gap-2.5">

          {/* Category label */}
          <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest">
            {category}
          </span>

          {/* Product name */}
          <h3 className="text-[12.5px] font-bold text-slate-800 leading-snug line-clamp-2 min-h-[34px]">
            {name}
          </h3>

          {/* Rating row */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-px">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.floor(rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-600">{rating}</span>
            <span className="text-[10px] text-slate-400">({reviewCount})</span>
            {boughtPastMonth > 0 && (
              <span className="ml-auto flex items-center gap-0.5 text-[9px] text-slate-400">
                <TrendingUp size={9} />
                {boughtPastMonth} this month
              </span>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-extrabold text-slate-900 tracking-tight">
              ₹{wholesalePrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
            <span className="ml-auto text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
              {marginPercent}% margin
            </span>
          </div>

          {/* Volume pricing tiers */}
          {volumePricing?.length >= 3 && (
            <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
              {volumePricing.slice(0, 3).map((tier, i) => (
                <VolumeTier key={i} tier={tier} />
              ))}
            </div>
          )}

          {/* Logistics meta — pushed to bottom */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-auto pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Package size={9} />
              {casePack} units/ctn · {leadTime}
            </span>
            <span className={`flex items-center gap-1 font-semibold ${stockStatus.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
              {stockStatus.label}
            </span>
          </div>

          {/* Single CTA — Add to bag */}
          <button
            onClick={handleAddToBag}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl
              text-[11px] font-extrabold uppercase tracking-wider
              transition-all duration-300 cursor-pointer
              ${addedToBag
                ? 'bg-emerald-500 text-white scale-[0.98]'
                : 'bg-[#0F172A] text-amber-400 hover:bg-slate-700 active:scale-[0.97]'}
            `}
          >
            {addedToBag ? (
              <>
                <Zap size={13} className="fill-white text-white" />
                Added to bag
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                Add to bag
              </>
            )}
          </button>

        </div>
      </div>
    </Link>
  );
};

export default ProductCard;