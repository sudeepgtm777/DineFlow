// @ts-nocheck
import React, { useState, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "@/lib/router";
import useAddNewItem from "@/hooks/admin/useAddNewItem";

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters") // Adjusted to match message
    .max(200, "Description must be at most 200 characters"),
  price: Yup.number()
    .required("Price is required")
    .min(0.01, "Price must be greater than 0")
    .max(10000, "Price must be less than 10,000"),
  category: Yup.string()
    .required("Category is required")
    .oneOf(["Appetizer", "Main Course", "Dessert", "Beverage", "Custom"], "Invalid category"),
  customCategory: Yup.string().when("category", {
    is: "Custom",
    then: (schema) =>
      schema
        .required("Custom category name is required")
        .min(3, "Custom category must be at least 3 characters")
        .max(30, "Custom category must be at most 30 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),
  image: Yup.mixed()
    .required("Main image is required")
    .test("fileSize", "File too large (max 5MB)", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Unsupported file format", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type);
    }),
});

const AddMenuItem = () => {
  const { addItem, loading } = useAddNewItem();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleSuccess = () => {
    toast.success("Menu item added successfully!");
  };

  const handleError = () => {
    toast.error("Failed to add the menu item. Please try again!");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto mt-10 relative">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New Menu Item</h1>

      <button
        onClick={handleBack}
        className="text-blue-500 hover:text-blue-700 mb-6 inline-block"
      >
        ← Back
      </button>

      <Formik
        initialValues={{
          name: "",
          description: "",
          price: "",
          category: "",
          customCategory: "",
          image: null,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            // If category is not "Custom", clear customCategory
            const formData = {
              ...values,
              category:
                values.category === "Custom" ? values.customCategory : values.category,
            };
            await addItem(formData);
            handleSuccess();
            resetForm();
            setImagePreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error) {
            console.error("Error submitting menu item:", error);
            handleError();
          } finally {
            setSubmitting(false);
          }
        }}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.name && touched.name && (
                <div className="text-red-500 text-sm">{errors.name}</div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.description && touched.description && (
                <div className="text-red-500 text-sm">{errors.description}</div>
              )}
            </div>

            {/* Price Field */}
            <div>
              <label className="block text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={values.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.price && touched.price && (
                <div className="text-red-500 text-sm">{errors.price}</div>
              )}
            </div>

            {/* Category Field (Dropdown) */}
            <div>
              <label className="block text-gray-700">Category</label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Appetizer">Appetizer</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="Custom">Custom</option>
              </select>
              {errors.category && touched.category && (
                <div className="text-red-500 text-sm">{errors.category}</div>
              )}
            </div>

            {/* Custom Category Field (Conditional) */}
            {values.category === "Custom" && (
              <div>
                <label className="block text-gray-700">Custom Category Name</label>
                <input
                  type="text"
                  name="customCategory"
                  value={values.customCategory}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.customCategory && touched.customCategory && (
                  <div className="text-red-500 text-sm">{errors.customCategory}</div>
                )}
              </div>
            )}

            {/* Image Field with Preview */}
            <div>
              <label className="block text-gray-700">Main Image</label>
              <input
                type="file"
                name="image"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.currentTarget.files[0];
                  setFieldValue("image", file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {errors.image && touched.image && (
                <div className="text-red-500 text-sm">{errors.image}</div>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Menu Item"}
            </button>
          </Form>
        )}
      </Formik>

      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 z-50">
          <div className="flex justify-center items-center">
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMenuItem;