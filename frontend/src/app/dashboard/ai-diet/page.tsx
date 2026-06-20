'use client';

import { useState, useEffect } from 'react';
import { 
  Send, CheckCircle, AlertCircle, MessageSquare, User, Scale, 
  ArrowUpCircle, Award, Utensils, Heart, Wallet, ShieldCheck, 
  CheckCircle2, Copy, Smartphone 
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

export default function AIDietPage() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    goal: 'maintenance',
    diet: 'vegetarian',
    budget: '',
    allergies: '',
    notes: ''
  });

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bodyImages, setBodyImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check total limit (max 3 images)
    if (bodyImages.length + files.length > 3) {
      alert("You can upload a maximum of 3 body condition photos.");
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBodyImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setBodyImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Custom QR / UPI Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Constants
  const merchantUpi = 'premchandarreddy3010-1@okaxis';
  const merchantName = 'PAPASANI PREM CHANDAR REDDY';

  useEffect(() => {
    // ── Load onboarding & user stats ──
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}');
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setForm(f => ({
        ...f,
        name: ob.name || u.name || '',
        age: ob.age || '',
        weight: ob.weight || '',
        height: ob.height || '',
        gender: ob.gender || 'male',
        goal: ob.goal || 'maintenance',
        diet: ob.diet || 'vegetarian',
        budget: ob.budget || ''
      }));
    } catch {}

    // Load WhatsApp number from settings
    const savedWa = localStorage.getItem('whatsapp_number') || '8885462451';
    setWhatsappNumber(savedWa);
  }, []);

  const handleOpenPayment = () => {
    if (!form.name || !form.age || !form.weight || !form.height || !form.budget) {
      setError('Please fill in all core stats (Name, Age, Weight, Height, and Budget).');
      return;
    }
    if (!whatsappNumber) {
      setError('Please configure a WhatsApp Number in Settings first.');
      return;
    }
    setError('');
    setShowPaymentModal(true);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!txnId) {
      alert('Please enter your 12-digit UTR / Transaction ID.');
      return;
    }
    if (!/^\d{12}$/.test(txnId.trim())) {
      alert('Invalid UTR. The UTR number must be exactly 12 digits (numeric).');
      return;
    }

    setPaymentProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token not found.');

      const res = await fetch(`${API_BASE_URL}/api/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          utr: txnId.trim(),
          amount: 99.00,
          requestDetails: form
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment submission failed.');
      }

      setPaymentSuccess(true);

      // Trigger redirect after showing success
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentModal(false);
        triggerWhatsAppSend();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit payment UTR code.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const triggerWhatsAppSend = () => {
    setLoading(true);

    // Save current WhatsApp number
    localStorage.setItem('whatsapp_number', whatsappNumber);

    // Format Goal text
    const goalText = 
      form.goal === 'loss' ? 'Weight Loss' : 
      form.goal === 'muscle_gain' ? 'Muscle Gain' : 
      form.goal === 'lean_bulk' ? 'Lean Bulk' : 'Maintenance';

    // Format Diet text
    const dietText = 
      form.diet === 'vegetarian' ? 'Vegetarian 🥦' : 
      form.diet === 'non-vegetarian' ? 'Non-Vegetarian 🍗' : 'Vegan 🌱';

    // Generate random invoice ID
    const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    // Format Body Photos text
    const bodyPhotosText = bodyImages.length > 0 
      ? `Yes (${bodyImages.length} photos ready - sending on chat)`
      : 'No';

    // ── Format Message ──
    const message = 
`*DIET & NUTRITION REQUIREMENT REQUEST* 📋🥗
-----------------------------------------
💳 *Payment Status:* PAID (₹99 One-Time Plan)
🧾 *Invoice ID:* ${invoiceId}
💳 *Method:* UPI QR Code / Deep Link
🧾 *UTR / Transaction ID:* ${txnId.trim()}
-----------------------------------------
👤 *Name:* ${form.name}
🚻 *Gender:* ${form.gender.toUpperCase()}
🎂 *Age:* ${form.age} years
⚖️ *Weight:* ${form.weight} kg
📏 *Height:* ${form.height} cm
💪 *Fitness Goal:* ${goalText}
🥬 *Diet Preference:* ${dietText}
📸 *Body Photos:* ${bodyPhotosText}
💰 *Monthly Budget:* ₹${form.budget}
⚠️ *Allergies / Avoid:* ${form.allergies || 'None'}

📝 *Additional Requirements & Notes:*
"${form.notes || 'No extra notes specified.'}"
-----------------------------------------
_Sent via NutriBudget App_`;

    try {
      let cleanNum = whatsappNumber.replace(/[+\s()-]/g, '');
      if (cleanNum.length === 10) {
        cleanNum = '91' + cleanNum;
      }
      const encodedText = encodeURIComponent(message);
      const waUrl = `https://wa.me/${cleanNum}?text=${encodedText}`;
      
      window.open(waUrl, '_blank');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      setError(`Failed to open WhatsApp: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // UPI deep link for mobile apps
  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=99&cu=INR&tn=DietPlanRequest`;

  const handleUpiRedirect = () => {
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      alert("UPI payment links can only be opened on mobile devices (smartphones). Please scan the QR code on the left using GPay, PhonePe, or Paytm on your phone!");
      return;
    }
    // Redirect to UPI app
    window.location.href = upiDeepLink;
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      
      {/* Premium Upsell Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/5 dark:via-[#13131a] border border-amber-500/20 p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
            ★ PREMIUM PLAN
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Personalized Diet Request</h2>
          <p className="text-gray-650 dark:text-gray-400 text-xs max-w-md">
            Get a professionally structured diet plan mapped to your exact stats, goals, monthly budget constraints, and preferences. Delivered within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> WhatsApp Support</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Utensils className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> Indian Home Recipes</span>
          </div>
        </div>
        <div className="flex flex-col items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 min-w-[130px] shrink-0 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">One-Time Fee</span>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">₹99</span>
          <span className="text-[10px] text-gray-505 dark:text-gray-400 mt-0.5">Scan to Pay</span>
        </div>
      </div>

      {/* Main Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-emerald-500 dark:text-emerald-400" /> Diet Requirements Form
        </h1>
        <p className="text-gray-500 text-sm mt-1">Fill out the stats below to unlock your payment checkout</p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-5">
        
        {/* Row 1: Name & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-500" /> Full Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Rahul Sharma" 
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-500" /> Gender
            </label>
            <select 
              value={form.gender} 
              onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="male" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Male</option>
              <option value="female" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Female</option>
            </select>
          </div>
        </div>

        {/* Row 2: Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-500" /> Age
            </label>
            <input 
              type="number" 
              placeholder="25" 
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-505 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-gray-500" /> Weight (kg)
            </label>
            <input 
              type="number" 
              placeholder="70" 
              value={form.weight}
              onChange={e => setForm({ ...form, weight: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-505 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <ArrowUpCircle className="h-3.5 w-3.5 text-gray-500" /> Height (cm)
            </label>
            <input 
              type="number" 
              placeholder="175" 
              value={form.height}
              onChange={e => setForm({ ...form, height: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-455 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
        </div>

        {/* Row 3: Goal & Diet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-gray-500" /> Fitness Goal
            </label>
            <select 
              value={form.goal} 
              onChange={e => setForm({ ...form, goal: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="maintenance" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Maintenance</option>
              <option value="loss" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Weight Loss</option>
              <option value="lean_bulk" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Lean Bulk</option>
              <option value="muscle_gain" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Muscle Gain</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-550 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-gray-500" /> Diet Type
            </label>
            <select 
              value={form.diet} 
              onChange={e => setForm({ ...form, diet: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="vegetarian" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Vegetarian</option>
              <option value="non-vegetarian" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Non-Vegetarian</option>
              <option value="vegan" className="bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white">Vegan</option>
            </select>
          </div>
        </div>

        {/* Row 4: Budget & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-555 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-gray-500" /> Monthly Food Budget (₹)
            </label>
            <input 
              type="number" 
              placeholder="5000" 
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-555 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-gray-500" /> Allergies / Avoid (optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. peanuts, dairy, gluten" 
              value={form.allergies}
              onChange={e => setForm({ ...form, allergies: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-455 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all" 
            />
          </div>
        </div>

        {/* Text Area: Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-555 dark:text-gray-400 uppercase tracking-wide">
            Additional Requirements / Message
          </label>
          <textarea 
            rows={4}
            placeholder="Tell us about your preferences, foods you love, schedule, workout experience, or any specific requests..." 
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-455 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all resize-none" 
          />
        </div>

        {/* Optional: Body Condition Photos */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-555 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            📸 Body Condition Photos (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload Area */}
            <div 
              onClick={() => document.getElementById('body-photo-input')?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl p-4 cursor-pointer transition-all group"
            >
              <ArrowUpCircle className="h-6 w-6 text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 mb-1.5 transition-colors" />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Upload Body Photos</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Front, Side, Back (Max 3 files)</p>
              <input 
                id="body-photo-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden" 
              />
            </div>
            
            {/* Image Previews */}
            <div className="flex flex-wrap gap-2.5 items-center justify-start min-h-[80px]">
              {bodyImages.length === 0 ? (
                <div className="w-full flex items-center justify-center border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] rounded-xl py-6 text-[11px] text-gray-500 dark:text-gray-600">
                  No photos uploaded yet
                </div>
              ) : (
                bodyImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/15 group/img">
                    <img src={img} alt={`Body Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-red-400 text-xs font-bold transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> WhatsApp redirect initiated!
          </div>
        )}

        {/* Pay & Submit Button */}
        <button 
          onClick={handleOpenPayment} 
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 text-sm"
        >
          <Send className="h-4 w-4" /> Pay ₹99 & Send Requirements
        </button>

      </div>

      {/* ── UPI QR Payment Checkout Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => !paymentProcessing && setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure UPI Payment</h3>
              <p className="text-xs text-gray-500">Scan QR Code or tap to pay directly via UPI</p>
            </div>

            {/* Price Info */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Personalized Diet Plan</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹99.00</span>
            </div>

            {/* Split layout: QR Code (Left) & Account Details (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Left Column: QR Code */}
              <div className="space-y-3 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 pb-6 md:pb-0 md:pr-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase">UPI Payment QR</p>
                <div className="bg-white p-3 rounded-2xl max-w-[180px] mx-auto shadow-md border border-gray-100">
                  <img 
                    src="/payment-qr.jpg" 
                    alt="UPI Payment QR Code" 
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-gray-550 dark:text-gray-500 leading-relaxed max-w-[180px] mx-auto">
                  Scan the QR code using any UPI app like GPay, PhonePe, Paytm, or BHIM.
                </p>
              </div>

              {/* Right Column: Tap to Pay & UPI ID details */}
              <div className="space-y-4 text-center md:text-left flex flex-col justify-center">
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Merchant Name</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{merchantName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-555 dark:text-gray-400 font-medium">UPI ID</p>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs">
                    <span className="font-mono text-gray-700 dark:text-gray-300 select-all">{merchantUpi}</span>
                    <button 
                      onClick={handleCopyUpi}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 font-semibold transition-all shrink-0 ml-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedUpi ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Direct Pay Link (Redirects on click) */}
                <div className="space-y-1 pt-1">
                  <button 
                    onClick={handleUpiRedirect}
                    className="inline-flex w-full items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Smartphone className="h-4.5 w-4.5" /> Pay ₹99
                  </button>
                  <p className="text-[10px] text-gray-505 dark:text-gray-500 text-center md:text-left leading-normal mt-1">
                    Click <strong>Pay ₹99</strong> to open your default UPI app and pay.
                  </p>
                </div>

              </div>

            </div>

            {/* UTR verification input field */}
            <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-white/10">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5 justify-center">
                🔢 Enter 12-Digit UTR / Transaction ID *
              </label>
              <input 
                type="text" 
                maxLength={12}
                placeholder="e.g. 314589762145" 
                value={txnId}
                onChange={e => setTxnId(e.target.value.replace(/\D/g, ''))}
                disabled={paymentProcessing || paymentSuccess}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-xl text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-650 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-transparent transition-all font-mono tracking-widest text-center" 
              />
              <p className="text-[10px] text-gray-500 leading-normal text-center">
                Enter the 12-digit UTR/Ref number from your payment app screen to verify your payment.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={handleConfirmPayment}
                disabled={paymentProcessing || paymentSuccess}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                {paymentProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Confirming Transaction...
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Payment Confirmed! Opening WhatsApp...
                  </>
                ) : (
                  <>Confirm & Submit Request</>
                )}
              </button>
              
              <p className="text-[10px] text-gray-500 text-center">
                🔒 Safe & secure peer-to-peer transaction.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
