"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { productApi } from "@/lib/api";
import {
  Category,
  BaseUnit,
  Unit,
  InventoryMethod,
  TaxCategory,
  ProductDetail,
  ProductUnit,
} from "@/types/product";

interface ProductFormModalProps {
  productId?: string;
  onClose: () => void;
  isEdit?: boolean;
}

interface AdditionalUnit {
  id: string;
  idUnit: string;
  quantity: number;
  barcode: string;
  unitPrice: number;
}

export default function ProductFormModal({
  productId,
  onClose,
  isEdit = false,
}: ProductFormModalProps) {
  const { createProduct, updateProduct } = useProductStore();

  // Product detail state
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );

  // API data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [baseUnits, setBaseUnits] = useState<BaseUnit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [inventoryMethods, setInventoryMethods] = useState<InventoryMethod[]>(
    []
  );
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    productSKU: "",
    productUPC: "",
    productCategory: "",
    productActive: true,
    productTaxable: true,
    inventoryMethod: "",
    reorderPoint: 0,
    reorderQuantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    taxCategory: "",
    baseUnitName: "",
    baseUnitBarcode: "",
  });

  const [additionalUnits, setAdditionalUnits] = useState<AdditionalUnit[]>([
    {
      id: "1",
      idUnit: "",
      quantity: 0,
      barcode: "",
      unitPrice: 0,
    },
  ]);

  // Track which fields are invalid for client-side validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Fetch API data on component mount
  useEffect(() => {
    // Fetch API data on component mount
    const fetchData = async () => {
      try {
        const [
          categoriesData,
          baseUnitsData,
          unitsData,
          inventoryMethodsData,
          taxCategoriesData,
        ] = await Promise.all([
          productApi.getCategories(),
          productApi.getBaseUnits(),
          productApi.getUnits(),
          productApi.getInventoryMethods(),
          productApi.getTaxCategories(),
        ]);
        setCategories(categoriesData);
        setBaseUnits(baseUnitsData);
        setUnits(unitsData);
        setInventoryMethods(inventoryMethodsData);
        setTaxCategories(taxCategoriesData);

        // Prevent background scrolling
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Fetch product detail when editing
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (isEdit && productId) {
        try {
          const detail = await productApi.getProduct(productId);
          setProductDetail(detail);
        } catch (error) {
          console.error("Error fetching product detail:", error);
        }
      }
    };

    fetchProductDetail();
  }, [isEdit, productId]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && productDetail) {
      setFormData({
        productName: productDetail.name || "",
        productSKU: productDetail.sku || "",
        productUPC: productDetail.barcode || "",
        productCategory: productDetail.category || "",
        productActive: productDetail.status === "active",
        productTaxable: productDetail.isTaxableExemption !== false,
        inventoryMethod: productDetail.inventoryMethod?.toString() || "",
        reorderPoint: productDetail.reorderPoint || 0,
        reorderQuantity: productDetail.reorderQuantity || 0,
        costPrice: productDetail.costPrice || 0,
        sellingPrice: productDetail.sellingPrice || 0,
        taxCategory: productDetail.taxCategory || "",
        baseUnitName: productDetail.baseUnit?.toString() || "",
        baseUnitBarcode: productDetail.baseUnitBarcode || "",
      });

      // Populate additional units if available
      if (productDetail?.units && Array.isArray(productDetail.units)) {
        const mappedUnits = productDetail.units.map(
          (unit: ProductUnit, index: number) => ({
            id: (index + 1).toString(),
            idUnit: unit.idUnit?.toString() || "",
            quantity: unit.quantity || 0,
            barcode: unit.barcode || "",
            unitPrice: unit.unitPrice || 0,
          })
        );
        setAdditionalUnits(
          mappedUnits.length > 0
            ? mappedUnits
            : [
                {
                  id: "1",
                  idUnit: "",
                  quantity: 0,
                  barcode: "",
                  unitPrice: 0,
                },
              ]
        );
      }
    }
  }, [isEdit, productDetail]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addAdditionalUnit = () => {
    const newUnit: AdditionalUnit = {
      id: Date.now().toString(),
      idUnit: "",
      quantity: 0,
      barcode: "",
      unitPrice: 0,
    };
    setAdditionalUnits((prev) => [...prev, newUnit]);
  };

  const removeAdditionalUnit = (id: string) => {
    setAdditionalUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  const updateAdditionalUnit = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setAdditionalUnits((prev) =>
      prev.map((unit) => (unit.id === id ? { ...unit, [field]: value } : unit))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation: mark required fields that are empty/invalid
    const errors: Record<string, boolean> = {};

    if (!formData.productName.trim()) errors.productName = true;
    if (!formData.productSKU.trim()) errors.productSKU = true;
    if (!formData.productUPC.trim()) errors.productUPC = true;
    if (!formData.productCategory) errors.productCategory = true;
    if (!formData.inventoryMethod) errors.inventoryMethod = true;
    if (!formData.baseUnitName) errors.baseUnitName = true;
    if (formData.costPrice <= 0) errors.costPrice = true;
    if (formData.sellingPrice <= 0) errors.sellingPrice = true;

    // If there are any errors, highlight fields and abort submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Clear previous errors
    setFieldErrors({});

    const requestBody = {
      name: formData.productName,
      sku: formData.productSKU,
      barcode: formData.productUPC,
      category: formData.productCategory,
      isTaxableExemption: formData.productTaxable,
      status: formData.productActive,
      inventoryMethod: parseInt(formData.inventoryMethod),
      reorderPoint: formData.reorderPoint,
      reorderQuantity: formData.reorderQuantity,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      baseUnit: parseInt(formData.baseUnitName),
      units: additionalUnits
        .filter((unit) => unit.idUnit && unit.quantity > 0)
        .map((unit) => ({
          idUnit: parseInt(unit.idUnit),
          quantity: unit.quantity,
          unitPrice: unit.unitPrice,
          barcode: unit.barcode,
        })),
      taxes: [],
    };

    try {
      if (isEdit && productId) {
        await updateProduct({ ...requestBody, id: productId });
      } else {
        await createProduct(requestBody);
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog modal-lg"
        style={{
          maxWidth: "90%",
          margin: "2rem auto",
          height: "calc(100vh - 4rem)",
        }}
      >
        <div
          className="modal-content"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title">
              <i
                className={`fas ${isEdit ? "fa-edit" : "fa-plus-circle"} me-2`}
              ></i>
              {isEdit ? "Edit Product" : "Add New Product"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {/* Field-level validation will highlight inputs; no global alert needed */}
            <form onSubmit={handleSubmit}>
              <div style={{ padding: "1rem" }}>
                {/* General Information */}
                <div className="section-header">
                  <i className="fas fa-info-circle me-2"></i>General Information
                </div>
                <div className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        fieldErrors.productName ? "is-invalid" : ""
                      }`}
                      id="productName"
                      value={formData.productName}
                      onChange={(e) =>
                        handleInputChange("productName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="productSKU" className="form-label">
                          SKU
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            fieldErrors.productSKU ? "is-invalid" : ""
                          }`}
                          id="productSKU"
                          value={formData.productSKU}
                          onChange={(e) =>
                            handleInputChange("productSKU", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="productUPC" className="form-label">
                          UPC/Barcode *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            fieldErrors.productUPC ? "is-invalid" : ""
                          }`}
                          id="productUPC"
                          value={formData.productUPC}
                          onChange={(e) =>
                            handleInputChange("productUPC", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="productCategory" className="form-label">
                          Category *
                        </label>
                        <select
                          className={`form-select ${
                            fieldErrors.productCategory ? "is-invalid" : ""
                          }`}
                          id="productCategory"
                          value={formData.productCategory}
                          onChange={(e) =>
                            handleInputChange("productCategory", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="productActive"
                          checked={formData.productActive}
                          onChange={(e) =>
                            handleInputChange("productActive", e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="productActive"
                        >
                          Active
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="productTaxable"
                          checked={formData.productTaxable}
                          onChange={(e) =>
                            handleInputChange(
                              "productTaxable",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="productTaxable"
                        >
                          Taxable
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Information */}
                <div className="section-header">
                  <i className="fas fa-warehouse me-2"></i>Inventory Information
                </div>
                <div className="mb-4">
                  <div className="info-card mb-3">
                    <h6 className="mb-2">Inventory Management Methods</h6>
                    <p className="mb-0 small">
                      <strong>No Tracking:</strong> No inventory levels are
                      tracked
                      <br />
                      <strong>WAC (Weighted Average Cost):</strong> Cost is
                      calculated as an average of all purchased inventory
                      <br />
                      <strong>FIFO (First In First Out):</strong> Cost is based
                      on the oldest inventory items being sold first
                    </p>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="inventoryMethod" className="form-label">
                      Inventory Method *
                    </label>
                    <select
                      className={`form-select ${
                        fieldErrors.inventoryMethod ? "is-invalid" : ""
                      }`}
                      id="inventoryMethod"
                      value={formData.inventoryMethod}
                      onChange={(e) =>
                        handleInputChange("inventoryMethod", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Inventory Method</option>
                      {inventoryMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.inventoryMethod &&
                    formData.inventoryMethod !== "" && (
                      <div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label
                                htmlFor="reorderPoint"
                                className="form-label"
                              >
                                Reorder Point
                              </label>
                              <input
                                type="number"
                                className={`form-control ${
                                  fieldErrors.reorderPoint ? "is-invalid" : ""
                                }`}
                                id="reorderPoint"
                                min="0"
                                value={formData.reorderPoint}
                                onChange={(e) =>
                                  handleInputChange(
                                    "reorderPoint",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label
                                htmlFor="reorderQuantity"
                                className="form-label"
                              >
                                Reorder Quantity
                              </label>
                              <input
                                type="number"
                                className={`form-control ${
                                  fieldErrors.reorderQuantity
                                    ? "is-invalid"
                                    : ""
                                }`}
                                id="reorderQuantity"
                                min="0"
                                value={formData.reorderQuantity}
                                onChange={(e) =>
                                  handleInputChange(
                                    "reorderQuantity",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Pricing Information */}
                <div className="section-header">
                  <i className="fas fa-tags me-2"></i>Pricing Information
                </div>
                <div className="mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="costPrice" className="form-label">
                          Cost Price ($) *
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            fieldErrors.costPrice ? "is-invalid" : ""
                          }`}
                          id="costPrice"
                          step="0.01"
                          value={formData.costPrice}
                          onChange={(e) =>
                            handleInputChange(
                              "costPrice",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="sellingPrice" className="form-label">
                          Selling Price ($) *
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            fieldErrors.sellingPrice ? "is-invalid" : ""
                          }`}
                          id="sellingPrice"
                          step="0.01"
                          value={formData.sellingPrice}
                          onChange={(e) =>
                            handleInputChange(
                              "sellingPrice",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="taxCategory" className="form-label">
                      Tax Category
                    </label>
                    <select
                      className="form-select"
                      id="taxCategory"
                      value={formData.taxCategory}
                      onChange={(e) =>
                        handleInputChange("taxCategory", e.target.value)
                      }
                    >
                      <option value="">Select Tax Category</option>
                      {taxCategories.map((taxCategory) => (
                        <option key={taxCategory.id} value={taxCategory.id}>
                          {taxCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Units Information */}
                <div className="section-header">
                  <i className="fas fa-box me-2"></i>Units Information
                </div>
                <div className="mb-4">
                  <div className="info-card mb-3">
                    <h6 className="mb-2">Units Management</h6>
                    <p className="mb-0 small">
                      Define how this product is sold (base unit) and stored
                      (other units). For example, a soda can be sold
                      individually, but stored in 6-packs and cases.
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Base Unit (Selling Unit) *
                    </label>
                    <div className="row">
                      <div className="col-md-6">
                        <select
                          className={`form-select mb-2 ${
                            fieldErrors.baseUnitName ? "is-invalid" : ""
                          }`}
                          id="baseUnitName"
                          value={formData.baseUnitName}
                          onChange={(e) =>
                            handleInputChange("baseUnitName", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Base Unit</option>
                          {baseUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          id="baseUnitBarcode"
                          placeholder="Barcode (if different from product)"
                          value={formData.baseUnitBarcode}
                          onChange={(e) =>
                            handleInputChange("baseUnitBarcode", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <h6 className="mt-4">Additional Units</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Unit Name</th>
                          <th>Quantity in Base Units</th>
                          <th>Barcode (Optional)</th>
                          <th>Unit Selling Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {additionalUnits.map((unit) => (
                          <tr key={unit.id}>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={unit.idUnit}
                                onChange={(e) =>
                                  updateAdditionalUnit(
                                    unit.id,
                                    "idUnit",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Unit</option>
                                {units.map((unitOption) => (
                                  <option
                                    key={unitOption.id}
                                    value={unitOption.id}
                                  >
                                    {unitOption.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="1"
                                placeholder="e.g., 12"
                                value={unit.quantity}
                                onChange={(e) =>
                                  updateAdditionalUnit(
                                    unit.id,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Barcode (if scannable)"
                                value={unit.barcode}
                                onChange={(e) =>
                                  updateAdditionalUnit(
                                    unit.id,
                                    "barcode",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Unit price"
                                step="0.01"
                                value={unit.unitPrice}
                                onChange={(e) =>
                                  updateAdditionalUnit(
                                    unit.id,
                                    "unitPrice",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeAdditionalUnit(unit.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addAdditionalUnit}
                  >
                    <i className="fas fa-plus me-1"></i> Add Unit
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
