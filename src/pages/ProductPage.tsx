import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBasket } from "@/contexts/BasketContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useBasket();
  const [orderForm, setOrderForm] = useState({ name: "", address: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const handleAddToBasket = () => {
    if (!product) return;
    const price = product.is_offer && product.discount_price ? product.discount_price : product.price;
    addItem({ productId: product.id, name: product.name, price, image_url: product.image_url });
    toast.success("Added to basket!");
  };

  const handleQuickOrder = async () => {
    if (!product) return;
    if (!orderForm.name || !orderForm.address || !orderForm.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const price = product.is_offer && product.discount_price ? product.discount_price : product.price;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ customer_name: orderForm.name, customer_address: orderForm.address, customer_phone: orderForm.phone, total_amount: price })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Failed to place order");
      setSubmitting(false);
      return;
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      price_at_purchase: price,
    });

    toast.success("Order placed successfully!");
    setOrderForm({ name: "", address: "", phone: "" });
    setSubmitting(false);
  };

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!product) return <div className="container py-20 text-center text-muted-foreground">Product not found</div>;

  const displayPrice = product.is_offer && product.discount_price ? product.discount_price : product.price;

  return (
    <main className="container py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
              {product.category} {product.sub_category ? `/ ${product.sub_category}` : ""}
            </p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{displayPrice.toFixed(2)} EGP</span>
            {product.is_offer && product.discount_price && (
              <span className="text-lg text-muted-foreground line-through">{product.price.toFixed(2)} EGP</span>
            )}
          </div>

          {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

          <Button onClick={handleAddToBasket} size="lg" className="gap-2 w-full md:w-auto">
            <ShoppingBag className="h-4 w-4" /> Add to Basket
          </Button>

          {/* Quick Order */}
          <div className="border rounded-lg p-6 space-y-4 mt-4">
            <h3 className="font-semibold text-lg">Quick Order</h3>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={orderForm.name} onChange={(e) => setOrderForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={orderForm.address} onChange={(e) => setOrderForm((f) => ({ ...f, address: e.target.value }))} placeholder="Delivery address" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={orderForm.phone} onChange={(e) => setOrderForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
              </div>
            </div>
            <Button onClick={handleQuickOrder} disabled={submitting} className="w-full gap-2">
              <Check className="h-4 w-4" /> {submitting ? "Placing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
