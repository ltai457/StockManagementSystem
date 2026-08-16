// @ts-nocheck
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { Box as BoxIcon, Package, PackageX, Warehouse } from "lucide-react";
import stockService from "../../api/stockService";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import PageErrorState from "../common/feedback/PageErrorState";
import { PageHeader } from "../common/layout/PageHeader";
import { StatsGrid } from "../common/layout/StatsGrid";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import LowStockOverview from "./LowStockOverview";
import QuickActions from "./QuickActions";

export default function DashboardOverview({ onNavigate }) {
  const [dashboardData, setDashboardData] = useState({ radiators: [], stockSummary: null, loading: true, error: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [radiators, summary] = await Promise.all([
          stockService.getAllRadiatorsWithStock(),
          stockService.getStockSummary(),
        ]);
        setDashboardData({ radiators: radiators.success ? radiators.data : [], stockSummary: summary.success ? summary.data : null, loading: false, error: null });
      } catch {
        setDashboardData((current) => ({ ...current, loading: false, error: "Failed to load dashboard data" }));
      }
    };
    void load();
  }, []);

  const calculateStats = () => {
    const stocksFor = (radiator) => Object.values(radiator?.stock || {}).map(Number).filter(Number.isFinite);
    const evaluations = dashboardData.radiators.map((radiator) => {
      const stocks = stocksFor(radiator);
      const total = stocks.reduce((sum, quantity) => sum + quantity, 0);
      const positive = stocks.some((quantity) => quantity > 0);
      return {
        out: !positive,
        low: positive && (total <= LOW_STOCK_THRESHOLD || stocks.some((quantity) => quantity > 0 && quantity <= LOW_STOCK_THRESHOLD)),
      };
    });

    return [
      { title: "Total Radiators", value: String(dashboardData.radiators.length), color: "blue", icon: BoxIcon },
      { title: "Warehouses", value: String(dashboardData.stockSummary?.warehouseSummaries?.length ?? 0), color: "indigo", icon: Warehouse },
      { title: "Low Stock Radiators", value: String(evaluations.filter((item) => item.low && !item.out).length), color: "orange", icon: Package },
      { title: "Out of Stock", value: String(evaluations.filter((item) => item.out).length), color: "red", icon: PackageX },
    ];
  };

  if (dashboardData.loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  if (dashboardData.error) {
    return <Stack spacing={4}><PageHeader title="Chan Mary 333" subtitle="Your complete radiator inventory management system" /><PageErrorState message={dashboardData.error} /></Stack>;
  }

  return (
    <Stack spacing={4}>
      <PageHeader title="Chan Mary 333" />
      <StatsGrid stats={calculateStats()} columns={4} />
      <Box display="grid" gap={3} gridTemplateColumns={{ xs: "1fr", lg: "minmax(240px, 1fr) minmax(0, 2fr)" }}>
        <QuickActions onNavigate={onNavigate} />
        <LowStockOverview radiators={dashboardData.radiators} onNavigate={onNavigate} />
      </Box>
    </Stack>
  );
}
