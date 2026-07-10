import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Compass, 
  Heart, 
  Briefcase, 
  MessageSquare, 
  User, 
  LogOut, 
  Layers, 
  Menu, 
  X,
  Shuffle
} from 'lucide-react';

export const NavbarBuyer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    'Graphics & Design',
    'Programming & Tech',
    'Digital Marketing',
    'Video & Animation',
    'Writing & Translation',
    'AI Services'
  ];

  return (
    <nav className="bg-[#0D111A] border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/buyer" className="flex items-center gap-2">
              <Layers className="text-emerald-500 h-6 w-6" />
              <span className="font-extrabold text-white text-lg tracking-tight font-sans">
                Chidon<span className="text-emerald-500">Freelance</span>
              </span>
            </Link>

            {/* Custom Search Box */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find services, developers, designers..."
                className="w-full bg-[#161D2D] text-slate-200 placeholder-slate-500 pl-10 pr-4 py-1.5 rounded-lg border border-slate-700/60 focus:border-emerald-500 focus:outline-none text-xs transition-all font-sans"
              />
              <Search className="absolute left-3 text-slate-500" size={14} />
            </form>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/buyer" className="text-xs text-slate-300 hover:text-white font-semibold transition-colors">
              Explore Gigs
            </Link>
            <Link to="/buyer/orders" className="text-xs text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1">
              <Briefcase size={14} /> My Orders
            </Link>
            <Link to="/buyer/favorites" className="text-xs text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1">
              <Heart size={14} className="text-rose-500" /> Saved
            </Link>
            <Link to="/chat" className="text-xs text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1">
              <MessageSquare size={14} /> Messages
            </Link>
            
            <div className="h-4 w-[1px] bg-slate-800"></div>

            {/* Switch view toggle */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500/10 cursor-pointer transition-all">
              <Shuffle size={11} /> Switch to Selling
            </button>

            {/* Avatar Profile Option */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-xs text-slate-300 focus:outline-none">
                <img
                  src="https://api.dicebear.com/7.x/pixel-art/svg?seed=chidera"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900"
                />
              </button>
            </div>
          </div>

          {/* Hamburger Menu Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <button className="text-emerald-400 p-1 bg-emerald-500/10 rounded-lg">
              <Shuffle size={14} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header Categories */}
      <div className="hidden md:block bg-[#0A0D14] border-t border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            {categories.map((cat) => (
              <Link key={cat} to={`/buyer/search?category=${encodeURIComponent(cat)}`} className="hover:text-emerald-400 transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0D14] border-b border-slate-800 p-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gigs..."
              className="w-full bg-[#161D2D] text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-lg border border-slate-700/60 focus:border-emerald-500 focus:outline-none text-xs"
            />
            <Search className="absolute left-3 text-slate-500" size={14} />
          </form>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/buyer" onClick={() => setIsOpen(false)} className="text-xs text-slate-300 hover:text-white p-2 hover:bg-slate-800/40 rounded-lg">Explore Jobs</Link>
            <Link to="/buyer/orders" onClick={() => setIsOpen(false)} className="text-xs text-slate-300 hover:text-white p-2 hover:bg-slate-800/40 rounded-lg">My Orders</Link>
            <Link to="/buyer/favorites" onClick={() => setIsOpen(false)} className="text-xs text-slate-300 hover:text-white p-2 hover:bg-slate-800/40 rounded-lg">Saved Gigs</Link>
            <Link to="/chat" onClick={() => setIsOpen(false)} className="text-xs text-slate-300 hover:text-white p-2 hover:bg-slate-800/40 rounded-lg">Messages</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export const MobileBottomNavBuyer: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0D14] border-t border-slate-800/80 h-14 flex items-center justify-around z-50">
      <Link to="/buyer" className="flex flex-col items-center text-slate-400 hover:text-emerald-400">
        <Compass size={18} />
        <span className="text-[9px] mt-0.5">Explore</span>
      </Link>
      <Link to="/buyer/favorites" className="flex flex-col items-center text-slate-400 hover:text-emerald-400">
        <Heart size={18} />
        <span className="text-[9px] mt-0.5">Saved</span>
      </Link>
      <Link to="/buyer/orders" className="flex flex-col items-center text-slate-400 hover:text-emerald-400">
        <Briefcase size={18} />
        <span className="text-[9px] mt-0.5">Orders</span>
      </Link>
      <Link to="/chat" className="flex flex-col items-center text-slate-400 hover:text-emerald-400">
        <MessageSquare size={18} />
        <span className="text-[9px] mt-0.5">Inbox</span>
      </Link>
      <Link to="/profile/chidera" className="flex flex-col items-center text-slate-400 hover:text-emerald-400">
        <User size={18} />
        <span className="text-[9px] mt-0.5">Profile</span>
      </Link>
    </div>
  );
};

export const BuyerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-200 pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <NavbarBuyer />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080D] py-8 text-center text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 ChidonFreelance Inc. Commission-Free Escrows & Global Talent Pipeline.</p>
        </div>
      </footer>

      {/* Responsive mobile bottom navigations */}
      <MobileBottomNavBuyer />
    </div>
  );
};
