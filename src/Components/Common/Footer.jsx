import React from 'react';
// Importing specific SVGs as components for the social links
// import { ReactComponent as FacebookIcon } from "../../assets/facebook.svg";

// import { ReactComponent as InstagramIcon } from "../../assets/instagram.svg";
// import { ReactComponent as YouTubeIcon } from "../../assets/youtube.svg";
// import { ReactComponent as TelegramIcon } from "../../assets/telegram.svg";
import logo from "../../assets/logo2.svg";
import { Link } from 'react-router-dom';
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

const WhatsappIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="#25D366"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.12l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.22-4.33c.01-4.54 3.7-8.23 8.24-8.23zM8.68 7.74c-.18 0-.46.07-.7.31-.24.24-.92.9-.92 2.19 0 1.29.94 2.54 1.07 2.72.13.18 1.84 2.82 4.46 3.95 2.62 1.13 2.62.75 3.09.71.47-.04 1.52-.62 1.73-1.22.21-.6.21-1.12.15-1.23-.06-.11-.24-.18-.5-.31-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.59.13-.18.26-.69.83-.85 1-.16.17-.31.19-.58.07-.27-.13-1.13-.42-2.15-1.33-.79-.71-1.33-1.58-1.48-1.85-.16-.27-.02-.42.12-.56.13-.13.27-.35.41-.53.14-.18.18-.31.27-.52.09-.21.05-.39-.02-.54-.07-.15-.59-1.43-.81-1.96-.21-.53-.43-.46-.59-.47-.15 0-.33-.01-.51-.01z" />
  </svg>
);


const GoogleIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.3 0 6.3 1.2 8.6 3.3l6.4-6.4C34.5 3.1 29.5 1 24 1 14.8 1 7 6.9 3.5 14.8l7.5 5.8C12.8 13.9 17.9 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M45.5 24c0-1.5-.1-2.9-.4-4.2H24v8.2h12.2c-.6 3.1-2.4 5.7-5.1 7.4l6.4 5c3.8-3.5 6-8.7 6-16.4z"
    />
    <path
      fill="#FBBC05"
      d="M10.9 28.5c-.9-2.5-.9-5.2 0-7.7l-7.5-5.8C.7 18.8 0 21.3 0 24s.7 5.2 3.4 8.2l7.5-5.8z"
    />
    <path
      fill="#34A853"
      d="M24 43.5c5.5 0 10.5-1.9 14.4-5.1l-6.4-5c-2.1 1.4-4.8 2.2-8 2.2-6.1 0-11.2-4.4-12.9-10.3l-7.5 5.8C7.1 40.7 14.8 43.5 24 43.5z"
    />
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
    className="w-5 h-5"
  >
    <defs>
      <linearGradient id="youtubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4E50" />
        <stop offset="100%" stopColor="#FF0000" />
      </linearGradient>
    </defs>

    <path
      fill="url(#youtubeGradient)"
      d="M21.8 8.001a3.003 3.003 0 00-2.114-2.122C17.874 5.5 12 5.5 12 5.5s-5.874 0-7.686.379A3.003 3.003 0 002.2 8.001C1.821 9.815 1.821 12 1.821 12s0 2.185.379 3.999a3.003 3.003 0 002.114 2.122C6.126 18.5 12 18.5 12 18.5s5.874 0 7.686-.379a3.003 3.003 0 002.114-2.122c.379-1.814.379-3.999.379-3.999s0-2.185-.379-3.999z"
    />

    <path
      fill="white"
      d="M10 15.2V8.8L15.5 12L10 15.2Z"
    />
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
    title: "Quick links",
    items: [
      { label: "Smart Life Gadgets", path: "/category/smart-life-gadgets" },
      { label: "Home & Kitchen", path: "/category/home-and-kitchen" },
      { label: "Fashion World", path: "/category/fashion-world" },
      { label: "Sports & Fitness", path: "/category/sports-and-fitness" },
      { label: "Tours & Travels", path: "/category/tours-and-travels" },
      { label: "Stationary", path: "/category/stationary" },
    ]
  },
  {
    title: "Quick links",
    items: [
      { label: "Baby Items", path: "/category/baby-items" },
      { label: "Car Accessories", path: "/category/car-accessories" },
      { label: "Cleaning & Housekeeping Supplies", path: "/Cleaning-&Housekeeping-Supplies" },
      { label: "Gifts", path: "/category/gifts" },
      { label: "Mix Items Daily Use", path: "/category/mix-items-daily-use" },
    ]
  },
     {
      title: "Important Links",
      items: [
        { label: "About Us", path: "/wholesale/about" },
        { label: "Contact Us", path: "/contact" },
        { label: "Influencer Form", path: "/wholesale/influencer" },
        { label: "Customer Care", path: "/wholesale/customer-care" },
        { label: "Influencer Form", path: "/influencer-form" },
      ]
    },
  {
  title: "Policies",
  items: [
    { label: "Return & Refund", path: "/policies/return-refund" },
    { label: "Order Cancellation Policy", path: "/policies/order-cancellation" },
    { label: "Privacy Policy", path: "/policies/privacy-policy" },
    { label: "Shipping Policy", path: "/policies/shipping-policy" },
    { label: "Terms & Conditions", path: "/policies/terms-conditions" }
  ]
}
];

