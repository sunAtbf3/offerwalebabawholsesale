import { motion } from "framer-motion";
import {
  MapPin,
  ChevronDown,
  Smartphone,
  Home,
  Shirt,
  Dumbbell,
  Gift,
  Plane,
  ShieldCheck,
  Truck,
  BadgeIndianRupee,
  Heart,
  CheckCircle2,
  Smile,
  PencilRuler,
  SprayCan,
  Car,
  Baby,
} from "lucide-react";
import logo from "../../assets/logo.jpg"
import { Link } from "react-router-dom";
import { useEffect } from "react";

const categories = [
  {
    label: "Smart Life Gadgets",
    path: "/category/smart-life-gadgets",
    desc: "Smart Life Gadgets",
    icon: Smartphone,
    color: "from-cyan-500/20 to-blue-500/10",
  },

  {
    label: "Home & Kitchen",
    path: "/category/home-and-kitchen",
   
    desc: "Home & Kitchen",
    icon: Home,
    color: "from-orange-500/20 to-yellow-500/10",
  },

  {
    label: "Fashion World",
    path: "/category/fashion-world",
    desc: "Fashion World",
    icon: Shirt,
    color: "from-pink-500/20 to-rose-500/10",
  },

  {
    label: "Sports & Fitness",
    path: "/category/sports-and-fitness",
    desc: "Sports & Fitness",
    icon: Dumbbell,
    color: "from-green-500/20 to-emerald-500/10",
  },

  {
    label: "Tours & Travels",
    path: "/category/tours-and-travels",
    desc: "Tours & Travels",
    icon: Plane,
    color: "from-sky-500/20 to-indigo-500/10",
  },

  {
    label: "Stationary",
    path: "/category/stationary",
    desc: "Stationary",
    icon: PencilRuler,
    color: "from-violet-500/20 to-purple-500/10",
  },

  {
    label: "Baby Items",
    path: "/category/baby-items",
    desc: "Baby Items",
    icon: Baby,
    color: "from-pink-400/20 to-orange-300/10",
  },

  {
    label: "Car Accessories",
    path: "/category/car-accessories",
    desc: "Car Accessories",
    icon: Car,
    color: "from-slate-500/20 to-gray-500/10",
  },

  {
    label: "Cleaning Supplies",
    path: "/category/mix-items-daily-use",
    desc: "Cleaning Supplies",
    icon: SprayCan,
    color: "from-teal-500/20 to-cyan-500/10",
  },

  {
    label: "Gifts",
    path: "/category/gifts",
    desc: "Gifts",
    icon: Gift,
    color: "from-amber-500/20 to-orange-500/10",
  },
];
const MotionLink = motion(Link);

const advantages = [
  {
    title: "GST Billing",
    desc: "Full GST invoices with complete compliance.",
    icon: ShieldCheck,
  },
  {
    title: "Bulk Discounts",
    desc: "Wholesale pricing for every business scale.",
    icon: BadgeIndianRupee,
  },
  {
    title: "Verified Sellers",
    desc: "Trusted suppliers with quality assurance.",
    icon: CheckCircle2,
  },
  {
    title: "PAN India Delivery",
    desc: "Fast shipping across every state.",
    icon: Truck,
  },
];

const values = [
  {
    title: "Customer First",
    desc: "Every decision begins with customer satisfaction.",
    icon: Heart,
  },
  {
    title: "Quality Assurance",
    desc: "Strict quality standards across every category.",
    icon: ShieldCheck,
  },
  {
    title: "Honest Pricing",
    desc: "Transparent pricing with zero hidden charges.",
    icon: Smile,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.7,
    },
  }),
};

