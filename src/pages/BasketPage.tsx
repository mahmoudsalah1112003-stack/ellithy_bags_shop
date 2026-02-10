import { useBasket } from "@/contexts/BasketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Minus, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const BasketPage = () => {
  const { items, removeItem, updateQuantity, clearBasket, totalPrice } = useBasket();
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!form.name || !form.address || !form.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    if (items.length === 0) {
      toast.error("Your basket is empty");
      return;
    }

    setSubmitting(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: form.name,
        customer_address: form.address,
        customer_phone: form.phone,
        total_amount: totalPrice,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error("Failed to place order");
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      quantity: i.quantity,
      price_at_purchase: i.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    toast.success("Order placed successfully!");
    clearBasket();
    setForm({ name: "", address: "", phone: "" });
    setSubmitting(false);
  };

  return (
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Your Basket</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">Your basket is empty.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 border rounded-lg p-4">
              <div className="h-16 w-16 rounded bg-secondary overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-primary">{item.price.toFixed(2)} EGP</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{totalPrice.toFixed(2)} EGP</span>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">Delivery Details</h3>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Delivery address" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
            </div>
          </div>
          <Button onClick={handlePlaceOrder} disabled={submitting} size="lg" className="w-full gap-2">
            <Check className="h-4 w-4" /> {submitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      )}
    </main>
  );
};

export default BasketPage;
