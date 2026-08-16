// @ts-nocheck
import React from "react";
import { Package, Warehouse } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../../../utils/stock";

export default function StockOverviewGrid({
  warehouses,
  radiators,
  selectedWarehouse,
  setSelectedWarehouse,
}) {
  // Always calculate total across ALL warehouses (fixed number)
  const totalAcrossAll = (radiators || []).reduce((t, r) => {
    if (!r.stock) return t;
    return t + Object.values(r.stock).reduce((sum, qty) => sum + (qty || 0), 0);
  }, 0);

  return (
    <>
      <div className="md:hidden">
        <div className="-mx-3 overflow-x-auto px-3 pb-1">
          <div className="flex gap-3">
            <OverviewCard
              compact
              active={selectedWarehouse === "all"}
              onClick={() => setSelectedWarehouse("all")}
              icon={<Package className="h-5 w-5 text-purple-600" />}
              badgeBg="bg-purple-100"
              title="All Warehouses"
              subtitle="Combined view"
              stats={[{ label: "Stock", value: totalAcrossAll }]}
            />

            {(warehouses || []).map((w) => {
              const warehouseStock = (radiators || []).reduce(
                (t, r) => t + (r.stock?.[w.code] || 0),
                0
              );
              const lowStockItems = (radiators || []).filter((r) => {
                const s = r.stock?.[w.code] || 0;
                return s > 0 && s <= LOW_STOCK_THRESHOLD;
              }).length;
              const outOfStockItems = (radiators || []).filter(
                (r) => (r.stock?.[w.code] || 0) === 0
              ).length;

              return (
                <OverviewCard
                  compact
                  key={w.id}
                  active={selectedWarehouse === w.code}
                  onClick={() => setSelectedWarehouse(w.code)}
                  icon={<Warehouse className="h-5 w-5 text-blue-600" />}
                  badgeBg="bg-blue-100"
                  title={w.name}
                  subtitle={w.code}
                  location={w.location}
                  stats={[
                    { label: "Stock", value: warehouseStock },
                    {
                      label: "Low",
                      value: lowStockItems,
                      emphasize: lowStockItems > 0,
                      emphasizeClass: "text-yellow-600",
                    },
                    {
                      label: "Out",
                      value: outOfStockItems,
                      emphasize: outOfStockItems > 0,
                      emphasizeClass: "text-red-600",
                    },
                  ]}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-4">
        <OverviewCard
          active={selectedWarehouse === "all"}
          onClick={() => setSelectedWarehouse("all")}
          icon={<Package className="h-6 w-6 text-purple-600" />}
          badgeBg="bg-purple-100"
          title="All Warehouses"
          subtitle="Combined View"
          stats={[{ label: "Total Stock", value: totalAcrossAll }]}
        />

        {(warehouses || []).map((w) => {
          const warehouseStock = (radiators || []).reduce(
            (t, r) => t + (r.stock?.[w.code] || 0),
            0
          );
          const lowStockItems = (radiators || []).filter((r) => {
            const s = r.stock?.[w.code] || 0;
            return s > 0 && s <= LOW_STOCK_THRESHOLD;
          }).length;
          const outOfStockItems = (radiators || []).filter(
            (r) => (r.stock?.[w.code] || 0) === 0
          ).length;

          return (
            <OverviewCard
              key={w.id}
              active={selectedWarehouse === w.code}
              onClick={() => setSelectedWarehouse(w.code)}
              icon={<Warehouse className="h-6 w-6 text-blue-600" />}
              badgeBg="bg-blue-100"
              title={w.name}
              subtitle={w.code}
              location={w.location}
              stats={[
                { label: "Total Stock", value: warehouseStock },
                {
                  label: "Low Stock",
                  value: lowStockItems,
                  emphasize: lowStockItems > 0,
                  emphasizeClass: "text-yellow-600",
                },
                {
                  label: "Out of Stock",
                  value: outOfStockItems,
                  emphasize: outOfStockItems > 0,
                  emphasizeClass: "text-red-600",
                },
              ]}
            />
          );
        })}
      </div>
    </>
  );
}

function OverviewCard({
  active,
  onClick,
  icon,
  badgeBg,
  title,
  subtitle,
  location,
  stats,
  compact = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border bg-white transition-all ${
        compact
          ? `min-w-[220px] rounded-lg p-3 shadow ${
              active
                ? "border-blue-500 bg-blue-50"
                : "border-transparent"
            }`
          : `rounded-lg p-5 shadow hover:shadow-lg ${
              active ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`
      }`}
    >
      <div className={`flex items-center gap-3 ${compact ? "mb-2" : "mb-3"}`}>
        <div
          className={`${compact ? "h-10 w-10 rounded-lg" : "h-12 w-12 rounded-lg"} ${badgeBg} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3
            className={`${compact ? "text-sm" : "text-lg"} truncate font-semibold text-gray-900`}
          >
            {title}
          </h3>
          {subtitle && (
            <p className={`${compact ? "text-xs" : "text-sm"} text-gray-500`}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        {stats.map(({ label, value, emphasize, emphasizeClass }) => (
          <div key={label} className="flex justify-between items-center">
            <span className={`${compact ? "text-xs" : "text-sm"} text-gray-600`}>{label}</span>
            <span
              className={`${compact ? "text-xs" : "text-sm"} font-semibold ${
                emphasize ? emphasizeClass : "text-gray-900"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {location && (
        <div className={`${compact ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-gray-200`}>
          <p className="line-clamp-1 text-xs text-gray-500">{location}</p>
        </div>
      )}
    </div>
  );
}
