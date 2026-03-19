import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
  PaymentSessionStatus,
} from "@medusajs/framework/types"

type Options = {
  key_id: string
  key_secret: string
}

type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  status: string
  receipt?: string
  notes?: Record<string, string>
}

type RazorpayPayment = {
  id: string
  order_id: string
  status: string
  amount: number
  currency: string
  method?: string
  captured: boolean
  refund_status?: string
}

class RazorpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay"

  protected options_: Options
  protected baseUrl_: string

  constructor(container: Record<string, unknown>, options: Options) {
    super(container, options)
    this.options_ = options
    this.baseUrl_ = "https://api.razorpay.com/v1"
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.options_.key_id}:${this.options_.key_secret}`
    ).toString("base64")
    return `Basic ${credentials}`
  }

  private async razorpayRequest<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl_}${path}`, {
      method,
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { description: "Unknown error" } }))
      throw new Error(
        error?.error?.description || `Razorpay API error: ${response.status}`
      )
    }

    return response.json() as Promise<T>
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input

    // Razorpay uses smallest currency unit (paise for INR)
    const amountInPaise = Math.round(Number(amount) * 100)
    const order = await this.razorpayRequest<RazorpayOrder>("POST", "/orders", {
      amount: amountInPaise,
      currency: currency_code.toUpperCase(),
      receipt: `order_${Date.now()}`,
      notes: {
        cart_id: (context as Record<string, string>)?.cart_id || "",
      },
    })

    return {
      id: order.id,
      data: {
        id: order.id,
        key_id: this.options_.key_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const { data } = input
    const razorpayPaymentId = (data as Record<string, string>)?.razorpay_payment_id
    const razorpayOrderId = (data as Record<string, string>)?.razorpay_order_id
    const razorpaySignature = (data as Record<string, string>)?.razorpay_signature

    // Verify signature if all three are present
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const crypto = await import("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", this.options_.key_secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")

      if (expectedSignature !== razorpaySignature) {
        return {
          status: "error" as PaymentSessionStatus,
          data: data as Record<string, unknown>,
        }
      }

      return {
        status: "authorized" as PaymentSessionStatus,
        data: {
          ...(data as Record<string, unknown>),
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_signature: razorpaySignature,
        },
      }
    }

    // Check existing order status
    const orderId = (data as Record<string, string>)?.id || (data as Record<string, string>)?.razorpay_order_id
    if (orderId) {
      try {
        const order = await this.razorpayRequest<RazorpayOrder>(
          "GET",
          `/orders/${orderId}`
        )
        if (order.status === "paid") {
          return {
            status: "authorized" as PaymentSessionStatus,
            data: data as Record<string, unknown>,
          }
        }
      } catch {
        // ignore errors when checking order status
      }
    }

    return {
      status: "pending" as PaymentSessionStatus,
      data: data as Record<string, unknown>,
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const { data } = input
    const paymentId = (data as Record<string, string>)?.razorpay_payment_id

    if (!paymentId) {
      return { data: data as Record<string, unknown> }
    }

    const payment = await this.razorpayRequest<RazorpayPayment>(
      "GET",
      `/payments/${paymentId}`
    )

    if (payment.captured) {
      return { data: data as Record<string, unknown> }
    }

    await this.razorpayRequest("POST", `/payments/${paymentId}/capture`, {
      amount: payment.amount,
      currency: payment.currency,
    })

    return {
      data: {
        ...(data as Record<string, unknown>),
        captured: true,
      },
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: input.data as Record<string, unknown> }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const { data, amount } = input
    const paymentId = (data as Record<string, string>)?.razorpay_payment_id

    if (!paymentId) {
      return { data: data as Record<string, unknown> }
    }

    const amountInPaise = Math.round(Number(amount) * 100)
    const refund = await this.razorpayRequest<{ id: string; status: string }>(
      "POST",
      `/payments/${paymentId}/refund`,
      { amount: amountInPaise }
    )

    return {
      data: {
        ...(data as Record<string, unknown>),
        refund_id: refund.id,
        refunded: true,
      },
    }
  }

  async deletePayment(
    _input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: {} }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const { amount, currency_code, context } = input
    const amountInPaise = Math.round(Number(amount) * 100)
    const order = await this.razorpayRequest<RazorpayOrder>("POST", "/orders", {
      amount: amountInPaise,
      currency: currency_code.toUpperCase(),
      receipt: `order_${Date.now()}`,
      notes: {
        cart_id: (context as Record<string, string>)?.cart_id || "",
      },
    })

    return {
      data: {
        id: order.id,
        key_id: this.options_.key_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      },
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const { data } = input
    const orderId = (data as Record<string, string>)?.id || (data as Record<string, string>)?.razorpay_order_id

    if (!orderId) {
      return { data: data as Record<string, unknown> }
    }

    const order = await this.razorpayRequest<RazorpayOrder>(
      "GET",
      `/orders/${orderId}`
    )

    return {
      data: {
        ...(data as Record<string, unknown>),
        status: order.status,
      },
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const { data } = input

    const paymentId = (data as Record<string, string>)?.razorpay_payment_id
    const orderId = (data as Record<string, string>)?.id || (data as Record<string, string>)?.razorpay_order_id

    try {
      if (paymentId) {
        const payment = await this.razorpayRequest<RazorpayPayment>(
          "GET",
          `/payments/${paymentId}`
        )
        if (payment.captured) return { status: "captured" as PaymentSessionStatus }
        if (payment.status === "authorized") return { status: "authorized" as PaymentSessionStatus }
        if (payment.status === "failed") return { status: "error" as PaymentSessionStatus }
      }

      if (orderId) {
        const order = await this.razorpayRequest<RazorpayOrder>(
          "GET",
          `/orders/${orderId}`
        )
        if (order.status === "paid") return { status: "captured" as PaymentSessionStatus }
        if (order.status === "attempted") return { status: "authorized" as PaymentSessionStatus }
      }
    } catch {
      return { status: "error" as PaymentSessionStatus }
    }

    return { status: "pending" as PaymentSessionStatus }
  }

  async getWebhookActionAndData(
    payload: { data: Record<string, unknown>; rawData: string | Buffer; headers: Record<string, unknown> }
  ): Promise<WebhookActionResult> {
    const { data } = payload
    const event = (data as Record<string, string>)?.event

    type RazorpayWebhookPayload = {
      payload?: {
        payment?: {
          entity?: {
            order_id?: string
            amount?: number
          }
        }
      }
    }

    if (event === "payment.captured") {
      const entity = (data as RazorpayWebhookPayload)?.payload?.payment?.entity
      return {
        action: "captured",
        data: {
          session_id: String(entity?.order_id || ""),
          amount: Number(entity?.amount || 0) / 100,
        },
      }
    }

    if (event === "payment.failed") {
      const entity = (data as RazorpayWebhookPayload)?.payload?.payment?.entity
      return {
        action: "failed",
        data: {
          session_id: String(entity?.order_id || ""),
          amount: Number(entity?.amount || 0) / 100,
        },
      }
    }

    return { action: "not_supported" }
  }
}

export default RazorpayProviderService
