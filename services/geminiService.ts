import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// Helper to convert blob/file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImageForItems = async (base64Image: string): Promise<Partial<FoodItem>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image of groceries/receipt. Identify food items. For each item, predict a realistic category and typical shelf life in days from now (default to 7 if unknown). Return a JSON array."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              quantity: { type: Type.STRING },
              daysUntilExpiry: { type: Type.INTEGER }
            },
            required: ["name", "category", "daysUntilExpiry"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Transform API response to App format
    return data.map((item: any) => {
      const today = new Date();
      const expiry = new Date(today);
      expiry.setDate(today.getDate() + (item.daysUntilExpiry || 7));

      return {
        name: item.name,
        category: item.category,
        quantity: item.quantity || "1 unit",
        expiryDate: expiry.toISOString(),
      };
    });

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const generateRecipesFromIngredients = async (ingredients: string[], style?: string): Promise<Recipe[]> => {
  try {
    const styleInstruction = style ? `The recipes should follow this style: "${style}".` : "The recipes should be healthy and creative.";
    
    const prompt = `${styleInstruction}
    Create 3 recipes using some of these ingredients: ${ingredients.join(", ")}. 
    Prioritize using as many input ingredients as possible to reduce waste.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingTime: { type: Type.STRING },
              calories: { type: Type.INTEGER }
            },
            required: ["title", "ingredientsUsed", "instructions"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((recipe: any, index: number) => ({
      ...recipe,
      id: `recipe-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    throw new Error("Failed to generate recipes.");
  }
};