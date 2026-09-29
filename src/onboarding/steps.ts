import { IconName } from '@/components/Icon';
import { PlanInput, NutritionPlan } from '@/services/planService';

export type Answers = PlanInput;

export const answers: Partial<Answers> = {
  dateOfBirth: new Date(Date.now() - 25 * 31557600000).toISOString().slice(0, 10),
  heightCm: 175,
  weightKg: 70,
  targetWeightKg: 70,
  paceKgPerWeek: 0.5,
};

export const draft: { plan?: NutritionPlan } = {};

type Option = {
  value: string;
  title: string;
  subtitle?: string;
  icon?: IconName | string;
  glyph?: string;
};

type Base = { key: string; field: keyof Answers; title: string; subtitle: string };

export type Step = Base &
  (
    | { kind: 'cards'; options: Option[]; tall?: boolean }
    | {
        kind: 'ruler';
        unit: string;
        min: number;
        max: number;
        increment: number;
        decimals?: number;
        labelEvery?: number;
        labelDecimals?: number;
        note?: (v: number) => string | null;
      }
    | { kind: 'date' }
  );

export const steps: Step[] = [
  {
    key: 'gender',
    field: 'gender',
    kind: 'cards',
    tall: true,
    title: "Let's get to know you better",
    subtitle: 'This helps us personalize your plan and recommendations.',
    options: [
      { value: 'male', title: 'Male', glyph: '♂' },
      { value: 'female', title: 'Female', glyph: '♀' },
    ],
  },
  {
    key: 'birthday',
    field: 'dateOfBirth',
    kind: 'date',
    title: "When's your birthday?",
    subtitle: 'Age changes how many calories your body burns at rest.',
  },
  {
    key: 'height',
    field: 'heightCm',
    kind: 'ruler',
    title: "What's your height?",
    subtitle: "We'll use this to calculate your calorie needs.",
    unit: 'cm',
    min: 120,
    max: 220,
    increment: 1,
  },
  {
    key: 'weight',
    field: 'weightKg',
    kind: 'ruler',
    title: "What's your current weight?",
    subtitle: 'This helps us understand your starting point.',
    unit: 'kg',
    min: 35,
    max: 200,
    increment: 0.5,
    decimals: 1,
    labelEvery: 4,
  },
  {
    key: 'goal',
    field: 'goal',
    kind: 'cards',
    title: "What's your main goal?",
    subtitle: "We'll build your plan around this.",
    options: [
      {
        value: 'lose',
        title: 'Lose weight',
        subtitle: 'Shed fat at a steady pace',
        icon: 'chart.line.downtrend.xyaxis',
      },
      {
        value: 'maintain',
        title: 'Maintain weight',
        subtitle: 'Stay where you are',
        icon: 'chart.line.flattrend.xyaxis',
      },
      {
        value: 'gain',
        title: 'Gain weight',
        subtitle: 'Build size and strength',
        icon: 'chart.line.uptrend.xyaxis',
      },
    ],
  },
  {
    key: 'target-weight',
    field: 'targetWeightKg',
    kind: 'ruler',
    title: "What's your goal weight?",
    subtitle: 'Where do you want to be?',
    unit: 'kg',
    min: 35,
    max: 200,
    increment: 0.5,
    decimals: 1,
    labelEvery: 4,
  },
  {
    key: 'activity',
    field: 'activityLevel',
    kind: 'cards',
    title: 'How active are you during the day?',
    subtitle: 'This helps us estimate your daily calorie needs.',
    options: [
      { value: 'sedentary', title: 'Sedentary', subtitle: 'Little or no exercise', icon: 'sofa' },
      {
        value: 'light',
        title: 'Lightly active',
        subtitle: '1–3 days per week',
        icon: 'figure.walk',
      },
      {
        value: 'moderate',
        title: 'Moderately active',
        subtitle: '3–5 days per week',
        icon: 'dumbbell',
      },
      { value: 'very', title: 'Very active', subtitle: '6–7 days per week', icon: 'figure.run' },
      {
        value: 'extra',
        title: 'Extra active',
        subtitle: 'Very intense daily activity or physical job',
        icon: 'flame',
      },
    ],
  },
  {
    key: 'pace',
    field: 'paceKgPerWeek',
    kind: 'ruler',
    title: 'How fast do you want to move?',
    subtitle: 'You can change this later at any time.',
    unit: 'kg / week',
    min: 0.1,
    max: 1.5,
    increment: 0.1,
    decimals: 1,
    labelEvery: 5,
    labelDecimals: 1,
    note: (v) =>
      v >= 1 ? "That's an aggressive pace — it's harder to stick with, and to keep muscle." : null,
  },
  {
    key: 'diet',
    field: 'dietPreference',
    kind: 'cards',
    title: 'Any diet preference?',
    subtitle: 'We shape your macro split around how you like to eat.',
    options: [
      { value: 'classic', title: 'Classic', subtitle: 'A bit of everything', icon: 'fork.knife' },
      { value: 'keto', title: 'Keto', subtitle: 'Low carb, high fat', icon: 'flame' },
      { value: 'vegan', title: 'Vegan', subtitle: 'No animal products', icon: 'leaf' },
      { value: 'vegetarian', title: 'Vegetarian', subtitle: 'No meat or fish', icon: 'carrot' },
    ],
  },
];

export const stepIndex = (key: string) => steps.findIndex((s) => s.key === key);
