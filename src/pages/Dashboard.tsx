import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { LabTechDashboard } from "@/components/dashboard/LabTechDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { BRAND } from "@/lib/brand";

interface Subject {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  education_level: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadUserRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data) {
      setUserRoles(data.map(r => r.role));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
        loadSubjects();
        loadUserRoles(session.user.id);
        
        // Check if user needs onboarding
        const onboardingCompleted = localStorage.getItem("onboarding_completed");
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data as Profile);
    }
  };

  const loadSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  };

  // Determine primary role for dashboard display
  const getPrimaryRole = () => {
    if (userRoles.includes("admin")) return "admin";
    if (userRoles.includes("teacher")) return "teacher";
    if (userRoles.includes("lab_tech")) return "lab_tech";
    if (userRoles.includes("parent")) return "parent";
    return "student";
  };

  const primaryRole = getPrimaryRole();

  const getRoleLabel = () => {
    switch (primaryRole) {
      case "admin": return "Administrator";
      case "teacher": return "Teacher";
      case "lab_tech": return "Lab Technician";
      case "parent": return "Parent";
      default: return "Student";
    }
  };

  // Redirect parent to their dedicated dashboard
  useEffect(() => {
    if (primaryRole === "parent" && !loading) {
      navigate("/parent-dashboard");
    }
  }, [primaryRole, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header */}
      <AppHeader 
        title={BRAND.name}
        subtitle={`Welcome back, ${profile?.full_name || "User"}! (${getRoleLabel()})`}
        userRoles={userRoles}
        userName={profile?.full_name}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {primaryRole === "admin" && (
          <AdminDashboard subjects={subjects} loading={loading} />
        )}
        {primaryRole === "teacher" && (
          <TeacherDashboard subjects={subjects} loading={loading} />
        )}
        {primaryRole === "lab_tech" && (
          <LabTechDashboard />
        )}
        {primaryRole === "student" && (
          <StudentDashboard 
            subjects={subjects} 
            educationLevel={profile?.education_level || null}
            loading={loading}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNav userRoles={userRoles} />
    </div>
  );
};

export default Dashboard;
