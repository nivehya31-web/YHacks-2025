import React, { useState } from 'react';
import { ChefHat, Loader2, Clock, Flame, ChevronRight, Utensils } from 'lucide-react';
import { generateRecipesFromIngredients } from '../services/geminiService';
import { FoodItem, Recipe } from '../types';

interface RecipeGeneratorProps {
  inventory: FoodItem[];
}

const RECIPE_STYLES = [
  "Surprise Me",
  "Quick (< 15m)",
  "Vegetarian",
  "Low Carb",
  "Italian",
  "Mexican",
  "Asian",
  "Comfort Food",
  "Breakfast",
  "Smoothie"
];

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ inventory }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("Surprise Me");

  const handleGenerate = async () => {
    if (inventory.length === 0) return;
    setLoading(true);
    
    // Prioritize expiring items
    const expiringItems = inventory
      .filter(i => new Date(i.expiryDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
      .map(i => i.name);
    
    const otherItems = inventory.map(i => i.name).slice(0, 10); // Limit context
    const ingredients = Array.from(new Set([...expiringItems, ...otherItems]));
    
    const styleParam = selectedStyle === "Surprise Me" ? undefined : selectedStyle;

    try {
      const result = await generateRecipesFromIngredients(ingredients, styleParam);
      setRecipes(result);
    } catch (error) {
      console.error(error);
      alert('Could not generate recipes right now.');
    } finally {
      setLoading(false);
    }
  };

  if (selectedRecipe) {
    return (
      <div className="pb-24 animate-in slide-in-from-right">
        <button onClick={() => setSelectedRecipe(null)} className="mb-4 text-emerald-600 font-medium flex items-center">
          ← Back to Results
        </button>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="bg-emerald-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
            <div className="flex gap-4 text-emerald-100 text-sm">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRecipe.cookingTime}</span>
              <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {selectedRecipe.calories} kcal</span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-600 mb-6 italic">{selectedRecipe.description}</p>
            
            <h3 className="font-bold text-slate-800 mb-3">Ingredients</h3>
            <ul className="space-y-2 mb-6">
              {selectedRecipe.ingredientsUsed.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {ing}
                </li>
              ))}
              {selectedRecipe.missingIngredients.map((ing, i) => (
                 <li key={`missing-${i}`} className="flex items-center gap-2 text-slate-400">
                 <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                 {ing} (Missing)
               </li>
              ))}
            </ul>

            <h3 className="font-bold text-slate-800 mb-3">Instructions</h3>
            <div className="space-y-4">
              {selectedRecipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-emerald-600 rounded-3xl p-6 text-white mb-6">
        <div className="text-center mb-6">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h2 className="text-2xl font-bold mb-1">What's for Dinner?</h2>
            <p className="text-emerald-100 text-sm">Turn expiring food into delicious meals.</p>
        </div>

        <div className="mb-6">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-3 text-center opacity-80">Pick a Style</p>
            <div className="flex flex-wrap justify-center gap-2">
            {RECIPE_STYLES.map(style => (
                <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    selectedStyle === style 
                    ? 'bg-white text-emerald-700 border-white shadow-sm' 
                    : 'bg-emerald-700/30 text-emerald-50 border-emerald-500/30 hover:bg-emerald-700/50'
                }`}
                >
                {style}
                </button>
            ))}
            </div>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={loading || inventory.length === 0}
          className="bg-white text-emerald-700 px-6 py-3.5 rounded-xl font-bold shadow-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mx-auto w-full"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Utensils className="w-5 h-5" />}
          {loading ? 'Cooking up ideas...' : `Generate ${selectedStyle === "Surprise Me" ? "" : selectedStyle} Recipes`}
        </button>
      </div>

      <div className="space-y-4">
        {recipes.length > 0 && (
            <h3 className="font-bold text-slate-800 text-lg px-1">Suggested for you</h3>
        )}
        
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group"
          >
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{recipe.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{recipe.description}</p>
              <div className="flex gap-3 mt-2">
                 <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    Using {recipe.ingredientsUsed.length} items
                 </span>
                 <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {recipe.cookingTime}
                 </span>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </div>
        ))}

        {recipes.length === 0 && !loading && (
             <div className="text-center p-8 opacity-60">
                <p className="text-sm text-slate-500">Select a style and tap generate to see recipes!</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;