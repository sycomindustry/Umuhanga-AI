import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  Lock,
  Unlock,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement, useAchievements } from "@/hooks/useAchievements";
import { useLabSounds } from "@/hooks/useLabSounds";

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

function AchievementCard({ achievement, compact }: AchievementCardProps) {
  const isProgressive = achievement.maxProgress !== undefined;
  const progressPercent = isProgressive
    ? ((achievement.progress || 0) / achievement.maxProgress!) * 100
    : 0;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all",
          achievement.unlocked
            ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30"
            : "bg-muted/30 border-muted-foreground/20 opacity-60"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
            achievement.unlocked
              ? "bg-amber-500/20"
              : "bg-muted"
          )}
        >
          {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm truncate",
            achievement.unlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.name}
          </h4>
          {isProgressive && !achievement.unlocked && (
            <Progress value={progressPercent} className="h-1 mt-1" />
          )}
        </div>
        {achievement.unlocked && (
          <Unlock className="w-4 h-4 text-amber-500 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        achievement.unlocked
          ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10"
          : "bg-muted/20 border-muted-foreground/20 opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform",
              achievement.unlocked
                ? "bg-gradient-to-br from-amber-400/20 to-yellow-500/20 shadow-inner"
                : "bg-muted"
            )}
          >
            {achievement.unlocked ? (
              achievement.icon
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  "font-semibold",
                  achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {achievement.name}
              </h4>
              {achievement.unlocked && (
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.description}
            </p>
            {isProgressive && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>
                    {achievement.progress || 0}/{achievement.maxProgress}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AchievementUnlockPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockPopup({
  achievement,
  onClose,
}: AchievementUnlockPopupProps) {
  const { playSuccess } = useLabSounds();

  useEffect(() => {
    playSuccess();
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose, playSuccess]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="w-80 bg-gradient-to-br from-amber-900/95 via-yellow-900/95 to-orange-900/95 border-amber-500 shadow-2xl shadow-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/30 to-yellow-500/30 flex items-center justify-center text-3xl animate-bounce">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">
                  Achievement Unlocked!
                </span>
              </div>
              <h4 className="font-bold text-white mt-1">{achievement.name}</h4>
              <p className="text-xs text-amber-200/80">{achievement.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-400/60 hover:text-amber-400"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AchievementsPanelProps {
  onClose: () => void;
}

export function AchievementsPanel({ onClose }: AchievementsPanelProps) {
  const { achievements, getUnlockedCount, getTotalCount, getByCategory, resetAchievements } =
    useAchievements();

  const categories = [
    { id: "tutorial", label: "Tutorials", icon: "📚" },
    { id: "safety", label: "Safety", icon: "🛡️" },
    { id: "experiment", label: "Experiments", icon: "🧪" },
    { id: "exploration", label: "Exploration", icon: "🔍" },
    { id: "mastery", label: "Mastery", icon: "👑" },
  ] as const;

  return (
    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-primary/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getUnlockedCount()} / {getTotalCount()} unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAchievements}
              className="text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Progress
          value={(getUnlockedCount() / getTotalCount()) * 100}
          className="h-2 mt-3"
        />
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto max-h-[calc(80vh-120px)]">
        <Tabs defaultValue="tutorial">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <span className="mr-2">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="p-4 space-y-3">
              {getByCategory(cat.id).map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface AchievementBadgeProps {
  onClick: () => void;
}

export function AchievementBadge({ onClick }: AchievementBadgeProps) {
  const { getUnlockedCount, getTotalCount } = useAchievements();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400"
    >
      <Trophy className="w-4 h-4" />
      <span className="font-medium">
        {getUnlockedCount()}/{getTotalCount()}
      </span>
    </Button>
  );
}
