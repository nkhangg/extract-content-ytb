"use client";

import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LogOut, Menu, Settings, ShoppingCart, User } from "lucide-react";

import { authApi } from "@/api/auth-api.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Links } from "@/config/links";
import { useCartCount } from "@/hooks/fetchs/use-cart-count";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import type { RootState } from "@/store";
import { setUser } from "@/store/slices/app.slice";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ConfirmAlert } from "../btn/confirm-alert";
import { DialogTitle } from "../ui/dialog";

export function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.app);
  const [isOpen, setIsOpen] = useState(false);

  const cartQuery = useCartCount();

  const getProfile = async () => {
    try {
      const res = await authApi.me();

      if (res?.status_code === 200) {
        dispatch(setUser(res.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();

    window.location.reload();
  };

  useEffect(() => {
    getProfile();
  }, []);

  const getUserInitials = () => {
    if (!user) return "U";

    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }

    if (user.first_name) {
      return user.first_name.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  const getDisplayName = () => {
    if (!user) return "Guest";

    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ");
    return fullName || user.email || "User";
  };

  const getCompanyName = () => {
    return user?.company?.name || null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to={Links.HOME}>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">B</span>
            </div>
            <span className="text-xl font-semibold">BrokerBin</span>
          </div>
        </Link>

        <NavigationMenu viewport={false} className="hidden lg:flex">
          <NavigationMenuList>
            {Links.MENUS.map((menu) => (
              <NavigationMenuItem key={menu.id}>
                {/* Menu không có submenu */}
                {!menu.items?.length ? (
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link to={menu.href || "#"}>{menu.label}</Link>
                  </NavigationMenuLink>
                ) : (
                  /* Menu có submenu */
                  <>
                    <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-2">
                        {menu.items.map((item: any) => {
                          if (
                            item.permissions &&
                            !user?.permissions.some(
                              (subItem: any) => subItem.key === item.permissions
                            )
                          ) {
                            return "";
                          }

                          return (
                            <li key={item.label}>
                              <NavigationMenuLink asChild>
                                <Link to={item.href || "#"}>{item.label}</Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button> */}

          <Link to={Links.MY_CART}>
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
            >
              <ShoppingCart className="h-4 w-4" />
              {!cartQuery.isLoading &&
                cartQuery.data?.data?.total_items > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartQuery.data?.data?.total_items}
                  </Badge>
                )}
            </Button>
          </Link>

          {/* Notifications */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:flex"
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto py-2 px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium max-w-[150px] truncate leading-tight">
                    {getDisplayName()}
                  </span>
                  {getCompanyName() && (
                    <span className="text-xs text-muted-foreground max-w-[150px] truncate leading-tight">
                      {getCompanyName()}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && (
                <>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {getDisplayName()}
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                      {getCompanyName() && (
                        <p className="text-xs text-muted-foreground truncate font-medium">
                          {getCompanyName()}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <Link to={Links.PROFILE}>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link to={Links.SETTING}>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <ConfirmAlert
                title="Logout"
                description="Do you really want to log out?"
                onConfirm={handleLogout}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </ConfirmAlert>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <VisuallyHidden>
              <DialogTitle>My Hidden Title</DialogTitle>
            </VisuallyHidden>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {Links.MENUS.map((section) => (
                  <div key={section.id} className="space-y-2">
                    {/* Section Title */}
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {section.label}
                    </h3>

                    {/* Section Items */}
                    <div className="space-y-1 pl-4">
                      {section.items.map((item) => (
                        <Button
                          key={item.label}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
