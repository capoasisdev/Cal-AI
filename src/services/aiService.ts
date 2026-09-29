export type Ingredient = {
  name: string;
  calories: number;
  portion: string;
};

export type FoodAnalysisResult = {
  status: 'completed' | 'failed';
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients?: Ingredient[];
  errorReason?: string;
  source: 'openrouter' | 'mock';
};

const MOCK_MEALS: Omit<FoodAnalysisResult, 'status' | 'source'>[] = [
  {
    name: 'Caesar Salad with Cherry Tomatoes',
    calories: 330,
    proteinG: 8,
    carbsG: 20,
    fatG: 18,
    ingredients: [
      { name: 'Lettuce', calories: 20, portion: '1.5 cups' },
      { name: 'Cherry Tomatoes', calories: 35, portion: '0.5 cup' },
      { name: 'Parmesan & Croutons', calories: 165, portion: '1/4 cup' },
      { name: 'Caesar Dressing', calories: 110, portion: '2 tbsp' },
    ],
  },
  {
    name: 'Steak & Sweet Potato with Green Beans',
    calories: 632,
    proteinG: 51,
    carbsG: 41,
    fatG: 22,
    ingredients: [
      { name: 'Grilled Flank Steak', calories: 340, portion: '200g' },
      { name: 'Roasted Sweet Potato', calories: 190, portion: '1 medium' },
      { name: 'Steamed Green Beans', calories: 45, portion: '1 cup' },
      { name: 'Olive Oil & Herbs', calories: 57, portion: '1 tsp' },
    ],
  },
  {
    name: 'Grilled Salmon with Brown Rice & Broccoli',
    calories: 580,
    proteinG: 44,
    carbsG: 48,
    fatG: 18,
    ingredients: [
      { name: 'Atlantic Salmon Fillet', calories: 310, portion: '180g' },
      { name: 'Steamed Brown Rice', calories: 210, portion: '1 cup' },
      { name: 'Fresh Broccoli Florets', calories: 60, portion: '1.5 cups' },
    ],
  },
  {
    name: 'Avocado Toast with Two Poached Eggs',
    calories: 420,
    proteinG: 19,
    carbsG: 32,
    fatG: 24,
    ingredients: [
      { name: 'Toasted Sourdough Bread', calories: 160, portion: '1 slice' },
      { name: 'Hass Avocado', calories: 120, portion: '1/2 fruit' },
      { name: 'Poached Eggs', calories: 140, portion: '2 large' },
    ],
  },
  {
    name: 'Chicken Breast & Quinoa Bowl',
    calories: 520,
    proteinG: 48,
    carbsG: 46,
    fatG: 12,
    ingredients: [
      { name: 'Grilled Chicken Breast', calories: 270, portion: '180g' },
      { name: 'Cooked Quinoa', calories: 180, portion: '1 cup' },
      { name: 'Mixed Roasted Veggies', calories: 70, portion: '1 cup' },
    ],
  },
  {
    name: 'Mediterranean Chickpea & Feta Salad',
    calories: 390,
    proteinG: 16,
    carbsG: 40,
    fatG: 19,
    ingredients: [
      { name: 'Cooked Chickpeas', calories: 180, portion: '1 cup' },
      { name: 'Crumbled Feta', calories: 110, portion: '40g' },
      { name: 'Cucumber & Cherry Tomatoes', calories: 45, portion: '1 cup' },
      { name: 'Lemon Herb Dressing', calories: 55, portion: '1 tbsp' },
    ],
  },
];

export const AIService = {
  async analyzeFoodImage(base64OrUri: string): Promise<FoodAnalysisResult> {
    const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

    // If OpenRouter key is present, attempt live AI Vision call
    if (apiKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://saladoai.app',
            'X-Title': 'Salado AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert nutritionist. Analyze the food in the photo and estimate total calories, protein_g, carbs_g, fat_g, meal name, and ingredients. Return ONLY valid JSON in format: {"is_food": boolean, "name": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "ingredients": [{"name": string, "calories": number, "portion": string}]}. If not food, set is_food to false.',
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: base64OrUri.startsWith('data:')
                        ? base64OrUri
                        : `data:image/jpeg;base64,${base64OrUri}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (!parsed.is_food) {
              return {
                status: 'failed',
                name: 'Not food',
                calories: 0,
                proteinG: 0,
                carbsG: 0,
                fatG: 0,
                errorReason: 'not_food',
                source: 'openrouter',
              };
            }
            return {
              status: 'completed',
              name: parsed.name || 'Identified Meal',
              calories: Math.round(parsed.calories || 0),
              proteinG: Math.round(parsed.protein_g || 0),
              carbsG: Math.round(parsed.carbs_g || 0),
              fatG: Math.round(parsed.fat_g || 0),
              ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : undefined,
              source: 'openrouter',
            };
          }
        }
      } catch (err) {
        console.warn('OpenRouter call failed, falling back to simulated vision:', err);
      }
    }

    // Testing Mode: realistic simulation
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Pick a realistic meal
    const picked = MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)];
    const variation = (Math.random() - 0.5) * 0.08;
    const calories = Math.round(picked.calories * (1 + variation));
    const proteinG = Math.round(picked.proteinG * (1 + variation));
    const carbsG = Math.round(picked.carbsG * (1 + variation));
    const fatG = Math.round(picked.fatG * (1 + variation));

    return {
      status: 'completed',
      name: picked.name,
      calories,
      proteinG,
      carbsG,
      fatG,
      ingredients: picked.ingredients,
      source: 'mock',
    };
  },
};
