// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import RecentActivity from "./sections/RecentActivity";
import warehouseService from "../../api/warehouseService";
import PageLoadingState from "../common/feedback/PageLoadingState";
import { Box } from "@mui/material";

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
    <Box minHeight="100vh" bgcolor="background.default" p={{ xs: 2, md: 3 }}>
      <Box maxWidth="xl" mx="auto">
        <RecentActivity warehouses={warehouses} />
      </Box>
    </Box>
  );
}
