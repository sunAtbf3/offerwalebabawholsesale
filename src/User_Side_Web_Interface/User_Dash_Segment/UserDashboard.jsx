import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    User, Package, Heart, MapPin, LogOut,
    ChevronRight, LifeBuoy, ShoppingCart, ChevronDown
} from 'lucide-react';

import UserProfile from './UserSubPages/UserProfile';
import UserOrders from './UserSubPages/UserOrders';
import UserWishlist from './UserSubPages/UserWishlist';
import UserAddress from './UserSubPages/UserAddress';
// import UserTicket from './UserSubPages/UserTicket';
import UserCart from './UserSubPages/UserCart';

import { logout, selectUser } from '../../Components/REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { useLogoutMutation } from '../../Components/REDUX_FEATURES/REDUX_SLICES/authApi/authApi';

const UserDashboard = () => {
    const { activeTab: urlTab } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const [openTab, setOpenTab] = useState(urlTab || null);
    const activeTabRef = useRef(null);

    // ── FIX: use the RTK Query mutation, not the undefined logoutUser thunk ──
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

    const menuItems = [
        { id: 'userprofile',  label: 'Personal Info',  icon: <User size={20} />,         component: <UserProfile /> },
        { id: 'userorders',   label: 'My Orders',       icon: <Package size={20} />,      component: <UserOrders /> },
        { id: 'userwishlist', label: 'My Wishlist',     icon: <Heart size={20} />,        component: <UserWishlist /> },
        { id: 'usercart',     label: 'My Cart',         icon: <ShoppingCart size={20} />, component: <UserCart /> },
        { id: 'useraddress',  label: 'Manage Address',  icon: <MapPin size={20} />,       component: <UserAddress /> },
        // { id: 'usertickets',  label: 'Help & Support',  icon: <LifeBuoy size={20} />,     component: <UserTicket /> },
    ];

    // Toggle tab open/closed; update URL without full navigation
    const handleTabClick = (tabId) => {
        if (openTab === tabId) {
            setOpenTab(null);
            window.history.replaceState(null, '', `/account`);
        } else {
            setOpenTab(tabId);
            window.history.replaceState(null, '', `/account/${tabId}`);
        }
    };

    // Auto-scroll on mobile when a tab opens
    useEffect(() => {
        if (openTab && window.innerWidth < 1024 && activeTabRef.current) {
            const timeout = setTimeout(() => {
                activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [openTab]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // ── FIX: was calling undefined logoutUser(); now uses the mutation + dispatch(logout()) ──
    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
        } catch {
            // Even if the API call fails, clear local state and redirect
        } finally {
            dispatch(logout());
            navigate('/');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
       <div
  className="
    min-h-screen
    bg-[#f8f9fa]

    px-3
    sm:px-4
    md:px-6
    xl:px-8

    py-4
    sm:py-6
    lg:py-10
  "
>
  <div
    className="
      max-w-[1500px]
      mx-auto

      flex
      flex-col
      lg:flex-row

      gap-4
      sm:gap-6
      lg:gap-8

      items-start
    "
  >
                {/* ── SIDEBAR / MOBILE ACCORDION ── */}
          <aside
  className="
    w-full
    lg:w-[320px]
    xl:w-[340px]

    lg:sticky
    lg:top-6

    shrink-0
  "
>
  <div
    className="
      bg-white
     rounded-[24px] lg:rounded-[32px]
      p-4 sm:p-6
      shadow-sm
      border border-gray-100
      overflow-hidden
    "
  >

    {/* User Header */}
    <div
      className="
        flex items-center
        gap-3 sm:gap-4
        mb-6 sm:mb-8
      "
    >

      <div
        className="
          w-12 h-12
          sm:w-14 sm:h-14
          bg-[#478B8D]
          rounded-2xl
          flex items-center justify-center
          text-white
          font-black
          text-lg sm:text-xl
          shadow-lg shadow-orange-100
          flex-shrink-0
        "
      >
        {getInitials(user?.name)}
      </div>

      <div className="overflow-hidden min-w-0">

        <h2
          className="
            font-black
            text-gray-900
            truncate
            text-sm sm:text-base
          "
        >
          {user?.name || "Guest User"}
        </h2>

        <p
          className="
            text-[9px] sm:text-[10px]
            text-gray-400
            font-black
            uppercase
            tracking-[2px]
            mt-1
            truncate
          "
        >
          {user?.role === "admin"
            ? "Administrator"
            : "Premium Member"}
        </p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="space-y-1.5 sm:space-y-2">

      {menuItems.map((item) => {

        const isActive = openTab === item.id;

        return (
          <div
            key={item.id}
            ref={isActive ? activeTabRef : null}
            className="w-full"
          >

            <button
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full
                flex items-center justify-between
                gap-3
              px-3 py-3 sm:px-4 sm:py-4
                rounded-2xl
                transition-all duration-300
                group
                cursor-pointer

                ${
                  isActive
                    ? "bg-gray-700 text-white shadow-xl"
                    : "hover:bg-[#478B8D] text-gray-600 hover:text-black"
                }
              `}
            >

              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">

                <span
                  className={`
                    flex-shrink-0
                    ${
                      isActive
                        ? "text-[#478B8D]"
                        : "text-gray-400 group-hover:text-black"
                    }
                  `}
                >
                  {item.icon}
                </span>

                <span
                  className="
                    font-bold
                    text-[11px] sm:text-sm
                    tracking-tight
                    uppercase
                    truncate
                  "
                >
                  {item.label}
                </span>
              </div>

              {/* Right */}
              <div className="flex items-center flex-shrink-0">

                <ChevronDown
                  size={16}
                  className={`
                    lg:hidden
                    transition-transform duration-300

                    ${
                      isActive
                        ? "rotate-180 text-[#35858E]"
                        : "opacity-40"
                    }
                  `}
                />

                <ChevronRight
                  size={16}
                  className={`
                    hidden lg:block
                    transition-all

                    ${
                      isActive
                        ? "translate-x-1 text-[#35858E]"
                        : "opacity-0 group-hover:opacity-100"
                    }
                  `}
                />
              </div>
            </button>

            {/* Mobile Accordion */}
            <div
              className={`
                lg:hidden
                overflow-hidden
                transition-all duration-500 ease-in-out

                ${
                  isActive
                    ? "max-h-[5000px] opacity-100 mt-3 mb-3"
                    : "max-h-0 opacity-0"
                }
              `}
            >

              <div
                className="
                  bg-gray-50
                  rounded-2xl
                  p-3 sm:p-4
                  overflow-x-hidden
                  border border-gray-100
                "
              >
                {isActive && item.component}
              </div>
            </div>
          </div>
        );
      })}
    </nav>

    {/* Logout */}
    <div
      className="
        mt-6 sm:mt-8
        pt-5 sm:pt-6
        border-t border-gray-100
      "
    >

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="
          w-full
          flex items-center
          gap-3
          p-3 sm:p-4
          rounded-2xl

          text-red-500
          hover:bg-red-50

          transition-colors

          font-black
          text-[11px] sm:text-xs
          uppercase
          tracking-[2px]

          cursor-pointer
          disabled:opacity-50
        "
      >

        <LogOut size={18} />

        {isLoggingOut
          ? "Signing out..."
          : "Logout"}
      </button>
    </div>
  </div>
</aside>

                {/* ── DESKTOP PANEL ── */}
<main
  className="
    hidden lg:block
    flex-1

    bg-white
    rounded-[32px] xl:rounded-[40px]

    shadow-sm
    border border-gray-100

    p-6
    xl:p-10

    min-h-[650px]
    overflow-hidden
  "
>                    {openTab ? (
                        <div key={openTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {menuItems.find((i) => i.id === openTab)?.component}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <User size={40} />
                            </div>
                            <p className="font-bold uppercase tracking-widest text-xs">Select a tab to view details</p>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};

export default UserDashboard;