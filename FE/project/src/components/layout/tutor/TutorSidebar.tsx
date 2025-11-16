import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorSidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Students',
    href: '/students',
    icon: Users,
  },
  {
    title: 'Schedule',
    href: '/schedule',
    icon: Calendar,
  },
   {
    title: 'Bookings',
    href: '/bookings',
    icon: BookOpen,
  },
  
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
  },
  {
      title: 'Quản lý thanh toán',
      href: '/payments',
      icon: CreditCard,
    },
  {
    title: 'Resources',
    href: '/resources',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const TutorSidebar: React.FC<TutorSidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto z-40">
      <nav className="p-4 space-y-2 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-gray-100 group',
                active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default TutorSidebar;
