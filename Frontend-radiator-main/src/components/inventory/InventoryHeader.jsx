import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../common/ui/Button";
import LowStockAlert from "./LowStockAlert";

const InventoryHeader = ({
  isAdmin,
  onAddProduct,
  radiators,
}) => (
  <div className="space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Inventory Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your product list and stock levels</p>
      </div>

      <div className="flex flex-none items-center">
        <LowStockAlert radiators={radiators} />
      </div>
    </div>

    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {isAdmin && (
        <Button onClick={onAddProduct} icon={Plus} className="w-full sm:w-auto flex-shrink-0">
          Add Product
        </Button>
      )}
    </div>
  </div>
);

export default InventoryHeader;
