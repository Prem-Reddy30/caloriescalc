'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type OnboardingData = { completed: boolean; name: string; age: string; weight: string; height: string; gender: string; goal: string; diet: string; budget: string; };
const defaultData: OnboardingData = { completed: false, name: '', age: '', weight: '', height: '', gender: 'male', goal: 'maintenance', diet: 'vegetarian', budget: '200' };
const OnboardingContext = createContext<{ data: OnboardingData; setData: (d: OnboardingData) => void }>({ data: defaultData, setData: () => {} });

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<OnboardingData>(defaultData);
  useEffect(() => {
    try { const s = localStorage.getItem('onboarding'); if (s) setDataState(JSON.parse(s)); } catch {}
  }, []);
  const setData = (d: OnboardingData) => { setDataState(d); localStorage.setItem('onboarding', JSON.stringify(d)); };
  return <OnboardingContext.Provider value={{ data, setData }}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => useContext(OnboardingContext);
