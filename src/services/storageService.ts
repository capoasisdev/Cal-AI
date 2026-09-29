import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: 'lose' | 'maintain' | 'gain';
  targetWeightKg?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  paceKgPerWeek?: number;
  dietPreference?: 'classic' | 'keto' | 'vegan' | 'vegetarian';
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  planRationale?: string;
  onboardingCompleted: boolean;
  unitPreference: 'metric' | 'imperial';
  language?: string;
  hasFamilyPlan?: boolean;
  streak: number;
  memberSince: string;
  name?: string;
  email?: string;
};

export type LoggedMeal = {
  id: string;
  name: string;
  imageUrl?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string; // ISO string
  status: 'completed' | 'analyzing' | 'failed';
  errorReason?: string;
};

export type WeightEntry = {
  id: string;
  weightKg: number;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
};

const STORAGE_KEYS = {
  PROFILE: '@salado_ai_profile',
  MEALS: '@salado_ai_meals',
  WEIGHT_LOGS: '@salado_ai_weight_logs',
  ANSWERS_DRAFT: '@salado_ai_answers_draft',
};

export const defaultProfile: UserProfile = {
  gender: 'male',
  dateOfBirth: '2000-01-01',
  heightCm: 175,
  weightKg: 70,
  goal: 'maintain',
  targetWeightKg: 70,
  activityLevel: 'moderate',
  paceKgPerWeek: 0.5,
  dietPreference: 'classic',
  dailyCalories: 2200,
  proteinG: 165,
  carbsG: 220,
  fatG: 73,
  planRationale: 'Calculated using Mifflin-St Jeor equation customized for your daily activity and goal.',
  onboardingCompleted: false,
  unitPreference: 'metric',
  language: 'English',
  hasFamilyPlan: false,
  streak: 1,
  memberSince: new Date().toISOString(),
};

export const StorageService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return { ...defaultProfile, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to get profile from storage', e);
    }
    return defaultProfile;
  },

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const current = await this.getProfile();
      const updated = { ...current, ...profile };
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save profile', e);
      throw e;
    }
  },

  async getMeals(): Promise<LoggedMeal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get meals from storage', e);
    }
    return [];
  },

  async addMeal(meal: Omit<LoggedMeal, 'id'>): Promise<LoggedMeal> {
    try {
      const meals = await this.getMeals();
      const newMeal: LoggedMeal = {
        ...meal,
        id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      };
      const updated = [newMeal, ...meals];
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(updated));
      return newMeal;
    } catch (e) {
      console.error('Failed to add meal', e);
      throw e;
    }
  },

  async deleteMeal(id: string): Promise<void> {
    try {
      const meals = await this.getMeals();
      const updated = meals.filter((m) => m.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete meal', e);
      throw e;
    }
  },

  async getWeightLogs(): Promise<WeightEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get weight logs from storage', e);
    }
    return [];
  },

  async addWeightLog(weightKg: number, date?: string, note?: string): Promise<WeightEntry> {
    try {
      const logs = await this.getWeightLogs();
      const newEntry: WeightEntry = {
        id: 'weight_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        weightKg,
        date: date || new Date().toISOString().split('T')[0],
        note,
      };
      const updated = [newEntry, ...logs.filter((l) => l.date !== newEntry.date)];
      // Sort descending by date
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(updated));
      return newEntry;
    } catch (e) {
      console.error('Failed to add weight log', e);
      throw e;
    }
  },

  async deleteWeightLog(id: string): Promise<void> {
    try {
      const logs = await this.getWeightLogs();
      const updated = logs.filter((l) => l.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete weight log', e);
      throw e;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROFILE,
        STORAGE_KEYS.MEALS,
        STORAGE_KEYS.WEIGHT_LOGS,
        STORAGE_KEYS.ANSWERS_DRAFT,
      ]);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