const socialLinks = [
  // {
  //   Icon: FacebookIcon,
  //   label: "Facebook",
  //   path: "https://www.facebook.com/share/1Eej9auTBB/",
  // },
  // {
  //   Icon: InstagramIcon,
  //   label: "Instagram",
  //   path: "https://www.instagram.com/offer_wale_baba?igsh=Mjd6aG84bXV5dmRn",
  // },
  // {
  //   Icon: TelegramIcon,
  //   label: "Telegram",
  //   path: "https://t.me/OfferWaleBabaRetail",
  // },
  {
    Icon: WhatsappIcon,
    label: "WhatsApp",
    path: "https://wa.me/message/72BTQZMTQU2AG1",
  },
  // {
  //   Icon: YouTubeIcon,
  //   label: "YouTube",
  //   path: "https://youtube.com/",
  
  // },
  {
    Icon: GoogleIcon,
    label: "Google",
    path: "https://www.google.com/search?q=OfferWalebaba&sca_esv=4b44ad3c28024ed6&hl=en&authuser=0&sxsrf=ANbL-n7F8QrkIRWs7OoYaHNpBbJfnWVAQw%3A1778495114956&ei=iq4BatKMOpyo4-EPiebSWA&biw=1920&bih=953&ved=0ahUKEwjS-b7MgrGUAxUc1DgGHQmzFAsQ4dUDCBE&uact=5&oq=OfferWalebaba&gs_lp=Egxnd3Mtd2l6LXNlcnAiDU9mZmVyV2FsZWJhYmEyBBAjGCcyBxAAGIAEGA0yBRAAGO8FMgUQABjvBTIFEAAY7wVI9CdQow9YmyVwAXgAkAEAmAGXAaAB-QyqAQQwLjEzuAEDyAEA-AEBmAIOoALODcICChAAGIAEGA0YsAPCAggQABjvBRiwA8ICChAjGIAEGIoFGCfCAgsQABiABBiKBRiRAsICCBAAGIAEGLEDwgILEAAYgAQYsQMYgwHCAgUQLhiABMICBRAAGIAEwgIOEAAYgAQYigUYkQIYsQPCAhEQLhiABBiKBRiRAhjHARivAcICBhAAGB4YDcICCBAAGIAEGKIEwgIIEAAYiQUYogSYAwCIBgGQBgSSBwQxLjEzoAfyWrIHBDAuMTO4B8cNwgcIMC4yLjExLjHIB0OACAE&sclient=gws-wiz-serp",
  },
];
const currentYear = new Date().getFullYear();
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

          <div className="
  flex flex-col xl:flex-row
  justify-between
  gap-14 xl:gap-20
  mb-16
  items-start
">
            {/* Branding Column (Logo + Tagline + Socials) */}
            <div className="
  flex flex-col
  space-y-6
  w-full
  xl:max-w-[420px]
  shrink-0
">              <div className="flex flex-col gap-2">
                <div className="flex-shrink-0 flex items-center cursor-pointer min-w-[180px] lg:min-w-[240px]">
                  <img
                    src={logo}
                    alt="Offer Wale Baba"
                    onClick={() => (window.location.href = "/")}
                    className="h-16 lg:h-20 w-auto object-contain transition-all duration-500"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">
                  Wholesale. Sourcing. Fulfillment.
                </p>
              </div>

              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                India's leading B2B sourcing platform. Source, list & ship from 10k+ bulk lots. We help retailers maximize margins with GST-compliant inventory.
              </p>

              {/* Direct SVG Social Icons - Clean and Minimal */}
              <div className="flex flex-wrap items-center gap-4 pt-4">

                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="
        transition-all duration-300
        hover:scale-125
        hover:-translate-y-1
      "
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                      {social.Icon}
                    </div>
                  </a>
                ))}

              </div>
              {/* Contact Info */}
            {/* Contact Info */}
<div className="
  pt-7
  flex
  flex-row
  flex-wrap
  gap-4
  w-full
