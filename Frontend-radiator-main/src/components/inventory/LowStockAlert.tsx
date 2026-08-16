// @ts-nocheck
import React, { useMemo, useState } from "react";
import { AlertTriangle, Bell, X } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import { Button } from "../common/ui/Button";

const getLowStockProducts = (radiators = []) =>
  radiators
    .map((radiator) => ({
      ...radiator,
      totalStock: Object.values(radiator.stock || {}).reduce((sum, qty) => sum + (qty || 0), 0),
    }))
    .filter((radiator) => radiator.totalStock > 0 && radiator.totalStock <= LOW_STOCK_THRESHOLD);

const LowStockAlert = ({ radiators = [] }) => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const lowStockProducts = useMemo(() => getLowStockProducts(radiators), [radiators]);
  const visibleProducts = showAll ? lowStockProducts : lowStockProducts.slice(0, 5);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (!next) setShowAll(false);
            return next;
          });
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-yellow-300 bg-yellow-50 text-yellow-700 transition hover:bg-yellow-100"
        aria-label="Low stock notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-yellow-600 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
          {lowStockProducts.length}
        </span>
      </button>

      {open && (
        <>
          {/* Mobile: backdrop */}
          <div
            className="fixed inset-0 z-10 sm:hidden"
            onClick={() => {
              setOpen(false);
              setShowAll(false);
            }}
          />
          <div className="fixed left-2 right-2 top-auto z-20 mt-3 sm:absolute sm:left-auto sm:right-0 sm:w-80 rounded-xl border border-yellow-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-yellow-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-700" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Low stock alerts</p>
                  <p className="text-xs text-gray-600">
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} below {LOW_STOCK_THRESHOLD}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setShowAll(false);
                }}
                icon={X}
                className="min-h-0 p-1"
              />
            </div>

            <div className="max-h-72 overflow-y-auto px-4 py-3">
              <div className="space-y-2">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-gray-900">{product.model}</p>
                    <p className="text-xs text-gray-600">
                      {product.brand} · {product.code}{product.type ? ` · ${product.type}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-yellow-800">
                      {product.totalStock} units left
                    </p>
                  </div>
                ))}
              </div>

              {lowStockProducts.length > 5 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
                  >
                    {showAll
                      ? "Show less"
                      : `View more (${lowStockProducts.length - 5} more)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LowStockAlert;
