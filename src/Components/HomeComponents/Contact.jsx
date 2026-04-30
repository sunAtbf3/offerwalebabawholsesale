import React, { useState, useRef } from "react";
import {
  Mail, Phone, Globe, MessageCircle, MapPin, Clock,
  ArrowRight, ArrowLeft, Package, Star, CheckCircle2,
  Upload, Check, User, Building2, Truck, Store,
  Tag, IndianRupee, FileText, Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/43189e22c68124815ee9f188d7c6e0d9";

const CATEGORIES = [
  "Electronics", "Smart Life Gadgets", "Home & Kitchen",
  "Fashion World", "Sports & Fitness", "Stationary",
  "Baby Items", "Car Accessories", "Cleaning Supplies",
  "Gifts", "Tours & Travels", "Mix / General",
];

const INITIAL_FORM = {
  // Step 1
  fullName: "", email: "", mobileNumber: "", whatsappNumber: "",
  // Step 2
  permanentAddress: "", haveShop: false, businessAddress: "", deliveryAddress: "",
  // Step 3
  sellingPlaceFrom: "", sellingZoneCity: "", productCategory: "",
  monthlyEstimatedPurchase: "", idProofFile: null, businessAddressProofFile: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────
const validateStep1 = (d) => {
  const e = {};
  if (!d.fullName.trim())                                    e.fullName       = "Full name is required";
  if (!d.email.trim())                                       e.email          = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))     e.email          = "Enter a valid email";
  if (!d.mobileNumber.trim())                                e.mobileNumber   = "Mobile number is required";
  else if (!/^\d{10}$/.test(d.mobileNumber.trim()))          e.mobileNumber   = "Enter a valid 10-digit number";
  if (!d.whatsappNumber.trim())                              e.whatsappNumber = "WhatsApp number is required";
  else if (!/^\d{10}$/.test(d.whatsappNumber.trim()))        e.whatsappNumber = "Enter a valid 10-digit number";
  return e;
};

const validateStep2 = (d) => {
  const e = {};
  if (!d.permanentAddress.trim()) e.permanentAddress = "Permanent address is required";
  if (!d.businessAddress.trim())  e.businessAddress  = "Business address is required";
  if (!d.deliveryAddress.trim())  e.deliveryAddress  = "Delivery address is required";
  return e;
};

