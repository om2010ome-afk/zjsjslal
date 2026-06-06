import React from 'react';
import { motion } from 'framer-motion';
import { Home, Upload, FlaskConical, User, Snowflake, FolderOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const DesktopSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentFont } = useStore();

  if (!isAuthenticated) return null;

  const mainItems = [
    { icon: <Home className="w-5 h-5" />, label: 'الرئيسية', path: '/dashboard' },
    { icon: <Upload className="w-5 h-5" />, label: 'رفع خط', path: '/upload' },
  ];

  const fontItems = currentFont ? [
    { icon: <FolderOpen className="w-5 h-5" />, label: 'تحليل الخط', path: '/analysis' },
    { icon: <FlaskConical className="w-5 h-5" />, label: 'المختبر', path: '/lab' },
    { icon: <Snowflake className="w-5 h-5" />, label: 'تجميد', path: '/freeze' },
  ] : [];

  const bottomItems = [
    { icon: <User className="w-5 h-5" />, label: 'حسابي', path: '/account' },
  ];

  const renderItem = (item: { icon: React.ReactNode; label: string; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
          isActive
            ? 'bg-[rgba(201,168,106,0.1)] text-[#C9A86A]'
            : 'text-[#8A8A8A] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden md:flex fixed right-0 top-0 bottom-0 w-56 flex-col z-30 bg-[rgba(8,8,8,0.95)] border-l border-[rgba(255,255,255,0.06)] pt-6"
    >
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A86A] to-[#8B6914] flex items-center justify-center">
            <span className="text-black font-bold text-sm" style={{ fontFamily: 'Inter' }}>F</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">مهندس الخطوط</p>
            <p className="text-[#666] text-[10px]">FontEngineer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[#555] text-[10px] font-medium px-4 mb-2">القائمة الرئيسية</p>
        {mainItems.map(renderItem)}

        {fontItems.length > 0 && (
          <>
            <div className="py-2"><div className="border-t border-[rgba(255,255,255,0.04)]" /></div>
            <p className="text-[#555] text-[10px] font-medium px-4 mb-1">الخط الحالي</p>
            <p className="text-[#C9A86A] text-xs px-4 mb-2 truncate">{currentFont?.fontFamily}</p>
            {fontItems.map(renderItem)}
          </>
        )}
      </div>

      <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.06)] space-y-1">
        {bottomItems.map(renderItem)}
      </div>
    </motion.aside>
  );
};
