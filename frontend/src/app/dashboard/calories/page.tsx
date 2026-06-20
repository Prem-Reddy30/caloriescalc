'use client';

import { useState, useEffect } from 'react';
import { Flame, Info } from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateCalorieGoal } from '@/lib/utils';

export default function CaloriesPage() {
  const [form, setForm] = useState({ gender: 'male', age: '', weight: '', height: '', activity: 'moderate', goal: 'maintenance' });
  const [result, setResult] = useState<{ bmr: number; tdee: number; target: number } | null>(null);

  useEffect(() => {
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      if (ob.age) {
        const initialForm = {
          gender: ob.gender || 'male',
          age: ob.age || '',
          weight: ob.weight || '',
          height: ob.height || '',
          activity: 'moderate',
          goal: ob.goal || 'maintenance'
        };
        setForm(initialForm);

        // Auto-calculate on mount if core stats are loaded
        if (ob.age && ob.weight && ob.height) {
          const bmr = calculateBMR(initialForm.gender, +ob.weight, +ob.height, +ob.age);
          const tdee = calculateTDEE(bmr, initialForm.activity);
          const target = calculateCalorieGoal(tdee, initialForm.goal);
          setResult({ bmr, tdee, target });
        }
      }
    } catch {}
  }, []);

  const calculate = () => {
    if (!form.age || !form.weight || !form.height) return;
    const bmr = calculateBMR(form.gender, +form.weight, +form.height, +form.age);
    const tdee = calculateTDEE(bmr, form.activity);
    const target = calculateCalorieGoal(tdee, form.goal);
    setResult({ bmr, tdee, target });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500 dark:text-orange-400" /> Calorie Calculator
        </h1>
        <p className="text-gray-500 text-sm mt-1">Calculate your BMR, TDEE and daily calorie target</p>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Age (years)', key: 'age', placeholder: '25' },
            { label: 'Weight (kg)', key: 'weight', placeholder: '70' },
            { label: 'Height (cm)', key: 'height', placeholder: '175' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{f.label}</label>
              <input type="number" placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all">
              <option value="male" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Male</option>
              <option value="female" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Female</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Activity Level</label>
          <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all">
            <option value="sedentary" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Sedentary (little/no exercise)</option>
            <option value="light" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Light (1–3 days/week)</option>
            <option value="moderate" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Moderate (3–5 days/week)</option>
            <option value="active" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Active (6–7 days/week)</option>
            <option value="very_active" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Very Active (twice/day)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Goal</label>
          <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all">
            <option value="loss" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Weight Loss (−500 kcal)</option>
            <option value="maintenance" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Maintenance</option>
            <option value="lean_bulk" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Lean Bulk (+300 kcal)</option>
            <option value="muscle_gain" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Muscle Gain (+500 kcal)</option>
          </select>
        </div>

        <button onClick={calculate}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm">
          Calculate Calories
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'BMR', value: result.bmr, sub: 'Base Metabolic Rate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20' },
              { label: 'TDEE', value: result.tdee, sub: 'Total Daily Energy', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20' },
              { label: 'Target', value: result.target, sub: 'Your Daily Goal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.sub}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">kcal/day</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Your daily target is <strong>{result.target} kcal</strong>. Split across 4–5 meals for best results.</span>
          </div>
        </>
      )}
    </div>
  );
}
