import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { logoutUser } from "@/services/auth.services"
import { UserInfo } from "@/types/user.types"
import { Key, LogOut, User } from "lucide-react"
import Link from "next/link"


interface UserDropdownProps {
    userInfo : UserInfo
}


const UserDropdown = ({userInfo} : UserDropdownProps) => {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={"outline"} size={"icon"} className="rounded-full">
                <span className="text-sm font-semibold">
                    {userInfo.name.charAt(0).toLowerCase()}
                </span>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={"end"} className="w-56">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                        {userInfo.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {userInfo.email}
                    </p>
                    <p className="text-sm text-primary capitalize">
                        {userInfo.role.toLowerCase().replace("_", " ")}
                    </p>
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />


            <DropdownMenuItem asChild>
                <Link href={"/my-profile"} className="flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                    My Profile
                </Link>

            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={"/change-password"} className="flex w-full items-center">
                <Key className="mr-2 h-4 w-4" />
                    Change Password
                </Link>

            </DropdownMenuItem>

                <DropdownMenuSeparator />

            <form action={logoutUser}>
            <DropdownMenuItem asChild className="cursor-pointer text-red-600">
                <button type="submit" className="flex w-full items-center">
                <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </button>
            </DropdownMenuItem>
            </form>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
