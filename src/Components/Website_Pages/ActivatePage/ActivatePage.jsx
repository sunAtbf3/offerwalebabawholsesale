import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Phone,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  useLazyGetWholesalerOnboardingStatusQuery,
  useCreateRegistrationPaymentOrderMutation,
  useSendActivationOtpMutation,
  useVerifyRegistrationPaymentMutation,
  useVerifyActivationOtpMutation,
  logError,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";
import { setAuthenticatedSession } from "../../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";
import CompleteDetailsForm from "./CompleteDetailsForm";
import wholesaleAxios from "../../../SERVICES/Wholesaleaxios";
import RazorpayCheckout from "../../../User_Side_Web_Interface/CHECKOUT/RazorpayCheckout/RazorpayCheckout";

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
          ${
            error
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

function normalizeMobile(raw) {
  return String(raw || "").replace(/\D/g, "").slice(-10);
}

/**
 * Build "OTP for …" label from send-otp / complete-details API delivery fields.
 * Prefer email for now (OTP is delivered to registered email).
 */
function formatOtpDestination(delivery, fallbackMobile = "") {
  const via = Array.isArray(delivery?.deliveredVia) ? delivery.deliveredVia : [];
  const targets = delivery?.targets || {};
  const email =
    targets.email ||
    delivery?.email ||
    delivery?.request?.email ||
    null;
  const phone = normalizeMobile(
    targets.sms || delivery?.mobileNumber || fallbackMobile
  );

  const wantsEmail = via.includes("email") || via.includes("EMAIL");
  const wantsSms = via.includes("sms") || via.includes("SMS");

  if (wantsEmail && wantsSms) {
    const parts = [];
    if (email) parts.push(email);
    if (phone) parts.push(`+91 ${phone}`);
    if (parts.length) return parts.join(" & ");
  }
  if (wantsEmail && email) return email;
  if (wantsSms && phone) return `+91 ${phone}`;

  // Soft fallback from message text
  const msg = String(delivery?.message || "").toLowerCase();
  if (msg.includes("email") && email) return email;
  if ((msg.includes("phone") || msg.includes("sms") || msg.includes("mobile")) && phone) {
    return `+91 ${phone}`;
  }

  // Default: prefer email (current OTP channel)
  if (email) return email;
  if (phone) return `+91 ${phone}`;
  return "your registered email";
}

/**
 * Resolve which Activate UI stage to show from onboarding status.
 * Details-incomplete approved users always land on complete-details.
 */
async function resolveActivateRoute({
  mobileNumber,
  preferredStep,
  lookup,
  sendOtp,
  autoSendOtp = true,
}) {
  const m = normalizeMobile(mobileNumber);
  if (!/^\d{10}$/.test(m)) {
    return { ok: false, error: "Enter a valid 10-digit registered mobile number" };
  }

  const result = await lookup(m).unwrap();
  const req = result?.request;
  if (!req) {
    return { ok: false, error: "No request found for this number." };
  }

  if (req.status === "pending") {
    return { ok: true, stage: "pending", mobile: m, request: req };
  }
  if (req.status === "rejected") {
    return { ok: true, stage: "rejected", mobile: m, request: req };
  }
  if (req.status === "activated") {
    return { ok: true, stage: "activated", mobile: m, request: req };
  }

  // Approved: KYC first whenever details are incomplete — ignores preferredStep=otp.
  if (req.status === "approved" && req.canCompleteDetails) {
    return { ok: true, stage: "complete", mobile: m, request: req };
  }

  if (req.status === "approved" && req.canPayRegistration) {
    return { ok: true, stage: "payment", mobile: m, request: req };
  }

  if (req.status === "approved" && req.canRequestActivationOtp) {
    if (preferredStep === "complete") {
      // Details already done; fall through to OTP.
    }
    if (autoSendOtp && sendOtp) {
      try {
        const otpRes = await sendOtp({ mobileNumber: m }).unwrap();
        return {
          ok: true,
          stage: "otp",
          mobile: m,
          request: req,
          otpSent: true,
          otpDestination: formatOtpDestination(
            { ...otpRes, email: otpRes?.email || req.email },
            m
          ),
        };
      } catch (otpErr) {
        logError("sendActivationOtp", otpErr);
        if (otpErr?.data?.code === "WHOLESALER_DETAILS_INCOMPLETE") {
          return { ok: true, stage: "complete", mobile: m, request: req };
        }
        return {
          ok: true,
          stage: "otp",
          mobile: m,
          request: req,
          otpSent: false,
          otpDestination: formatOtpDestination(
            { email: req.email, mobileNumber: m },
            m
          ),
          otpWarning: otpErr?.data?.message || "OTP could not be sent automatically. Use Resend OTP.",
        };
      }
    }
    return {
      ok: true,
      stage: "otp",
      mobile: m,
      request: req,
      otpSent: false,
      otpDestination: formatOtpDestination(
        { email: req.email, mobileNumber: m },
        m
      ),
    };
  }

  return { ok: false, error: "Unexpected onboarding state. Please contact support." };
}

const LookupPhase = ({ onRoute, initialMobile = "" }) => {
  const [mobile, setMobile] = useState(initialMobile);
  const [error, setError] = useState("");
  const [lookup] = useLazyGetWholesalerOnboardingStatusQuery();
  const [sendOtp, { isLoading: sendingOtp }] = useSendActivationOtpMutation();
  const [isFetching, setIsFetching] = useState(false);
  const busy = isFetching || sendingOtp;

  const handleContinue = async () => {
    setError("");
    setIsFetching(true);
    try {
      const routed = await resolveActivateRoute({
        mobileNumber: mobile,
        lookup,
        sendOtp,
        autoSendOtp: true,
      });
      if (!routed.ok) {
        setError(routed.error);
        if (routed.error?.includes("No request") || routed.error?.includes("register")) {
          toast.error("No request found. Please register first.");
        }
        return;
      }
      if (routed.stage === "activated") {
        toast.info("Account already activated. Please log in.");
      }
      if (routed.otpSent) {
        toast.info("OTP sent to your registered email!");
      } else if (routed.otpWarning) {
        toast.warning(routed.otpWarning);
      }
      onRoute(routed);
    } catch (err) {
      logError("getWholesalerOnboardingStatus", err);
      if (err?.status === 404) {
        setError("No wholesaler request found for this number. Register interest first.");
        toast.error("No request found. Please register first.");
        return;
      }
      setError(err?.data?.message || "Something went wrong. Please try again.");
      toast.error("Could not check status.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone size={32} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">Continue Setup</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Enter your registered mobile. If you&apos;re approved, you&apos;ll complete business
          details first, then activate with OTP.
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
        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
        error={error}
      />

      <button
        type="button"
        onClick={handleContinue}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
          text-white font-black py-4 rounded-xl transition-all duration-200 uppercase tracking-wider
          disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Checking...
          </>
        ) : (
          <>
            Continue <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Not registered yet?{" "}
        <a href="/" className="text-amber-600 font-bold underline underline-offset-2">
          Submit interest from home
        </a>
      </p>
    </div>
  );
};

const StatusCard = (props) => {
  const { title, body, tone = "amber", onBack } = props;
  const StatusIcon = props.icon;
  const tones = {
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="flex flex-col gap-5 text-center">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${tones[tone]}`}
      >
        <StatusIcon size={32} />
      </div>
      <h2 className="text-2xl font-black text-[#0F172A]">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">{body}</p>
      <button
        type="button"
        onClick={onBack}
        className="w-full py-3.5 rounded-xl border-2 border-slate-200 font-black text-sm uppercase tracking-wider"
      >
        Back
      </button>
    </div>
  );
};

const PaymentPhase = ({ mobileNumber, request, onBack, onPaid }) => {
  const [createOrder, createState] = useCreateRegistrationPaymentOrderMutation();
  const [verifyPayment, verifyState] = useVerifyRegistrationPaymentMutation();
  const [sendOtp] = useSendActivationOtpMutation();
  const [razorpayKey, setRazorpayKey] = useState("");
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentState, setPaymentState] = useState("idle");
  const [gatewayError, setGatewayError] = useState("");

  const feeAmount = Number(request?.registrationFeeAmount || 1200);
  const fetchRazorpayKey = useCallback(async () => {
    if (razorpayKey) return razorpayKey;
    const res = await wholesaleAxios.get("/public/razorpay-key");
    const keyId = res?.data?.keyId;
    if (!keyId) throw new Error("Razorpay key is not available right now.");
    setRazorpayKey(keyId);
    return keyId;
  }, [razorpayKey]);

  const handleStartPayment = async () => {
    setGatewayError("");
    try {
      const [orderRes] = await Promise.all([
        createOrder({ mobileNumber }).unwrap(),
        fetchRazorpayKey(),
      ]);
      if (orderRes?.alreadyPaid || !orderRes?.razorpayOrder?.id) {
        const otpRes = await sendOtp({ mobileNumber }).unwrap();
        onPaid?.({
          email: request?.email || "",
          otpDestination: formatOtpDestination({ ...otpRes, email: request?.email }, mobileNumber),
        });
        return;
      }
      setRazorpayOrder(orderRes.razorpayOrder);
    } catch (err) {
      logError("createRegistrationPaymentOrder", err);
      const message = err?.data?.message || err?.message || "Could not start payment.";
      setGatewayError(message);
      toast.error(message);
    }
  };

  const handleSuccess = async (response) => {
    try {
      await verifyPayment({
        mobileNumber,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }).unwrap();
      const otpRes = await sendOtp({ mobileNumber }).unwrap();
      toast.success("Payment verified. OTP sent to your registered email.");
      onPaid?.({
        email: request?.email || "",
        otpDestination: formatOtpDestination({ ...otpRes, email: request?.email }, mobileNumber),
      });
    } catch (err) {
      logError("verifyRegistrationPayment", err);
      const message = err?.data?.message || "Payment verification failed. Please try again.";
      setGatewayError(message);
      toast.error(message);
      setRazorpayOrder(null);
      setPaymentState("failed");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IndianRupee size={32} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">Registration Payment</h2>
        <p className="text-sm text-slate-500 mt-2">
          Pay the one-time wholesale registration fee to unlock activation.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Registered mobile</span>
          <span className="font-black text-[#0F172A]">+91 {mobileNumber}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Registered email</span>
          <span className="font-black text-[#0F172A]">{request?.email || "—"}</span>
        </div>
        <div className="flex items-center justify-between text-base pt-2 border-t border-amber-200">
          <span className="font-bold text-slate-700">Amount payable</span>
          <span className="text-2xl font-black text-amber-700">Rs. {feeAmount.toLocaleString()}</span>
        </div>
      </div>

      {gatewayError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {gatewayError}
        </div>
      )}

      <button
        type="button"
        onClick={handleStartPayment}
        disabled={createState.isLoading || verifyState.isLoading}
        className="w-full py-3.5 rounded-xl bg-[#0F172A] text-white font-black text-sm uppercase tracking-wider hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {createState.isLoading || verifyState.isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            Pay Registration Fee <ArrowRight size={16} />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3.5 rounded-xl border-2 border-slate-200 font-black text-sm uppercase tracking-wider"
      >
        Back
      </button>

      {razorpayOrder?.id && razorpayKey && (
        <RazorpayCheckout
          razorpayOrder={razorpayOrder}
          razorpayKey={razorpayKey}
          orderId={`WHOLESALE-${mobileNumber}`}
          totalAmount={feeAmount}
          userEmail={request?.email || ""}
          userName={request?.fullName || "Wholesaler"}
          userPhone={mobileNumber}
          paymentState={paymentState}
          onPaymentStateChange={setPaymentState}
          onSuccess={handleSuccess}
          onFailure={(message) => {
            setGatewayError(message);
            toast.error(message);
            setRazorpayOrder(null);
          }}
          onClose={() => {
            setRazorpayOrder(null);
            setPaymentState("cancelled");
          }}
        />
      )}
    </div>
  );
};

const OtpPhase = ({ mobileNumber, otpDestination, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ otp: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [verifyOtp, { isLoading }] = useVerifyActivationOtpMutation();
  const [sendOtp, { isLoading: resending }] = useSendActivationOtpMutation();
  const destinationLabel = otpDestination || "your registered email";

  const validate = () => {
    const errs = {};
    if (!form.otp.trim() || !/^\d{4,8}$/.test(form.otp.trim()))
      errs.otp = "Enter the OTP received";
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

  const handleResend = async () => {
    try {
      await sendOtp({ mobileNumber }).unwrap();
      toast.info("OTP resent to your registered email.");
    } catch (err) {
      logError("sendActivationOtp.resend", err);
      if (err?.data?.code === "WHOLESALER_DETAILS_INCOMPLETE") {
        toast.error("Complete business details before requesting OTP.");
        onBack();
        return;
      }
      toast.error(err?.data?.message || "Could not resend OTP.");
    }
  };

  const handleVerify = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const result = await verifyOtp({
        mobileNumber,
        otp: form.otp.trim(),
        password: form.password,
      }).unwrap();

      dispatch(
        setAuthenticatedSession({
          user: result?.user ?? null,
          accessToken: result?.accessToken ?? null,
        })
      );
      toast.success(
        `Welcome, ${result.user?.name ?? "Wholesaler"}! Account activated successfully.`,
        { autoClose: 5000 }
      );
      navigate("/");
    } catch (err) {
      logError("verifyActivationOtp", err);
      const status = err?.status;
      const message = err?.data?.message ?? "";
      const code = err?.data?.code;

      if (code === "WHOLESALER_DETAILS_INCOMPLETE") {
        toast.error("Complete business details first.");
        onBack();
        return;
      }
      if (status === 400) {
        if (message.toLowerCase().includes("expired")) {
          setErrors({ otp: "OTP expired. Resend a new one." });
          return;
        }
        if (message.toLowerCase().includes("invalid")) {
          setErrors({ otp: "Incorrect OTP. Please try again." });
          return;
        }
        setErrors({ otp: message || "Invalid input." });
        return;
      }
      if (status === 429) {
        setErrors({ otp: "Too many wrong attempts. Request a new OTP." });
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
          <span className="font-black text-[#0F172A] break-all">{destinationLabel}</span>
        </p>
      </div>

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
        hint="Check your registered email inbox"
      />

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

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || isLoading}
        className="text-xs text-amber-600 font-bold underline underline-offset-2 self-start disabled:opacity-50"
      >
        {resending ? "Resending..." : "Resend OTP"}
      </button>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm
            hover:bg-slate-50 uppercase tracking-wider disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
            text-[#0F172A] font-black py-4 rounded-xl uppercase tracking-wider disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Activating...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Activate Account
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ActivatePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stage, setStage] = useState("boot"); // boot | lookup | complete | payment | otp | pending | rejected | activated
  const [mobile, setMobile] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [requestState, setRequestState] = useState(null);
  const [lookup] = useLazyGetWholesalerOnboardingStatusQuery();
  const [sendOtp] = useSendActivationOtpMutation();
  const bootedRef = useRef(false);

  const handleRoute = useCallback((routed) => {
    setMobile(routed.mobile);
    setStage(routed.stage);
    const emailFromRoute =
      routed?.request?.email ||
      routed?.email ||
      "";
    if (emailFromRoute) setRegisteredEmail(emailFromRoute);
    if (routed?.request) setRequestState(routed.request);
    setOtpDestination(
      routed.otpDestination ||
        formatOtpDestination({ email: emailFromRoute }, routed.mobile)
    );
    // Keep deep-link mobile in URL for refresh; sync step for shareability.
    const next = new URLSearchParams();
    next.set("mobile", routed.mobile);
    if (routed.stage === "complete") next.set("step", "complete");
    if (routed.stage === "payment") next.set("step", "payment");
    if (routed.stage === "otp") next.set("step", "otp");
    setSearchParams(next, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const qMobile = normalizeMobile(searchParams.get("mobile"));
    const qStep = String(searchParams.get("step") || "").toLowerCase();

    if (!/^\d{10}$/.test(qMobile)) {
      Promise.resolve().then(() => setStage("lookup"));
      return;
    }

    (async () => {
      try {
        const routed = await resolveActivateRoute({
          mobileNumber: qMobile,
          preferredStep: qStep === "otp" ? "otp" : qStep === "payment" ? "payment" : "complete",
          lookup,
          sendOtp,
          // Don't auto-send OTP when opening complete-details deep link.
          autoSendOtp: qStep === "otp",
        });
        if (!routed.ok) {
          setMobile(qMobile);
          setStage("lookup");
          toast.error(routed.error || "Could not open setup link.");
          return;
        }
        if (routed.otpSent) {
          toast.info("OTP sent to your registered email!");
        } else if (routed.otpWarning) {
          toast.warning(routed.otpWarning);
        }
        handleRoute(routed);
      } catch (err) {
        logError("activateDeepLink", err);
        setMobile(qMobile);
        setStage("lookup");
        toast.error(err?.data?.message || "Could not open setup link.");
      }
    })();
  }, [searchParams, lookup, sendOtp, handleRoute]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {stage === "boot" && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="text-sm font-medium">Opening your setup…</p>
            </div>
          )}

          {stage === "lookup" && (
            <LookupPhase onRoute={handleRoute} initialMobile={mobile} />
          )}

          {stage === "complete" && (
            <CompleteDetailsForm
              mobileNumber={mobile}
              onBack={() => setStage("lookup")}
              onContinue={(payload) =>
                handleRoute({
                  stage: "payment",
                  mobile,
                  email: payload?.email || registeredEmail,
                  request: payload?.request || { email: payload?.email || registeredEmail },
                })
              }
            />
          )}

          {stage === "payment" && (
            <PaymentPhase
              mobileNumber={mobile}
              request={requestState || { email: registeredEmail }}
              onBack={() => setStage("complete")}
              onPaid={(payload) =>
                handleRoute({
                  stage: "otp",
                  mobile,
                  otpSent: true,
                  email: payload?.email || registeredEmail,
                  request: { email: payload?.email || registeredEmail },
                  otpDestination:
                    payload?.otpDestination ||
                    formatOtpDestination({ email: payload?.email || registeredEmail }, mobile),
                })
              }
            />
          )}

          {stage === "otp" && (
            <OtpPhase
              mobileNumber={mobile}
              otpDestination={otpDestination}
              onBack={() => setStage("lookup")}
            />
          )}

          {stage === "pending" && (
            <StatusCard
              icon={Clock}
              tone="amber"
              title="Awaiting Approval"
              body="Your interest is submitted and pending owner review. We'll notify you on WhatsApp after a decision."
              onBack={() => setStage("lookup")}
            />
          )}

          {stage === "rejected" && (
            <StatusCard
              icon={XCircle}
              tone="red"
              title="Request Not Approved"
              body="Unfortunately this wholesaler request was not approved. Contact support if you need help."
              onBack={() => setStage("lookup")}
            />
          )}

          {stage === "activated" && (
            <StatusCard
              icon={CheckCircle2}
              tone="green"
              title="Already Active"
              body="This account is already activated. Please log in with your email/mobile and password."
              onBack={() => navigate("/")}
            />
          )}
        </div>

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
