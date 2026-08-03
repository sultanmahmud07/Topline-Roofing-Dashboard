import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateRoutes } from "@/utils/generateRoutes";
import { createBrowserRouter } from "react-router";
import { adminSidebarItems } from "./adminSidebarItems";
import UserDetails from "@/components/modules/User/UserDetails";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Verify from "@/pages/Verify";
import Unauthorized from "@/pages/Unauthorized";
import { withAuth } from "@/utils/withAuth";
import { role } from "@/constants/role";
import BlogDetails from "@/components/modules/Blogs/BlogDetails";
import Analytics from "@/pages/Analytics/Analytics";
import EditBlog from "@/components/modules/Blogs/EditBlog/EditBlog";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import EditCategory from "@/pages/Category/EditCategory";
import EditProduct from "@/pages/Product/EditProduct";
import ProductDetails from "@/pages/Product/ProductDetails";
import AddAdmin from "@/components/modules/Admin/AddAdmin";
import ContactDetails from "@/components/modules/Contact/ContactDetails";
import CreateAddress from "@/components/modules/Availability/CreateAddress";
import ViewInspectDetails from "@/components/modules/Inspection/InspectionDetails";
import UpdateAddress from "@/components/modules/Availability/UpdateAddress";

export const router = createBrowserRouter([
  {
    Component: withAuth(DashboardLayout, [role.superAdmin, role.admin]),
    path: "/",
    children: [
      {
        Component: Analytics,
        index: true,
      },
      ...generateRoutes(adminSidebarItems),
      {
        Component: Register,
        path: "/register",
      },
      {
        Component: AddAdmin,
        path: "/admin/invite",
      },
      {
        path: "/news/view/:slug",
        Component: BlogDetails,
      },
      {
        path: "/news/edit/:slug",
        Component: EditBlog,
      },
      {
        path: "/locations/create",
        Component: CreateAddress,
      },
      {
        path: "/locations/edit/:id",
        Component: UpdateAddress,
      },
      {
        path: "/inspection/view/:id",
        Component: ViewInspectDetails,
      },
      {
        path: "/category/edit/:slug",
        Component: EditCategory,
      },
      {
        path: "/product/view/:slug",
        Component: ProductDetails,
      },
      {
        path: "/product/edit/:slug",
        Component: EditProduct,
      },
      {
        path: "/user/:id",
        Component: UserDetails,
      },
      {
        path: "/contact/:id",
        Component: ContactDetails,
      },
    ],
  },
  {
    Component: Login,
    path: "/login",
  },
  {
    Component: ForgotPassword,
    path: "/forgot-password",
  },
  {
    Component: ResetPassword,
    path: "/reset-password",
  },
  {
    Component: Verify,
    path: "/verify",
  },
  {
    Component: Unauthorized,
    path: "/unauthorized",
  },

]);
