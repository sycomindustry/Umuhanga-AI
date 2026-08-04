import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, ArrowLeft, Share, Plus, Wifi, WifiOff, RotateCw } from "lucide-react";
import { BRAND } from "@/lib/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Check if installed after prompt
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const benefits = [
    {
      icon: Smartphone,
      title: "Works Like an App",
      description: "Open directly from your home screen, just like any other app"
    },
    {
      icon: WifiOff,
      title: "Works Offline",
      description: "Access your lessons and quizzes even without internet"
    },
    {
      icon: RotateCw,
      title: "Auto Updates",
      description: "Always get the latest features automatically"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Install {BRAND.name}</CardTitle>
            <CardDescription>
              Get the full app experience on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">You're online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">You're offline</span>
                </>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Install Button or Instructions */}
            {isInstalled ? (
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-2" />
                <p className="font-medium text-secondary">App Installed!</p>
                <p className="text-sm text-muted-foreground">
                  You can now find {BRAND.name} on your home screen
                </p>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            ) : isIOS ? (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <p className="font-medium text-center">Install on iPhone/iPad:</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">1</span>
                    <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">3</span>
                    <span>Tap <strong>"Add"</strong> to confirm</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <p className="font-medium text-center">Install on Android:</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">1</span>
                    <span>Tap the menu (⋮) in Chrome</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">2</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 text-xs">3</span>
                    <span>Tap <strong>"Install"</strong> to confirm</span>
                  </li>
                </ol>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Continue in Browser
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
