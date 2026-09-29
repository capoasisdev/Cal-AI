export type CommonIngredient = {
  id: string;
  name: string;
  category: 'Greens' | 'Proteins' | 'Veggies' | 'Dressings' | 'Toppings' | 'Grains';
  calories: number;
  portion: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export const COMMON_INGREDIENTS: CommonIngredient[] = [
  // Greens
  { id: 'ing_1', name: 'Romaine Lettuce', category: 'Greens', calories: 15, portion: '2 cups', proteinG: 1, carbsG: 3, fatG: 0 },
  { id: 'ing_2', name: 'Baby Spinach', category: 'Greens', calories: 20, portion: '2 cups', proteinG: 2, carbsG: 3, fatG: 0 },
  { id: 'ing_3', name: 'Kale Leaves', category: 'Greens', calories: 33, portion: '1 cup', proteinG: 3, carbsG: 6, fatG: 1 },
  { id: 'ing_4', name: 'Arugula / Rocket', category: 'Greens', calories: 10, portion: '1.5 cups', proteinG: 1, carbsG: 1, fatG: 0 },
  { id: 'ing_5', name: 'Iceberg Lettuce', category: 'Greens', calories: 10, portion: '1.5 cups', proteinG: 1, carbsG: 2, fatG: 0 },

  // Veggies
  { id: 'ing_6', name: 'Cherry Tomatoes', category: 'Veggies', calories: 25, portion: '0.5 cup', proteinG: 1, carbsG: 5, fatG: 0 },
  { id: 'ing_7', name: 'Cucumbers', category: 'Veggies', calories: 16, portion: '1 cup sliced', proteinG: 1, carbsG: 4, fatG: 0 },
  { id: 'ing_8', name: 'Bell Peppers', category: 'Veggies', calories: 30, portion: '1 cup diced', proteinG: 1, carbsG: 7, fatG: 0 },
  { id: 'ing_9', name: 'Red Onions', category: 'Veggies', calories: 15, portion: '1/4 cup diced', proteinG: 0, carbsG: 4, fatG: 0 },
  { id: 'ing_10', name: 'Sweet Corn', category: 'Veggies', calories: 60, portion: '1/2 cup', proteinG: 2, carbsG: 14, fatG: 1 },
  { id: 'ing_11', name: 'Shredded Carrots', category: 'Veggies', calories: 25, portion: '1/2 cup', proteinG: 1, carbsG: 6, fatG: 0 },
  { id: 'ing_12', name: 'Roasted Sweet Potato', category: 'Veggies', calories: 90, portion: '1/2 cup', proteinG: 2, carbsG: 21, fatG: 0 },
  { id: 'ing_13', name: 'Steamed Broccoli', category: 'Veggies', calories: 35, portion: '1 cup', proteinG: 3, carbsG: 6, fatG: 0 },
  { id: 'ing_14', name: 'Steamed Green Beans', category: 'Veggies', calories: 31, portion: '1 cup', proteinG: 2, carbsG: 7, fatG: 0 },
  { id: 'ing_15', name: 'Fresh Avocado', category: 'Veggies', calories: 120, portion: '1/2 fruit', proteinG: 1, carbsG: 6, fatG: 11 },

  // Proteins
  { id: 'ing_16', name: 'Grilled Chicken Breast', category: 'Proteins', calories: 165, portion: '100g', proteinG: 31, carbsG: 0, fatG: 4 },
  { id: 'ing_17', name: 'Grilled Atlantic Salmon', category: 'Proteins', calories: 206, portion: '100g', proteinG: 22, carbsG: 0, fatG: 12 },
  { id: 'ing_18', name: 'Hard Boiled Egg', category: 'Proteins', calories: 78, portion: '1 large', proteinG: 6, carbsG: 1, fatG: 5 },
  { id: 'ing_19', name: 'Grilled Tofu (Firm)', category: 'Proteins', calories: 85, portion: '100g', proteinG: 10, carbsG: 2, fatG: 5 },
  { id: 'ing_20', name: 'Paneer (Cottage Cheese)', category: 'Proteins', calories: 180, portion: '100g', proteinG: 18, carbsG: 4, fatG: 11 },
  { id: 'ing_21', name: 'Boiled Chickpeas', category: 'Proteins', calories: 130, portion: '1/2 cup', proteinG: 7, carbsG: 22, fatG: 2 },
  { id: 'ing_22', name: 'Cooked Black Beans', category: 'Proteins', calories: 115, portion: '1/2 cup', proteinG: 8, carbsG: 20, fatG: 1 },
  { id: 'ing_23', name: 'Edamame (Soybeans)', category: 'Proteins', calories: 95, portion: '1/2 cup', proteinG: 9, carbsG: 8, fatG: 4 },
  { id: 'ing_24', name: 'Grilled Flank Steak', category: 'Proteins', calories: 190, portion: '100g', proteinG: 26, carbsG: 0, fatG: 9 },
  { id: 'ing_25', name: 'Canned Tuna in Water', category: 'Proteins', calories: 110, portion: '100g', proteinG: 25, carbsG: 0, fatG: 1 },

  // Dressings
  { id: 'ing_26', name: 'Extra Virgin Olive Oil', category: 'Dressings', calories: 119, portion: '1 tbsp', proteinG: 0, carbsG: 0, fatG: 14 },
  { id: 'ing_27', name: 'Caesar Dressing', category: 'Dressings', calories: 80, portion: '1 tbsp', proteinG: 0, carbsG: 1, fatG: 9 },
  { id: 'ing_28', name: 'Ranch Dressing', category: 'Dressings', calories: 73, portion: '1 tbsp', proteinG: 0, carbsG: 1, fatG: 8 },
  { id: 'ing_29', name: 'Balsamic Vinaigrette', category: 'Dressings', calories: 45, portion: '1 tbsp', proteinG: 0, carbsG: 3, fatG: 4 },
  { id: 'ing_30', name: 'Honey Mustard Dressing', category: 'Dressings', calories: 60, portion: '1 tbsp', proteinG: 0, carbsG: 4, fatG: 5 },
  { id: 'ing_31', name: 'Greek Yogurt Herb Dip', category: 'Dressings', calories: 35, portion: '2 tbsp', proteinG: 3, carbsG: 2, fatG: 2 },
  { id: 'ing_32', name: 'Tahini Dressing', category: 'Dressings', calories: 89, portion: '1 tbsp', proteinG: 3, carbsG: 3, fatG: 8 },

  // Toppings
  { id: 'ing_33', name: 'Crumbled Feta Cheese', category: 'Toppings', calories: 75, portion: '30g', proteinG: 4, carbsG: 1, fatG: 6 },
  { id: 'ing_34', name: 'Shredded Parmesan', category: 'Toppings', calories: 85, portion: '20g', proteinG: 7, carbsG: 1, fatG: 6 },
  { id: 'ing_35', name: 'Herb Croutons', category: 'Toppings', calories: 60, portion: '1/4 cup', proteinG: 2, carbsG: 10, fatG: 2 },
  { id: 'ing_36', name: 'Toasted Walnut Halves', category: 'Toppings', calories: 100, portion: '15g', proteinG: 2, carbsG: 2, fatG: 10 },
  { id: 'ing_37', name: 'Roasted Almond Slices', category: 'Toppings', calories: 85, portion: '15g', proteinG: 3, carbsG: 3, fatG: 8 },
  { id: 'ing_38', name: 'Sunflower Seeds', category: 'Toppings', calories: 80, portion: '15g', proteinG: 3, carbsG: 3, fatG: 7 },
  { id: 'ing_39', name: 'Dried Cranberries', category: 'Toppings', calories: 65, portion: '2 tbsp', proteinG: 0, carbsG: 16, fatG: 0 },
  { id: 'ing_40', name: 'Pumpkin Seeds (Pepitas)', category: 'Toppings', calories: 75, portion: '15g', proteinG: 4, carbsG: 2, fatG: 6 },

  // Grains
  { id: 'ing_41', name: 'Cooked Quinoa', category: 'Grains', calories: 111, portion: '1/2 cup', proteinG: 4, carbsG: 20, fatG: 2 },
  { id: 'ing_42', name: 'Steamed Brown Rice', category: 'Grains', calories: 108, portion: '1/2 cup', proteinG: 3, carbsG: 22, fatG: 1 },
  { id: 'ing_43', name: 'Toasted Sourdough Bread', category: 'Grains', calories: 120, portion: '1 slice', proteinG: 4, carbsG: 24, fatG: 1 },
];
