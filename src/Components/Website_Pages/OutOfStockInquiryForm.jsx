import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import wholesaleAxios from "../../SERVICES/Wholesaleaxios";
import { selectUser } from "../REDUX_FEATURES/REDUX_SLICES/authApi/authSlice";
import {
  isValidInquiryEmail,
  isValidInquiryPhone,
  validateInquiryContact,
} from "../../utils/oosInquiryValidation";

/**
 * PDP notify form — OUT_OF_STOCK and MOQ_UNMET (wholesale).
 * Email + mobile both required (restock alert by email; phone for contact / in-app match).
 *
 * @param {{ productId?: string, variantId?: string, disabled?: boolean, reason?: 'OUT_OF_STOCK' | 'MOQ_UNMET', moq?: number, availableQty?: number|null }} props
 */
export default function OutOfStockInquiryForm({
  productId,
  variantId,
  disabled,
  reason = "OUT_OF_STOCK",
  moq,
  availableQty,
}) {
  const user = useSelector(selectUser);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isMoq = reason === "MOQ_UNMET";
  const statusLabel = isMoq ? "MOQ not met" : "Out of Stock";
  const headline = isMoq
    ? "Want this when stock meets MOQ?"
    : "Want this when it's back?";
  const subcopy = isMoq
    ? `Min order is ${moq ?? "—"} units${
        availableQty != null ? `, only ${availableQty} available now` : ""
      }. Enter email and mobile — we'll notify you when you can order.`
    : "Enter your email and mobile — we'll email you as soon as it's available again.";
  const waitlistBody = isMoq
    ? "We'll email you when stock meets the minimum order quantity — and show it in your website notifications if you're logged in."
    : "We'll email you when this size/colour is back — and show it in your website notifications if you're logged in.";

  useEffect(() => {
    if (user?.email) setEmail(String(user.email));
    if (user?.phone) setPhone(String(user.phone).replace(/\D/g, "").slice(-10));
  }, [user?.email, user?.phone]);

  useEffect(() => {
    setSubmitted(false);
    setFieldError(null);
  }, [productId, variantId, reason]);

  const canSubmit = useMemo(() => {
    return Boolean(productId && variantId) && !disabled && !submitting && !submitted;
  }, [productId, variantId, disabled, submitting, submitted]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const checked = validateInquiryContact({ email, phone });
    if (!checked.ok) {
      setFieldError({ field: checked.field, message: checked.message });
      return;
    }
    setFieldError(null);
    setSubmitting(true);

    try {
      const res = await wholesaleAxios.post("/oos-inquiries", {
        productId: String(productId),
        variantId: String(variantId),
        email: checked.email,
        phone: checked.phone,
      });
      const msg =
        res?.data?.message ||
        (isMoq
          ? "Thanks! We will notify you when stock meets MOQ."
          : "Thanks! We will notify you when this product is back in stock.");
      toast.success(msg);
      setSubmitted(true);
    } catch (err) {
      const data = err?.response?.data;
      const message =
        data?.message ||
        (err?.response?.status === 429
          ? "Too many attempts. Please try again later."
          : "Could not submit request. Please try again.");
      setFieldError({
        field: data?.field || "contact",
        message,
      });
      if (data?.code === "PRODUCT_IN_STOCK") {
        toast.info(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full space-y-3">
        <div className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 text-center">
          {statusLabel}
        </div>
        <div className="w-full rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                You&apos;re on the waitlist
              </p>
              <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                {waitlistBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div
        className={`w-full py-3 rounded-xl text-sm font-semibold text-center ${
          isMoq ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {statusLabel}
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-3.5"
        noValidate
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF4E5] text-[#C27803]">
            <Bell className="w-4 h-4" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{headline}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{subcopy}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <label
              htmlFor="oos-inquiry-email"
              className="block text-[11px] font-semibold text-slate-600 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="oos-inquiry-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              disabled={submitting || disabled}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError?.field === "email") setFieldError(null);
              }}
              onBlur={() => {
                const v = email.trim();
                if (!v) {
                  setFieldError({
                    field: "email",
                    message: "Email is required so we can notify you when it is back.",
                  });
                  return;
                }
                if (!isValidInquiryEmail(v)) {
                  setFieldError({
                    field: "email",
                    message: "Enter a valid email (e.g. name@gmail.com).",
                  });
                }
              }}
              className={`w-full px-3.5 py-3 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#F7A221]/35 focus:border-[#F7A221] ${
                fieldError?.field === "email" ? "border-red-300" : "border-slate-200"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="oos-inquiry-phone"
              className="block text-[11px] font-semibold text-slate-600 mb-1"
            >
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              id="oos-inquiry-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              disabled={submitting || disabled}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(next);
                if (fieldError?.field === "phone") setFieldError(null);
              }}
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              onBlur={() => {
                const v = phone.trim();
                if (!v) {
                  setFieldError({ field: "phone", message: "Mobile number is required." });
                  return;
                }
                if (!isValidInquiryPhone(v)) {
                  setFieldError({
                    field: "phone",
                    message: "Enter a valid 10-digit Indian mobile number.",
                  });
                }
              }}
              className={`w-full px-3.5 py-3 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#F7A221]/35 focus:border-[#F7A221] ${
                fieldError?.field === "phone" ? "border-red-300" : "border-slate-200"
              }`}
            />
          </div>
        </div>

        {fieldError?.message ? (
          <p className="text-[11px] text-red-600 font-medium" role="alert">
            {fieldError.message}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">
            Restock alert goes to your email. We also use your details for website
            notifications if you have an account — no spam.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-[#F7A221] text-slate-900 hover:brightness-95 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              Notify me when available
            </>
          )}
        </button>
      </form>
    </div>
  );
}
