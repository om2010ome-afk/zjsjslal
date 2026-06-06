import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  backPath?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, showBack = false, backPath }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => backPath ? navigate(backPath) : navigate(-1)}
              className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#8A8A8A] hover:text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {title ? (
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          ) : (
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A86A] to-[#8B6914] flex items-center justify-center">
                <span className="text-black font-bold text-sm" style={{ fontFamily: 'Inter' }}>F</span>
              </div>
              <span className="text-white font-semibold text-sm hidden sm:block">مهندس الخطوط</span>
            </button>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#222] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#888]" />
                </div>
              )}
              <span className="text-sm text-[#D8D8D8] hidden sm:block">{user.displayName}</span>
            </button>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#666] hover:text-[#F87171]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full text-sm text-[#D8D8D8] hover:text-white bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] transition-all"
          >
            تسجيل دخول
          </button>
        )}
      </div>
    </motion.header>
  );
};
