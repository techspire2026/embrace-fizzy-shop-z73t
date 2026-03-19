import { useLocation, useLoaderData, Link } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useProducts } from "@/lib/hooks/use-products"
import { Newsletter } from "@/components/sections/newsletter"
import { ArrowRight } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

const FLAVORS = [
  {
    handle: "watermelon-mint",
    name: "Watermelon Mint",
    tagline: "Cool & Refreshing",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7WP0V221DVYRXRDEVQ17-01KM1W7WP03289HHE22FSZTK6G.jpeg",
    accent: "bg-rose-50 border-rose-200",
    badge: "text-rose-600",
  },
  {
    handle: "peach-lemon",
    name: "Peach Lemon",
    tagline: "Golden & Zesty",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7YG79WG6GTFAD6SN7RFG-01KM1W7YG8TDEC15V91CK775PJ.jpeg",
    accent: "bg-amber-50 border-amber-200",
    badge: "text-amber-600",
  },
  {
    handle: "lemon-ginger",
    name: "Lemon Ginger",
    tagline: "Bold & Energizing",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7ZQK5RE1T9ZAKXMV0D9W-01KM1W7ZQKDSP6ZN9D0AZB4WN2.jpeg",
    accent: "bg-yellow-50 border-yellow-200",
    badge: "text-yellow-700",
  },
  {
    handle: "fruit-beer",
    name: "Fruit Beer",
    tagline: "Crafted & Complex",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W81QZXFKB0X291Q52X3PQ-01KM1W81QZQVG76KDSZM8XSTEM.jpeg",
    accent: "bg-orange-50 border-orange-200",
    badge: "text-orange-700",
  },
]

const INGREDIENTS = [
  { name: "Chicory Root", benefit: "Prebiotic fiber that feeds your good gut bacteria" },
  { name: "Real Fruit Juice", benefit: "Natural flavor, natural color — no artificial dyes" },
  { name: "Sparkling Water", benefit: "Pure carbonated water for that satisfying fizz" },
  { name: "Natural Sweeteners", benefit: "Monk fruit & stevia — sweet without the sugar spike" },
]

const BENEFITS = [
  {
    icon: "🌿",
    title: "Gut Health First",
    desc: "6.25g of dietary fiber per can supports a thriving gut microbiome",
  },
  {
    icon: "🍃",
    title: "100% Natural",
    desc: "No artificial flavors, colors, or preservatives. Ever.",
  },
  {
    icon: "💧",
    title: "Low Sugar",
    desc: "All the taste, none of the sugar crash. Naturally sweetened.",
  },
  {
    icon: "✨",
    title: "Made in India",
    desc: "Crafted with Indian ingredients, for the Indian palate.",
  },
]