export default function AboutUs() {
  useEffect(()=>{
    window.scrollTo({ top:0, behavior: "smooth"})
  },[])
  return (
    <div className="bg-[#0a0a0f] text-white overflow-hidden">

      {/* HERO */}
      {/* HERO */}
<section className="relative min-h-[70vh] flex items-center justify-center px-6 lg:px-12" style={{ backgroundColor: '#0d1117' }}>

  {/* ORBS */}
  <div className="absolute top-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
  <div className="absolute bottom-[-150px] left-[-100px] h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[120px]" />

  {/* GRID */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.04]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
      WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
    }}
  />

  {/* SOFT OVERLAY */}
  <div
    className="absolute inset-0"
    style={{
      background: "linear-gradient(135deg, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.85) 50%, rgba(13,17,23,0.95) 100%)",
    }}
  />

  {/* HERO CONTENT */}
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeUp}
    className="relative z-10 text-center max-w-5xl py-16"
  >
    {/* TOP BADGE */}
    <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/20 bg-amber-500/5 px-7 py-3 backdrop-blur-xl shadow-[0_0_40px_rgba(251,191,36,0.04)]">
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
      <span className="text-[12px] font-semibold uppercase tracking-[5px] text-amber-500">
        Wholesale Marketplace
      </span>
    </div>

    {/* MAIN TITLE */}
    <h1 className="mt-10 text-6xl md:text-8xl font-[300] tracking-[-4px] text-white leading-none">
      About Us
    </h1>

    {/* SUBTITLE */}
    <h2 className="mt-8 text-2xl md:text-4xl font-semibold tracking-[-1px] text-white/90">
      Bulk Products • Better Prices • Faster Delivery
    </h2>

    {/* DESCRIPTION */}
    <p className="mx-auto mt-8 max-w-4xl text-lg md:text-[1.35rem] leading-[2.2rem] text-white/55 font-light">
      From trending gadgets to daily essentials — Offer Wale Baba helps
      retailers, resellers, and businesses source high-quality wholesale
      products at unbeatable prices across PAN India.
    </p>

    {/* LOCATION */}
    <div className="mt-12 flex items-center justify-center">
      <p className="text-[13px] md:text-[15px] uppercase tracking-[4px] text-amber-600/80">
        Ulhasnagar, Maharashtra · Wholesale Delivery Across India
      </p>
    </div>
  </motion.div>

  {/* SCROLL INDICATOR */}
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/30">
    <ChevronDown className="animate-bounce" />
    <span className="mt-2 text-xs tracking-[3px] uppercase">Scroll</span>
  </div>
</section>

      {/* STATS */}
    <section className="grid grid-cols-2 lg:grid-cols-4 bg-[#294669] rounded-2xl overflow-hidden">
  {[
    ["10K+", "Products"],
    ["PAN India", "Delivery"],
    ["GST", "Compliant"],
    ["MOQ 10+", "Min Order"],
  ].map(([number, label], i) => (
    <motion.div
      key={label}
      custom={i}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="relative border-r border-white/8 last:border-r-0 px-5 py-8 text-center"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#E4D329] rounded-b" />
      <h2 className="text-4xl font-black text-[#E4D329]">{number}</h2>
      <p className="mt-1.5 text-[10px] uppercase tracking-[2.5px] text-white/55">{label}</p>
    </motion.div>
  ))}
