'use client';

import { useState, useEffect } from 'react';
import { Droplets, Info } from 'lucide-react';
import { calculateWaterIntake, API_BASE_URL } from '@/lib/utils';

export default function WaterPage() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      const savedWeight = ob.weight || '';
      const savedActivity = ob.activity || 'moderate';
      
      setWeight(savedWeight);
      setActivity(savedActivity);

      if (savedWeight) {
        const calculatedGoal = Math.round(calculateWaterIntake(+savedWeight, savedActivity) * 1000);
        setGoal(calculatedGoal);
      }

      // Load today's logged water intake
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      setWaterIntake(waterLog[dateKey] || 0);
    } catch {}
  }, []);

  const syncProgressToBackend = async (currentIntake?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const onboarding = JSON.parse(localStorage.getItem('onboarding') || '{}');
      const weight = onboarding.weight || '';
      
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
      const dayLog = JSON.parse(localStorage.getItem('dayLog') || '{}');
      const entries = dayLog[dateKey] || [];
      const totalCal = entries.reduce((s: number, e: any) => s + e.cal, 0);

      const workoutLog = JSON.parse(localStorage.getItem('workoutLog') || '{}');
      const workoutCompleted = !!workoutLog[dateKey];

      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      const intake = currentIntake !== undefined ? currentIntake : (waterLog[dateKey] || 0);

      const body = {
        date: today.toISOString(),
        weight: weight ? parseFloat(weight) : undefined,
        caloriesConsumed: totalCal,
        waterIntake: intake,
        foodEntries: entries.map((e: any) => ({
          name: e.name,
          cal: e.cal,
          protein: e.protein || 0,
          carbs: e.carbs || 0,
          fat: e.fat || 0,
          emoji: e.emoji || '🍽️'
        })),
        workoutCompleted
      };

      await fetch(`${API_BASE_URL}/api/progress/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.error('Failed to sync progress to backend:', err);
    }
  };

  const calcGoal = () => {
    if (!weight) return;
    const calculatedGoal = Math.round(calculateWaterIntake(+weight, activity) * 1000);
    setGoal(calculatedGoal);
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      ob.weight = weight;
      ob.activity = activity;
      localStorage.setItem('onboarding', JSON.stringify(ob));
      syncProgressToBackend();
    } catch {}
  };

  const addWater = (amount: number) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const newIntake = waterIntake + amount;
    setWaterIntake(newIntake);
    
    try {
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      waterLog[dateKey] = newIntake;
      localStorage.setItem('waterLog', JSON.stringify(waterLog));
    } catch {}

    syncProgressToBackend(newIntake);
  };

  const resetWater = () => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    setWaterIntake(0);
    
    try {
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      waterLog[dateKey] = 0;
      localStorage.setItem('waterLog', JSON.stringify(waterLog));
    } catch {}

    syncProgressToBackend(0);
  };

  return (
    <div className="max-w-md space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Droplets className="h-6 w-6 text-cyan-400 animate-water-pulse" /> Water Goal
        </h1>
        <p className="text-gray-500 text-sm mt-1">Calculate your daily hydration target</p>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Set Your Goal</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Weight (kg)</label>
            <input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Activity</label>
            <select value={activity} onChange={e => setActivity(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
        </div>
        <button onClick={calcGoal}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all text-sm">
          Set Goal
        </button>
      </div>

      {goal > 0 && (
        <>
          {/* Simple Target Goal Card */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-none">
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Your Daily Hydration Target</p>
            <p className="text-4xl font-extrabold text-cyan-400 font-mono">
              {goal} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">ml</span> 
              <span className="text-sm font-normal text-gray-500 ml-2">({(goal / 1000).toFixed(2)} Liters)</span>
            </p>
          </div>

          {/* Track Today's Hydration Card */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today's Hydration Tracker</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Track your daily water intake</p>
              </div>
              <button 
                onClick={resetWater}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-400 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Progress Display */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-2xl font-extrabold text-cyan-400 font-mono">
                  {waterIntake} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ {goal} ml</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-mono">
                  {goal > 0 ? Math.min(Math.round((waterIntake / goal) * 100), 100) : 0}%
                </p>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                  style={{ width: `${goal > 0 ? Math.min((waterIntake / goal) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => addWater(250)}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 hover:border-cyan-500/30 transition-all active:scale-95 group shadow-sm dark:shadow-none"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform inline-block animate-water-pulse">🥛</span>
                <span className="text-[10px] text-gray-900 dark:text-white font-semibold">+250 ml</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Glass</span>
              </button>
              <button 
                onClick={() => addWater(500)}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 hover:border-cyan-500/30 transition-all active:scale-95 group shadow-sm dark:shadow-none"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform inline-block animate-water-pulse">🍼</span>
                <span className="text-[10px] text-gray-900 dark:text-white font-semibold">+500 ml</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Bottle</span>
              </button>
              <button 
                onClick={() => addWater(750)}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 hover:border-cyan-500/30 transition-all active:scale-95 group shadow-sm dark:shadow-none"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform inline-block animate-water-pulse">🥤</span>
                <span className="text-[10px] text-gray-900 dark:text-white font-semibold">+750 ml</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Bottle L</span>
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Custom (e.g. 300)" 
                id="custom-water-input"
                className="flex-1 px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-xs focus:outline-none focus:border-cyan-500/50 transition-all font-mono" 
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('custom-water-input') as HTMLInputElement;
                  const amt = parseInt(input?.value || '', 10);
                  if (amt > 0) {
                    addWater(amt);
                    if (input) input.value = '';
                  }
                }}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold rounded-xl transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Goal Breakdown & Science Card */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" /> How is my goal calculated?
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-3 leading-relaxed">
              <p>
                Your hydration goal is calculated using standard healthcare guidelines based on your body mass and metabolic needs:
              </p>
              <div className="bg-gray-100 dark:bg-black/25 p-4 rounded-xl space-y-2 font-mono text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span>Body Weight:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{weight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Baseline Rate:</span>
                  <span className="text-gray-500 dark:text-gray-400">35 ml / kg / day</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-2">
                  <span>Baseline Target:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{Math.round(+weight * 35)} ml</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Activity Multiplier:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    ×{
                      activity === 'sedentary' ? '1.00' :
                      activity === 'light' ? '1.15' :
                      activity === 'moderate' ? '1.30' :
                      activity === 'active' ? '1.45' : '1.60'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 -mt-1 pl-4">
                  <span>({activity.replace('_', ' ')})</span>
                  <span>(Sweat replenishment)</span>
                </div>
                <div className="flex justify-between items-center text-gray-900 dark:text-white font-bold pt-2 border-t border-gray-200 dark:border-white/10">
                  <span>Hydration Target:</span>
                  <span className="text-cyan-600 dark:text-cyan-300 text-sm">{goal} ml ({(goal / 1000).toFixed(2)}L)</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Why Weight Matters:</strong> Body mass directly dictates metabolic processes, cellular activity, and kidney filtration load. Larger muscle and tissue volume require proportionately more water to stay adequately hydrated.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
