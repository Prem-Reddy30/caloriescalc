'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Clock, Flame, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const plans = [
  {
    id: 1, name: 'Fat Burner', goal: 'Weight Loss', days: '5 days/week', duration: '45 min', burn: '400–500 kcal',
    color: 'from-red-500 to-orange-500',
    schedule: [
      { day: 'Monday',    workout: 'HIIT Cardio',   exercises: ['Jumping Jacks 3×30','Burpees 3×15','Mountain Climbers 3×20','Jump Rope 3×2min'] },
      { day: 'Tuesday',   workout: 'Lower Body',    exercises: ['Squats 4×15','Lunges 3×12 each','Glute Bridges 3×20','Calf Raises 3×25'] },
      { day: 'Wednesday', workout: 'Active Rest',   exercises: ['30 min brisk walk','Stretching 15 min'] },
      { day: 'Thursday',  workout: 'Upper Body',    exercises: ['Push-ups 4×15','Dumbbell Rows 3×12','Shoulder Press 3×12','Bicep Curls 3×15'] },
      { day: 'Friday',    workout: 'Full Body HIIT',exercises: ['Thrusters 3×15','Box Jumps 3×10','Kettlebell Swings 3×20','Plank 3×1min'] },
      { day: 'Saturday',  workout: 'Cardio',        exercises: ['5km Run or Cycling 30 min','Core Circuit 15 min'] },
      { day: 'Sunday',    workout: 'Rest',           exercises: ['Full body stretch','Foam rolling'] },
    ],
  },
  {
    id: 2, name: 'Muscle Builder', goal: 'Muscle Gain', days: '5 days/week', duration: '60 min', burn: '300–400 kcal',
    color: 'from-blue-500 to-violet-500',
    schedule: [
      { day: 'Monday',    workout: 'Chest & Triceps', exercises: ['Bench Press 4×8','Incline DB Press 3×10','Cable Flyes 3×12','Tricep Dips 3×12','Skull Crushers 3×10'] },
      { day: 'Tuesday',   workout: 'Back & Biceps',   exercises: ['Deadlifts 4×6','Pull-ups 4×8','Barbell Rows 3×10','Hammer Curls 3×12','Face Pulls 3×15'] },
      { day: 'Wednesday', workout: 'Rest',             exercises: ['Light walk','Stretching'] },
      { day: 'Thursday',  workout: 'Legs',             exercises: ['Squats 4×8','Leg Press 4×10','Romanian Deadlifts 3×10','Leg Curls 3×12','Calf Raises 4×20'] },
      { day: 'Friday',    workout: 'Shoulders & Abs',  exercises: ['OHP 4×8','Lateral Raises 4×12','Front Raises 3×12','Plank 3×1min','Cable Crunches 3×15'] },
      { day: 'Saturday',  workout: 'Arms',             exercises: ['Barbell Curls 4×10','Tricep Pushdowns 4×12','Preacher Curls 3×10','Overhead Ext 3×12'] },
      { day: 'Sunday',    workout: 'Rest',             exercises: ['Full rest & recovery'] },
    ],
  },
  {
    id: 3, name: 'Stay Fit', goal: 'Maintenance', days: '4 days/week', duration: '40 min', burn: '250–350 kcal',
    color: 'from-emerald-500 to-green-500',
    schedule: [
      { day: 'Monday',    workout: 'Full Body A',    exercises: ['Push-ups 3×15','Squats 3×15','Dumbbell Rows 3×12','Plank 3×45s'] },
      { day: 'Tuesday',   workout: 'Cardio',         exercises: ['30 min jog or cycling','Cool-down stretching'] },
      { day: 'Wednesday', workout: 'Rest',            exercises: ['Walk 20 min'] },
      { day: 'Thursday',  workout: 'Full Body B',    exercises: ['Lunges 3×12','DB Shoulder Press 3×12','Pull-ups 3×8','Russian Twists 3×20'] },
      { day: 'Friday',    workout: 'Core & Mobility',exercises: ['Plank holds 3×1min','Bicycle Crunches 3×20','Yoga flow 20 min'] },
      { day: 'Saturday',  workout: 'Active Fun',     exercises: ['Sports / Swimming / Dance'] },
      { day: 'Sunday',    workout: 'Rest',            exercises: ['Full rest'] },
    ],
  },
  {
    id: 4, name: 'Beginner', goal: 'General Fitness', days: '3 days/week', duration: '30 min', burn: '150–250 kcal',
    color: 'from-yellow-500 to-amber-500',
    schedule: [
      { day: 'Monday',    workout: 'Day 1', exercises: ['Brisk Walk 15 min','Wall Push-ups 3×10','Chair Squats 3×10','Stretching 10 min'] },
      { day: 'Wednesday', workout: 'Day 2', exercises: ['March in place 10 min','Knee Push-ups 3×12','Step-ups 3×10','Light yoga 10 min'] },
      { day: 'Friday',    workout: 'Day 3', exercises: ['Light jog 10 min','Bodyweight Squats 3×12','Glute Bridges 3×15','Cool-down 10 min'] },
    ],
  },
];

