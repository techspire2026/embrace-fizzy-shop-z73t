import { useLocation, useLoaderData, Link } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useProducts } from "@/lib/hooks/use-products"
import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

const HERO_SLIDES = [
  {
    handle: "watermelon-mint",
    name: "Watermelon Mint",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7WP0V221DVYRXRDEVQ17-01KM1W7WP03289HHE22FSZTK6G.jpeg",
    bg: "#0a5c50",
    btnColor: "#5ece36",
  },
  {
    handle: "peach-lemon",
    name: "Peach Lemon",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7YG79WG6GTFAD6SN7RFG-01KM1W7YG8TDEC15V91CK775PJ.jpeg",
    bg: "#a03508",
    btnColor: "#f5a623",
  },
  {
    handle: "lemon-ginger",
    name: "Lemon Ginger",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7ZQK5RE1T9ZAKXMV0D9W-01KM1W7ZQKDSP6ZN9D0AZB4WN2.jpeg",
    bg: "#1c5526",
    btnColor: "#a2d14a",
  },
  {
    handle: "fruit-beer",
    name: "Fruit Beer",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W81QZXFKB0X291Q52X3PQ-01KM1W81QZQVG76KDSZM8XSTEM.jpeg",
    bg: "#0e1e5c",
    btnColor: "#5ece36",
  },
]

const BENEFITS = [
  { img: "https://www.embracenutrition.in/assets/web/img/features/1.png", label: "Gut Friendly" },
  { img: "https://www.embracenutrition.in/assets/web/img/features/2.png", label: "Prebiotic" },
  { img: "https://www.embracenutrition.in/assets/web/img/features/3.png", label: "Dietary Fiber" },
  { img: "https://www.embracenutrition.in/assets/web/img/features/4.png", label: "Low Sugar" },
  { img: "https://www.embracenutrition.in/assets/web/img/features/5.png", label: "Low Calories" },
]

const FLAVORS = [
  {
    handle: "watermelon-mint",
    name: "Watermelon Mint",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7WP0V221DVYRXRDEVQ17-01KM1W7WP03289HHE22FSZTK6G.jpeg",
    cardBg: "bg-rose-50",
    cardBorder: "border-rose-200",
    badgeColor: "text-rose-600",
  },
  {
    handle: "peach-lemon",
    name: "Peach Lemon",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7YG79WG6GTFAD6SN7RFG-01KM1W7YG8TDEC15V91CK775PJ.jpeg",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    badgeColor: "text-amber-600",
  },
  {
    handle: "lemon-ginger",
    name: "Lemon Ginger",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W7ZQK5RE1T9ZAKXMV0D9W-01KM1W7ZQKDSP6ZN9D0AZB4WN2.jpeg",
    cardBg: "bg-teal-50",
    cardBorder: "border-teal-200",
    badgeColor: "text-teal-700",
  },
  {
    handle: "fruit-beer",
    name: "Fruit Beer",
    image: "https://cdn.mignite.app/ws/works_01KM1VKRXDXWT18Z59YR3XZ73T/generated-01KM1W81QZXFKB0X291Q52X3PQ-01KM1W81QZQVG76KDSZM8XSTEM.jpeg",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-200",
    badgeColor: "text-orange-700",
  },
]

