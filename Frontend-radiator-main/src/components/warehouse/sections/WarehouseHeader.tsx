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
            icon={BarChart3}
          >
            Export
          </Button>
          {isAdmin && (
            <Button onClick={onCreate} icon={Plus}>
              Add Warehouse
            </Button>
          )}
        </>
      }
    />
  );
}
