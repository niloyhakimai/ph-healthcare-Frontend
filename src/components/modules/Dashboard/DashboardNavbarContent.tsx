"use client"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types"
import { Menu } from "lucide-react";
import { useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardNavbarProps {
    userInfo : UserInfo;
    navItems : NavSection[];
    dashboardHome : string
}

const DashboardNavbarContent = ({dashboardHome, userInfo, navItems} : DashboardNavbarProps) => {
    
        const [isOpen, setIsOpen] = useState(false);
        const isMobile = useIsMobile();

    return (
    <div className="flex w-full items-center gap-4">
        {/* Mobile Menu Toggle Button */}
        <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
                <Button variant={"outline"} size={"icon"}>
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent>
                <DashboardMobileSidebar userInfo={userInfo} dashboardHome={dashboardHome} navItems={navItems} />
            </SheetContent>
        </Sheet>


        {/* Search Component */}
        <div className="flex-1 flex items-center justify-end gap-2">
            <div className="relative w-full max-w-md hidden sm:block">
                <search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"/>
                <Input type="text" placeholder="Search..." className="pl-9 pr-4" />
            </div>
        </div>

        {/* Notification */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <UserDropdown userInfo={userInfo} />
    </div>
  )
}

export default DashboardNavbarContent