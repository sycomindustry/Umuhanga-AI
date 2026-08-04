import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Beaker, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userRoles: string[];
}

export const MobileNav = ({ userRoles }: MobileNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: FileText, label: "Quizzes", path: "/quizzes" },
    { icon: Beaker, label: "Lab", path: "/virtual-lab" },
    { icon: BookOpen, label: "Library", path: "/content-library" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
