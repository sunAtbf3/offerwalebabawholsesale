import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ShoppingCart, Heart, MapPin,
  User, ChevronDown, Menu, X, LogOut,
  Package, ShieldCheck, Zap,
  Info,
  CircleUser,
  Phone,
  ShoppingBag,
  ChevronRight,
  Bell
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
import { useGetAllCategoriesQuery } from '../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi';
import NotificationBellIcon from './NotificationBellIcon';
import NotificationsModal from './NotificationsModal';
import { useGetUnreadNotificationCountQuery } from '../REDUX_FEATURES/REDUX_SLICES/notificationsApi';

/* ─────────────────────────────────────────────
   LOCATION DISPLAY  (logic unchanged)
───────────────────────────────────────────── */
const LocationDisplay = ({ userAddress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const scrollPos = useRef(0);
  const ticking = useRef(false);
  const accountRef = useRef(null);

  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const openNotifications = useCallback(() => setNotificationsOpen(true), []);
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const hasUnreadNotifications = isAuthenticated && unreadCount > 0;

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

  /* ── close notifications modal on logout ── */
  useEffect(() => {
    if (!isAuthenticated) setNotificationsOpen(false);
  }, [isAuthenticated]);

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

  // ── Dynamic categories from backend API (RTK Query) ──
  const { data: apiCategories = [] } = useGetAllCategoriesQuery();
  const categories = apiCategories.map((cat) => ({
    label: cat.name,
    path: `/category/${cat.slug || cat.name?.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, '-')}`,
  }));
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

              {/* Desktop only: bell beside icons when unread (mobile uses Menu↔Bell swap) */}
              {hasUnreadNotifications && (
                <div className="hidden lg:block">
                  <NotificationBellIcon
                    count={unreadCount}
                    onClick={openNotifications}
                    variant="header"
                    showLabel={false}
                  />
                </div>
              )}

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
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false);
                          openNotifications();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Bell size={14} />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
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

              {/* Menu ↔ Notification bell swap (mobile/tablet, unread only) */}
              {hasUnreadNotifications ? (
                <div className="lg:hidden">
                  <NotificationBellIcon
                    count={unreadCount}
                    onClick={openNotifications}
                    variant="header"
                    showLabel={false}
                    shaking
                  />
                </div>
              ) : (
                <button
                  className="lg:hidden p-1.5 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  type="button"
                >
                  <Menu size={22} />
                </button>
              )}
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

    {/* Notifications — directly under Welcome back / My Account */}
    {isAuthenticated && (
      <div className="px-3 mb-1">
        <NotificationBellIcon
          count={unreadCount}
          variant="drawerRow"
          onClick={() => {
            setIsMobileMenuOpen(false);
            openNotifications();
          }}
        />
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
      {isAuthenticated && (
        <NotificationsModal
          open={notificationsOpen}
          onClose={closeNotifications}
          isLoggedIn={isAuthenticated}
        />
      )}
    </>
  );
};

export default Navbar;