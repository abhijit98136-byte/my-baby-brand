import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package } from "lucide-react";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  return (
    <div className="pt-32 pb-20 min-h-screen" data-testid="order-success-page">
      <div className="max-w-xl mx-auto text-center px-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-mintgreen flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-ink" />
        </div>
        <h1 className="font-heading text-4xl font-medium">Thank you!</h1>
        <p className="text-inkmuted mt-3">Your order has been placed successfully. A confirmation has been sent to your email.</p>
        <div className="glass-card rounded-3xl p-6 mt-8">
          <p className="text-sm text-inkmuted">Order Number</p>
          <p className="font-heading text-2xl font-semibold mt-1">{orderNumber}</p>
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to={`/track/${orderNumber}`} className="btn-pill btn-primary"><Package className="w-4 h-4" /> Track Order</Link>
          <Link to="/shop" className="btn-pill btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
