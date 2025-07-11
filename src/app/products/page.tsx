"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { GetProductsParams, Product } from "@/types/product";
import ProductTable from "./components/ProductTable";
import ProductFormModal from "./components/ProductFormModal";
import "./components/ProductManagement.css";
import NoSSR from "@/components/NoSSR";

// Import Bootstrap và Font Awesome trong component
const BootstrapImports = () => {
  useEffect(() => {
    // Import Bootstrap CSS
    import("bootstrap/dist/css/bootstrap.min.css");
    // Import Font Awesome
    const linkFA = document.createElement("link");
    linkFA.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    // Import Bootstrap JS
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    return () => {
      document.head.removeChild(linkFA);
    };
  }, []);

  return null;
};

export default function ProductsPage() {
  const {
    products,
    categories,
    inventoryMethods,
    loading,
    currentPage,
    setCurrentPage,
    fetchProducts,
    fetchCategories,
    fetchInventoryMethods,
  } = useProductStore();

  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    // Fetch initial data with pagination
    fetchProducts({ page: currentPage });
    fetchCategories();
    fetchInventoryMethods();
  }, [fetchProducts, fetchCategories, fetchInventoryMethods, currentPage]);

  const handleAddProduct = () => {
    setEditingProductId(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const resetFilters = () => {
    setCategoryFilter("");
    setInventoryFilter("");
    setSearchInput("");
    setCurrentPage(1);
    fetchProducts({ page: 1 });
  };

  const applyFilters = () => {
    const params: GetProductsParams = {
      page: 1,
    };

    if (categoryFilter) params.categoryId = categoryFilter;
    if (inventoryFilter) params.inventoryType = inventoryFilter;
    if (searchInput.trim()) params.search = searchInput.trim();

    setCurrentPage(1);
    fetchProducts(params);
  };

  // Calculate total pages based on whether we have a full page of products
  const hasMorePages = products.length === 10; // If we have exactly 10 products, there might be more
  const totalPages = hasMorePages ? currentPage + 1 : currentPage;

  return (
    <NoSSR>
      <BootstrapImports />
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>
                <i className="fas fa-box me-2"></i> Product Management
              </h2>
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-add-product"
                  onClick={handleAddProduct}
                >
                  <i className="fas fa-plus me-1"></i>{" "}
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Filter Card */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Filter Options</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label htmlFor="categoryFilter" className="form-label">
                        Category
                      </label>
                      <select
                        className="form-select"
                        id="categoryFilter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label htmlFor="inventoryFilter" className="form-label">
                        Inventory Type
                      </label>
                      <select
                        className="form-select"
                        id="inventoryFilter"
                        value={inventoryFilter}
                        onChange={(e) => setInventoryFilter(e.target.value)}
                      >
                        <option value="">All Types</option>
                        {inventoryMethods.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label htmlFor="searchInput" className="form-label">
                        Search
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="searchInput"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-undo me-1"></i> Reset
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={applyFilters}
                  >
                    <i className="fas fa-search me-1"></i> Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Product Table Card */}
            <div className="card">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading products...</p>
                  </div>
                ) : (
                  <ProductTable
                    products={products}
                    onEditProduct={handleEditProduct}
                    categoryFilter={categoryFilter}
                    inventoryFilter={inventoryFilter}
                    searchInput={searchInput}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalPages={totalPages}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Modal */}
        {showModal && (
          <ProductFormModal
            productId={editingProductId || undefined}
            onClose={() => setShowModal(false)}
            isEdit={!!editingProductId}
          />
        )}
      </div>
    </NoSSR>
  );
}
