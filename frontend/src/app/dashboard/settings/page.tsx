'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings, User, Bell, Shield, Save, CheckCircle, Upload, Mail, FileDown, Sun, Moon, Camera, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '', whatsapp: '', age: '', weight: '', height: '', gender: 'male', calorieGoal: '' });
  const [notifs, setNotifs]   = useState({ water: true, meals: true, workout: false, reports: true });
  const [theme, setTheme]     = useState<'dark'|'light'>('dark');
  const [avatar, setAvatar]   = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [testEmailUrl, setTestEmailUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      setProfile(p => ({
        ...p,
        name: ob.name || u.name || '',
        email: u.email || '',
        whatsapp: localStorage.getItem('whatsapp_number') || '8885462451',
        age: ob.age || '',
        weight: ob.weight || '',
        height: ob.height || '',
        gender: ob.gender || 'male',
        calorieGoal: ob.calorieGoal || u.profile?.calorieGoal || '2000',
      }));
    } catch {}
    const t = localStorage.getItem('theme') as 'dark'|'light';
    if (t) setTheme(t);
    const av = localStorage.getItem('avatar');
    if (av) setAvatar(av);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      localStorage.setItem('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    localStorage.setItem('onboarding', JSON.stringify({ ...profile, goal: 'maintenance', diet: 'vegetarian', budget: '200', completed: true }));
    localStorage.setItem('whatsapp_number', profile.whatsapp);

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
              age: profile.age ? +profile.age : undefined,
              weight: profile.weight ? +profile.weight : undefined,
              height: profile.height ? +profile.height : undefined,
              gender: profile.gender,
              calorieGoal: profile.calorieGoal ? +profile.calorieGoal : undefined,
            }
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync profile to database:', err);
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sendEmailSummary = async () => {
    if (!profile.email) { alert('Please enter your email first.'); return; }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first.');
        return;
      }

      const dayLog = JSON.parse(localStorage.getItem('dayLog') || '{}');
      const today = new Date();
      const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const entries = dayLog[key] || [];
      const totalCal = entries.reduce((s: number, e: any) => s + e.cal, 0);

      const waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
      const waterIntake = waterLog[key] || 0;

      // Determine workout status
      const workoutLog = JSON.parse(localStorage.getItem('workoutLog') || '{}');
      const workoutCompleted = !!workoutLog[key];

      const payload = {
        to: profile.email,
        date: today.toDateString(),
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        calories: {
          consumed: totalCal,
          target: undefined
        },
        water: {
          consumed: waterIntake,
          target: undefined
        },
        foods: entries.map((e: any) => ({
          name: e.name,
          cal: e.cal,
          protein: e.protein || 0,
          carbs: e.carbs || 0,
          fat: e.fat || 0,
          emoji: e.emoji || '🍽️'
        })),
        workoutCompleted
      };

      const res = await fetch(`${API_BASE_URL}/api/email/send-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to send daily summary email.');
        return;
      }

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);

      if (data.testMode && data.previewUrl) {
        setTestEmailUrl(data.previewUrl);
        alert(`Summary email sent (Test Mode)!\n\nPreview link is now visible below.`);
      } else {
        setTestEmailUrl(null);
        alert(`Summary email successfully sent to ${profile.email}!`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error sending email. Make sure the backend server is running.');
    }
  };

  const exportPDF = async () => {
    setPdfLoading(true);
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const dayLog = JSON.parse(localStorage.getItem('dayLog') || '{}');
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const entries = dayLog[key] || [];
    const totalCal = entries.reduce((s: number, e: any) => s + e.cal, 0);

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('NutriBudget AI — Diet Report', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${profile.name || 'User'}`, 20, 38);
    doc.text(`Date: ${today.toDateString()}`, 20, 48);
    doc.text(`Total Calories: ${totalCal} kcal`, 20, 58);
    doc.text(`Weight: ${profile.weight || '-'} kg  |  Height: ${profile.height || '-'} cm`, 20, 68);

    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text("Today's Food Log", 20, 84);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    if (entries.length === 0) {
      doc.text('No food logged today.', 20, 96);
    } else {
      entries.forEach((e: any, i: number) => {
        doc.text(`${i + 1}. ${e.name} — ${e.cal} kcal | P:${e.protein}g C:${e.carbs}g F:${e.fat}g`, 20, 96 + i * 10);
      });
    }

    doc.save(`nutribudget-report-${today.toISOString().split('T')[0]}.pdf`);
    setPdfLoading(false);
  };

  const Field = ({ label, value, onChange, type = 'text', placeholder }: any) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-2.5">
      <div><p className="text-sm text-gray-950 dark:text-white">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
      <button onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  );

  const Section = ({ icon: Icon, title, color, children }: any) => (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-white/10">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}><Icon className="h-4 w-4 text-white" /></div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" /> Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, preferences and exports</p>
      </div>

      {/* Profile + Avatar */}
      <Section icon={User} title="Profile" color="bg-emerald-500/20">
        {/* Avatar upload */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-white/10">
          <div className="relative">
            {avatar
              ? <img src={avatar} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40" alt="avatar" />
              : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-2xl font-bold text-white">{profile.name?.[0]?.toUpperCase() || 'U'}</div>
            }
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-400 transition-colors">
              <Camera className="h-3 w-3 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.name || 'Your Name'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Click camera icon to upload photo</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1.5 flex items-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 hover:underline">
              <Upload className="h-3 w-3" /> Upload Photo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name"   value={profile.name}   onChange={(e: any) => setProfile({ ...profile, name: e.target.value })}   placeholder="John Doe" />
          <Field label="Email"       value={profile.email}  onChange={(e: any) => setProfile({ ...profile, email: e.target.value })}  type="email" placeholder="you@example.com" />
          <Field label="Age"         value={profile.age}    onChange={(e: any) => setProfile({ ...profile, age: e.target.value })}    type="number" placeholder="25" />
          <Field label="Weight (kg)" value={profile.weight} onChange={(e: any) => setProfile({ ...profile, weight: e.target.value })} type="number" placeholder="70" />
          <Field label="Height (cm)" value={profile.height} onChange={(e: any) => setProfile({ ...profile, height: e.target.value })} type="number" placeholder="175" />
          <Field label="Daily Calorie Target (kcal)" value={profile.calorieGoal} onChange={(e: any) => setProfile({ ...profile, calorieGoal: e.target.value })} type="number" placeholder="2000" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-505 dark:text-gray-400 uppercase tracking-wide">Gender</label>
            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all">
              <option value="male" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Male</option>
              <option value="female" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Female</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Theme */}
      <Section icon={Sun} title="Appearance" color="bg-yellow-500/20">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Toggle between dark and light mode.</p>
        <div className="flex gap-3">
          {(['dark', 'light'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${theme === t ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10'}`}>
              {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {t === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" color="bg-yellow-500/20">
        <div className="divide-y divide-gray-150 dark:divide-white/5">
          <Toggle label="Water Reminders" desc="Reminder every 2 hours to drink water" checked={notifs.water} onChange={(v: boolean) => setNotifs({ ...notifs, water: v })} />
          <Toggle label="Meal Reminders"  desc="Breakfast, lunch and dinner reminders" checked={notifs.meals} onChange={(v: boolean) => setNotifs({ ...notifs, meals: v })} />
          <Toggle label="Workout Alerts"  desc="Daily workout schedule reminders" checked={notifs.workout} onChange={(v: boolean) => setNotifs({ ...notifs, workout: v })} />
          <Toggle label="Weekly Reports"  desc="Summary every Sunday" checked={notifs.reports} onChange={(v: boolean) => setNotifs({ ...notifs, reports: v })} />
        </div>
      </Section>

      {/* Email Summary */}
      <Section icon={Mail} title="Email Daily Summary" color="bg-blue-500/20">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Send today's food log and calorie summary to your email.</p>
        <div className="flex gap-3">
          <input type="email" placeholder="your@email.com" value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
          <button onClick={sendEmailSummary}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${emailSent ? 'bg-emerald-500/20 text-emerald-650 dark:text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-550 dark:text-blue-400'}`}>
            {emailSent ? <><CheckCircle className="h-4 w-4" /> Sent!</> : <><Mail className="h-4 w-4" /> Send</>}
          </button>
        </div>
        {testEmailUrl && (
          <div className="mt-3 p-3 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col gap-1">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
              <span>📧</span> Test Email Summary Generated!
            </p>
            <p className="text-[10px] text-gray-550 dark:text-gray-400 leading-normal">
              Gmail SMTP is set to default. The message was sent to a virtual mailbox. Click below to inspect:
            </p>
            <a 
              href={testEmailUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline font-bold mt-1 inline-block"
            >
              🔗 Open Ethereal Test Email Preview Page
            </a>
          </div>
        )}
      </Section>

      {/* WhatsApp Integration */}
      <Section icon={MessageSquare} title="WhatsApp Integration" color="bg-emerald-500/20">
        <p className="text-xs text-gray-505 dark:text-gray-400 mb-3">Set the destination WhatsApp number (include country code, e.g., +919999999999) where diet requests should be sent.</p>
        <div className="flex gap-3">
          <input type="text" placeholder="e.g. +919999999999" value={profile.whatsapp}
            onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" />
        </div>
      </Section>

      {/* PDF Export */}
      <Section icon={FileDown} title="Export PDF Report" color="bg-pink-500/20">
        <p className="text-xs text-gray-505 dark:text-gray-400 mb-3">Download today's diet log as a PDF report.</p>
        <button onClick={exportPDF} disabled={pdfLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-500/10 dark:bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
          {pdfLoading
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating...</>
            : <><FileDown className="h-4 w-4" /> Download PDF Report</>}
        </button>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security" color="bg-red-500/20">
        <p className="text-xs text-gray-505 dark:text-gray-400 mb-3">Change your password.</p>
        <div className="space-y-3">
          <Field label="Current Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
          <Field label="New Password"     value="" onChange={() => {}} type="password" placeholder="••••••••" />
          <Field label="Confirm Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </div>
        <button className="mt-3 px-4 py-2 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl transition-all">Update Password</button>
      </Section>

      <button onClick={save}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm">
        {saved ? <><CheckCircle className="h-5 w-5" /> Saved!</> : <><Save className="h-5 w-5" /> Save Changes</>}
      </button>
    </div>
  );
}
