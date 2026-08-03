import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import DashboardHeader from "./DashboardHeader"; // Import your new Header

export default function DashboardLayout() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        
        <DashboardHeader />

        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}