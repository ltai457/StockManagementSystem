import React from 'react';
import { Search, Package, Warehouse } from 'lucide-react';
import { Button } from '../common/ui/Button';

const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      label: 'Manage Stock',
      icon: Package,
      color: 'indigo',
      onClick: () => onNavigate('stock')
    },
    {
      label: 'Search Inventory',
      icon: Search,
      color: 'purple',
      onClick: () => onNavigate('inventory')
    },
    {
      label: 'Manage Warehouses',
      icon: Warehouse,
      color: 'cyan',
      onClick: () => onNavigate('warehouses')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={action.onClick}
            icon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
