const API_BASE_URL = 'http://localhost:3000/api';

// Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Product types
export interface Product {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  originalPrice?: number;
  categoryId: {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    slug: string;
  };
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  productCount: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    images: string[];
    price: number;
  };
  name: string;
  nameVi: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  _id: string;
  type: 'credit_card' | 'debit_card' | 'paypal';
  name: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  brand?: string;
  paypalEmail?: string;
}

// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  // Method to update token
  updateToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
      console.log(`API Request to ${endpoint} with token: ${this.token.substring(0, 20)}...`);
    } else {
      console.log(`API Request to ${endpoint} without token`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error for ${endpoint}:`, errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Success for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }
      
      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: any }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }
      
      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      console.error('Admin login API error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }
      
      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ user: any }> {
    try {
      return await this.request<{ user: any }>('/auth/profile');
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  }

  async updateProfile(userData: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<{ message: string; user: any }> {
    try {
      return await this.request<{ message: string; user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Forgot password API error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      console.error('Reset password API error:', error);
      throw error;
    }
  }



  async getOrderById(orderId: string): Promise<Order> {
    try {
      return await this.request<Order>(`/orders/${orderId}`);
    } catch (error) {
      console.error('Get order by ID API error:', error);
      throw error;
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.request<PaymentMethod[]>('/payment-methods');
    } catch (error) {
      console.error('Get payment methods API error:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentData: {
    type: 'credit_card' | 'debit_card' | 'paypal';
    name: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    paypalEmail?: string;
  }): Promise<PaymentMethod> {
    try {
      return await this.request<PaymentMethod>('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Add payment method API error:', error);
      throw error;
    }
  }

  async updatePaymentMethod(id: string, paymentData: {
    type: 'credit_card' | 'debit_card' | 'paypal';
    name: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    paypalEmail?: string;
  }): Promise<PaymentMethod> {
    try {
      return await this.request<PaymentMethod>(`/payment-methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Update payment method API error:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/payment-methods/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete payment method API error:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/payment-methods/${id}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Set default payment method API error:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Product methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[] }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ products: Product[] }>(endpoint);
  }

  async getProduct(id: string): Promise<{ product: Product }> {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  async getFeaturedProducts(limit: number = 6): Promise<{ products: Product[] }> {
    return this.request<{ products: Product[] }>(`/products/featured?limit=${limit}`);
  }

  async searchProducts(query: string, limit: number = 10): Promise<{ products: Product[] }> {
    return this.request<{ products: Product[] }>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Category methods
  async getCategories(params?: {
    isActive?: boolean;
    parentId?: string;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategoryTree(params?: {
    isActive?: boolean;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories/tree${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategoryBySlug(slug: string): Promise<{ category: Category }> {
    return this.request<{ category: Category }>(`/categories/slug/${slug}`);
  }

  async getCategoryWithProducts(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    category: Category;
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories/${id}/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Order methods
  async getUserOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<Order>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/orders/my-orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Order>>(endpoint);
  }

  async getUserOrder(id: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/my-orders/${id}`);
  }

  async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    billingAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    paymentMethod: string;
    notes?: string;
  }): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(id: string): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Admin Dashboard methods
  async getAdminStats(): Promise<{
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalRevenue: number;
    ordersTrend: number;
    productsTrend: number;
    usersTrend: number;
    revenueTrend: number;
  }> {
    return this.request('/admin/stats');
  }

  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginationResponse<Order>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Order>>(endpoint);
  }

  async getAdminProducts(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginationResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Product>>(endpoint);
  }

  async createProduct(productData: any): Promise<{ message: string; product: Product }> {
    return this.request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<{ message: string; product: Product }> {
    return this.request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminCategories(params?: {
    isActive?: boolean;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/categories${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ categories: Category[] }>(endpoint);
  }

  async createCategory(categoryData: any): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginationResponse<User>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<User>>(endpoint);
  }

  async createUser(userData: any): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Wishlist methods
  async getWishlist(): Promise<Product[]> {
    return this.request<Product[]>('/wishlist');
  }

  async addToWishlist(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/wishlist', {
      method: 'DELETE',
    });
  }

  // Cart methods
  async getCart(): Promise<{ items: any[]; total: number }> {
    return this.request<{ items: any[]; total: number }>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<{ message: string }> {
    return this.request<{ message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<{ message: string }> {
    return this.request('/cart/clear', { method: 'DELETE' });
  }

  // Dashboard Analytics
  async getRevenueData(): Promise<Array<{
    month: string;
    revenue: number;
    orders: number;
  }>> {
    return this.request('/admin/revenue-data');
  }

  async getProductStats(): Promise<Array<{
    category: string;
    count: number;
    revenue: number;
  }>> {
    return this.request('/admin/product-stats');
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL); 