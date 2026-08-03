import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, UserPlus } from "lucide-react";
import { ModeToggle } from "./ModeToggler";
import { Link } from "react-router";
import { useGetAllAdminQuery } from "@/redux/features/user/user.api";
import logoLight from "@/assets/images/logo/logo.png";
import logoDark from "@/assets/images/logo/logo.png";

export default function DashboardHeader() {
      const { data } = useGetAllAdminQuery({});
      return (
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 bg-background">
                  {/* Left Side: Search Bar & Filter */}
                  <div className="flex flex-1 items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-muted-foreground" />

                        {/* Mobile Logo */}
                        <Link to="/" className="md:hidden flex items-center shrink-0">
                              <img
                                    src={logoLight}
                                    alt="Logo"
                                    className="h-10 w-auto block dark:hidden"
                              />
                              <img
                                    src={logoDark}
                                    alt="Logo"
                                    className="h-10 w-auto hidden dark:block"
                              />
                        </Link>

                        <div className="hidden md:block w-full max-w-md">
                              {/* Search Bar Pill */}
                              <div className="flex  h-11 w-full items-center gap-2 rounded-full bg-secondary/10 shadow dark:bg-secondary/60 px-4 text-muted-foreground transition-colors focus-within:text-foreground">
                                    <Search className="h-4 w-4 shrink-0" />
                                    <input
                                          type="text"
                                          placeholder="Search here..."
                                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    />
                                    <div className="flex items-center justify-center rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                                          ⌘ S
                                    </div>
                              </div>
                        </div>
                  </div>

                  {/* Right Side: Actions & Profile */}
                  <div className="flex items-center gap-3">

                        <ModeToggle />

                        {/* Notification Button */}
                        <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground">
                              <Bell className="h-5 w-5" />
                              <span className="absolute right-3 top-3 h-2 w-2 rounded-full border-2 border-background bg-orange-500"></span>
                        </button>

                        <Separator orientation="vertical" className="hidden sm:block mx-1 h-6" />

                        {/* Avatars & Invite Group */}
                        <div className="hidden sm:flex items-center gap-3 rounded-full bg-secondary/10 dark:bg-secondary/60 p-1.5 pr-2">
                              {/* Mock Avatars */}
                              <div className="flex -space-x-2 pl-1">
                                    <img src="https://i.pravatar.cc/150?img=11" alt="User" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                                    <img src="https://i.pravatar.cc/150?img=5" alt="User" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                                    <img src="https://i.pravatar.cc/150?img=12" alt="User" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                              </div>
                              <span className="pr-1 text-sm font-semibold text-foreground">+{data?.data?.length || 0}</span>

                              {/* Invite Button */}
                              <Link to="/admin/invite">
                                    <button className="flex cursor-pointer h-9 items-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-black/10">
                                                <UserPlus className="h-3 w-3" />
                                          </div>
                                          Invite
                                    </button>
                              </Link>
                        </div>

                        {/* Your original User Profile Menu */}
                        {/* {userInfo && (
                              <div className="flex items-center gap-2">
                                    <UserProfileMenu userInfo={userInfo} />
                              </div>
                        )} */}
                  </div>
            </header>
      );
}