import { Outlet, Link, useLocation } from "react-router-dom";
import { NAVIGATION } from "../config/nav";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r border-gray-200 flex-col shadow-sm z-30 transition-all duration-200",
        "md:flex",
        mobileMenuOpen ? "fixed inset-y-0 left-0 flex" : "hidden"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <Building2 className="text-primary-700 h-6 w-6 mr-3" />
          <span className="font-semibold text-lg text-gray-800 tracking-tight">Sanjeevani HMS</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-primary-600" : "text-gray-400")}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">A</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 md:hidden shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-500 hover:text-gray-700">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <Building2 className="text-primary-700 h-5 w-5 mr-2" />
            <span className="font-semibold text-gray-800">Sanjeevani</span>
          </div>
          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
