import { useState, useEffect, useCallback } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "tutorial" | "experiment" | "safety" | "exploration" | "mastery";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Tutorial Achievements
  {
    id: "chemistry_tutorial",
    name: "Chemistry Novice",
    description: "Complete the chemistry lab tutorial",
    icon: "🧪",
    category: "tutorial",
    unlocked: false,
  },
  {
    id: "biology_tutorial",
    name: "Biology Novice",
    description: "Complete the biology lab tutorial",
    icon: "🔬",
    category: "tutorial",
    unlocked: false,
  },
  {
    id: "physics_tutorial",
    name: "Physics Novice",
    description: "Complete the physics lab tutorial",
    icon: "⚡",
    category: "tutorial",
    unlocked: false,
  },
  {
    id: "all_tutorials",
    name: "Lab Scholar",
    description: "Complete all lab tutorials",
    icon: "🎓",
    category: "tutorial",
    unlocked: false,
  },
  
  // Safety Achievements
  {
    id: "safety_first",
    name: "Safety First",
    description: "Complete safety training",
    icon: "🛡️",
    category: "safety",
    unlocked: false,
  },
  {
    id: "perfect_safety",
    name: "Safety Champion",
    description: "Conduct 10 experiments without safety violations",
    icon: "🏆",
    category: "safety",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  
  // Experiment Achievements
  {
    id: "first_reaction",
    name: "First Reaction",
    description: "Complete your first chemical reaction",
    icon: "💥",
    category: "experiment",
    unlocked: false,
  },
  {
    id: "color_master",
    name: "Color Master",
    description: "Create 5 different colored reactions",
    icon: "🌈",
    category: "experiment",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "cell_explorer",
    name: "Cell Explorer",
    description: "Observe 5 different specimen types",
    icon: "🦠",
    category: "experiment",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "pendulum_master",
    name: "Pendulum Master",
    description: "Run 10 pendulum experiments",
    icon: "⏱️",
    category: "experiment",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "circuit_builder",
    name: "Circuit Builder",
    description: "Build 5 working circuits",
    icon: "🔌",
    category: "experiment",
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "projectile_launcher",
    name: "Projectile Launcher",
    description: "Launch 10 projectiles",
    icon: "🚀",
    category: "experiment",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  
  // Exploration Achievements
  {
    id: "magnification_explorer",
    name: "Deep Diver",
    description: "Use maximum magnification (1000x)",
    icon: "🔍",
    category: "exploration",
    unlocked: false,
  },
  {
    id: "stain_collector",
    name: "Stain Collector",
    description: "Use all 3 staining methods",
    icon: "🎨",
    category: "exploration",
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: "dangerous_experimenter",
    name: "Danger Zone",
    description: "Witness an explosive reaction (safely!)",
    icon: "💣",
    category: "exploration",
    unlocked: false,
  },
  
  // Mastery Achievements
  {
    id: "chemistry_master",
    name: "Chemistry Master",
    description: "Perform 25 chemical reactions",
    icon: "🧬",
    category: "mastery",
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: "biology_master",
    name: "Biology Master",
    description: "Observe 25 specimens",
    icon: "🧫",
    category: "mastery",
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: "physics_master",
    name: "Physics Master",
    description: "Complete 25 physics experiments",
    icon: "⚛️",
    category: "mastery",
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: "lab_legend",
    name: "Lab Legend",
    description: "Unlock all achievements",
    icon: "👑",
    category: "mastery",
    unlocked: false,
  },
];

const STORAGE_KEY = "lab_achievements";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_ACHIEVEMENTS;
      }
    }
    return DEFAULT_ACHIEVEMENTS;
  });
  
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  // Save to localStorage whenever achievements change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id && !a.unlocked) {
          const unlocked = { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          setRecentUnlock(unlocked);
          return unlocked;
        }
        return a;
      });
      
      // Check for meta-achievements
      const tutorialIds = ["chemistry_tutorial", "biology_tutorial", "physics_tutorial"];
      const allTutorialsComplete = tutorialIds.every(
        (tid) => updated.find((a) => a.id === tid)?.unlocked
      );
      if (allTutorialsComplete && !updated.find((a) => a.id === "all_tutorials")?.unlocked) {
        return updated.map((a) =>
          a.id === "all_tutorials"
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a
        );
      }
      
      // Check for lab legend
      const unlockedCount = updated.filter((a) => a.unlocked && a.id !== "lab_legend").length;
      const totalCount = updated.filter((a) => a.id !== "lab_legend").length;
      if (unlockedCount === totalCount && !updated.find((a) => a.id === "lab_legend")?.unlocked) {
        return updated.map((a) =>
          a.id === "lab_legend"
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a
        );
      }
      
      return updated;
    });
  }, []);

  const incrementProgress = useCallback((id: string, amount: number = 1) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === id && !a.unlocked && a.maxProgress !== undefined) {
          const newProgress = Math.min((a.progress || 0) + amount, a.maxProgress);
          if (newProgress >= a.maxProgress) {
            const unlocked = {
              ...a,
              progress: newProgress,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
            setRecentUnlock(unlocked);
            return unlocked;
          }
          return { ...a, progress: newProgress };
        }
        return a;
      })
    );
  }, []);

  const clearRecentUnlock = useCallback(() => {
    setRecentUnlock(null);
  }, []);

  const resetAchievements = useCallback(() => {
    setAchievements(DEFAULT_ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter((a) => a.unlocked).length;
  }, [achievements]);

  const getTotalCount = useCallback(() => {
    return achievements.length;
  }, [achievements]);

  const getByCategory = useCallback(
    (category: Achievement["category"]) => {
      return achievements.filter((a) => a.category === category);
    },
    [achievements]
  );

  return {
    achievements,
    recentUnlock,
    unlockAchievement,
    incrementProgress,
    clearRecentUnlock,
    resetAchievements,
    getUnlockedCount,
    getTotalCount,
    getByCategory,
  };
}
