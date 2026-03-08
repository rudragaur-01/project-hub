import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Menu, X, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || user?.email || "User";

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
          isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-100 text-gray-700",
        )
      }
    >
      <Icon className="size-5" />
      {label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 p">
      {/* Mobile Topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b p-3 flex items-center justify-between z-50">
        <button onClick={() => setSidebarOpen((prev) => !prev)}>
          <Menu className="size-6" />
        </button>
        <span className="font-semibold ">ProjectHub</span>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static z-40 top-0 left-0 w-64 bg-white border-r transform transition-transform flex flex-col min-h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold w-full">ProjectHub</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          {/* <NavItem to="/projects" icon={FolderOpen} label="Projects" /> */}
        </nav>

        {/* User Section */}
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <User className="size-5" />
            <span className="text-sm">{displayName}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-6 mt-12 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
