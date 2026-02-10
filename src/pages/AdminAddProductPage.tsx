import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ===== النوع الداخلي بدلاً من استيراد خارجي =====
type ProductInsert = {
  name: string;
  price: number;
  discount_price?: number | null;
  image_url?: string | null;
  description?: string | null;
  category: string;
  sub_category?: string | null;
  is_offer: boolean;
};

// الأقسام والفئات الفرعية
const categoryOptions: Record<string, { title: string; subs?: string[] }> = {
  "mens-bags": { title: "Men's Bags", subs: ["Backpacks", "Handbags", "Crossbody Bags"] },
  "womens-bags": { title: "Women's Bags", subs: ["Backpacks", "Shoulder Bags"] },
  wallets: { title: "Wallets" },
  offers: { title: "Special Offers" },
};

export default function AdminAddProductPage() {
  const [form, setForm] = useState<ProductInsert>({
    name: "",
    price: 0,
    discount_price: 0,
    image_url: "",
    description: "",
    category: "mens-bags",
    sub_category: "",
    is_offer: false,
  });

  const [subOptions, setSubOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // تحديث الفئات الفرعية عند تغيير القسم
  useEffect(() => {
    const subs = categoryOptions[form.category]?.subs || [];
    setSubOptions(subs);
    setForm(f => ({ ...f, sub_category: subs[0] || "" }));
  }, [form.category]);

  const handleAddProduct = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    setSubmitting(true);

    try {
      const payload: ProductInsert = {
        ...form,
        price: Number(form.price),
        discount_price: Number(form.discount_price),
        is_offer: form.is_offer,
      };

      // ✅ الطريقة الصحيحة بدون Type Argument في .from()
      const { data, error } = await supabase
        .from("products")
        .insert([payload] as ProductInsert[]) // نفرض النوع هنا على الفورم
        .select()
        .single();

      if (error) throw error;

      toast.success("Product added successfully!");

      // إعادة تعيين الفورم
      setForm({
        name: "",
        price: 0,
        discount_price: 0,
        image_url: "",
        description: "",
        category: form.category,
        sub_category: subOptions[0] || "",
        is_offer: false,
      });
    } catch (err: any) {
      console.log(err);
      toast.error(err.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <div className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div>
          <Label>Price</Label>
          <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
        </div>

        <div>
          <Label>Discount Price</Label>
          <Input
            type="number"
            value={form.discount_price}
            onChange={e => setForm(f => ({ ...f, discount_price: Number(e.target.value) }))}
          />
        </div>

        <div>
          <Label>Image URL</Label>
          <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        </div>

        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {/* Dropdown للقسم */}
        <div>
          <Label>Category</Label>
          <select
            className="w-full border rounded p-2"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {Object.keys(categoryOptions).map(key => (
              <option key={key} value={key}>
                {categoryOptions[key].title}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown للفئة الفرعية */}
        {subOptions.length > 0 && (
          <div>
            <Label>Sub Category</Label>
            <select
              className="w-full border rounded p-2"
              value={form.sub_category}
              onChange={e => setForm(f => ({ ...f, sub_category: e.target.value }))}
            >
              {subOptions.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Checkbox للعرض */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_offer}
            onChange={e => setForm(f => ({ ...f, is_offer: e.target.checked }))}
          />
          <Label>Is Offer</Label>
        </div>

        <Button onClick={handleAddProduct} disabled={submitting}>
          {submitting ? "Adding..." : "Add Product"}
        </Button>
      </div>
    </div>
  );
}
