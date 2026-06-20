'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Sparkles, ChevronLeft, ChevronRight, Plus, X,
  CheckCircle2, Flame, Zap, Trophy
} from 'lucide-react';
import { API_BASE_URL, calculateBMR, calculateTDEE, calculateCalorieGoal } from '@/lib/utils';

type FoodEntry = { id: number; name: string; cal: number; protein: number; carbs: number; fat: number; emoji: string; baseWeight?: number };
type DayLog = { [dateKey: string]: FoodEntry[] };

const foodSuggestions: FoodEntry[] = [
  { id: 1,  name: 'Oats',                  cal: 307, protein: 11, carbs: 55, fat: 5,  emoji: '🥣', baseWeight: 80 },
  { id: 2,  name: 'Banana',                cal: 89,  protein: 1,  carbs: 23, fat: 0,  emoji: '🍌', baseWeight: 120 },
  { id: 3,  name: 'Boiled Egg',             cal: 78,  protein: 6,  carbs: 1,  fat: 5,  emoji: '🥚', baseWeight: 50 },
  { id: 4,  name: 'Brown Rice',            cal: 216, protein: 5,  carbs: 45, fat: 2,  emoji: '🍚', baseWeight: 195 },
  { id: 5,  name: 'Dal',                   cal: 150, protein: 9,  carbs: 20, fat: 5,  emoji: '🍲', baseWeight: 150 },
  { id: 6,  name: 'Paneer',                cal: 265, protein: 18, carbs: 3,  fat: 20, emoji: '🧀', baseWeight: 100 },
  { id: 7,  name: 'Chicken Breast',        cal: 165, protein: 31, carbs: 0,  fat: 4,  emoji: '🍗', baseWeight: 100 },
  { id: 8,  name: 'Whole Wheat Roti',      cal: 104, protein: 3,  carbs: 20, fat: 1,  emoji: '🫓', baseWeight: 40 },
  { id: 9,  name: 'Milk',                  cal: 122, protein: 6,  carbs: 9,  fat: 5,  emoji: '🥛', baseWeight: 200 },
  { id: 10, name: 'Apple',                 cal: 95,  protein: 0,  carbs: 25, fat: 0,  emoji: '🍎', baseWeight: 150 },
  { id: 11, name: 'Mixed Salad',           cal: 45,  protein: 2,  carbs: 8,  fat: 1,  emoji: '🥗', baseWeight: 100 },
  { id: 12, name: 'Peanut Butter',         cal: 94,  protein: 4,  carbs: 3,  fat: 8,  emoji: '🥜', baseWeight: 16 },
  { id: 13, name: 'Almonds',               cal: 70,  protein: 3,  carbs: 2,  fat: 6,  emoji: '🌰', baseWeight: 12 },
  { id: 14, name: 'Greek Yogurt',          cal: 59,  protein: 10, carbs: 4,  fat: 0,  emoji: '🫙', baseWeight: 100 },
  { id: 15, name: 'Sweet Potato',          cal: 112, protein: 2,  carbs: 26, fat: 0,  emoji: '🍠', baseWeight: 130 },
  { id: 16, name: 'Sprouts',               cal: 31,  protein: 3,  carbs: 6,  fat: 0,  emoji: '🌱', baseWeight: 100 },
  { id: 17, name: 'Poha',                  cal: 250, protein: 4,  carbs: 50, fat: 5,  emoji: '🍛', baseWeight: 150 },
  { id: 18, name: 'Idli',                  cal: 156, protein: 5,  carbs: 32, fat: 1,  emoji: '🫔', baseWeight: 100 },
  { id: 19, name: 'Sambar',                cal: 100, protein: 5,  carbs: 15, fat: 3,  emoji: '🍜', baseWeight: 150 },
  { id: 20, name: 'Green Tea',              cal: 2,   protein: 0,  carbs: 0,  fat: 0,  emoji: '🍵', baseWeight: 200 },
];

