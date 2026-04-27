
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ShoppingCart, Heart, MapPin,
  User, ChevronDown, Menu, X, LogOut,
  Package, ShieldCheck, Zap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice';
import { logout, selectUser, selectIsAuthenticated } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { useLogoutMutation } from '../REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
import LOGO from "../../assets/logo2.png";
// import { selectDisplayedData } from 'recharts/types/state/selectors/axisSelectors';
import { selectDisplayCartCount } from '../REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
import WholesaleCartSidebar from '../HomeComponents/Sidebar/CartSidebar';
import WishlistSidebar from '../HomeComponents/Sidebar/Wishlist';
import { selectDisplayWishlistCount } from '../REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectDisplayCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wishlistCount = useSelector(selectDisplayWishlistCount);

  const [logoutMutation] = useLogoutMutation();
  
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /** * ROBUST SCROLL LOGIC 
   * Uses Hysteresis (buffer) to prevent flickering 
   */
  useEffect(() => {
    const handleScroll = () => {
      scrollPos.current = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScroll = scrollPos.current;
          
          // Logic: If scrolling down, trigger at 80px. 
          // If scrolling back up, don't return to "normal" until 10px.
          // This "gap" prevents the stuck/flicker loop.
          if (currentScroll > 80) {
            setScrolled(true);
          } else if (currentScroll < 10) {
            setScrolled(false);
          }
          
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
    } catch (error) {
      dispatch(logout());
      console.error('[Navbar] Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  // Yeh function add karo existing handlers ke saath (handleLogout ke baad)

const handleOpenAuth = () => {
  setWishlistOpen(false);
  dispatch(openModal('login'));  // ✅ openModal is already imported
};

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      dispatch(openModal('login'));
    }
  };

  const categories = [
    { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
    { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
    { label: "Fashion World", path: "/category/fashion-world" },
    { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
    { label: "Tours & Travels", path: "/category/tours-and-travels" },
    { label: "Stationary", path: "/category/stationary" },
    { label: "Baby Items", path: "/category/baby-items" },
    { label: "Car Accessories", path: "/category/car-accessories" },
    { label: "Cleaning Supplies", path: "/category/mix-items-daily-use" },
    { label: "Gifts", path: "/category/gifts" }
  ];

  const directCategoryLinks = categories.slice(0, 6).map(cat => cat.label);

  return (
    <>
     <nav className="sticky top-0 w-full z-[100] font-sans shadow-sm bg-white">
      {/* TOP UTILITY STRIP */}
      <div className="bg-[#0F172A] text-white/70 py-2 px-6 hidden lg:flex justify-between items-center text-[11px] font-bold tracking-widest border-b border-white/5 uppercase">
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-2 border-r border-white/10 pr-8">
            <ShieldCheck size={14} className="text-amber-500" /> GST Verified Portal
          </span>
          <span className="flex items-center gap-2 border-r border-white/10 pr-8">
            <Package size={14} className="text-amber-500" /> Bulk Order Discounts
          </span>
          <span className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Fast Enterprise Delivery
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:text-amber-500 transition-colors">Taxes & Invoicing</a>
          <a href="#" className="hover:text-amber-500 transition-colors text-amber-500">Support: +1 800-WHOLESALE</a>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className={`transition-all duration-500 ease-in-out border-b border-slate-200 ${scrolled ? 'py-1 lg:py-2 shadow-md' : 'py-2 lg:py-4'}`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between gap-2 lg:gap-10">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center cursor-pointer min-w-[120px] lg:min-w-[180px]">
            <img
              src={LOGO}
              alt="Offer Wale Baba"
              onClick={() => window.location.href = "/"}
              className={`transition-all duration-500 ease-in-out object-contain ${scrolled ? 'h-10 lg:h-14' : 'h-14 lg:h-24'}`}
            />
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-grow max-w-2xl relative group items-center">
            <div className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by SKU, Product Name..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-32 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all text-sm font-medium"
            />
            <button className="absolute right-2 bg-[#0F172A] text-white px-5 py-1.5 rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
              Search
            </button>
          </div>

          {/* Action Icons Group */}
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-amber-500 group">
              <div className="p-2.5 bg-slate-50 rounded-full group-hover:bg-amber-50 transition-colors">
                <MapPin size={20} className="text-slate-600 group-hover:text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 leading-none uppercase">Deliver to</span>
                <span className="text-xs font-black text-[#0F172A]">WareHouse #4</span>
              </div>
            </div>

            {/* Heart & Cart */}
        <div className="flex items-center gap-1 lg:gap-3">
  
  {/* Wishlist Button */}
  <div
    onClick={() => setWishlistOpen(true)}
    className="relative p-2 lg:p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20"
  >
    <Heart size={22} className="text-slate-700" />
    {wishlistCount > 0 && (
      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
        {wishlistCount > 99 ? "99+" : wishlistCount}
      </span>
    )}
  </div>

  {/* Cart Button */}
  <div
    onClick={() => setIsCartOpen(true)}
    className="relative p-2 lg:p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-full cursor-pointer border border-amber-500/20"
  >
    <ShoppingCart size={22} className="text-amber-600" />
    {cartCount > 0 && (
      <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    )}
  </div>

</div>

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="relative group">
              <button
                onClick={handleAccountClick}
                className="flex items-center gap-2 lg:gap-3 p-1 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all sm:pr-4"
              >
                <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${isAuthenticated ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-[#0F172A]'}`}>
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">
                    {isAuthenticated ? 'Welcome' : 'Sign In'}
                  </p>
                  <p className="text-[11px] font-black text-[#0F172A] max-w-[80px] truncate leading-none">
                    {isAuthenticated ? (user.name || 'User') : 'My Business'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
              </button>

              {isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 text-[11px]">
                      <p className="font-bold text-slate-900">{user.name || 'User'}</p>
                      <p className="text-slate-500">{user.email || user.phone}</p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <User size={14} /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <Package size={14} /> My Orders
                    </button>
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 border-t border-slate-50 pt-2"
                    >
                      <LogOut size={14} /> {isLoggingOut ? '...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="lg:hidden p-2 text-slate-800 focus:bg-slate-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-black text-slate-800 uppercase tracking-tighter">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-1 overflow-y-auto h-[calc(100%-70px)]">
            <div className="mb-4">
               <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                  <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
               </div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Categories</p>
            {categories.map((cat, i) => (
              <a key={i} href={cat.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-slate-700 font-bold text-sm transition-all uppercase tracking-tight">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {cat.label}
              </a>
            ))}
            
            {isAuthenticated && (
               <button onClick={handleLogout} className="mt-4 flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 font-bold text-sm">
                  <LogOut size={16} /> Sign Out
               </button>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP CATEGORY BAR */}
      <div className="bg-white border-b border-slate-100 hidden lg:block shadow-sm">
        <div className="max-w-[1440px] mx-auto px-10 flex items-center">
          <div
            className="relative"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button className={`flex items-center gap-3 px-8 py-4 text-sm font-black transition-all uppercase tracking-wider ${isMegaMenuOpen ? 'bg-amber-500 text-[#0F172A]' : 'bg-[#0F172A] text-white'}`}>
              <Menu size={18} /> All Categories
            </button>

            <div className={`absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-br-[2.5rem] border-x border-b border-slate-100 p-10 transition-all duration-300 origin-top ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {categories.map((category, idx) => (
                  <a
                    key={idx}
                    href={category.path}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 group-hover:scale-150 transition-all"></div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 uppercase tracking-tight">
                      {category.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 ml-10 overflow-hidden">
            {directCategoryLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[11px] font-black text-slate-600 hover:text-amber-600 transition-colors uppercase tracking-widest relative group py-5 whitespace-nowrap"
              >
                {link}
                <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
      <WholesaleCartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={handleOpenAuth}
      />
        <WishlistSidebar
      isOpen={wishlistOpen}
      onClose={() => setWishlistOpen(false)}
      onOpenAuth={handleOpenAuth}
    />
    
    </>
  );
};

export default Navbar;
// try to fix the flicking issue of navbar 

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