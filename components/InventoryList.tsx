import React from 'react';
import { FoodItem } from '../types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface InventoryListProps {
  items: FoodItem[];
  onConsume: (id: string) => void;
  onDelete: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onConsume, onDelete }) => {
  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'border-l-4 border-red-500 bg-red-50';
    if (days <= 2) return 'border-l-4 border-orange-500 bg-orange-50';
    return 'border-l-4 border-emerald-500 bg-white';
  };

  const sortedItems = [...items].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium text-slate-600">Your fridge is empty</p>
        <p className="text-sm">Scan your grocery receipt or add items to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-xl font-bold text-slate-800 px-1">Your Fridge</h2>
      {sortedItems.map((item) => {
        const daysLeft = getDaysLeft(item.expiryDate);
        return (
          <div key={item.id} className={`relative p-4 rounded-xl shadow-sm transition-all ${getStatusColor(daysLeft)}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{item.name}</h3>
                <p className="text-slate-500 text-sm">{item.quantity} • {item.category}</p>
                
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full w-fit
                  ${daysLeft < 0 ? 'bg-red-100 text-red-700' : daysLeft <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Clock className="w-3 h-3" />
                  {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <button 
                  onClick={() => onConsume(item.id)}
                  className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                  aria-label="Mark consumed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
             {/* Simple Delete X hidden in corner */}
             <button 
                onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-400 p-1"
             >
                <span className="sr-only">Delete</span>
                &times;
             </button>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryList;