'use client';

import { useState, useEffect } from 'react';
import { UtensilsCrossed, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateCalorieGoal } from '@/lib/utils';

const plans: any = {
  loss: {
    label: 'Weight Loss', calories: 1500, color: 'from-red-500 to-orange-500',
    meals: [
      { time: 'Breakfast 7AM', items: ['Oats with skimmed milk (300 kcal)', 'Banana (90 kcal)', 'Black coffee (5 kcal)'], cal: 395 },
      { time: 'Mid-Morning 10AM', items: ['Sprouts salad (100 kcal)', 'Lemon water (5 kcal)'], cal: 105 },
      { time: 'Lunch 1PM', items: ['2 Roti (190 kcal)', 'Dal (150 kcal)', 'Salad (40 kcal)'], cal: 380 },
      { time: 'Evening 5PM', items: ['Green tea (5 kcal)', 'Handful almonds (100 kcal)'], cal: 105 },
      { time: 'Dinner 8PM', items: ['Vegetable khichdi (300 kcal)', 'Curd (60 kcal)', 'Salad (55 kcal)'], cal: 415 },
    ],
  },
  maintenance: {
    label: 'Maintenance', calories: 2000, color: 'from-green-500 to-emerald-500',
    meals: [
      { time: 'Breakfast 7AM', items: ['Poha with peanuts (350 kcal)', 'Milk (120 kcal)', 'Fruit (80 kcal)'], cal: 550 },
      { time: 'Mid-Morning 10AM', items: ['Boiled eggs ×2 (140 kcal)', 'Toast (80 kcal)'], cal: 220 },
      { time: 'Lunch 1PM', items: ['Rice (200 kcal)', 'Dal (150 kcal)', 'Sabzi (120 kcal)', 'Curd (60 kcal)'], cal: 530 },
      { time: 'Evening 5PM', items: ['Peanut butter toast (200 kcal)'], cal: 200 },
      { time: 'Dinner 8PM', items: ['3 Roti (285 kcal)', 'Paneer curry (220 kcal)'], cal: 505 },
    ],
  },
  lean_bulk: {
    label: 'Lean Bulk', calories: 2300, color: 'from-blue-500 to-cyan-500',
    meals: [
      { time: 'Breakfast 7AM', items: ['3 Egg omelette (220 kcal)', 'Brown bread ×2 (160 kcal)', 'Milk (120 kcal)'], cal: 500 },
      { time: 'Mid-Morning 10AM', items: ['Banana shake (300 kcal)'], cal: 300 },
      { time: 'Lunch 1PM', items: ['Rice (200 kcal)', 'Chicken curry (280 kcal)', 'Dal (150 kcal)', 'Salad (40 kcal)'], cal: 670 },
      { time: 'Evening 5PM', items: ['Protein snack (200 kcal)', 'Nuts (150 kcal)'], cal: 350 },
      { time: 'Dinner 8PM', items: ['3 Roti (285 kcal)', 'Paneer/Chicken (200 kcal)'], cal: 485 },
    ],
  },
  muscle_gain: {
    label: 'Muscle Gain', calories: 2600, color: 'from-violet-500 to-purple-500',
    meals: [
      { time: 'Breakfast 7AM', items: ['5 Egg omelette (360 kcal)', 'Brown bread ×3 (240 kcal)', 'Milk (150 kcal)'], cal: 750 },
      { time: 'Mid-Morning 10AM', items: ['Peanut butter banana shake (400 kcal)'], cal: 400 },
      { time: 'Lunch 1PM', items: ['Rice (300 kcal)', 'Chicken 200g (330 kcal)', 'Dal (150 kcal)'], cal: 780 },
      { time: 'Evening 5PM', items: ['Paneer sandwich (300 kcal)'], cal: 300 },
      { time: 'Dinner 8PM', items: ['4 Roti (380 kcal)', 'Egg curry (240 kcal)'], cal: 620 },
    ],
  },
};

