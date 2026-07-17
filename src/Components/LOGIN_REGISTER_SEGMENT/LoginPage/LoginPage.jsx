// Components/LOGIN_REGISTER_SEGMENT/LoginPage/LoginPage.jsx
import React, { useState } from "react";
import { Phone, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../REDUX_FEATURES/REDUX_SLICES/authApi/authApi";

const logError = (context, error) => {
  console.error(`[LoginPage][${context}]`, {
    status: error?.status ?? "UNKNOWN",
    message: error?.data?.message ?? error?.message ?? "No message",
    timestamp: new Date().toISOString(),
  });
};

const getLoginErrorMessage = (error) => {
  const status = error?.status;
  const code = error?.data?.code;
  const message = error?.data?.message || "";

  if (code === "PORTAL_ACCESS_DENIED") {
    return "This account is not allowed on the wholesale app. Please use the correct login portal.";
  }
  if (code === "PORTAL_REQUIRED_FOR_PRIVILEGED_ACCOUNT") {
    return "Admin or staff accounts must login from the admin portal.";
  }
  if (code === "INVALID_PORTAL") {
    return "Login configuration is invalid. Please refresh and try again.";
  }
  if (status === 401 || status === 400) {
    return "Invalid mobile/email or password. Please try again.";
  }
  if (status === 403) {
    return "Your account is not active or not allowed on this portal. Please contact support.";
  }
  if (status === 404) {
    return "No account found. Please register first.";
  }
  return message || "Login failed. Please try again.";
};

const LoginPage = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ mobileOrEmail: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  
  const [login, { isLoading }] = useLoginMutation();

  const validate = () => {
    const errs = {};
    if (!form.mobileOrEmail.trim())
      errs.mobileOrEmail = "Mobile number or email is required";
    if (!form.password)
      errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const result = await login({
        identifier: form.mobileOrEmail.trim(),
        password: form.password,
      }).unwrap();

      toast.success(`Welcome back, ${result.user?.name || 'Wholesaler'}! 🎉`);
      
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      logError("handleSubmit", err);

      const resolvedMessage = getLoginErrorMessage(err);
      toast.error(resolvedMessage);
      if (err?.status === 401 || err?.status === 400) {
        setErrors({ password: "Incorrect credentials" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-0.5">Sign in to your wholesale account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Mobile / Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Mobile Number or Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="10-digit mobile or email"
              value={form.mobileOrEmail}
              onChange={handleChange("mobileOrEmail")}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
                focus:outline-none transition-all duration-200
                ${errors.mobileOrEmail
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                }`}
            />
          </div>
          {errors.mobileOrEmail && (
            <p className="text-xs text-red-500 font-medium">{errors.mobileOrEmail}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange("password")}
              className={`w-full pl-9 pr-11 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
                focus:outline-none transition-all duration-200
                ${errors.password
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
            text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
            disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing In...</>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Activate account hint */}
      <div className="text-center p-3 bg-[#478B8D]/15 border border-[#478B8D]/15 rounded-xl">
        <p className="text-xs text-[#478B8D] font-medium">
          Approved? Complete details &amp; activate OTP{" "}
          <a href="/activate" className="font-black underline underline-offset-2">
            here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;