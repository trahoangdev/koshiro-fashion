import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  currentLanguage: string;
  onAddToCart: (product: Product) => void;
}

export const ProductGrid = ({ products, currentLanguage, onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currentLanguage={currentLanguage}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};