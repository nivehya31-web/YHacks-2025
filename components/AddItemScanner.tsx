import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Plus, X } from 'lucide-react';
import { analyzeImageForItems, fileToGenerativePart } from '../services/geminiService';
import { FoodItem } from '../types';

interface AddItemScannerProps {
  onAddItems: (items: FoodItem[]) => void;
  onCancel: () => void;
}

const AddItemScanner: React.FC<AddItemScannerProps> = ({ onAddItems, onCancel }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<Partial<FoodItem>[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      const base64Data = await fileToGenerativePart(file);
      setPreviewImage(`data:image/jpeg;base64,${base64Data}`); // Set preview
      
      const items = await analyzeImageForItems(base64Data);
      setDetectedItems(items);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    const newItems: FoodItem[] = detectedItems.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      addedDate: new Date().toISOString(),
      status: 'fresh' as const,
      name: item.name || 'Unknown Item',
      category: item.category || 'Pantry',
      quantity: item.quantity || '1',
      expiryDate: item.expiryDate || new Date().toISOString()
    } as FoodItem));

    onAddItems(newItems);
  };

  const removeItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Groceries</h2>
          <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {detectedItems.length === 0 && !isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-center text-slate-600">
              Take a photo of your receipt or groceries to auto-detect items and expiry dates.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
            >
              <Camera className="w-5 h-5" />
              Scan Camera
            </button>
            
            <button 
               onClick={() => fileInputRef.current?.click()} // Reusing for simplicity, normally separate upload
               className="text-slate-500 font-medium hover:text-slate-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center">
             {previewImage && (
                <img src={previewImage} alt="Scanning" className="w-32 h-32 object-cover rounded-xl mb-6 opacity-50" />
             )}
             <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
             <p className="text-lg font-medium text-slate-700">Analyzing groceries...</p>
             <p className="text-sm text-slate-400">Detecting items and expiry dates</p>
          </div>
        )}

        {detectedItems.length > 0 && (
          <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
            <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Detected {detectedItems.length} Items</p>
            <div className="space-y-3">
              {detectedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <input 
                      value={item.name} 
                      onChange={(e) => {
                        const newItems = [...detectedItems];
                        newItems[idx].name = e.target.value;
                        setDetectedItems(newItems);
                      }}
                      className="font-semibold text-slate-800 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none w-full"
                    />
                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>Expires in {Math.ceil((new Date(item.expiryDate!).getTime() - Date.now()) / (1000 * 3600 * 24))} days</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {detectedItems.length > 0 && (
          <div className="mt-auto pt-4">
             <button 
              onClick={handleConfirm}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
            >
              Add {detectedItems.length} Items to Fridge
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddItemScanner;