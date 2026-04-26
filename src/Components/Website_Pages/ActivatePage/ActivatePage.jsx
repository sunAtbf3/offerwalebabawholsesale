import React, { useState } from "react";
import { Phone, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useSendActivationOtpMutation,
  useVerifyActivationOtpMutation,
  logError,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";

// ── Inline field component ────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, hint, rightEl, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} <span className="text-red-500">*</span>
    </label>
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-9" : "pl-4"} ${rightEl ? "pr-12" : "pr-4"} py-3.5 rounded-xl border-2
          text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
          }`}
      />
      {rightEl && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
  </div>
);

// ── Phase 1: enter mobile ─────────────────────────────────────────────────────
const Phase1 = ({ onSuccess }) => {
  const [mobile, setMobile]     = useState("");
  const [error, setError]       = useState("");
  const [sendOtp, { isLoading }] = useSendActivationOtpMutation();

  const handleSend = async () => {
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) {
      setError("Enter a valid 10-digit registered mobile number");
      return;
    }
    setError("");

    try {
      await sendOtp({ mobileNumber: mobile.trim() }).unwrap();
      toast.info("OTP sent to your registered mobile number!");
      onSuccess(mobile.trim());
    } catch (err) {
      logError("sendActivationOtp", err);

      const status  = err?.status;
      const message = err?.data?.message ?? "";

      if (status === 404) {
        setError("No approved request found for this number. Contact admin.");
        toast.error("This mobile is not approved yet.");
        return;
      }
      if (status === 429) {
        setError("Too many attempts. Please try again after some time.");
        toast.error("Rate limited. Please wait before trying again.");
        return;
      }
      if (status === 400) {
        setError(message || "Invalid mobile number.");
        return;
      }
      setError("Something went wrong. Please try again.");
      toast.error("Failed to send OTP. Please retry.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone size={32} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">Activate Your Account</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Enter your registered mobile number. We'll send an OTP to verify and set up your password.
        </p>
      </div>

      <Field
        label="Registered Mobile Number"
        icon={Phone}
        type="tel"
        placeholder="Enter your 10-digit mobile"
        maxLength={10}
        value={mobile}
        onChange={(e) => {
          setMobile(e.target.value.replace(/\D/g, ""));
          if (error) setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        error={error}
      />

      <button
        onClick={handleSend}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
          text-white font-black py-4 rounded-xl transition-all duration-200 uppercase tracking-wider
          disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
        ) : (
          <>Send OTP <ArrowRight size={16} /></>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Not approved yet?{" "}
        <a href="/" className="text-amber-600 font-bold underline underline-offset-2">
          Go back home
        </a>
      </p>
    </div>
  );
};

// ── Phase 2: OTP + password ───────────────────────────────────────────────────
const Phase2 = ({ mobileNumber, onBack }) => {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ otp: "", password: "", confirmPassword: "" });
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [verifyOtp, { isLoading }] = useVerifyActivationOtpMutation();

  const validate = () => {
    const errs = {};
    if (!form.otp.trim() || !/^\d{4,8}$/.test(form.otp.trim()))
      errs.otp = "Enter the OTP received on your mobile";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleVerify = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      const result = await verifyOtp({
        mobileNumber,
        otp:      form.otp.trim(),
        password: form.password,
      }).unwrap();

      // Save token and navigate home
      localStorage.setItem("accessToken", result.accessToken);
      toast.success(`🎉 Welcome, ${result.user?.name ?? "Wholesaler"}! Account activated successfully.`, {
        autoClose: 5000,
      });
      navigate("/");

    } catch (err) {
      logError("verifyActivationOtp", err);

      const status  = err?.status;
      const message = err?.data?.message ?? "";

      if (status === 400) {
        if (message.toLowerCase().includes("expired")) {
          setErrors({ otp: "OTP has expired. Go back and request a new one." });
          toast.error("OTP expired. Please request a new one.");
          return;
        }
        if (message.toLowerCase().includes("invalid")) {
          setErrors({ otp: "Incorrect OTP. Please check and try again." });
          return;
        }
        setErrors({ otp: message || "Invalid input." });
        return;
      }
      if (status === 429) {
        setErrors({ otp: "Too many wrong attempts. Request a new OTP." });
        toast.error("Too many attempts. Please request a new OTP.");
        return;
      }
      if (status === 404) {
        toast.error("Account not found. Please contact support.");
        return;
      }
      if (status === 409) {
        toast.error(message || "A conflict occurred. Please contact support.");
        return;
      }
      toast.error(message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">Verify & Set Password</h2>
        <p className="text-sm text-slate-500 mt-2">
          OTP sent to{" "}
          <span className="font-black text-[#0F172A]">+91 {mobileNumber}</span>
        </p>
      </div>

      {/* OTP */}
      <Field
        label="One-Time Password (OTP)"
        icon={KeyRound}
        type="text"
        inputMode="numeric"
        placeholder="Enter OTP"
        maxLength={8}
        value={form.otp}
        onChange={(e) => handleChange("otp")(e.target.value.replace(/\D/g, ""))}
        error={errors.otp}
        hint="Check your registered mobile number"
      />

      {/* Password */}
      <Field
        label="Create Password"
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="Minimum 6 characters"
        value={form.password}
        onChange={(e) => handleChange("password")(e.target.value)}
        error={errors.password}
        rightEl={
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="text-slate-400 hover:text-slate-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {/* Confirm Password */}
      <Field
        label="Confirm Password"
        icon={Lock}
        type={showConf ? "text" : "password"}
        placeholder="Re-enter password"
        value={form.confirmPassword}
        onChange={(e) => handleChange("confirmPassword")(e.target.value)}
        error={errors.confirmPassword}
        rightEl={
          <button
            type="button"
            onClick={() => setShowConf((p) => !p)}
            className="text-slate-400 hover:text-slate-600"
          >
            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm
            hover:bg-slate-50 transition-all duration-200 uppercase tracking-wider
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
            text-[#0F172A] font-black py-4 rounded-xl transition-all duration-200 uppercase tracking-wider
            disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Activating...</>
          ) : (
            <><CheckCircle2 size={16} /> Activate Account</>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Page shell ────────────────────────────────────────────────────────────────
const ActivatePage = () => {
  const [phase, setPhase]   = useState(1); // 1 | 2
  const [mobile, setMobile] = useState("");

  const handleOtpSent = (mobileNumber) => {
    setMobile(mobileNumber);
    setPhase(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {phase === 1 && <Phase1 onSuccess={handleOtpSent} />}
          {phase === 2 && (
            <Phase2
              mobileNumber={mobile}
              onBack={() => setPhase(1)}
            />
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Offer Wale Baba — Wholesale Portal &nbsp;|&nbsp;
          <a href="/" className="text-amber-600 font-bold underline underline-offset-2">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default ActivatePage;