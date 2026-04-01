import React from "react";
import { SearchInput } from "../../common/ui/SearchInput";

export default function WarehouseToolbar({
  searchTerm,
  onSearch,
  viewMode,
  onViewChange,
  resultCount,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md w-full">
          <SearchInput
            value={searchTerm}
            onChange={onSearch}
            onClear={() => onSearch("")}
            placeholder="Search warehouses by name, code, location..."
          />
        </div>

        <div className="hidden sm:flex w-auto flex-row items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange("table")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => onViewChange("cards")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "cards"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {typeof resultCount === "number" && (
        <div className="mt-3 text-sm text-gray-600">
          Found {resultCount} result{resultCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
