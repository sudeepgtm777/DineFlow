import { useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const useAddNewItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const addItem = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("description", values.description.trim());
      formData.append("price", values.price);
      formData.append("category", values.category.trim());

      if (values.image) {
        formData.append("image", values.image);
      }

      const response = await api.post(
        `${endpoints.menuItem}/add-menu-item`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setSuccess(true);
      return response.data;
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addItem, loading, error, success };
};

export default useAddNewItem;