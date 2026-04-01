// src/components/dashboard/Dashboard.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard, Package,
  Warehouse, Box, UserCog, LogOut,
  TrendingUp, ChevronRight, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useNavigate } from 'react-router-dom';

// Dashboard content components
import DashboardOverview from './DashboardOverview';
import RadiatorList from '../inventory/RadiatorList';
import WarehouseManagement from '../warehouse/WarehouseManagement';
import StockManagement from '../stock/StockManagementPage';
import ActivityPage from '../stock/ActivityPage';
import UserManagement from '../users/UserManagement';
import { isAdminUser } from '../../utils/roles';

const TESTING_MODE = false; // Should match AuthContext

const navConfig = [
  { id: 'overview', label: 'Overview', shortLabel: 'Home', icon: LayoutDashboard, color: 'blue' },
  { id: 'inventory', label: 'Inventory', shortLabel: 'Inventory', icon: Package, color: 'orange' },
  { id: 'stock', label: 'Stock Management', shortLabel: 'Stock', icon: Box, color: 'indigo' },
  { id: 'activity', label: 'Activity Log', shortLabel: 'Activity', icon: ClipboardList, color: 'green' },
  { id: 'warehouses', label: 'Warehouses', shortLabel: 'Warehouse', icon: Warehouse, color: 'cyan' },
];

const getColorClasses = (color, isActive) => {
  const colors = {
    blue: isActive ? 'bg-blue-50 text-blue-700 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
    green: isActive ? 'bg-green-50 text-green-700 border-green-700' : 'text-gray-600 hover:bg-green-50 hover:text-green-600',
    orange: isActive ? 'bg-orange-50 text-orange-700 border-orange-700' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600',
    indigo: isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
    cyan: isActive ? 'bg-cyan-50 text-cyan-700 border-cyan-700' : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600',
    red: isActive ? 'bg-red-50 text-red-700 border-red-700' : 'text-gray-600 hover:bg-red-50 hover:text-red-600',
  };
  return colors[color];
};

const getBottomNavColor = (color, isActive) => {
  const colors = {
    blue: isActive ? 'text-blue-600' : 'text-gray-400',
    green: isActive ? 'text-green-600' : 'text-gray-400',
    orange: isActive ? 'text-orange-600' : 'text-gray-400',
    indigo: isActive ? 'text-indigo-600' : 'text-gray-400',
    cyan: isActive ? 'text-cyan-600' : 'text-gray-400',
    red: isActive ? 'text-red-600' : 'text-gray-400',
  };
  return colors[color];
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Detect admin (matches your logic)
  const isAdmin = isAdminUser(user);

  // Dynamic nav with admin section
  const navItems = [
    ...navConfig,
    ...(isAdmin ?
      [{ id: 'users', label: 'User Management', shortLabel: 'Users', icon: UserCog, color: 'red' }] : []),
  ];

  // Handle logout with testing mode
  const handleLogout = () => {
    if (TESTING_MODE) {
      if (window.confirm('In testing mode. Do you want to go to the login page?')) {
        navigate('/login');
      }
      return;
    }
    logout();
    navigate('/login');
  };

  // Render actual tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview onNavigate={setActiveTab} />;
      case 'inventory':
        return <RadiatorList onNavigate={setActiveTab} />;
      case 'warehouses':
        return <WarehouseManagement />;
      case 'stock':
        return <StockManagement />;
      case 'activity':
        return <ActivityPage />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  // User profile initials (fallback if no user)
  const userInitials = user?.username
    ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={`hidden lg:flex lg:translate-x-0 lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-all duration-300 flex-col`}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Chan Mary 333</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] ${
                  isActive ? 'border-l-4' : 'border-l-4 border-transparent'
                } ${getColorClasses(item.color, isActive)}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {userInitials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : (user?.role || 'User')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full pb-16 lg:pb-0">
        {/* Top Bar */}
        <header className="min-h-[64px] bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 sm:px-4 md:px-6 py-3">
          {/* Mobile: Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {navItems.find(item => item.id === activeTab)?.label || 'Overview'}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Manage your radiator inventory and stock</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium">
              <span className="hidden sm:inline">System </span>Online
            </div>
            {/* Mobile: Logout button */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Real Content Area */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.filter((item) => item.id !== 'users').map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 min-h-[52px] ${
                  isActive ? 'bg-gray-50' : ''
                } ${getBottomNavColor(item.color, isActive)}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.shortLabel}
                </span>
                {isActive && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${
                    item.color === 'blue' ? 'bg-blue-600' :
                    item.color === 'orange' ? 'bg-orange-600' :
                    item.color === 'indigo' ? 'bg-indigo-600' :
                    item.color === 'green' ? 'bg-green-600' :
                    item.color === 'cyan' ? 'bg-cyan-600' :
                    'bg-red-600'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Testing Mode Info Box */}
      {TESTING_MODE && (
        <div className="fixed bottom-20 lg:bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg max-w-xs z-50">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-sm">Testing Mode Active</p>
              <p className="text-xs mt-1">Authentication is disabled for testing. Set TESTING_MODE to false in App.jsx and AuthContext.jsx to enable authentication.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
