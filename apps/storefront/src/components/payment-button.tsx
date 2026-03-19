import { Button } from "@/components/ui/button"
import { useCompleteCartOrder } from "@/lib/hooks/use-checkout"
import { isManual, isRazorpay } from "@/lib/utils/checkout"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

declare global {
  interface Window {
    Razorpay: any
  }
}

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart;
  className?: string;
};

const PaymentButton = ({ cart, className }: PaymentButtonProps) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isRazorpay(paymentSession?.provider_id):
      return <RazorpayPaymentButton cart={cart} notReady={notReady} className={className} />
    case isManual(paymentSession?.provider_id):
      return <ManualPaymentButton notReady={notReady} className={className} />
    default:
      return <ManualPaymentButton notReady={notReady} className={className} />
  }
}

const RazorpayPaymentButton = ({
  cart,
  notReady,
  className,
}: {
  cart: HttpTypes.StoreCart;
  notReady: boolean;
  className?: string;
}) => {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const completeOrderMutation = useCompleteCartOrder()

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay. Please check your internet connection.")
      }

      const session = cart.payment_collection?.payment_sessions?.[0]
      const sessionData = session?.data as Record<string, any> | undefined
      const razorpayOrderId = sessionData?.id as string | undefined

      if (!razorpayOrderId) {
        // Fallback: complete order directly if no Razorpay order id in session
        const order = await completeOrderMutation.mutateAsync()
        navigate({
          to: "/$countryCode/order/$orderId/confirmed",
          params: { countryCode, orderId: order.id },
          replace: true,
        })
        return
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SRDe9B4Stjz3DV",
        amount: (cart.total ?? 0) * 100,
        currency: cart.currency_code?.toUpperCase() ?? "INR",
        order_id: razorpayOrderId,
        name: "Embrace",
        description: "Prebiotic Fizzy Drinks",
        theme: { color: "#C1440E" },
        prefill: {
          name: `${cart.billing_address?.first_name ?? ""} ${cart.billing_address?.last_name ?? ""}`.trim(),
          email: cart.email ?? "",
          contact: cart.billing_address?.phone ?? "",
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            // The session authorize step happens via our Razorpay provider webhooks
            // Complete the cart order
            const order = await completeOrderMutation.mutateAsync()
            navigate({
              to: "/$countryCode/order/$orderId/confirmed",
              params: { countryCode, orderId: order.id },
              replace: true,
            })
          } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Order completion failed")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Payment failed")
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady || loading}
        onClick={handlePayment}
        data-testid="place-order-button"
        className={className}
      >
        {loading ? "Processing..." : "Pay with Razorpay"}
      </Button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </>
  )
}

const ManualPaymentButton = ({
  notReady,
  className,
}: {
  notReady: boolean;
  className?: string;
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const completeOrderMutation = useCompleteCartOrder()

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const order = await completeOrderMutation.mutateAsync()
      navigate({
        to: "/$countryCode/order/$orderId/confirmed",
        params: { countryCode, orderId: order.id },
        replace: true,
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady || submitting}
        onClick={handlePayment}
        data-testid="place-order-button"
        className={className}
      >
        {submitting ? "Processing..." : "Place Order"}
      </Button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </>
  )
}

export default PaymentButton
