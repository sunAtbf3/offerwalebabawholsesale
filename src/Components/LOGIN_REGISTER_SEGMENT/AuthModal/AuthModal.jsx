// Components/LOGIN_REGISTER_SEGMENT/AuthModal/AuthModal.jsx
import React, { useEffect, useCallback } from "react";
import { X, UserPlus, LogIn } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  setActiveTab,
  selectIsModalOpen,
  selectActiveTab,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";

const AuthModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsModalOpen);
  const activeTab = useSelector(selectActiveTab);

  const handleLoginSuccess = (user) => {
    // Close modal after successful login
    dispatch(closeModal());
    // Optional: You can dispatch any additional actions here
    console.log('[AuthModal] Login successful for:', user?.name || user?.email);
  };

  // Close on ESC key
  const handleKeyDown = useCallback(
    (e) => { if (e.key === "Escape") dispatch(closeModal()); },
    [dispatch]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) dispatch(closeModal());
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden
          max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-base font-black text-[#0F172A] uppercase tracking-wider">
              Wholesaler Portal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Offer Wale Baba — B2B</p>
          </div>
          <button
            onClick={() => dispatch(closeModal())}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-6 pt-4 gap-2 shrink-0">
          <button
            onClick={() => dispatch(setActiveTab("login"))}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black
              uppercase tracking-wider transition-all duration-200
              ${activeTab === "login"
                ? "bg-[#0F172A] text-white shadow-lg"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            <LogIn size={14} /> Login
          </button>
          <button
            onClick={() => dispatch(setActiveTab("register"))}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black
              uppercase tracking-wider transition-all duration-200
              ${activeTab === "register"
                ? "bg-amber-500 text-[#0F172A] shadow-lg"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {activeTab === "login" && <LoginPage onLoginSuccess={handleLoginSuccess} />}
          {activeTab === "register" && <RegisterPage />}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

// upper code just add login handler 
// import React, { useEffect, useCallback } from "react";
// import { X, UserPlus, LogIn } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   closeModal,
//   setActiveTab,
//   selectIsModalOpen,
//   selectActiveTab,
// } from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
// import LoginPage    from "../LoginPage/LoginPage";
// import RegisterPage from "../RegisterPage/RegisterPage";

// const AuthModal = () => {
//   const dispatch    = useDispatch();
//   const isOpen      = useSelector(selectIsModalOpen);
//   const activeTab   = useSelector(selectActiveTab);

//   // ── Close on ESC key ─────────────────────────────────────────────────────
//   const handleKeyDown = useCallback(
//     (e) => { if (e.key === "Escape") dispatch(closeModal()); },
//     [dispatch]
//   );

//   useEffect(() => {
//     if (isOpen) {
//       document.addEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "hidden"; // Prevent background scroll
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [isOpen, handleKeyDown]);

//   if (!isOpen) return null;

//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) dispatch(closeModal());
//   };

//   return (
//     // Backdrop
//     <div
//       className="fixed inset-0 z-[200] flex items-center justify-center p-4"
//       style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)" }}
//       onClick={handleBackdropClick}
//     >
//       {/* Modal panel */}
//       <div
//         className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden
//           max-h-[90vh] flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* ── Header ────────────────────────────────────────────────────── */}
//         <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
//           <div>
//             <h1 className="text-base font-black text-[#0F172A] uppercase tracking-wider">
//               Wholesaler Portal
//             </h1>
//             <p className="text-xs text-slate-400 mt-0.5">Offer Wale Baba — B2B</p>
//           </div>
//           <button
//             onClick={() => dispatch(closeModal())}
//             className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
//             aria-label="Close modal"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* ── Tab switcher ──────────────────────────────────────────────── */}
//         <div className="flex px-6 pt-4 gap-2 shrink-0">
//           <button
//             onClick={() => dispatch(setActiveTab("login"))}
//             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black
//               uppercase tracking-wider transition-all duration-200
//               ${activeTab === "login"
//                 ? "bg-[#0F172A] text-white shadow-lg"
//                 : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//               }`}
//           >
//             <LogIn size={14} /> Login
//           </button>
//           <button
//             onClick={() => dispatch(setActiveTab("register"))}
//             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black
//               uppercase tracking-wider transition-all duration-200
//               ${activeTab === "register"
//                 ? "bg-amber-500 text-[#0F172A] shadow-lg"
//                 : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//               }`}
//           >
//             <UserPlus size={14} /> Register
//           </button>
//         </div>

//         {/* ── Scrollable content area ───────────────────────────────────── */}
//         <div className="overflow-y-auto flex-1 px-6 py-5">
//           {activeTab === "login"    && <LoginPage />}
//           {activeTab === "register" && <RegisterPage />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;