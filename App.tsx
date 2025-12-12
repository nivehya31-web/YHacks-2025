import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, ChefHat, BarChart3, ScanLine } from 'lucide-react';
import InventoryList from './components/InventoryList';
import AddItemScanner from './components/AddItemScanner';
import RecipeGenerator from './components/RecipeGenerator';
import ImpactDashboard from './components/ImpactDashboard';
import { FoodItem, AppView, ImpactStats } from './types';

// Initial Mock Data
const INITIAL_ITEMS: FoodItem[] = [
  { id: '1', name: 'Milk', category: 'Dairy', quantity: '1L', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), addedDate: new Date().toISOString(), status: 'expiring_soon' },
  { id: '2', name: 'Eggs', category: 'Dairy', quantity: '12 pcs', expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), addedDate: new Date().toISOString(), status: 'fresh' },
  { id: '3', name: 'Spinach', category: 'Vegetables', quantity: '1 bag', expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), addedDate: new Date().toISOString(), status: 'expired' },
  { id: '4', name: 'Chicken Breast', category: 'Meat', quantity: '500g', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), addedDate: new Date().toISOString(), status: 'fresh' },
];

const INITIAL_STATS: ImpactStats = {
  moneySaved: 124.50,
  foodWasteReducedKg: 4.2,
  co2SavedKg: 10.5,
  itemsTracked: 45
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INVENTORY);
  const [items, setItems] = useState<FoodItem[]>(INITIAL_ITEMS);
  const [stats, setStats] = useState<ImpactStats>(INITIAL_STATS);
  const [showScanner, setShowScanner] = useState(false);

  const handleAddItems = (newItems: FoodItem[]) => {
    setItems(prev => [...prev, ...newItems]);
    setStats(prev => ({ ...prev, itemsTracked: prev.itemsTracked + newItems.length }));
    setShowScanner(false);
    setView(AppView.INVENTORY);
  };

  const handleConsume = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    // Simulate savings logic
    setStats(prev => ({
      ...prev,
      moneySaved: prev.moneySaved + 3.50, // Approx value per item
      foodWasteReducedKg: prev.foodWasteReducedKg + 0.5,
      co2SavedKg: prev.co2SavedKg + 1.2
    }));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Sticky Navigation Bar
  const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon className={`w-6 h-6 mb-1 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-slate-100">
      
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-4 sticky top-0 z-10 border-b border-slate-50 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-emerald-900 tracking-tight">FridgeMate</h1>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Smart Inventory</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            {items.length} Items
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {view === AppView.INVENTORY && (
          <InventoryList items={items} onConsume={handleConsume} onDelete={handleDelete} />
        )}
        {view === AppView.RECIPES && (
          <RecipeGenerator inventory={items} />
        )}
        {view === AppView.DASHBOARD && (
          <ImpactDashboard stats={stats} />
        )}
      </main>

      {/* Floating Action Button (FAB) for Add */}
      {!showScanner && (
        <button 
          onClick={() => setShowScanner(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center text-white hover:scale-105 transition-transform z-20"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 max-w-lg w-full bg-white border-t border-slate-100 pb-safe flex justify-between items-end px-2 z-30 pb-4">
        <NavButton 
          icon={LayoutGrid} 
          label="Fridge" 
          active={view === AppView.INVENTORY} 
          onClick={() => setView(AppView.INVENTORY)} 
        />
        <NavButton 
          icon={ChefHat} 
          label="Recipes" 
          active={view === AppView.RECIPES} 
          onClick={() => setView(AppView.RECIPES)} 
        />
        <div className="w-12"></div> {/* Spacer for FAB */}
        <NavButton 
          icon={ScanLine} 
          label="Scan" 
          active={showScanner} 
          onClick={() => setShowScanner(true)} 
        />
         <NavButton 
          icon={BarChart3} 
          label="Impact" 
          active={view === AppView.DASHBOARD} 
          onClick={() => setView(AppView.DASHBOARD)} 
        />
      </nav>

      {/* Scanner Overlay Modal */}
      {showScanner && (
        <AddItemScanner 
          onAddItems={handleAddItems} 
          onCancel={() => setShowScanner(false)} 
        />
      )}
      
    </div>
  );
};

export default App;