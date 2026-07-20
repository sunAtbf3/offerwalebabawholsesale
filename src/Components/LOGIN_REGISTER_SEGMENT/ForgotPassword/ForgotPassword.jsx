import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mail, Key, ChevronLeft, Loader2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import {
  useForgotPasswordRequestOTPMutation,
  useForgotPasswordVerifyOTPMutation,
  useForgotPasswordResetMutation,
  useLoginMutation,
} from "../../REDUX_FEATURES/REDUX_SLICES/authApi/authApi";

const STEPS = ["identifier", "otp", "password"];
const RESEND_COOLDOWN = 5 * 60;

const getApiError = (err) =>
  err?.data?.message || err?.message || "Something went wrong. Please try again.";

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const ForgotPassword = ({ onBack, onLoginClick, onLoginSuccess }) => {
  const [requestOTP, { isLoading: requesting }] = useForgotPasswordRequestOTPMutation();
  const [verifyOTP, { isLoading: verifying }] = useForgotPasswordVerifyOTPMutation();
  const [resetPassword, { isLoading: resetting }] = useForgotPasswordResetMutation();
  const [login, { isLoading: loggingIn }] = useLoginMutation();

  const loading = requesting || verifying || resetting || loggingIn;

  const [identifier, setIdentifier] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState("identifier");

  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const resendTimerRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (localError) {
      toast.error(localError);
      setLocalError("");
    }
  }, [localError]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  useEffect(() => {
    clearInterval(resendTimerRef.current);
    if (resendSecondsLeft > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(resendTimerRef.current);
  }, [resendSecondsLeft]);

  useEffect(() => {
    if (step === "otp") {
      setResendSecondsLeft(RESEND_COOLDOWN);
    }
  }, [step]);

  const formatCountdown = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleOtpChange = (idx, val) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned && val) return;
    if (cleaned.length > 1) return;
    const next = [...otpDigits];
    next[idx] = cleaned;
    setOtpDigits(next);
    if (cleaned && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[idx]) {
        const next = [...otpDigits];
        next[idx] = "";
        setOtpDigits(next);
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    pasted.split("").forEach((ch, i) => {
      if (i < 6) next[i] = ch;
    });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpString = otpDigits.join("");
  const stepIndex = STEPS.indexOf(step);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed) {
      setLocalError("Please enter your email address");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      await requestOTP({ identifier: trimmed }).unwrap();
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleResendOTP = useCallback(async () => {
    if (resendSecondsLeft > 0 || resendLoading) return;
    const activeIdentifier = identifier.trim();
    if (!activeIdentifier) return;

    setResendLoading(true);
    try {
      await requestOTP({ identifier: activeIdentifier }).unwrap();
      setOtpDigits(["", "", "", "", "", ""]);
      setResendSecondsLeft(RESEND_COOLDOWN);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
      toast.success("OTP resent to your email");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setResendLoading(false);
    }
  }, [resendSecondsLeft, resendLoading, identifier, requestOTP]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpString.length !== 6) {
      setLocalError("Enter all 6 digits");
      return;
    }

    try {
      await verifyOTP({ identifier: identifier.trim(), otp: otpString }).unwrap();
      setVerifiedOtp(otpString);
      setStep("password");
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setLocalError("Min 6 characters required");
      return;
    }

    const activeIdentifier = identifier.trim();
    try {
      await resetPassword({
        identifier: activeIdentifier,
        otp: verifiedOtp,
        newPassword,
      }).unwrap();

      toast.success("Password reset! Logging you in...");
      try {
        const result = await login({
          identifier: activeIdentifier,
          password: newPassword,
        }).unwrap();
        onLoginSuccess?.(result.user);
      } catch {
        setTimeout(() => onLoginClick?.(), 1200);
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleGoBackToIdentifier = () => {
    setOtpDigits(["", "", "", "", "", ""]);
    setVerifiedOtp("");
    clearInterval(resendTimerRef.current);
    setResendSecondsLeft(0);
    setStep("identifier");
  };

  const inputClass =
    "w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";

  const otpBoxClass =
    "flex-1 min-w-0 aspect-square rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-lg font-bold text-[#0F172A] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white transition-all";

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#478B8D] hover:text-[#0F172A] transition-colors self-start"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Reset Password</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Follow the steps to recover your account
        </p>
      </div>

      {/* Step progress */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              stepIndex >= i ? "bg-[#478B8D]" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
        Step {stepIndex + 1} of 3 —{" "}
        <span className="text-[#478B8D]">
          {step === "identifier"
            ? "Enter Email"
            : step === "otp"
            ? "Verify OTP"
            : "New Password"}
        </span>
      </p>

      {step === "identifier" && (
        <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="email"
                className={inputClass}
                required
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              We&apos;ll send a reset OTP to your email inbox
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
              text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
          <p className="text-sm text-slate-500 text-center">
            OTP sent to{" "}
            <span className="font-bold text-[#0F172A] break-all">{identifier}</span>
          </p>

          <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className={otpBoxClass}
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otpString.length !== 6 || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
              text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1 py-3 px-4">
            {resendSecondsLeft > 0 ? (
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resend OTP in{" "}
                <span className="text-[#478B8D] tabular-nums">
                  {formatCountdown(resendSecondsLeft)}
                </span>
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-500">Didn&apos;t receive it?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-xs font-bold uppercase tracking-wider text-[#478B8D] hover:text-[#0F172A] flex items-center gap-1 disabled:opacity-50"
                >
                  {resendLoading ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <RotateCcw size={11} />
                  )}
                  Resend OTP
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleGoBackToIdentifier}
            className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0F172A] transition-colors py-2"
          >
            Change email
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {confirmPassword.length > 0 && (
            <p
              className={`text-xs font-medium ${
                newPassword === confirmPassword ? "text-green-600" : "text-red-500"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading || newPassword !== confirmPassword || newPassword.length < 6
            }
            className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
              text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Resetting...
              </>
            ) : (
              "Reset & Login"
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            You&apos;ll be logged in automatically after reset
          </p>
        </form>
      )}

      <div className="text-center pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">Remembered it? </span>
        <button
          type="button"
          onClick={onLoginClick}
          className="text-xs font-bold text-[#478B8D] hover:text-[#0F172A] underline underline-offset-2 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
