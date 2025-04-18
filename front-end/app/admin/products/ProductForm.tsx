import { Category, Item } from "@/lib/types";
import axios from "axios";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export const ProductForm: React.FC<{
  product?: Item;
  onSubmit: (data: Partial<Item>) => void;
  onClose: () => void;
  categories: Category[];
}> = ({ product, onSubmit, onClose, categories }) => {
  const [formData, setFormData] = useState({
    itemId: product?.itemId,
    name: product?.name || "",
    image: product?.image || "",
    bio: product?.bio || "",
    isvegan: product?.isvegan || false,
    cost: product?.cost || 0,
    availability: product?.availability ?? true,
    category: product?.category || categories[0].name,
    subcategory: product?.subcategory || "",
    tags: product?.tags || [],
    ingredients: product?.ingredients || [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [tags, setTags] = useState("");
  useEffect(() => {
    const updateItem = async () => {
      const link = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`;
      console.log(formData)
      if (isSubmitted == true) {
        if (product != undefined) {
          axios.post(link + "/changeItem", formData);
        } else {
          axios.post(link + "/addItem", formData);
        }
      }
    };
    updateItem();
  }, [isSubmitted]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsSubmitted(true);
    onClose();
  };
  function addIngredient(){
    if (ingredients.trim() && !formData.ingredients.includes(ingredients.trim())) {
      setFormData({ ...formData, ingredients: [...formData.ingredients, ingredients.trim()] });
      setIngredients("");
    }
  };

  function removeIngredient(ingredient: string){
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((ing) => ing !== ingredient),
    });
  };
  function addTags(){
    if (tags.trim() && !formData.tags.includes(tags.trim())) {
      setFormData({ ...formData, tags: [...formData.tags,tags.trim()] });
      setTags("");
    }
  };

  function removeTags(tags: string){
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tags),
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Product Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-600 dark:text-gray-700 mb-1"
          >
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-500">
              $
            </span>
            <input
              type="number"
              id="price"
              min="0.1"
              step="0.01"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) })
              }
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-primary"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-primary mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category.toString()}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent  text-primary"
          >
            {categories.map((category, i) => (
              <option key={i} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-primary"
          rows={3}
          required
        />
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-primary"
          required
        />
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingredients
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add an ingredient"
          />
          <button
            onClick={addIngredient}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.ingredients.map((ingredient, index) => (
            <span key={index} className="flex items-center bg-blue-500 px-3 py-1 rounded-full text-white">
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="ml-2"
              >
                <X/>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add Tag"
          />
          <button
            onClick={addTags}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag,i) => (
            <span key={i} className="flex items-center bg-blue-500 px-3 py-1 rounded-full text-white">
              {tag}
              <button
                onClick={() => removeTags(tag)}
                className="ml-2"
              >
                <X/>
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex gap-4">
          <label className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Vegan
            </label>
            <input
              type="checkbox"
              checked={formData.isvegan}
              onChange={() =>
                setFormData({ ...formData, isvegan: !formData.isvegan })
              }
              className="ml-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Availability
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.availability}
              onChange={() => setFormData({ ...formData, availability: true })}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">In Stock</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!formData.availability}
              onChange={() => setFormData({ ...formData, availability: false })}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {product ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
};
