// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import RecentActivity from "./sections/RecentActivity";
import warehouseService from "../../api/warehouseService";
import PageLoadingState from "../common/feedback/PageLoadingState";

export default function ActivityPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getAll();
      if (res?.success) setWarehouses(res.data || []);
    } catch {
      // warehouses are optional for filtering
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  if (loading) {
    return <PageLoadingState text="Loading activity..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <RecentActivity warehouses={warehouses} />
      </div>
    </div>
  );
}