export default function WorkoutPage() {
  const [selected, setSelected] = useState(1);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [workoutLog, setWorkoutLog] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('selectedWorkoutPlan');
      if (savedPlan) setSelected(parseInt(savedPlan));

      const savedLog = localStorage.getItem('workoutLog');
      if (savedLog) setWorkoutLog(JSON.parse(savedLog));
    } catch {}
  }, []);

  const syncProgressToBackend = async (currentWorkoutLog: Record<string, boolean>) => {
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

      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      const waterIntake = waterLog[dateKey] || 0;

      const workoutCompleted = !!currentWorkoutLog[dateKey];

      const body = {
        date: today.toISOString(),
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

  const selectPlan = (id: number) => {
    setSelected(id);
    localStorage.setItem('selectedWorkoutPlan', String(id));
  };

  const toggleWorkoutToday = () => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const nextLog = { ...workoutLog, [dateKey]: !workoutLog[dateKey] };
    setWorkoutLog(nextLog);
    localStorage.setItem('workoutLog', JSON.stringify(nextLog));
    syncProgressToBackend(nextLog);
  };

  const plan = plans.find(p => p.id === selected)!;
  const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-blue-500 dark:text-blue-400" /> Workout Plans
        </h1>
        <p className="text-gray-500 text-sm mt-1">Structured weekly plans for every fitness goal</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {plans.map(p => (
          <button key={p.id} onClick={() => { selectPlan(p.id); setOpenDay(0); }}
            className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${selected === p.id
              ? `bg-gradient-to-br ${p.color} border-transparent text-white shadow-lg`
              : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
            <span className="font-semibold text-sm">{p.name}</span>
            <span className="text-xs opacity-70">{p.goal}</span>
          </button>
        ))}
      </div>

      <div className={`p-5 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg space-y-4`}>
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-white">{plan.name}</h2>
          <span className="px-2.5 py-1 bg-white/20 rounded-full text-white text-xs font-medium">{plan.goal}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ icon: Zap, label: 'Frequency', value: plan.days }, { icon: Clock, label: 'Duration', value: plan.duration }, { icon: Flame, label: 'Burn', value: plan.burn }].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <s.icon className="h-4 w-4 text-white/70 mx-auto mb-1" />
              <p className="text-[10px] text-white/70">{s.label}</p>
              <p className="text-xs font-semibold text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Complete Workout Toggler */}
        <button onClick={toggleWorkoutToday}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5
            ${workoutLog[todayKey]
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'}`}>
          <Dumbbell className="h-4 w-4" />
          {workoutLog[todayKey]
            ? '💪 Workout Completed for Today!'
            : 'Mark Today\'s Workout as Completed'}
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Schedule</h3>
        {plan.schedule.map((day, i) => (
          <div key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              onClick={() => setOpenDay(openDay === i ? null : i)}>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{day.day}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{day.workout}</span>
              </div>
              {openDay === i ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>
            {openDay === i && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-white/10 space-y-1.5">
                {day.exercises.map((ex, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${plan.color} shrink-0`} />
                    {ex}
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