export default function DietPlansPage() {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: 'male', activity: 'moderate' });
  const [goal, setGoal] = useState('maintenance');
  const [openMeal, setOpenMeal] = useState<number | null>(0);

  useEffect(() => {
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      if (ob.age) {
        setForm({
          age: ob.age || '',
          weight: ob.weight || '',
          height: ob.height || '',
          gender: ob.gender || 'male',
          activity: ob.activity || 'moderate'
        });
      }
    } catch {}
  }, []);

  const getCalculatedCalories = () => {
    if (!form.age || !form.weight || !form.height) return null;
    const bmr = calculateBMR(form.gender, +form.weight, +form.height, +form.age);
    const tdee = calculateTDEE(bmr, form.activity);
    
    return {
      loss: calculateCalorieGoal(tdee, 'loss'),
      maintenance: calculateCalorieGoal(tdee, 'maintenance'),
      lean_bulk: calculateCalorieGoal(tdee, 'lean_bulk'),
      muscle_gain: calculateCalorieGoal(tdee, 'muscle_gain')
    };
  };

  const getAgeGroupNote = (ageNum: number) => {
    if (ageNum < 20) {
      return {
        title: "Growth & Development Phase (Under 20)",
        focus: "High calcium, bone-density support, and proteins.",
        desc: "At your age, body tissues are still growing rapidly. Focus on calcium-rich foods (milk, yogurt, leafy greens) for skeletal support and adequate clean proteins for muscle development. Strict metabolic restriction is not recommended.",
        color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20"
      };
    } else if (ageNum <= 50) {
      return {
        title: "Active Adult Phase (20 - 50)",
        focus: "Balanced macros, clean energy, and lean muscle maintenance.",
        desc: "Metabolism is stable but begins to adapt. Focus on healthy fats (nuts, olive oil), lean proteins, and complex carbohydrates for steady energy release and cell repair.",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
      };
    } else {
      return {
        title: "Senior Longevity & Health Phase (Over 50)",
        focus: "Higher fiber, bone support, and digestible proteins.",
        desc: "Basal metabolic rate naturally decreases by 5–10% per decade after 50. Prioritize bone strength (Calcium + Vitamin D), joint health, cardiovascular support (omega-3s, low sodium), and fiber for digestion.",
        color: "text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20"
      };
    }
  };

  const getScaledMeals = (meals: any[], factor: number) => {
    return meals.map(meal => {
      const scaledItems = meal.items.map((item: string) => {
        const regex = /(\d+)\s*kcal/g;
        return item.replace(regex, (match, p1) => {
          const scaledVal = Math.round(+p1 * factor);
          return `${scaledVal} kcal`;
        });
      });
      return {
        ...meal,
        items: scaledItems,
        cal: Math.round(meal.cal * factor)
      };
    });
  };

  const targets = getCalculatedCalories();
  const baseCalories = plans[goal].calories;
  const targetCal = targets ? targets[goal as keyof typeof targets] : baseCalories;
  const scalingFactor = targetCal / baseCalories;

  const plan = plans[goal];
  const scaledMeals = getScaledMeals(plan.meals, scalingFactor);

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-green-500 dark:text-green-400" /> Diet Plans
        </h1>
        <p className="text-gray-505 dark:text-gray-500 text-sm mt-1">Pre-built Indian meal plans scaled to your body statistics</p>
      </div>

      {/* Stats customization */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personalize Diet Plans</h3>
        <p className="text-xs text-gray-500 -mt-2">Enter your stats to automatically calculate and scale daily target calories across all categories.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Age (yrs)</label>
            <input type="number" placeholder="25" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
              className="w-full px-2.5 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-xs focus:outline-none focus:border-green-500/50 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Weight (kg)</label>
            <input type="number" placeholder="70" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
              className="w-full px-2.5 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-xs focus:outline-none focus:border-green-500/50 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Height (cm)</label>
            <input type="number" placeholder="175" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })}
              className="w-full px-2.5 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-xs focus:outline-none focus:border-green-500/50 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Gender</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full px-2.5 py-2 bg-white dark:bg-[#161620] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs focus:outline-none focus:border-green-500/50 transition-all">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Activity</label>
            <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })}
              className="w-full px-2.5 py-2 bg-white dark:bg-[#161620] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs focus:outline-none focus:border-green-500/50 transition-all">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Age-based Advice Note */}
      {form.age && (
        <div className={`border p-4 rounded-2xl space-y-1.5 transition-all ${getAgeGroupNote(+form.age).color}`}>
          <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            💡 {getAgeGroupNote(+form.age).title}
          </h4>
          <p className="text-[11px] font-semibold">Focus: {getAgeGroupNote(+form.age).focus}</p>
          <p className="text-xs opacity-80 leading-relaxed">{getAgeGroupNote(+form.age).desc}</p>
        </div>
      )}

      {/* Category Selection with live custom targets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(plans).map(([key, p]: any) => {
          const catCal = targets ? targets[key as keyof typeof targets] : p.calories;
          return (
            <button key={key} onClick={() => { setGoal(key); setOpenMeal(0); }}
              className={`py-2.5 px-3 rounded-xl border text-[11px] font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${goal === key
                ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-lg`
                : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm dark:shadow-none'}`}>
              <span>{p.label}</span>
              <span className={`text-[10px] ${goal === key ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{catCal} kcal</span>
            </button>
          );
        })}
      </div>

      {/* Daily Target Card */}
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-white/70 text-xs mb-1">{targets ? 'Your Personalized Daily Target' : 'Default Daily Target'}</p>
            <p className="text-4xl font-bold text-white">{targetCal} <span className="text-base font-normal text-white/70">kcal</span></p>
          </div>
          <span className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold">{plan.label}</span>
        </div>
      </div>

      {/* Info indicator for scaling */}
      {targets && (
        <div className="flex gap-2 p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-600 dark:text-gray-400 shadow-sm dark:shadow-none">
          <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Portions are dynamically scaled by <strong>{scalingFactor.toFixed(2)}x</strong> to match your personal energy requirements.</span>
        </div>
      )}

      {/* Meal Items */}
      <div className="space-y-2">
        {scaledMeals.map((meal: any, i: number) => (
          <div key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              onClick={() => setOpenMeal(openMeal === i ? null : i)}>
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${plan.color} shrink-0`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{meal.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-orange-400 font-semibold">{meal.cal} kcal</span>
                {openMeal === i ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </div>
            </button>
            {openMeal === i && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-white/10 space-y-2">
                {meal.items.map((item: string, j: number) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
