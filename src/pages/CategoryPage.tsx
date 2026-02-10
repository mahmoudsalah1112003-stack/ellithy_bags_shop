import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categoryConfig: Record<string, { title: string; category: string; subs?: string[] }> = {
  "mens-bags": { title: "Men's Bags", category: "mens-bags", subs: ["Backpacks", "Handbags", "Crossbody Bags"] },
  "womens-bags": { title: "Women's Bags", category: "womens-bags", subs: ["Backpacks", "Shoulder Bags"] },
  wallets: { title: "Wallets", category: "wallets" },
  offers: { title: "Special Offers", category: "offers" },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const config = categoryConfig[slug ?? ""];
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", slug, activeSub],
    queryFn: async () => {
      let query = supabase.from("products").select("*");

      if (slug === "offers") {
        query = query.eq("is_offer", true);
      } else if (config) {
        query = query.eq("category", config.category);
      }

      if (activeSub) {
        query = query.eq("sub_category", activeSub);
      }

      const { data } = await query.order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!config,
  });

  if (!config) {
    return <div className="container py-20 text-center text-muted-foreground">Category not found</div>;
  }

  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold mb-2">{config.title}</h1>

      {config.subs && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={activeSub === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveSub(null)}
          >
            All
          </Button>
          {config.subs.map((sub) => (
            <Button
              key={sub}
              variant={activeSub === sub ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveSub(sub)}
            >
              {sub}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-20">No products found in this category.</p>
      )}
    </main>
  );
};

export default CategoryPage;
