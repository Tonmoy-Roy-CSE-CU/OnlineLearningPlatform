import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Plus,
  BarChart3,
  BookOpen,
  PenTool,
  Bell,
  Users,
  FolderOpen,
  Activity,
  Upload
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService'; // ✅ IMPORT HERE
import { NAVIGATION_ITEMS } from '@/utils/constants';

// Icon mapping
const iconMap = {
  Home,
  FileText,
  Plus,
  BarChart3,
  BookOpen,
  PenTool,
  Bell,
  Users,
  FolderOpen,
  Activity,
  Upload,
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth(); // ✅ Removed isAdmin, isTeacher, etc.
  const location = useLocation();

  // ✅ Role-based navigation
  const getNavigationItems = () => {
    if (authService.isAdmin()) {
      return NAVIGATION_ITEMS.ADMIN;
    } else if (authService.isTeacher()) {
      return NAVIGATION_ITEMS.TEACHER;
    } else {
      return NAVIGATION_ITEMS.STUDENT;
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600 text-white">
          <span className="text-lg font-semibold">Navigation</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role || 'Role'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item, index) => {
              const Icon = iconMap[item.icon] || Home;
              const isActive = isActiveLink(item.path);

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleItemClick}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Role-specific shortcuts */}
        {authService.isTeacher() && (
          <div className="mt-8 px-3">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="mt-2 space-y-1">
              <Link
                to="/tests/create"
                onClick={handleItemClick}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <Plus className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                Create Test
              </Link>
              <Link
                to="/notes/upload"
                onClick={handleItemClick}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <Upload className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                Upload Notes
              </Link>
              <Link
                to="/blogs/create"
                onClick={handleItemClick}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <PenTool className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                Write Blog
              </Link>
              <Link
                to="/notices/create"
                onClick={handleItemClick}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <Bell className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                Post Notice
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            OLPM v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
