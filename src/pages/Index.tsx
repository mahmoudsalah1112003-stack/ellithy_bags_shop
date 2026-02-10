import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { title: "Men's Bags", to: "/category/mens-bags", desc: "Backpacks, Handbags & Crossbody" },
  { title: "Women's Bags", to: "/category/womens-bags", desc: "Backpacks & Shoulder Bags" },
  { title: "Wallets", to: "/category/wallets", desc: "Premium leather wallets" },
  { title: "Special Offers", to: "/category/offers", desc: "Hot deals & discounts" },
];

const Index = () => {
  const { data: offerProducts } = useQuery({
    queryKey: ["products", "offers-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_offer", true)
        .limit(4);
      return data ?? [];
    },
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-4">ELLITHY</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8">
            Premium bags & wallets crafted for elegance
          </p>
          <Link to="/category/mens-bags">
            <Button size="lg" className="gap-2">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.to}
              to={cat.to}
              className="group rounded-lg border border-border bg-card p-8 text-center hover:border-primary/40 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Offers */}
      {offerProducts && offerProducts.length > 0 && (
        <section className="container pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Special Offers</h2>
            <Link to="/category/offers" className="text-primary text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {offerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
