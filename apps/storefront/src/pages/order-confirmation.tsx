import { OrderDetails } from "@/components/order"
import { useLoaderData } from "@tanstack/react-router"

/**
 * Order Confirmation Page Pattern
 *
 * Demonstrates:
 * - useLoaderData for SSR-loaded order
 * - Displaying order after successful checkout
 * - OrderDetails component for order information
 */
const OrderConfirmation = () => {
  const { order } = useLoaderData({
    from: "/$countryCode/order/$orderId/confirmed",
  })

  return (
    <div className="content-container py-6 pt-[80px]">
      <h1 className="font-display text-2xl font-bold text-forest-900 mb-2">Thank you for your order</h1>
      <p className="text-gray-500 mb-6">Order #{order.display_id}</p>
      <OrderDetails order={order} />
    </div>
  )
}

export default OrderConfirmation
