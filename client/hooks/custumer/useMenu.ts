// @ts-nocheck
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";

const staticCategories = [
  "Pizza",
  "Burgers",
  "Pasta",
  "Salads",
  "Wings",
  "Vegetarian",
];

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(staticCategories);

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

      const allCategories = ["All", ...new Set([...staticCategories, ...dynamicCategories])];

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