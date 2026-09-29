export type PlanInput = {
  gender: 'male' | 'female';
  dateOfBirth: string; // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  goal: 'lose' | 'maintain' | 'gain';
  targetWeightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  paceKgPerWeek: number;
  dietPreference: 'classic' | 'keto' | 'vegan' | 'vegetarian';
};

export type NutritionPlan = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rationale: string;
};

const ACTIVITY_FACTOR: Record<PlanInput['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

const MACRO_SPLITS: Record<PlanInput['dietPreference'], [number, number, number]> = {
  classic: [0.3, 0.4, 0.3], // 30% protein, 40% carbs, 30% fat
  keto: [0.25, 0.1, 0.65], // 25% protein, 10% carbs, 65% fat
  vegan: [0.25, 0.5, 0.25], // 25% protein, 50% carbs, 25% fat
  vegetarian: [0.25, 0.5, 0.25], // 25% protein, 50% carbs, 25% fat
};

export const PlanService = {
  getAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(14, Math.min(100, isNaN(age) ? 25 : age));
  },

  calculatePlan(input: PlanInput): NutritionPlan {
    const age = this.getAge(input.dateOfBirth);

    // Mifflin-St Jeor Equation
    const bmr =
      10 * input.weightKg +
      6.25 * input.heightCm -
      5 * age +
      (input.gender === 'female' ? -161 : 5);

    const tdee = bmr * (ACTIVITY_FACTOR[input.activityLevel] || 1.55);

    // 1 kg of body weight ≈ 7700 kcal
    const dailyDelta = (input.paceKgPerWeek * 7700) / 7;
    let target = tdee;

    if (input.goal === 'lose') {
      target = tdee - dailyDelta;
    } else if (input.goal === 'gain') {
      target = tdee + dailyDelta;
    }

    // Clamp within healthy range
    const calories = Math.round(Math.min(5000, Math.max(1200, target)) / 10) * 10;
    const [pRatio, cRatio, fRatio] = MACRO_SPLITS[input.dietPreference] || MACRO_SPLITS.classic;

    const protein = Math.round((calories * pRatio) / 4);
    const carbs = Math.round((calories * cRatio) / 4);
    const fat = Math.round((calories * fRatio) / 9);

    const goalWord = input.goal === 'lose' ? 'lose weight' : input.goal === 'gain' ? 'gain muscle' : 'maintain your weight';
    const rationale = `Based on your ${input.gender} profile, height of ${input.heightCm} cm, and ${input.activityLevel} lifestyle, this targets ${calories} kcal/day to help you ${goalWord} at ${input.paceKgPerWeek} kg/week.`;

    return {
      calories,
      protein,
      carbs,
      fat,
      rationale,
    };
  },
};
