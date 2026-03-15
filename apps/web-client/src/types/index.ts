export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: string;
  farmer?: Farmer;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FARMER'
  | 'WAREHOUSE'
  | 'TRANSPORT'
  | 'SELLER'
  | 'CUSTOMER';

export interface Farmer {
  id: string;
  farmName: string;
  region: string;
  district?: string;
  address?: string;
  rating: number;
  ratingCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price: string;
  status: ProductStatus;
  originCountry?: string;
  originRegion?: string;
  harvestDate?: string;
  packagedAt?: string;
  storedAt?: string;
  warehouseName?: string;
  warehouseLocation?: string;
  shelfCode?: string;
  expiresAt?: string;
  qrCode?: string;
  batchNumber?: string;
  imageUrl?: string;
  createdAt: string;
  farmer?: Farmer;
}

export type ProductStatus =
  | 'DRAFT'
  | 'PACKAGED'
  | 'STORED'
  | 'ORDERED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SOLD';

export interface Order {
  id: string;
  orderNumber: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  product?: Product;
  seller?: Partial<User>;
  delivery?: Delivery;
  payment?: Payment;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'UNPAID' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

export interface Delivery {
  id: string;
  status: string;
  pickupAddress?: string;
  deliveryAddress: string;
  pickedUpAt?: string;
  arrivedAt?: string;
  deliveredAt?: string;
}

export interface Payment {
  id: string;
  amount: string;
  status: PaymentStatus;
  lockedAt?: string;
  releasedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  timestamp: string;
}