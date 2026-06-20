import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Production: uses NEXT_PUBLIC_API_URL env var if set in Vercel dashboard
// Fallback: points directly to the confirmed live Render backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://caloriescalc.onrender.com';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBMR(gender: string, weight: number, height: number, age: number): number {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateWaterIntake(weight: number, activityLevel: string): number {
  const baseIntake = weight * 0.035;
  const activityMultiplier: Record<string, number> = {
    sedentary: 1,
    light: 1.15,
    moderate: 1.3,
    active: 1.45,
    very_active: 1.6
  };
  return Math.round((baseIntake * (activityMultiplier[activityLevel] || 1)) * 10) / 10;
}

export function calculateCalorieGoal(tdee: number, goal: string): number {
  const adjustments: Record<string, number> = {
    loss: -500,
    maintenance: 0,
    lean_bulk: 300,
    muscle_gain: 500
  };
  return tdee + (adjustments[goal] || 0);
}
