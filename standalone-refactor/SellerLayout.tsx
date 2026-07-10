import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Briefcase, 
  Compass, 
  Layers, 
  MessageSquare, 
  Plus, 
  User, 
  UserCheck, 
  LogOut,
  Menu,
  X,
  Shuffle,
  DollarSign
} from 'lucide-react';

export const SidebarSeller: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/seller', icon: BarChart2 },
    { label: 'Manage Gigs', path: '/seller/gigs', icon: Layers },
    { label: 'Create Gig', path: '/seller/gigs/create', icon: Plus },
    { label: 'Incoming Orders', path: '/seller/orders', icon: Briefcase },
    { label: 'Analytics Insights', path: '/seller/analytics', icon: DollarSign },
    { label: 'Professional Profile', path: '/seller/profile', icon: UserCheck }
  ];

  const checkActive = (path: string) => {
    if (path === '/seller') return location.pathname === '/seller';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden transition-all" onClick={onClose} />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0A0E17] border-r border-slate-800/60 flex flex-col z-50 md:z-30 transform md:transform-none transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-800/60 flex items-center justify-between">
          <Link to="/seller" className="flex items-center gap-2" onClick={onClose}>
            <Layers className="text-emerald-500 h-6 w-6" />
            <span className="font-extrabold text-white text-md tracking-tight">
              Chidon<span className="text-emerald-500">Seller</span>
            </span>
          </Link>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-[#070A11]/60">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=chidera"
              alt="Profile"
              className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900"
            />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Chidera E.</p>
              <p className="text-[10px] text-slate-500 font-mono leading-tight">Elite Level Seller</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all hover:bg-slate-800/40 cursor-pointer">
            <Shuffle size={12} /> Switch to Buying
          </button>
        </div>
      </aside>
    </>
  );
};

export const TopbarSeller: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 border-b border-slate-800/60 bg-[#0D111A] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-white" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Enterprise Portal</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-bold">Business Command</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Messages */}
        <Link to="/chat" className="text-slate-400 hover:text-white relative">
          <MessageSquare size={16} />
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">3</span>
        </Link>
        
        {/* Public profile quicklink */}
        <Link to="/profile/chidera" className="text-xs text-slate-400 hover:text-white font-bold transition-all">
          View Live Gigs
        </Link>

        <div className="h-4 w-[1px] bg-slate-800"></div>

        {/* Global earnings metrics indicator */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/5 px-3 py-1 border border-emerald-500/15 rounded-lg text-xs font-semibold">
          <span className="text-slate-400">Balance:</span>
          <span className="text-emerald-400 font-bold font-mono">₦2,450,000.00</span>
        </div>
      </div>
    </header>
  );
};

export const SellerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-200">
      {/* Sidebar */}
      <SidebarSeller isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="md:pl-64 min-h-screen flex flex-col justify-between">
        <div>
          {/* Topbar */}
          <TopbarSeller onMenuToggle={() => setSidebarOpen(true)} />
          
          {/* Main content body canvas */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-[#06080D] py-6 text-center text-[11px] text-slate-500 mt-20">
          <p>© 2026 ChidonFreelance Inc. Secured Paystack Escrow Integration.</p>
        </footer>
      </div>
    </div>
  );
};