const Home = () => {
  const location = useLocation()
  const { region } = useLoaderData({ from: "/$countryCode/" })
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const { data: productsData } = useProducts({
    region_id: region?.id,
    query_params: {
      limit: 4,
      fields: "id,title,handle,thumbnail,*variants,*variants.calculated_price",
    },
  })

  const products = productsData?.pages?.[0]?.products ?? []

  return (
    <div className="min-h-screen bg-cream-50">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[100px]">
        {/* background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-50 via-cream-100 to-sage-50" />
        {/* decorative blobs */}
        <div className="absolute top-20 right-[10%] w-96 h-96 rounded-full bg-terracotta-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 rounded-full bg-sage-200/30 blur-3xl" />

        <div className="relative content-container text-center">
          <span className="inline-block mb-6 px-4 py-1.5 bg-terracotta-100 text-terracotta-700 text-xs font-semibold tracking-widest uppercase rounded-full">
            Prebiotic Fizzy Drinks
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-bark-900 leading-tight mb-6">
            More than<br />
            <span className="text-terracotta-500">a beverage.</span>
          </h1>
          <p className="text-bark-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A way of living. Embrace isn't just something you drink. It's a commitment to your gut health, your energy, and your everyday joy — one fizzy sip at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/$countryCode/store"
              params={{ countryCode }}
              className="inline-flex items-center gap-2 bg-terracotta-600 text-cream-50 px-8 py-4 hover:bg-terracotta-700 transition-colors font-semibold tracking-wide"
            >
              Shop All Flavors
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`/${countryCode}/about`}
              className="inline-flex items-center gap-2 border-2 border-bark-900 text-bark-900 px-8 py-4 hover:bg-bark-900 hover:text-cream-50 transition-colors font-semibold tracking-wide"
            >
              Our Story
            </a>
          </div>

          {/* hero stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "6.25g", label: "Dietary Fiber" },
              { value: "4", label: "Unique Flavors" },
              { value: "0", label: "Artificial Additives" },
              { value: "100%", label: "Natural Ingredients" },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cream-200">
                <div className="font-display text-3xl font-bold text-terracotta-600">{s.value}</div>
                <div className="text-xs text-bark-500 mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAVORS SHOWCASE ─────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-bark-900 mb-4">
              Choose Your Flavor
            </h2>
            <p className="text-bark-500 max-w-xl mx-auto">
              Four distinct profiles, each crafted for a different mood, moment, and gut.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLAVORS.map((flavor) => {
              const product = products.find((p: HttpTypes.StoreProduct) => p.handle === flavor.handle)
              const price = (product?.variants?.[0] as any)?.calculated_price?.calculated_amount
              return (
                <Link
                  key={flavor.handle}
                  to="/$countryCode/products/$handle"
                  params={{ countryCode, handle: flavor.handle }}
                  className={`group block rounded-2xl border-2 ${flavor.accent} p-6 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-5 bg-white">
                    <img
                      src={flavor.image}
                      alt={flavor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${flavor.badge}`}>
                    {flavor.tagline}
                  </span>
                  <h3 className="font-display text-xl font-bold text-bark-900 mt-1">{flavor.name}</h3>
                  {price !== undefined && (
                    <p className="text-bark-600 text-sm mt-2">
                      From {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-terracotta-600 text-sm font-medium">
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BENEFITS STRIP ───────────────────────────── */}
      <section className="py-16 bg-terracotta-600">
        <div className="content-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="font-display text-lg font-bold text-cream-50 mb-2">{b.title}</h3>
                <p className="text-terracotta-100 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INGREDIENT STORY ─────────────────────────── */}
      <section className="py-24 bg-sage-50">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs text-sage-600 font-semibold uppercase tracking-widest">What's Inside</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-bark-900 mt-3 mb-6">
                Ingredients you can<br />actually pronounce.
              </h2>
              <p className="text-bark-600 leading-relaxed mb-10">
                Every can of Embrace is built on a foundation of prebiotic fiber and real fruit — never synthetic flavor compounds or artificial preservatives. We believe your body deserves better than a chemistry lab.
              </p>
              <div className="space-y-4">
                {INGREDIENTS.map((ing) => (
                  <div key={ing.name} className="flex gap-4 items-start p-4 bg-white rounded-xl border border-sage-100">
                    <div className="w-2 h-2 rounded-full bg-sage-500 mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-bark-900 text-sm">{ing.name}</div>
                      <div className="text-bark-500 text-sm mt-0.5">{ing.benefit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src="https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7WP0V221DVYRXRDEVQ17-01KM1W7WP03289HHE22FSZTK6G.jpeg"
                  alt="Watermelon Mint can"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                <img
                  src="https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7ZQK5RE1T9ZAKXMV0D9W-01KM1W7ZQKDSP6ZN9D0AZB4WN2.jpeg"
                  alt="Lemon Ginger can"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND PHILOSOPHY ─────────────────────────── */}
      <section className="py-24 bg-bark-900 text-cream-50">
        <div className="content-container text-center">
          <span className="text-xs text-terracotta-300 font-semibold uppercase tracking-widest">Our Philosophy</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-8 max-w-4xl mx-auto leading-tight">
            "Embrace isn't just something you drink. It's a way of living."
          </h2>
          <p className="text-cream-400 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
            We started Embrace because we believed gut health should feel good — not like medicine. Every sip is an act of self-care. Every flavor is a celebration of nature. Every can is a step toward a life well-lived.
          </p>
          <a
            href={`/${countryCode}/about`}
            className="inline-flex items-center gap-2 border border-cream-400 text-cream-300 px-8 py-4 hover:bg-cream-50 hover:text-bark-900 transition-colors font-medium tracking-wide"
          >
            Read Our Story <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── NUTRITION FACTS HIGHLIGHT ─────────────────── */}
      <section className="py-24 bg-cream-100">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-bark-900 mb-4">
              Nutrition That Works
            </h2>
            <p className="text-bark-500 max-w-xl mx-auto">
              Every can is engineered around your gut. Here's what you get with every sip.
            </p>
          </div>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-cream-200 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { label: "Serving Size", value: "330ml" },
                { label: "Dietary Fiber", value: "6.25g", highlight: true },
                { label: "Sugar", value: "< 2g" },
                { label: "Calories", value: "~25 kcal" },
                { label: "Artificial Additives", value: "None" },
                { label: "Prebiotics", value: "Present" },
              ].map((n) => (
                <div
                  key={n.label}
                  className={`text-center p-4 rounded-2xl ${n.highlight ? "bg-terracotta-50 border-2 border-terracotta-200" : "bg-cream-50"}`}
                >
                  <div className={`font-display text-3xl font-bold ${n.highlight ? "text-terracotta-600" : "text-bark-900"}`}>
                    {n.value}
                  </div>
                  <div className="text-xs text-bark-500 mt-1 uppercase tracking-wide">{n.label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-bark-400 mt-6">
              *Values are approximate and may vary slightly by flavor. Full nutrition info on each can.
            </p>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────── */}
      <Newsletter />
    </div>
  )
}

export default Home