const TESTIMONIALS = [
  {
    name: "Priya",
    stars: 5,
    text: "It's not just a drink, it's a mood! I grab an Embrace every morning before work, and it just sets the tone for my day.",
  },
  {
    name: "Aksa Saji",
    stars: 5,
    text: "Absolutely love it! The flavor is so smooth and perfectly balanced. I can't imagine a movie night without Embrace by my side!",
  },
  {
    name: "Sayooj Sathashivan",
    stars: 5,
    text: "Refreshing and bold! Every sip feels like a burst of energy. Embrace is my go-to drink during long drives — it keeps me fresh and upbeat.",
  },
  {
    name: "Rahul",
    stars: 5,
    text: "Pure chill in a bottle! It's the perfect mix of fizz and flavor. Whenever I'm stressed, Embrace helps me cool down instantly.",
  },
  {
    name: "Sneha",
    stars: 5,
    text: "My daily dose of happiness! I don't need coffee anymore — one Embrace and I'm ready to take on the world!",
  },
  {
    name: "Diya",
    stars: 5,
    text: "A must-have at every party! I introduced my friends to Embrace, and now it's the official drink at all our get-togethers.",
  },
  {
    name: "Meera",
    stars: 5,
    text: "Refreshing like a summer breeze! It's light, flavorful, and never too sweet. Perfect after a workout or a sunny day out.",
  },
]

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const Home = () => {
  const location = useLocation()
  const { region } = useLoaderData({ from: "/$countryCode/" })
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const [currentSlide, setCurrentSlide] = useState(0)

  const { data: productsData } = useProducts({
    region_id: region?.id,
    query_params: {
      limit: 4,
      fields: "id,title,handle,thumbnail,*variants,*variants.calculated_price",
    },
  })

  const products = productsData?.pages?.[0]?.products ?? []

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────── */}
      {/* Split-panel: solid color bg + floating can image — zero pixelation */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          minHeight: "92vh",
          backgroundColor: HERO_SLIDES[currentSlide].bg,
          transition: "background-color 0.8s ease",
        }}
      >
        {/* Decorative concentric rings centered on the right/can area */}
        {[720, 540, 360, 210].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/[0.07] pointer-events-none"
            style={{
              width: size,
              height: size,
              right: `calc(25% - ${size / 2}px)`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        ))}

        {/* Can images — one per slide, right half */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.handle}
            className={`absolute right-0 inset-y-0 w-1/2 flex items-center justify-center px-6 lg:px-12 transition-all duration-700 ease-out ${
              idx === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.name}
              className="floating-can max-h-[76vh] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        ))}

        {/* Left-side text — re-animates with key change on each slide */}
        <div
          key={`herotext-${currentSlide}`}
          className="relative z-10 px-8 md:px-14 lg:px-20 xl:px-28 w-full lg:w-1/2"
        >
          <h1
            className="hero-text-enter-d2 font-sans font-black text-white uppercase leading-none mb-6"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 4.8rem)", letterSpacing: "-0.02em" }}
          >
            Embrace Magic<br />in Every Sip.
          </h1>
          <p
            className="hero-text-enter-d3 text-white/75 leading-relaxed mb-10"
            style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)", maxWidth: "26rem" }}
          >
            Nourish your gut with every sip, naturally bold, delightfully bubbly, and crafted to make feeling good easy every day.
          </p>
          <Link
            to="/$countryCode/products/$handle"
            params={{ countryCode, handle: HERO_SLIDES[currentSlide].handle }}
            className="hero-text-enter-d4 inline-block font-bold px-10 py-4 rounded-lg text-white text-base shadow-xl transition-all duration-200 hover:brightness-110 hover:scale-105"
            style={{ backgroundColor: HERO_SLIDES[currentSlide].btnColor }}
          >
            Shop Now
          </Link>
        </div>

        {/* Prev / Next arrows — bottom right */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:brightness-110"
            style={{ backgroundColor: HERO_SLIDES[currentSlide].btnColor }}
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide dots — bottom left, aligned with text */}
        <div className="absolute bottom-10 left-8 md:left-14 lg:left-20 xl:left-28 z-20 flex gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-white w-8" : "bg-white/40 w-2.5 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── MARQUEE TICKER ───────────────────────────── */}
      <div className="bg-forest-800 text-white overflow-hidden py-4">
        <div className="marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="marquee-item px-10 text-sm font-bold tracking-[0.18em] uppercase">
              FIZZ WITH BENEFITS ✦&nbsp; 6.25GM FIBER ✦&nbsp; GUT FRIENDLY ✦&nbsp; PREBIOTIC DRINK ✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── MEET EMBRACE ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-forest-600 mb-4">
                About Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-forest-900 mb-6 leading-tight capitalize">
                Meet embrace
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Your new fizz for every mood. A kinder alternative to high-sugar sodas — crafted with botanicals, plant fiber, and prebiotics to refresh your mood while nourishing your gut.
              </p>
              <p className="text-gray-500 leading-relaxed mb-4">
                Lightly sparkling and perfectly balanced, Embrace is made to fit your day — with a meal, as a mixer, or simply as your daily pick-me-up.
              </p>
              <p className="text-gray-500 italic leading-relaxed mb-10">
                A drink to savor every day, every way.
              </p>
              <a
                href={`/${countryCode}/about`}
                className="inline-flex items-center gap-2 bg-forest-800 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-forest-900 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                Know More
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            <div className="flex justify-center">
              <img
                src="https://www.embracenutrition.in/assets/web/img/meet-embrace.png"
                alt="Meet Embrace — prebiotic fizzy drink"
                className="max-w-md w-full drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ICONS — dark green strip ───────── */}
      <section className="py-16 bg-forest-800">
        <div className="content-container">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-14">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-3 group cursor-default">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center p-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <img src={b.img} alt={b.label} className="w-14 h-14 object-contain drop-shadow" />
                </div>
                <span className="text-sm font-semibold text-white">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PRODUCTS ─────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="content-container">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-forest-600 mb-3 block">Choose Your Flavor</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-900">
              Our Products
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {FLAVORS.map((flavor) => {
              const product = products.find((p: HttpTypes.StoreProduct) => p.handle === flavor.handle)
              const price = (product?.variants?.[0] as any)?.calculated_price?.calculated_amount
              const imageUrl = product?.thumbnail || flavor.image
              return (
                <Link
                  key={flavor.handle}
                  to="/$countryCode/products/$handle"
                  params={{ countryCode, handle: flavor.handle }}
                  className={`group block rounded-2xl overflow-hidden border-2 ${flavor.cardBorder} ${flavor.cardBg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5`}
                >
                  <div className="aspect-square overflow-hidden bg-white">
                    <img
                      src={imageUrl}
                      alt={flavor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-gray-900">{flavor.name}</h3>
                    {price !== undefined && (
                      <p className={`text-sm mt-1 font-semibold ${flavor.badgeColor}`}>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(price)}
                      </p>
                    )}
                    <button className="mt-4 w-full bg-forest-800 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-forest-900 transition-colors">
                      View Product
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — dual-row auto-scroll ──────── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-forest-600 mb-3 block">Happy Customers</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-900">
            Loved by Many!
          </h2>
        </div>

        {/* Row 1 — scrolls left */}
        <div className="mb-4">
          <div className="testimonial-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="testimonial-card bg-white border-2 border-gray-100 rounded-2xl p-6 mx-3 shadow-sm"
                style={{ width: "300px", minWidth: "300px" }}
              >
                <StarRating count={t.stars} />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <p className="font-bold text-forest-800 text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right (reverse) */}
        <div>
          <div className="testimonial-track-reverse">
            {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
              <div
                key={i}
                className="testimonial-card bg-forest-800 rounded-2xl p-6 mx-3"
                style={{ width: "300px", minWidth: "300px" }}
              >
                <StarRating count={t.stars} />
                <p className="text-forest-100 text-sm leading-relaxed mb-4">{t.text}</p>
                <p className="font-bold text-white text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
