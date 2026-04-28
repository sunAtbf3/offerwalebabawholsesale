import React, { useState, useRef } from "react";
import {
  MapPin, ShoppingBag, Tag, IndianRupee,
  ArrowLeft, Upload, CheckCircle2, Loader2, FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  prevStep,
  updateFormData,
  resetFormData,
  setRegistrationSuccess,
  selectFormData,
  closeModal,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
import { useSubmitWholesalerRequestMutation } from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";
import { logError } from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";

// ── Product categories matching your backend expectations ───────────────────
const CATEGORIES = [
  "Electronics",
  "Smart Life Gadgets",
  "Home & Kitchen",
  "Fashion World",
  "Sports & Fitness",
  "Stationary",
  "Baby Items",
  "Car Accessories",
  "Cleaning Supplies",
  "Gifts",
  "Tours & Travels",
  "Mix / General",
];

const validate = (data) => {
  const errors = {};
  if (!data.sellingPlaceFrom.trim())
    errors.sellingPlaceFrom = "Selling place is required";
  if (!data.sellingZoneCity.trim())
    errors.sellingZoneCity = "City / zone is required";
  if (!data.productCategory.trim())
    errors.productCategory = "Please select a category";
  if (!data.monthlyEstimatedPurchase || isNaN(Number(data.monthlyEstimatedPurchase)) || Number(data.monthlyEstimatedPurchase) <= 0)
    errors.monthlyEstimatedPurchase = "Enter a valid monthly purchase amount";
  if (!data.idProofFile)
    errors.idProofFile = "ID proof document is required";
  if (!data.businessAddressProofFile)
    errors.businessAddressProofFile = "Business address proof is required";
  return errors;
};

// ── File upload button ───────────────────────────────────────────────────────
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
        {file ? (
          <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
        ) : (
          <Upload size={18} className="text-slate-400 shrink-0" />
        )}
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

const InputField = ({ label, icon: Icon, error, required, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children ?? (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          {...props}
          className={`w-full ${Icon ? "pl-9" : "pl-4"} pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
            focus:outline-none transition-all duration-200
            ${error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            }`}
        />
      </div>
    )}
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const Step3_BusinessInfo = () => {
  const dispatch   = useDispatch();
  const formData   = useSelector(selectFormData);
  const [submitRequest, { isLoading }] = useSubmitWholesalerRequestMutation();
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (value) => {
    dispatch(updateFormData({ [field]: value }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (field) => (file) => {
    dispatch(updateFormData({ [field]: file }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  // ── Build FormData and submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    const allErrors = validate(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({
        sellingPlaceFrom: true, sellingZoneCity: true,
        productCategory: true, monthlyEstimatedPurchase: true,
        idProofFile: true, businessAddressProofFile: true,
      });
      return;
    }

    // Build multipart/form-data — backend multer handles Cloudinary
    const fd = new FormData();
    fd.append("fullName",                  formData.fullName.trim());
    fd.append("email",                     formData.email.trim().toLowerCase());
    fd.append("mobileNumber",              formData.mobileNumber.trim());
    fd.append("whatsappNumber",            formData.whatsappNumber.trim());
    fd.append("permanentAddress",          formData.permanentAddress.trim());
    fd.append("businessAddress",           formData.businessAddress.trim());
    fd.append("deliveryAddress",           formData.deliveryAddress.trim());
    fd.append("haveShop",                  String(formData.haveShop));
    fd.append("sellingPlaceFrom",          formData.sellingPlaceFrom.trim());
    fd.append("sellingZoneCity",           formData.sellingZoneCity.trim());
    fd.append("productCategory",           formData.productCategory.trim());
    fd.append("monthlyEstimatedPurchase",  String(Number(formData.monthlyEstimatedPurchase)));
    // Files — field names match what multer expects on backend
    fd.append("idProof",               formData.idProofFile);
    fd.append("businessAddressProof",  formData.businessAddressProofFile);

    const response = await submitRequest(fd);
    const err = response?.error;
    const result = response?.data;

    if (err) {
      // ── Failure modes with full context logging ────────────────────────
      logError("submitWholesalerRequest", err);

      const status = err?.status;
      const message = err?.data?.message ?? "";

      if (status === 409) {
        toast.error(
          "A request with this mobile or email already exists. Our team will review it.",
          { autoClose: 7000 }
        );
        return;
      }

      if (status === 400) {
        const fieldErrors = err?.data?.errors;
        if (fieldErrors?.length) {
          toast.error(`Validation error: ${fieldErrors[0]?.msg ?? message}`, { autoClose: 6000 });
        } else {
          toast.error(message || "Please check your inputs and try again.", { autoClose: 5000 });
        }
        return;
      }

      if (status === 500 || status === "FETCH_ERROR") {
        toast.error("Server error. Please try again in a moment.", { autoClose: 5000 });
        return;
      }

      // Catch-all
      toast.error(message || "Something went wrong. Please try again.", { autoClose: 5000 });
      return;
    }

    // Success path
    dispatch(setRegistrationSuccess(result?.request?.id ?? null));
    dispatch(resetFormData());
    toast.success(
      "🎉 Request submitted! Our team will review and contact you shortly.",
      { autoClose: 6000 }
    );
    // Small delay so toast is visible before modal closes
    setTimeout(() => dispatch(closeModal()), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Business Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Selling Place From"
          icon={MapPin}
          required
          type="text"
          placeholder="e.g. Home, Shop, Market"
          value={formData.sellingPlaceFrom}
          onChange={(e) => handleChange("sellingPlaceFrom")(e.target.value)}
          onBlur={handleBlur("sellingPlaceFrom")}
          error={errors.sellingPlaceFrom}
        />
        <InputField
          label="Selling Zone / City"
          icon={MapPin}
          required
          type="text"
          placeholder="e.g. Delhi, Mumbai"
          value={formData.sellingZoneCity}
          onChange={(e) => handleChange("sellingZoneCity")(e.target.value)}
          onBlur={handleBlur("sellingZoneCity")}
          error={errors.sellingZoneCity}
        />
      </div>

      {/* Product Category */}
      <InputField label="Product Category" required error={errors.productCategory}>
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={formData.productCategory}
            onChange={(e) => handleChange("productCategory")(e.target.value)}
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
      </InputField>

      {/* Monthly Purchase */}
      <InputField
        label="Monthly Estimated Purchase (₹)"
        icon={IndianRupee}
        required
        type="number"
        min="1"
        placeholder="e.g. 50000"
        value={formData.monthlyEstimatedPurchase}
        onChange={(e) => handleChange("monthlyEstimatedPurchase")(e.target.value)}
        onBlur={handleBlur("monthlyEstimatedPurchase")}
        error={errors.monthlyEstimatedPurchase}
      />

      {/* File Uploads */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={15} className="text-blue-600" />
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Document Upload</p>
        </div>
        <p className="text-xs text-blue-600">Accepted: PDF, JPG, JPEG, PNG, WEBP — max 10MB each</p>
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

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => dispatch(prevStep())}
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
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3_BusinessInfo;