import React, { useState } from "react";
import { MapPin, Building2, Truck, ArrowRight, ArrowLeft, Store } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  nextStep,
  prevStep,
  updateFormData,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";

const validate = (data) => {
  const errors = {};
  // if (!data.permanentAddress.trim()) errors.permanentAddress = "Permanent address is required";
  // if (!data.businessAddress.trim())  errors.businessAddress  = "Business address is required";
  // if (!data.deliveryAddress.trim())  errors.deliveryAddress  = "Delivery address is required";
  return errors;
};

const TextAreaField = ({ label, icon: Icon, error, required, hint, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
      <Icon size={13} className="text-slate-400" />
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

const Step2_AddressInfo = ({ formData }) => {
  const dispatch            = useDispatch();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    dispatch(updateFormData({ [field]: e.target.value }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      setTouched({ permanentAddress: true, businessAddress: true, deliveryAddress: true });
      return;
    }
    dispatch(nextStep());
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-[#0F172A]">Address Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">We need your location details</p>
      </div>

      <TextAreaField
        label="Permanent Address"
        icon={MapPin}
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
          onClick={() => dispatch(updateFormData({ haveShop: !formData.haveShop }))}
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
        label="Business Address"
        icon={Building2}
        hint={formData.haveShop ? "Your shop address" : "Where you operate from"}
        placeholder="Your business operating address"
        value={formData.businessAddress}
        onChange={handleChange("businessAddress")}
        onBlur={handleBlur("businessAddress")}
        error={errors.businessAddress}
      />

      <TextAreaField
        label="Delivery Address"
        icon={Truck}
        hint="Where should we deliver your wholesale orders?"
        placeholder="Delivery / warehouse address"
        value={formData.deliveryAddress}
        onChange={handleChange("deliveryAddress")}
        onBlur={handleBlur("deliveryAddress")}
        error={errors.deliveryAddress}
      />

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => dispatch(prevStep())}
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

export default Step2_AddressInfo;