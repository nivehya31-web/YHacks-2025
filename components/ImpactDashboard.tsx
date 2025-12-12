import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ImpactStats } from '../types';
import { Leaf, DollarSign, Trash2, TrendingUp } from 'lucide-react';

interface ImpactDashboardProps {
  stats: ImpactStats;
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ stats }) => {
  const data = [
    { name: 'Jan', saved: 40 },
    { name: 'Feb', saved: 35 },
    { name: 'Mar', saved: 50 },
    { name: 'Apr', saved: stats.moneySaved }, // Current simulated
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Your Impact</h2>
        <p className="text-emerald-100 text-sm mb-6">You're making a difference!</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium opacity-90">Money Saved</span>
            </div>
            <p className="text-3xl font-bold">${stats.moneySaved}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-green-300" />
              <span className="text-sm font-medium opacity-90">CO₂ Avoided</span>
            </div>
            <p className="text-3xl font-bold">{stats.co2SavedKg}kg</p>
          </div>

           <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-300" />
              <span className="text-sm font-medium opacity-90">Waste Cut</span>
            </div>
            <p className="text-3xl font-bold">{stats.foodWasteReducedKg}kg</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-medium opacity-90">Items Tracked</span>
            </div>
            <p className="text-3xl font-bold">{stats.itemsTracked}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Savings</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="saved" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#059669' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;