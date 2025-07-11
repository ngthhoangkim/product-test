import * as yup from "yup";

// Tạo function để tạo schema thay vì export trực tiếp
export const createProductSchema = () =>
  yup.object({
    name: yup
      .string()
      .required("Tên sản phẩm là bắt buộc")
      .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
      .max(100, "Tên sản phẩm không được vượt quá 100 ký tự"),

    description: yup.string().max(500, "Mô tả không được vượt quá 500 ký tự"),

    price: yup
      .number()
      .required("Giá sản phẩm là bắt buộc")
      .min(0, "Giá sản phẩm phải lớn hơn hoặc bằng 0")
      .typeError("Giá sản phẩm phải là số"),

    quantity: yup
      .number()
      .required("Số lượng là bắt buộc")
      .min(0, "Số lượng phải lớn hơn hoặc bằng 0")
      .integer("Số lượng phải là số nguyên")
      .typeError("Số lượng phải là số"),

    category: yup.string().max(50, "Danh mục không được vượt quá 50 ký tự"),

    status: yup
      .string()
      .oneOf(["active", "inactive"], "Trạng thái phải là active hoặc inactive")
      .required("Trạng thái là bắt buộc"),
  });

// Export schema để có thể infer type
export const productSchema = createProductSchema();
export type ProductFormData = yup.InferType<typeof productSchema>;

// Schema cho edit form (có thêm id)
export const createEditProductSchema = () =>
  createProductSchema().shape({
    id: yup.string().required("ID sản phẩm là bắt buộc"),
  });

export const editProductSchema = createEditProductSchema();
export type EditProductFormData = yup.InferType<typeof editProductSchema>;

// Các options cho select
export const productCategories = [
  { value: "electronics", label: "Điện tử" },
  { value: "clothing", label: "Thời trang" },
  { value: "books", label: "Sách" },
  { value: "home", label: "Gia dụng" },
  { value: "sports", label: "Thể thao" },
  { value: "beauty", label: "Làm đẹp" },
  { value: "food", label: "Thực phẩm" },
  { value: "other", label: "Khác" },
];

export const productStatuses = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];
