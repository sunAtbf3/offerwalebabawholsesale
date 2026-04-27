import React from "react";
import {
  Mail, Phone, Globe, MessageCircle, MapPin, Clock,
  ArrowRight, Package, Star, Send, CheckCircle2, AlertCircle
} from "lucide-react";

import { useSelector } from "react-redux";

import StepIndicator from "../LOGIN_REGISTER_SEGMENT/FORM_STEPS/StepIndicator";
import Step1_PersonalInfo from "../LOGIN_REGISTER_SEGMENT/FORM_STEPS/Step1_PersonalInfo";
import Step2_AddressInfo from "../LOGIN_REGISTER_SEGMENT/FORM_STEPS/Step2_AddressInfo";
import Step3_BusinessInfo from "../LOGIN_REGISTER_SEGMENT/FORM_STEPS/Step3_BusinessInfo";

import {
  selectCurrentStep,
  selectFormData,
  selectRegistrationSuccess
} from "../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";


// ── Floating particles (UNCHANGED) ───────────────────────────────────────────
const Particles = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    dur: 4 + Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-amber-400/20 animate-ping"
          style={{
            width: d.size,
            height: d.size,
            left: `${d.x}%`,
            top: `${d.y}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
};

// ── Stat badge (UNCHANGED) ───────────────────────────────────────────────────
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

// ── Info row (UNCHANGED) ─────────────────────────────────────────────────────
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
      <p className="text-[12px] text-gray-500 uppercase tracking-widest font-semibold">
        {label}
      </p>
      <p className="text-gray-200 group-hover:text-amber-300">
        {value}
      </p>
    </div>

    <ArrowRight size={13} className="ml-auto mt-2 text-gray-600 group-hover:text-amber-400" />
  </a>
);


// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ContactUs() {

  const currentStep = useSelector(selectCurrentStep);
  const formData = useSelector(selectFormData);
  const success = useSelector(selectRegistrationSuccess);
  const handleFinalSubmit = async () => {
  try {
    const fd = new FormData();

    // personal
    fd.append("fullName", formData.fullName);
    fd.append("email", formData.email);
    fd.append("mobileNumber", formData.mobileNumber);
    fd.append("whatsappNumber", formData.whatsappNumber);

    // address
    fd.append("permanentAddress", formData.permanentAddress);
    fd.append("businessAddress", formData.businessAddress);
    fd.append("deliveryAddress", formData.deliveryAddress);

    // business
    fd.append("haveShop", String(formData.haveShop));
    fd.append("sellingPlaceFrom", formData.sellingPlaceFrom);
    fd.append("sellingZoneCity", formData.sellingZoneCity);
    fd.append("productCategory", formData.productCategory);
    fd.append("monthlyEstimatedPurchase", formData.monthlyEstimatedPurchase);

    // files
    fd.append("idProof", formData.idProofFile);
    fd.append("businessAddressProof", formData.businessAddressProofFile);

    const res = await fetch("https://formspree.io/f/xlgavvnv", {
      method: "POST",
      body: fd,
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      alert("Form submitted successfully!");
    } else {
      alert("Submission failed, try again.");
    }

  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── HEADER (UNCHANGED DESIGN) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

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

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL (UNCHANGED) ── */}
          <div className="lg:col-span-2 space-y-5">

            <div className="relative bg-gray-900 rounded-3xl p-7 overflow-hidden">
              <Particles />

              <h2 className="text-2xl font-bold text-white">Offer Wale Baba</h2>
              <p className="text-amber-400 text-xs mb-5">Wholesale & Retail</p>

              <InfoRow icon={Phone} label="Call" value="+91 93706 86008" href="tel:+919370686008" />
              <InfoRow icon={Mail} label="Email" value="offerwalebaba1@gmail.com" href="mailto:offerwalebaba1@gmail.com" />
              <InfoRow icon={Globe} label="Website" value="offerwalebaba.com" href="https://offerwalebaba.com/" />
              <InfoRow icon={MapPin} label="Address" value="Ulhasnagar, MH" href="https://maps.google.com" />
              <InfoRow icon={Clock} label="Hours" value="Tue–Sun, 1 PM – 11 PM" />

              <div className="grid grid-cols-2 gap-2 mt-5">
                <StatBadge icon={Package} value="10K+" label="Orders" />
                <StatBadge icon={Star} value="4.8★" label="Rating" />
              </div>

              <a
                href="https://wa.me/919370686008"
                className="mt-5 block text-center bg-green-500 text-white py-3 rounded-xl font-bold"
              >
                WhatsApp Us
              </a>
            </div>

          </div>

          {/* ── RIGHT PANEL (REPLACED WITH REGISTER FLOW) ── */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-3xl p-7 sm:p-9">

            {success ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Application Submitted!</h2>
                <p className="text-gray-500 text-sm mt-2">
                  We will contact you soon.
                </p>
              </div>
            ) : (
              <>
                <StepIndicator currentStep={currentStep} />

                <div className="mt-6 space-y-5">
                  {currentStep === 1 && (
                    <Step1_PersonalInfo formData={formData} />
                  )}

                  {currentStep === 2 && (
                    <Step2_AddressInfo formData={formData} />
                  )}

                  {currentStep === 3 && (
                    <Step3_BusinessInfo formData={formData} />
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}