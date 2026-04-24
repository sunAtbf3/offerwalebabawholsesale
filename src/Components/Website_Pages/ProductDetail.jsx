import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Heart, ShoppingCart, Truck, Clock, Shield, RotateCcw,
  ChevronRight, Package, TrendingUp, Check, ThumbsUp, MapPin
} from 'lucide-react';
import data from '../../Data/data.json';
import ProductCard from '../ProductCard/ProductCard';

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} className={i < Math.floor(rating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'} />
  ));

const ProductDetail = () => {
  const { productId } = useParams();
  const product = data.products.find(p => p.id === Number(productId));
  const [qty, setQty] = useState(50);
  const [activeTab, setActiveTab] = useState('desc');
  const [activeThumb, setActiveThumb] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-navy mb-4">Product not found</h2>
        <Link to="/" className="text-gold-dark font-bold hover:text-gold">← Back to Home</Link>
      </div>
    );
  }

  const {
    name, category, subcategory, sku, image, images,
    wholesalePrice, mrp, marginPercent, discountPercent,
    sellingPriceRange, earnPerUnit, rating, reviewCount, soldCount,
    moq, stock, casePack, badge, volumePricing,
    leadTime, returnPolicy, hsnCode, gstRate, origin,
    description, bulletPoints, specs, reviews
  } = product;

  const relatedProducts = data.products.filter(p => p.category === category && p.id !== product.id).slice(0, 4);

  // Volume pricing — find current tier
  const currentTier = volumePricing?.find(t => qty >= t.min && qty <= t.max) || volumePricing?.[0];
  const unitPrice = currentTier?.price || wholesalePrice;
  const totalPrice = unitPrice * qty;

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const tabContent = {
    desc: (
      <div className="p-5">
        <p className="text-[13px] text-slate-700 leading-relaxed mb-5">{description}</p>
        {bulletPoints && bulletPoints.length > 0 && (
          <ul className="space-y-2.5">
            {bulletPoints.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                <Check size={14} className="text-green-600 shrink-0 mt-0.5" />
                {bp}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    specs: (
      <div className="p-5">
        {specs && specs.length > 0 ? (
          <table className="w-full text-[12px]">
            <tbody>
              {specs.map((spec, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-panel' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-bold text-navy w-[35%]">{spec.label}</td>
                  <td className="py-2.5 px-3 text-slate-600">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] text-muted">No specifications available.</p>
        )}
      </div>
    ),
    reviews: (
      <div className="p-5">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((rev, i) => (
              <div key={i} className="border border-edge rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-gold"
                    style={{ backgroundColor: rev.avatarBg }}
                  >
                    {rev.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-navy">{rev.name}</span>
                      {rev.verified && (
                        <span className="text-[8px] font-bold text-green-700 bg-green-100 px-1.5 py-px rounded">VERIFIED</span>
                      )}
                    </div>
                    <div className="text-[10px] text-hint flex items-center gap-1">
                      <MapPin size={9} /> {rev.location} · {rev.date}
                    </div>
                  </div>
                </div>
                {/* Stars + Title */}
                <div className="flex gap-0.5 mb-1">{renderStars(rev.rating)}</div>
                <h4 className="text-[13px] font-bold text-navy mb-2">{rev.title}</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed mb-3">{rev.text}</p>
                {/* Tags */}
                {rev.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rev.tags.map((tag, j) => (
                      <span key={j} className="text-[9px] font-semibold text-navy bg-panel border border-edge px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <button className="flex items-center gap-1.5 text-[11px] text-muted hover:text-navy transition-colors">
                  <ThumbsUp size={12} /> Helpful ({rev.helpfulCount})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted">No reviews yet for this product.</p>
        )}
      </div>
    ),
    margin: (
      <div className="p-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h4 className="text-[13px] font-bold text-green-800 mb-2">Margin Calculator</h4>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <span className="text-muted">Your cost</span>
              <div className="text-navy font-extrabold text-lg">₹{unitPrice.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-muted">Sell at</span>
              <div className="text-navy font-extrabold text-lg">{sellingPriceRange}</div>
            </div>
            <div>
              <span className="text-muted">Earn per unit</span>
              <div className="text-green-700 font-extrabold text-lg">{earnPerUnit}</div>
            </div>
            <div>
              <span className="text-muted">Margin</span>
              <div className="text-green-700 font-extrabold text-lg">{marginPercent}%+</div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted">
          * Margins are estimates based on typical retail pricing. Actual margins may vary based on your selling platform and strategy.
        </p>
      </div>
    ),
  };

  const tabs = [
    { key: 'desc', label: 'Description' },
    { key: 'specs', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${reviewCount})` },
    { key: 'margin', label: 'Margin Info' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-5 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-hint mb-5 flex-wrap">
        <Link to="/" className="hover:text-navy transition-colors no-underline text-hint">Home</Link>
        <ChevronRight size={11} />
        <span className="hover:text-navy cursor-pointer">{category}</span>
        <ChevronRight size={11} />
        <span className="text-navy font-semibold">{name}</span>
      </nav>

      {/* PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-7 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* Image Card */}
          <div className="bg-white border-[1.5px] border-edge rounded-2xl overflow-hidden">
            <div className="h-[320px] bg-panel flex items-center justify-center relative">
              <img src={images?.[activeThumb] || image} alt={name} className="max-h-[85%] max-w-[85%] object-contain" />
              {badge && (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded">
                  {badge}
                </span>
              )}
              <button className="absolute top-4 right-4 w-8 h-8 bg-white border border-edge rounded-full flex items-center justify-center hover:border-red-300 transition-colors">
                <Heart size={14} className="text-slate-400 hover:text-red-500" />
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 p-3 border-t border-edge">
              {(images && images.length > 0 ? images : [image]).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-[54px] h-[54px] rounded-[9px] bg-panel border-2 overflow-hidden ${
                    activeThumb === i ? 'border-gold bg-gold-light' : 'border-transparent hover:border-edge'
                  } transition-colors`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Card */}
          <div className="bg-white border-[1.5px] border-edge rounded-2xl overflow-hidden">
            <div className="flex border-b border-edge">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-3 text-[12px] font-bold border-b-2 -mb-px transition-colors ${
                    activeTab === tab.key
                      ? 'text-navy border-gold'
                      : 'text-muted border-transparent hover:text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {tabContent[activeTab]}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h3 className="text-[15px] font-extrabold text-navy mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gold rounded-full" />
                Related Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relatedProducts.map(rp => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Sticky */}
        <div className="flex flex-col gap-0 lg:sticky lg:top-[74px]">
          <div className="bg-white border-[1.5px] border-edge rounded-2xl overflow-hidden">
            {/* Title Area */}
            <div className="p-4">
              <div className="text-[9px] font-bold text-gold-dark uppercase tracking-wider mb-1">{category} / {subcategory}</div>
              <h1 className="text-[18px] font-extrabold text-navy leading-snug mb-2">{name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">{renderStars(rating)}</div>
                <span className="text-[12px] font-bold text-navy">{rating}</span>
                <span className="text-[11px] text-hint">({reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted">
                <span className="flex items-center gap-1"><TrendingUp size={10} /> {soldCount.toLocaleString('en-IN')} sold</span>
                <span>SKU: {sku}</span>
              </div>
            </div>

            {/* Price Area */}
            <div className="bg-amber-50 border-t border-b border-gold-lighter px-4 py-3">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-[26px] font-extrabold text-navy tracking-tight">₹{unitPrice.toLocaleString('en-IN')}</span>
                <span className="text-[13px] text-hint line-through">₹{mrp.toLocaleString('en-IN')}</span>
                <span className="text-[12px] font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  {marginPercent}% margin
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Sell at <span className="font-bold text-navy">{sellingPriceRange}</span> · Earn <span className="font-bold text-green-700">{earnPerUnit}</span>/unit
              </div>
            </div>

            {/* Volume Pricing */}
            <div className="px-4 py-3 border-b border-edge">
              <div className="text-[10px] font-bold text-navy uppercase tracking-wider mb-2">Volume Pricing</div>
              <div className="space-y-1.5">
                {volumePricing?.map((tier, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-[11px] px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      qty >= tier.min && qty <= tier.max
                        ? 'bg-gold-light border border-gold'
                        : 'bg-panel border border-transparent hover:border-edge'
                    }`}
                    onClick={() => setQty(tier.min)}
                  >
                    <span className="font-semibold text-navy">
                      {tier.min}–{tier.max === 9999 ? '∞' : tier.max} units
                      {tier.best && <span className="ml-1.5 text-[8px] font-extrabold text-gold-dark bg-gold-lighter px-1.5 py-px rounded">BEST VALUE</span>}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-navy">₹{tier.price.toLocaleString('en-IN')}</span>
                      {tier.save > 0 && <span className="text-green-600 font-bold">Save ₹{tier.save}</span>}
                      <span className="text-green-700 font-bold bg-green-100 px-1.5 py-px rounded text-[9px]">{tier.margin}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Strip */}
            <div className="grid grid-cols-3 border-b border-edge text-center divide-x divide-edge">
              <div className="py-3 px-2">
                <Truck size={16} className="mx-auto text-gold mb-1" />
                <div className="text-[10px] font-bold text-navy">{leadTime}</div>
                <div className="text-[8px] text-hint">Delivery</div>
              </div>
              <div className="py-3 px-2">
                <Package size={16} className="mx-auto text-gold mb-1" />
                <div className="text-[10px] font-bold text-navy">{casePack} units</div>
                <div className="text-[8px] text-hint">Case pack</div>
              </div>
              <div className="py-3 px-2">
                <RotateCcw size={16} className="mx-auto text-gold mb-1" />
                <div className="text-[10px] font-bold text-navy">{returnPolicy}</div>
                <div className="text-[8px] text-hint">Returns</div>
              </div>
            </div>

            {/* Stock Strip */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border-b border-edge">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-green-700">{stock > 100 ? 'In stock' : `Only ${stock} left`}</span>
              </div>
              <span className="text-[10px] text-muted">{stock.toLocaleString('en-IN')} units available</span>
            </div>

            {/* Qty Area */}
            <div className="px-4 py-3 border-b border-edge">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-navy">Quantity <span className="text-hint font-normal">(MOQ: {moq})</span></span>
                <span className="text-[11px] font-extrabold text-navy">Total: ₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(moq, qty - moq))}
                  className="w-9 h-9 rounded-lg border border-edge flex items-center justify-center text-lg font-bold text-navy hover:border-gold transition-colors"
                >−</button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(moq, Number(e.target.value)))}
                  className="w-20 h-9 text-center border border-edge rounded-lg text-[13px] font-bold text-navy outline-none focus:border-gold"
                />
                <button
                  onClick={() => setQty(qty + moq)}
                  className="w-9 h-9 rounded-lg border border-edge flex items-center justify-center text-lg font-bold text-navy hover:border-gold transition-colors"
                >+</button>
              </div>
            </div>

            {/* CTA Area */}
            <div className="px-4 py-3">
              <button
                onClick={() => showToast(`${qty} units added to cart`)}
                className="w-full bg-gold text-navy py-3 rounded-xl font-extrabold text-[14px] hover:bg-yellow-400 transition-colors mb-2 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add To Cart — ₹{totalPrice.toLocaleString('en-IN')}
              </button>
              <button className="w-full bg-navy text-gold py-3 rounded-xl font-extrabold text-[14px] hover:bg-navy-light transition-colors flex items-center justify-center gap-2">
                Order Now
              </button>
            </div>

            {/* Features Strip */}
            <div className="grid grid-cols-4 border-t border-edge text-center divide-x divide-edge">
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Truck, label: 'Fast Ship' },
                { icon: RotateCcw, label: 'Easy Return' },
                { icon: Check, label: 'GST Invoice' },
              ].map((feat, i) => (
                <div key={i} className="py-3 px-1">
                  <feat.icon size={14} className="mx-auto text-gold mb-1" />
                  <div className="text-[8px] font-bold text-muted">{feat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Meta */}
          <div className="mt-3 bg-white border-[1.5px] border-edge rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-y-2 text-[11px]">
              <span className="text-hint">HSN Code</span><span className="font-bold text-navy">{hsnCode}</span>
              <span className="text-hint">GST Rate</span><span className="font-bold text-navy">{gstRate}%</span>
              <span className="text-hint">Origin</span><span className="font-bold text-navy">{origin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-gold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-[13px] font-bold z-50 animate-bounce">
          <Check size={16} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
