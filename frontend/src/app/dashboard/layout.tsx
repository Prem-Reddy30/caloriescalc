'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Apple, LayoutDashboard, Flame, UtensilsCrossed, Send,
  Dumbbell, Droplets, BarChart2, Settings, LogOut,
  ChevronLeft, Menu, X, Sun, Moon, Bell, BellOff
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

import { clearAllSessionData } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard',       icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Calories',        icon: Flame,           href: '/dashboard/calories' },
  { label: 'Diet Plans',      icon: UtensilsCrossed, href: '/dashboard/diet-plans' },
  { label: 'Diet Request',    icon: Send,            href: '/dashboard/ai-diet' },
  { label: 'Workout Plans',   icon: Dumbbell,        href: '/dashboard/workout' },
  { label: 'Water Goal',      icon: Droplets,        href: '/dashboard/water' },
  { label: 'Reports',         icon: BarChart2,       href: '/dashboard/reports' },
  { label: 'Settings',        icon: Settings,        href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [waterNotif, setWaterNotif] = useState(false);
  const [toast, setToast] = useState('');
  const waterTimer = useRef<any>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; time: string; read: boolean; link?: string }>>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── Auth guard + Load preferences ──
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u || !u.name) {
        // Invalid user data — force re-login
        clearAllSessionData();
        window.location.href = '/login';
        return;
      }
      setUserName(u.name.split(' ')[0] || 'User');
    } catch {
      clearAllSessionData();
      window.location.href = '/login';
      return;
    }

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setAvatar(savedAvatar);
    const notifPref = localStorage.getItem('waterNotif') === 'true';
    setWaterNotif(notifPref);

    // Check onboarding
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      if (!ob.completed) router.push('/onboarding');
    } catch { router.push('/onboarding'); }
  }, []);

  // Click outside notifications dropdown to close
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Load notifications & check 24-hour ₹99 offer timer
  useEffect(() => {
    let savedNotifs: any[] = [];
    try {
      savedNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    } catch {}

    const now = Date.now();
    const lastOfferTime = parseInt(localStorage.getItem('last_diet_offer_time') || '0', 10);
    const hours24 = 24 * 60 * 60 * 1000;

    if (now - lastOfferTime >= hours24) {
      const newOffer = {
        id: `diet-offer-${now}`,
        title: '🔥 Special Offer: ₹99 Diet Plan!',
        body: 'Get a customized diet plan structured by AI and nutritionists. Request yours now!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        link: '/dashboard/ai-diet'
      };
      // Avoid duplicate active offers
      savedNotifs = [newOffer, ...savedNotifs.filter(n => !n.id.startsWith('diet-offer-'))];
      localStorage.setItem('notifications', JSON.stringify(savedNotifs));
      localStorage.setItem('last_diet_offer_time', String(now));
    }

    setNotifications(savedNotifs);
  }, [pathname]);

  const markNotifRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllNotifsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAllNotifs = () => {
    setNotifications([]);
    localStorage.setItem('notifications', '[]');
  };

  // ── Apply theme ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Water push notification timer ──
  useEffect(() => {
    if (waterNotif) {
      waterTimer.current = setInterval(() => {
        showToast('💧 Time to drink water! Stay hydrated.');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('NutriBudget 💧', { body: 'Time to drink water! Stay hydrated.' });
        }
      }, 2 * 60 * 60 * 1000); // every 2 hours
      localStorage.setItem('waterNotif', 'true');
    } else {
      clearInterval(waterTimer.current);
      localStorage.setItem('waterNotif', 'false');
    }
    return () => clearInterval(waterTimer.current);
  }, [waterNotif]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const toggleNotif = async () => {
    if (!waterNotif && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        showToast('Enable notifications in browser settings first.');
        return;
      }
    }
    setWaterNotif(v => !v);
    showToast(!waterNotif ? '💧 Water reminders enabled (every 2 hrs)' : '🔕 Water reminders disabled');
  };

  const handleLogout = async () => {
    // Clear all session data
    clearAllSessionData();
    localStorage.removeItem('waterNotif');
    // Sign out Firebase to prevent stale Google sessions
    try { await signOut(auth); } catch {}
    window.location.href = '/login';
  };

  const NavLinks = ({ onClose }: { onClose?: () => void }) => {
    return (
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group border border-transparent
                ${active 
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/25' 
                  : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/5 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10'}
                ${collapsed ? 'justify-center' : ''}`}>
              <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600 dark:text-gray-500 dark:group-hover:text-emerald-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>
    );
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-[#0f0f13] text-white'}`}>

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-col shrink-0 border-r transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[220px]'} ${isLight ? 'bg-white border-gray-200' : 'bg-[#13131a] border-white/10'}`}>
        <div className={`flex items-center gap-2.5 px-4 py-4 border-b ${collapsed ? 'justify-center' : ''} ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0">
            <Apple className="h-3.5 w-3.5 text-white" />
          </div>
          {!collapsed && <span className={`font-bold text-base tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>NutriBudget</span>}
        </div>
        <NavLinks />
        <div className={`px-2 py-3 border-t space-y-0.5 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2">
              {avatar
                ? <img src={avatar} className="w-6 h-6 rounded-full object-cover shrink-0" alt="avatar" />
                : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold text-white shrink-0">{userName[0]?.toUpperCase()}</div>
              }
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{userName}</p>
                <p className="text-[10px] text-gray-500">Member</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className={`w-[220px] border-r flex flex-col ${isLight ? 'bg-white border-gray-200' : 'bg-[#13131a] border-white/10'}`}>
            <div className={`flex items-center justify-between px-4 py-4 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center"><Apple className="h-3.5 w-3.5 text-white" /></div>
                <span className={`font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>NutriBudget</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <NavLinks onClose={() => setMobileOpen(false)} />
            <div className={`px-2 py-3 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="h-[18px] w-[18px]" /><span>Logout</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`border-b flex items-center px-4 gap-3 shrink-0 ${isLight ? 'bg-white border-gray-200' : 'bg-[#13131a] border-white/10'}`} style={{ height: '52px' }}>
          <button className="md:hidden p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <button className="hidden md:flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all" onClick={() => setCollapsed(c => !c)}>
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>

          <span className={`flex-1 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {navItems.find(n => n.href === pathname)?.label || 'Dashboard'}
          </span>

          {/* Water notif toggle */}
          <button onClick={toggleNotif} title={waterNotif ? 'Disable water reminders' : 'Enable water reminders'}
            className={`p-2 rounded-lg transition-all ${waterNotif ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'}`}>
            <Droplets className={`h-4 w-4 ${waterNotif ? 'text-cyan-500 animate-water-pulse' : 'text-gray-405'}`} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative flex items-center" ref={notifRef}>
            <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} title="Notifications"
              className={`p-2 rounded-lg transition-all relative ${notifDropdownOpen ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'}`}>
              <Bell className="h-4 w-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-scale-in">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Notifications</span>
                  {notifications.some(n => !n.read) && (
                    <button onClick={markAllNotifsRead} className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-450 hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => {
                        markNotifRead(n.id);
                        setNotifDropdownOpen(false);
                        if (n.link) router.push(n.link);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${n.read ? 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10'}`}>
                        <div className="flex items-start justify-between gap-1.5">
                          <p className={`text-xs font-bold ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-emerald-600 dark:text-emerald-450'}`}>{n.title}</p>
                          <span className="text-[9px] text-gray-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-white/5 pt-2 flex justify-end">
                    <button onClick={clearAllNotifs} className="text-[10px] text-gray-500 hover:text-red-500 transition-colors">
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-all ${isLight ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100/50' : 'text-yellow-400 hover:bg-white/10'}`}>
            {isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Avatar */}
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            {avatar
              ? <img src={avatar} className="w-5 h-5 rounded-full object-cover" alt="avatar" />
              : <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-[10px] font-bold text-white">{userName[0]?.toUpperCase()}</div>
            }
            <span className={`text-xs hidden sm:block ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{userName}</span>
          </div>
        </header>

        {/* Page */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${isLight ? 'bg-gray-50' : ''}`}>
          {children}
        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 border border-white/20 rounded-xl text-sm text-white shadow-2xl flex items-center gap-2 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
