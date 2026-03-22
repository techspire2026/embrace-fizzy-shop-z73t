import { createFileRoute } from "@tanstack/react-router"

// POST /api/whatsapp/send
// Body: { contactId: string; message: string }
// Injects the customer's message directly into Whatomate's messages table
// (direction: "incoming") so the agent sees a live conversation thread.
export const Route = createFileRoute("/api/whatsapp/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const base = process.env.WHATOMATE_BASE_URL!
        const apiKey = process.env.WHATOMATE_API_KEY!

        const body = await request.json()
        const { contactId, message } = body as {
          contactId: string
          message: string
        }

        if (!contactId || !message) {
          return Response.json(
            { error: "contactId and message are required" },
            { status: 400 }
          )
        }

        // Inject as an incoming message directly into Whatomate's messages table.
        // The agent sees it in real time via WebSocket and can reply normally.
        const res = await fetch(`${base}/api/contacts/${contactId}/messages/web`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({ content: message }),
        })

        if (!res.ok) {
          // Non-fatal — message is already shown optimistically in the widget
          return Response.json({ ok: false })
        }

        return Response.json({ ok: true })
      },
    },
  },
})

