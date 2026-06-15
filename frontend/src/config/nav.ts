import { Building2, LayoutDashboard, Users, Calendar, Stethoscope, FileText, Receipt, MessageSquareCode } from "lucide-react";

export const NAVIGATION = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Records", href: "/records", icon: FileText },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquareCode },
];
