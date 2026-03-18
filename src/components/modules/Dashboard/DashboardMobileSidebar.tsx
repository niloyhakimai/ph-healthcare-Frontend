"use client"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types"
import Link from "next/link";
import { usePathname } from "next/navigation";


interface DashboardMobileSidebarProps{
  userInfo : UserInfo;
  navItems : NavSection[];
  dashboardHome : string;
}
const DashboardMobileSidebar = ({dashboardHome, userInfo, navItems} : DashboardMobileSidebarProps) => {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-start px-4 py-3 border-b flex-shrink-0">
        <Link href={dashboardHome} className="flex items-center gap-2.5 group">
          {/* Modern Logo Badge */}
          <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-primary to-primary/80 rounded-lg shadow-md group-hover:shadow-lg transition-all">
            <span className="text-white font-bold text-sm">PH</span>
          </div>
          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">PH</span>
            <span className="text-xs font-medium text-muted-foreground">Healthcare</span>
          </div>
        </Link>
      </div>
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      
      {/* Navigation Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <nav className="space-y-6 px-4 py-4">
          {
            navItems.map((section, sectionId) => (
              <div key={sectionId}>
                {
                  section.title && (
                    <h4 className="mb-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h4>
                  )
                }
                <div className="space-y-1">
                  {
                    section.items.map((item, id) => {
                      const isActive = pathname === item.href
                      const Icon = getIconComponent(item.icon)

                      return <Link href={item.href} key={id}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}
                      >
                        <Icon className="h-4 w-4"/>
                        <span className="flex-1">{item.title}</span>
                      </Link>
                    })
                  }
                </div>

                {
                  sectionId < navItems.length - 1 && (
                    <div className="mt-6 mb-0">
                      <Separator className="opacity-50" />
                    </div>
                  )
                }
              </div>
            ))
          }
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="border-t px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userInfo.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {userInfo.role.toLocaleLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMobileSidebar