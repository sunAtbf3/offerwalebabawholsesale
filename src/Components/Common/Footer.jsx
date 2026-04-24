import React from 'react';
// Importing specific SVGs as components for the social links
// import { ReactComponent as FacebookIcon } from "../../assets/facebook.svg";

// import { ReactComponent as InstagramIcon } from "../../assets/instagram.svg";
// import { ReactComponent as YouTubeIcon } from "../../assets/youtube.svg";
// import { ReactComponent as TelegramIcon } from "../../assets/telegram.svg";

const FacebookIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.892h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
  </svg>
)
const InstagramIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0120 7.75v8.5A3.75 3.75 0 0116.25 20h-8.5A3.75 3.75 0 014 16.25v-8.5A3.75 3.75 0 017.75 4zm4.25 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.75-.88a1.13 1.13 0 100 2.26 1.13 1.13 0 000-2.26z" />
  </svg>
);

const YouTubeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M21.8 8.001a3.003 3.003 0 00-2.114-2.122C17.874 5.5 12 5.5 12 5.5s-5.874 0-7.686.379A3.003 3.003 0 002.2 8.001C1.821 9.815 1.821 12 1.821 12s0 2.185.379 3.999a3.003 3.003 0 002.114 2.122C6.126 18.5 12 18.5 12 18.5s5.874 0 7.686-.379a3.003 3.003 0 002.114-2.122c.379-1.814.379-3.999.379-3.999s0-2.185-.379-3.999zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);
const TelegramIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M9.036 15.472l-.376 3.334c.539 0 .773-.232 1.053-.51l2.526-2.42 5.232 3.83c.96.53 1.64.25 1.89-.89l3.43-16.08c.31-1.43-.52-1.99-1.45-1.65L1.66 9.18c-1.39.54-1.37 1.32-.24 1.66l5.57 1.74 12.93-8.16c.61-.39 1.17-.17.71.22" />
  </svg>
);
// Streamlined B2B link data
const footerLinks = [
  {
    category: "Wholesale Panel",
    items: ["Wholesale Signup", "Bulk Pricing catalogue", "MOQ Calculator", "Tax & Invoicing", "Fast Dispatch"]
  },
  {
    category: "Dropshipping B2B",
    items: ["Source Products", "Shopify Integration", "Zero Inventory Model", "Automated Orders", "Dropshipping Support"]
  },
  {
    category: "Legal & Trust",
    items: ["GST Certification Policy", "MSME Verified Policy", "Terms of Service", "Privacy Policy", "Vendor Agreement"]
  }
];

const socialLinks = [
  { Icon: FacebookIcon, label: 'Facebook', path: '#' },
  { Icon: InstagramIcon, label: 'Instagram', path: '#' },
  { Icon: YouTubeIcon, label: 'YouTube', path: '#' },
  { Icon: TelegramIcon, label: 'Telegram', path: '#' },
];

