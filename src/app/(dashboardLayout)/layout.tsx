import DashboardNavbar from '@/components/modules/Dashboard/DashboardNavbar';
import DashboardSiderbar from '@/components/modules/Dashboard/DashboardSiderbar';
import { getUserInfo } from '@/services/auth.services';
import { redirect } from 'next/navigation';
import React from 'react'

const RootDashboardlayout = async ({children} : {children: React.ReactNode}) => {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
        {/* Dashboard Sidebar */}
        <DashboardSiderbar userInfo={userInfo} />
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* DashboardNavbar */}
            <DashboardNavbar userInfo={userInfo} />
            {/* Dashboard Content */}
            <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                <div>
                    {children}
                </div>
            </main>
        </div>
    </div>
  )
}

export default RootDashboardlayout;