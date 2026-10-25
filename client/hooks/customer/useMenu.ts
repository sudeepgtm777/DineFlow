import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [categories, setCategories] = useState(["All"]);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`${endpoints.menuItem}/menu-items`);
      const data = response.data.menuItems; // Access the correct array

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: menu items should be an array.");
      }

      const dynamicCategories = Array.from(
        new Set(data.map((item) => item.category))
      );

      const allCategories = ["All", ...dynamicCategories.filter(Boolean)];

      setCategories(allCategories);
      setMenuItems(data);
    } catch (err) {
      setError("Failed to fetch menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const filteredItems = Array.isArray(menuItems)
    ? menuItems.filter((item) => {
        const matchesCategory =
          activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  return {
    menuItems,
    categories,
    filteredItems,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    loading,
    error,
  };
};