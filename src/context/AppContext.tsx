import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StorageService,
  UserProfile,
  LoggedMeal,
  WeightEntry,
  defaultProfile,
} from '@/services/storageService';
import { PlanInput, NutritionPlan, PlanService } from '@/services/planService';

interface AppContextType {
  profile: UserProfile;
  meals: LoggedMeal[];
  weightLogs: WeightEntry[];
  answers: Partial<PlanInput>;
  draftPlan: NutritionPlan | null;
  isLoading: boolean;
  setAnswers: React.Dispatch<React.SetStateAction<Partial<PlanInput>>>;
  updateAnswer: (field: keyof PlanInput, value: any) => void;
  setDraftPlan: (plan: NutritionPlan | null) => void;
  generateAndSetPlan: () => NutritionPlan;
  completeOnboarding: () => Promise<void>;
  addMeal: (meal: Omit<LoggedMeal, 'id'>) => Promise<LoggedMeal>;
  deleteMeal: (id: string) => Promise<void>;
  addWeightLog: (weightKg: number, date?: string, note?: string) => Promise<WeightEntry>;
  deleteWeightLog: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const defaultAnswers: Partial<PlanInput> = {
  gender: 'male',
  dateOfBirth: '2000-01-01',
  heightCm: 175,
  weightKg: 70,
  goal: 'maintain',
  targetWeightKg: 70,
  activityLevel: 'moderate',
  paceKgPerWeek: 0.5,
  dietPreference: 'classic',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
  const [answers, setAnswers] = useState<Partial<PlanInput>>(defaultAnswers);
  const [draftPlan, setDraftPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const storedProfile = await StorageService.getProfile();
        const storedMeals = await StorageService.getMeals();
        const storedWeightLogs = await StorageService.getWeightLogs();
        setProfile(storedProfile);
        setMeals(storedMeals);
        setWeightLogs(storedWeightLogs);
      } catch (e) {
        console.error('Failed to load storage data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const updateAnswer = (field: keyof PlanInput, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const generateAndSetPlan = (): NutritionPlan => {
    const fullInput: PlanInput = {
      gender: answers.gender || 'male',
      dateOfBirth: answers.dateOfBirth || '2000-01-01',
      heightCm: answers.heightCm || 175,
      weightKg: answers.weightKg || 70,
      goal: answers.goal || 'maintain',
      targetWeightKg: answers.targetWeightKg || 70,
      activityLevel: answers.activityLevel || 'moderate',
      paceKgPerWeek: answers.paceKgPerWeek || 0.5,
      dietPreference: answers.dietPreference || 'classic',
    };

    const calculated = PlanService.calculatePlan(fullInput);
    setDraftPlan(calculated);
    return calculated;
  };

  const completeOnboarding = async () => {
    const planToSave = draftPlan || generateAndSetPlan();
    const updated = await StorageService.saveProfile({
      ...answers,
      dailyCalories: planToSave.calories,
      proteinG: planToSave.protein,
      carbsG: planToSave.carbs,
      fatG: planToSave.fat,
      planRationale: planToSave.rationale,
      onboardingCompleted: true,
      streak: 1,
    });
    setProfile(updated);
  };

  const addMeal = async (mealData: Omit<LoggedMeal, 'id'>) => {
    const created = await StorageService.addMeal(mealData);
    setMeals((prev) => [created, ...prev]);
    return created;
  };

  const deleteMeal = async (id: string) => {
    await StorageService.deleteMeal(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const addWeightLog = async (weightKg: number, date?: string, note?: string) => {
    const entry = await StorageService.addWeightLog(weightKg, date, note);
    setWeightLogs((prev) => {
      const filtered = prev.filter((l) => l.date !== entry.date);
      const updated = [entry, ...filtered];
      return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    // Also keep profile weight up to date with the latest weigh-in
    await updateProfile({ weightKg });
    return entry;
  };

  const deleteWeightLog = async (id: string) => {
    await StorageService.deleteWeightLog(id);
    setWeightLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await StorageService.saveProfile(updates);
    setProfile(updated);
  };

  const resetAllData = async () => {
    await StorageService.clearAll();
    setProfile(defaultProfile);
    setMeals([]);
    setWeightLogs([]);
    setAnswers(defaultAnswers);
    setDraftPlan(null);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        meals,
        weightLogs,
        answers,
        draftPlan,
        isLoading,
        setAnswers,
        updateAnswer,
        setDraftPlan,
        generateAndSetPlan,
        completeOnboarding,
        addMeal,
        deleteMeal,
        addWeightLog,
        deleteWeightLog,
        updateProfile,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
