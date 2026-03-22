import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "@medusajs/icons"

const FAQ_CATEGORIES = [
  {
    category: "About Embrace",
    items: [
      {
        question: "What is Embrace?",
        answer: "Embrace is a prebiotic fizzy drink made with 100% natural ingredients. Each 330ml can contains 6.25g of dietary fiber from chicory root (inulin) — a prebiotic that feeds your gut bacteria, improves digestion, and supports your immune system. We have four flavors: Watermelon Mint, Peach Lemon, Lemon Ginger, and Fruit Beer.",
      },
      {
        question: "What does 'prebiotic' mean?",
        answer: "Prebiotics are non-digestible fibers that act as food for your gut's beneficial bacteria (probiotics). Unlike probiotics (which introduce bacteria), prebiotics nourish the bacteria already living in your gut. Chicory root inulin — the prebiotic we use — is one of the most well-studied prebiotics, clinically proven to improve gut flora diversity and digestive health.",
      },
      {
        question: "How much sugar does Embrace contain?",
        answer: "Each can contains less than 2g of sugar. We use a blend of monk fruit extract and stevia — both natural, plant-derived sweeteners with no glycemic impact. You get all the sweetness without the spike or the crash.",
      },
      {
        question: "Is Embrace suitable for diabetics?",
        answer: "Embrace is low in sugar and uses natural sweeteners with no glycemic impact. However, we always recommend consulting your doctor before making any changes to your diet if you have a medical condition.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    items: [
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free standard shipping on all orders above ₹499. Orders below ₹499 attract a flat ₹49 shipping fee. All orders are dispatched within 1-2 business days and delivered within 3-7 business days depending on your location.",
      },
      {
        question: "Do you ship pan-India?",
        answer: "Yes, we ship to all pin codes across India — including Tier 2 and Tier 3 cities. If your pin code is not serviceable, you'll be notified during checkout.",
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely. Once your order is dispatched, you'll receive an SMS and email with your tracking link. You can also track your order by logging into your account on our website.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "You can modify or cancel your order within 1 hour of placement by contacting us on WhatsApp. After 1 hour, orders enter fulfillment and cannot be changed. If your order has already shipped, you can initiate a return after delivery.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major payment methods via Razorpay: UPI (GPay, PhonePe, Paytm), credit cards, debit cards, net banking, and EMI options. All transactions are secured with 256-bit SSL encryption.",
      },
      {
        question: "Is it safe to pay on your website?",
        answer: "Yes, completely. We use Razorpay — India's most trusted payment gateway — for all transactions. Your card details are never stored on our servers. Razorpay is PCI DSS compliant and RBI regulated.",
      },
      {
        question: "Can I pay on delivery (COD)?",
        answer: "We currently don't offer Cash on Delivery as we're committed to secure, traceable digital transactions. We accept all UPI and card payments via Razorpay.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns within 7 days of delivery for damaged, defective, or incorrect products. Since Embrace is a consumable product, we cannot accept returns for change of mind. If your cans arrived damaged or the wrong product was sent, we'll replace them or issue a full refund.",
      },
      {
        question: "How do I report a damaged order?",
        answer: "If your order arrived damaged, please WhatsApp us with photos within 48 hours of delivery. We'll arrange a replacement or full refund within 3-5 business days.",
      },
    ],
  },
  {
    category: "Health & Ingredients",
    items: [
      {
        question: "How many cans should I drink per day?",
        answer: "We recommend 1-2 cans per day as part of a balanced diet. Each can provides 6.25g of prebiotic fiber, and most adults benefit from 25-38g of total dietary fiber daily. Start with one can per day to let your gut adjust, then increase to two if desired.",
      },
      {
        question: "Does Embrace contain caffeine?",
        answer: "No, Embrace contains no caffeine. It's a natural energy boost from real fruit and the positive effects of supporting your gut health — not a stimulant.",
      },
      {
        question: "Is Embrace vegan and gluten-free?",
        answer: "Yes, all Embrace drinks are 100% vegan and gluten-free. We use no animal products, dairy, or gluten-containing ingredients.",
      },
      {
        question: "Can kids drink Embrace?",
        answer: "Embrace is safe for children above age 5. The fiber content is beneficial for growing gut microbiomes. However, we recommend starting with smaller servings (half a can) for younger children and consulting a pediatrician if in doubt.",
      },
    ],
  },
]

const FAQ = () => {
  return (
    <div className="min-h-screen bg-white pt-[64px]">
      {/* Hero */}
      <section className="py-16 bg-forest-900">
        <div className="content-container text-center">
          <span className="inline-block mb-4 px-4 py-1.5 bg-forest-700 text-forest-100 text-xs font-semibold tracking-widest uppercase rounded-full">
            Support
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
            Frequently Asked<br />Questions
          </h1>
          <p className="text-forest-200 text-lg max-w-xl mx-auto">
            Everything you need to know about Embrace, our drinks, and how we work.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <div className="content-container py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-display text-2xl font-bold text-forest-900 mb-6 pb-3 border-b border-forest-200">
                {cat.category}
              </h2>
              <Accordion.Root type="single" collapsible className="space-y-3">
                {cat.items.map((faq, index) => (
                  <Accordion.Item
                    key={index}
                    value={`${cat.category}-${index}`}
                    className="bg-white border border-forest-100 rounded-2xl overflow-hidden"
                  >
                    <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-5 text-left group hover:bg-forest-50 transition-colors">
                      <span className="text-base font-semibold text-forest-900 pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown className="w-5 h-5 text-forest-500 transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0" />
                    </Accordion.Trigger>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-close">
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm border-t border-forest-50 pt-4">
                        {faq.answer}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-forest-50 border border-forest-200 rounded-3xl p-10 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="font-display text-2xl font-bold text-forest-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-forest-700 mb-6">
              Our team is available on WhatsApp — usually replies within minutes.
            </p>
            <a
              href="https://wa.me/918000000000?text=Hi%20Embrace%2C%20I%20have%20a%20question."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ
