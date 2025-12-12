export interface FoodItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiryDate: string; // ISO Date string
  addedDate: string;
  status: 'fresh' | 'expiring_soon' | 'expired' | 'consumed';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  instructions: string[];
  cookingTime: string;
  calories: number;
}

export interface ImpactStats {
  moneySaved: number;
  foodWasteReducedKg: number;
  co2SavedKg: number;
  itemsTracked: number;
}

export enum AppView {
  INVENTORY = 'inventory',
  SCAN = 'scan',
  RECIPES = 'recipes',
  DASHBOARD = 'dashboard',
}