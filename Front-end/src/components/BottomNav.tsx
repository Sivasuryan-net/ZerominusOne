import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { ActiveTab } from '../types';
import { Shield, ShieldAlert, History, Lock, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeThreat, quarantineList } = useSecurity();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Status', icon: Shield },
    { id: 'history', label: 'History', icon: History },
    { id: 'quarantine', label: 'Vault', icon: Lock, badge: quarantineList.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (activeThreat) {
    navItems.splice(1, 0, {
      id: 'threat',
      label: 'Threat',
      icon: ShieldAlert,
      badge: 1
    });
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${
                      item.id === 'threat' ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
