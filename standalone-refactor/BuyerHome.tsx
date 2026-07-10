import React, { useState } from 'react';
import { Search, Star, Layers, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export interface GigCardProps {
  id: string;
  title: string;
  sellerName: string;
  sellerLevel: string;
  sellerAvatar: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
}

export const GigCard: React.FC<GigCardProps> = ({
  id,
  title,
  sellerName,
  sellerLevel,
  sellerAvatar,
  price,
  rating,
  reviewsCount,
  image
}) => {
  return (
    <div className="bg-[#0E1320] border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/60 transition-all hover:translate-y-[-4px] group flex flex-col justify-between">
      <div>
        {/* Cover gallery image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 right-2.5 bg-[#0A0D14]/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-300 font-semibold border border-slate-800/60 flex items-center gap-1">
            <Zap className="text-amber-500" size={10} /> Escrow Protected
          </div>
        </div>

        {/* Content detail */}
        <div className="p-4 space-y-3">
          {/* Creator detail */}
          <div className="flex items-center gap-2">
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-5 h-5 rounded-full border border-slate-800 bg-slate-950"
            />
            <div>
              <p className="text-[11px] font-bold text-slate-300 leading-tight">{sellerName}</p>
              <p className="text-[9px] text-slate-500 font-medium leading-tight">{sellerLevel}</p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-white tracking-wide group-hover:text-emerald-400 transition-colors line-clamp-2 h-8">
            {title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <Star className="text-amber-500 fill-amber-500" size={11} />
            <span>{rating.toFixed(1)}</span>
            <span className="text-slate-500 font-medium">({reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="px-4 py-3 border-t border-slate-850 bg-[#0A0D15]/40 flex justify-between items-center">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Starting at</span>
        <span className="text-xs font-black text-emerald-400 font-mono">₦{(price * 1500).toLocaleString()}</span>
      </div>
    </div>
  );
};

export const BuyerHome: React.FC = () => {
  const [query, setQuery] = useState('');

  const featuredGigs: GigCardProps[] = [
    {
      id: 'g_1',
      title: 'Build secure, scalable MERN stack Web3 application with Firebase sync',
      sellerName: 'Adeola Cole',
      sellerLevel: 'Pro Verified',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Adeola',
      price: 150,
      rating: 5.0,
      reviewsCount: 34,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'g_2',
      title: 'Develop clean, highly performant React & TailwindCSS landing pages',
      sellerName: 'David Kalu',
      sellerLevel: 'Level 2 Seller',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=David',
      price: 50,
      rating: 4.9,
      reviewsCount: 82,
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'g_3',
      title: 'Design premium SaaS dashboards, UI UX designs, and Figma wires',
      sellerName: 'Simi Adebayo',
      sellerLevel: 'Top Rated Expert',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Simi',
      price: 120,
      rating: 5.0,
      reviewsCount: 19,
      image: 'https://images.unsplash.com/photo-1541462608141-27b297b15575?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'g_4',
      title: 'Create full-stack fintech apps with Paystack integration and charts',
      sellerName: 'Emeka Obi',
      sellerLevel: 'Pro Verified',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Emeka',
      price: 250,
      rating: 4.8,
      reviewsCount: 41,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="space-y-12">
      
      {/* 1. Hero Search Panel */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#0A0F19] to-emerald-950/20 border border-slate-800/80 p-8 md:p-14 flex flex-col justify-center min-h-[360px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_55%)]"></div>
        
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
              Zero Commissions
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight font-sans tracking-tight">
              Hire Elite Nigerian <span className="text-emerald-400">Freelancers</span> Protected by Smart Escrow.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed">
              Unlock decentralized development, UI designers, and copywriters. Your funds stay safe in local Paystack Escrow until delivery is approved.
            </p>
          </div>

          {/* Search Box */}
          <form className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="What skill or project do you need help with?"
                className="w-full bg-[#111622] text-slate-200 placeholder-slate-500 pl-11 pr-4 py-3 rounded-xl border border-slate-700/60 focus:border-emerald-500 focus:outline-none text-xs transition-all font-sans"
              />
              <Search className="absolute left-4 top-3.5 text-slate-500" size={14} />
            </div>
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] cursor-pointer">
              Search Now
            </button>
          </form>

          {/* Popular shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="font-bold">Popular:</span>
            {['React Hooks', 'SaaS Figma', 'Next.js API', 'Logo Designer'].map(tag => (
              <button key={tag} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full hover:border-slate-700 hover:text-white transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Platform Value Props banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0D15]/60 border border-slate-800/40 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Secure Escrow Contracts</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Payments initialized via secure Paystack channels are secured locally. Released only upon complete satisfaction.</p>
          </div>
        </div>

        <div className="bg-[#0A0D15]/60 border border-slate-800/40 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Zap size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Verified Local Portfolios</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">No fake listings. View real-time work samples, client reviews, and verified GitHub integration node details.</p>
          </div>
        </div>

        <div className="bg-[#0A0D15]/60 border border-slate-800/40 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Layers size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Full Collaboration Workrooms</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Chat in real-time, share assets securely, issue revisions, and manage milestones inside our interactive dashboard.</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Gigs Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-800/60 pb-3">
          <div className="space-y-1">
            <h2 className="text-md md:text-lg font-extrabold text-white">Featured Creative Services</h2>
            <p className="text-[11px] text-slate-500 font-mono">Commission-free high-end solutions ready for deployment</p>
          </div>
          <button className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1">
            See all services <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 columns on desktop, responsive for tablets and mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGigs.map(gig => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
      </section>

    </div>
  );
};
