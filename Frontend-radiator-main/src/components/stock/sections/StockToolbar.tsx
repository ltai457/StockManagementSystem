// @ts-nocheck
import React from "react";
import { Edit3, Filter, Save, X } from "lucide-react";
import { SearchInput } from "../../common/ui/SearchInput";

export default function StockToolbar({
  searchTerm,
  setSearchTerm,
  filterLowStock,
  setFilterLowStock,
  editMode,
  updating,
  editingCount = 0,
  onEdit,
  onCancel,
  onSave,
  selectedWarehouse,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-2 sm:gap-3">
          <div className="w-full sm:flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
              placeholder="Search radiators by name, code, or brand..."
            />
          </div>

          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`hidden min-h-[44px] rounded-lg border px-2 py-2 text-xs font-medium transition-colors sm:inline-flex sm:w-auto sm:px-4 sm:text-sm ${
              filterLowStock
                ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-1 sm:gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Low Stock Only</span>
              <span className="sm:hidden">Low Stock</span>
            </span>
          </button>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {editMode ? (
            <>
              <button
                onClick={onCancel}
                disabled={updating}
                className="min-h-[44px] w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </span>
              </button>
              <button
                onClick={onSave}
                disabled={updating || editingCount === 0}
                className="min-h-[44px] w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  {updating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes{editingCount ? ` (${editingCount})` : ""}
                </span>
              </button>
            </>
          ) : (
            selectedWarehouse !== "all" && (
              <button
                onClick={onEdit}
                className="min-h-[44px] w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Stock
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
