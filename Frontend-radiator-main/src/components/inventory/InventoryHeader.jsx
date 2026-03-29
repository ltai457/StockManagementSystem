import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../common/ui/Button";
import LowStockAlert from "./LowStockAlert";

const InventoryHeader = ({ sortBy, onSortChange, isAdmin, onAddProduct, radiators }) => (
  <div className="flex justify-between items-center gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      <p className="text-sm text-gray-600 mt-1">
        Manage your product list and stock levels
      </p>
    </div>

    <div className="flex gap-2 items-center">
      <LowStockAlert radiators={radiators} />

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="name">Name (A-Z)</option>
        <option value="brand">Brand (A-Z)</option>
      </select>

      {isAdmin && (
        <Button onClick={onAddProduct} icon={Plus}>
          Add Product
        </Button>
      )}
    </div>
  </div>
);

export default InventoryHeader;
