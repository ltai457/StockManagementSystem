import React, { useState, useEffect } from 'react';
import { Package, PackageX, Warehouse, Box } from 'lucide-react';
import { PageHeader } from '../common/layout/PageHeader';
import { StatsGrid } from '../common/layout/StatsGrid';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';

import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import radiatorService from '../../api/radiatorService';
import stockService from '../../api/stockService';

const DashboardOverview = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState({
    radiators: [],
    stockMovements: [],
    stockSummary: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const [radiatorsResult, stockMovementsResult, stockSummaryResult] = await Promise.all([
          radiatorService.getAll(),
          stockService.getStockMovements({
            fromDate,
            toDate,
            limit: 20
          }),
          stockService.getStockSummary()
        ]);

        setDashboardData({
          radiators: radiatorsResult.success ? radiatorsResult.data : [],
          stockMovements: stockMovementsResult.success ? stockMovementsResult.data : [],
          stockSummary: stockSummaryResult.success ? stockSummaryResult.data : null,
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const calculateStats = () => {
    const { radiators, stockSummary } = dashboardData;

    const totalRadiators = radiators.length;
    const totalWarehouses = stockSummary?.warehouseSummaries?.length ?? 0;

    const LOW_STOCK_THRESHOLD = 5;

    const extractWarehouseStocks = (radiator) => {
      const candidates = [
        radiator?.stock,
        radiator?.stockLevels,
        radiator?.stockByWarehouse,
        radiator?.warehouseStock,
        radiator?.warehouses,
        radiator?.inventory
      ];

      for (const candidate of candidates) {
        if (!candidate) continue;

        if (Array.isArray(candidate)) {
          const entries = candidate
            .map((item) => {
              if (item == null) return null;
              if (typeof item === 'number') return item;
              if (typeof item === 'string') return Number(item);
              if (typeof item === 'object') {
                const quantity =
                  item.quantity ?? item.qty ?? item.stock ?? item.available ?? item.onHand ?? item.level;
                if (quantity == null) return null;
                return Number(quantity);
              }
              return null;
            })
            .filter((qty) => qty != null && Number.isFinite(qty));
          if (entries.length) return entries;
        } else if (typeof candidate === 'object') {
          const entries = Object.values(candidate)
            .map((value) => {
              if (value == null) return null;
              if (typeof value === 'number') return value;
              if (typeof value === 'string') return Number(value);
              if (typeof value === 'object') {
                const quantity =
                  value.quantity ?? value.qty ?? value.stock ?? value.available ?? value.onHand ?? value.level;
                if (quantity == null) return null;
                return Number(quantity);
              }
              return null;
            })
            .filter((qty) => qty != null && Number.isFinite(qty));
          if (entries.length) return entries;
        }
      }

      return [];
    };

    const stockEvaluations = radiators.map((radiator) => {
      const stocks = extractWarehouseStocks(radiator).map((qty) =>
        Number.isFinite(qty) ? qty : 0
      );

      if (!stocks.length) {
        return { isOutOfStock: true, isLowStock: false };
      }

      const anyPositive = stocks.some((qty) => qty > 0);
      const totalStock = stocks.reduce((sum, qty) => sum + qty, 0);
      const anyLowWarehouse = stocks.some(
        (qty) => qty > 0 && qty <= LOW_STOCK_THRESHOLD
      );

      return {
        isOutOfStock: !anyPositive,
        isLowStock:
          anyLowWarehouse ||
          (anyPositive && totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD)
      };
    });

    const lowStockItems = stockEvaluations.filter(
      (e) => e.isLowStock && !e.isOutOfStock
    ).length;

    const outOfStockItems = stockEvaluations.filter(
      (e) => e.isOutOfStock
    ).length;

    return [
      {
        title: 'Total Radiators',
        value: totalRadiators.toString(),
        color: 'blue',
        icon: Box
      },
      {
        title: 'Warehouses',
        value: totalWarehouses.toString(),
        color: 'indigo',
        icon: Warehouse
      },
      {
        title: 'Low Stock Radiators',
        value: lowStockItems.toString(),
        color: 'orange',
        icon: Package
      },
      {
        title: 'Out of Stock',
        value: outOfStockItems.toString(),
        color: 'red',
        icon: PackageX
      }
    ];
  };

  if (dashboardData.loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (dashboardData.error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Chan Mary 333"
          subtitle="Your complete radiator inventory management system"
        />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {dashboardData.error}
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      <PageHeader title="Chan Mary 333" />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity
            stockMovements={dashboardData.stockMovements}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
