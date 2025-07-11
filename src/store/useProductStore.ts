import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
  InventoryMethod,
  GetProductsParams,
} from "@/types/product";
import { productApi } from "@/lib/api";

interface ProductStore {
  // State
  products: Product[];
  categories: Category[];
  inventoryMethods: InventoryMethod[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;

  // Actions
  fetchProducts: (params?: GetProductsParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchInventoryMethods: () => Promise<void>;
  createProduct: (product: CreateProductRequest) => Promise<void>;
  updateProduct: (product: UpdateProductRequest) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      products: [],
      categories: [],
      inventoryMethods: [],
      loading: false,
      error: null,
      totalProducts: 0,
      currentPage: 1,

      // Actions
      setCurrentPage: (page: number) => set({ currentPage: page }),

      fetchProducts: async (params?: GetProductsParams) => {
        try {
          set({ loading: true, error: null });
          const defaultParams = {
            page: params?.page || 1,
            limit: 10,
          };
          const response = await productApi.getProducts({
            ...defaultParams,
            ...params,
          });

          if (response && Array.isArray(response)) {
            set({
              products: response,
              loading: false,
              totalProducts: response.length,
            });
          } else {
            set({
              error: "Invalid response format",
              loading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      fetchCategories: async () => {
        try {
          const categories = await productApi.getCategories();
          set({ categories });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách danh mục";
          console.error("Lỗi khi tải danh mục:", errorMessage);
        }
      },

      fetchInventoryMethods: async () => {
        try {
          const methods = await productApi.getInventoryMethods();
          set({ inventoryMethods: methods });
        } catch (error) {
          console.error("Error fetching inventory methods:", error);
        }
      },

      createProduct: async (productData: CreateProductRequest) => {
        try {
          set({ loading: true, error: null });
          const newProduct = await productApi.createProduct(productData);
          const currentProducts = get().products;
          set({
            products: [...currentProducts, newProduct],
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Không thể tạo sản phẩm mới";
          set({ error: errorMessage, loading: false });
          console.error("Lỗi khi tạo sản phẩm:", error);
          throw error; // Re-throw để component có thể handle
        }
      },

      updateProduct: async (productData: UpdateProductRequest) => {
        try {
          set({ loading: true, error: null });
          const updatedProduct = await productApi.updateProduct(productData);
          const currentProducts = get().products;
          const updatedProducts = currentProducts.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          );
          set({
            products: updatedProducts,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Không thể cập nhật sản phẩm";
          set({ error: errorMessage, loading: false });
          console.error("Lỗi khi cập nhật sản phẩm:", error);
          throw error; // Re-throw để component có thể handle
        }
      },

      deleteProduct: async (productId: string) => {
        try {
          set({ loading: true, error: null });
          await productApi.deleteProduct(productId);
          const currentProducts = get().products;
          const filteredProducts = currentProducts.filter(
            (product) => product.id !== productId
          );
          set({
            products: filteredProducts,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Không thể xóa sản phẩm";
          set({ error: errorMessage, loading: false });
          console.error("Lỗi khi xóa sản phẩm:", error);
          throw error; // Re-throw để component có thể handle
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: "product-store",
    }
  )
);
