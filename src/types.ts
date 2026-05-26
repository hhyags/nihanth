export type ProductCategory = "toys" | "clothes" | "accessories" | "books";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  sparklyIntro?: string; // AI generated fancy summary or catchy punchline
  ageGroup: string;
  features: string[];
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: string;
  shippingAddress: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface APILog {
  id: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  requestBody?: any;
  responseBody?: any;
}

export interface APIPlaygroundRoute {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  payloadTemplate?: string;
  category: "auth" | "products" | "cart" | "orders" | "admin" | "reviews" | "ai";
}
