import React, { useState } from "react";
import { User, Mail, Phone, MessageCircle, Loader2, Send } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  updateFormData,
  setRegistrationSuccess,
  resetFormData,
  closeModal,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
import {
  useSubmitWholesalerRequestMutation,
  logError,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";

const validate = (data) => {
  const errors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email";
  if (!data.mobileNumber.trim()) errors.mobileNumber = "Mobile number is required";
  else if (!/^\d{10}$/.test(data.mobileNumber.trim()))
    errors.mobileNumber = "Enter a valid 10-digit number";
  if (!data.whatsappNumber.trim()) errors.whatsappNumber = "WhatsApp number is required";
  else if (!/^\d{10}$/.test(data.whatsappNumber.trim()))
    errors.whatsappNumber = "Enter a valid 10-digit number";
  return errors;
};

const Field = ({ label, icon: Icon, error, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={16} />
      </div>
      <input
        {...props}
        className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
          focus:outline-none transition-all duration-200
          ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-[#478B8D] focus:ring-2 focus:ring-[#478B8D]/10"
          }`}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

/**
 * Phase-1 registration: basic interest only.
 * After owner approval, applicant completes business details on /activate.
 */
const Step1_PersonalInfo = ({ formData }) => {
  const dispatch = useDispatch();
  const [submitRequest, { isLoading }] = useSubmitWholesalerRequestMutation();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    const raw = e.target.value;
    const value =
      field === "mobileNumber" || field === "whatsappNumber"
        ? raw.replace(/\D/g, "").slice(0, 10)
        : raw;
    dispatch(updateFormData({ [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSubmit = async () => {
    const allErrors = validate(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({
        fullName: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
      });
      return;
    }

    const fd = new FormData();
    fd.append("fullName", formData.fullName.trim());
    fd.append("email", formData.email.trim().toLowerCase());
    fd.append("mobileNumber", formData.mobileNumber.trim());
    fd.append("whatsappNumber", formData.whatsappNumber.trim());

    const response = await submitRequest(fd);
    const err = response?.error;
    const result = response?.data;

    if (err) {
      logError("submitWholesalerRequest", err);
      const status = err?.status;
      const code = err?.data?.code;
      const message = err?.data?.message ?? "";

      if (status === 409) {
        if (code === "WHOLESALER_APPROVED_COMPLETE_DETAILS") {
          toast.info(
            "You're already approved. Open Activate to complete business details.",
            { autoClose: 7000 }
          );
          setTimeout(() => {
            dispatch(closeModal());
            window.location.href = "/activate";
          }, 800);
          return;
        }
        if (code === "WHOLESALER_ALREADY_APPROVED") {
          toast.info("Request already approved. Open Activate to finish setup.", {
            autoClose: 7000,
          });
          setTimeout(() => {
            dispatch(closeModal());
            window.location.href = "/activate";
          }, 800);
          return;
        }
        if (code === "WHOLESALER_ALREADY_ACTIVE") {
          toast.info("Account already active. Please log in.", { autoClose: 6000 });
          return;
        }
        toast.error(
          message ||
            "A request with this mobile or email already exists. Our team will review it.",
          { autoClose: 7000 }
        );
        return;
      }

      if (status === 400) {
        const fieldErrors = err?.data?.errors;
        if (fieldErrors?.length) {
          toast.error(`Validation error: ${fieldErrors[0]?.msg ?? message}`, {
            autoClose: 6000,
          });
        } else {
          toast.error(message || "Please check your inputs and try again.", {
            autoClose: 5000,
          });
        }
        return;
      }

      toast.error(message || "Something went wrong. Please try again.", {
        autoClose: 5000,
      });
      return;
    }

    dispatch(setRegistrationSuccess(result?.request?.id ?? null));
    dispatch(resetFormData());
    toast.success(
      "Interest submitted! We'll review and contact you on WhatsApp after approval.",
      { autoClose: 6500 }
    );
    setTimeout(() => dispatch(closeModal()), 1800);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Register Interest</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Share basic details only. After approval you&apos;ll complete business info and
          activate on{" "}
          <a href="/activate" className="text-[#478B8D] font-bold underline underline-offset-2">
            /activate
          </a>
          .
        </p>
      </div>

      <Field
        label="Full Name"
        icon={User}
        required
        type="text"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange("fullName")}
        onBlur={handleBlur("fullName")}
        error={errors.fullName}
      />

      <Field
        label="Email Address"
        icon={Mail}
        required
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange("email")}
        onBlur={handleBlur("email")}
        error={errors.email}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Mobile Number"
          icon={Phone}
          required
          type="tel"
          placeholder="10-digit mobile"
          maxLength={10}
          value={formData.mobileNumber}
          onChange={handleChange("mobileNumber")}
          onBlur={handleBlur("mobileNumber")}
          error={errors.mobileNumber}
        />
        <Field
          label="WhatsApp Number"
          icon={MessageCircle}
          required
          type="tel"
          placeholder="10-digit WhatsApp"
          maxLength={10}
          value={formData.whatsappNumber}
          onChange={handleChange("whatsappNumber")}
          onBlur={handleBlur("whatsappNumber")}
          error={errors.whatsappNumber}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
          text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
          disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send size={16} /> Submit Interest
          </>
        )}
      </button>
    </div>
  );
};

export default Step1_PersonalInfo;
