"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Bell, CalendarDays, Clock, UserPlus } from "lucide-react";
import { useSyncExternalStore } from "react";

interface Notification {
    id: string;
    title:  string;
    message : string;
    type : "appointment" | "schedule" | "system" | "user";
    timestamp: string;
    read : boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "New Appointment Scheduled",
        message: "You have a new appointment schedule with John Doe on 2024-06-15 at 10:00 AM.",
        type : "appointment",
        timestamp: "2026-03-14T09:30:00.000Z",
        read:false
    }
    ,{
        id: "2",
        title: "Appointment Reminder",
        message: "Reminder: Your appointment with Dr. Smith is scheduled for tomorrow at 3:00 PM.",
        type: "schedule",
        timestamp: "2026-03-14T08:00:00.000Z",
        read: false
    },
    {
        id: "3",
        title: "Appointment Cancelled",
        message: "Your appointment with Sarah Lee on 2024-06-18 has been cancelled.",
        type: "system",
        timestamp: "2026-03-14T05:00:00.000Z",
        read: true
    },
    {
        id: "4",
        title: "New Message from Doctor",
        message: "Dr. Adams sent you a message regarding your last consultation.",
        type: "user",
        timestamp: "2026-03-14T00:00:00.000Z",
        read: false
    },

]


const getNotificationIcon = (type : Notification["type"]) => {
    switch(type) {
        case "appointment":
            return <CalendarDays className="h-4 w-4 text-blue-600" />
        case "schedule":
            return <Clock className="h-4 w-4 text-amber-600" />
        case "user":
            return <UserPlus className="h-4 w-4 text-green-600" />

        default:
            return <Bell className="h-4 w-4 text-gray-600" />
    }
}

const NotificationDropdown = () => {
    const isHydrated = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    );
    const unreadCount = MOCK_NOTIFICATIONS.filter(notification => !notification.read).length;

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={"outline"} size={"icon"} className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center" variant={"destructive"}>
                    <span className="text-[10px]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                </Badge>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={"end"} className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
                <span>
                    Notification
                </span>
                {
                    unreadCount > 0 && (
                        <Badge variant={"secondary"} className="ml-2">
                            {unreadCount}
                        </Badge>
                    )
                }
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>

            <ScrollArea className="h-75">
                {
                    MOCK_NOTIFICATIONS.length > 0 ? (
                       MOCK_NOTIFICATIONS.map(notification => (
                        <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-2 p-3 cursor-pointer">
                            <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        {notification.title}
                                    </p>
                                    {
                                        !notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-600"/>
                                        )
                                    }
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {isHydrated
                                        ? formatDistanceToNow(new Date(notification.timestamp), {
                                            addSuffix: true
                                        })
                                        : "Recently"}
                                </p>
                            </div>
                        </DropdownMenuItem>
                       ))
                    ) : (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No Notifications
                        </div>
                    )
                }
            </ScrollArea>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-center justify-center cursor-pointer">
                View All Notifications
            </DropdownMenuItem>
        </DropdownMenuContent>

    </DropdownMenu>
  )
}

export default NotificationDropdown
