const API_BASE_URL = 'http://localhost:3000/api';

// Types
export interface ApiResponse<T = unknown> {
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
  user: User;
}

// Product types
export interface ProductVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number;
}

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
  salePrice?: number;
  categoryId: string | {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    slug: string;
  };
  images: string[];
  videos?: ProductVideo[];
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
  productId?: {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    images: string[];
    price: number;
  } | null;
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
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  isActive: boolean;
  totalOrders: number;
  orderCount: number;
  totalSpent: number;
  lastActive?: string;
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
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
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

export interface Address {
  _id: string;
  type: 'shipping' | 'billing';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Review types
export interface Review {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  productId?: {
    _id: string;
    name: string;
  } | null;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId?: string;
  userId?: string; // Allow admin to specify userId when creating review
  rating: number;
  title: string;
  comment: string;
}

// Settings types
export interface Settings {
  _id: string;
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'user' | 'product' | 'order' | 'system' | 'security' | 'data';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
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
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/login', {
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
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/admin/login', {
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
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
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

  async getProfile(): Promise<{ user: User }> {
    try {
      return await this.request<{ user: User }>('/auth/profile');
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  }

  async updateProfile(userData: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<{ message: string; user: User }> {
    try {
      return await this.request<{ message: string; user: User }>('/auth/profile', {
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
    return this.request<Order>(`/orders/${orderId}`);
  }

  async trackOrder(orderNumber: string): Promise<Order> {
    return this.request<Order>(`/orders/track/${orderNumber}`);
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

  // Address methods
  async getUserAddresses(): Promise<{ addresses: Address[] }> {
    try {
      return await this.request<{ addresses: Address[] }>('/auth/addresses');
    } catch (error) {
      console.error('Get addresses API error:', error);
      throw error;
    }
  }

  async addAddress(addressData: {
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<{ message: string; address: Address }> {
    try {
      return await this.request<{ message: string; address: Address }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      console.error('Add address API error:', error);
      throw error;
    }
  }

  async updateAddress(id: string, addressData: {
    type?: 'shipping' | 'billing';
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<{ message: string; address: Address }> {
    try {
      return await this.request<{ message: string; address: Address }>(`/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      console.error('Update address API error:', error);
      throw error;
    }
  }

  async deleteAddress(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete address API error:', error);
      throw error;
    }
  }

  async setDefaultAddress(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/auth/addresses/${id}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Set default address API error:', error);
      throw error;
    }
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

  async cancelOrderAdmin(id: string): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async updateOrder(id: string, orderData: {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'failed';
    paymentMethod?: string;
    notes?: string;
    trackingNumber?: string;
    shippingAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
  }): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
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

  async createProduct(productData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    price: number;
    originalPrice?: number;
    categoryId: string;
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
    isActive?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    tags?: string[];
  }): Promise<{ message: string; product: Product }> {
    return this.request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    price?: number;
    originalPrice?: number;
    categoryId?: string;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    stock?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    tags?: string[];
  }): Promise<{ message: string; product: Product }> {
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

  async createCategory(categoryData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    slug: string;
    image?: string;
    isActive?: boolean;
    parentId?: string;
  }): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    slug?: string;
    image?: string;
    isActive?: boolean;
    parentId?: string;
  }): Promise<{ message: string; category: Category }> {
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

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: 'customer' | 'admin';
    status?: 'active' | 'inactive' | 'blocked';
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: 'customer' | 'admin';
    status?: 'active' | 'inactive' | 'blocked';
  }): Promise<{ message: string; user: User }> {
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
  async getCart(): Promise<{ items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    product: Product;
  }>; total: number }> {
    return this.request<{ items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
      product: Product;
    }>; total: number }>('/cart');
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
    return this.request('/cart', { method: 'DELETE' });
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
    return this.request<Array<{
      category: string;
      count: number;
      revenue: number;
    }>>('/admin/product-stats');
  }

  // Review methods
  async getReviews(params?: {
    page?: number;
    limit?: number;
    productId?: string;
  }): Promise<{ reviews: Review[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.productId) searchParams.append('productId', params.productId);
    
    return this.request<{ reviews: Review[]; total: number }>(`/reviews?${searchParams.toString()}`);
  }

  async createReview(reviewData: CreateReviewRequest): Promise<{ message: string; review: Review }> {
    return this.request<{ message: string; review: Review }>('/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
  }

  async markReviewHelpful(reviewId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async updateReview(reviewId: string, updateData: Partial<CreateReviewRequest & { verified: boolean }>): Promise<{ message: string; review: Review }> {
    return this.request<{ message: string; review: Review }>(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
  }

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/settings');
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    return this.request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Activity Log APIs
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    severity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginationResponse<ActivityLog>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    return this.request<PaginationResponse<ActivityLog>>(`/admin/activity-logs?${searchParams}`);
  }

  async clearActivityLogs(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/admin/activity-logs', {
      method: 'DELETE',
    });
  }

  // Export/Import APIs
  async exportData(type: string, format: string): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/admin/export/${type}`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async importData(type: string, file: File): Promise<{ message: string; importedCount: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ message: string; importedCount: number }>(`/admin/import/${type}`, {
      method: 'POST',
      body: formData,
    });
  }

  // Enhanced User Management APIs
  async getUserById(id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/admin/users/${id}`);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'blocked'): Promise<{ message: string; updatedCount: number }> {
    return this.request<{ message: string; updatedCount: number }>('/admin/users/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ userIds, status }),
    });
  }

  // Enhanced Order Management APIs
  async updateOrderStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'): Promise<{ message: string; updatedCount: number }> {
    return this.request<{ message: string; updatedCount: number }>('/admin/orders/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ orderIds, status }),
    });
  }

  async getOrderDetails(id: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/admin/orders/${id}`);
  }

  async printOrder(id: string): Promise<{ printUrl: string }> {
    return this.request<{ printUrl: string }>(`/admin/orders/${id}/print`, {
      method: 'POST',
    });
  }

  async sendOrderEmail(id: string, emailType: 'confirmation' | 'shipping' | 'delivery'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/orders/${id}/email`, {
      method: 'POST',
      body: JSON.stringify({ emailType }),
    });
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics APIs
  async getAnalyticsData(params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    revenue: {
      total: number;
      trend: number;
      byPeriod: Array<{ period: string; amount: number }>;
    };
    orders: {
      total: number;
      trend: number;
      byStatus: Record<string, number>;
      byPeriod: Array<{ period: string; count: number }>;
    };
    customers: {
      total: number;
      new: number;
      active: number;
      byPeriod: Array<{ period: string; count: number }>;
    };
    products: {
      total: number;
      active: number;
      lowStock: number;
      topSelling: Array<{ product: Product; sales: number }>;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    return this.request(`/admin/analytics?${searchParams}`);
  }

  // Comprehensive Analytics APIs
  async getOrderAnalytics(): Promise<{
    byStatus: Array<{ status: string; count: number; percentage: number }>;
    byHour: Array<{ hour: string; orders: number }>;
    byMonth: Array<{ month: string; orders: number; revenue: number }>;
  }> {
    return this.request('/admin/analytics/orders');
  }

  async getCustomerAnalytics(): Promise<{
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
    byLocation: Array<{ location: string; customers: number; revenue: number }>;
    activity: Array<{ date: string; newCustomers: number; activeCustomers: number }>;
  }> {
    return this.request('/admin/analytics/customers');
  }

  async getSalesAnalytics(): Promise<{
    byPaymentMethod: Array<{ method: string; count: number; amount: number }>;
    conversionRate: number;
    cartAbandonment: number;
    averageOrderValue: number;
  }> {
    return this.request('/admin/analytics/sales');
  }

  async getProductAnalytics(): Promise<{
    topSelling: Array<{ name: string; sales: number; revenue: number; stock: number }>;
    performance: Array<{ name: string; views: number; sales: number; rating: number }>;
    lowStock: Array<{ name: string; stock: number; category: string }>;
  }> {
    return this.request('/admin/analytics/products');
  }

  async getDailyRevenueData(days: number = 30): Promise<Array<{ date: string; revenue: number; orders: number }>> {
    return this.request(`/admin/analytics/daily-revenue?days=${days}`);
  }

  // Reports APIs
  async generateReport(type: 'sales' | 'customers' | 'inventory' | 'performance', params?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, ...params }),
    });
  }

  // Notification APIs
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<PaginationResponse<Notification> & { unreadCount: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.read !== undefined) searchParams.append('read', params.read.toString());

    return this.request<PaginationResponse<Notification> & { unreadCount: number }>(`/notifications?${searchParams}`);
  }

  async markNotificationAsRead(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL); 