const validateStep3 = (d) => {
  const e = {};
  if (!d.sellingPlaceFrom.trim())   e.sellingPlaceFrom = "Selling place is required";
  if (!d.sellingZoneCity.trim())    e.sellingZoneCity  = "City / zone is required";
  if (!d.productCategory.trim())    e.productCategory  = "Please select a category";
  if (!d.monthlyEstimatedPurchase || isNaN(Number(d.monthlyEstimatedPurchase)) || Number(d.monthlyEstimatedPurchase) <= 0)
                                    e.monthlyEstimatedPurchase = "Enter a valid monthly purchase amount";
  if (!d.idProofFile)               e.idProofFile               = "ID proof document is required";
  if (!d.businessAddressProofFile)  e.businessAddressProofFile  = "Business address proof is required";
  return e;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Text / email / tel / number input */
const Field = ({ label, icon: Icon, error, required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-9" : "pl-4"} pr-4 py-3 rounded-xl border-2 text-sm font-medium
          bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
          }`}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

/** Textarea */
const TextAreaField = ({ label, icon: Icon, error, required, hint, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={13} className="text-slate-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    <textarea
      {...props}
      rows={2}
      className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
        focus:outline-none transition-all duration-200 resize-none
        ${error
          ? "border-red-400 focus:border-red-500"
          : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
        }`}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

/** File upload button — accepts images + PDF */
const FileUpload = ({ label, hint, file, onFileChange, error }) => {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} <span className="text-red-500">*</span>
      </label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed transition-all duration-200
          ${error
            ? "border-red-400 bg-red-50"
            : file
            ? "border-amber-400 bg-amber-50"
            : "border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50"
          }`}
      >
        {file
          ? <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
          : <Upload size={18} className="text-slate-400 shrink-0" />
        }
        <span className={`text-sm font-medium truncate ${file ? "text-amber-700" : "text-slate-500"}`}>
          {file ? file.name : "Click to upload (PDF / JPG / PNG)"}
        </span>
        {file && (
          <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
            {(file.size / 1024).toFixed(0)} KB
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Address Info" },
  { number: 3, label: "Business Info" },
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center w-full mb-8 px-4">
    {STEPS.map((step, idx) => {
      const isCompleted = currentStep > step.number;
      const isActive    = currentStep === step.number;
      const isLast      = idx === STEPS.length - 1;
      return (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300
                ${isCompleted
                  ? "bg-amber-500 border-amber-500 text-white"
                  : isActive
                  ? "bg-[#0F172A] border-[#0F172A] text-white"
                  : "bg-white border-slate-300 text-slate-400"
                }`}
            >
              {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                ${isActive ? "text-[#0F172A]" : isCompleted ? "text-amber-600" : "text-slate-400"}`}
            >
              {step.label}
            </span>
          </div>
          {!isLast && (
            <div className="flex-1 mx-3 mb-5">
              <div className="h-0.5 w-full bg-slate-200 relative overflow-hidden rounded-full">
                <div
                  className="absolute left-0 top-0 h-full bg-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — PERSONAL INFO
// ─────────────────────────────────────────────────────────────────────────────
const Step1 = ({ formData, onChange, onNext }) => {
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateStep1(formData)[field] }));
  };

  const handleNext = () => {
    const allErrors = validateStep1(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({ fullName: true, email: true, mobileNumber: true, whatsappNumber: true });
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Personal Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tell us who you are</p>
      </div>

      <Field
        label="Full Name" icon={User} required
        type="text" placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleChange("fullName")}
        onBlur={handleBlur("fullName")}
        error={errors.fullName}
      />

      <Field
        label="Email Address" icon={Mail} required
        type="email" placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange("email")}
        onBlur={handleBlur("email")}
        error={errors.email}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Mobile Number" icon={Phone} required
          type="tel" placeholder="10-digit mobile" maxLength={10}
          value={formData.mobileNumber}
          onChange={handleChange("mobileNumber")}
          onBlur={handleBlur("mobileNumber")}
          error={errors.mobileNumber}
        />
        <Field
          label="WhatsApp Number" icon={MessageCircle} required
          type="tel" placeholder="10-digit WhatsApp" maxLength={10}
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

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — ADDRESS INFO
// ─────────────────────────────────────────────────────────────────────────────
const Step2 = ({ formData, onChange, onNext, onBack }) => {
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateStep2(formData)[field] }));
  };

  const handleNext = () => {
    const allErrors = validateStep2(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({ permanentAddress: true, businessAddress: true, deliveryAddress: true });
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Address Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">We need your location details</p>
      </div>

      <TextAreaField
        label="Permanent Address" icon={MapPin} required
        placeholder="Your home / permanent address"
        value={formData.permanentAddress}
        onChange={handleChange("permanentAddress")}
        onBlur={handleBlur("permanentAddress")}
        error={errors.permanentAddress}
      />

      {/* Have Shop Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Store size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-[#0F172A]">Do you have a shop?</p>
            <p className="text-xs text-slate-500">Physical retail location</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange("haveShop", !formData.haveShop)}
          className={`relative w-12 h-6 rounded-full transition-all duration-300
            ${formData.haveShop ? "bg-amber-500" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300
              ${formData.haveShop ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>
      </div>

      <TextAreaField
        label="Business Address" icon={Building2} required
        hint={formData.haveShop ? "Your shop address" : "Where you operate from"}
        placeholder="Your business operating address"
        value={formData.businessAddress}
        onChange={handleChange("businessAddress")}
        onBlur={handleBlur("businessAddress")}
        error={errors.businessAddress}
      />

      <TextAreaField
        label="Delivery Address" icon={Truck} required
        hint="Where should we deliver your wholesale orders?"
        placeholder="Delivery / warehouse address"
        value={formData.deliveryAddress}
        onChange={handleChange("deliveryAddress")}
        onBlur={handleBlur("deliveryAddress")}
        error={errors.deliveryAddress}
      />

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200
            text-slate-600 font-black text-sm hover:bg-slate-50 transition-all duration-200 uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800
            text-white font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm"
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — BUSINESS INFO + SUBMIT
// ─────────────────────────────────────────────────────────────────────────────
const Step3 = ({ formData, onChange, onFileChange, onBack, onSubmitSuccess }) => {
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelectChange = (field) => (e) => {
    onChange(field, e.target.value);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (field) => (file) => {
    onFileChange(field, file);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateStep3(formData)[field] }));
  };

  const handleSubmit = async () => {
    const allErrors = validateStep3(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({
        sellingPlaceFrom: true, sellingZoneCity: true,
        productCategory: true, monthlyEstimatedPurchase: true,
        idProofFile: true, businessAddressProofFile: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      // Personal
      fd.append("fullName",                 formData.fullName.trim());
      fd.append("email",                    formData.email.trim().toLowerCase());
      fd.append("mobileNumber",             formData.mobileNumber.trim());
      fd.append("whatsappNumber",           formData.whatsappNumber.trim());
      // Address
      fd.append("permanentAddress",         formData.permanentAddress.trim());
      fd.append("haveShop",                 String(formData.haveShop));
      fd.append("businessAddress",          formData.businessAddress.trim());
      fd.append("deliveryAddress",          formData.deliveryAddress.trim());
      // Business
      fd.append("sellingPlaceFrom",         formData.sellingPlaceFrom.trim());
      fd.append("sellingZoneCity",          formData.sellingZoneCity.trim());
      fd.append("productCategory",          formData.productCategory.trim());
      fd.append("monthlyEstimatedPurchase", String(Number(formData.monthlyEstimatedPurchase)));
      // Files
      fd.append("idProof",                  formData.idProofFile);
      fd.append("businessAddressProof",     formData.businessAddressProofFile);

      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Server responded with ${res.status}`);
      }

      toast.success(
        "🎉 Application submitted! We'll contact you within 24 hours.",
        { autoClose: 6000 }
      );
      onSubmitSuccess();

    } catch (err) {
      console.error("[ContactUs] submit error:", err);
      toast.error(
        err?.message || "Something went wrong. Please try again.",
        { autoClose: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Business Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Selling Place From" icon={MapPin} required
          type="text" placeholder="e.g. Home, Shop, Market"
          value={formData.sellingPlaceFrom}
          onChange={handleChange("sellingPlaceFrom")}
          onBlur={handleBlur("sellingPlaceFrom")}
          error={errors.sellingPlaceFrom}
        />
        <Field
          label="Selling Zone / City" icon={MapPin} required
          type="text" placeholder="e.g. Delhi, Mumbai"
          value={formData.sellingZoneCity}
          onChange={handleChange("sellingZoneCity")}
          onBlur={handleBlur("sellingZoneCity")}
          error={errors.sellingZoneCity}
        />
      </div>

      {/* Product Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Product Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={formData.productCategory}
            onChange={handleSelectChange("productCategory")}
            onBlur={handleBlur("productCategory")}
            className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
              focus:outline-none transition-all duration-200 appearance-none cursor-pointer
              ${errors.productCategory
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              }`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {errors.productCategory && (
          <p className="text-xs text-red-500 font-medium">{errors.productCategory}</p>
        )}
      </div>

      <Field
        label="Monthly Estimated Purchase (₹)" icon={IndianRupee} required
        type="number" min="1" placeholder="e.g. 50000"
        value={formData.monthlyEstimatedPurchase}
        onChange={handleChange("monthlyEstimatedPurchase")}
        onBlur={handleBlur("monthlyEstimatedPurchase")}
        error={errors.monthlyEstimatedPurchase}
      />

      {/* Document info banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={15} className="text-blue-600" />
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Document Upload</p>
        </div>
        <p className="text-xs text-blue-600">Accepted: PDF, JPG, JPEG, PNG, WEBP — max 10 MB each</p>
      </div>

      <FileUpload
        label="ID Proof"
        hint="Aadhaar, PAN, Voter ID or Passport"
        file={formData.idProofFile}
        onFileChange={handleFileChange("idProofFile")}
        error={errors.idProofFile}
      />

      <FileUpload
        label="Business Address Proof"
        hint="Utility bill, rent agreement or GST certificate"
        file={formData.businessAddressProofFile}
        onFileChange={handleFileChange("businessAddressProofFile")}
        error={errors.businessAddressProofFile}
      />

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200
            text-slate-600 font-black text-sm hover:bg-slate-50 transition-all duration-200 uppercase tracking-wider
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
            text-[#0F172A] font-black py-3.5 rounded-xl transition-all duration-200 uppercase tracking-wider text-sm
            disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
            : "Submit Application"
          }
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL — unchanged design
// ─────────────────────────────────────────────────────────────────────────────
const Particles = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 2 + (((i * 7) % 4) + 1),
    x: (i * 17 + 5) % 100,
    y: (i * 23 + 10) % 100,
    delay: (i * 0.4) % 6,
    dur: 4 + (i % 5),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-amber-400/20 animate-ping"
          style={{
            width: d.size, height: d.size,
            left: `${d.x}%`, top: `${d.y}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
};

const StatBadge = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all rounded-2xl px-4 py-3 border border-white/10">
    <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center">
      <Icon size={16} className="text-amber-400" />
    </div>
    <div>
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-gray-400 text-[10px]">{label}</div>
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <a
    href={href || "#"}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className="group flex items-start gap-4 py-3 border-b border-white/10 last:border-0"
  >
    <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/20 flex items-center justify-center mt-0.5">
      <Icon size={14} className="text-amber-400" />
    </div>
    <div>
      <p className="text-[12px] text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className="text-gray-200 group-hover:text-amber-300">{value}</p>
    </div>
    <ArrowRight size={13} className="ml-auto mt-2 text-gray-600 group-hover:text-amber-400" />
  </a>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ContactUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData]       = useState(INITIAL_FORM);
  const [submitted, setSubmitted]     = useState(false);

  /** Generic field updater for text/select/boolean values */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** File-specific updater */
  const handleFileChange = (field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmitSuccess = () => {
    setSubmitted(true);
    setFormData(INITIAL_FORM);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            We're here to help
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Get in <span className="text-amber-500">Touch</span>
          </h1>
          <p className="text-gray-500 mt-3 max-w-md">
            Wholesale, retail, or bulk orders — we reply fast.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="relative bg-gray-900 rounded-3xl p-7 overflow-hidden">
              <Particles />
              <h2 className="text-2xl font-bold text-white">Offer Wale Baba</h2>
              <p className="text-amber-400 text-xs mb-5">Wholesale &amp; Retail</p>
              <InfoRow icon={Phone}  label="Call"    value="+91 93706 86008"          href="tel:+919370686008" />
              <InfoRow icon={Mail}   label="Email"   value="offerwalebaba1@gmail.com" href="mailto:offerwalebaba1@gmail.com" />
              <InfoRow icon={Globe}  label="Website" value="offerwalebaba.com"        href="https://offerwalebaba.com/" />
              <InfoRow icon={MapPin} label="Address" value="Ulhasnagar, MH"           href="https://maps.google.com" />
              <InfoRow icon={Clock}  label="Hours"   value="Tue–Sun, 1 PM – 11 PM" />
              <div className="grid grid-cols-2 gap-2 mt-5">
                <StatBadge icon={Package} value="10K+" label="Orders" />
                <StatBadge icon={Star}    value="4.8★"  label="Rating" />
              </div>
              <a
                href="https://wa.me/919370686008"
                className="mt-5 block text-center bg-green-500 text-white py-3 rounded-xl font-bold"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-3xl p-7 sm:p-9">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Application Submitted!</h2>
                <p className="text-gray-500 text-sm mt-2">
                  We will contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-black
                    text-sm rounded-xl transition-all duration-200 uppercase tracking-wider"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                <StepIndicator currentStep={currentStep} />

                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    onChange={handleChange}
                    onNext={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    formData={formData}
                    onChange={handleChange}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    formData={formData}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    onBack={() => setCurrentStep(2)}
                    onSubmitSuccess={handleSubmitSuccess}
                  />
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}