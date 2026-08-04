import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { 
  GraduationCap, 
  LogOut, 
  Settings, 
  Users, 
  Beaker, 
  BookOpen,
  Calendar,
  MessageSquare,
  Trophy,
  FileText,
  Home,
  HelpCircle,
  User,
  Menu,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  userRoles: string[];
  userName?: string;
  showNav?: boolean;
}

export const AppHeader = ({ title, subtitle, userRoles, userName, showNav = true }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const isAdmin = userRoles.includes("admin");
  const isTeacher = userRoles.includes("teacher");
  const isLabTech = userRoles.includes("lab_tech");
  const isParent = userRoles.includes("parent");

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Quizzes", path: "/quizzes" },
    { icon: Beaker, label: "Virtual Lab", path: "/virtual-lab" },
    { icon: BookOpen, label: "Content Library", path: "/content-library" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  ];

  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-strong">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary-foreground/20 p-1.5 md:p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold truncate max-w-[150px] sm:max-w-none">{title}</h1>
              {subtitle && <p className="text-primary-foreground/90 text-sm hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {showNav && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Home className="w-4 h-4 mr-1" />
                    Navigate
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/help")}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/install")}>
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </DropdownMenuItem>
                  
                  {(isAdmin || isTeacher) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Management</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate("/admin/assignments/create")}>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Assignment
                      </DropdownMenuItem>
                    </>
                  )}

                  {isParent && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/parent-dashboard")}>
                        <Users className="w-4 h-4 mr-2" />
                        Parent Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <NotificationBell />
            
            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}
            
            {isParent && !isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/parent-dashboard")}>
                <Users className="w-4 h-4 mr-1" />
                Parent
              </Button>
            )}
            
            {isLabTech && !isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/virtual-lab")}>
                <Beaker className="w-4 h-4 mr-1" />
                Lab
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {BRAND.name}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate(item.path)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                  
                  <div className="h-px bg-border my-2" />
                  
                  <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/profile")}>
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/help")}>
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help Center
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/install")}>
                    <Download className="w-4 h-4 mr-3" />
                    Install App
                  </Button>

                  {isAdmin && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/admin")}>
                        <Settings className="w-4 h-4 mr-3" />
                        Admin Panel
                      </Button>
                    </>
                  )}

                  {isParent && (
                    <Button variant="ghost" className="justify-start" onClick={() => handleNavigate("/parent-dashboard")}>
                      <Users className="w-4 h-4 mr-3" />
                      Parent Dashboard
                    </Button>
                  )}
                  
                  <div className="h-px bg-border my-2" />
                  
                  <Button 
                    variant="ghost" 
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
