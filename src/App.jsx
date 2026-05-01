import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Components/Common/Navbar';
import Footer from './Components/Common/Footer';
import Home from './Components/Website_Pages/Home';
import ProductDetail from './Components/Website_Pages/ProductDetail';
import CatProducts from './Components/HomeComponents/CatProducts/CatProducts';
import ToastConfig from './Components/Common/ToastConfig';
import AuthModal from './Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal';
import ActivatePage from './Components/Website_Pages/ActivatePage/ActivatePage';
import { useGetMeQuery } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
import { selectIsAuthenticated } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import UserTab from "./components/ADMIN_SEGMENT/ADMIN_TABS/USER/UserTab";
import AdminDashboard from "./components/ADMIN_SEGMENT/Admin_dashboard";
import './App.css';
import ShopByPrice from './Components/HomeComponents/ShopByWHoleSalePrice/ShopByPrice';
// import { fetchCart, loadGuestCart } from './Components/REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
// import { fetchWishlist, loadGuestWishlist } from './Components/REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';

// ── These two are fine at app-level — they power Navbar badges ───────────────
import useWishlistInit from "./Components/HOOKS/useWishlistInit";
import useCartInit from "./Components/HOOKS/useCartInit";
import ContactUs from './Components/HomeComponents/Contact';
import UserDashboard from './User_Side_Web_Interface/User_Dash_Segment/UserDashboard';
import Checkout from './User_Side_Web_Interface/CHECKOUT/Checkout';
import TagProducts from './Components/REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/TagProducts';

// ── Layout: hides Navbar & Footer on admin/activate routes ───────────────────
function Layout({ children }) {
  const location = useLocation();
  const hideNavFooterRoutes = ['/activate', '/babapanel', '/babadash', '/admin/login'];
      const [searchQuery, setSearchQuery]   = useState("");
  const shouldHide = hideNavFooterRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(route + '/')
  );
  return (
    <>
      {!shouldHide && <Navbar />}
      {children}
      {!shouldHide && <Footer />}
    </>
  );
}

// ── FIX: was reading state.auth.isLoggedIn (undefined) ───────────────────────
// authSlice stores isAuthenticated, not isLoggedIn.
// This caused every /account visit to redirect to "/" even when logged in.
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/category/:slug" element={<CatProducts />} />

      {/* Redirect bare /account to default tab */}
      <Route path="/account" element={<Navigate to="/account/userprofile" replace />} />
      <Route
        path="/account/:activeTab"
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />

      <Route path="/activate" element={<ActivatePage />} />
      <Route path="/shopByCategory/:slug" element={<ShopByPrice />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/no-access" element={<UserTab />} />
      <Route path="/babapanel" element={<AdminDashboard />} />
      <Route path="/babadash/*" element={<AdminDashboard />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/:slug" element={<TagProducts/>}/>
    </Routes>
  );
}
// ✅ Fix — App.jsx SessionHandler mein
function SessionHandler() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [sessionChecked, setSessionChecked] = useState(false);

  const { isLoading } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
    skip: sessionChecked, // ✅ sirf yeh — ek baar check karo, phir hamesha skip
  });

  useEffect(() => {
    if (!isLoading) setSessionChecked(true);
  }, [isLoading]);

  useWishlistInit();
  useCartInit();

  return null;
}

// ── SessionHandler: checks existing session on every app load ─────────────────
// Runs GET /auth/me once. On success → authSlice populates user + isAuthenticated.
// On 401 → authSlice quietly sets isAuthenticated = false (no error shown).
// After session is confirmed, loads the right cart/wishlist source.
// function SessionHandler() {
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const [sessionChecked, setSessionChecked] = useState(false);

//   const { isLoading } = useGetMeQuery(undefined, {
//     refetchOnMountOrArgChange: false,
//     refetchOnReconnect: false,
//     refetchOnFocus: false,
//     skip: sessionChecked && isAuthenticated,
//   });
//      // ── Cart & wishlist — fine here, they drive Navbar badges ────────────────
//     // DO NOT call these again inside any tab component
//     // useWishlistInit();
//     // useCartInit();
//     // In App.jsx — also skip wishlist/cart on admin routes
//     useWishlistInit();  // pass enabled flag
//     useCartInit();

//   // Mark session as checked once the query settles (success or error)
//   useEffect(() => {
//     if (!isLoading) setSessionChecked(true);
//   }, [isLoading]);

//   // Guest: load cart & wishlist from localStorage
//   // useEffect(() => {
//   //   if (sessionChecked && !isAuthenticated) {
//   //     dispatch(loadGuestCart());
//   //     dispatch(loadGuestWishlist());
//   //   }
//   // }, [sessionChecked, isAuthenticated, dispatch]);

//   // Authenticated: fetch cart & wishlist from server
//   // useEffect(() => {
//   //   if (sessionChecked && isAuthenticated) {
//   //     dispatch(fetchCart());
//   //     dispatch(fetchWishlist());
//   //   }
//   // }, [sessionChecked, isAuthenticated, dispatch]);

//   return null;
// }

