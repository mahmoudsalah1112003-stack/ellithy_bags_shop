import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

const ProductCard = ({ product }: { product: Tables<"products"> }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-border hover:border-primary/40 transition-colors">
        <div className="aspect-square overflow-hidden bg-secondary">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingBagIcon />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-sans text-sm font-medium truncate">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            {product.is_offer && product.discount_price ? (
              <>
                <span className="text-primary font-semibold">{product.discount_price.toFixed(2)} EGP</span>
                <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(2)} EGP</span>
              </>
            ) : (
              <span className="text-primary font-semibold">{product.price.toFixed(2)} EGP</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

export default ProductCard;
