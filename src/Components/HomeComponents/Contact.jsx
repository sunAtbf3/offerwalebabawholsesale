import React, { useState } from "react";

// ── Floating particle background ─────────────────────────────────────────────
const Particles = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 3 + Math.random() * 5,
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

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, href }) => (
  <a
    href={href || "#"}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className="group flex items-start gap-3 py-2.5 border-b border-white/8 last:border-0 hover:pl-1 transition-all duration-200"
  >
    <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-400/25 transition-colors">
      <span className="text-amber-400 text-sm">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-gray-300 text-[13px] mt-0.5 group-hover:text-amber-300 transition-colors leading-snug">{value}</p>
    </div>
  </a>
);

// ── Stat Badge ────────────────────────────────────────────────────────────────
const StatBadge = ({ icon, value, label }) => (
  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-base">{icon}</div>
    <div>
      <div className="text-white font-bold text-sm leading-none">{value}</div>
      <div className="text-gray-400 text-[10px] mt-0.5">{label}</div>
    </div>
  </div>
);

// ── Field Label ───────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </p>
);

// ── Input ─────────────────────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full pl-9 pr-4 py-[11px] rounded-xl border-[1.5px] bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-200 font-sans
  ${err ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10"}`;

const Input = ({ icon, err, ...props }) => (
  <div className="relative flex items-center">
    {icon && <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">{icon}</span>}
    <input {...props} className={inputCls(err) + (!icon ? " pl-4" : "")} />
  </div>
);

const Textarea = ({ icon, err, ...props }) => (
  <div className="relative">
    {icon && <span className="absolute left-3 top-3 text-gray-400 text-sm pointer-events-none">{icon}</span>}
    <textarea
      {...props}
      className={
        `w-full py-[11px] pr-4 rounded-xl border-[1.5px] bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-200 resize-none font-sans leading-relaxed
        ${icon ? "pl-9" : "pl-4"}
        ${err ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10"}`
      }
    />
  </div>
);


// ── Upload Box ────────────────────────────────────────────────────────────────
const UploadBox = ({ label, subLabel, file, setFile, err }) => (
  <div className="field">
    <Label required>{label}</Label>
    <label
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-200 text-center
        ${file ? "border-amber-400 bg-amber-50" : err ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50"}`}
    >
      <span className={`text-2xl mb-1 ${file ? "opacity-100" : "opacity-40"}`}>📎</span>
      <span className={`text-[12px] font-semibold ${file ? "text-amber-600" : "text-gray-400"}`}>
        {file ? file.name : "Click to upload (PDF / JPG / PNG)"}
      </span>
      {subLabel && <span className="text-[10px] text-gray-400 mt-0.5">{subLabel}</span>}
      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files[0])} />
    </label>
  </div>
);

// ── Steps Header ──────────────────────────────────────────────────────────────
const Steps = ({ step }) => {
  const labels = ["Personal Info", "Address Info", "Business Info"];
  return (
    <div className="flex items-center mb-6">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-300
              ${step > s ? "bg-amber-400 text-white" : step === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400 border-[1.5px] border-gray-200"}`}
            >
              {step > s ? "✓" : s}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${step > s ? "text-amber-500" : step === s ? "text-gray-900" : "text-gray-400"}`}>
              {labels[i]}
            </span>
          </div>
          {i !== 2 && (
            <div className={`flex-1 h-[2px] mx-2 mb-3.5 transition-all duration-300 ${step > s + 1 || (step > s) ? "bg-amber-400" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const INIT = {
  fullName: "", email: "", mobile: "", whatsapp: "",
  permAddr: "", haveShop: false, shopAddr: "", deliveryAddr: "",
  sellingPlace: "", sellingCity: "", inquiryType: "", monthlyPurchase: "",
  idProof: null, bizProof: null,
};

export default function WholesalerPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INIT);
  const [err, setErr] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState(false);

  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); setErr((e) => ({ ...e, [k]: null })); };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!data.fullName.trim()) e.fullName = true;
      if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = true;
      if (!/^\d{10}$/.test(data.mobile)) e.mobile = true;
      if (!/^\d{10}$/.test(data.whatsapp)) e.whatsapp = true;
    }
    if (s === 2) {
      if (!data.permAddr.trim()) e.permAddr = true;
      if (!data.deliveryAddr.trim()) e.deliveryAddr = true;
      if (data.haveShop && !data.shopAddr.trim()) e.shopAddr = true;
    }
    if (s === 3) {
      if (!data.sellingPlace.trim()) e.sellingPlace = true;
      if (!data.sellingCity.trim()) e.sellingCity = true;
      if (!data.inquiryType) e.inquiryType = true;
      if (!data.monthlyPurchase) e.monthlyPurchase = true;
      if (!data.idProof) e.idProof = true;
      if (!data.bizProof) e.bizProof = true;
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!validate(3)) return;
    setLoading(true);
    setSubmitErr(false);
    try {
      const fd = new FormData();
      fd.append("name", data.fullName);
      fd.append("email", data.email);
      fd.append("mobile", data.mobile);
      fd.append("whatsapp", data.whatsapp);
      fd.append("permanent_address", data.permAddr);
      fd.append("have_shop", data.haveShop ? "Yes" : "No");
      if (data.haveShop) fd.append("shop_address", data.shopAddr);
      fd.append("delivery_address", data.deliveryAddr);
      fd.append("selling_place", data.sellingPlace);
      fd.append("selling_city", data.sellingCity);
      fd.append("inquiry_type", data.inquiryType);
      fd.append("monthly_purchase", data.monthlyPurchase);
      if (data.idProof) fd.append("id_proof", data.idProof);
      if (data.bizProof) fd.append("business_proof", data.bizProof);

      const res = await fetch("https://formspree.io/f/xlgavvnv", {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      if (res.ok) { setSubmitted(true); }
      else { setSubmitErr(true); }
    } catch { setSubmitErr(true); }
    finally { setLoading(false); }
  };

  const reset = () => { setData(INIT); setErr({}); setStep(1); setSubmitted(false); setSubmitErr(false); };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .font-sans { font-family: 'DM Sans', sans-serif !important; }
        .font-display { font-family: 'Syne', sans-serif !important; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            B2B Wholesale
          </div>
          <h1 className=" text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Become a <span className="text-amber-500">Wholesaler</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Join thousands of retailers across India. Fast approval, best prices, PAN India delivery.
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-5 items-start">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="flex flex-col gap-4">
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden p-7">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <Particles />
              <div className="relative z-10">
                <h2 className=" text-xl font-extrabold text-white">Offer Wale Baba</h2>
                <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mt-0.5 mb-5">Wholesale &amp; Retail — B2B</p>

                <div className="space-y-0.5">
                  <InfoRow icon="📞" label="Call Us"   value="+91 93706 86008"          href="tel:+919370686008" />
                  <InfoRow icon="✉️" label="Email"     value="offerwalebaba1@gmail.com"  href="mailto:offerwalebaba1@gmail.com" />
                  <InfoRow icon="🌐" label="Website"   value="offerwalebaba.com"          href="https://offerwalebaba.com" />
                  <InfoRow icon="📍" label="Address"   value="Sambhaji Chowk, Ulhasnagar, MH 421004" href="https://maps.google.com/?q=Ulhasnagar,Maharashtra" />
                  <InfoRow icon="🕐" label="Hours"     value="Tue–Sun, 1 PM – 11 PM" />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <StatBadge icon="📦" value="10,000+" label="Orders Delivered" />
                  <StatBadge icon="⭐" value="4.8★"    label="Avg. Rating" />
                </div>

                <a
                  href="https://wa.me/919370686008"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold text-[13px] py-3 rounded-2xl transition-all duration-200"
                >
                  💬 Chat on WhatsApp
                </a>
                <a
                  href="https://linktr.ee/offerwalebaba1"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 border border-white/10 text-gray-300 hover:text-white font-semibold text-[13px] py-2.5 rounded-2xl transition-all duration-200"
                >
                  All Links &amp; Catalogue →
                </a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[["✅","Verified Supplier"],["🚚","PAN India Delivery"],["💰","Best Price"]].map(([em, txt]) => (
                <div key={txt} className="bg-white border border-gray-200 rounded-2xl p-3 text-center hover:border-amber-300 hover:shadow-sm transition-all duration-200">
                  <div className="text-xl mb-1">{em}</div>
                  <p className="text-[10px] font-bold text-gray-600 leading-tight">{txt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 sm:p-8">

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">✅</div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm max-w-xs">Our team will review your details and contact you within 24–48 hours.</p>
                <button onClick={reset} className="mt-6 px-6 py-2.5 bg-gray-900 hover:bg-amber-500 text-white text-sm font-bold rounded-xl transition-colors">
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                <Steps step={step} />

                {/* ── STEP 1: Personal ── */}
                {step === 1 && (
                  <div>
                    <h2 className="font-display text-[18px] font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-400 text-[12px] mt-0.5 mb-5">Tell us who you are</p>

                    <div className="mb-3.5">
                      <Label required>Full Name</Label>
                      <Input icon="👤" placeholder="Your full name" value={data.fullName} err={err.fullName}
                        onChange={(e) => set("fullName", e.target.value)} />
                    </div>

                    <div className="mb-3.5">
                      <Label required>Email Address</Label>
                      <Input icon="✉️" type="email" placeholder="you@example.com" value={data.email} err={err.email}
                        onChange={(e) => set("email", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3.5">
                      <div>
                        <Label required>Mobile Number</Label>
                        <Input icon="📞" placeholder="10-digit number" value={data.mobile} err={err.mobile} maxLength={10}
                          onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} />
                      </div>
                      <div>
                        <Label required>WhatsApp Number</Label>
                        <Input icon="💬" placeholder="10-digit number" value={data.whatsapp} err={err.whatsapp} maxLength={10}
                          onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} />
                      </div>
                    </div>

                    <button onClick={next}
                      className="w-full mt-2 bg-gray-900 hover:bg-amber-500 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200">
                      Continue →
                    </button>
                  </div>
                )}

                {/* ── STEP 2: Address ── */}
                {step === 2 && (
                  <div>
                    <h2 className="font-display text-[18px] font-bold text-gray-900">Address Information</h2>
                    <p className="text-gray-400 text-[12px] mt-0.5 mb-5">We need your location details</p>

                    <div className="mb-3.5">
                      <Label required>Permanent Address</Label>
                      <Textarea icon="📍" rows={2} placeholder="Enter your permanent address" value={data.permAddr} err={err.permAddr}
                        onChange={(e) => set("permAddr", e.target.value)} />
                    </div>

                    {/* Shop Toggle */}
                    <div
                      onClick={() => set("haveShop", !data.haveShop)}
                      className={`flex items-center gap-3 border-[1.5px] rounded-xl p-3.5 cursor-pointer mb-3.5 transition-all duration-200
                        ${data.haveShop ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50 hover:border-amber-300"}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-base flex-shrink-0">🏪</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-gray-900">Do you have a shop?</div>
                        <div className="text-[11px] text-gray-400">Physical retail location</div>
                      </div>
                      {/* Toggle switch */}
                      <div className={`w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${data.haveShop ? "bg-amber-400" : "bg-gray-300"}`}>
                        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-300 ${data.haveShop ? "left-[22px]" : "left-[3px]"}`} />
                      </div>
                    </div>

                    {data.haveShop && (
                      <div className="mb-3.5">
                        <Label required>Business Address</Label>
                        <Textarea icon="🏪" rows={2} placeholder="Your shop / business address" value={data.shopAddr} err={err.shopAddr}
                          onChange={(e) => set("shopAddr", e.target.value)} />
                      </div>
                    )}

                    <div className="mb-4">
                      <Label required>Delivery Address</Label>
                      <Textarea icon="🚚" rows={2} placeholder="Where should we deliver your wholesale orders?" value={data.deliveryAddr} err={err.deliveryAddr}
                        onChange={(e) => set("deliveryAddr", e.target.value)} />
                    </div>

                    <div className="flex gap-2.5">
                      <button onClick={back} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] px-5 py-3 rounded-xl transition-colors">
                        ← Back
                      </button>
                      <button onClick={next} className="flex-1 bg-gray-900 hover:bg-amber-500 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200">
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Business ── */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display text-[18px] font-bold text-gray-900">Business Information</h2>
                    <p className="text-gray-400 text-[12px] mt-0.5 mb-5">Tell us about your business</p>

                    <div className="grid grid-cols-2 gap-3 mb-3.5">
                      <div>
                        <Label required>Selling Place From</Label>
                        <Input icon="🏠" placeholder="e.g. Home, Shop, Market" value={data.sellingPlace} err={err.sellingPlace}
                          onChange={(e) => set("sellingPlace", e.target.value)} />
                      </div>
                      <div>
                        <Label required>Selling Zone / City</Label>
                        <Input icon="📍" placeholder="e.g. Delhi, Mumbai" value={data.sellingCity} err={err.sellingCity}
                          onChange={(e) => set("sellingCity", e.target.value)} />
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <Label required>Type of Inquiry</Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-gray-400 text-sm pointer-events-none z-10">🔍</span>
                        <select
                          value={data.inquiryType}
                          onChange={(e) => set("inquiryType", e.target.value)}
                          className={inputCls(err.inquiryType) + " appearance-none cursor-pointer"}
                        >
                          <option value="">Select inquiry type...</option>
                          <option value="wholesale">Wholesale Order</option>
                          <option value="retail">Retail Order</option>
                          <option value="bulk">Bulk / Custom Order</option>
                          <option value="partnership">Business Partnership</option>
                          <option value="other">Other</option>
                        </select>
                        <span className="absolute right-3 text-gray-400 pointer-events-none">▾</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label required>Monthly Estimated Purchase (₹)</Label>
                      <Input icon="₹" placeholder="e.g. 50000" type="number" value={data.monthlyPurchase} err={err.monthlyPurchase}
                        onChange={(e) => set("monthlyPurchase", e.target.value)} />
                    </div>

                    {/* Doc banner */}
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-4">
                      <span className="text-blue-500 text-base">📄</span>
                      <div>
                        <p className="text-[12px] font-bold text-blue-700">Document Upload</p>
                        <p className="text-[10px] text-blue-500">Accepted: PDF, JPG, JPEG, PNG, WEBP — max 10MB each</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <UploadBox
                        label="ID Proof"
                        subLabel="Aadhaar, PAN, Voter ID or Passport"
                        file={data.idProof}
                        err={err.idProof}
                        setFile={(f) => set("idProof", f)}
                      />
                      <UploadBox
                        label="Business Address Proof"
                        subLabel="Utility bill, rent agreement or GST certificate"
                        file={data.bizProof}
                        err={err.bizProof}
                        setFile={(f) => set("bizProof", f)}
                      />
                    </div>

                    {submitErr && (
                      <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[12px] px-4 py-3 rounded-xl mb-3">
                        ⚠️ Failed to submit. Please try again or WhatsApp us directly.
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <button onClick={back} disabled={loading} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] px-5 py-3 rounded-xl transition-colors disabled:opacity-50">
                        ← Back
                      </button>
                      <button onClick={submit} disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200">
                        {loading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Submitting...</>
                        ) : "✓ Submit Application"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}