import React, { useState } from "react";
import { User, Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { nextStep, updateFormData } from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";

// ── Inline field-level validation ────────────────────────────────────────────
const validate = (data) => {
  const errors = {};
  if (!data.fullName.trim())                          errors.fullName       = "Full name is required";
  // if (!data.email.trim())                             errors.email          = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                                                      errors.email          = "Enter a valid email";
  if (!data.mobileNumber.trim())                      errors.mobileNumber   = "Mobile number is required";
  else if (!/^\d{10}$/.test(data.mobileNumber.trim()))
                                                      errors.mobileNumber   = "Enter a valid 10-digit number";
  if (!data.whatsappNumber.trim())                    errors.whatsappNumber = "WhatsApp number is required";
  else if (!/^\d{10}$/.test(data.whatsappNumber.trim()))
                                                      errors.whatsappNumber = "Enter a valid 10-digit number";
  return errors;
};

// ── Reusable input component ─────────────────────────────────────────────────
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
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-200 focus:border-[#478B8D] focus:ring-2 focus:ring-[#478B8D]/10"
          }`}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const Step1_PersonalInfo = ({ formData }) => {
  const dispatch = useDispatch();
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    dispatch(updateFormData({ [field]: e.target.value }));
    // Clear error on change if field was already touched
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleNext = () => {
    const allErrors = validate(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({ fullName: true, email: true, mobileNumber: true, whatsappNumber: true });
      return;
    }
    dispatch(nextStep());
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Personal Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tell us who you are</p>
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
        onClick={handleNext}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
          text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm"
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default Step1_PersonalInfo;