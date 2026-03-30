import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";

export default function LowStockOverview({ radiators = [], onNavigate }) {
  const lowStockItems = useMemo(() => {
    return (radiators || [])
      .filter((r) => {
        const total = Object.values(r.stock || {}).reduce((sum, qty) => sum + (qty || 0), 0);
        return total > 0 && total <= LOW_STOCK_THRESHOLD;
      })
      .sort((a, b) => {
        const totalA = Object.values(a.stock || {}).reduce((s, q) => s + (q || 0), 0);
        const totalB = Object.values(b.stock || {}).reduce((s, q) => s + (q || 0), 0);
        return totalA - totalB;
      });
  }, [radiators]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Low Stock</h3>
        {lowStockItems.length > 0 && (
          <button
            onClick={() => onNavigate?.("stock")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Stock →
          </button>
        )}
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">All stock levels are healthy</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {lowStockItems.map((r) => {
            const total = Object.values(r.stock || {}).reduce((s, q) => s + (q || 0), 0);
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-100"
              >
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate flex-1">{`${r.brand || ""} ${r.model || ""}`.trim() || r.code}</span>
                <span className="text-sm font-medium text-yellow-700">{total}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
