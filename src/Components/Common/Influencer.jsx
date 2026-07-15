import React, { useEffect, useState } from "react";
import {toast} from "react-toastify";
import { CheckCircle2, X, Send, Star } from "lucide-react";

export default function InfluencerFormPage() {
  const [status, setStatus] = useState("idle");
  const [captcha, setCaptcha] = useState({ q: "", ans: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const niches = [
    "Tech", "Fashion", "Beauty", "Fitness", "Lifestyle",
    "Gaming", "Food", "Travel", "Comedy", "Education", "Other",
  ];

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${a} + ${b} = ?`, ans: a + b });
    setUserAnswer("");
    setIsVerified(false);
  };

  const handleCaptchaChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);
    setIsVerified(parseInt(value) === captcha.ans);
  };

  useEffect(() => {
    generateCaptcha();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error("Please solve verification first");
      return;
    }

    setStatus("loading");
    const form = e.target;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setUserAnswer("");
        setIsVerified(false);
        generateCaptcha();
        setStatus("idle");
        setShowSuccess(true); // 👈 show popup
      } else {
        toast.error("Failed to submit form");
        setStatus("error");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">

      {/* ── SUCCESS POPUP ─────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-[popIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">

            {/* Top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-amber-500" />

            {/* Close button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            <div className="px-8 py-10 text-center">

              {/* Icon */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-30" />
                <div className="relative w-20 h-20 bg-amber-50 border-4 border-amber-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-amber-500" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">
                Request Submitted! 🎉
              </h2>

              <p className="text-slate-500 text-sm leading-relaxed mb-2">
                Thank you for reaching out to{" "}
                <span className="font-bold text-amber-500">Offer Wale Baba</span>.
                Your collaboration request has been received.
              </p>

              <p className="text-slate-400 text-xs mb-8">
                Our team will get back to you within <strong className="text-slate-600">24 hours</strong>.
              </p>

              {/* Info pill */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 text-left">
                <Send size={16} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Check your email / phone for a confirmation. Keep your profile link handy for our team.
                </p>
              </div>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full h-13 py-4 bg-[#0F172A] hover:bg-amber-500 text-white font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 text-sm"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#478B8D]/15 text-[#478B8D] text-xs font-black uppercase tracking-[0.2em] mb-5">
            Influencer Collaboration
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Work With <span className="text-[#478B8D]">Offer Wale Baba</span>
          </h1>

          <p className="mt-4 text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join hands with India's growing wholesale & ecommerce brand.
            Let's create impactful content together.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">

          {/* Top */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-6 sm:px-10 py-8">
            <h2 className="text-white text-2xl font-black tracking-tight">
              Influencer Partner Form
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              We usually respond within 24 hours.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">

            <input type="hidden" name="access_key" value="0403211c-ab2e-4654-87ec-b8ad05866eea" />
            <input type="hidden" name="subject" value="New Influencer Collaboration Request" />
            <input type="hidden" name="captcha" value="false" />

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
              <input
                type="text" name="fullname" required
                placeholder="Enter your full name"
                className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email / Phone *</label>
              <input
                type="text" name="contact" required
                placeholder="Enter email or phone number"
                className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
              />
            </div>

            {/* Social Link */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Instagram / YouTube Link *</label>
              <input
                type="url" name="sociallink" required
                placeholder="Paste your profile link"
                className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
              />
            </div>

            {/* Followers + Niche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Followers Count *</label>
                <input
                  type="number" name="followers" required
                  placeholder="e.g. 25000"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Niche / Category *</label>
                <select
                  name="niche" required
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
                >
                  <option value="">Select niche</option>
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Short Message *</label>
              <textarea
                rows={5} required name="message"
                placeholder="Tell us about your audience and collaboration idea..."
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 resize-none"
              />
            </div>

            {/* Verification */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Verification</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                  {captcha.q}
                </div>
                <input
                  type="number" placeholder="Answer"
                  value={userAnswer} onChange={handleCaptchaChange}
                  className="w-full sm:max-w-[140px] h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              {!isVerified && userAnswer && (
                <p className="text-red-500 text-xs mt-2">Incorrect answer</p>
              )}
              <button
                type="button" onClick={generateCaptcha}
                className="text-xs text-[#478B8D] hover:underline mt-2"
              >
                Change Question
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`
                w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em]
                transition-all duration-300
                ${isVerified
                  ? "bg-[#0F172A] hover:bg-amber-500 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"}
              `}
            >
              {status === "loading"
                ? "Submitting..."
                : isVerified
                ? "Submit Collaboration Request"
                : "Solve Verification First"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}