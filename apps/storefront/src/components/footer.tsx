import CountrySelect from "@/components/country-select"
import { useRegions } from "@/lib/hooks/use-regions"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation } from "@tanstack/react-router"

const Footer = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const baseHref = countryCode ? `/${countryCode}` : ""

  const { data: regions } = useRegions({
    fields: "id, currency_code, *countries",
  })

  return (
    <footer className="bg-bark-900 text-cream-100 w-full" data-testid="footer">
      <div className="content-container flex flex-col w-full">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-y-5 lg:col-span-2">
            <Link
              to={baseHref || "/"}
              className="text-3xl font-display font-bold text-cream-50 hover:text-terracotta-300 transition-colors w-fit"
            >
              Embrace
            </Link>
            <p className="text-cream-400 text-sm leading-relaxed max-w-sm">
              More than a beverage. A way of living. Embrace is a prebiotic fizzy drink made with 100% natural ingredients — crafted for your gut, your energy, and your everyday joy.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-cream-500 hover:text-terracotta-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-cream-500 hover:text-terracotta-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-cream-500 hover:text-terracotta-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <div className="mt-2">
              <p className="text-xs text-cream-500 mb-2 uppercase tracking-wide">Region</p>
              <CountrySelect regions={regions ?? []} />
            </div>
          </div>

          {/* Shop Column */}
          <FooterColumn
            title="Flavors"
            links={[
              { name: "Shop All", url: `${baseHref}/store` },
              { name: "Watermelon Mint", url: `${baseHref}/products/watermelon-mint` },
              { name: "Peach Lemon", url: `${baseHref}/products/peach-lemon` },
              { name: "Lemon Ginger", url: `${baseHref}/products/lemon-ginger` },
              { name: "Fruit Beer", url: `${baseHref}/products/fruit-beer` },
            ]}
          />

          {/* Company Column */}
          <FooterColumn
            title="Company"
            links={[
              { name: "Our Story", url: `${baseHref}/about` },
              { name: "FAQ", url: `${baseHref}/faq` },
              { name: "Contact", url: `${baseHref}/contact` },
              { name: "Shipping", url: `${baseHref}/shipping` },
              { name: "Returns", url: `${baseHref}/returns` },
              { name: "Privacy Policy", url: `${baseHref}/privacy` },
              { name: "Terms of Service", url: `${baseHref}/terms` },
            ]}
          />
        </div>

        {/* Nutrition highlight strip */}
        <div className="border-t border-bark-800 py-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { label: "Dietary Fiber", value: "6.25g" },
              { label: "Natural Ingredients", value: "100%" },
              { label: "Artificial Additives", value: "Zero" },
              { label: "Gut-Friendly", value: "Always" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-xl font-display font-bold text-terracotta-300">{stat.value}</span>
                <span className="text-xs text-cream-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-bark-800 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream-500">
          <span>© {new Date().getFullYear()} Embrace. All rights reserved. Made with love in India.</span>
          <div className="flex items-center gap-2">
            <span className="text-cream-600">Powered by</span>
            <span className="font-semibold text-cream-400">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterColumn = ({
  title,
  links,
}: {
  title: string
  links: { name: string; url: string }[]
}) => (
  <div className="flex flex-col gap-y-5">
    <h3 className="text-cream-50 text-xs font-semibold uppercase tracking-widest">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.url} className="text-sm">
          <Link to={link.url} className="text-cream-400 hover:text-terracotta-300 transition-colors">
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

export default Footer
