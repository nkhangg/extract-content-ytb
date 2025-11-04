"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";

import { authApi } from "@/api/auth-api.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import type { RootState } from "@/store";
import { clearUser } from "@/store/slices/app.slice";
import { useSelector } from "react-redux";
import { ConfirmAlert } from "./btn/confirm-alert";
import Loader from "./loader";
import { Button } from "./ui/button";

export function NavUser() {
  const { user } = useSelector((state: RootState) => state.app);

  const { isMobile } = useSidebar();

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const response = await authApi.logout();

    if (response?.data) {
      dispatch(clearUser());
      location.reload();
    }
  };

  const fullname = (user: IUser) => {
    return `${user.first_name} ${user.last_name}`;
  };

  if (!user) return <Loader />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={""} alt={fullname(user)} />
                <AvatarFallback className="rounded-lg">
                  {user.first_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullname(user)}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={""} alt={fullname(user)} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullname(user)}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ConfirmAlert
                onConfirm={handleLogout}
                title="Đăng xuất khỏi hệ thống ?"
                description="Hành động này sẽ đăng xuất khỏi hệ thống."
              >
                <Button
                  variant={"ghost"}
                  size={"xs"}
                  className="justify-start font-normal"
                >
                  <LogOut />
                  Log out
                </Button>
              </ConfirmAlert>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
