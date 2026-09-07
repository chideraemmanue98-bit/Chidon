import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, Shield, Briefcase, DollarSign, Cpu, Globe, MessageSquare, ShoppingBag, 
  Settings, User, CheckCircle2, Flame, ArrowUpRight, Check, BookOpen, Star, HelpCircle, Coins
} from 'lucide-react';

interface FeatureGuidePageProps {
  onNavigate: (tabId: any) => void;
  role: 'buyer' | 'seller';
}

export const FeatureGuidePage: React.FC<FeatureGuidePageProps> = ({ onNavigate, role }) => {
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'seller_profile' | 'work' | 'order' | 'money'>('all');

  const featureGroups = [
    { id: 'all', label: 'All 20+ Features' },
    { id: 'seller_profile', label: '🎨 Profile & Gigs' },
    { id: 'work', label: '⚡ Getting Work' },
    { id: 'order', label: '📦 Orders & Escrow' },
    { id: 'money', label: '💸 Growth & AI Suite' }
  ];

  const features = [
    // Group 1: Profile & Gigs
    {
      id: 'f1',
      group: 'seller_profile',
      title: 'Seller Profile Setup',
      icon: User,
      desc: 'Build credentials detailing Bio, Education, Languages, Specialist Skills, and Certifications.',
      page: 'profile',
      pageLabel: 'My Profile Tab',
      badge: 'Seller & Buyer'
    },
    {
      id: 'f2',
      group: 'seller_profile',
      title: 'Seller Levels Tier Progression',
      icon: Award,
      desc: 'Tier tracking based on gross lifetime earnings: New Seller ➔ Level 1 ➔ Level 2 ➔ Top Rated.',
      page: 'dashboard',
      pageLabel: 'Seller Dashboard Overview',
      badge: 'Level Badges'
    },
    {
      id: 'f3',
      group: 'seller_profile',
      title: 'Interactive Gig Creator',
      icon: Briefcase,
      desc: 'Sellers list custom services, specifying Title, Category, Delivery times, Pricing tiers, FAQ, and Search Tags.',
      page: 'dashboard',
      pageLabel: 'Gigs Manager Tab',
      badge: 'Active Listings'
    },
    {
      id: 'f4',
      group: 'seller_profile',
      title: 'Gig Analytics Metrics',
      icon: Flame,
      desc: 'A scorecard displaying Impression counts, Click metrics, and Conversion rates per active listing.',
      page: 'dashboard',
      pageLabel: 'Gigs Manager Analytics',
      badge: 'Recharts Hook'
    },
    {
      id: 'f5',
      group: 'seller_profile',
      title: 'Past-Works Portfolio Showcase',
      icon: Globe,
      desc: 'Showcase portfolios detailing title briefs, cover photo URLs, and clickable live media redirects.',
      page: 'profile',
      pageLabel: 'My Profile Tab Showcase',
      badge: 'Rich Media'
    },
    {
      id: 'f6',
      group: 'seller_profile',
      title: 'AI Gig Title & Desc Optimizer',
      icon: Cpu,
      desc: 'Uses server-side Gemini AI to analyze raw inputs and return optimized viral headlines, keywords, and copy.',
      page: 'dashboard',
      pageLabel: 'Gig Creator Modal',
      badge: 'Gemini AI Powered'
    },

    // Group 2: Getting Work
    {
      id: 'f7',
      group: 'work',
      title: 'Buyer Requests & Bidding Feed',
      icon: ShoppingBag,
      desc: 'Upwork-style job feed displaying active public briefs, pricing structures, and requirements.',
      page: 'dashboard',
      pageLabel: 'Get Work Tab',
      badge: 'Client Proposals'
    },
    {
      id: 'f8',
      group: 'work',
      title: 'AI Proposal Cover Letter Writer',
      icon: Cpu,
      desc: 'Tailor custom high-converting cover letters instantly using Gemini to match client job specifications.',
      page: 'dashboard',
      pageLabel: 'Get Work Proposal Panel',
      badge: 'Gemini AI Powered'
    },
    {
      id: 'f9',
      group: 'work',
      title: 'Availability Status Badge',
      icon: Flame,
      desc: 'Toggle active Availability Badge displaying "Available Now" glowing label to client search indexing.',
      page: 'dashboard',
      pageLabel: 'Dashboard Header Toggle',
      badge: 'Real-time Switch'
    },
    {
      id: 'f10',
      group: 'work',
      title: 'Inbox Quick Responses Templates',
      icon: MessageSquare,
      desc: 'Pre-saved reply templates (Intro, WIP, Handshake, Final Release) instantly copying to drafts.',
      page: 'dashboard',
      pageLabel: 'Get Work Proposal Board',
      badge: 'Time Saver'
    },

    // Group 3: Orders & Escrow
    {
      id: 'f11',
      group: 'order',
      title: 'Seller Dashboard Scorecard',
      icon: Award,
      desc: 'Summarizes key active indicators: Active Orders, Gross Earnings, Active Queue, and Response rates.',
      page: 'dashboard',
      pageLabel: 'Seller Dashboard Overview',
      badge: 'Analytics Metrics'
    },
    {
      id: 'f12',
      group: 'order',
      title: 'Contract Chat Inbox',
      icon: MessageSquare,
      desc: 'Order-centric direct messaging threads allowing real-time chat between buyer and seller.',
      page: 'dashboard',
      pageLabel: 'Orders Management Workspace',
      badge: 'Escrow Integrated'
    },
    {
      id: 'f13',
      group: 'order',
      title: 'Multi-Sig Delivery System',
      icon: Shield,
      desc: 'Sellers upload finished file links and production descriptions into intermediate escrow custody.',
      page: 'dashboard',
      pageLabel: 'Active Orders workspace',
      badge: 'Milestone Handover'
    },
    {
      id: 'f14',
      group: 'order',
      title: 'Revision & Disagreement Desk',
      icon: Settings,
      desc: 'Allows buyers to request correction revision files, or sellers to trigger formal dispute arbiter.',
      page: 'dashboard',
      pageLabel: 'Orders Tab Actions',
      badge: 'Resolution Vault'
    },
    {
      id: 'f15',
      group: 'order',
      title: 'Late Delivery Rating Shield',
      icon: Shield,
      desc: 'A Toggle adding 48-hour automated buffer limits to preserve profile tier score in emergency states.',
      page: 'dashboard',
      pageLabel: 'Active Orders Row',
      badge: 'Automated Protection'
    },

    // Group 4: Money & Growth
    {
      id: 'f16',
      group: 'money',
      title: 'Accounting Earnings Dashboard',
      icon: DollarSign,
      desc: 'Breaks down revenues detailing Total Earnings, Locked escrow balances, and Available payout cleared.',
      page: 'escrow',
      pageLabel: 'Escrow Ledger Tab',
      badge: 'Paystack Ledger'
    },
    {
      id: 'f17',
      group: 'money',
      title: 'Payout Withdrawal Portal',
      icon: Coins,
      desc: 'A Direct Withdraw panel supporting global clearing integrations (Naira account, PayPal, Mobile Money).',
      page: 'escrow',
      pageLabel: 'Escrow Ledger / Withdraw Drawer',
      badge: 'Direct Clearance'
    },
    {
      id: 'f18',
      group: 'money',
      title: 'Revenue Metrics Charts',
      icon: Flame,
      desc: 'Interactive Recharts Area diagrams tracking monthly performance metrics and high-paying gig channels.',
      page: 'escrow',
      pageLabel: 'Escrow Performance Tab',
      badge: 'Interactive Charts'
    },
    {
      id: 'f19',
      group: 'money',
      title: 'AI Smart Copywriter Tools Suite',
      icon: Cpu,
      desc: 'Generative copywriting tools: portfolio writer, thumbnail strategist, and short-form video scripting.',
      page: 'tools',
      pageLabel: 'Smart Suite Tab',
      badge: 'Gemini AI Powered'
    },
    {
      id: 'f20',
      group: 'money',
      title: 'Skill Tests & AI Verification Badge',
      icon: Award,
      desc: 'Interactive exam modules (Social Media, Video Editing) that instantly unlock the "AI Verified" badge on pass.',
      page: 'dashboard',
      pageLabel: 'Dashboard Level Checklist',
      badge: 'AI Verified'
    }
  ];

  const filteredFeatures = selectedGroup === 'all'
    ? features
    : features.filter(f => f.group === selectedGroup);

  return (
    <div className="space-y-6 text-left select-text">
      {/* Header section */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl">
          <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
            Comprehensive Platform Index
          </span>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Chidon Freelance Capabilities Map
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Here are the twenty (20) professional freelancer & buyer capabilities built directly into the Chidon Freelance ecosystem. Click any feature card to jump instantly to its dedicated, fully functional interactive page.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-2xl max-w-3xl">
        {featureGroups.map(group => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer ${
              selectedGroup === group.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map(feature => {
          const IconComp = feature.icon;
          return (
            <div
              key={feature.id}
              className="p-5 bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-3xl flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 duration-300 relative shadow-md group"
            >
              <div className="space-y-3">
                {/* Header Tag / Icon */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <IconComp size={16} />
                  </div>
                  <span className="text-[8px] font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded-full border border-cyan-500/10">
                    {feature.badge}
                  </span>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wide">
                    {feature.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">
                    {feature.desc}
                  </p>
                </div>
              </div>

              {/* Action Jump Button */}
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">Node: {feature.pageLabel}</span>
                <button
                  onClick={() => onNavigate(feature.page)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-all uppercase group-hover:translate-x-0.5"
                >
                  Go to Page <ArrowUpRight size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
