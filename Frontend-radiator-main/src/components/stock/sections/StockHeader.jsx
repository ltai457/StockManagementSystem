import React from "react";
import LowStockAlert from "../../inventory/LowStockAlert";
import { PageHeader } from "../../common/layout/PageHeader";

export default function StockHeader({ radiators = [], actions = null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Stock Management</h1>
        <p className="mt-1 hidden text-sm text-gray-600 sm:block">
          View and manage inventory across all warehouse locations
        </p>
      </div>

      <div className="flex flex-none items-center gap-2">
        {actions}
        <LowStockAlert radiators={radiators} />
      </div>
    </div>
  );
}
