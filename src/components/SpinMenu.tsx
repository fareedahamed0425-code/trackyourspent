import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  LayoutDashboard,
  CalendarDays,
  FolderTree,
  Calculator,
  History,
  Download,
  Settings,
  Plus,
  X,
  Move,
  RotateCw,
  Bot
} from 'lucide-react';
import { ActiveTab, UserSettings } from '../types';

interface SpinMenuProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

interface TabMenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

export const SpinMenu: React.FC<SpinMenuProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
  settings,
  onUpdateSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [spinDegree, setSpinDegree] = useState(0);
  const [showCornerPicker, setShowCornerPicker] = useState(false);

  const menuItems: TabMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3b82f6' },
    { id: 'daily', label: 'Day-wise Log', icon: CalendarDays, color: '#10b981' },
    { id: 'categories', label: 'Categories', icon: FolderTree, color: '#8b5cf6' },
    { id: 'calculator', label: 'Auto Calc', icon: Calculator, color: '#f59e0b' },
    { id: 'history', label: 'Full History', icon: History, color: '#ec4899' },
    { id: 'export', label: 'Download / Export', icon: Download, color: '#06b6d4' },
    { id: 'settings', label: 'Preferences', icon: Settings, color: '#64748b' },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot, color: '#10b981' },
  ];

  const handleToggle = () => {
    setSpinDegree((prev) => prev + (isOpen ? -180 : 360));
    setIsOpen(!isOpen);
  };

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  // Determine corner position styling
  const getCornerClasses = () => {
    switch (settings.cornerPosition) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const isTop = settings.cornerPosition.startsWith('top');
  const isLeft = settings.cornerPosition.endsWith('left');

  return (
    <>
      {/* Backdrop overlay when dial is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="spin-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Floating Corner Menu Container */}
      <div className={`fixed ${getCornerClasses()} z-50 flex flex-col items-${isLeft ? 'start' : 'end'} select-none`}>
        {/* Expanded Wheel / Radial Fan Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="spin-menu-radial-panel"
              initial={{ scale: 0.2, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.2, opacity: 0, rotate: -30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className={`mb-4 p-4 rounded-2xl bg-[#0f0f0f] text-[#e5e5e5] shadow-2xl border border-[#1a1a1a] backdrop-blur-xl w-72 sm:w-80 ${
                isTop ? 'mt-4 order-last' : 'mb-4'
              }`}
            >
              {/* Menu Header with Rotation & Move Control */}
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: spinDegree }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-7 h-7 rounded-lg bg-[#161616] text-[#c4b5a1] border border-[#222222] flex items-center justify-center"
                  >
                    <Compass className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4b5a1]">Dial Navigation</div>
                    <div className="text-xs font-light text-white">Select Destination</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id="spin-menu-rotate-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpinDegree((prev) => prev + 180);
                    }}
                    title="Spin Dial"
                    className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#e5e5e5]/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="spin-menu-corner-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCornerPicker(!showCornerPicker);
                    }}
                    title="Change Menu Corner Position"
                    className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#e5e5e5]/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Corner position switcher dropdown */}
              {showCornerPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#141414] rounded-xl p-2.5 mb-3 border border-[#222222] text-xs"
                >
                  <div className="text-[#e5e5e5]/60 text-[10px] uppercase tracking-wider font-medium mb-1.5">
                    Position Dial In Corner:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { pos: 'top-left', label: 'Top Left' },
                        { pos: 'top-right', label: 'Top Right' },
                        { pos: 'bottom-left', label: 'Bottom Left' },
                        { pos: 'bottom-right', label: 'Bottom Right' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.pos}
                        onClick={() => {
                          onUpdateSettings({ cornerPosition: c.pos });
                          setShowCornerPicker(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-left transition-colors text-xs cursor-pointer ${
                          settings.cornerPosition === c.pos
                            ? 'bg-[#c4b5a1] text-[#0a0a0a] font-semibold'
                            : 'bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#e5e5e5]/70 border border-[#222222]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Add Expense Trigger inside Dial */}
              <button
                id="spin-menu-quick-add-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddExpense();
                }}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Record Expense</span>
              </button>

              {/* Spin Tab Items Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      id={`spin-nav-item-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(item.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#c4b5a1] text-[#0a0a0a] font-semibold'
                          : 'bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5]/70 hover:text-white border border-[#222222]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isActive ? '#0a0a0a' : '#1a1a1a',
                          color: isActive ? '#c4b5a1' : '#c4b5a1',
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider truncate">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Main Spin-to-Open Button */}
        <div className="relative group">
          <motion.button
            id="spin-to-open-main-button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggle}
            aria-label="Open Navigation Spin Menu"
            className="w-14 h-14 rounded-full bg-[#0f0f0f] text-[#c4b5a1] shadow-2xl flex items-center justify-center border-2 border-[#c4b5a1]/40 relative overflow-hidden transition-all hover:border-[#c4b5a1] cursor-pointer"
          >
            {/* Spinning decorative ring */}
            <motion.div
              animate={{ rotate: spinDegree }}
              transition={{ type: 'spring', damping: 12, stiffness: 180 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-11 h-11 rounded-full border border-dashed border-[#c4b5a1]/30" />
            </motion.div>

            {/* Center Icon */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {isOpen ? <X className="w-5 h-5 text-white" /> : <Compass className="w-5 h-5 text-[#c4b5a1]" />}
            </motion.div>

            {/* Glowing dot indicator */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#c4b5a1] ring-2 ring-[#0a0a0a]" />
          </motion.button>

          {/* Quick Tooltip hint */}
          {!isOpen && (
            <div
              className={`absolute ${
                isTop ? 'top-full mt-2' : 'bottom-full mb-2'
              } ${isLeft ? 'left-0' : 'right-0'} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-[#141414] text-[#c4b5a1] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg border border-[#222222]`}
            >
              Spin to Open Menu
            </div>
          )}
        </div>
      </div>
    </>
  );
};
