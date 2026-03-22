import { useState } from "react"
import { Button } from "@/components/ui/button"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    
    // Placeholder - would connect to actual contact form service
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStatus("success")
    
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setStatus("idle"), 3000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-forest-900 pt-[64px] pb-16">
        <div className="content-container pt-16 text-center">
          <span className="inline-block mb-4 px-4 py-1.5 bg-forest-700 text-forest-100 text-xs font-semibold tracking-widest uppercase rounded-full">
            Contact
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-forest-200 text-lg max-w-xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>
      <div className="content-container py-16">
        <div className="max-w-5xl mx-auto">

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white border border-forest-100 rounded-2xl p-8 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-forest-900 mb-6 tracking-wide">
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-forest-900 mb-2 uppercase tracking-wide"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-forest-200 bg-white rounded-lg focus:outline-none focus:border-forest-600 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-forest-900 mb-2 uppercase tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-forest-200 bg-white rounded-lg focus:outline-none focus:border-forest-600 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-forest-900 mb-2 uppercase tracking-wide"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-forest-200 bg-white rounded-lg focus:outline-none focus:border-forest-600 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-forest-900 mb-2 uppercase tracking-wide"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-forest-200 bg-white rounded-lg focus:outline-none focus:border-forest-600 transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="w-full bg-forest-700 text-white py-4 rounded-full hover:bg-forest-800 transition-colors text-sm font-semibold tracking-wider disabled:opacity-50"
                >
                  {status === "loading" && "Sending..."}
                  {status === "success" && "Message Sent!"}
                  {(status === "idle" || status === "error") && "Send Message"}
                </Button>

                {status === "success" && (
                  <p className="text-sm text-green-600 text-center">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-sm text-red-600 text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-forest-50 border border-forest-100 rounded-2xl p-8">
                <h3 className="font-display text-lg font-semibold text-forest-900 mb-4 tracking-wide">
                  Customer Service
                </h3>
                <div className="space-y-3 text-forest-800">
                  <p>
                    <strong>WhatsApp:</strong> +91 80000 00000
                  </p>
                  <p>
                    <strong>Email:</strong> hello@embracenutrition.in
                  </p>
                  <p>
                    <strong>Hours:</strong> Monday – Saturday, 10am – 7pm IST
                  </p>
                  <p className="text-sm text-forest-600 mt-4">
                    We typically respond within a few hours during business days.
                  </p>
                </div>
              </div>

              <div className="bg-forest-900 rounded-2xl p-8">
                <h3 className="font-display text-lg font-semibold text-white mb-4 tracking-wide">
                  Chat on WhatsApp
                </h3>
                <p className="text-forest-200 text-sm mb-6">
                  Fastest way to reach us. Our team is usually online and replies within minutes.
                </p>
                <a
                  href="https://wa.me/918000000000?text=Hi%20Embrace%2C%20I%20have%20a%20question."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
