import { getDefaultdashboardRoute } from '@/lib/authUtils';
import { getNavItemsByRole } from '@/lib/navItems';
import { NavSection } from '@/types/dashboard.types';
import React from 'react'
import { UserInfo } from '@/types/user.types';
import DashboardSidebarContent from './DashboardSidebarContent';

interface DashboardSiderbarProps {
  userInfo: UserInfo;
}

const DashboardSiderbar = ({ userInfo }: DashboardSiderbarProps) => {
    const navItems : NavSection[] = getNavItemsByRole(userInfo.role);

    const dashboardHome = getDefaultdashboardRoute(userInfo.role)
  return (
   <DashboardSidebarContent userInfo={userInfo} navItems={navItems} dashboardHome={dashboardHome} />
  )
}

export default DashboardSiderbar