const Footer = () => {
  return (
    // Outer Container (The light background where the watermark sits)
    <footer className="relative bg-[#F8FAFC] py-16 md:py-24 md:pb-52 overflow-hidden border-t border-slate-100 font-sans mt-20">

      {/* 1. HUGE BACKGROUND WATERMARK (Inspired by image_e8d89e) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none w-full text-center">
        <h2 className="text-[12vw] font-black text-[#0F172A]/[0.09] uppercase leading-none tracking-tighter whitespace-nowrap">
          OFFERWALE BABA
        </h2>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10">

        {/* 2. MAIN WHITE FLOATING PANEL (The minimal design center) */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-20 shadow-xl shadow-slate-100 border border-slate-100">

          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16 items-start">

            {/* Branding Column (Logo + Tagline + Socials) */}
            <div className="flex flex-col space-y-6 max-w-sm">
              <div className="flex flex-col gap-2">
                <span className="text-xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">
                  OfferWale<span className="text-amber-500">Baba</span>
                </span>
                <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">
                  Wholesale. Sourcing. Fulfillment.
                </p>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                India's leading B2B sourcing platform. Source, list & ship from 10k+ bulk lots. We help retailers maximize margins with GST-compliant inventory.
              </p>

              {/* Direct SVG Social Icons - Clean and Minimal */}
              <div className="flex gap-5 pt-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.path}
                    className="text-slate-400 hover:text-[#0F172A] transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.Icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Structured B2B Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-16 w-full lg:w-auto shrink-0">
              {footerLinks.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <h4 className="text-[#0F172A] text-sm font-extrabold uppercase tracking-widest leading-none">
                    {section.category}
                  </h4>
                  <ul className="space-y-3.5">
                    {section.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-slate-400 text-sm font-medium hover:text-amber-600 transition-colors duration-300 uppercase tracking-tighter"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 3. THIN BOTTOM STRIP */}
          <div className="border-t border-slate-100 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 OfferWale Baba International Pvt. Ltd. · All wholesale Rights Reserved.
            </p>

            {/* Fine Print Links */}
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Contact Us</a>
              <a href="#" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Brand Sitemap</a>
              <a href="#" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">MSME Verified Portal</a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

// import React from 'react';
// import { MapPin, Phone, Mail, Shield } from 'lucide-react';
// import LOGO from "../../assets/logo2.png";

// const footerLinks = {
//   wholesale: ['Wholesale Login', 'Bulk Order Form', 'MOQ Catalogue', 'Download Price List', 'GST Invoicing'],
//   dropshipping: ['What is Dropshipping', 'Brand Dropshipping', 'Shopify Integration', 'B2B Drop Shipping', 'Automated Fulfillment'],
//   legal: ['Privacy Policy', 'Terms of Service', 'Shipping Policy', 'Refund Policy', 'Cookie Policy'],
//   support: ['Contact Us', 'Track Shipment', 'Tax & Invoicing', 'Partner Support', 'Business FAQ'],
// };

// const facebook = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="w-5 h-5"
//   >
//     <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.892h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
//   </svg>
// )
// const Instagram = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="w-5 h-5"
//   >
//     <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0120 7.75v8.5A3.75 3.75 0 0116.25 20h-8.5A3.75 3.75 0 014 16.25v-8.5A3.75 3.75 0 017.75 4zm4.25 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.75-.88a1.13 1.13 0 100 2.26 1.13 1.13 0 000-2.26z" />
//   </svg>
// );

// const YouTube = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="w-5 h-5"
//   >
//     <path d="M21.8 8.001a3.003 3.003 0 00-2.114-2.122C17.874 5.5 12 5.5 12 5.5s-5.874 0-7.686.379A3.003 3.003 0 002.2 8.001C1.821 9.815 1.821 12 1.821 12s0 2.185.379 3.999a3.003 3.003 0 002.114 2.122C6.126 18.5 12 18.5 12 18.5s5.874 0 7.686-.379a3.003 3.003 0 002.114-2.122c.379-1.814.379-3.999.379-3.999s0-2.185-.379-3.999zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
//   </svg>
// );
// const Telegram = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="w-5 h-5"
//   >
//     <path d="M9.036 15.472l-.376 3.334c.539 0 .773-.232 1.053-.51l2.526-2.42 5.232 3.83c.96.53 1.64.25 1.89-.89l3.43-16.08c.31-1.43-.52-1.99-1.45-1.65L1.66 9.18c-1.39.54-1.37 1.32-.24 1.66l5.57 1.74 12.93-8.16c.61-.39 1.17-.17.71.22" />
//   </svg>
// );
// const Footer = () => {
//   return (
//     <footer className="relative bg-[#0F172A] pt-20 pb-10 overflow-hidden border-t border-slate-800">

//       {/* BACKGROUND TEXT (Inspired by the large "UFA DISTRO" in image_c1299f) */}
//       <div className="absolute top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none w-full text-center">
//         <h2 className="text-[12vw] font-black text-white/[0.03] uppercase leading-none tracking-tighter whitespace-nowrap">
//           OFFERWALE BABA
//         </h2>
//       </div>

//       <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10">

//         {/* TOP SECTION: Branding & Newsletter */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">

//           {/* Logo & About */}
//           <div className="lg:col-span-4 space-y-6">
//             <div className="flex items-center gap-4">
//               <img src={LOGO} alt="OfferWale Baba" className="h-20 w-auto object-contain bg-white/5 p-2 rounded-2xl" />
//               <div className="flex flex-col">
//                 <span className="text-2xl font-black text-white tracking-tighter uppercase">OfferWale <span className="text-amber-500">Baba</span></span>
//                 <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">International B2B</span>
//               </div>
//             </div>
//             <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
//               India's leading B2B wholesale platform. We empower 1200+ retailers with premium inventory,
//               direct sourcing, and global logistics. Scale your business with GST-ready billing and
//               exclusive bulk pricing.
//             </p>
//             <div className="flex gap-4 pt-2">
//               {[
//                 { icon: { Instagram }, label: 'Instagram' },
//                 { icon: { facebook }, label: 'Facebook' },
//                 { icon: { YouTube }, label: 'YouTube' },
//                 { icon: { Telegram }, label: 'Telegram' }
//               ].map((social, idx) => (
//                 <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-xl">
//                   {social.icon}
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Links Grid */}
//           <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
//             <div>
//               <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">Wholesale</h4>
//               <ul className="space-y-4">
//                 {footerLinks.wholesale.map((link) => (
//                   <li key={link}><a href="#" className="text-slate-400 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-tight">{link}</a></li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">Drop-Ship</h4>
//               <ul className="space-y-4">
//                 {footerLinks.dropshipping.map((link) => (
//                   <li key={link}><a href="#" className="text-slate-400 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-tight">{link}</a></li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">Resources</h4>
//               <ul className="space-y-4">
//                 {footerLinks.support.map((link) => (
//                   <li key={link}><a href="#" className="text-slate-400 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-tight">{link}</a></li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">Legal</h4>
//               <ul className="space-y-4">
//                 {footerLinks.legal.map((link) => (
//                   <li key={link}><a href="#" className="text-slate-400 text-xs font-bold hover:text-amber-500 transition-colors uppercase tracking-tight">{link}</a></li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* MIDDLE SECTION: CONTACT STRIP */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-slate-800/50">
//           <div className="flex items-center gap-5 p-6 bg-slate-800/20 rounded-3xl group hover:bg-slate-800/40 transition-all">
//             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
//               <MapPin size={24} />
//             </div>
//             <div>
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Warehouse</p>
//               <p className="text-xs font-bold text-white leading-relaxed">Ulhasnagar, Maharashtra 421004, IN</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-5 p-6 bg-slate-800/20 rounded-3xl group hover:bg-slate-800/40 transition-all">
//             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
//               <Phone size={24} />
//             </div>
//             <div>
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bulk Support</p>
//               <p className="text-xs font-bold text-white">+91 99999 00000 (Mon—Sat)</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-5 p-6 bg-slate-800/20 rounded-3xl group hover:bg-slate-800/40 transition-all">
//             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
//               <Shield size={24} />
//             </div>
//             <div>
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Certification</p>
//               <p className="text-xs font-bold text-white uppercase tracking-tighter">GST & MSME Verified Business</p>
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM SECTION: COPYRIGHT */}
//         <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
//           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
//             © 2026 OfferWale Baba International Ltd. · Reg: Ulhasnagar Division
//           </p>
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-2">
//               <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
//               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Status: Optimal</span>
//             </div>
//             <div className="h-4 w-[1px] bg-slate-800" />
//             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">English (IN)</span>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// };

// export default Footer;