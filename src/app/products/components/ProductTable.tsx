"use client";

import { useProductStore } from "@/store/useProductStore";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  categoryFilter: string;
  inventoryFilter: string;
  searchInput: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export default function ProductTable({
  products,
  onEditProduct,
  currentPage,
  onPageChange,
  totalPages,
}: ProductTableProps) {
  const { deleteProduct } = useProductStore();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error deleting product";
        window.alert(message);
      }
    }
  };

  const getInventoryBadge = (inventoryType: number) => {
    switch (inventoryType) {
      case 1:
        return <span className="inventory-badge bg-fifo">FIFO</span>;
      case 2:
        return <span className="inventory-badge bg-wac">WAC</span>;
      case 3:
        return <span className="inventory-badge bg-wac">No Tracking</span>;
      default:
        return <span className="inventory-badge bg-secondary">Unknown</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      })
    );
  };

  if (products.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <i className="fas fa-box-open fa-3x mb-3"></i>
        <h5>No products found</h5>
        <p>
          No products match your current filters or no products have been
          created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Inventory</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.sku || product.id}</td>
              <td>
                <div>
                  <div className="fw-bold">{product.name}</div>
                  <div className="text-muted small">
                    {product.description || product.upc || "No description"}
                  </div>
                </div>
              </td>
              <td>{product.category || "Uncategorized"}</td>
              <td>${product.price?.toFixed(2) || "0.00"}</td>
              <td>{getInventoryBadge(Number(product.inventoryType) || 0)}</td>
              <td>{formatDate(product.lastUpdate)}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary btn-action"
                  onClick={() => onEditProduct(product)}
                  title="Edit Product"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info btn-action"
                  title="View Inventory"
                >
                  <i className="fas fa-warehouse"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger btn-action"
                  onClick={() => handleDelete(product.id)}
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => onPageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
