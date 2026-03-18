import { getDefaultdashboardRoute } from '@/lib/authUtils';
import { getNavItemsByRole } from '@/lib/navItems';
import { NavSection } from '@/types/dashboard.types';
import React from 'react'
import { UserInfo } from '@/types/user.types';
import DashboardNavbarContent from './DashboardNavbarContent';

interface DashboardNavbarProps {
  userInfo: UserInfo;
}

const DashboardNavbar = ({ userInfo }: DashboardNavbarProps) => {
        const navItems : NavSection[] = getNavItemsByRole(userInfo.role);
    
        const dashboardHome = getDefaultdashboardRoute(userInfo.role)
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6 py-0">
      <DashboardNavbarContent userInfo={userInfo} navItems={navItems} dashboardHome={dashboardHome} />
    </header>
  )
}

export default DashboardNavbar