const DAILY_GOAL = 2000;

function dk(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }

function calcStreak(log: DayLog): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if ((log[dk(d)] || []).length > 0) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function Calendar({ selectedDate, onSelect, loggedDays }: { selectedDate: Date; onSelect: (d: Date) => void; loggedDays: Set<string> }) {
  const [view, setView] = useState(new Date(selectedDate));
  const today = new Date();
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setView(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{months[month]} {year}</span>
        <button onClick={() => setView(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-[10px] font-medium text-gray-500 py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = new Date(year, month, day);
          const key = dk(d);
          const isTod = d.toDateString() === today.toDateString();
          const isSel = d.toDateString() === selectedDate.toDateString();
          const hasLog = loggedDays.has(key);
          return (
            <button key={i} onClick={() => onSelect(d)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                ${isSel 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : isTod 
                    ? 'bg-gray-100 dark:bg-white/15 text-gray-900 dark:text-white ring-1 ring-emerald-500/50' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}>
              {day}
              {hasLog && !isSel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayLog, setDayLog] = useState<DayLog>({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [customFood, setCustomFood] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '' });
  const [selectedSuggestFood, setSelectedSuggestFood] = useState<FoodEntry | null>(null);
  const [qty, setQty] = useState('1');
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const handleSaveGoal = async () => {
    const val = parseInt(goalInput, 10);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid calorie target.');
      return;
    }
    setDailyGoal(val);
    setIsEditingGoal(false);

    // Save to onboarding in localStorage
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      ob.calorieGoal = String(val);
      localStorage.setItem('onboarding', JSON.stringify(ob));
    } catch {}

    // Save to user object in localStorage
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.profile) u.profile = {};
      u.profile.calorieGoal = val;
      localStorage.setItem('user', JSON.stringify(u));
    } catch {}

    // Sync to backend profile
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        
        await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profile: {
              age: ob.age ? +ob.age : (u.profile?.age ? +u.profile.age : undefined),
              weight: ob.weight ? +ob.weight : (u.profile?.weight ? +u.profile.weight : undefined),
              height: ob.height ? +ob.height : (u.profile?.height ? +u.profile.height : undefined),
              gender: ob.gender || u.profile?.gender || 'male',
              calorieGoal: val
            }
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync calorie goal update:', err);
    }
  };

  const syncProgressToBackend = async (targetDate: Date, currentDayLog?: DayLog) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const onboarding = JSON.parse(localStorage.getItem('onboarding') || '{}');
      const weight = onboarding.weight || '';
      
      const dateKey = dk(targetDate);
      
      const log = currentDayLog || JSON.parse(localStorage.getItem('dayLog') || '{}');
      const entries = log[dateKey] || [];
      const totalCal = entries.reduce((s: number, e: any) => s + e.cal, 0);

      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      const waterIntake = waterLog[dateKey] || 0;

      // Determine workout status
      const workoutLog = JSON.parse(localStorage.getItem('workoutLog') || '{}');
      const workoutCompleted = !!workoutLog[dateKey];

      const body = {
        date: targetDate.toISOString(),
        weight: weight ? parseFloat(weight) : undefined,
        caloriesConsumed: totalCal,
        waterIntake,
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

  const fetchProgressHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.progress) {
        const fetchedLog: DayLog = {};
        const fetchedWaterLog: { [key: string]: number } = {};
        const fetchedWorkoutLog: { [key: string]: boolean } = {};

        data.progress.forEach((p: any) => {
          if (!p.date) return;
          const d = new Date(p.date);
          const key = dk(d);
          
          if (p.foodEntries && p.foodEntries.length > 0) {
            fetchedLog[key] = p.foodEntries.map((fe: any, index: number) => ({
              id: fe.id || Date.now() + index + Math.random(),
              name: fe.name,
              cal: fe.cal,
              protein: fe.protein || 0,
              carbs: fe.carbs || 0,
              fat: fe.fat || 0,
              emoji: fe.emoji || '🍽️'
            }));
          }
          if (p.waterIntake) {
            fetchedWaterLog[key] = p.waterIntake;
          }
          if (p.workoutCompleted) {
            fetchedWorkoutLog[key] = p.workoutCompleted;
          }
        });

        // Merge fetched logs with existing local logs if any
        setDayLog(prev => {
          const merged = { ...fetchedLog, ...prev };
          localStorage.setItem('dayLog', JSON.stringify(merged));
          return merged;
        });

        if (Object.keys(fetchedWaterLog).length > 0) {
          const currentWater = JSON.parse(localStorage.getItem('waterLog') || '{}');
          localStorage.setItem('waterLog', JSON.stringify({ ...fetchedWaterLog, ...currentWater }));
        }

        if (Object.keys(fetchedWorkoutLog).length > 0) {
          const currentWorkout = JSON.parse(localStorage.getItem('workoutLog') || '{}');
          localStorage.setItem('workoutLog', JSON.stringify({ ...fetchedWorkoutLog, ...currentWorkout }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch progress history:', err);
    }
  };

  useEffect(() => {
    try { setUserName(JSON.parse(localStorage.getItem('user') || '{}')?.name?.split(' ')[0] || 'User'); } catch {}
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    
    // Load dynamic daily goal from onboarding details
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      if (ob.calorieGoal) {
        setDailyGoal(+ob.calorieGoal);
      } else if (ob.age && ob.weight && ob.height) {
        const bmr = calculateBMR(ob.gender || 'male', +ob.weight, +ob.height, +ob.age);
        const tdee = calculateTDEE(bmr, ob.activity || 'moderate');
        const target = calculateCalorieGoal(tdee, ob.goal || 'maintenance');
        setDailyGoal(target);
      }
    } catch {}

    // First load local dayLog if it exists
    try {
      const saved = localStorage.getItem('dayLog');
      if (saved) {
        setDayLog(JSON.parse(saved));
      }
    } catch {}

    // Then fetch progress history from DB to merge and sync dots
    fetchProgressHistory();
  }, []);

  useEffect(() => {
    if (Object.keys(dayLog).length > 0) {
      localStorage.setItem('dayLog', JSON.stringify(dayLog));
      syncProgressToBackend(selectedDate, dayLog);
    }
  }, [dayLog, selectedDate]);

  const key = dk(selectedDate);
  const entries = dayLog[key] || [];
  const totalCal = entries.reduce((s, e) => s + e.cal, 0);
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = entries.reduce((s, e) => s + e.fat, 0);
  const calPct = Math.min((totalCal / dailyGoal) * 100, 100);
  const loggedDays = new Set(Object.keys(dayLog).filter(k => dayLog[k].length > 0));
  const streak = calcStreak(dayLog);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const addFood = (food: FoodEntry) => setDayLog(prev => ({ ...prev, [key]: [...(prev[key] || []), { ...food, id: Date.now() }] }));
  const removeFood = (id: number) => setDayLog(prev => ({ ...prev, [key]: (prev[key] || []).filter(e => e.id !== id) }));
  
  const handleSuggestClick = (food: FoodEntry) => {
    setSelectedSuggestFood(food);
    setQty(String(food.baseWeight || 100));
    setShowQtyModal(true);
  };

  const addScaledFood = () => {
    if (!selectedSuggestFood) return;
    const inputGrams = parseFloat(qty) || selectedSuggestFood.baseWeight || 100;
    const base = selectedSuggestFood.baseWeight || 100;
    const factor = inputGrams / base;

    const scaledFood = {
      ...selectedSuggestFood,
      id: Date.now(),
      name: `${selectedSuggestFood.name} (${inputGrams}g)`,
      cal: Math.round(selectedSuggestFood.cal * factor),
      protein: parseFloat((selectedSuggestFood.protein * factor).toFixed(1)),
      carbs: parseFloat((selectedSuggestFood.carbs * factor).toFixed(1)),
      fat: parseFloat((selectedSuggestFood.fat * factor).toFixed(1)),
    };
    setDayLog(prev => ({ ...prev, [key]: [...(prev[key] || []), scaledFood] }));
    setShowQtyModal(false);
    setSelectedSuggestFood(null);
  };

  const addCustom = () => {
    if (!customFood.name || !customFood.cal) return;
    addFood({ id: Date.now(), name: customFood.name, cal: +customFood.cal, protein: +customFood.protein || 0, carbs: +customFood.carbs || 0, fat: +customFood.fat || 0, emoji: '🍽️' });
    setCustomFood({ name: '', cal: '', protein: '', carbs: '', fat: '' });
    setShowModal(false);
  };

  const filtered = foodSuggestions.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting + Streak */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/40 via-[#13131a] to-teal-900/30 border border-emerald-500/20 p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-emerald-400 text-xs font-medium flex items-center gap-1 mb-1"><Sparkles className="h-3.5 w-3.5" />{greeting}</p>
            <h1 className="text-xl font-bold text-white">Welcome back, <span className="text-emerald-400">{userName}</span> 👋</h1>
            <p className="text-gray-500 text-xs mt-1">{isToday ? "Today's" : selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} log</p>
          </div>
          <div className="flex gap-3 shrink-0">
            {/* Streak badge */}
            <div className="flex flex-col items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 min-w-[60px]">
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-lg font-bold text-orange-400">{streak}</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5">day streak</span>
            </div>
            {/* Calories */}
            <div className="flex flex-col items-center justify-center text-right">
              <p className="text-xs text-gray-500 mb-0.5">Calories</p>
              <p className="text-2xl font-bold text-orange-400">{totalCal}</p>
              {isEditingGoal ? (
                <div className="flex items-center gap-1 mt-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-14 px-1 py-0.5 text-[10px] text-center text-white bg-[#13131a] border border-white/15 rounded focus:outline-none focus:border-emerald-500 font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveGoal();
                      if (e.key === 'Escape') setIsEditingGoal(false);
                    }}
                  />
                  <button onClick={handleSaveGoal} className="px-1 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded transition-all">Set</button>
                  <button onClick={() => setIsEditingGoal(false)} className="text-gray-500 hover:text-gray-400 text-xs px-1">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingGoal(true);
                    setGoalInput(String(dailyGoal));
                  }}
                  className="text-xs text-gray-500 hover:text-emerald-400 transition-all flex items-center gap-1 group/btn border border-transparent hover:border-white/10 hover:bg-white/5 rounded-md px-1.5 py-0.5 mt-0.5"
                  title="Click to edit calorie goal"
                >
                  <span>/ {dailyGoal}</span>
                  <svg className="h-3 w-3 opacity-0 group-hover/btn:opacity-80 transition-opacity text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-700" style={{ width: `${calPct}%` }} />
        </div>
        {streak >= 3 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-400">
            <Trophy className="h-3.5 w-3.5" />
            {streak >= 7 ? `🔥 ${streak} day streak — you're on fire!` : streak >= 3 ? `⚡ ${streak} days going strong!` : ''}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Calendar + macros + log */}
        <div className="space-y-4">
          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} loggedDays={loggedDays} />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein', value: totalProtein, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Carbs',   value: totalCarbs,   color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Fat',     value: totalFat,     color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            ].map(m => (
              <div key={m.label} className={`${m.bg} border rounded-xl p-3 text-center`}>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}<span className="text-xs font-normal text-gray-500">g</span></p>
                <p className="text-[10px] text-gray-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{isToday ? "Today's Log" : selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span className="text-xs text-orange-400 font-semibold">{totalCal} kcal</span>
            </div>
            {entries.length === 0 ? (
              <div className="py-8 text-center"><p className="text-3xl mb-2">🍽️</p><p className="text-xs text-gray-500 dark:text-gray-400">No food logged yet</p></div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-52 overflow-y-auto">
                {entries.map(e => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-2.5 group">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{e.emoji}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{e.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{e.protein}g P · {e.carbs}g C · {e.fat}g F</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-orange-400 font-medium">{e.cal}</span>
                      <button onClick={() => removeFood(e.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-gray-600 transition-all"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Food Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Food Suggestions</h2>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-all">
              <Plus className="h-3.5 w-3.5" /> Custom Food
            </button>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-sm dark:shadow-none" />
            <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filtered.map(food => {
              return (
                <button key={food.id} onClick={() => handleSuggestClick(food)}
                  className="relative flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.02] text-left transition-all group shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{food.emoji}</span>
                    <Plus className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{food.name}</p>
                    <p className="text-orange-400 text-xs font-semibold mt-0.5">
                      {food.cal} kcal <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">({food.baseWeight}g)</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>P:{food.protein}g</span><span>C:{food.carbs}g</span><span>F:{food.fat}g</span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="col-span-3 py-10 text-center text-gray-500 dark:text-gray-600 text-sm">No foods found</div>}
          </div>
        </div>
      </div>

      {/* Custom Food Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/15 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add Custom Food</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:text-gray-900 dark:hover:text-white text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Food Name *', key: 'name', type: 'text', placeholder: 'e.g. Homemade Dal' },
                { label: 'Calories *',  key: 'cal',  type: 'number', placeholder: '150' },
                { label: 'Protein (g)', key: 'protein', type: 'number', placeholder: '8' },
                { label: 'Carbs (g)',   key: 'carbs', type: 'number', placeholder: '20' },
                { label: 'Fat (g)',     key: 'fat', type: 'number', placeholder: '5' },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(customFood as any)[f.key]}
                    onChange={e => setCustomFood({ ...customFood, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 text-sm rounded-xl transition-all">Cancel</button>
              <button onClick={addCustom} className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-xl">Add Food</button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selector Modal for Suggestions */}
      {showQtyModal && selectedSuggestFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/15 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{selectedSuggestFood.emoji}</span> Add Suggestion
              </h3>
              <button onClick={() => setShowQtyModal(false)} className="p-1 hover:text-gray-900 dark:hover:text-white text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Food Name Display */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedSuggestFood.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Base nutrition values calculated per {selectedSuggestFood.baseWeight}g serving.
              </p>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">Log Quantity (in grams)</label>
              <input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={e => setQty(e.target.value)}
                placeholder="e.g. 100, 150, 250"
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono" 
              />
            </div>

            {/* Scaled Stats Preview Panel */}
            {(() => {
              const inputGrams = parseFloat(qty) || selectedSuggestFood.baseWeight || 100;
              const base = selectedSuggestFood.baseWeight || 100;
              const f = inputGrams / base;
              const calcCal = Math.round(selectedSuggestFood.cal * f);
              const calcP = (selectedSuggestFood.protein * f).toFixed(1);
              const calcC = (selectedSuggestFood.carbs * f).toFixed(1);
              const calcF = (selectedSuggestFood.fat * f).toFixed(1);
              return (
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Total Calories ({inputGrams}g)</span>
                    <span className="text-orange-400 font-bold">{calcCal} kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-white/5 text-center text-[10px]">
                    <div className="bg-blue-500/10 border border-blue-500/10 rounded-lg py-1.5">
                      <p className="text-blue-400 font-bold">{calcP}g</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">Protein</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/10 rounded-lg py-1.5">
                      <p className="text-yellow-400 font-bold">{calcC}g</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">Carbs</p>
                    </div>
                    <div className="bg-pink-500/10 border border-pink-500/10 rounded-lg py-1.5">
                      <p className="text-pink-400 font-bold">{calcF}g</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">Fat</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowQtyModal(false)} 
                className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={addScaledFood} 
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                Add Food Log
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
