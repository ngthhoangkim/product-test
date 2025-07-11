import axios from "axios";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
  InventoryMethod,
  InventoryType,
  BaseUnit,
  Unit,
  TaxCategory,
  GetProductsParams,
} from "@/types/product";

// Cấu hình cơ bản từ environment variables
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // Sử dụng proxy path trong production
    : process.env.NEXT_PUBLIC_API_BASE_URL; // Sử dụng direct URL trong development
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;

// Tạo Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor để log requests (development)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để handle responses và errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("Response error:", error.response?.data || error.message);
    } else {
      console.error("Unknown error:", error);
    }
    return Promise.reject(error);
  }
);

// API functions cho products
export const productApi = {
  // Lấy danh sách sản phẩm với query parameters
  getProducts: async (params?: GetProductsParams): Promise<Product[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.categoryId)
        queryParams.append("categoryId", params.categoryId);
      if (params?.inventoryType)
        queryParams.append("inventoryType", params.inventoryType);
      if (params?.search) queryParams.append("search", params.search);

      const queryString = queryParams.toString();
      const url = `/products-test/${STORE_ID}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get(url);

      // Handle various possible shapes of response for flexibility
      const raw = response.data;
      let products: Product[] | undefined;

      if (Array.isArray(raw)) {
        // API directly returns an array
        products = raw;
      } else if (Array.isArray(raw?.data)) {
        // Wrapped in { data: [...] }
        products = raw.data;
      } else if (Array.isArray(raw?.products)) {
        // Wrapped in { products: [...] }
        products = raw.products;
      }

      if (!products) {
        // Unexpected shape – log full payload for debugging
        console.error("[API FORMAT] getProducts unexpected payload", raw);
        throw new Error("Định dạng dữ liệu sản phẩm không hợp lệ từ API");
      }

      return products;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách sản phẩm: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải sản phẩm");
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    try {
      const response = await apiClient.post(
        `/products-test/${STORE_ID}`,
        product
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tạo sản phẩm: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tạo sản phẩm");
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (product: UpdateProductRequest): Promise<Product> => {
    try {
      // Loại bỏ id khỏi request body vì API không cho phép
      const { id, ...productData } = product;
      const response = await apiClient.put(`/products-test/${id}`, productData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể cập nhật sản phẩm: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi cập nhật sản phẩm");
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      await apiClient.delete(`/products-test/${productId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể xóa sản phẩm: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi xóa sản phẩm");
    }
  },

  // Lấy chi tiết sản phẩm
  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await apiClient.get(
        `/products-test/detail/${productId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải thông tin sản phẩm: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải sản phẩm");
    }
  },

  // Lấy danh sách categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get(
        `/products-test/${STORE_ID}/categories`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách danh mục: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải danh mục");
    }
  },

  // Lấy danh sách inventory methods
  getInventoryMethods: async (): Promise<InventoryMethod[]> => {
    try {
      const response = await apiClient.get("/products-test/inventory-method");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(
          `Không thể tải danh sách phương pháp kiểm kê: ${message}`
        );
      }
      throw new Error(
        "Đã xảy ra lỗi không xác định khi tải phương pháp kiểm kê"
      );
    }
  },

  // Lấy danh sách inventory types
  getInventoryTypes: async (): Promise<InventoryType[]> => {
    try {
      const response = await apiClient.get("/products-test/inventory-type");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách loại kiểm kê: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải loại kiểm kê");
    }
  },

  // Lấy danh sách base units
  getBaseUnits: async (): Promise<BaseUnit[]> => {
    try {
      const response = await apiClient.get("/products-test/base-unit");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách đơn vị cơ bản: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải đơn vị cơ bản");
    }
  },

  // Lấy danh sách units
  getUnits: async (): Promise<Unit[]> => {
    try {
      const response = await apiClient.get("/products-test/unit");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách đơn vị: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải đơn vị");
    }
  },

  // Lấy danh sách tax categories
  getTaxCategories: async (): Promise<TaxCategory[]> => {
    try {
      const response = await apiClient.get(`/products-test/${STORE_ID}/taxes`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Không thể tải danh sách danh mục thuế: ${message}`);
      }
      throw new Error("Đã xảy ra lỗi không xác định khi tải danh mục thuế");
    }
  },
};
