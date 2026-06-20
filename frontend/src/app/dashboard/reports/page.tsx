'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingDown, TrendingUp, Flame, Droplets, Dumbbell, Info } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<{
    days: string[];
    weeklyCalories: number[];
    weeklyWater: number[];
    workoutLog: Array<{ day: string; type: string; duration: string; cal: number }>;
  }>({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weeklyCalories: [0, 0, 0, 0, 0, 0, 0],
    weeklyWater: [0, 0, 0, 0, 0, 0, 0],
    workoutLog: []
  });

  useEffect(() => {
    try {
      const today = new Date();
      const resultDays: string[] = [];
      const resultCalories: number[] = [];
      const resultWater: number[] = [];
      const resultWorkouts: Array<{ day: string; type: string; duration: string; cal: number }> = [];

      const dayLog = JSON.parse(localStorage.getItem('dayLog') || '{}');
      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      const workoutLogLocal = JSON.parse(localStorage.getItem('workoutLog') || '{}');

      const selectedWorkoutPlanId = parseInt(localStorage.getItem('selectedWorkoutPlan') || '1');
      
      const plans = [
        { name: 'Fat Burner', duration: '45 min', cal: 450, schedule: { Monday: 'HIIT Cardio', Tuesday: 'Lower Body', Wednesday: 'Active Rest', Thursday: 'Upper Body', Friday: 'Full Body HIIT', Saturday: 'Cardio', Sunday: 'Rest' } },
        { name: 'Muscle Builder', duration: '60 min', cal: 350, schedule: { Monday: 'Chest & Triceps', Tuesday: 'Back & Biceps', Wednesday: 'Rest', Thursday: 'Legs', Friday: 'Shoulders & Abs', Saturday: 'Arms', Sunday: 'Rest' } },
        { name: 'Stay Fit', duration: '40 min', cal: 300, schedule: { Monday: 'Full Body A', Tuesday: 'Cardio', Wednesday: 'Rest', Thursday: 'Full Body B', Friday: 'Core & Mobility', Saturday: 'Active Fun', Sunday: 'Rest' } },
        { name: 'Beginner', duration: '30 min', cal: 200, schedule: { Monday: 'Day 1', Wednesday: 'Day 2', Friday: 'Day 3', Tuesday: 'Rest', Thursday: 'Rest', Saturday: 'Rest', Sunday: 'Rest' } },
      ];
      const selectedPlan = plans[selectedWorkoutPlanId - 1] || plans[0];

      // Compile last 7 days chronologically (ending today)
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const weekdayName = d.toLocaleDateString('en-US', { weekday: 'long' });

        resultDays.push(dayLabel);

        // Calories
        const entries = dayLog[dateKey] || [];
        const totalCal = entries.reduce((s: number, e: any) => s + e.cal, 0);
        resultCalories.push(totalCal);

        // Water (ml to Liters)
        const waterMl = waterLog[dateKey] || 0;
        resultWater.push(Number((waterMl / 1000).toFixed(1)));

        // Workouts completed
        if (workoutLogLocal[dateKey]) {
          const workoutType = (selectedPlan.schedule as any)[weekdayName] || 'General Workout';
          resultWorkouts.push({
            day: weekdayName,
            type: workoutType,
            duration: selectedPlan.duration,
            cal: selectedPlan.cal
          });
        }
      }

      setData({
        days: resultDays,
        weeklyCalories: resultCalories,
        weeklyWater: resultWater,
        workoutLog: resultWorkouts
      });
    } catch (err) {
      console.error('Failed to load reports data:', err);
    }
  }, []);

  const totalCals = data.weeklyCalories.reduce((a, b) => a + b, 0);
  const totalWater = data.weeklyWater.reduce((a, b) => a + b, 0);

  const avgCal   = Math.round(totalCals / 7);
  const avgWater = (totalWater / 7).toFixed(1);
  const maxCal   = Math.max(...data.weeklyCalories, 1);
  const maxWater = Math.max(...data.weeklyWater, 1);

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-pink-400" /> Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Your weekly dynamic health summary</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Avg Calories', value: `${avgCal}`, unit: 'kcal/day', icon: Flame,    color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', up: avgCal < 2000 && avgCal > 0 },
          { label: 'Avg Water',    value: avgWater,     unit: 'L/day',    icon: Droplets, color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',   up: +avgWater >= 2 },
          { label: 'Workouts',     value: `${data.workoutLog.length}`, unit: 'this week', icon: Dumbbell, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', up: data.workoutLog.length >= 3 },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-2.5 sm:p-4 text-center sm:text-left`}>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
              {s.up ? <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />}
            </div>
            <p className={`text-base sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">{s.unit}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calorie chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" /> Calories This Week
        </h3>
        <div className="flex items-end gap-2 h-32 pt-2">
          {data.weeklyCalories.map((cal, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">{cal}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-red-400 transition-all min-h-[4px]"
                style={{ height: `${(cal / maxCal) * 90}px` }} />
              <span className="text-[10px] text-gray-500">{data.days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Water chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" /> Water Intake This Week
        </h3>
        <div className="flex items-end gap-2 h-24 pt-2">
          {data.weeklyWater.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">{w}L</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 min-h-[4px]"
                style={{ height: `${(w / maxWater) * 72}px` }} />
              <span className="text-[10px] text-gray-500">{data.days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workout log */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-violet-400" /> Workout Log
        </h3>
        {data.workoutLog.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs">
            No completed workouts logged this week. Mark completed workouts in the Workout tab!
          </div>
        ) : (
          <div className="space-y-1">
            {data.workoutLog.map((w, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-white">{w.type}</p>
                    <p className="text-xs text-gray-500">{w.day} · {w.duration}</p>
                  </div>
                </div>
                <span className="text-xs text-orange-400 font-semibold">~{w.cal} kcal burned</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
