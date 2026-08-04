import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Brain, Globe, Zap, BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-foreground/20 backdrop-blur-sm p-6 rounded-full animate-in zoom-in duration-700">
              <GraduationCap className="w-20 h-20" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {BRAND.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {BRAND.tagline}
          </p>
          <p className="text-lg mb-12 text-primary-foreground/80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Learn any subject with a personal AI teacher, and explore world-class virtual laboratories even without physical school resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-strong text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Learn Smarter, Not Harder
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Cutting-edge AI technology designed for Rwandan students
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-gradient-primary p-4 rounded-lg w-fit mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">AI-Powered Tutoring</CardTitle>
                <CardDescription className="text-base">
                  Get instant, personalized help with any subject. Our AI tutor adapts to your learning style and explains concepts in ways you understand.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-secondary/20 hover:border-secondary hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-gradient-secondary p-4 rounded-lg w-fit mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Tri-language Support</CardTitle>
                <CardDescription className="text-base">
                  Learn in Kinyarwanda, English, or French. Switch languages anytime to strengthen your understanding.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-accent p-4 rounded-lg w-fit mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Instant Feedback</CardTitle>
                <CardDescription className="text-base">
                  Get immediate responses to your questions. No waiting for teachers or classmates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-gradient-primary p-4 rounded-lg w-fit mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">All Subjects Covered</CardTitle>
                <CardDescription className="text-base">
                  From Mathematics to Science, from Primary to TVET. Complete curriculum support for all education levels.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-secondary/20 hover:border-secondary hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-gradient-secondary p-4 rounded-lg w-fit mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Progress Tracking</CardTitle>
                <CardDescription className="text-base">
                  Monitor your learning journey. Parents and teachers can track student progress and identify areas for improvement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent hover:shadow-medium transition-smooth">
              <CardHeader>
                <div className="bg-accent p-4 rounded-lg w-fit mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Exam Preparation</CardTitle>
                <CardDescription className="text-base">
                  Practice with past papers and get detailed explanations for every question. Ace your national exams with confidence.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of Rwandan students already learning with AI
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-strong text-lg px-12 py-6"
          >
            Start Learning Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">© 2024 {BRAND.name}. {BRAND.tagline}</p>
            <div className="flex gap-4 text-sm">
              <Button variant="link" className="text-muted-foreground p-0 h-auto" onClick={() => navigate("/help")}>
                Help
              </Button>
              <Button variant="link" className="text-muted-foreground p-0 h-auto" onClick={() => navigate("/install")}>
                Install App
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
