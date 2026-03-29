import React from "react";
import LowStockAlert from "../../inventory/LowStockAlert";

export default function StockHeader({ radiators = [], actions = null }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage inventory across all warehouse locations
        </p>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <LowStockAlert radiators={radiators} />
      </div>
    </div>
  );
}
