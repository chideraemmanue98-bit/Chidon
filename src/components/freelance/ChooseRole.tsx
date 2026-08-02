import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Briefcase, ChevronRight, User } from 'lucide-react';

interface ChooseRoleProps {
  onSelectRole: (role: 'buyer' | 'seller') => void;
  onBack: () => void;
}

export const ChooseRole: React.FC<ChooseRoleProps> = ({ onSelectRole, onBack }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top back navigation */}
      <button
        onClick={onBack}
        id="btn-chooserole-back"
        className="absolute top-6 left-6 text-xs font-mono font-bold text-gray-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-full cursor-pointer"
      >
        <span>← Back</span>
      </button>

      <div className="max-w-3xl w-full space-y-10 z-10">
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            Identity Configuration
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-gray-900 dark:text-white">
            How do you want to use <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-500">
              Chidon Freelance?
            </span>
          </h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Configure your focus workspace. You can toggle your active role inside your dashboard at any time.
          </p>
        </div>

        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-2xl mx-auto">
          {/* Card 1: Buyer */}
          <motion.div
            whileHover={{ y: -6, borderColor: '#0ea5e9' }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl text-left space-y-6 cursor-pointer flex flex-col justify-between group transition-all"
            onClick={() => onSelectRole('buyer')}
            id="card-role-buyer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
                <ShoppingCart size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  I’m a Buyer
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                  Hire top social media specialists for video edits, audience acceleration, graphics design, and ghostwriting.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('buyer');
              }}
              id="btn-continue-buyer"
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue as Buyer</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </motion.div>

          {/* Card 2: Seller */}
          <motion.div
            whileHover={{ y: -6, borderColor: '#8b5cf6' }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl text-left space-y-6 cursor-pointer flex flex-col justify-between group transition-all"
            onClick={() => onSelectRole('seller')}
            id="card-role-seller"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-all duration-300">
                <Briefcase size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  I’m a Seller
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                  Sell your specialized social media skills, showcase your portfolio, and earn credits and secure payment rewards.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectRole('seller');
              }}
              id="btn-continue-seller"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue as Seller</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
