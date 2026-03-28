import { createFileRoute } from "@tanstack/react-router"

// GET /api/whatsapp/messages?contactId=<uuid>
export const Route = createFileRoute("/api/whatsapp/messages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const base = process.env.WHATOMATE_BASE_URL!
        const apiKey = process.env.WHATOMATE_API_KEY!

        const url = new URL(request.url)
        const contactId = url.searchParams.get("contactId")

        if (!contactId) {
          return Response.json({ error: "contactId is required" }, { status: 400 })
        }

        const res = await fetch(
          `${base}/api/contacts/${contactId}/messages?limit=50`,
          { headers: { "X-API-Key": apiKey } }
        )

        if (!res.ok) {
          return Response.json({ error: "Failed to fetch messages" }, { status: 500 })
        }

        const data = await res.json()
        return Response.json({ messages: data?.data?.items ?? [] })
      },
    },
  },
})
