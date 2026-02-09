"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Puzzle,
  Settings,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["bd_manager", "eng_manager", "engineer"] as UserRole[] },
  { name: "Projects", href: "/projects", icon: FolderKanban, roles: ["bd_manager", "eng_manager", "engineer"] as UserRole[] },
  { name: "Employees", href: "/employees", icon: Users, roles: ["eng_manager"] as UserRole[] },
  { name: "Matching", href: "/matching", icon: Puzzle, roles: ["eng_manager"] as UserRole[] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["eng_manager"] as UserRole[] },
];

const roleLabels: Record<UserRole, string> = {
  bd_manager: "BD Program Manager",
  eng_manager: "Engineering Manager",
  engineer: "Engineer",
};

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("eng_manager");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user-role") as UserRole | null;
    if (stored) setRole(stored);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("user-role", newRole);
    setRoleMenuOpen(false);
    window.dispatchEvent(new CustomEvent("role-change", { detail: newRole }));
  };

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">StaffCast</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Viewing as</span>
              <span className="font-medium text-foreground">{roleLabels[role]}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", roleMenuOpen && "rotate-180")} />
          </button>

          {roleMenuOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg">
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={cn(
                    "flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors",
                    r === role
                      ? "bg-primary/10 text-primary"
                      : "text-popover-foreground hover:bg-accent"
                  )}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
