import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { ArrowRight } from "@medusajs/icons"

const TEAM_VALUES = [
  {
    icon: "🌱",
    title: "Rooted in Nature",
    desc: "Every ingredient we use grows from the earth. We believe the best flavors and the best medicine come from the same source.",
  },
  {
    icon: "🔬",
    title: "Science-Backed",
    desc: "Our prebiotic formula is built on clinical research around the gut microbiome. 6.25g of fiber per can isn't arbitrary — it's intentional.",
  },
  {
    icon: "🇮🇳",
    title: "Made for India",
    desc: "We didn't copy a Western health drink. We built Embrace for the Indian palate, Indian climate, and Indian lifestyle.",
  },
  {
    icon: "♻️",
    title: "Sustainably Packed",
    desc: "Our cans are 100% recyclable. We're working toward net-zero packaging by 2026.",
  },
]

const TIMELINE = [
  {
    year: "2022",
    title: "The Problem",
    desc: "Our founders noticed a gap: Indian consumers were choosing between taste and health. Every fizzy drink was either delicious or gut-friendly — never both.",
  },
  {
    year: "2023",
    title: "The Research",
    desc: "12 months of formula development. Over 200 taste trials. Partnerships with nutritionists and food scientists to land on the perfect prebiotic blend.",
  },
  {
    year: "2024",
    title: "The Launch",
    desc: "Embrace launched with Watermelon Mint and Lemon Ginger. Sold out in 3 days. The response confirmed what we already believed: India was ready.",
  },
  {
    year: "2025",
    title: "Growing Together",
    desc: "We expanded to Peach Lemon and Fruit Beer, built direct shipping across India, and kept our promise: zero compromise on ingredients.",
  },
]

const About = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-[calc(64px+6rem)] pb-24 overflow-hidden bg-forest-900">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 opacity-90" />
        <div className="absolute top-10 right-[15%] w-72 h-72 rounded-full bg-forest-500/10 blur-3xl" />
        <div className="relative content-container text-center">
          <span className="inline-block mb-6 px-4 py-1.5 bg-forest-700 text-forest-100 text-xs font-semibold tracking-widest uppercase rounded-full">
            Our Story
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            A beverage born<br />
            <span className="text-forest-300">from conviction.</span>
          </h1>
          <p className="text-forest-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Embrace was built on a simple belief: that what you drink every day should work for you — not against you. That gut health shouldn't taste like medicine.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-forest-800">
        <div className="content-container text-center">
          <blockquote className="font-display text-3xl md:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
            "More than a beverage. A way of living."
          </blockquote>
          <p className="text-forest-200 mt-6 max-w-xl mx-auto text-lg leading-relaxed">
            Embrace isn't just something you drink. It's a commitment — to your body, to nature, and to a life lived with intention.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-forest-900">How We Got Here</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-forest-200" />
            <div className="space-y-12">
              {TIMELINE.map((event) => (
                <div key={event.year} className="relative flex gap-8 pl-20">
                  <div className="absolute left-0 w-16 h-16 rounded-2xl bg-forest-700 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-white font-bold text-sm">{event.year}</span>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-display text-xl font-bold text-forest-900 mb-2">{event.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-forest-50">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-forest-900 mb-4">What We Stand For</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              These aren't just words on a wall. They're the reason every can of Embrace is made the way it is.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 border border-forest-100 shadow-sm">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl font-bold text-forest-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients Transparency */}
      <section className="py-24 bg-forest-800">
        <div className="content-container text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            We Have Nothing to Hide
          </h2>
          <p className="text-forest-200 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
            Every can lists every ingredient. No proprietary blends, no hidden sweeteners, no asterisks. Our label is our promise.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Carbonated Water", "Chicory Root (Inulin)", "Real Fruit Juice", "Monk Fruit Extract", "Citric Acid", "Natural Flavors"].map((ing) => (
              <span
                key={ing}
                className="px-4 py-2 bg-forest-700 text-forest-100 rounded-full text-sm font-medium border border-forest-600"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="content-container">
          <h2 className="font-display text-4xl font-bold text-forest-900 mb-4">
            Ready to Embrace?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 text-lg">
            Try all four flavors and find your favorite. Your gut will thank you.
          </p>
          <Link
            to="/$countryCode/store"
            params={{ countryCode }}
            className="inline-flex items-center gap-2 bg-forest-700 text-white px-8 py-4 rounded-full hover:bg-forest-800 transition-colors font-semibold tracking-wide"
          >
            Shop All Flavors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About
