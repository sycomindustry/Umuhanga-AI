import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Beaker, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  FileText,
  GraduationCap,
  HelpCircle,
  Mail,
  Phone
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I start learning?",
      answer: "After signing in, go to your Dashboard where you'll see available subjects based on your education level. Click on any subject to start with the AI Tutor, or explore quizzes and virtual labs."
    },
    {
      question: "What is the AI Tutor?",
      answer: "The AI Tutor is your personal learning assistant. It can explain concepts step-by-step, answer questions, and help you understand difficult topics in Kinyarwanda, English, or French."
    },
    {
      question: "How do virtual labs work?",
      answer: "Virtual labs simulate real science experiments. You can conduct physics, chemistry, and biology experiments safely on your computer. Select an experiment, follow the procedure, and observe the results."
    },
    {
      question: "How are quizzes scored?",
      answer: "Each quiz has multiple-choice questions worth points. Your score is calculated based on correct answers. You can see your results immediately after completing a quiz, and your progress is tracked on the leaderboard."
    },
    {
      question: "Can I use this on my phone?",
      answer: `Yes! ${BRAND.name} works on all devices. You can even install it as an app on your phone from your browser. Look for "Add to Home Screen" in your browser menu.`
    },
    {
      question: "How do I change my education level?",
      answer: "Go to your Profile Settings (click your name in the header). You can update your education level there to see content appropriate for your grade."
    },
    {
      question: "What subjects are available?",
      answer: "We offer Physics, Chemistry, Biology, Mathematics, English, Kinyarwanda, and more. Content is tailored for Primary, Secondary, and TVET levels."
    },
    {
      question: "How do I contact my teacher?",
      answer: "Use the Messages feature to send messages to your teachers. Click on Messages in the navigation menu to start a conversation."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const features = [
    {
      icon: GraduationCap,
      title: "AI Tutor",
      description: "Get personalized help from your AI teacher in any subject. Ask questions in Kinyarwanda, English, or French."
    },
    {
      icon: Beaker,
      title: "Virtual Labs",
      description: "Conduct safe, interactive science experiments with realistic simulations."
    },
    {
      icon: FileText,
      title: "Quizzes",
      description: "Test your knowledge with quizzes and track your progress over time."
    },
    {
      icon: Trophy,
      title: "Leaderboard",
      description: "Compete with other students and earn your place on the leaderboard."
    },
    {
      icon: BookOpen,
      title: "Content Library",
      description: "Access videos, documents, and learning materials for all subjects."
    },
    {
      icon: Calendar,
      title: "Calendar",
      description: "Keep track of assignments, exams, and important dates."
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Communicate with teachers and classmates directly."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Help Center</h1>
              <p className="text-primary-foreground/90">Get help using {BRAND.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {/* Quick Start */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFaqs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No results found for "{searchQuery}"
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@umuhanga.ai</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+250 788 000 000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Help;
