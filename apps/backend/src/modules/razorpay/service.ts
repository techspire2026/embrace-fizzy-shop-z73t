import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  PaymentProviderError,
  PaymentProviderSessionResponse,
  AuthorizePaymentInput,
  CancelPaymentInput,
  CapturePaymentInput,
  DeletePaymentInput,
  GetPaymentStatusInput,
  InitiatePaymentInput,
  RefundPaymentInput,
  RetrievePaymentInput,
  UpdatePaymentInput,
  WebhookActionResult,
} from "@medusajs/types"

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
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { amount, currency_code, context } = input

    try {
      // Razorpay uses smallest currency unit (paise for INR)
      const order = await this.razorpayRequest<RazorpayOrder>("POST", "/orders", {
        amount: Math.round(amount * 100),
        currency: currency_code.toUpperCase(),
        receipt: `order_${Date.now()}`,
        notes: {
          cart_id: (context as Record<string, string>)?.cart_id || "",
        },
      })

      return {
        session_data: {
          razorpay_order_id: order.id,
          key_id: this.options_.key_id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
        },
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_initiate_error",
        detail: error,
      }
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<PaymentProviderError | { data: Record<string, unknown>; status: string }> {
    const { data } = input

    try {
      const razorpayPaymentId = (data as Record<string, string>)?.razorpay_payment_id
      const razorpayOrderId = (data as Record<string, string>)?.razorpay_order_id
      const razorpaySignature = (data as Record<string, string>)?.razorpay_signature

      // Verify signature
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
        const crypto = await import("crypto")
        const expectedSignature = crypto
          .createHmac("sha256", this.options_.key_secret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex")

        if (expectedSignature !== razorpaySignature) {
          return {
            error: "Payment signature verification failed",
            code: "razorpay_signature_mismatch",
            detail: "The payment signature does not match",
          }
        }

        return {
          status: "authorized",
          data: {
            ...(data as Record<string, unknown>),
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            razorpay_signature: razorpaySignature,
          },
        }
      }

      // Check existing order status
      const orderId = (data as Record<string, string>)?.razorpay_order_id
      if (orderId) {
        const order = await this.razorpayRequest<RazorpayOrder>(
          "GET",
          `/orders/${orderId}`
        )
        if (order.status === "paid") {
          return {
            status: "authorized",
            data: data as Record<string, unknown>,
          }
        }
      }

      return {
        status: "pending",
        data: data as Record<string, unknown>,
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_authorize_error",
        detail: error,
      }
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { data } = input

    try {
      const paymentId = (data as Record<string, string>)?.razorpay_payment_id

      if (!paymentId) {
        return {
          session_data: data as Record<string, unknown>,
        }
      }

      // Fetch the payment to check if already captured
      const payment = await this.razorpayRequest<RazorpayPayment>(
        "GET",
        `/payments/${paymentId}`
      )

      if (payment.captured) {
        return { session_data: data as Record<string, unknown> }
      }

      // Capture the payment
      await this.razorpayRequest("POST", `/payments/${paymentId}/capture`, {
        amount: payment.amount,
        currency: payment.currency,
      })

      return {
        session_data: {
          ...(data as Record<string, unknown>),
          captured: true,
        },
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_capture_error",
        detail: error,
      }
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      session_data: input.data as Record<string, unknown>,
    }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { data, amount } = input

    try {
      const paymentId = (data as Record<string, string>)?.razorpay_payment_id

      if (!paymentId) {
        return {
          error: "No payment ID for refund",
          code: "razorpay_refund_error",
          detail: "Missing razorpay_payment_id in payment data",
        }
      }

      const refund = await this.razorpayRequest<{ id: string; status: string }>(
        "POST",
        `/payments/${paymentId}/refund`,
        {
          amount: Math.round(amount * 100),
        }
      )

      return {
        session_data: {
          ...(data as Record<string, unknown>),
          refund_id: refund.id,
          refunded: true,
        },
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_refund_error",
        detail: error,
      }
    }
  }

  async deletePayment(
    _input: DeletePaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return { session_data: {} }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { amount, currency_code, context } = input

    try {
      const order = await this.razorpayRequest<RazorpayOrder>("POST", "/orders", {
        amount: Math.round(amount * 100),
        currency: currency_code.toUpperCase(),
        receipt: `order_${Date.now()}`,
        notes: {
          cart_id: (context as Record<string, string>)?.cart_id || "",
        },
      })

      return {
        session_data: {
          razorpay_order_id: order.id,
          key_id: this.options_.key_id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
        },
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_update_error",
        detail: error,
      }
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { data } = input

    try {
      const orderId = (data as Record<string, string>)?.razorpay_order_id

      if (!orderId) {
        return { session_data: data as Record<string, unknown> }
      }

      const order = await this.razorpayRequest<RazorpayOrder>(
        "GET",
        `/orders/${orderId}`
      )

      return {
        session_data: {
          ...(data as Record<string, unknown>),
          status: order.status,
        },
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        code: "razorpay_retrieve_error",
        detail: error,
      }
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<{ status: string }> {
    const { data } = input

    try {
      const paymentId = (data as Record<string, string>)?.razorpay_payment_id
      const orderId = (data as Record<string, string>)?.razorpay_order_id

      if (paymentId) {
        const payment = await this.razorpayRequest<RazorpayPayment>(
          "GET",
          `/payments/${paymentId}`
        )
        if (payment.captured) return { status: "captured" }
        if (payment.status === "authorized") return { status: "authorized" }
        if (payment.status === "failed") return { status: "error" }
      }

      if (orderId) {
        const order = await this.razorpayRequest<RazorpayOrder>(
          "GET",
          `/orders/${orderId}`
        )
        if (order.status === "paid") return { status: "captured" }
        if (order.status === "attempted") return { status: "authorized" }
      }

      return { status: "pending" }
    } catch {
      return { status: "error" }
    }
  }

  async getWebhookActionAndData(
    payload: { data: Record<string, unknown>; rawData: string | Buffer; headers: Record<string, unknown> }
  ): Promise<WebhookActionResult> {
    const { data } = payload
    const event = (data as Record<string, string>)?.event

    if (event === "payment.captured") {
      const paymentEntity = (data as Record<string, Record<string, unknown>>)?.payload?.payment?.entity
      return {
        action: "captured",
        data: {
          session_id: String(paymentEntity?.order_id || ""),
          amount: Number(paymentEntity?.amount || 0) / 100,
        },
      }
    }

    if (event === "payment.failed") {
      const paymentEntity = (data as Record<string, Record<string, unknown>>)?.payload?.payment?.entity
      return {
        action: "failed",
        data: {
          session_id: String(paymentEntity?.order_id || ""),
          amount: Number(paymentEntity?.amount || 0) / 100,
        },
      }
    }

    return { action: "not_supported" }
  }
}

export default RazorpayProviderService
