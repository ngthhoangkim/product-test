export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  sku?: string;
  upc?: string;
  inventoryType?: string;
  lastUpdate?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  isTaxableExemption: boolean;
  status: boolean;
  inventoryMethod: number;
  reorderPoint: number;
  reorderQuantity: number;
  costPrice: number;
  sellingPrice: number;
  baseUnit: number;
  units: {
    idUnit: number;
    quantity: number;
    unitPrice: number;
    barcode: string;
  }[];
  taxes: string[]; 
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Thêm các interface mới
export interface Category {
  id: string;
  name: string;
}

export interface InventoryMethod {
  id: string;
  name: string;
}

export interface InventoryType {
  id: string;
  name: string;
}

export interface BaseUnit {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface TaxCategory {
  id: string;
  name: string;
}

// Interface cho query parameters của getProducts
export interface GetProductsParams {
  categoryId?: string;
  inventoryType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductDetail extends Omit<Product, "status"> {
  barcode?: string;
  status?: "active" | "inactive";
  isTaxableExemption?: boolean;
  inventoryMethod?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  costPrice?: number;
  sellingPrice?: number;
  taxCategory?: string;
  baseUnit?: number;
  baseUnitBarcode?: string;
  units?: ProductUnit[];
}

export interface ProductUnit {
  idUnit: number;
  quantity: number;
  barcode?: string;
  unitPrice: number;
}
