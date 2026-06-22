'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Apple, ArrowRight, ArrowLeft, CheckCircle, User, Target, Utensils, Wallet } from 'lucide-react';
import { API_BASE_URL, calculateBMR, calculateTDEE, calculateCalorieGoal } from '@/lib/utils';

const steps = [
  { id: 1, title: "What's your name?",     icon: User,      color: 'from-emerald-500 to-green-500' },
  { id: 2, title: "Your body stats",        icon: Target,    color: 'from-blue-500 to-cyan-500' },
  { id: 3, title: "Your fitness goal",      icon: Target,    color: 'from-violet-500 to-purple-500' },
  { id: 4, title: "Diet",                   icon: Utensils,  color: 'from-orange-500 to-amber-500' },
];



const OptionCard = ({ label, value, current, onClick, emoji }: any) => (
  <button onClick={() => onClick(value)}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all
      ${current === value
        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-550 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10'}`}>
    <span className="text-2xl">{emoji}</span>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', age: '', weight: '', height: '', gender: 'male',
    goal: 'maintenance', diet: 'vegetarian', budget: '200',
  });

  useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  });

  const set = (k: string, v: string) => setData(d => ({ ...d, [k]: v }));

  const finish = async () => {
    // Calculate custom calorie goal
    let calGoal = 2000;
    try {
      const bmr = calculateBMR(data.gender, +data.weight, +data.height, +data.age);
      const tdee = calculateTDEE(bmr, 'moderate');
      calGoal = calculateCalorieGoal(tdee, data.goal);
    } catch {}

    const updatedData = { ...data, calorieGoal: calGoal, completed: true };
    localStorage.setItem('onboarding', JSON.stringify(updatedData));
    
    // Sync profile to database
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profile: {
              age: +data.age,
              weight: +data.weight,
              height: +data.height,
              gender: data.gender,
              goal: data.goal,
              dietaryPreference: data.diet,
              budget: +data.budget,
              calorieGoal: calGoal
            }
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync profile to database:', err);
    }

    router.push('/dashboard');
  };



  const cur = steps[step];
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] text-gray-900 dark:text-white flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">NutriBudget</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-550 dark:text-gray-400 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-xl dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cur.color} flex items-center justify-center shadow-md shadow-emerald-500/10`}>
              <cur.icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cur.title}</h2>
          </div>

          {/* Step 0: Name */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={data.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-905 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide">Gender</label>
                <select value={data.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-905 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all">
                  <option value="male" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Male</option>
                  <option value="female" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Female</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 1: Body stats */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide">Age</label>
                <input type="number" placeholder="22" value={data.age} onChange={e => set('age', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-905 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide">Weight (kg)</label>
                <input type="number" placeholder="65" value={data.weight} onChange={e => set('weight', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-905 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide">Height (cm)</label>
                <input type="number" placeholder="170" value={data.height} onChange={e => set('height', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-905 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <OptionCard label="Weight Loss"   value="loss"         current={data.goal} onClick={(v: string) => set('goal', v)} emoji="🔥" />
              <OptionCard label="Maintenance"   value="maintenance"  current={data.goal} onClick={(v: string) => set('goal', v)} emoji="⚖️" />
              <OptionCard label="Lean Bulk"     value="lean_bulk"    current={data.goal} onClick={(v: string) => set('goal', v)} emoji="💪" />
              <OptionCard label="Muscle Gain"   value="muscle_gain"  current={data.goal} onClick={(v: string) => set('goal', v)} emoji="🏋️" />
            </div>
          )}

          {/* Step 3: Diet & budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide mb-2">Diet Preference</p>
                <div className="grid grid-cols-3 gap-2">
                  <OptionCard label="Vegetarian"     value="vegetarian"     current={data.diet} onClick={(v: string) => set('diet', v)} emoji="🥦" />
                  <OptionCard label="Non-Veg"        value="non-vegetarian" current={data.diet} onClick={(v: string) => set('diet', v)} emoji="🍗" />
                  <OptionCard label="Vegan"          value="vegan"          current={data.diet} onClick={(v: string) => set('diet', v)} emoji="🌱" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 text-sm rounded-xl transition-all">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r ${cur.color} text-white text-sm font-semibold rounded-xl transition-all shadow-lg`}>
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                <CheckCircle className="h-4 w-4" /> Let's Go!
              </button>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-6 h-2 bg-emerald-400' : i < step ? 'w-2 h-2 bg-emerald-600' : 'w-2 h-2 bg-gray-250 dark:bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
