// @ts-nocheck
import React from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { StatsGrid } from '../common/layout/StatsGrid';
import { LOW_STOCK_THRESHOLD } from '../../utils/stock';

const RadiatorStats = ({ radiators }) => {
  const totalProducts = radiators.length;
  let totalStock = 0;
  let lowStockItems = 0;
  let outOfStockItems = 0;

  radiators.forEach(radiator => {
    if (radiator.stock) {
      const productTotal = Object.values(radiator.stock).reduce((sum, qty) => sum + (qty || 0), 0);
      totalStock += productTotal;
      
      if (productTotal === 0) {
        outOfStockItems++;
      } else if (productTotal <= LOW_STOCK_THRESHOLD) {
        lowStockItems++;
      }
    }
  });

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      color: 'blue',
      icon: Package
    },
    {
      title: 'Total Stock',
      value: totalStock.toString(),
      color: 'green',
      icon: CheckCircle
    },
    {
      title: 'Low Stock',
      value: lowStockItems.toString(),
      color: 'yellow',
      icon: AlertTriangle
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems.toString(),
      color: 'red',
      icon: TrendingDown
    }
  ];

  return <StatsGrid stats={stats} columns={4} />;
};

export default RadiatorStats;