">

  {/* Phone */}
  <div className="
    flex-1 min-w-[260px]
    flex items-center gap-4
    p-4
    rounded-2xl
    border border-slate-100
    bg-[#FAFAFA]
    hover:border-green-200
    transition-all duration-300
  ">
    <div className="
      w-11 h-11
      rounded-2xl
      bg-green-50
      flex items-center justify-center
      shrink-0
    ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-green-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a1.125 1.125 0 01-1.21.38 12.035 12.035 0 01-7.143-7.143 1.125 1.125 0 01.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.713 3.102A1.125 1.125 0 005.622 2.25H4.25A2.25 2.25 0 002 4.5v2.25z"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-[0.25em]
        text-slate-300
        mb-1
      ">
        Call Us
      </p>

      <a
        href="tel:+919370686008"
        className="
          text-[#0F172A]
          text-sm sm:text-base
          font-black
          hover:text-green-600
          transition-colors
        "
      >
        +91 93706 86008
      </a>
    </div>
  </div>

  {/* Location */}
  <Link to="https://www.google.com/search?q=OfferWalebaba&sca_esv=4b44ad3c28024ed6&hl=en&authuser=0&sxsrf=ANbL-n7F8QrkIRWs7OoYaHNpBbJfnWVAQw%3A1778495114956&ei=iq4BatKMOpyo4-EPiebSWA&biw=1920&bih=953&ved=0ahUKEwjS-b7MgrGUAxUc1DgGHQmzFAsQ4dUDCBE&uact=5&oq=OfferWalebaba&gs_lp=Egxnd3Mtd2l6LXNlcnAiDU9mZmVyV2FsZWJhYmEyBBAjGCcyBxAAGIAEGA0yBRAAGO8FMgUQABjvBTIFEAAY7wVI9CdQow9YmyVwAXgAkAEAmAGXAaAB-QyqAQQwLjEzuAEDyAEA-AEBmAIOoALODcICChAAGIAEGA0YsAPCAggQABjvBRiwA8ICChAjGIAEGIoFGCfCAgsQABiABBiKBRiRAsICCBAAGIAEGLEDwgILEAAYgAQYsQMYgwHCAgUQLhiABMICBRAAGIAEwgIOEAAYgAQYigUYkQIYsQPCAhEQLhiABBiKBRiRAhjHARivAcICBhAAGB4YDcICCBAAGIAEGKIEwgIIEAAYiQUYogSYAwCIBgGQBgSSBwQxLjEzoAfyWrIHBDAuMTO4B8cNwgcIMC4yLjExLjHIB0OACAE&sclient=gws-wiz-serp" className="
    flex-1 min-w-[260px]
    flex items-start gap-4
    p-4
    rounded-2xl
    border border-slate-100
    bg-[#FAFAFA]
    hover:border-orange-200
    transition-all duration-300
  ">
    <div className="
      w-11 h-11
      rounded-2xl
      bg-orange-50
      flex items-center justify-center
      shrink-0
    ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-orange-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-[0.25em]
        text-slate-300
        mb-1
      ">
        Location
      </p>

      <p className="
        text-sm
        text-slate-500
        leading-6
        font-medium
      ">
        Sambhaji Chowk, Babasai Nagar,
        Ulhasnagar, Mumbai - 421004 Maharashtra, India
      </p>
    </div>
  </Link>

  {/* Working Hours */}
  <div className="
    flex-1 min-w-[260px]
    flex items-center gap-4
    p-4
    rounded-2xl
    border border-slate-100
    bg-[#FAFAFA]
    hover:border-blue-200
    transition-all duration-300
  ">
    <div className="
      w-11 h-11
      rounded-2xl
      bg-blue-50
      flex items-center justify-center
      shrink-0
    ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-blue-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-[0.25em]
        text-slate-300
        mb-1
      ">
        Working Hours
      </p>

      <p className="
        text-sm
        text-slate-500
        font-medium
        leading-6
      ">
        Tuesday – Sunday · 1 PM – 11 PM
      </p>
    </div>
  </div>

</div>
            </div>

            {/* Structured B2B Links Grid */}
            <div className="
  grid
  grid-cols-2
  md:grid-cols-3
  gap-x-10
  gap-y-12
  w-full
  xl:flex-1
  pt-6 xl:pt-0
">              {footerLinks.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-[#0F172A] text-sm font-extrabold uppercase tracking-widest leading-none">
                  {section.title}  {/* Changed from category to title */}
                </h4>
                <ul className="space-y-3.5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.path}
                        className="text-slate-400 text-sm font-medium hover:text-amber-600 transition-colors duration-300  tracking-tighter"
                      >
                        {item.label}  {/* Changed from item to item.label */}
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] text-center md:text-left">
              © {currentYear} Design and Developed by <span className='underline'>Offer Wale Baba</span>
            </p>

            {/* Fine Print Links */}
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="/contact" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Contact Us</a>
              <a href="#" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Sitemap</a>
              {/* <a href="#" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">MSME Verified Portal</a> */}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;