import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'http://localhost:5000' && !envUrl.includes('localhost')) {
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname) {
      const isLocalIp = 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

      if (isLocalIp) {
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          return `${window.location.protocol}//${hostname}:5000`;
        }
      } else {
        // Fallback to active Render backend when deployed on Vercel
        return 'https://caloriescalc-backend.onrender.com';
      }
    }
  }
  
  return envUrl || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

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
