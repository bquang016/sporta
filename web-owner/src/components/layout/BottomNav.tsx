import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  QrCode, 
  Building2, 
  User 
} from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;

  let activeIndex = 0;
  if (pathname === '/') {
    activeIndex = 0;
  } else if (pathname.startsWith('/matrix')) {
    activeIndex = 1;
  } else if (pathname.startsWith('/scan')) {
    activeIndex = 2;
  } else if (pathname.startsWith('/operations') || pathname.startsWith('/pricing')) {
    activeIndex = 3;
  } else if (pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/wallet') || pathname.startsWith('/vouchers')) {
    activeIndex = 4;
  }

  return (
    <>
      <style>{`
        /* Liquid Glass Custom Utilities */
        .liquid-glass-dock {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.85) 0%,
            rgba(248, 250, 252, 0.78) 100%
          );
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          box-shadow: 
            0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
            0 -1px 0 0 rgba(226, 232, 240, 0.5),
            0 -12px 36px -4px rgba(6, 78, 59, 0.08),
            0 -4px 12px -2px rgba(0, 0, 0, 0.03);
        }

        .liquid-center-btn {
          background: linear-gradient(135deg, #FDE047 0%, #FACC15 50%, #EAB308 100%);
          box-shadow: 
            0 2px 4px 0 rgba(255, 255, 255, 0.6) inset,
            0 -2px 4px 0 rgba(0, 0, 0, 0.1) inset,
            0 8px 20px -4px rgba(234, 179, 8, 0.5),
            0 4px 10px -2px rgba(6, 78, 59, 0.2);
        }

        .liquid-pill-active {
          background: radial-gradient(circle at 50% 0%, rgba(6, 78, 59, 0.12) 0%, rgba(6, 78, 59, 0.06) 100%);
          box-shadow: 
            0 1px 2px 0 rgba(255, 255, 255, 0.8) inset,
            0 2px 6px -1px rgba(6, 78, 59, 0.06);
        }
      `}</style>

      {/* Floating Liquid Glass Dock */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2 select-none pointer-events-none"
      >
        <div className="relative max-w-md mx-auto liquid-glass-dock rounded-[2rem] border border-white/60 p-1.5 transition-all pointer-events-auto">
          <div className="relative flex justify-around items-center h-14">
            {/* Sliding Liquid Background Capsule for Regular Tabs */}
            {activeIndex !== 2 && (
              <div 
                className="absolute top-1 bottom-1 rounded-2xl liquid-pill-active border border-emerald-900/5 transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
                style={{
                  left: `calc(${(activeIndex * 20) + 1}%)`,
                  width: '18%',
                }}
              />
            )}

            {/* Sliding Liquid Glow Dot underneath */}
            {activeIndex !== 2 && (
              <div 
                className="absolute -bottom-0.5 h-1 w-2 bg-[#064e3b] rounded-full transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none shadow-[0_0_6px_#064e3b]"
                style={{
                  left: `calc(${(activeIndex * 20) + 10}% - 4px)`,
                }}
              />
            )}

            {/* Tab 0: Home */}
            <NavItem 
              to="/" 
              icon={<Home className="w-5 h-5" />} 
              label="Trang chủ" 
              isActive={activeIndex === 0} 
            />

            {/* Tab 1: Matrix / Calendar */}
            <NavItem 
              to="/matrix" 
              icon={<Calendar className="w-5 h-5" />} 
              label="Lịch sân" 
              isActive={activeIndex === 1} 
            />

            {/* Tab 2: Center QR Scan Floating Action Button */}
            <Link 
              to="/scan" 
              className="flex flex-col items-center justify-center -mt-7 w-1/5 relative z-20 cursor-pointer group"
              aria-label="Quét mã QR"
            >
              <div 
                className={`liquid-center-btn rounded-full w-13 h-13 flex items-center justify-center text-[#064e3b] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden ${
                  activeIndex === 2 
                    ? 'scale-110 ring-4 ring-emerald-500/20 shadow-lg' 
                    : 'group-hover:scale-105 group-active:scale-95'
                }`}
              >
                {/* Specular glass reflection overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-black/5 pointer-events-none" />
                <QrCode className={`w-6 h-6 stroke-[2.5] transition-transform duration-300 ${activeIndex === 2 ? 'rotate-90 scale-105' : ''}`} />
              </div>
              <span className={`text-[10px] mt-1 font-black tracking-tight transition-colors duration-200 ${
                activeIndex === 2 ? 'text-[#064e3b]' : 'text-slate-500'
              }`}>
                Quét QR
              </span>
            </Link>

            {/* Tab 3: Operations */}
            <NavItem 
              to="/operations" 
              icon={<Building2 className="w-5 h-5" />} 
              label="Vận hành" 
              isActive={activeIndex === 3} 
            />

            {/* Tab 4: Profile */}
            <NavItem 
              to="/profile" 
              icon={<User className="w-5 h-5" />} 
              label="Hồ sơ" 
              isActive={activeIndex === 4} 
            />
          </div>
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ 
  to, 
  icon, 
  label, 
  isActive 
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
}) => {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center w-1/5 py-1 relative z-10 h-full cursor-pointer group active:scale-95 transition-transform"
    >
      <div 
        className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive 
            ? 'text-[#064e3b] scale-110 -translate-y-0.5' 
            : 'text-slate-400 group-hover:text-slate-600'
        }`}
      >
        {icon}
      </div>
      <span 
        className={`text-[9px] tracking-tight transition-all duration-200 mt-0.5 ${
          isActive 
            ? 'text-[#064e3b] font-black scale-105' 
            : 'text-slate-500 font-semibold'
        }`}
      >
        {label}
      </span>
    </Link>
  );
};
export default BottomNav;

