export interface Product {
  id: string;
  name: string;
  nameVi: string;
  nameJa: string;
  description: string;
  descriptionVi: string;
  descriptionJa: string;
  price: number;
  image: string;
  category: 'tops' | 'bottoms' | 'accessories' | 'kimono' | 'yukata' | 'hakama';
  colors: string[];
  sizes: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}