function App() {
  return (
    <BrowserRouter>
      <ToastConfig />
      <SessionHandler />
      <AuthModal />
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
// import React, { useEffect, useState } from 'react';
// import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import Navbar from './Components/Common/Navbar';
// import Footer from './Components/Common/Footer';
// import Home from './Components/Website_Pages/Home';
// import ProductDetail from './Components/Website_Pages/ProductDetail';
// import CatProducts from './Components/HomeComponents/CatProducts/CatProducts';
// import ToastConfig from './Components/Common/ToastConfig';
// import AuthModal from './Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal';
// import ActivatePage from './Components/Website_Pages/ActivatePage/ActivatePage';
// import { useGetMeQuery } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
// import { selectIsAuthenticated } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
// import UserTab from "./components/ADMIN_SEGMENT/ADMIN_TABS/USER/UserTab";
// import AdminDashboard from "./components/ADMIN_SEGMENT/Admin_dashboard";
// import './App.css';
// import ShopByPrice from './Components/HomeComponents/ShopByWHoleSalePrice/ShopByPrice';
// import { fetchCart, loadGuestCart } from './Components/REDUX_FEATURES/REDUX_SLICES/UserCart/userCartSlice';
// import { fetchWishlist, loadGuestWishlist } from './Components/REDUX_FEATURES/REDUX_SLICES/UserWIshlist/userWishlistSLice';
// import ContactUs from './Components/HomeComponents/Contact';
// import UserDashboard from './User_Side_Web_Interface/User_Dash_Segment/UserDashboard';

// // Layout wrapper component
// function Layout({ children }) {
//   const location = useLocation();
  
//   // Define routes where Navbar & Footer should be hidden
//   const hideNavFooterRoutes = ['/activate','/babapanel','/babadash','/admin/login'];
  
//   // Also hide if path STARTS with certain patterns (for nested routes)
//   const shouldHide = hideNavFooterRoutes.includes(location.pathname);
  
//   return (
//     <>
//       {!shouldHide && <Navbar />}
//       {children}
//       {!shouldHide && <Footer />}
//     </>
//   );
// }
// // ── Optional: protect /account routes ────────────────────────────────────────
// const PrivateRoute = ({ children }) => {
//     const { isLoggedIn } = useSelector((state) => state.auth);
//     // Redirect to home if not logged in, preserving intended destination
//     return isLoggedIn ? children : <Navigate to="/" replace />;
// };

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/product/:slug" element={<ProductDetail />} />
//       <Route path="/category/:slug" element={<CatProducts />} />
//         <Route
//                     path="/account"
//                     element={<Navigate to="/account/userprofile" replace />}
//                 />
//                 <Route
//                     path="/account/:activeTab"
//                     element={
//                         <PrivateRoute>
//                             <UserDashboard />
//                         </PrivateRoute>
//                     }
//                 />
//       <Route path="/activate" element={<ActivatePage />} />
//               <Route path="/shopByCategory/:slug" element={<ShopByPrice />} />
//               <Route path='/contact' element={<ContactUs />} />


//               {/* ── Admin auth routes (public — no AdminPrivateRoute) ───── */}
//                 {/* <Route path="/admin/login"        element={<AdminLogin />} /> */}
//                 {/* <Route path="/admin/unauthorized" element={<AdminUnauthorized />} /> */}

//                         {/*
//                  * ── /no-access — shown to regular users who hit admin URLs ──
//                  * Public route — no auth needed to VIEW this page.
//                  * The UserTab component handles its own "Take Me Home" button.
//                  */}
//                 <Route path="/no-access" element={<UserTab />} />



//                    <Route
//                     path="/babapanel"
//                     element={
                    
//                              <AdminDashboard />
                     
                      
//                     }
//                 />
//                 <Route
//                     path="/babadash/*"
//                     element={
                        
//                             <AdminDashboard />
                 
                     
//                     }
//                 />
//     </Routes>
//   );
// }

// // Session handler to check if user is already logged in on app load
// function SessionHandler() {
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const [sessionChecked, setSessionChecked] = useState(false);
  
//   const { isLoading, error } = useGetMeQuery(undefined, {
//     refetchOnMountOrArgChange: false,
//     refetchOnReconnect: false,
//     refetchOnFocus: false,
//     skip: sessionChecked && isAuthenticated,
//   });

//   useEffect(() => {
//     if (!isLoading) {
//       setSessionChecked(true);
//     }
//   }, [isLoading]);

//   useEffect(() => {
//     if (sessionChecked && !isAuthenticated) {
//       dispatch(loadGuestCart());
//       dispatch(loadGuestWishlist());
//     }
//   }, [sessionChecked, isAuthenticated, dispatch]);

//   // ✅ YEH ADD KARO — session restore hone ke BAAD cart fetch karo
//   useEffect(() => {
//     if (sessionChecked && isAuthenticated) {
//       dispatch(fetchCart()); // ← session confirm hone ke baad
//       dispatch(fetchWishlist())
//     }
//   }, [sessionChecked, isAuthenticated, dispatch]);

//   return null;
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <ToastConfig />
//       <SessionHandler />
//       <AuthModal />
//       <Layout>
//         <AppRoutes />
//       </Layout>
//     </BrowserRouter>
//   );
// }

// export default App;


// import React, { useEffect, useState } from 'react';
// import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import Navbar from './Components/Common/Navbar';
// import Footer from './Components/Common/Footer';
// import Home from './Components/Website_Pages/Home';
// import ProductDetail from './Components/Website_Pages/ProductDetail';
// import CatProducts from './Components/HomeComponents/CatProducts/CatProducts';
// import ToastConfig from './Components/Common/ToastConfig';
// import AuthModal from './Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal';
// import ActivatePage from './Components/Website_Pages/ActivatePage/ActivatePage';
// import { useGetMeQuery } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authApi';
// import { selectIsAuthenticated } from './Components/REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
// import './App.css';

// // Layout wrapper component
// function Layout({ children }) {
//   const location = useLocation();
  
//   // Define routes where Navbar & Footer should be hidden
//   const hideNavFooterRoutes = ['/activate'];
  
//   // Also hide if path STARTS with certain patterns (for nested routes)
//   const shouldHide = hideNavFooterRoutes.includes(location.pathname);
  
//   return (
//     <>
//       {!shouldHide && <Navbar />}
//       {children}
//       {!shouldHide && <Footer />}
//     </>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/product/:productId" element={<ProductDetail />} />
//       <Route path="/category/:slug" element={<CatProducts />} />
//       <Route path="/activate" element={<ActivatePage />} />
//     </Routes>
//   );
// }

// // Session handler to check if user is already logged in on app load
// function SessionHandler() {
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const [sessionChecked, setSessionChecked] = useState(false);
  
//   const { isLoading, error } = useGetMeQuery(undefined, {
//     // Only run once on mount to check existing session
//     refetchOnMountOrArgChange: false,
//     refetchOnReconnect: false,
//     refetchOnFocus: false,
//     // Don't auto-refetch, just check once
//     skip: sessionChecked && isAuthenticated,
//   });

//   useEffect(() => {
//     // Once we have a response (success or error), session check is complete
//     if (!isLoading) {
//       setSessionChecked(true);
//     }
//   }, [isLoading]);

//   // Log session restoration result
//   useEffect(() => {
//     if (sessionChecked && isAuthenticated) {
//       console.log('[App] Session restored: User is authenticated');
//     }
//     if (sessionChecked && !isAuthenticated && !isLoading) {
//       console.log('[App] No active session');
//     }
//     if (error && error?.status !== 401) {
//       console.error('[App] Session check error:', error);
//     }
//   }, [sessionChecked, isAuthenticated, isLoading, error]);

//   // Don't render anything - this is just for session management
//   return null;
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <ToastConfig />
//       <SessionHandler />
//       <AuthModal />
//       <Layout>
//         <AppRoutes />
//       </Layout>
//     </BrowserRouter>
//   );
// }

// export default App;

// import React from 'react';
// import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './Components/Common/Navbar';
// import Footer from './Components/Common/Footer';
// import Home from './Components/Website_Pages/Home';
// import ProductDetail from './Components/Website_Pages/ProductDetail';
// import CatProducts from './Components/HomeComponents/CatProducts/CatProducts';
// import ToastConfig from './Components/Common/ToastConfig';
// import AuthModal from './Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal';
// import ActivatePage from './Components/Website_Pages/ActivatePage/ActivatePage';
// import './App.css';

// // Layout wrapper component
// function Layout({ children }) {
//   const location = useLocation();
  
//   // Define routes where Navbar & Footer should be hidden
//   const hideNavFooterRoutes = ['/activate'];
  
//   // Also hide if path STARTS with certain patterns (for nested routes)
//   const shouldHide = hideNavFooterRoutes.includes(location.pathname);
  
//   return (
//     <>
//       {!shouldHide && <Navbar />}
//       {children}
//       {!shouldHide && <Footer />}
//     </>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/product/:productId" element={<ProductDetail />} />
//       <Route path="/category/:slug" element={<CatProducts />} />
//       <Route path="/activate" element={<ActivatePage />} />
//     </Routes>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <ToastConfig />
//       <AuthModal />
//       <Layout>
//         <AppRoutes />
//       </Layout>
//     </BrowserRouter>
//   );
// }

// export default App;
// upper code have been edted to hide navbar and on footer some pages 
// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Navbar from './Components/Common/Navbar';
// import Footer from './Components/Common/Footer';
// import Home from './Components/Website_Pages/Home';
// import ProductDetail from './Components/Website_Pages/ProductDetail';
// import CatProducts from './Components/HomeComponents/CatProducts/CatProducts';
// import ToastConfig from './Components/Common/ToastConfig'; 

// // ── Wholesaler modal + activate page ─────────────────────────────────────────
// import AuthModal   from './Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal';
// import ActivatePage from './Components/Website_Pages/ActivatePage/ActivatePage';
// import './App.css';

// function App() {
//   return (
//     <BrowserRouter>
//       <ToastConfig /> 
//           {/*
//         AuthModal lives outside Routes so it overlays any page.
//         It renders null when closed — zero performance cost.
//       */}
//       <AuthModal />
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/product/:productId" element={<ProductDetail />} />
//         <Route path="/category/:slug" element={<CatProducts />} />

//               {/* Journey 3 — OTP activation (deep-link from WhatsApp) */}
//         <Route path="/activate"           element={<ActivatePage />} />
//       </Routes>
//       <Footer />
//     </BrowserRouter>
//   );
// }

// export default App;
