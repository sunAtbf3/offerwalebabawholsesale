import React, { useRef, useState } from "react";
import {
  MapPin,
  Building2,
  Truck,
  Store,
  Tag,
  IndianRupee,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useCompleteWholesalerDetailsMutation,
  logError,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerApi";
import { useGetAllCategoriesQuery } from "../../REDUX_FEATURES/REDUX_SLICES/SHOP_BY_CATEGORY/categoriesApi";

const INITIAL = {
  permanentAddress: "",
  businessAddress: "",
  deliveryAddress: "",
  haveShop: false,
  sellingPlaceFrom: "",
  sellingZoneCity: "",
  productCategory: "",
  monthlyEstimatedPurchase: "",
  idProofFile: null,
  businessAddressProofFile: null,
};

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
          ${
            error
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
        <span
          className={`text-sm font-medium truncate ${file ? "text-amber-700" : "text-slate-500"}`}
        >
          {file ? file.name : "Click to upload (PDF / JPG / PNG)"}
        </span>
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

/**
 * Phase-2: after owner approval — business details + proofs.
 * On success backend advances onboarding to the registration payment step.
 */
const CompleteDetailsForm = ({ mobileNumber, onBack, onContinue }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...INITIAL });
  const [errors, setErrors] = useState({});
  const [completeDetails, { isLoading }] = useCompleteWholesalerDetailsMutation();
  const { data: apiCategories = [] } = useGetAllCategoriesQuery();

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAddress = () => {
    const e = {};
    if (!form.permanentAddress.trim()) e.permanentAddress = "Permanent address is required";
    if (!form.businessAddress.trim()) e.businessAddress = "Business address is required";
    if (!form.deliveryAddress.trim()) e.deliveryAddress = "Delivery address is required";
    return e;
  };

  const validateBusiness = () => {
    const e = {};
    if (!form.sellingPlaceFrom.trim()) e.sellingPlaceFrom = "Selling place is required";
    if (!form.sellingZoneCity.trim()) e.sellingZoneCity = "City / zone is required";
    if (!form.productCategory.trim()) e.productCategory = "Please select a category";
    if (
      form.monthlyEstimatedPurchase === "" ||
      isNaN(Number(form.monthlyEstimatedPurchase)) ||
      Number(form.monthlyEstimatedPurchase) < 0
    ) {
      e.monthlyEstimatedPurchase = "Enter a valid monthly purchase amount";
    }
    if (!form.idProofFile) e.idProofFile = "ID proof is required";
    if (!form.businessAddressProofFile)
      e.businessAddressProofFile = "Business address proof is required";
    return e;
  };

  const handleNextFromAddress = () => {
    const e = validateAddress();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    const e = validateBusiness();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const fd = new FormData();
    fd.append("mobileNumber", mobileNumber);
    fd.append("permanentAddress", form.permanentAddress.trim());
    fd.append("businessAddress", form.businessAddress.trim());
    fd.append("deliveryAddress", form.deliveryAddress.trim());
    fd.append("haveShop", String(form.haveShop));
    fd.append("sellingPlaceFrom", form.sellingPlaceFrom.trim());
    fd.append("sellingZoneCity", form.sellingZoneCity.trim());
    fd.append("productCategory", form.productCategory.trim());
    fd.append("monthlyEstimatedPurchase", String(Number(form.monthlyEstimatedPurchase)));
    fd.append("idProof", form.idProofFile);
    fd.append("businessAddressProof", form.businessAddressProofFile);

    try {
      const result = await completeDetails(fd).unwrap();
      toast.success(
        result?.message || "Details saved. Complete the registration payment to continue.",
        { autoClose: 6500 }
      );
      onContinue?.({
        email: result?.request?.email || "",
        request: result?.request || null,
      });
    } catch (err) {
      logError("completeWholesalerDetails", err);
      const status = err?.status;
      const code = err?.data?.code;
      const message = err?.data?.message ?? "";

      if (status === 409 && code === "WHOLESALER_DETAILS_ALREADY_COMPLETE") {
        toast.info("Details already submitted. Continue to payment.", { autoClose: 5000 });
        onContinue?.({ email: err?.data?.request?.email || "", request: err?.data?.request || null });
        return;
      }
      if (status === 404) {
        toast.error("No approved request found for this mobile.");
        return;
      }
      if (status === 400) {
        toast.error(message || "Please check your inputs.");
        return;
      }
      toast.error(message || "Could not save details. Please try again.");
    }
  };

  const inputCls = (err) =>
    `w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 focus:bg-white
      focus:outline-none transition-all duration-200
      ${
        err
          ? "border-red-400 focus:border-red-500"
          : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
      }`;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-black text-[#0F172A]">Complete Business Details</h2>
        <p className="text-sm text-slate-500 mt-2">
          Mobile{" "}
          <span className="font-black text-[#0F172A]">+91 {mobileNumber}</span>
          {" · "}
          Step {step} of 2
        </p>
      </div>

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Permanent Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={form.permanentAddress}
              onChange={(e) => setField("permanentAddress", e.target.value)}
              placeholder="Your home / permanent address"
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 resize-none
                ${errors.permanentAddress ? "border-red-400" : "border-slate-200"}`}
            />
            {errors.permanentAddress && (
              <p className="text-xs text-red-500">{errors.permanentAddress}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
            <div className="flex items-center gap-3">
              <Store size={18} className="text-[#478B8D]" />
              <div>
                <p className="text-sm font-black text-[#0F172A]">Do you have a shop?</p>
                <p className="text-xs text-slate-500">Physical retail location</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setField("haveShop", !form.haveShop)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300
                ${form.haveShop ? "bg-[#478B8D]" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300
                  ${form.haveShop ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 size={13} /> Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={form.businessAddress}
              onChange={(e) => setField("businessAddress", e.target.value)}
              placeholder="Your business operating address"
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 resize-none
                ${errors.businessAddress ? "border-red-400" : "border-slate-200"}`}
            />
            {errors.businessAddress && (
              <p className="text-xs text-red-500">{errors.businessAddress}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Truck size={13} /> Delivery Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={form.deliveryAddress}
              onChange={(e) => setField("deliveryAddress", e.target.value)}
              placeholder="Where should we deliver wholesale orders?"
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium bg-slate-50 resize-none
                ${errors.deliveryAddress ? "border-red-400" : "border-slate-200"}`}
            />
            {errors.deliveryAddress && (
              <p className="text-xs text-red-500">{errors.deliveryAddress}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm
                flex items-center gap-2 uppercase tracking-wider"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleNextFromAddress}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] text-white font-black
                py-3.5 rounded-xl text-sm uppercase tracking-wider"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Selling Place From <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.sellingPlaceFrom}
                  onChange={(e) => setField("sellingPlaceFrom", e.target.value)}
                  placeholder="e.g. Home, Shop"
                  className={inputCls(errors.sellingPlaceFrom)}
                />
              </div>
              {errors.sellingPlaceFrom && (
                <p className="text-xs text-red-500">{errors.sellingPlaceFrom}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                City / Zone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.sellingZoneCity}
                  onChange={(e) => setField("sellingZoneCity", e.target.value)}
                  placeholder="e.g. Delhi"
                  className={inputCls(errors.sellingZoneCity)}
                />
              </div>
              {errors.sellingZoneCity && (
                <p className="text-xs text-red-500">{errors.sellingZoneCity}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Product Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={form.productCategory}
                onChange={(e) => setField("productCategory", e.target.value)}
                className={`${inputCls(errors.productCategory)} appearance-none cursor-pointer`}
              >
                <option value="">Select a category</option>
                {apiCategories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.productCategory && (
              <p className="text-xs text-red-500">{errors.productCategory}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Monthly Estimated Purchase (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                min="0"
                value={form.monthlyEstimatedPurchase}
                onChange={(e) => setField("monthlyEstimatedPurchase", e.target.value)}
                placeholder="e.g. 50000"
                className={inputCls(errors.monthlyEstimatedPurchase)}
              />
            </div>
            {errors.monthlyEstimatedPurchase && (
              <p className="text-xs text-red-500">{errors.monthlyEstimatedPurchase}</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={15} className="text-blue-600" />
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Document Upload
              </p>
            </div>
            <p className="text-xs text-blue-600">PDF, JPG, PNG, WEBP — max 5MB each</p>
          </div>

          <FileUpload
            label="ID Proof"
            hint="Aadhaar, PAN, Voter ID or Passport"
            file={form.idProofFile}
            onFileChange={(f) => setField("idProofFile", f)}
            error={errors.idProofFile}
          />
          <FileUpload
            label="Business Address Proof"
            hint="Utility bill, rent agreement or GST certificate"
            file={form.businessAddressProofFile}
            onFileChange={(f) => setField("businessAddressProofFile", f)}
            error={errors.businessAddressProofFile}
          />

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-black text-sm
                flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
                text-[#0F172A] font-black py-3.5 rounded-xl text-sm uppercase tracking-wider
                disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Submit & Send OTP"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompleteDetailsForm;