</section>

      {/* STORY */}
      <section className="bg-[#f8f8f5] px-6 py-28 text-black lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 items-center">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs uppercase tracking-[4px] text-[#478B8D] font-bold">
              Our Story
            </p>

            <div className="mt-4 h-[2px] w-14 bg-[#478B8D]" />

            <h2 className="mt-6 text-5xl font-black leading-tight tracking-[-2px]">
              From a Local Store <br />
              to a National Name
            </h2>

            <p className="mt-8 text-gray-600 leading-8">
              Offer Wale Baba was founded with a simple mission — make
              high-quality products accessible at honest wholesale prices.
            </p>

            <p className="mt-5 text-gray-600 leading-8">
              Today, Offer Wale Baba serves retailers, businesses, and shoppers across
              India with thousands of curated products.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative"
          >
            <div className="rounded-[32px] border border-amber-500/10 bg-[#111827] p-10 text-white shadow-2xl">

              <p className="text-xs uppercase tracking-[3px] text-[#478B8D]">
                Our Foundation
              </p>

              <h3 className="mt-5 text-3xl font-black leading-tight">
                Built on Trust, <br />
                Driven by Value
              </h3>

              <p className="mt-6 leading-8 text-white/60">
                Every product is sourced directly from verified sellers —
                ensuring quality and pricing your business deserves.
              </p>
            </div>

            <div className="absolute -bottom-6 -right-6 rounded-3xl bg-[#E4D329] px-8 py-6 text-black shadow-2xl">
              <h2 className="text-4xl font-black">₹9</h2>
              <p className="mt-1 text-xs uppercase tracking-[2px] text-black/60">
                Starting Price
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-white px-6 py-28 text-black lg:px-12">
        <div className="mx-auto max-w-7xl">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs uppercase tracking-[4px] text-[#478B8D] font-bold">
              What We Offer
            </p>

            <div className="mt-4 h-[2px] w-14 bg-[#478B8D]" />

            <h2 className="mt-6 text-5xl font-black tracking-[-2px]">
              One Platform, <br />
              Every Category
            </h2>

            <p className="mt-6 max-w-2xl text-gray-600 leading-8">
              From gadgets to gifting and essentials — Offer Wale Baba is your all-in-one
              wholesale destination.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((item, i) => {
              const Icon = item.icon;

              return (
                <MotionLink
                  key={item.title}
                  to={item.path}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group rounded-3xl border border-gray-200 bg-[#fafafa] p-7 transition hover:-translate-y-2 hover:border-[#478B8D] hover:shadow-2xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#478B8D]/15 transition group-hover:bg-[#478B8D]/30">
                    <Icon className="h-6 w-6 text-[#478B8D]" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-gray-600 leading-7">
                    {item.desc}
                  </p>

                  <Link to={item.path} className="mt-6 text-sm font-bold text-[#478B8D] transition hover:translate-x-1">
                    View Products →
                  </Link>
                </MotionLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="relative overflow-hidden bg-[#0a0a0f] px-6 py-28 lg:px-12">
        <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl relative z-10">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs uppercase tracking-[4px] text-[#478B8D] font-bold">
              Why Choose Us
            </p>

            <div className="mt-4 h-[2px] w-14 bg-[#478B8D]" />

            <h2 className="mt-6 text-5xl font-black tracking-[-2px]">
              The Offer Wale Baba Advantage
            </h2>

            <p className="mt-6 max-w-2xl text-white/60 leading-8">
              Everything built for your business — pricing, delivery,
              compliance, and trust.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {advantages.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#478B8D]/50"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#478B8D]/10">
                    <Icon className="h-6 w-6 text-[#478B8D]/50" />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-8 text-white/60">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#f8f8f5] px-6 py-28 text-black lg:px-12">
        <div className="mx-auto max-w-7xl">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs uppercase tracking-[4px] text-[#478B8D] font-bold">
              Our Values
            </p>

            <div className="mt-4 h-[2px] w-14 bg-[#478B8D]" />

            <h2 className="mt-6 text-5xl font-black tracking-[-2px]">
              What We Stand For
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {values.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group rounded-3xl border border-gray-200 bg-white p-10 text-center transition hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#478B8D]/25 transition group-hover:scale-110">
                    <Icon className="h-7 w-7 text-[#478B8D]" />
                  </div>

                  <h3 className="mt-7 text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-8 text-gray-600">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-white px-6 py-28 text-black lg:px-12">
        <div className="mx-auto max-w-6xl rounded-[40px] border border-gray-200 bg-[#fafafa] p-10 lg:p-16 shadow-xl">

          <div className="flex flex-col items-center gap-10 lg:flex-row">

            <img src={logo} className="flex h-36 w-36 items-center justify-center bg-[#111827] text-4xl font-black text-amber-400"/>

            <div>
              <h2 className="text-3xl font-black">
                Offer Wale Baba
              </h2>

              <p className="mt-2 text-[#478B8D]">
                Ulhasnagar, Maharashtra · Serving PAN India
              </p>

              <blockquote className="mt-8 border-l-4 border-[#478B8D] pl-6 text-lg leading-9 text-gray-600 italic">
                “We started with one goal — to become the most reliable
                wholesale partner for every business and shopper in India.”
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-white px-6 py-28 text-center text-black">

        <div className="absolute left-1/2 top-[-150px] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-black/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl">

          <h2 className="text-5xl font-black tracking-[-2px]">
            Ready to Shop Wholesale?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/70">
            Join thousands of businesses and shoppers across India.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/category/smart-life-gadgets" className="rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition hover:scale-105">
              Explore Categories
            </Link>

            <Link to="/contact" className="rounded-full border border-black/20 px-8 py-4 text-sm font-bold transition hover:border-black">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* <footer className="bg-black px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-2xl font-black">
              Offer Wale <span className="text-amber-400">Baba</span>
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Ulhasnagar, Maharashtra · Serving PAN India
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-amber-400">
              Home
            </a>

            <a href="#" className="hover:text-amber-400">
              About
            </a>

            <a href="#" className="hover:text-amber-400">
              Categories
            </a>

            <a href="#" className="hover:text-amber-400">
              Contact
            </a>
          </div>

          <p className="text-sm text-white/30">
            © 2026 Offer Wale Baba. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
}