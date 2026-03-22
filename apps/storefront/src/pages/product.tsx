import ProductActions from "@/components/product-actions"
import { ImageGalleryEnhanced } from "@/components/ui/image-gallery-enhanced"
import { RelatedProducts } from "@/components/product/related-products"
import { useLoaderData, useLocation } from "@tanstack/react-router"
import { useProducts } from "@/lib/hooks/use-products"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useState, useMemo, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { Share } from "@medusajs/icons"

const NUTRITION = [
  { label: "Serving Size", value: "330ml" },
  { label: "Dietary Fiber", value: "6.25g", highlight: true },
  { label: "Sugar", value: "< 2g" },
  { label: "Calories", value: "~25 kcal" },
  { label: "Prebiotics", value: "Present" },
  { label: "Artificial Additives", value: "None" },
]

const INGREDIENTS_LIST = [
  "Carbonated Water",
  "Chicory Root Extract (Inulin)",
  "Natural Fruit Juice Concentrate",
  "Monk Fruit Extract",
  "Citric Acid (Natural)",
  "Natural Flavors",
]

const ProductDetails = () => {
  const { product, region } = useLoaderData({
    from: "/$countryCode/products/$handle",
  })
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [nutritionOpen, setNutritionOpen] = useState(false)

  const handleVariantChange = useCallback((_variant: HttpTypes.StoreProductVariant | undefined) => {}, [])

  const handleOptionsChange = useCallback((options: Record<string, string | undefined>) => {
    const definedOptions = Object.entries(options).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value
      return acc
    }, {} as Record<string, string>)
    setSelectedOptions(definedOptions)
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const input = document.createElement("input")
      input.value = url
      Object.assign(input.style, { position: "fixed", opacity: "0" })
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const { data: relatedProductsData } = useProducts({
    query_params: {
      limit: 5,
      fields: "id,title,handle,thumbnail,*variants.calculated_price",
    },
    region_id: region.id,
  })

  const relatedProducts =
    relatedProductsData?.pages
      .flatMap((page) => page.products)
      .filter((p) => p.id !== product.id)
      .slice(0, 4) || []

  const displayImages = useMemo(() => {
    return product.images || []
  }, [product.images])

  return (
    <>
      <div className="content-container pt-[80px] pb-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div>
            <ImageGalleryEnhanced images={displayImages} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="sticky top-28 self-start w-full">
              {/* Brand pill */}
              <span className="inline-block mb-3 px-3 py-1 bg-forest-100 text-forest-700 text-xs font-semibold tracking-widest uppercase rounded-full">
                Prebiotic Fizzy Drink
              </span>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-forest-900 mb-2 tracking-tight">
                {product.title}
              </h1>

              {/* Fiber highlight */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <span>6.25g Dietary Fiber</span>
                </div>
                <div className="flex items-center gap-2 bg-forest-50 text-forest-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <span>100% Natural</span>
                </div>
              </div>

              {/* Product description */}
              {product.description && (
                <p className="text-gray-600 leading-relaxed text-base mb-8">
                  {product.description}
                </p>
              )}

              {/* Variant selection + Add to Cart */}
              <div className="mb-8">
                <ProductActions
                  product={product}
                  region={region}
                  onVariantChange={handleVariantChange}
                  onOptionsChange={handleOptionsChange}
                />
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                {[
                  { icon: "🚚", text: "Free delivery above ₹499" },
                  { icon: "🌿", text: "All natural ingredients" },
                  { icon: "↩️", text: "Easy 7-day returns" },
                ].map((t) => (
                  <div key={t.text} className="bg-forest-50 rounded-xl p-3 border border-forest-100">
                    <div className="text-lg mb-1">{t.icon}</div>
                    <div className="text-xs text-forest-700 leading-tight">{t.text}</div>
                  </div>
                ))}
              </div>

              {/* Nutrition Facts Accordion */}
              <div className="border border-forest-100 rounded-2xl overflow-hidden mb-4">
                <button
                  onClick={() => setNutritionOpen(!nutritionOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-forest-50 hover:bg-forest-100 transition-colors text-left"
                >
                  <span className="font-semibold text-forest-900 text-sm">Nutrition Facts</span>
                  <svg
                    className={`w-4 h-4 text-forest-600 transition-transform duration-200 ${nutritionOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {nutritionOpen && (
                  <div className="px-5 py-4 bg-white border-t border-forest-100">
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {NUTRITION.map((n) => (
                        <div
                          key={n.label}
                          className={`rounded-xl p-3 text-center ${n.highlight ? "bg-forest-800 border border-forest-700" : "bg-forest-50"}`}
                        >
                          <div className={`font-display text-xl font-bold ${n.highlight ? "text-white" : "text-forest-900"}`}>
                            {n.value}
                          </div>
                          <div className={`text-xs mt-0.5 ${n.highlight ? "text-forest-200" : "text-gray-500"}`}>{n.label}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-forest-700 uppercase tracking-wide mb-2">Ingredients</div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {INGREDIENTS_LIST.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Support CTA */}
              <a
                href="https://wa.me/918000000000?text=Hi%20Embrace%2C%20I%20have%20a%20question%20about%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-green-200 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl px-5 py-4 transition-colors mb-4 group"
              >
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <div className="text-sm font-semibold">Chat with us on WhatsApp</div>
                  <div className="text-xs text-green-600 mt-0.5">Usually replies within minutes</div>
                </div>
              </a>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-forest-700 transition-colors"
              >
                <Share className="w-4 h-4" />
                {copied ? "Link copied!" : "Share this drink"}
              </button>
            </div>
          </div>
        </div>

        {/* Brand promise */}
        <div className="mt-20 bg-forest-900 rounded-3xl p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Prebiotic Power</h3>
              <p className="text-forest-200 text-sm leading-relaxed">
                Chicory root inulin feeds the good bacteria in your gut, improving digestion and immunity over time.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🍹</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Crafted for India</h3>
              <p className="text-forest-200 text-sm leading-relaxed">
                Flavors developed specifically for the Indian palate — bold, familiar, and refreshing all at once.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">💚</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Your Daily Ritual</h3>
              <p className="text-forest-200 text-sm leading-relaxed">
                Replace your sugary fizzy drinks with Embrace — guilt-free, gut-friendly, and genuinely delicious.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} countryCode={countryCode} />
      )}
    </>
  )
}

export default ProductDetails
