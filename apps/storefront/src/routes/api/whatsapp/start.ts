import { createFileRoute } from "@tanstack/react-router"

// POST /api/whatsapp/start
// Body: { name: string; phone: string; message: string }
// Creates (or finds) a Whatomate contact and saves the inquiry.
// Returns: { contactId: string; phone: string }
export const Route = createFileRoute("/api/whatsapp/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const base = process.env.WHATOMATE_BASE_URL!
        const apiKey = process.env.WHATOMATE_API_KEY!
        const accountId = process.env.WHATOMATE_ACCOUNT_ID!

        const body = await request.json()
        const { name, phone, message } = body as {
          name: string
          phone: string
          message: string
        }

        if (!phone || !name || !message) {
          return Response.json(
            { error: "name, phone and message are required" },
            { status: 400 }
          )
        }

        // Normalise phone: strip spaces/dashes, ensure +country code present
        const normalised = phone.replace(/[\s\-()]/g, "")

        // Create or update contact in Whatomate
        const contactRes = await fetch(`${base}/api/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            phone_number: normalised,
            name,
            account_id: accountId,
            metadata: {
              inquiry_source: "Embrace Storefront",
              submitted_at: new Date().toISOString(),
              chat_messages: [
                {
                  from: "customer",
                  text: message,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          }),
        })

        const contactData = await contactRes.json()

        let contactId: string

        if (!contactRes.ok) {
          // If contact already exists, find it by phone number.
          // Whatomate strips the leading '+' when storing, so search without it.
          const searchPhone = normalised.startsWith("+") ? normalised.slice(1) : normalised
          const searchRes = await fetch(
            `${base}/api/contacts?search=${encodeURIComponent(searchPhone)}&limit=1`,
            { headers: { "X-API-Key": apiKey } }
          )
          const searchData = await searchRes.json()
          const existing = searchData?.data?.contacts?.[0]
          if (existing) {
            contactId = existing.id
          } else {
            return Response.json(
              { error: contactData.message ?? "Failed to create contact" },
              { status: 500 }
            )
          }
        } else {
          contactId = contactData.data.id
        }

        // Inject the initial message directly into Whatomate's messages table
        // so the agent sees it in their conversation thread immediately.
        await fetch(`${base}/api/contacts/${contactId}/messages/web`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({ content: message }),
        })

        return Response.json({ contactId, phone: normalised })
      },
    },
  },
})
