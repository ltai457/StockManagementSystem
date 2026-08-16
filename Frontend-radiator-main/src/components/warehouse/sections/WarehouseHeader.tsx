// @ts-nocheck
import React from "react";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "../../common/ui/Button";
import { PageHeader } from "../../common/layout/PageHeader";

export default function WarehouseHeader({ isAdmin, onCreate, onExport }) {
  return (
    <PageHeader
      title="Warehouse Management"
      subtitle="Manage your warehouse locations and distribution centers"
      actions={
        <>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Export
            </span>
          </Button>
          {isAdmin && (
            <Button onClick={onCreate} className="w-full sm:w-auto">
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Warehouse
              </span>
            </Button>
          )}
        </>
      }
    />
  );
}
