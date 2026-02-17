// lib/sidebarLinks.ts
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  FileText,
  LogOut,
  HelpCircle,
  CreditCard,
  Database,
} from "lucide-react";

export const adminLinks = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
  },
  {
    title: "Dynamic Questions",
    href: "/admin/dashboard/questions",
    icon: HelpCircle,
  },
  {
    title: "Pricing",
    href: "/admin/dashboard/pricing",
    icon: CreditCard,
  },
  {
    title: "RAG",
    href: "/admin/dashboard/rag",
    icon: Database,
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];

export const userLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "My Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Pricing",
    href: "/dashboard/pricing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];
