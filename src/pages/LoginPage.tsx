import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopHeader } from '../components/TopHeader';
import { signInWithProvider } from '../lib/firebase';

const providers = [
  {
    id: 'google' as const, nameAr: 'جوجل',
    icon: (<svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
    bgClass: 'bg-white hover:bg-gray-50', textClass: 'text-gray-800', borderClass: 'border border-gray-200',
  },
  {
    id: 'apple' as const, nameAr: 'آبل',
    icon: (<svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>),
    bgClass: 'bg-[#1C1C1E] hover:bg-[#2C2C2E]', textClass: 'text-white', borderClass: 'border border-[rgba(255,255,255,0.1)]',
  },
  {
    id: 'facebook' as const, nameAr: 'فيسبوك',
    icon: (<svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#ffffff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
    bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]', textClass: 'text-white', borderClass: '',
  },
  {
    id: 'microsoft' as const, nameAr: 'مايكروسوفت',
    icon: (<svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>),
    bgClass: 'bg-[#2F2F2F] hover:bg-[#3B3B3B]', textClass: 'text-white', borderClass: 'border border-[rgba(255,255,255,0.08)]',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (providerId: 'google' | 'facebook' | 'apple' | 'microsoft') => {
    setError(null);
    setLoadingProvider(providerId);
    try {
      const fbUser = await signInWithProvider(providerId);
      login({
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'مستخدم',
        photoURL: fbUser.photoURL || undefined,
        plan: 'free',
        createdAt: new Date(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('تم إغلاق نافذة تسجيل الدخول.');
      } else if (code === 'auth/popup-blocked') {
        setError('تم حجب النافذة المنبثقة. السماح بالنوافذ المنبثقة في المتصفح.');
      } else if (code === 'auth/network-request-failed') {
        setError('خطأ في الاتصال بالإنترنت.');
      } else {
        setError('حدث خطأ. حاول مرة أخرى.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <TopHeader showBack backPath="/landing" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(201,168,106,0.04)_0%,transparent_65%)]" />
      </div>
      <div className="max-w-md mx-auto px-4 pt-12 pb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A86A] to-[#8B6914] flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(201,168,106,0.2)]">
            <span className="text-black text-2xl font-bold" style={{ fontFamily: 'Inter' }}>F</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">سجّل دخولك</h1>
          <p className="text-[#8A8A8A] text-sm">وابدأ في هندسة خطوطك</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {providers.map((provider, index) => {
            const isLoading = loadingProvider === provider.id;
            const isDisabled = loadingProvider !== null;
            return (
              <motion.button key={provider.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={!isDisabled ? { scale: 1.01 } : {}}
                whileTap={!isDisabled ? { scale: 0.99 } : {}}
                onClick={() => !isDisabled && handleLogin(provider.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${provider.bgClass} ${provider.textClass} ${provider.borderClass} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> : provider.icon}
                <span>{isLoading ? 'جاري تسجيل الدخول...' : `المتابعة عبر ${provider.nameAr}`}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-8 text-center text-[#555] text-xs">
          بتسجيل الدخول توافق على{' '}
          <button onClick={() => navigate('/terms')} className="text-[#C9A86A] hover:underline">شروط الاستخدام</button>
          {' '}و{' '}
          <button onClick={() => navigate('/privacy')} className="text-[#C9A86A] hover:underline">سياسة الخصوصية</button>
        </motion.p>
      </div>
    </div>
  );
};
