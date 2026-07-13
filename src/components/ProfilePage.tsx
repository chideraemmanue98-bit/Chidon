import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Camera, Mail, Shield, Save, Briefcase, Award, 
  BookOpen, Globe, Cpu, CheckCircle, RefreshCw, Key,
  Zap, Layers, DollarSign, Clock, Check
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ensureFreelanceProfile } from './chidon-freelance/utils';
import { FreelanceProfile } from './chidon-freelance/types';

interface ProfilePageProps {
  currentUser: any;
  onTriggerAuth: () => void;
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  currentUser, 
  onTriggerAuth,
  onBack 
}) => {
  const [profile, setProfile] = useState<FreelanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Editable Form fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLang, setNewLang] = useState('');

  // Fetch / Sync profile from Firestore users collection
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Realtime snapshot listener to keep profile in perfect sync
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FreelanceProfile;
        setProfile(data);
        setFullName(data.fullName || data.username || '');
        setBio(data.bio || '');
        setUsername(data.username || '');
        setSkills(data.skills || []);
        setLanguages(data.languages || []);
        setLoading(false);
      } else {
        // Fallback: Ensure default profile is created
        try {
          const uProfile = await ensureFreelanceProfile(
            currentUser.uid,
            currentUser.email || '',
            currentUser.displayName || ''
          );
          if (uProfile) {
            setProfile(uProfile);
            setFullName(uProfile.fullName || uProfile.username || '');
            setBio(uProfile.bio || '');
            setUsername(uProfile.username || '');
            setSkills(uProfile.skills || []);
            setLanguages(uProfile.languages || []);
          }
        } catch (err) {
          console.error("Error ensuring profile:", err);
        } finally {
          setLoading(false);
        }
      }
    }, (error) => {
      console.error("Profile sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        username: username.trim(),
        skills,
        languages,
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = async () => {
    if (!currentUser?.uid || !profile) return;
    const newRole = profile.role === 'buyer' ? 'seller' : 'buyer';
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { role: newRole });
      setMessage({ type: 'success', text: `Switched mode to ${newRole.toUpperCase()} workspace!` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error("Role toggle error:", err);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addLang = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const removeLang = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw size={32} className="animate-spin text-brand mx-auto" />
        <p className="text-sm font-mono text-[var(--text-secondary)]">Loading User Intelligence Profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <User size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-[var(--text-primary)] uppercase">Authentication Required</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Sign in to unlock persistent cloud databases, active escrow contracts, customized script parameters, and direct-messaging channels.
          </p>
        </div>
        <button
          onClick={onTriggerAuth}
          className="w-full py-3 bg-brand hover:bg-brand/95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer hover:scale-102"
        >
          Authenticate Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Profile Overview Card */}
      <div className="card-base overflow-hidden relative border-2 border-[var(--border-base)] bg-[var(--bg-card)]">
        {/* Cover Photo */}
        <div className="h-32 md:h-44 bg-gradient-to-r from-brand via-cyan-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent)]" />
        </div>

        {/* Profile Header Details */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 mb-6 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-[var(--bg-card)] shadow-lg overflow-hidden bg-slate-900 relative group">
                <img 
                  src={profile?.avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.email}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center justify-center md:justify-start gap-2">
                  {profile?.fullName || currentUser.displayName || 'Anonymous'}
                  {profile?.isVerified && (
                    <CheckCircle size={16} className="text-cyan-400 fill-cyan-400/10" />
                  )}
                </h2>
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  @{profile?.username || currentUser.email?.split('@')[0]} • {currentUser.email}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleRoleToggle}
                className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-brand/15 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Briefcase size={12} />
                Switch to {profile?.role === 'buyer' ? 'Seller Mode' : 'Buyer Mode'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[var(--border-base)] pt-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-base)]/40 text-center flex flex-col justify-between min-h-[96px]">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Cognitive Credits</span>
                <span className="text-2xl font-black text-brand flex items-center justify-center gap-1 mt-1">
                  <Zap size={18} className="text-brand animate-pulse" />
                  {(profile as any)?.credits ?? 0}
                </span>
              </div>
              <span className="text-[8px] font-mono text-emerald-500 font-extrabold uppercase mt-1 tracking-wider block">
                +1 Free Daily Credit Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-base)]/40 text-center">
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Freelance Role</span>
              <span className="text-base font-black text-[var(--text-primary)] uppercase block mt-2">
                {profile?.role === 'seller' ? '💎 Freelance Seller' : '💼 Job Recruiter'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-base)]/40 text-center">
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Avg Rating</span>
              <span className="text-2xl font-black text-amber-500 block mt-1">
                ⭐ {profile?.rating ?? 5.0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-base)]/40 text-center">
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Total Earnings</span>
              <span className="text-2xl font-black text-emerald-500 block mt-1">
                ${profile?.earnings ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Forms column (Skills & Languages) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Skills Management */}
          <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-2">
              <Award size={15} className="text-brand" /> Skills & Tags
            </h3>

            {/* Display Skills */}
            <div className="flex flex-wrap gap-1.5">
              {skills.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic">No skills listed yet.</p>
              ) : (
                skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-base)]"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="text-red-500 hover:text-red-600 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Skill Field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Video Editing)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 input-base py-1.5 px-3 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 bg-brand text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-brand/90 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Languages Management */}
          <div className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-2">
              <Globe size={15} className="text-cyan-500" /> Languages
            </h3>

            {/* Display Languages */}
            <div className="flex flex-wrap gap-1.5">
              {languages.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic">No languages listed.</p>
              ) : (
                languages.map((lang) => (
                  <span 
                    key={lang} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-base)]"
                  >
                    {lang}
                    <button 
                      onClick={() => removeLang(lang)}
                      className="text-red-500 hover:text-red-600 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Language Field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add language (e.g. Spanish)"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                className="flex-1 input-base py-1.5 px-3 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addLang()}
              />
              <button
                type="button"
                onClick={addLang}
                className="px-3 bg-cyan-500 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-cyan-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right Forms column (Main Metadata Form) */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-2 card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] space-y-6">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-base)]/40 pb-2">
            <User size={15} className="text-brand" /> Edit Intelligence Bio & Identity
          </h3>

          {message && (
            <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
              <CheckCircle size={14} />
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Full Identity Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full input-base"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Freelance Handle / Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full input-base font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Professional Bio / Mission Statement</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full input-base h-28 resize-none leading-relaxed"
              placeholder="Tell other builders and recruiters what specialized cognitive tools you command."
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border-base)]/40 pt-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 border border-[var(--border-base)] text-[var(--text-primary)] font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer hover:scale-102 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
