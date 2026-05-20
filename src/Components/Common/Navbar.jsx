import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ShoppingCart, Heart, MapPin,
  User, ChevronDown, Menu, X, LogOut,
  Package, ShieldCheck, Zap,
  Info,
  CircleUser,
  Phone,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
import { logout, selectUser, selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { useLogoutMutation } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
import LOGO2 from "../../assets/home (3).png";
import VID2 from "../../assets/Video2.mp4";
import { selectDisplayCartCount } from '../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
import WholesaleCartSidebar from '../HomeComponents/Sidebar/CartSidebar';
import WishlistSidebar from '../HomeComponents/Sidebar/Wishlist';
import { selectDisplayWishlistCount } from '../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';
import { Link, useNavigate } from 'react-router-dom';
import SearchModal from './Search_Modal/SearchModal';
import { fetchAddresses, selectDefaultAddress } from '../REDUX_FEATURES/REDUX_SLICES/Useraddressslice';
import { setLoggingOut } from '../../SERVICES/Wholesaleaxios';

/* ─────────────────────────────────────────────
   LOCATION DISPLAY  (logic unchanged)
───────────────────────────────────────────── */
const LocationDisplay = ({ userAddress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsAuthenticated);

  const handleAddress = () => {
    if (isLoggedIn) navigate('/account/useraddress');
    else dispatch(openModal('login'));
  };

  const getDisplayAddress = () => {
    if (isLoggedIn && userAddress) {
      const parts = [];
      if (userAddress.city) parts.push(userAddress.city);
      if (userAddress.postalCode) parts.push(userAddress.postalCode);
      if (parts.length > 0) return parts.join(', ');
      if (userAddress.addressLine1) return userAddress.addressLine1.substring(0, 20);
      return 'Select Address';
    }
    return isLoggedIn ? 'SELECT ADDRESS' : 'ADDRESS';
  };

  const address = getDisplayAddress();

  const destinations = [
    address !== 'ADDRESS' ? getDisplayAddress() : address,
    'WAREHOUSE 1',
    'WAREHOUSE 2',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % destinations.length);
        setIsAnimating(false);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userAddress]);

  return (
    <div
      className="hidden xl:flex items-center gap-3 bg-white cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-all hover:border-gray-300 group"
      onClick={handleAddress}
    >
      <MapPin size={20} className="text-red-500 animate-bounce flex-shrink-0" />
      <div className="flex flex-col w-44 overflow-hidden">
        <span className="text-[10px] text-gray-500 font-semibold uppercase leading-none">
          Deliver to
        </span>
        <div className="flex items-center mt-1">
          {!isLoggedIn && (
            <span className="text-sm font-medium text-gray-700 mr-1 whitespace-nowrap">Your</span>
          )}
          <div className="relative h-[20px] overflow-hidden flex-1">
            <span
              className="absolute left-0 w-full text-sm font-semibold text-gray-900 leading-[20px] transition-transform duration-500 ease-in-out"
              style={{
                top: 0,
                transform:
                  (isAnimating && !isLoggedIn) ||
                  (isAnimating && isLoggedIn && address === 'SELECT ADDRESS')
                    ? 'translateY(-100%)'
                    : 'translateY(0)',
              }}
            >
              {isLoggedIn && !(isLoggedIn && address === 'SELECT ADDRESS')
                ? address
                : destinations[currentIndex]}
            </span>
            <span
              className="absolute left-0 w-full text-sm font-semibold text-gray-900 leading-[20px] transition-transform duration-500 ease-in-out"
              style={{
                top: '100%',
                transform: isAnimating && !isLoggedIn ? 'translateY(-100%)' : 'translateY(0)',
                transitionDelay: isAnimating && !isLoggedIn ? '0.25s' : '0s',
              }}
            >
              {isLoggedIn
                ? address
                : destinations[(currentIndex + 1) % destinations.length]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────────── */
const Navbar = ({ searchQuery, setSearchQuery }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectDisplayCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wishlistCount = useSelector(selectDisplayWishlistCount);
  const userAddress = useSelector(selectDefaultAddress);

  const [logoutMutation] = useLogoutMutation();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOutState, setIsLoggingOutState] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const scrollPos = useRef(0);
  const ticking = useRef(false);
  const accountRef = useRef(null);

useEffect(() => {
  const handleOutside = (e) => {
    if (accountRef.current && !accountRef.current.contains(e.target)) {
      setIsAccountOpen(false);
    }
  };
  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, []);

  /* ── resize: close mobile menu on desktop ── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── search tooltip (first visit) ── */
  useEffect(() => {
    const seen = localStorage.getItem('hasSeenSearchTooltip');
    if (!seen) {
      setShowSearchTooltip(true);
      const t = setTimeout(() => {
        setShowSearchTooltip(false);
        localStorage.setItem('hasSeenSearchTooltip', 'true');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  /* ── hysteresis scroll ── */
  useEffect(() => {
    const handleScroll = () => {
      scrollPos.current = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (scrollPos.current > 80) setScrolled(true);
          else if (scrollPos.current < 10) setScrolled(false);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── fetch addresses when authenticated ── */
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchAddresses());
  }, [dispatch, isAuthenticated]);

  const handleSearchFocus = useCallback(() => setIsSearchModalOpen(true), []);

  const handleLogout = async () => {
    setIsLoggingOutState(true);
    setLoggingOut(true);
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      localStorage.removeItem('accessToken');
    } catch (error) {
      dispatch(logout());
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoggingOutState(false);
      setLoggingOut(false);
    }
  };

  const handleOpenAuth = () => {
    setWishlistOpen(false);
    dispatch(openModal('login'));
  };

  const handleAccountClick = () => {
    if (!isAuthenticated) dispatch(openModal('login'));
  };

  const categories = [
    { label: 'Home & Kitchen', path: '/category/home-and-kitchen' },
    { label: 'Smart Life Gadgets', path: '/category/smart-life-gadgets' },
    { label: 'Baby Items', path: '/category/baby-items' },
    { label: 'Stationary', path: '/category/stationary' },
    { label: 'Cleaning & Housekeeping Supplies', path: '/category/cleaning-and-housekeeping-supplies' },
    { label: 'Sports & Fitness', path: '/category/sports-and-fitness' },
    { label: 'Tours & Travels', path: '/category/tours-and-travels' },
    { label: 'Fashion World', path: '/category/fashion-world' },
    { label: 'Gifts', path: '/category/gifts' },
    { label: 'Mix-Items', path: '/category/mix-items' },
    { label: 'Car Accessories', path: '/category/car-accessories' },
  ];
  const isMobile = window.innerWidth < 768;

  return (
    <>
      <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm bg-white overflow-visible">

        {/* ── TOP UTILITY STRIP (desktop only) ── */}
        <div className="bg-[#0F172A] text-white/70 py-2 px-4 lg:px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
          <div className="flex gap-4 xl:gap-6 items-center">
            <span className="flex items-center gap-2 border-r border-white/10 pr-4 xl:pr-6">
              <ShieldCheck size={13} className="text-amber-500" /> GST Verified Portal
            </span>
            <span className="flex items-center gap-2 border-r border-white/10 pr-4 xl:pr-6">
              <Package size={13} className="text-amber-500" /> Bulk Order Discounts
            </span>
            <span className="flex items-center gap-2">
              <Zap size={13} className="text-amber-500" /> Fast Enterprise Delivery
            </span>
          </div>
          <div className="flex gap-4 xl:gap-6 items-center">
            <a href="#" className="hover:text-amber-500 transition-colors hidden xl:block">Taxes &amp; Invoicing</a>
            <a href="tel:+919370686008" className="hover:text-amber-500 transition-colors text-amber-500">
              Support: +91 93706 86008
            </a>
          </div>
        </div>

        {/* ── MAIN NAVBAR ROW ── */}
        {/*
          The row itself is compact (like your screenshot).
          The logo wrapper uses overflow:visible so the video
          can poke above and below without pushing siblings.
          The outer div uses overflow:visible too.
        */}
        <div
          className={`border-b border-slate-200 bg-white transition-all duration-300 overflow-visible ${
            scrolled ? 'shadow-md' : ''
          }`}
        >
          <div
            className="
              max-w-[1440px] mx-auto
              px-3 sm:px-5 lg:px-8
              flex items-center
              gap-2 sm:gap-4 lg:gap-8
              overflow-visible
            "
            style={{
  height: isMobile
    ? "clamp(110px, 7vw, 300px)"
    : window.innerWidth < 540
    ? "110px"
    : window.innerWidth < 1024
    ? "130px"
    : "clamp(180px, 7vw, 300px)"
}}

          >

            {/* ════ LOGO ════
                - wrapper: narrow (just reserves horizontal space)
                - video: absolutely centred, intentionally taller than the row
                - z-[110] so it renders above category bar & shadow
            */}
            <div
              className="relative flex-shrink-0 cursor-pointer overflow-visible"
              style={{
                /* horizontal space reserved in the flex row */
                width:  'clamp(110px, 13vw, 210px)',
                height: '100%',
              }}
              onClick={() => (window.location.href = '/')}
            >
              {/* Video — centred on the row, overflows top & bottom */}
              <div
                className="absolute left-0 overflow-visible z-[110]"
                style={{
                  width:    '100%',
                  top:      '50%',
                  transform:'translateY(-50%)',
                  /* Taller than the row → spills above the top utility strip
                     and below into the category bar, just like your reference */
                  height:   'clamp(110px, 15vw, 180px)',
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={VID2}
                  className="w-full h-full object-contain select-none pointer-events-none block"
                />

                {/* WHOLESALE BADGE */}
                <div
                  className="
                    absolute z-20
                    top-[38%] -right-3
                    flex items-center gap-[3px]
                    px-[6px] py-[3px]
                    rounded-full
                    bg-[#2563EB]/95
                    backdrop-blur-md
                    border border-white/10
                    shadow-lg shadow-blue-500/20
                    text-white font-black uppercase tracking-[0.14em]
                    whitespace-nowrap
                  "
                  style={{ fontSize: 'clamp(5px, 0.6vw, 8px)' }}
                >
                  <span className="w-[5px] h-[5px] rounded-full bg-blue-100 animate-pulse flex-shrink-0" />
                  <span className="leading-none">Wholesale</span>
                </div>
              </div>
            </div>

            {/* ════ SEARCH (tablet +) ════ */}
            <div className="hidden md:flex flex-1 relative group items-center max-w-xl lg:max-w-2xl">
              <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                <Search size={17} />
              </div>
              <input
                type="text"
                placeholder="Search by SKU, Product Name..."
                onClick={handleSearchFocus}
                readOnly
                className="
                  w-full bg-slate-50 border-2 border-slate-100 rounded-2xl
                  py-3 pl-12 pr-28
                  focus:outline-none focus:border-amber-500/50 focus:bg-white
                  transition-all text-sm font-medium cursor-pointer
                "
              />
              <button className="absolute right-2 bg-[#0F172A] text-white px-4 py-1.5 rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
                Search
              </button>
            </div>

            {/* ════ RIGHT ACTIONS ════ */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 ml-auto">

              {/* Location */}
              <LocationDisplay userAddress={userAddress} />

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="relative p-2 sm:p-2.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full border border-amber-500/20 cursor-pointer transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} className="text-slate-700" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full border border-amber-500/20 cursor-pointer transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} className="text-amber-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="hidden sm:block h-7 w-px bg-slate-200" />

              {/* Account */}
              <div className="relative" ref={accountRef}>
                <button
                   onClick={() => {
      if (!isAuthenticated) {
        dispatch(openModal('login'));
      } else {
        setIsAccountOpen((v) => !v);
      }
    }}
                  className="flex items-center gap-1.5 p-1 sm:pr-3 lg:pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all"
                >
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                      isAuthenticated
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                        : 'bg-[#0F172A]'
                    }`}
                  >
                    <User size={15} className="text-white" />
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">
                      {isAuthenticated ? 'Welcome' : 'Sign In'}
                    </p>
                    <p className="text-[11px] font-black text-[#0F172A] max-w-[80px] truncate leading-none">
                      {isAuthenticated ? (user?.name || 'User') : 'My Business'}
                    </p>
                  </div>
                  <ChevronDown size={13} className="text-slate-400 hidden lg:block" />
                </button>

                {/* Dropdown */}
                {isAuthenticated && isAccountOpen && (
  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 
                  transition-all duration-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1 text-[11px]">
                        <p className="font-bold text-slate-900">{user?.name || 'User'}</p>
                        <p className="text-slate-500 truncate">{user?.email || user?.phone}</p>
                      </div>
                     <Link 
  to="/account/userprofile" 
  onClick={() => setIsAccountOpen(false)}
  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
>
  <User size={14} /> My Profile
</Link>

<Link 
  to="/account/userorders" 
  onClick={() => setIsAccountOpen(false)}
  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
>
  <Package size={14} /> My Orders
</Link>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOutState}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 border-t border-slate-100 pt-2 transition-colors"
                      >
                        <LogOut size={14} />
                        {isLoggingOutState ? '...' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger (mobile / tablet) */}
              <button
                className="lg:hidden p-1.5 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH BAR (shows below main row on < md) ── */}
        {/* <div className="md:hidden bg-white border-b border-slate-100 px-3 py-2.5">
          <div
            className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer"
            onClick={handleSearchFocus}
          >
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-500 font-medium">Search by SKU, Product Name...</span>
            <span className="ml-auto bg-[#0F172A] text-white text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
              Search
            </span>
          </div>
        </div> */}

        {/* ── MOBILE MENU OVERLAY ── */}
 <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>

  {/* Backdrop */}
  <div
    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
    onClick={() => setIsMobileMenuOpen(false)}
  />

  {/* Drawer */}
  <div className={`absolute top-0 right-0 h-full w-[295px] bg-white flex flex-col rounded-l-2xl shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#478B8D' }}>
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 leading-tight">OfferWaleBaba</p>
          <p className="text-[11px] leading-tight" style={{ color: '#478B8D' }}>Wholesale & Retail</p>
        </div>
      </div>
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
      >
        <X size={15} />
      </button>
    </div>


    {isAuthenticated ? (
  <div className="mx-4 mt-3 mb-2 px-3.5 py-3 rounded-xl flex items-center justify-between gap-3" style={{ background: '#f0f7f7' }}>
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold" style={{ background: '#478B8D' }}>
        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#478B8D' }}>Welcome back</p>
        <p className="text-sm font-medium text-gray-800 truncate leading-tight">{user?.name || 'User'}</p>
      </div>
    </div>
    <Link
      to="/account/userprofile"
      onClick={() => setIsMobileMenuOpen(false)}
      className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition"
      style={{ color: '#478B8D', background: 'white', border: '1px solid #d0e8e8' }}
    >
      My Account
    </Link>
  </div>
) : (
  <div className="mx-4 mb-2">
    <button
      onClick={() => { setIsMobileMenuOpen(false); dispatch(openModal('login')); }}
      className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition"
      style={{ background: '#478B8D' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <User size={15} className="text-white" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Guest</p>
          <p className="text-sm font-medium text-white leading-tight">Sign in to your account</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-white/60" />
    </button>
  </div>
)}

    {/* Search */}
    <div className="px-4 pt-3.5 pb-2.5">
      <div
        onClick={() => { setIsMobileMenuOpen(false); setIsSearchModalOpen(true); }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition"
      >
        <Search size={14} className="text-gray-400" />
        <span className="text-sm text-gray-400">Search products...</span>
      </div>
    </div>

    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto px-3 pb-5">

      <p className="text-[10px] font-semibold uppercase tracking-widest mt-3 mb-1.5 ml-1.5" style={{ color: '#478B8D' }}>
        Categories
      </p>

      <div className="flex flex-col gap-0.5 mb-4">
        {categories.map((cat, i) => (
          <Link
            key={i}
            to={cat.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className="group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-gray-800 hover:bg-[#f5fafa] transition-colors"
          >
            <span className="w-2 h-2 rounded-lg bg-gray-100 group-hover:bg-[#478B8D] flex items-center justify-center flex-shrink-0 transition-colors">
              {cat.icon && <cat.icon size={15} className="text-gray-500 group-hover:text-white transition-colors" />}
            </span>
            {cat.label}
            <ChevronRight size={13} className="text-gray-300 ml-auto" />
          </Link>
        ))}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 ml-1.5 text-gray-400">
        More
      </p>

      <div className="flex flex-col gap-0.5 mb-4">
        {[
          { icon: Info, label: 'About us', path: '/wholesale/about' },
          { icon: CircleUser, label: 'Contact us', path: '/contact' },
          { icon: Phone, label: 'Customer care', path: '/wholesale/customer-care' },
        ].map(({ icon: Icon, label, path }) => (
        <Link
  to={path}
  key={label}
  onClick={() => setIsMobileMenuOpen(false)}
  className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer transition-colors"
>
  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
    <Icon size={15} className="text-gray-500" />
  </span>
  {label}
</Link>
        ))}
      </div>

      <div className="h-px bg-gray-100 my-4" />

      {isAuthenticated && (
        <button
          onClick={()=>{
            setIsMobileMenuOpen(false);
            handleLogout()
            navigate("/")
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors mb-6"
        >
          <LogOut size={15} /> Sign out
        </button>
      )}

    </div>
  </div>
</div>

        {/* ── DESKTOP CATEGORY BAR ── */}
        <div className="border-b border-slate-100 hidden lg:block shadow-sm">
          <div className="max-w-[1440px] mx-auto px-44 xl:px-56 flex w-full items-center">

            {/* HOME */}
            <Link
              to="/"
              className="px-5 xl:px-6 py-4 xl:py-5 text-sm font-black uppercase tracking-wider text-slate-700 hover:text-[#35858E] transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <img className="w-4 h-4 object-cover animate-bounce" src={LOGO2} alt="" />
              Home
            </Link>

            {/* ABOUT */}
            <Link
              to="/wholesale/about"
              className="px-5 xl:px-6 py-4 xl:py-5 text-sm font-black uppercase tracking-wider text-slate-700 hover:text-[#35858E] transition-all duration-300 whitespace-nowrap"
            >
              About Us
            </Link>

            {/* PRODUCTS MEGA MENU */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-2 px-6 xl:px-8 py-4 xl:py-5 text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                  isMegaMenuOpen ? 'bg-[#35858E] text-[#0F172A]' : 'text-slate-700 hover:text-amber-500'
                }`}
              >
                Products
                <ChevronDown size={14} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* MEGA MENU */}
              <div
                className={`absolute top-full left-0 w-[720px] xl:w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-8 xl:p-10 transition-all duration-300 origin-top z-50 ${
                  isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
                }`}
              >
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  {categories.map((category, idx) => (
                    <Link
                      key={idx}
                      to={category.path}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#478B8D]/40 transition-all group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#478B8D] group-hover:scale-150 transition-all flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text[#478B8D] uppercase tracking-tight">
                        {category.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTACT */}
            <Link
              to="/contact"
              className="px-5 xl:px-6 py-4 xl:py-5 text-sm font-black uppercase tracking-wider text-slate-700 hover:text-[#35858E] transition-all duration-300 whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* ── SIDEBARS & MODALS ── */}
      <WholesaleCartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onOpenAuth={handleOpenAuth} />
      <WishlistSidebar isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} onOpenAuth={handleOpenAuth} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} initialQuery={searchQuery} />
    </>
  );
};

export default Navbar;




















// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X, LogOut,
//   Package, ShieldCheck, Zap
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
// import { logout, selectUser, selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
// import { useLogoutMutation } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
// import LOGO from "../../assets/logo2.png";
// import LOGO2 from "../../assets/home (3).png";
// import LOGO3 from "../../assets/offer wale baba RESIZE.jpg";
// import LOGO4 from "../../assets/offer wale baba. PNG.png";
// import LOGO5 from "../../assets/offer wale baba.GIF";
// // import VID1 from "../../assets/offer wale baba.GIF";
// import VID1 from "../../assets/Video1.mp4"
// import VID2 from "../../assets/Video2.mp4"
// import LOGO6 from "../../assets/home (3).png";
// // import { selectDisplayedData } from 'recharts/types/state/selectors/axisSelectors';
// import { selectDisplayCartCount } from '../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
// import WholesaleCartSidebar from '../HomeComponents/Sidebar/CartSidebar';
// import WishlistSidebar from '../HomeComponents/Sidebar/Wishlist';
// import { selectDisplayWishlistCount } from '../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';
// import { Link, useNavigate } from 'react-router-dom';
// import SearchModal from './Search_Modal/SearchModal';
// import { clearAddressErrors, fetchAddresses, selectDefaultAddress } from '../REDUX_FEATURES/REDUX_SLICES/Useraddressslice';
// import { setLoggingOut } from '../../SERVICES/Wholesaleaxios';

// const LocationDisplay = ({ userAddress }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   let navigate = useNavigate();
//   const isLoggedIn = useSelector(selectIsAuthenticated);

//   let handleAddress = () => {
//     if(isLoggedIn) {
//       navigate('/account/useraddress');
//     } else {
//       onOpenAuth();
//     }
//   }
//   const getDisplayAddress = () => {
//     if (isLoggedIn && userAddress) {
//       const parts = [];
//       if (userAddress.city) parts.push(userAddress.city);
//       if (userAddress.postalCode) parts.push(userAddress.postalCode);
//       if (parts.length > 0) return parts.join(', ');
//       if (userAddress.addressLine1) return userAddress.addressLine1.substring(0, 20);
//       return "Select Address";
//     }
//     return isLoggedIn ? "SELECT ADDRESS" : "ADDRESS";
//   };
//    let address = getDisplayAddress()

//   const destinations = [
    
//     address === !"ADDRESS" ? getDisplayAddress() : address,
//     "WAREHOUSE 1",
//     "WAREHOUSE 2",
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsAnimating(true);
//       setTimeout(() => {
//         setCurrentIndex((prev) => (prev + 1) % destinations.length);
//         setIsAnimating(false);
//       }, 300);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [isLoggedIn, userAddress]);

//   return (
//   <div className="hidden xl:flex items-center gap-3 bg-white cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-all hover:border-gray-300 group">

//   <MapPin size={20} className="text-red-500 animate-bounce" />

//   <div onClick={handleAddress} className="flex flex-col w-44 overflow-hidden">
    
//     <span className="text-[10px] text-gray-500 font-semibold uppercase leading-none">
//       Deliver to
//     </span>

//   <div className="flex items-center mt-1">

//   {!isLoggedIn && (
//     <span className="text-sm font-medium text-gray-700 mr-1 whitespace-nowrap">
//       Your
//     </span>
//   )}

//   <div className="relative h-[20px] overflow-hidden flex-1">
    
//     <span
//       className="absolute left-0 w-full text-sm font-semibold text-gray-900 leading-[20px] transition-transform duration-500 ease-in-out"
//       style={{
//         top: 0,
//         transform: isAnimating && !isLoggedIn || isAnimating && ( isLoggedIn && address === "SELECT ADDRESS") ? "translateY(-100%)" : "translateY(0)",
//       }}
//     >
//       { isLoggedIn && !( isLoggedIn && address === "SELECT ADDRESS") ? address : destinations[currentIndex]}
//     </span>

//     <span
//       className="absolute left-0 w-full text-sm font-semibold text-gray-900 leading-[20px] transition-transform duration-500 ease-in-out"
//       style={{
//         top: "100%",
//         transform: isAnimating && !isLoggedIn ? "translateY(-100%)" : "translateY(0)",
//         transitionDelay: isAnimating && !isLoggedIn ? "0.25s" : "0s",
//       }}
//     >
//       { isLoggedIn ? address : destinations[(currentIndex + 1) % destinations.length]}
//     </span>

//   </div>
// </div>
//   </div>
// </div>
//   );
// };

// const Navbar = ({ searchQuery, setSearchQuery }) => {
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);
//   const cartCount = useSelector(selectDisplayCartCount);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const wishlistCount = useSelector(selectDisplayWishlistCount);
//     const userAddress = useSelector(selectDefaultAddress);
//     console.log(userAddress);
    

//   const [logoutMutation] = useLogoutMutation();
  
//   const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// const [wishlistOpen, setWishlistOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
//   const [showSearchTooltip, setShowSearchTooltip] = useState(false);
//   const scrollPos = useRef(0);
// const ticking = useRef(false);

//   // Close mobile menu on resize to desktop
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
//    useEffect(() => {
//     const hasSeenSearchTooltip = localStorage.getItem('hasSeenSearchTooltip');
//     if (!hasSeenSearchTooltip) {
//       setShowSearchTooltip(true);
//       const timer = setTimeout(() => {
//         setShowSearchTooltip(false);
//         localStorage.setItem('hasSeenSearchTooltip', 'true');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, []);
//    const handleSearchFocus = useCallback(() => {
//     setIsSearchModalOpen(true);
//   }, []);

//   /** * ROBUST SCROLL LOGIC 
//    * Uses Hysteresis (buffer) to prevent flickering 
//    */
//   useEffect(() => {
//     const handleScroll = () => {
//       scrollPos.current = window.scrollY;
//       if (!ticking.current) {
//         window.requestAnimationFrame(() => {
//           const currentScroll = scrollPos.current;
          
//           // Logic: If scrolling down, trigger at 80px. 
//           // If scrolling back up, don't return to "normal" until 10px.
//           // This "gap" prevents the stuck/flicker loop.
//           if (currentScroll > 80) {
//             setScrolled(true);
//           } else if (currentScroll < 10) {
//             setScrolled(false);
//           }
          
//           ticking.current = false;
//         });
//         ticking.current = true;
//       }
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//      setLoggingOut(true);
//     try {
//        await logoutMutation().unwrap();
//     dispatch(logout());
//     localStorage.removeItem("accessToken"); // 👈 clear token immediately
//     } catch (error) {
//       dispatch(logout());
//       console.error('[Navbar] Logout error:', error);
//           localStorage.removeItem("accessToken");
//     } finally {
//       setIsLoggingOut(false);
//       setLoggingOut(false)
//     }
//   };
//   // Yeh function add karo existing handlers ke saath (handleLogout ke baad)

// const handleOpenAuth = () => {
//   setWishlistOpen(false);
//   dispatch(openModal('login'));  // ✅ openModal is already imported
// };

//   const handleAccountClick = () => {
//     if (!isAuthenticated) {
//       dispatch(openModal('login'));
//     }
//   };

//   const categories = [
//     { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
//     { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
//     { label: "Baby Items", path: "/category/baby-items" },
//     { label: "Stationary", path: "/category/stationary" },
//     { label: "Cleaning Supplies", path: "/category/cleaning-and-housekeeping-supplies" },
//     { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
//     { label: "Tours & Travels", path: "/category/tours-and-travels" },
//     { label: "Fashion World", path: "/category/fashion-world" },
//     { label: "Gifts", path: "/category/gifts" },
//     { label: "Mix-Items", path: "/category/mix-items" },
//     { label: "Car Accessories", path: "/category/car-accessories" },
//   ];
 
//   useEffect(() => {
//     if (isAuthenticated) {
//       dispatch(fetchAddresses());
//     }
//   }, [dispatch, isAuthenticated]);
//   const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

//   return (
//     <>
//      <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm bg-white">
//       {/* TOP UTILITY STRIP */}
//      {/* ══════════════════════════════════════════════
//     DROP-IN REPLACEMENT — paste inside your <nav>
//     ══════════════════════════════════════════════ */}

// {/* TOP UTILITY STRIP — desktop only */}
// <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//   <div className="flex gap-6 items-center">
//     <span className="flex items-center gap-2 border-r border-white/10 pr-6">
//       <ShieldCheck size={13} className="text-amber-500" /> GST Verified Portal
//     </span>
//     <span className="flex items-center gap-2 border-r border-white/10 pr-6">
//       <Package size={13} className="text-amber-500" /> Bulk Order Discounts
//     </span>
//     <span className="flex items-center gap-2">
//       <Zap size={13} className="text-amber-500" /> Fast Enterprise Delivery
//     </span>
//   </div>
//   <div className="flex gap-6 items-center">
//     <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//     <a href="tel:+919370686008" className="hover:text-amber-500 transition-colors text-amber-500">
//       Support: +91 93706 86008
//     </a>
//   </div>
// </div>

// {/* MAIN NAVBAR ROW */}
// <div
//   className={`border-b border-slate-200 bg-white transition-all duration-300 ${
//     scrolled ? "shadow-md" : ""
//   }`}
// >
//   <div
//     className="
//       max-w-[1440px]
//       mx-auto
//       px-3 sm:px-6 lg:px-10
//       flex items-center
//       gap-2 sm:gap-4 lg:gap-8
//       h-[72px] sm:h-[84px] lg:h-auto
//     "
//   >

//     {/* ── LOGO ── */}
//   <div
//     className="
//       relative
//       flex-shrink-0
//       cursor-pointer

//       flex items-center

//       h-[52px]
//       sm:h-[64px]
//       md:h-[78px]
//       lg:h-[92px]

//       w-[95px]
//       sm:w-[125px]
//       md:w-[160px]
//       lg:w-[210px]
//       xl:w-[240px]

//       overflow-visible
//     "
//     onClick={() => (window.location.href = "/")}
//   >

//     {/* LOGO VIDEO */}
//     <video
//       autoPlay
//       loop
//       muted
//       playsInline
//       src={VID2}
//       className="
//       md:mt-14 md:ml-10
//        w-38
//         h-36
//         object-contain
//         select-none
//         pointer-events-none
//         block
//       "
//     />

//     {/* WHOLESALE TAG */}
//     <div
//       className="
//         absolute
//         z-20

//         top-[18%]
//         right-[-18%]

//         sm:top-[16%]
//         sm:right-[-16%]

//         md:top-[20%]
//         md:right-[-14%]

//         lg:top-[22%]
//         lg:right-[-10%]

//         xl:top-[24%]
//         xl:right-[-8%]

//         flex items-center
//         gap-[3px]

//         px-1.5 py-[3px]
//         sm:px-2 sm:py-[4px]
//         md:px-2.5 md:py-1

//         rounded-full

//         bg-[#2563EB]/95
//         backdrop-blur-md

//         border border-white/10

//         shadow-lg
//         shadow-blue-500/20

//         text-white

//         text-[5px]
//         sm:text-[6px]
//         md:text-[7px]
//         lg:text-[8px]

//         font-black
//         uppercase

//         tracking-[0.14em]

//         whitespace-nowrap

//         transition-all duration-300
//       "
//     >

//       {/* Pulse Dot */}
//       <span
//         className="
//           w-1 h-1
//           sm:w-[5px] sm:h-[5px]

//           rounded-full
//           bg-blue-100

//           animate-pulse

//           flex-shrink-0
//         "
//       />

//       <span className="leading-none">
//         Wholesale
//       </span>
//     </div>
//   </div>

//     {/* ── SEARCH (ONLY TABLET/DESKTOP) ── */}
//     <div className="hidden md:flex flex-1 relative group items-center max-w-xl lg:max-w-2xl">
//       <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
//         <Search size={17} />
//       </div>

//       <input
//         type="text"
//         placeholder="Search by SKU, Product Name..."
//         onClick={handleSearchFocus}
//         readOnly
//         className="
//           w-full
//           bg-slate-50
//           border-2 border-slate-100
//           rounded-2xl
//           py-3 pl-12 pr-28
//           focus:outline-none
//           focus:border-amber-500/50
//           focus:bg-white
//           transition-all
//           text-sm
//           font-medium
//           cursor-pointer
//         "
//       />

//       <button
//         className="
//           absolute right-2
//           bg-[#0F172A]
//           text-white
//           px-4 py-1.5
//           rounded-xl
//           text-[10px]
//           font-bold
//           hover:bg-slate-800
//           transition-all
//           uppercase
//           tracking-wider
//         "
//       >
//         Search
//       </button>
//     </div>

//     {/* ── RIGHT ACTIONS ── */}
//     <div className="flex items-center gap-1 sm:gap-2.5 lg:gap-4 ml-auto">

//       {/* Location */}
//       <div className="hidden xl:flex">
//         <LocationDisplay userAddress={userAddress} />
//       </div>

//       {/* Wishlist */}
//       <button
//         onClick={() => setWishlistOpen(true)}
//         className="
//           relative
//           p-1.5 sm:p-2.5 lg:p-3
//           bg-amber-500/10
//           hover:bg-amber-500/20
//           rounded-full
//           border border-amber-500/20
//           cursor-pointer
//           transition-colors
//         "
//         aria-label="Wishlist"
//       >
//         <Heart size={18} className="text-slate-700" />

//         {wishlistCount > 0 && (
//           <span
//             className="
//               absolute top-0 right-0
//               bg-red-500 text-white
//               text-[8px] font-black
//               w-4 h-4
//               flex items-center justify-center
//               rounded-full
//             "
//           >
//             {wishlistCount > 99 ? "99+" : wishlistCount}
//           </span>
//         )}
//       </button>

//       {/* Cart */}
//       <button
//         onClick={() => setIsCartOpen(true)}
//         className="
//           relative
//           p-1.5 sm:p-2.5 lg:p-3
//           bg-amber-500/10
//           hover:bg-amber-500/20
//           rounded-full
//           border border-amber-500/20
//           cursor-pointer
//           transition-colors
//         "
//         aria-label="Cart"
//       >
//         <ShoppingCart size={18} className="text-amber-600" />

//         {cartCount > 0 && (
//           <span
//             className="
//               absolute top-0 right-0
//               bg-amber-500 text-white
//               text-[8px] font-black
//               w-4 h-4
//               flex items-center justify-center
//               rounded-full
//             "
//           >
//             {cartCount > 99 ? "99+" : cartCount}
//           </span>
//         )}
//       </button>

//       {/* Divider */}
//       <div className="hidden sm:block h-7 w-px bg-slate-200" />

//       {/* Account */}
//       <div className="relative group">
//         <button
//           onClick={handleAccountClick}
//           className="
//             flex items-center gap-1.5
//             p-1
//             sm:pr-3 lg:pr-4
//             bg-white
//             border border-slate-200
//             rounded-full
//             hover:shadow-md
//             transition-all
//           "
//         >
//           <div
//             className={`
//               w-8 h-8 lg:w-10 lg:h-10
//               rounded-full
//               flex items-center justify-center
//               shadow-md flex-shrink-0
//               ${
//                 isAuthenticated
//                   ? "bg-gradient-to-br from-amber-500 to-amber-600"
//                   : "bg-[#0F172A]"
//               }
//             `}
//           >
//             <User size={15} className="text-white" />
//           </div>

//           <div className="hidden sm:block text-left leading-tight">
//             <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">
//               {isAuthenticated ? "Welcome" : "Sign In"}
//             </p>

//             <p className="text-[11px] font-black text-[#0F172A] max-w-[80px] truncate leading-none">
//               {isAuthenticated ? (user?.name || "User") : "My Business"}
//             </p>
//           </div>

//           <ChevronDown
//             size={13}
//             className="text-slate-400 hidden lg:block"
//           />
//         </button>

//         {/* Dropdown */}
//         {isAuthenticated && (
//           <div
//             className="
//               absolute right-0 mt-2
//               w-56 bg-white rounded-xl
//               shadow-xl border border-slate-100
//               opacity-0 invisible
//               group-hover:opacity-100
//               group-hover:visible
//               transition-all duration-200 z-50
//             "
//           >
//             <div className="p-2">

//               <div className="px-3 py-2 border-b border-slate-100 mb-1 text-[11px]">
//                 <p className="font-bold text-slate-900">
//                   {user?.name || "User"}
//                 </p>

//                 <p className="text-slate-500 truncate">
//                   {user?.email || user?.phone}
//                 </p>
//               </div>

//               <Link
//                 to="/account/userprofile"
//                 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
//               >
//                 <User size={14} /> My Profile
//               </Link>

//               <Link
//                 to="/account/userorders"
//                 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
//               >
//                 <Package size={14} /> My Orders
//               </Link>

//               <button
//                 onClick={handleLogout}
//                 disabled={isLoggingOut}
//                 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 border-t border-slate-100 pt-2 transition-colors"
//               >
//                 <LogOut size={14} />
//                 {isLoggingOut ? "..." : "Sign Out"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Menu */}
//       <button
//         className="
//           lg:hidden
//           p-1.5
//           text-slate-800
//           hover:bg-slate-100
//           rounded-xl
//           transition-colors
//         "
//         onClick={() => setIsMobileMenuOpen(true)}
//         aria-label="Open menu"
//       >
//         <Menu size={21} />
//       </button>

//     </div>
//   </div>
// </div>

//       {/* MOBILE MENU OVERLAY */}
//       <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
//         <div 
//           className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
//           onClick={() => setIsMobileMenuOpen(false)}
//         />
//         <div className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//           <div className="flex items-center justify-between p-4 border-b">
//             <span className="font-black text-slate-800 uppercase tracking-tighter">Menu</span>
//             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
//               <X size={20} />
//             </button>
//           </div>

//           <div className="p-4 flex flex-col gap-1 overflow-y-auto h-[calc(100%-70px)]">
//             <div className="mb-4">
//                <div className="relative">
//                   <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
//                 <div
//   onClick={() => {
//     setIsMobileMenuOpen(false);
//     setIsSearchModalOpen(true);
//   }}
//   className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
// >
//   <Search size={16} className="text-slate-400" />
//   <span className="text-sm text-slate-500">Search products...</span>
// </div>
//                </div>
//             </div>

//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Categories</p>
//             {categories.map((cat, i) => (
//               <a key={i} href={cat.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-slate-700 font-bold text-sm transition-all uppercase tracking-tight">
//                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//                 {cat.label}
//               </a>
//             ))}
            
//             {isAuthenticated && (
//                <button onClick={handleLogout} className="mt-4 flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 font-bold text-sm">
//                   <LogOut size={16} /> Sign Out
//                </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* DESKTOP CATEGORY BAR */}
//    <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
//   <div className="max-w-[1440px] mx-auto px-72 flex w-full items-center justify-between">

//     {/* LEFT NAV */}
//     <div className="flex items-center">

//       {/* HOME */}
//       <Link
//         to="/"
//         className="
//           px-6 py-5 text-sm font-black uppercase tracking-wider
//           text-slate-700 hover:text-amber-500
//           transition-all duration-300 flex items-center gap-2
//         "
//       >
//          <img className='w-4 h-4 object-cover animate-bounce' src={LOGO2} alt="" />  Home
//       </Link>

//       {/* ABOUT */}
//       <Link
//         to="/wholesale/about"
//         className="
//           px-6 py-5 text-sm font-black uppercase tracking-wider
//           text-slate-700 hover:text-amber-500
//           transition-all duration-300
//         "
//       >
//         About Us
//       </Link>

//       {/* DISCOVER PRODUCTS */}
//       <div
//         className="relative"
//         onMouseEnter={() => setIsMegaMenuOpen(true)}
//         onMouseLeave={() => setIsMegaMenuOpen(false)}
//       >
//         <button
//           className={`
//             flex items-center gap-3 px-8 py-5 text-sm font-black
//             uppercase tracking-wider transition-all duration-300
//             ${
//               isMegaMenuOpen
//                 ? "bg-amber-500 text-[#0F172A]"
//                 : "text-slate-700 hover:text-amber-500"
//             }
//           `}
//         >
//           Products
//         </button>

//         {/* MEGA MENU */}
//         <div
//           className={`
//             absolute top-full left-0 w-[800px]
//             bg-white shadow-2xl rounded-br-[2.5rem]
//             border-x border-b border-slate-100
//             p-10 transition-all duration-300 origin-top z-50
//             ${
//               isMegaMenuOpen
//                 ? "opacity-100 visible translate-y-0"
//                 : "opacity-0 invisible -translate-y-4"
//             }
//           `}
//         >
//           <div className="grid grid-cols-2 gap-x-12 gap-y-4">
//             {categories.map((category, idx) => (
//               <Link
//                 key={idx}
//                 to={category.path}
//                 className="
//                   flex items-center gap-4 p-3 rounded-2xl
//                   hover:bg-amber-50 transition-all group
//                 "
//               >
//                 <div
//                   className="
//                     w-1.5 h-1.5 rounded-full bg-slate-300
//                     group-hover:bg-amber-500
//                     group-hover:scale-150 transition-all
//                   "
//                 />

//                 <span
//                   className="
//                     text-sm font-bold text-slate-700
//                     group-hover:text-amber-600
//                     uppercase tracking-tight
//                   "
//                 >
//                   {category.label}
//                 </span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* CONTACT */}
//       <Link
//         to="/contact"
//         className="
//           px-6 py-5 text-sm font-black uppercase tracking-wider
//           text-slate-700 hover:text-amber-500
//           transition-all duration-300
//         "
//       >
//         Contact Us
//          </Link>
//     </div>
//     {/* <div className='px-2 py-4 rounded-full bg-yellow-500 text-zinc-50'>Start Shopping</div> */}
//   </div>
// </div>
//     </nav>
//       <WholesaleCartSidebar
//         isOpen={isCartOpen}
//         onClose={() => setIsCartOpen(false)}
//         onOpenAuth={handleOpenAuth}
//       />
//         <WishlistSidebar
//       isOpen={wishlistOpen}
//       onClose={() => setWishlistOpen(false)}
//       onOpenAuth={handleOpenAuth}
//     />
//      {/* Search Modal - Reused for both mobile and desktop */}
//       <SearchModal 
//         isOpen={isSearchModalOpen}
//         onClose={() => setIsSearchModalOpen(false)}
//         initialQuery={searchQuery}
//       />
    
//     </>
//   );
// };

// export default Navbar;




















// try to fix the flicking issue of navbar 

//  import React, { useState, useEffect } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X, LogOut,
//   Package, ShieldCheck, Zap
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
// import { logout, selectUser, selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
// import { useLogoutMutation } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
// import LOGO from "../../assets/logo2.png";
// import { selectCartTotalItems } from '../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);
//   const cartCount = useSelector(selectCartTotalItems);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const [logoutMutation] = useLogoutMutation();
  
//   const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   // Close mobile menu on resize to desktop
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await logoutMutation().unwrap();
//       dispatch(logout());
//     } catch (error) {
//       dispatch(logout());
//       console.error('[Navbar] Logout error:', error);
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const handleAccountClick = () => {
//     if (!isAuthenticated) {
//       dispatch(openModal('login'));
//     }
//   };

//   const categories = [
//     { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
//     { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
//     { label: "Fashion World", path: "/category/fashion-world" },
//     { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
//     { label: "Tours & Travels", path: "/category/tours-and-travels" },
//     { label: "Stationary", path: "/category/stationary" },
//     { label: "Baby Items", path: "/category/baby-items" },
//     { label: "Car Accessories", path: "/category/car-accessories" },
//     { label: "Cleaning Supplies", path: "/category/mix-items-daily-use" },
//     { label: "Gifts", path: "/category/gifts" }
//   ];

//   const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

//   return (
//     <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm bg-white">
//       {/* TOP UTILITY STRIP */}
//       <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//         <div className="flex gap-8 items-center">
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
//           </span>
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <Package size={14} className="text-amber-500" /> Bulk Order Discounts
//           </span>
//           <span className="flex items-center gap-2">
//             <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
//           </span>
//         </div>
//         <div className="flex gap-6 items-center">
//           <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//           <a href="#" className="hover:text-amber-500 transition-colors text-amber-500">Support: +1 800-WHOLESALE</a>
//         </div>
//       </div>

//       {/* MAIN NAVBAR */}
//       <div className={`transition-all duration-300 border-b border-slate-200 ${scrolled ? 'py-1 shadow-md' : 'py-2 lg:py-4'}`}>
//         <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between gap-2 lg:gap-10">
          
//           {/* Logo Section - Fixed Width on Mobile to prevent squishing */}
//           <div className="flex-shrink-0 flex items-center cursor-pointer min-w-[120px] lg:min-w-[180px]">
//             <img
//               src={LOGO}
//               alt="Offer Wale Baba"
//               onClick={() => window.location.href = "/"}
//               className={`transition-all duration-500 object-contain ${scrolled ? 'h-12 lg:h-16' : 'h-14 lg:h-24'}`}
//             />
//           </div>

//           {/* Desktop Search */}
//           <div className="hidden md:flex flex-grow max-w-2xl relative group items-center">
//             <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
//               <Search size={18} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by SKU, Product Name..."
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all text-sm font-medium"
//             />
//             <button className="absolute right-2 bg-[#0F172A] text-white px-5 py-1.5 rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
//               Search
//             </button>
//           </div>

//           {/* Action Icons Group */}
//           <div className="flex items-center gap-2 lg:gap-6">
//             {/* Desktop Map Pin */}
//             <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 group">
//               <div className="p-2.5 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
//                 <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[9px] font-black text-slate-400 leading-none uppercase">Deliver to</span>
//                 <span className="text-xs font-black text-[#0F172A]">WareHouse #4</span>
//               </div>
//             </div>

//             {/* Heart & Cart */}
//             <div className="flex items-center gap-1 lg:gap-3">
//               <div className="relative p-2 lg:p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20">
//                 <Heart size={22} className="text-slate-700 group-hover:text-amber-600" />
//                 <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">0</span>
//               </div>
//               <div className="relative p-2 lg:p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20">
//                 <ShoppingCart size={22} className="text-amber-600" />
// {cartCount > 0 && (
//   <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
//     {cartCount > 99 ? "99+" : cartCount}
//   </span>
// )}              </div>
//             </div>

//             <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

//             {/* Account Button - Fixed Mobile Border Distortion */}
//             <div className="relative group">
//               <button
//                 onClick={handleAccountClick}
//                 className="flex items-center gap-2 lg:gap-3 p-1 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all sm:pr-4"
//               >
//                 <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${isAuthenticated ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-[#0F172A]'}`}>
//                   <User size={16} className="text-white" />
//                 </div>
//                 <div className="hidden sm:block text-left leading-tight">
//                   <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">
//                     {isAuthenticated ? 'Welcome' : 'Sign In'}
//                   </p>
//                   <p className="text-[11px] font-black text-[#0F172A] max-w-[80px] truncate leading-none">
//                     {isAuthenticated ? (user.name || 'User') : 'My Business'}
//                   </p>
//                 </div>
//                 <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
//               </button>

//               {/* Dropdown Desktop Only */}
//               {isAuthenticated && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                   <div className="p-2">
//                     <div className="px-3 py-2 border-b border-slate-100 mb-1 text-[11px]">
//                       <p className="font-bold text-slate-900">{user.name || 'User'}</p>
//                       <p className="text-slate-500">{user.email || user.phone}</p>
//                     </div>
//                     <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                       <User size={14} /> My Profile
//                     </button>
//                     <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                       <Package size={14} /> My Orders
//                     </button>
//                     <button 
//                       onClick={handleLogout}
//                       disabled={isLoggingOut}
//                       className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 border-t border-slate-50 pt-2"
//                     >
//                       <LogOut size={14} /> {isLoggingOut ? '...' : 'Sign Out'}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Hamburger Button */}
//             <button
//               className="lg:hidden p-2 text-slate-800 focus:bg-slate-50 rounded-lg"
//               onClick={() => setIsMobileMenuOpen(true)}
//             >
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* MOBILE MENU OVERLAY - THE ROBUST FIX */}
//       <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
//         {/* Backdrop */}
//         <div 
//           className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
//           onClick={() => setIsMobileMenuOpen(false)}
//         />
        
//         {/* Side Drawer */}
//         <div className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//           <div className="flex items-center justify-between p-4 border-b">
//             <span className="font-black text-slate-800 uppercase tracking-tighter">Menu</span>
//             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
//               <X size={20} />
//             </button>
//           </div>

//           <div className="p-4 flex flex-col gap-1 overflow-y-auto h-[calc(100%-70px)]">
//             <div className="mb-4">
//                <div className="relative">
//                   <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
//                   <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
//                </div>
//             </div>

//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Categories</p>
//             {categories.map((cat, i) => (
//               <a key={i} href={cat.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-slate-700 font-bold text-sm transition-all uppercase tracking-tight">
//                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//                 {cat.label}
//               </a>
//             ))}
            
//             {isAuthenticated && (
//                <button onClick={handleLogout} className="mt-4 flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 font-bold text-sm">
//                   <LogOut size={16} /> Sign Out
//                </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* DESKTOP CATEGORY BAR */}
//       <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
//         <div className="max-w-[1440px] mx-auto px-10 flex items-center">
//           <div
//             className="relative"
//             onMouseEnter={() => setIsMegaMenuOpen(true)}
//             onMouseLeave={() => setIsMegaMenuOpen(false)}
//           >
//             <button className={`flex items-center gap-3 px-8 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
//               <Menu size={18} /> All Categories
//             </button>

//             <div className={`absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-10 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
//               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
//                 {categories.map((category, idx) => (
//                   <a
//                     key={idx}
//                     href={category.path}
//                     className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all group"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 group-hover:scale-150 transition-all"></div>
//                     <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 uppercase tracking-tight">
//                       {category.label}
//                     </span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-8 ml-10 overflow-hidden">
//             {directCategoryLinks.map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5 whitespace-nowrap"
//               >
//                 {link}
//                 <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// upper code is responsive please check and make it more responsive and also add login functionality with auth modal and activate page route

// // Components/Common/Navbar.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X, LogOut,
//   Package, ShieldCheck, Zap
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
// import { logout, selectUser, selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
// import { useLogoutMutation } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
// import LOGO from "../../assets/logo2.png";

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const user = useSelector(selectUser);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const [logoutMutation] = useLogoutMutation();
  
//   const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await logoutMutation().unwrap();
//       dispatch(logout());
//     } catch (error) {
//       // Even if API fails, clear local state
//       dispatch(logout());
//       console.error('[Navbar] Logout error:', error);
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const handleAccountClick = () => {
//     if (!isAuthenticated) {
//       dispatch(openModal('login'));
//     }
//   };

//   const categories = [
//     { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
//     { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
//     { label: "Fashion World", path: "/category/fashion-world" },
//     { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
//     { label: "Tours & Travels", path: "/category/tours-and-travels" },
//     { label: "Stationary", path: "/category/stationary" },
//     { label: "Baby Items", path: "/category/baby-items" },
//     { label: "Car Accessories", path: "/category/car-accessories" },
//     { label: "Cleaning Supplies", path: "/category/mix-items-daily-use" },
//     { label: "Gifts", path: "/category/gifts" }
//   ];

//   const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

//   return (
//     <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm">
//       {/* TOP UTILITY STRIP */}
//       <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//         <div className="flex gap-8 items-center">
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
//           </span>
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <Package size={14} className="text-amber-500" /> Bulk Order Discounts
//           </span>
//           <span className="flex items-center gap-2">
//             <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
//           </span>
//         </div>
//         <div className="flex gap-6 items-center">
//           <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//           <a href="#" className="hover:text-amber-500 transition-colors text-amber-500">Support: +1 800-WHOLESALE</a>
//         </div>
//       </div>

//       {/* MAIN NAVBAR */}
//       <div className={`transition-all duration-500 bg-white border-b border-slate-200 flex items-center ${scrolled ? 'py-2 shadow-xl' : 'py-4'}`}>
//         <div className="max-w-[1440px] mx-auto px-6 lg:px-10 w-full flex items-center justify-between gap-6 lg:gap-10">

//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center cursor-pointer">
//             <img
//               src={LOGO}
//               alt="Offer Wale Baba"
//               onClick={() => window.location.href = "/"}
//               className={`transition-all duration-500 object-contain w-auto ${scrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-28'}`}
//             />
//           </div>

//           {/* Search */}
//           <div className="hidden md:flex flex-grow max-w-2xl relative group items-center">
//             <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by SKU, Product Name or Category..."
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium"
//             />
//             <button className="absolute right-2 bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
//               Search
//             </button>
//           </div>

//           {/* Action Icons */}
//           <div className="flex items-center gap-3 lg:gap-6">
//             <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 group">
//               <div className="p-2.5 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
//                 <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[9px] font-black text-slate-400 leading-none uppercase">Deliver to</span>
//                 <span className="text-xs font-black text-[#0F172A]">WareHouse #4</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-1 lg:gap-3">
//               <div className="relative p-3 hover:bg-slate-50 rounded-full cursor-pointer group">
//                 <Heart size={22} className="text-slate-700 group-hover:text-amber-600" />
//                 <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">0</span>
//               </div>
//               <div className="relative p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20">
//                 <ShoppingCart size={22} className="text-amber-600" />
//                 <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">24</span>
//               </div>
//             </div>

//             <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden lg:block"></div>

//             {/* ── Account Button with Auth State ─────────────────────────── */}
//             {isAuthenticated && user ? (
//               <div className="relative group">
//                 <button className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all">
//                   <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
//                     <User size={18} className="text-white" />
//                   </div>
//                   <div className="hidden lg:block text-left leading-tight">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase">Welcome</p>
//                     <p className="text-xs font-black text-[#0F172A] max-w-[100px] truncate">
//                       {user.name || user.email || user.phone || 'User'}
//                     </p>
//                   </div>
//                   <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
//                 </button>
                
//                 {/* Dropdown Menu */}
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                   <div className="p-2">
//                     <div className="px-3 py-2 border-b border-slate-100 mb-1">
//                       <p className="text-xs font-semibold text-slate-900">{user.name || 'User'}</p>
//                       <p className="text-[10px] text-slate-500">{user.email || user.phone}</p>
//                     </div>
//                     <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                       <User size={14} /> My Profile
//                     </button>
//                     <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                       <Package size={14} /> My Orders
//                     </button>
//                     <button 
//                       onClick={handleLogout}
//                       disabled={isLoggingOut}
//                       className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 border-t border-slate-100 pt-2"
//                     >
//                       <LogOut size={14} /> 
//                       {isLoggingOut ? 'Logging out...' : 'Sign Out'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <button
//                 onClick={handleAccountClick}
//                 className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all"
//               >
//                 <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center shadow-lg">
//                   <User size={18} className="text-white" />
//                 </div>
//                 <div className="hidden lg:block text-left leading-tight">
//                   <p className="text-[9px] font-bold text-slate-400 uppercase">Sign In</p>
//                   <p className="text-xs font-black text-[#0F172A]">My Business</p>
//                 </div>
//                 <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
//               </button>
//             )}

//             <button
//               className="lg:hidden p-2 text-slate-800"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* CATEGORY BAR & MEGA MENU */}
//       <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
//         <div className="max-w-[1440px] mx-auto px-10 flex items-center">
//           <div
//             className="relative"
//             onMouseEnter={() => setIsMegaMenuOpen(true)}
//             onMouseLeave={() => setIsMegaMenuOpen(false)}
//           >
//             <button className={`flex items-center gap-3 px-8 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
//               <Menu size={18} /> All Categories
//             </button>

//             <div className={`absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-10 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
//               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
//                 {categories.map((category, idx) => (
//                   <a
//                     key={idx}
//                     href={category.path}
//                     className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all group"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 group-hover:scale-150 transition-all"></div>
//                     <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 uppercase tracking-tight">
//                       {category.label}
//                     </span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-8 ml-10 overflow-hidden">
//             {directCategoryLinks.map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5 whitespace-nowrap"
//               >
//                 {link}
//                 <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// upper code have login working 
// import React, { useState, useEffect } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X,
//   Package, ShieldCheck, Zap
// } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
// import LOGO from "../../assets/logo2.png";

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const [isMegaMenuOpen,   setIsMegaMenuOpen]   = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled,         setScrolled]         = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const categories = [
//     { label: "Smart Life Gadgets",  path: "/category/smart-life-gadgets" },
//     { label: "Home & Kitchen",      path: "/category/home-and-kitchen" },
//     { label: "Fashion World",       path: "/category/fashion-world" },
//     { label: "Sports & Fitness",    path: "/category/sports-and-fitness" },
//     { label: "Tours & Travels",     path: "/category/tours-and-travels" },
//     { label: "Stationary",          path: "/category/stationary" },
//     { label: "Baby Items",          path: "/category/baby-items" },
//     { label: "Car Accessories",     path: "/category/car-accessories" },
//     { label: "Cleaning Supplies",   path: "/category/mix-items-daily-use" },
//     { label: "Gifts",               path: "/category/gifts" }
//   ];

//   const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

//   return (
//     <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm">
//       {/* 1. TOP UTILITY STRIP */}
//       <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//         <div className="flex gap-8 items-center">
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
//           </span>
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <Package size={14} className="text-amber-500" /> Bulk Order Discounts
//           </span>
//           <span className="flex items-center gap-2">
//             <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
//           </span>
//         </div>
//         <div className="flex gap-6 items-center">
//           <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//           <a href="#" className="hover:text-amber-500 transition-colors text-amber-500">Support: +1 800-WHOLESALE</a>
//         </div>
//       </div>

//       {/* 2. MAIN NAVBAR */}
//       <div className={`transition-all duration-500 bg-white border-b border-slate-200 flex items-center ${scrolled ? 'py-2 shadow-xl' : 'py-4'}`}>
//         <div className="max-w-[1440px] mx-auto px-6 lg:px-10 w-full flex items-center justify-between gap-6 lg:gap-10">

//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center cursor-pointer">
//             <img
//               src={LOGO}
//               alt="Offer Wale Baba"
//               onClick={() => window.location.href = "/"}
//               className={`transition-all duration-500 object-contain w-auto ${scrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-28'}`}
//             />
//           </div>

//           {/* Search */}
//           <div className="hidden md:flex flex-grow max-w-2xl relative group items-center">
//             <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by SKU, Product Name or Category..."
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium"
//             />
//             <button className="absolute right-2 bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
//               Search
//             </button>
//           </div>

//           {/* Action Icons */}
//           <div className="flex items-center gap-3 lg:gap-6">
//             <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 group">
//               <div className="p-2.5 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
//                 <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[9px] font-black text-slate-400 leading-none uppercase">Deliver to</span>
//                 <span className="text-xs font-black text-[#0F172A]">WareHouse #4</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-1 lg:gap-3">
//               <div className="relative p-3 hover:bg-slate-50 rounded-full cursor-pointer group">
//                 <Heart size={22} className="text-slate-700 group-hover:text-amber-600" />
//                 <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">0</span>
//               </div>
//               <div className="relative p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20">
//                 <ShoppingCart size={22} className="text-amber-600" />
//                 <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">24</span>
//               </div>
//             </div>

//             <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden lg:block"></div>

//             {/* ── Account button — opens AuthModal ─────────────────────── */}
//             <button
//               onClick={() => dispatch(openModal("register"))}
//               className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all"
//             >
//               <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center shadow-lg">
//                 <User size={18} className="text-white" />
//               </div>
//               <div className="hidden lg:block text-left leading-tight">
//                 <p className="text-[9px] font-bold text-slate-400 uppercase">Sign In</p>
//                 <p className="text-xs font-black text-[#0F172A]">My Business</p>
//               </div>
//               <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
//             </button>

//             <button
//               className="lg:hidden p-2 text-slate-800"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 3. CATEGORY BAR & MEGA MENU */}
//       <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
//         <div className="max-w-[1440px] mx-auto px-10 flex items-center">
//           <div
//             className="relative"
//             onMouseEnter={() => setIsMegaMenuOpen(true)}
//             onMouseLeave={() => setIsMegaMenuOpen(false)}
//           >
//             <button className={`flex items-center gap-3 px-8 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
//               <Menu size={18} /> All Categories
//             </button>

//             <div className={`absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-10 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
//               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
//                 {categories.map((category, idx) => (
//                   <a
//                     key={idx}
//                     href={category.path}
//                     className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all group"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 group-hover:scale-150 transition-all"></div>
//                     <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 uppercase tracking-tight">
//                       {category.label}
//                     </span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-8 ml-10 overflow-hidden">
//             {directCategoryLinks.map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5 whitespace-nowrap"
//               >
//                 {link}
//                 <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// bootom nav is static upper have auth modal and activate page route
// import React, { useState, useEffect } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X,
//   Package, ShieldCheck, Zap
// } from 'lucide-react';
// import LOGO from "../../assets/logo2.png";

// const Navbar = () => {
//   const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const categories = [
//     { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
//     { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
//     { label: "Fashion World", path: "/category/fashion-world" },
//     { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
//     { label: "Tours & Travels", path: "/category/tours-and-travels" },
//     { label: "Stationary", path: "/category/stationary" },
//     { label: "Baby Items", path: "/category/baby-items" },
//     { label: "Car Accessories", path: "/category/car-accessories" },
//     { label: "Cleaning Supplies", path: "/category/mix-items-daily-use" },
//     { label: "Gifts", path: "/category/gifts" }
//   ];

//   const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

//   return (
//     <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm">
//       {/* 1. TOP UTILITY STRIP */}
//       <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//         <div className="flex gap-8 items-center">
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
//           </span>
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <Package size={14} className="text-amber-500" /> Bulk Order Discounts
//           </span>
//           <span className="flex items-center gap-2">
//             <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
//           </span>
//         </div>
//         <div className="flex gap-6 items-center">
//           <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//           <a href="#" className="hover:text-amber-500 transition-colors text-amber-500">Support: +1 800-WHOLESALE</a>
//         </div>
//       </div>

//       {/* 2. MAIN NAVBAR */}
//       {/* Changed: Adjusted vertical padding for tall logos and set items-center */}
//       <div className={`transition-all duration-500 bg-white border-b border-slate-200 flex items-center ${scrolled ? 'py-2 shadow-xl' : 'py-4'}`}>
//         <div className="max-w-[1440px] mx-auto px-6 lg:px-10 w-full flex items-center justify-between gap-6 lg:gap-10">

//           {/* Logo Section - Handled for "tall" logos */}
//           <div className="flex-shrink-0 flex items-center cursor-pointer">
//             <img
//               src={LOGO}
//               alt="Offer Wale Baba"
//               onClick={() => window.location.href = "/"}
//               /* Developer Note: Changed fixed height to a responsive max-height */
//               className={`transition-all duration-500 object-contain w-auto ${scrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-28'}`}
//             />
//           </div>

//           {/* Large Search Bar - Perfectly Centered */}
//           <div className="hidden md:flex flex-grow max-w-2xl relative group items-center">
//             <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by SKU, Product Name or Category..."
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium"
//             />
//             <button className="absolute right-2 bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
//               Search
//             </button>
//           </div>

//           {/* Action Icons - Centered with Logo */}
//           <div className="flex items-center gap-3 lg:gap-6">
//             <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 group">
//               <div className="p-2.5 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
//                 <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[9px] font-black text-slate-400 leading-none uppercase">Deliver to</span>
//                 <span className="text-xs font-black text-[#0F172A]">WareHouse #4</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-1 lg:gap-3">
//               <div className="relative p-3 hover:bg-slate-50 rounded-full cursor-pointer group">
//                 <Heart size={22} className="text-slate-700 group-hover:text-amber-600" />
//                 <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">0</span>
//               </div>

//               <div className="relative p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20">
//                 <ShoppingCart size={22} className="text-amber-600" />
//                 <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">24</span>
//               </div>
//             </div>

//             <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden lg:block"></div>

//             <button className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all">
//               <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center shadow-lg">
//                 <User size={18} className="text-white" />
//               </div>
//               <div className="hidden lg:block text-left leading-tight">
//                 <p className="text-[9px] font-bold text-slate-400 uppercase">Sign In</p>
//                 <p className="text-xs font-black text-[#0F172A]">My Business</p>
//               </div>
//               <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
//             </button>

//             <button
//               className="lg:hidden p-2 text-slate-800"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 3. CATEGORY BAR & MEGA MENU */}
//       <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
//         <div className="max-w-[1440px] mx-auto px-10 flex items-center">
//           <div
//             className="relative"
//             onMouseEnter={() => setIsMegaMenuOpen(true)}
//             onMouseLeave={() => setIsMegaMenuOpen(false)}
//           >
//             <button className={`flex items-center gap-3 px-8 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
//               <Menu size={18} /> All Categories
//             </button>

//             {/* MEGA MENU CONTAINER */}
//             <div className={`absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-10 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
//               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
//                 {categories.map((category, idx) => (
//                   <a
//                     key={idx}
//                     href={category.path}
//                     className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all group"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 group-hover:scale-150 transition-all"></div>
//                     <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 uppercase tracking-tight">
//                       {category.label}
//                     </span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-8 ml-10 overflow-hidden">
//             {directCategoryLinks.map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5 whitespace-nowrap"
//               >
//                 {link}
//                 <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// import React, { useState, useEffect } from 'react';
// import {
//   Search, ShoppingCart, Heart, MapPin,
//   User, ChevronDown, Menu, X,
//   Package, ShieldCheck, Zap, ArrowRight,
//   Smartphone, Laptop, Watch, Shirt, Home, Percent
// } from 'lucide-react';

// const Navbar = () => {
//   const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // Handle scroll for sticky transitions
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const menuData = [
//     {
//       title: "Electronics",
//       icon: <Smartphone className="w-5 h-5 text-amber-500" />,
//       items: ["Flagship Smartphones", "Business Laptops", "TWS Earbuds", "Industrial Parts", "Enterprise Storage", "Power Solutions"]
//     },
//     {
//       title: "Fashion & Apparel",
//       icon: <Shirt className="w-5 h-5 text-amber-500" />,
//       items: ["Men's Bulk Wear", "Women's Ethnic", "Footwear Lots", "Textile Rolls", "Watches & Jewelry", "Leather Goods"]
//     },
//     {
//       title: "Home & Appliances",
//       icon: <Home className="w-5 h-5 text-amber-500" />,
//       items: ["Kitchen Appliances", "Office Furniture", "Smart Home Kits", "Bulk Decor", "Safety Equipment", "Storage Units"]
//     },
//     {
//       title: "Wholesale Central",
//       icon: <Percent className="w-5 h-5 text-amber-500" />,
//       items: ["Flash Bulk Deals", "Clearance Inventory", "Export Surplus", "Liquidation Lots", "Sample Requests", "Custom Manufacturing"]
//     }
//   ];

//   return (
//     <nav className="sticky  top-0 w-full z-[100] font-sans">
//       {/* 1. TOP UTILITY STRIP */}
//       <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
//         <div className="flex gap-8 items-center">
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
//           </span>
//           <span className="flex items-center gap-2 border-r border-white/10 pr-8">
//             <Package size={14} className="text-amber-500" /> Bulk Order Discounts
//           </span>
//           <span className="flex items-center gap-2">
//             <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
//           </span>
//         </div>
//         <div className="flex gap-6 items-center">
//           <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
//           <a href="#" className="hover:text-amber-500 transition-colors">Track Shipment</a>
//           <span className="text-amber-500">Support: +1 800-WHOLESALE</span>
//         </div>
//       </div>

//       {/* 2. MAIN NAVBAR */}
//       <div className={`transition-all duration-300 bg-white border-b border-slate-200 ${scrolled ? 'py-2 shadow-xl' : 'py-5'}`}>
//         <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-10">

//           {/* Logo Section */}
//           <div className="flex-shrink-0 flex flex-col cursor-pointer group">
//             <div className="flex items-center gap-2">
//               <div className="bg-[#0F172A] p-2 rounded-xl group-hover:bg-amber-500 transition-colors duration-500">
//                 <Package className="text-white w-7 h-7" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">WHOLEHUB</h1>
//                 <p className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase mt-1">B2B Prime Panel</p>
//               </div>
//             </div>
//           </div>

//           {/* Large Search Bar */}
//           <div className="hidden md:flex flex-grow max-w-3xl relative group">
//             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by SKU, Product Name or Category (Minimum 10 units)..."
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium"
//             />
//             <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
//               Search
//             </button>
//           </div>

//           {/* Action Icons */}
//           <div className="flex items-center gap-4 lg:gap-8">
//             <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors group">
//               <div className="p-2 bg-slate-50 rounded-full group-hover:bg-amber-50">
//                 <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[10px] font-black text-slate-400 leading-none">DELIVER TO</span>
//                 <span className="text-xs font-bold text-[#0F172A]">WareHouse #4</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <div className="relative p-3 hover:bg-slate-50 rounded-full cursor-pointer transition-all group">
//                 <Heart size={22} className="text-slate-700 group-hover:text-amber-600" />
//                 <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">0</span>
//               </div>

//               <div className="relative p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer transition-all group border border-amber-500/20">
//                 <ShoppingCart size={22} className="text-amber-600" />
//                 <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">24</span>
//               </div>

//               <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

//               <button className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all">
//                 <div className="w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center">
//                   <User size={16} className="text-white" />
//                 </div>
//                 <div className="hidden lg:block text-left">
//                   <p className="text-[9px] font-bold text-slate-400 leading-none">SIGN IN</p>
//                   <p className="text-xs font-black text-[#0F172A]">My Business</p>
//                 </div>
//                 <ChevronDown size={14} className="text-slate-400" />
//               </button>
//             </div>

//             {/* Mobile Menu Trigger */}
//             <button
//               className="lg:hidden p-2 text-slate-800"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 3. CATEGORY BAR & MEGA MENU */}
//       <div className="bg-white border-b border-slate-100 hidden lg:block">
//         <div className="max-w-[1440px] mx-auto px-10 flex items-center">

//           {/* All Categories Trigger */}
//           <div
//             className="relative"
//             onMouseEnter={() => setIsMegaMenuOpen(true)}
//             onMouseLeave={() => setIsMegaMenuOpen(false)}
//           >
//             <button className={`flex items-center gap-3 px-6 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
//               <Menu size={18} /> All Categories
//             </button>

//             {/* MEGA MENU CONTAINER */}
//             <div className={`absolute top-full left-0 w-[1100px] bg-white shadow-2xl rounded-br-3xl border-x border-b border-slate-100 p-10 grid grid-cols-4 gap-12 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
//               {menuData.map((section, idx) => (
//                 <div key={idx} className="space-y-6">
//                   <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
//                     {section.icon}
//                     <h3 className="font-black text-[#0F172A] uppercase text-xs tracking-widest">{section.title}</h3>
//                   </div>
//                   <ul className="space-y-3">
//                     {section.items.map((item, i) => (
//                       <li key={i}>
//                         <a href="#" className="text-sm font-bold text-slate-500 hover:text-amber-600 hover:translate-x-1 flex items-center gap-2 transition-all group">
//                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-amber-500 transition-colors"></div>
//                           {item}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                   <button className="text-[10px] font-black text-amber-600 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">
//                     View All Inventory <ArrowRight size={12} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Direct Category Links */}
//           <div className="flex items-center gap-10 ml-10">
//             {['Electronics', 'Apparel', 'FMCG Bulk', 'Liquidation', 'Factory Direct', 'Custom Orders'].map((link) => (
//               <a
//                 key={link}
//                 href="#"
//                 className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5"
//               >
//                 {link}
//                 <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;