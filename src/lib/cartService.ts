import { Product } from './api';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

class CartService {
  private readonly CART_KEY = 'koshiro_cart';

  // Get cart from localStorage
  getCart(): CartItem[] {
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  }

  // Save cart to localStorage
  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: string): CartItem[] {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(item => 
      item.productId === product._id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        productId: product._id,
        product,
        quantity,
        selectedSize,
        selectedColor
      });
    }

    this.saveCart(cart);
    return cart;
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number, selectedSize?: string, selectedColor?: string): CartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => 
      item.productId === productId && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }

    return cart;
  }

  // Remove item from cart
  removeFromCart(productId: string, selectedSize?: string, selectedColor?: string): CartItem[] {
    const cart = this.getCart();
    const filteredCart = cart.filter(item => 
      !(item.productId === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor)
    );
    
    this.saveCart(filteredCart);
    return filteredCart;
  }

  // Clear cart
  clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
  }

  // Get cart total
  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Get cart item count
  getCartItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  // Check if product is in cart
  isInCart(productId: string, selectedSize?: string, selectedColor?: string): boolean {
    const cart = this.getCart();
    return cart.some(item => 
      item.productId === productId && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );
  }

  // Get item from cart
  getCartItem(productId: string, selectedSize?: string, selectedColor?: string): CartItem | null {
    const cart = this.getCart();
    return cart.find(item => 
      item.productId === productId && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    ) || null;
  }
}

export const cartService = new CartService(); 