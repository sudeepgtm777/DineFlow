// @ts-nocheck
import { useParams } from "@/lib/router";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

const ArticleUpdateForm = () => {
  const { slug } = useParams(); // Get slug from URL params
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    readingTime: 0,
    status: "Draft",
    featured: false,
    image: { url: "", public_id: "" },
    sections: [],
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch article data on component mount
  useEffect(() => {
    if (!slug) return;

    const fetchArticleData = async () => {
      try {
        const response = await api.get(`${endpoints.article}/article/${slug}`, {
          withCredentials: true,
        });

        const article = response.data.article;
        setFormData({
          ...article,
          tags: article.tags.join(", "),
        });
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to fetch article data.");
      }
    };

    fetchArticleData();
  }, [slug]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: { ...formData.image, file: e.target.files[0] } });
  };

  // Handle section changes
  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  // Handle section image upload
  const handleSectionImageChange = (index, file) => {
    const updatedSections = [...formData.sections];
    updatedSections[index].image.file = file;
    setFormData({ ...formData, sections: updatedSections });
  };

  // Add new section
  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        { heading: "", text: "", codeSnippet: "", note: "", image: { url: "", public_id: "" } },
      ],
    });
  };

  // Remove section
  const handleRemoveSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("readingTime", formData.readingTime);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("featured", formData.featured);
      if (formData.image.file) formDataToSend.append("image", formData.image.file);
      formDataToSend.append("sections", JSON.stringify(formData.sections));
      formDataToSend.append("tags", formData.tags);

      await api.put(`${endpoints.article}/update-article/${slug}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccess("Article updated successfully!");
      toast.success("Article updated successfully!"); // Toast message for success
    } catch (err) {
      console.error("Error updating article:", err);
      setError("Failed to update article.");
      toast.error("Failed to update article!"); // Toast message for error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Update Article</h2>

      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-3 border rounded-md"
        />

        {/* Slug */}
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Slug"
          className="w-full p-3 border rounded-md"
        />

        {/* Image Upload */}
        {formData.image.url && (
          <img
            src={formData.image.url}
            alt="Current"
            className="w-full h-48 object-cover rounded-md"
          />
        )}
        <input type="file" onChange={handleFileChange} className="w-full p-3 border rounded-md" />

        {/* Excerpt */}
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Excerpt"
          className="w-full p-3 border rounded-md"
        ></textarea>

        {/* Sections */}
        <h3 className="text-xl font-semibold">Sections</h3>
        {formData.sections.map((section, index) => (
          <div key={index} className="space-y-3 p-3 border rounded-md">
            <input
              type="text"
              value={section.heading}
              onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
              placeholder="Section Heading"
              className="w-full p-2 border rounded-md"
            />
            <textarea
              value={section.text}
              onChange={(e) => handleSectionChange(index, "text", e.target.value)}
              placeholder="Section Text"
              className="w-full p-2 border rounded-md"
            ></textarea>
            <input
              type="text"
              value={section.codeSnippet}
              onChange={(e) => handleSectionChange(index, "codeSnippet", e.target.value)}
              placeholder="Code Snippet"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={section.note}
              onChange={(e) => handleSectionChange(index, "note", e.target.value)}
              placeholder="Note"
              className="w-full p-2 border rounded-md"
            />
            {section.image.url && (
              <img
                src={section.image.url}
                alt="Section"
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            <input
              type="file"
              onChange={(e) => handleSectionImageChange(index, e.target.files[0])}
              className="w-full p-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveSection(index)}
              className="text-red-500"
            >
              Remove Section
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSection}
          className="text-blue-500"
        >
          Add Section
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
        >
          {loading ? "Updating..." : "Update Article"}
        </button>
      </form>
    </div>
  );
};

export default ArticleUpdateForm;
