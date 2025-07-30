// components/layout/Navigation.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BookOpenIcon,
  SpeakerphoneIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Tests', href: '/tests', icon: AcademicCapIcon },
      { name: 'Notes', href: '/notes', icon: BookOpenIcon },
      { name: 'Blogs', href: '/blogs', icon: DocumentTextIcon },
      { name: 'Notices', href: '/notices', icon: SpeakerphoneIcon }
    ];

    const teacherItems = [
      ...commonItems,
      { name: 'Create Test', href: '/tests/create', icon: AcademicCapIcon },
      { name: 'Upload Notes', href: '/notes/upload', icon: BookOpenIcon },
      { name: 'Write Blog', href: '/blogs/create', icon: DocumentTextIcon },
      { name: 'Post Notice', href: '/notices/create', icon: SpeakerphoneIcon }
    ];

    const adminItems = [
      ...teacherItems,
      { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
      { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
      { name: 'Settings', href: '/admin/settings', icon: CogIcon }
    ];

    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'teacher':
        return teacherItems;
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActive
                ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <item.icon
            className="mr-3 h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;