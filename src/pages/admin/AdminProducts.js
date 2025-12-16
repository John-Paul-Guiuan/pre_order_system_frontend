import React, { useState, useEffect } from "react";
import api from "../../api/api";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { FiPlus, FiTrash, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import { useSidebar } from "../../context/SidebarContext";

export default function ProductManagement() {
  const { collapsed } = useSidebar();
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    base_price: "",
    is_available: true,
    description: "",
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        console.log("Fetched categories:", response.data);
        
        // Categories will be auto-created by the backend if none exist
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
        } else {
          // If still empty after auto-creation attempt, show warning
          console.warn("No categories available. Please refresh the page.");
          toast.error("No categories available. Please refresh the page.");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Failed to load categories. Please refresh the page.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      console.log("Image selected:", file.name, "Size:", file.size, "Type:", file.type);
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
      return;
    }

    // For non-file inputs, update normally
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!form.name || !form.category_id || !form.base_price) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Validate category_id is a valid integer
    const categoryId = parseInt(form.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      toast.error("Please select a valid category");
      setLoading(false);
      return;
    }

    // Validate price
    const price = parseFloat(form.base_price);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    
    // Append fields with correct names
    fd.append("name", form.name.trim());
    fd.append("category_id", categoryId.toString());
    fd.append("base_price", price.toString());
    fd.append("is_available", form.is_available ? "1" : "0");
    fd.append("description", (form.description || "").trim());
    
    // Append image only if it's a valid File object
    if (form.image && form.image instanceof File) {
      console.log("Appending image to FormData:", form.image.name, form.image.size);
      fd.append("image", form.image);
    } else if (!form.image) {
      console.warn("No image selected - image is optional");
    }

    // Debug: Log FormData contents
    console.log("FormData being sent:");
    for (let pair of fd.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    try {
      // Send FormData without manual Content-Type header
      // Browser will automatically set: Content-Type: multipart/form-data; boundary=...
      const response = await api.post("/products", fd);
      
      console.log("Product created successfully:", response.data);
      toast.success("Product added successfully!");
      
      // Reset form
      setForm({
        name: "",
        category_id: "",
        base_price: "",
        is_available: true,
        description: "",
        image: null,
      });
      setPreview(null);
    } catch (err) {
      console.error("Product creation error:", err);
      console.error("Error response data:", err.response?.data);
      
      // Show detailed validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || "Failed to add product");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = () => {
    setForm({ ...form, image: null });
    setPreview(null);
  };

  return (
    <div className="flex h-screen bg-[#E6E6E6] overflow-hidden">
      <AdminSidebar />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16 ml-0" : "lg:ml-64 ml-0"
        }`}
      >
        <AdminTopbar />

        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-[#5A381E] mb-6">
            Add product
          </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3611B]"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                value={form.category_id || ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3611B]"
              >
                <option value="">select category</option>
                {categories.length === 0 ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Image Upload - Drag & Drop Style */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="flex items-center gap-3 mb-2">
                <FiPlus className="text-gray-400" />
                {form.image && (
                  <FiTrash
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={handleImageRemove}
                  />
                )}
              </div>

              {!preview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#B3611B] transition">
                  <FiUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag & drop to upload or browse
                  </p>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-[#B3611B] hover:underline"
                  >
                    Browse files
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <FiTrash />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="base_price"
                  value={form.base_price}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 pl-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3611B]"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                name="is_available"
                value={form.is_available ? "1" : "0"}
                onChange={(e) =>
                  setForm({ ...form, is_available: e.target.value === "1" })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3611B]"
              >
                <option value="">select status</option>
                <option value="1">Available</option>
                <option value="0">Out of Stock</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-[#B3611B]"
                placeholder="Enter product description"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#B3611B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#9a5015] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "ADD"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({
                  name: "",
                  category_id: "",
                  base_price: "",
                  is_available: true,
                  description: "",
                  image: null,
                });
                setPreview(null);
              }}
              className="border-2 border-[#B3611B] text-[#B3611B] px-8 py-3 rounded-lg font-semibold hover:bg-[#B3611B] hover:text-white transition"
            >
              CANCEL
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
