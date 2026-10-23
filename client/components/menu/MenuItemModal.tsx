// @ts-nocheck
import { useState, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints";

const MenuItemModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: 'available',
    image: null,
    previewImage: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(`${endpoints.menuItem}/api/v1/menuitem/menu-categories`);
        setCategories(response.data.categories || []);
        setLoadingCategories(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          categories: 'Failed to load categories',
        }));
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        status: item.status,
        image: null,
        previewImage: item.image?.url || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: categories[0] || '',
        status: 'available',
        image: null,
        previewImage: '',
      });
    }
  }, [item, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('status', formData.status);
      if (formData.image) {
        data.append('image', formData.image);
      }

      let response;
      if (item) {
        response = await api.put(`${endpoints.menuItem}/update-menu-item/${item._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
      } else {
        response = await api.post(`${endpoints.menuItem}/add-menu-item`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
      }

      onSave(response.data);
      setIsUploading(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      setErrors({ form: 'Failed to save menu item' });
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isUploading}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Price */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Price*</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Category*</label>
              {isCustomCategory ? (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter new category"
                  className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                  disabled={loadingCategories}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="mt-1 text-sm text-blue-600 underline"
              >
                {isCustomCategory ? 'Choose from existing' : 'Add new category'}
              </button>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="available">Available</option>
              <option value="out of stock">Out of Stock</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">Image</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {formData.previewImage ? (
                  <img src={formData.previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="text-gray-500 mb-2" size={24} />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 2MB)</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {item ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                item ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
          {errors.form && <p className="mt-4 text-sm text-red-600">{errors.form}</p>}
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
