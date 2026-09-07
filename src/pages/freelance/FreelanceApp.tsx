// For Netlify: Enable "Prerendering" in Site Settings > Build & Deploy > Post Processing

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, DollarSign, Cpu, Shield, Search, Filter, RefreshCw, X, 
  Info, Star, Compass, Award, ExternalLink, ArrowRight, CheckCircle2, 
  Lock, Clock, Send, Eye, FileText, Check, Settings
} from 'lucide-react';

// STYLISH BRAND: CHIDON FREELANCE EARN (Blue-600 & Purple-600 Theme)

interface Gig {
  id: string;
  title: string;
  desc: string;
  price: number;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  reviewsCount: number;
  category: string;
  deliveryTime: string;
}

interface Proposal {
  id: string;
  jobTitle: string;
  client: string;
  bidAmount: number;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

interface Order {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'in_review' | 'completed' | 'cancelled';
  clientName: string;
  sellerName: string;
  deadline: string;
  files: string[];
}

export const FreelanceApp: React.FC = () => {
  // Navigation states: 'marketplace' | 'gig_detail' | 'freelancer_dashboard' | 'buyer_dashboard' | 'order_workspace' | 'earnings' | 'proposals'
  const [activePage, setActivePage] = useState<'marketplace' | 'gig_detail' | 'freelancer_dashboard' | 'buyer_dashboard' | 'order_workspace' | 'earnings' | 'proposals'>('marketplace');
  
  // Active selected item IDs
  const [selectedGigId, setSelectedGigId] = useState<string>('g1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('order-108');

  // Gigs static database
  const [gigs] = useState<Gig[]>([
    {
      id: 'g1',
      title: 'Expert Short-form CapCut & Premier Video Editor',
      desc: 'Deliver high-retention viral video editing for TikTok, Reels, and YouTube Shorts with dynamic text, visual loops, and tailored audio tracks.',
      price: 150,
      sellerName: 'Amara Davies',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Amara',
      rating: 4.9,
      reviewsCount: 42,
      category: 'Video Editing',
      deliveryTime: '2 Days'
    },
    {
      id: 'g2',
      title: 'Prompt Engineer & custom LLM AI Integration Expert',
      desc: 'Build optimized system instructions, custom GPT workflows, and connect Google Gemini API with robust caching layers in Node.js and Python.',
      price: 350,
      sellerName: 'Chidi Mark',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chidi',
      rating: 5.0,
      reviewsCount: 18,
      category: 'AI Development',
      deliveryTime: '3 Days'
    },
    {
      id: 'g3',
      title: 'SaaS UX Designer & High-Converting landing Pages',
      desc: 'Design beautifully modern typographic landing pages and digital wireframes inside Tailwind CSS structures with clean, rhythmic spacing.',
      price: 220,
      sellerName: 'Elizabeth Nkem',
      sellerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Liz',
      rating: 4.8,
      reviewsCount: 29,
      category: 'Design & UI',
      deliveryTime: '5 Days'
    }
  ]);

  // Active proposals list
  const [proposals] = useState<Proposal[]>([
    { id: 'p-01', jobTitle: 'SaaS Launch Copywriter', client: 'Alpha Corp', bidAmount: 180, status: 'pending', date: 'Sept 4, 2026' },
    { id: 'p-02', jobTitle: 'TikTok Growth Strategist', client: 'Growth Capital', bidAmount: 450, status: 'accepted', date: 'Sept 2, 2026' },
    { id: 'p-03', jobTitle: 'Figma to Tailwind Integration', client: 'ByteTech', bidAmount: 250, status: 'declined', date: 'Aug 29, 2026' }
  ]);

  // Active orders list
  const [orders, setOrders] = useState<Order[]>([
    { id: 'order-108', title: 'Viral TikTok Campaign for FinTech', price: 450, status: 'active', clientName: 'Nkem Tech Ventures', sellerName: 'Amara Davies', deadline: 'In 3 Days', files: [] },
    { id: 'order-204', title: 'SaaS Brand Asset Design Pack', price: 220, status: 'in_review', clientName: 'Alpha Corp', sellerName: 'Elizabeth Nkem', deadline: 'Completed', files: ['logo_draft_v1.png', 'social_cards_grid.zip'] }
  ]);

  // Select current active gig object safely
  const activeGig = gigs.find(g => g.id === selectedGigId) || gigs[0];
  // Select current active order object safely
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || gig.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || gig.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-blue-600/30">
      
      {/* ---------------- NAVIGATION HEADER ---------------- */}
      <header className="sticky top-0 z-40 bg-[#070913]/90 backdrop-blur-md border-b border-slate-900 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white">
              <Compass size={22} className="animate-spin" style={{ animationDuration: '15s' }} />
            </div>
            <div>
              <h1 className="text-md font-display font-black uppercase tracking-tight text-white leading-none">
                CHIDON <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">FREELANCE EARN</span>
              </h1>
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">2026 PROFESSIONAL SUITE</span>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={() => setActivePage('marketplace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${activePage === 'marketplace' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => setActivePage('freelancer_dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${activePage === 'freelancer_dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Seller Desk
            </button>
            <button 
              onClick={() => setActivePage('buyer_dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${activePage === 'buyer_dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Client Desk
            </button>
            <button 
              onClick={() => setActivePage('proposals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${activePage === 'proposals' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Proposals
            </button>
            <button 
              onClick={() => setActivePage('earnings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${activePage === 'earnings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              Earnings
            </button>
          </nav>
        </div>
      </header>

      {/* ---------------- MAIN VIEW SWITCHER ---------------- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ================== PAGE 1: MARKETPLACE ================== */}
        {activePage === 'marketplace' && (
          <div className="space-y-8 text-left">
            
            {/* REACT HELMET META */}
            <Helmet>
              <title>CHIDON FREELANCE EARN - Hire Top AI Freelancers in 2026</title>
              <meta name="description" content="Access premium verified social media marketers, prompt engineers, and short-form video editors worldwide. Transact securely via verified Paystack escrow gateways." />
              <meta name="keywords" content="freelance market, prompt engineer, AI, hire freelancers, CapCut video editor, chidon, chidoniq" />
              <meta property="og:title" content="CHIDON FREELANCE EARN - Hire Top AI Freelancers in 2026" />
              <meta property="og:description" content="Deploy escrow protect campaigns and hire the highest-rated digital content creators." />
              <meta property="og:image" content="https://chidoniq.com/social-share.png" />
              <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* SCHEMA.ORG JSON-LD STRUCTURED DATA */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "CHIDON FREELANCE EARN",
                "url": "https://chidoniq.com/freelance",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://chidoniq.com/freelance?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })}
            </script>

            {/* Interactive Hero Banner */}
            <div className="relative bg-gradient-to-br from-indigo-950/40 via-[#0C0F22] to-[#070913] border border-slate-900 rounded-3xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3 max-w-xl">
                <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                  SEO GROUNDED DISCOVERY NETWORK
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight leading-tight">
                  Hire the absolute Best AI & Creative Talents
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lock verified campaigns with smart proof-of-work validation loops. All deliverables are secured via instant bank escrow clearance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto">
                <button 
                  onClick={() => setActivePage('freelancer_dashboard')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs font-mono font-black uppercase text-white shadow-lg transition-all cursor-pointer text-center"
                >
                  Start Earning Gigs
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0C0F22] border border-slate-900 p-4 rounded-3xl">
              <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search AI, editors, creators..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070913] border border-slate-850 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Filter size={14} className="text-slate-500" />
                {['All', 'Video Editing', 'AI Development', 'Design & UI'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${categoryFilter === cat ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gigs List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredGigs.map(gig => (
                <div 
                  key={gig.id}
                  onClick={() => {
                    setSelectedGigId(gig.id);
                    setActivePage('gig_detail');
                  }}
                  className="bg-[#0C0F22] border border-slate-900 hover:border-purple-500/50 rounded-3xl p-5 space-y-4 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-purple-500/5 flex flex-col justify-between"
                >
                  {/* JSON-LD Rich Snippet for Google Search indexation */}
                  <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Service",
                      "serviceType": gig.category,
                      "provider": {
                        "@type": "LocalBusiness",
                        "name": "CHIDON FREELANCE EARN"
                      },
                      "offers": {
                        "@type": "Offer",
                        "priceCurrency": "USD",
                        "price": gig.price
                      }
                    })}
                  </script>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                        {gig.category}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                        <Star size={12} className="fill-amber-400" />
                        <span>{gig.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-400 line-clamp-2">
                      {gig.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {gig.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={gig.sellerAvatar} alt={gig.sellerName} className="w-6 h-6 rounded-full border border-slate-800 bg-slate-900" />
                      <span className="text-[10px] font-mono text-slate-400">{gig.sellerName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 block leading-none">Starting From</span>
                      <span className="text-sm font-mono font-black text-white">${gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================== PAGE 2: GIG DETAIL ================== */}
        {activePage === 'gig_detail' && activeGig && (
          <div className="space-y-6 text-left max-w-4xl mx-auto">
            
            {/* REACT HELMET DYNAMIC META */}
            <Helmet>
              <title>{`Hire ${activeGig.title} on CHIDON | From $${activeGig.price}`}</title>
              <meta name="description" content={`Delegate to verified professional ${activeGig.sellerName}. Get ${activeGig.category} delivered in ${activeGig.deliveryTime}. Complete Escrow protection.`} />
              <meta property="og:title" content={`Hire ${activeGig.title} on CHIDON | From $${activeGig.price}`} />
              <meta property="og:description" content={`Verified delivery within ${activeGig.deliveryTime}. Click to lock escrow contract.`} />
            </Helmet>

            {/* SCHEMA.ORG PRODUCT / SERVICE MARKUP */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": activeGig.title,
                "description": activeGig.desc,
                "offers": {
                  "@type": "Offer",
                  "price": activeGig.price,
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": activeGig.rating,
                  "reviewCount": activeGig.reviewsCount
                }
              })}
            </script>

            <button 
              onClick={() => setActivePage('marketplace')}
              className="px-3 py-1.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              ← Back to Marketplace
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-2 bg-[#0C0F22] border border-slate-900 p-6 md:p-8 rounded-3xl space-y-6">
                
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-black">
                    {activeGig.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
                    {activeGig.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 py-3 border-y border-slate-850">
                  <div className="flex items-center gap-2">
                    <img src={activeGig.sellerAvatar} alt={activeGig.sellerName} className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block leading-none font-bold">PROFESSIONAL PROVIDER</span>
                      <span className="text-xs font-mono font-black text-white">{activeGig.sellerName}</span>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-850" />
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs">
                    <Star size={14} className="fill-amber-400" />
                    <span>{activeGig.rating} ({activeGig.reviewsCount} verified clients)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">PROJECT DESCRIPTION</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeGig.desc}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By launching this campaign contract, your capital is safely processed and held inside a protected vault. Work assets are submitted directly into your client dashboard for review before clearance is finalized.
                  </p>
                </div>

              </div>

              {/* Right Column: Checkout Widget */}
              <div className="bg-[#0C0F22] border-2 border-blue-500/30 p-6 rounded-3xl flex flex-col justify-between h-fit space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                
                <div className="space-y-4 text-left">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase">Fixed Campaign Budget</span>
                    <span className="text-xl font-mono font-black text-white">${activeGig.price}</span>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-400" /> Delivery Target
                      </span>
                      <span className="text-white">{activeGig.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield size={12} className="text-emerald-400" /> Platform Escrow
                      </span>
                      <span className="text-emerald-400">ACTIVE ✓</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextId = 'order-' + Math.floor(Math.random() * 800 + 100);
                    const newOrd: Order = {
                      id: nextId,
                      title: activeGig.title,
                      price: activeGig.price,
                      status: 'active',
                      clientName: 'You (Client Node)',
                      sellerName: activeGig.sellerName,
                      deadline: 'In 3 Days',
                      files: []
                    };
                    setOrders(prev => [newOrd, ...prev]);
                    setSelectedOrderId(nextId);
                    setActivePage('buyer_dashboard');
                    alert(`Secure order contract created! Redirecting to Client Dashboard to track: Order #${nextId}`);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs font-mono font-black uppercase text-white shadow-lg transition-all cursor-pointer text-center block"
                >
                  Secure with Escrow
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ================== PAGE 3: SELLER DASHBOARD ================== */}
        {activePage === 'freelancer_dashboard' && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* REACT HELMET META */}
            <Helmet>
              <title>Seller Dashboard | CHIDON FREELANCE EARN</title>
              <meta name="description" content="Manage creative campaigns, review client briefings, and submit work milestones directly to Paystack escrow audits." />
            </Helmet>

            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Seller Creator terminal</h2>
                <p className="text-[11px] text-slate-400">Connected creator stream. Manage campaigns and upload milestones.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-mono uppercase tracking-widest border border-purple-500/20 font-bold">
                ACTIVE CREATOR ✓
              </span>
            </div>

            {/* Seller stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Completed Contracts</span>
                <span className="text-xl font-mono font-black text-white">18 Clearances</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Average Satisfaction</span>
                <span className="text-xl font-mono font-black text-amber-400">★ 4.98</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Pending Clearings</span>
                <span className="text-xl font-mono font-black text-purple-400">$840.00</span>
              </div>
            </div>

            {/* Active contracts being worked on */}
            <div className="bg-[#0C0F22] border border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Active Deliverable Contracts</h3>
              
              <div className="space-y-3">
                {orders.filter(o => o.sellerName === 'Amara Davies' || o.sellerName === 'You (Client Node)').map(o => (
                  <div key={o.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white uppercase">{o.title}</span>
                        <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">
                          {o.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Client: {o.clientName} | Budget: <strong className="text-slate-300">${o.price}</strong> | Deadline: {o.deadline}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setActivePage('order_workspace');
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-[10px] font-mono font-black uppercase text-white cursor-pointer"
                    >
                      Open Workspace
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================== PAGE 4: BUYER DASHBOARD ================== */}
        {activePage === 'buyer_dashboard' && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* REACT HELMET META */}
            <Helmet>
              <title>Client Dashboard | CHIDON FREELANCE EARN</title>
              <meta name="description" content="Lock budgets in protected vaults, view contractor delivery drafts, and confirm Paystack bank escrow releases." />
            </Helmet>

            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Client Buyer Desk</h2>
                <p className="text-[11px] text-slate-400">Connected client stream. Review milestones, lock escrows, and download digital assets.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono uppercase tracking-widest border border-blue-500/20 font-bold">
                ACTIVE BUYER ✓
              </span>
            </div>

            {/* Buyer stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Active Escrows Locked</span>
                <span className="text-xl font-mono font-black text-white">${orders.filter(o => o.status !== 'completed').reduce((sum, o) => sum + o.price, 0)}</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Acquisition Campaigns</span>
                <span className="text-xl font-mono font-black text-blue-400">{orders.length} Contracts</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Escrow Protected Partner</span>
                <span className="text-xl font-mono font-black text-emerald-400">SECURE ✓</span>
              </div>
            </div>

            {/* Buyer contracts being tracked */}
            <div className="bg-[#0C0F22] border border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Your Active Commission Contracts</h3>
              
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white uppercase">{o.title}</span>
                        <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                          {o.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Provider: {o.sellerName} | locked Budget: <strong className="text-slate-300">${o.price}</strong> | Status: <strong className="text-blue-400 uppercase">{o.status}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setActivePage('order_workspace');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[10px] font-mono font-black uppercase text-white cursor-pointer"
                    >
                      Audit Work Files
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================== PAGE 5: ORDER WORKSPACE ================== */}
        {activePage === 'order_workspace' && activeOrder && (
          <div className="space-y-6 text-left max-w-4xl mx-auto">
            
            {/* REACT HELMET DYNAMIC META */}
            <Helmet>
              <title>{`Order #${activeOrder.id} | CHIDON FREELANCE`}</title>
              <meta name="description" content={`Active escrow tracking desk for order #${activeOrder.id}. Review and download deliverables with verified clearance.`} />
            </Helmet>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePage(activeOrder.clientName.includes('You') ? 'buyer_dashboard' : 'freelancer_dashboard')}
                className="px-3 py-1.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                ← Return to Dashboard
              </button>
            </div>

            <div className="bg-[#0C0F22] border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-4 flex-wrap gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-blue-400 font-black tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    ESCROW-SECURED PORTAL
                  </span>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">{activeOrder.title}</h2>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {activeOrder.id} | locked Budget: ${activeOrder.price}</p>
                </div>

                <div className="px-4 py-2 bg-slate-950 border border-slate-850 rounded-2xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Status: <strong className="text-white uppercase">{activeOrder.status}</strong></span>
                </div>
              </div>

              {/* Secure file transfer widget */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-emerald-400" /> SECURE MILestone DELIVERABLES
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* File logs */}
                  <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Uploaded Documents / Drafts</span>
                    
                    {activeOrder.files.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs font-mono">
                        No files uploaded yet for this contract.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeOrder.files.map((file, i) => (
                          <div key={i} className="p-2.5 bg-[#0C0F22] border border-slate-850 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-mono text-white flex items-center gap-1.5">
                              <FileText size={12} className="text-blue-400" /> {file}
                            </span>
                            <button className="text-[9px] font-mono text-purple-400 hover:text-white cursor-pointer">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit / Release desk */}
                  <div className="p-5 bg-gradient-to-br from-[#0C0F22] to-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <p className="text-[10px] font-mono text-slate-500 uppercase font-black">Escrow Action Panel</p>
                      <p className="text-slate-400 leading-relaxed">
                        Clients can instantly release Paystack bank funds upon auditing files. Sellers can upload new files to trigger a review.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = orders.map(o => o.id === activeOrder.id ? { ...o, status: 'completed' as const } : o);
                          setOrders(updated);
                          alert("Thank you! Escrow released successfully and funds cleared to the seller.");
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-mono font-black uppercase text-white cursor-pointer text-center"
                      >
                        Release Funds
                      </button>
                      <button
                        onClick={() => {
                          const text = prompt("Enter the name of your file deliverable:");
                          if (text) {
                            const updated = orders.map(o => o.id === activeOrder.id ? { ...o, files: [...o.files, text], status: 'in_review' as const } : o);
                            setOrders(updated);
                            alert(`File "${text}" uploaded successfully! Status updated to Under Review.`);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-mono font-bold uppercase text-slate-300 hover:text-white cursor-pointer"
                      >
                        Upload Deliverable
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================== PAGE 6: EARNINGS ================== */}
        {activePage === 'earnings' && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* REACT HELMET META */}
            <Helmet>
              <title>Earnings & Payouts | CHIDON FREELANCE EARN</title>
              <meta name="description" content="View cleared payouts, lock revenue ledgers, and manage direct bank deposits on Chidon Freelance." />
            </Helmet>

            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Earnings & Payout Ledger</h2>
                <p className="text-[11px] text-slate-400">Direct creator settlement desk. Connect your bank to clear escrow releases.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-mono uppercase tracking-widest border border-purple-500/20 font-bold">
                PAYSTACK VERIFIED ✓
              </span>
            </div>

            {/* Financial overview grids */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Gross Earnings</span>
                <span className="text-xl font-mono font-black text-white">$4,250.00</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Escrow Clearance</span>
                <span className="text-xl font-mono font-black text-purple-400">$650.00</span>
              </div>
              <div className="bg-[#0C0F22] border border-slate-900 p-5 rounded-3xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Direct Cleared</span>
                <span className="text-xl font-mono font-black text-emerald-400">$3,600.00</span>
              </div>
              <div className="bg-[#0C0F22] border-2 border-purple-600/20 p-5 rounded-3xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block leading-none">Ready Payout</span>
                <span className="text-xl font-mono font-black text-white">$1,220.00</span>
              </div>
            </div>

            {/* Payout forms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 bg-[#0C0F22] border border-slate-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Direct Bank Withdrawal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Withdraw your cleared, released escrow payouts instantly to your connected bank node. Settlements are processed within 45 minutes on business cycles.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={() => alert("Withdrawal triggered! Your payout of $1,220.00 is being queued for bank transfer.")}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-mono font-black uppercase text-white cursor-pointer"
                  >
                    Withdraw Cleared Revenue
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-6 rounded-3xl text-left space-y-4">
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wide">Payout Credentials</h3>
                <div className="space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Account Tier</span>
                    <span className="text-white">Professional V2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Routing Stand</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Settlement Mode</span>
                    <span className="text-white">Paystack API Bank</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================== PAGE 7: PROPOSALS ================== */}
        {activePage === 'proposals' && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* REACT HELMET META */}
            <Helmet>
              <title>Job Proposals | CHIDON FREELANCE EARN</title>
              <meta name="description" content="View active contractor proposals, accept/decline bids, and verify talent credentials." />
            </Helmet>

            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Active Job Proposals</h2>
                <p className="text-[11px] text-slate-400">Monitor proposal stand and audit bid applications.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono uppercase tracking-widest border border-blue-500/20 font-bold">
                BID BOARD ✓
              </span>
            </div>

            {/* Proposal lists */}
            <div className="bg-[#0C0F22] border border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider">Your Submitted Proposals</h3>
              
              <div className="space-y-3">
                {proposals.map(p => (
                  <div key={p.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white uppercase">{p.jobTitle}</span>
                        <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">
                          {p.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Client Node: {p.client} | Bid Amount: <strong className="text-slate-300">${p.bidAmount}</strong> | Date: {p.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full border ${
                        p.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        p.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ---------------- DOWNBASE FOOTER ---------------- */}
      <footer className="border-t border-slate-900 bg-[#070913]/40 py-8 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            © 2026 CHIDON FREELANCE EARN. All escrow clearances are certified and protected by global vaults.
          </p>
        </div>
      </footer>

    </div>
  );
};
