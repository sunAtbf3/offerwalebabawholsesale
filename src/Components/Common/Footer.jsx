import React from 'react';

const footerLinks = [
  {
    category: "Wholesale Panel",
    items: [
      { label: "Wholesale Signup", href: "/wholesale-signup" },
      { label: "Bulk Pricing Catalogue", href: "/bulk-pricing" },
      { label: "MOQ Calculator", href: "/moq-calculator" },
      { label: "Tax & Invoicing", href: "/tax-invoicing" },
      { label: "Fast Dispatch", href: "/fast-dispatch" },
    ]
  },
  {
    category: "Dropshipping B2B",
    items: [
      { label: "Source Products", href: "/source-products" },
      { label: "Shopify Integration", href: "/shopify-integration" },
      { label: "Zero Inventory Model", href: "/zero-inventory" },
      { label: "Automated Orders", href: "/automated-orders" },
      { label: "Dropshipping Support", href: "/dropshipping-support" },
    ]
  },
  {
    category: "Legal & Trust",
    items: [
      { label: "GST Certification Policy", href: "/gst-policy" },
      { label: "MSME Verified Policy", href: "/msme-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Vendor Agreement", href: "/vendor-agreement" },
    ]
  }
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1Eej9auTBB",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    )
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/offer_wale_baba?igsh=Mjd6aG84bXV5dmRn",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    )
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@offerwalebabaa?si=dyfMK956fnjZhZ1O",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
      </svg>
    )
  },
  {
    label: "Telegram",
    href: "https://t.me/OfferWaleBabaRetail",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 6.75a2.25 2.25 0 0 0 .126 4.233l3.553 1.117 1.984 6.093a.75.75 0 0 0 1.26.291l2.498-2.612 4.374 3.22a2.25 2.25 0 0 0 3.519-1.46l2.25-16.5a2.25 2.25 0 0 0-2.042-2.347z"/>
      </svg>
    )
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/message/72BTQZMTQU2AG1",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    )
  },
   {
    label: "Google",
    href: "https://www.google.com/search?q=OfferWaleBaba&stick=H4sIAAAAAAAA_-NgU1I1qDBOSjW3NLU0S000N0pKSUqxMqhIMkoyMzNPMkhMNE1KNkpKW8TK65-WlloUnpiT6pSYlAgA9JZF2jkAAAA&hl=en&mat=CRFncPBLRARKElcBTVDHnlFZAzRUb5k7XxJQUtIo8wkxRLilxtEbwkTszXtkEc5ACbiU0Rdp8GkiDbg99jHlvSmDg_UAZsfXWVQZ-MJOdtz8aSvPSjHQIm98wMZv9rgWgNM&authuser=0",
       svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#F8FAFC] py-12 sm:py-16 md:py-24 md:pb-52 overflow-hidden border-t border-slate-100 font-sans mt-12 sm:mt-20">
      {/* Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none w-full text-center">
        <h2 className="text-[18vw] sm:text-[12vw] font-black text-[#0F172A]/[0.09] uppercase leading-none tracking-tighter whitespace-nowrap">
          OFFERWALE BABA
        </h2>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-16 shadow-xl shadow-slate-100 border border-slate-100">
          <div className="flex flex-col lg:flex-row justify-between gap-8 sm:gap-12 mb-12 sm:mb-16 items-start">

            {/* Branding + Socials */}
            <div className="flex flex-col space-y-5 sm:space-y-6 max-w-full sm:max-w-sm">
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

              {/* Contact Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-[12px] font-bold text-amber-500 uppercase tracking-widest mb-1">Support</p>
                  <a
                    href="tel:+919370686008"
                    className="text-[#0F172A] font-black text-lg hover:text-amber-500 transition-colors duration-300"
                  >
                    +91 93706 86008
                  </a>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-amber-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Sambhaji Chowk, Opp. Tipcy-Topcy Society,<br />
                    Babasai Nagar, Ulhasnagar,<br />
                    Maharashtra – 421004
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 pt-3 flex-wrap">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="text-slate-400 hover:text-[#0F172A] transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 lg:gap-16 w-full lg:w-auto shrink-0">
              {footerLinks.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <h4 className="text-[#0F172A] text-sm font-extrabold uppercase tracking-widest leading-none">
                    {section.category}
                  </h4>
                  <ul className="space-y-3.5">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="text-slate-400 text-xs sm:text-sm font-medium hover:text-amber-600 transition-colors duration-300 uppercase tracking-tighter"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="border-t border-slate-100 pt-6 sm:pt-8 mt-10 sm:mt-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              © {currentYear} · All wholesale Rights Reserved. Design and developed by Offer Waale baba
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="/contact" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Contact Us</a>
              <a href="/sitemap" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">Brand Sitemap</a>
              <a href="/msme-portal" className="hover:text-amber-500 transition-colors underline underline-offset-4 decoration-slate-100">MSME Verified Portal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;