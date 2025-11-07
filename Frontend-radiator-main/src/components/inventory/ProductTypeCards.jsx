import React from 'react';
import { Package, Truck, Settings, Box } from 'lucide-react';

// Icon mapping for different product types
const getProductTypeIcon = (type) => {
  const iconMap = {
    'Vehicle': Package,
    'Truck': Truck,
    'Machinery': Settings,
    'default': Box
  };
  return iconMap[type] || iconMap['default'];
};

// Color mapping for different product types
const getProductTypeColor = (type) => {
  const colorMap = {
    'Vehicle': 'blue',
    'Truck': 'green',
    'Machinery': 'purple',
    'Equipment': 'orange',
    'default': 'gray'
  };
  return colorMap[type] || colorMap['default'];
};

const ProductTypeCards = ({ radiators, onSelectType }) => {
  // Group products by type and count them
  const productTypeStats = radiators.reduce((acc, radiator) => {
    const type = radiator.productType || 'Uncategorized';

    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0
      };
    }

    acc[type].count++;

    // Calculate stock
    if (radiator.stock) {
      const totalStock = Object.values(radiator.stock).reduce((sum, qty) => sum + (qty || 0), 0);
      acc[type].totalStock += totalStock;

      if (totalStock === 0) {
        acc[type].outOfStock++;
      } else if (totalStock <= 5) {
        acc[type].lowStock++;
      }
    }

    return acc;
  }, {});

  // Sort types alphabetically
  const sortedTypes = Object.keys(productTypeStats).sort();

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Select Product Category</h2>
        <p className="text-gray-600 mt-2">Choose a category to view products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* All Products Card */}
        <button
          onClick={() => onSelectType('all')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-blue-200"
        >
          <div className="flex items-start justify-between">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-900">{radiators.length}</p>
              <p className="text-sm text-blue-700 mt-1">Products</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mt-4">All Products</h3>
          <p className="text-sm text-blue-700 mt-2">View entire inventory</p>
        </button>

        {/* Product Type Cards */}
        {sortedTypes.map(type => {
          const stats = productTypeStats[type];
          const color = getProductTypeColor(type);
          const Icon = getProductTypeIcon(type);

          const colorClasses = {
            blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200',
            green: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200',
            purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200',
            orange: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200',
            gray: 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200'
          };

          const textColorClasses = {
            blue: 'text-blue-900',
            green: 'text-green-900',
            purple: 'text-purple-900',
            orange: 'text-orange-900',
            gray: 'text-gray-900'
          };

          const iconBgClasses = {
            blue: 'bg-blue-600',
            green: 'bg-green-600',
            purple: 'bg-purple-600',
            orange: 'bg-orange-600',
            gray: 'bg-gray-600'
          };

          const subtextClasses = {
            blue: 'text-blue-700',
            green: 'text-green-700',
            purple: 'text-purple-700',
            orange: 'text-orange-700',
            gray: 'text-gray-700'
          };

          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-lg border-2`}
            >
              <div className="flex items-start justify-between">
                <div className={`${iconBgClasses[color]} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${textColorClasses[color]}`}>{stats.count}</p>
                  <p className={`text-sm ${subtextClasses[color]} mt-1`}>Products</p>
                </div>
              </div>

              <h3 className={`text-xl font-bold ${textColorClasses[color]} mt-4`}>{type}</h3>

              <div className={`mt-3 pt-3 border-t ${subtextClasses[color]} border-opacity-20`}>
                <div className="flex justify-between text-sm">
                  <span>Total Stock:</span>
                  <span className="font-semibold">{stats.totalStock}</span>
                </div>
                {stats.lowStock > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Low Stock:</span>
                    <span className="font-semibold text-yellow-600">{stats.lowStock}</span>
                  </div>
                )}
                {stats.outOfStock > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Out of Stock:</span>
                    <span className="font-semibold text-red-600">{stats.outOfStock}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTypeCards;
