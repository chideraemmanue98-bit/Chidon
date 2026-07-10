import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Camera, Plus, Trash, Save, Briefcase, Award, 
  BookOpen, Globe, Cpu, CheckCircle, Video, Upload, Layers
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FreelanceProfile, PortfolioProject } from './types';
import { convertFileToBase64, handleFirestoreError, OperationType } from './utils';

interface UserProfileViewProps {
  profile: FreelanceProfile;
  onProfileUpdate: (updated: FreelanceProfile) => void;
  onBack: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ 
  profile, 
  onProfileUpdate, 
  onBack 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  
  // Skills, Languages, Edu, Certs inputs
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const [languages, setLanguages] = useState<string[]>(profile.languages || []);
  const [newLang, setNewLang] = useState('');

  const [education, setEducation] = useState<string[]>(profile.education || []);
  const [newEdu, setNewEdu] = useState('');

  const [certifications, setCertifications] = useState<string[]>(profile.certifications || []);
  const [newCert, setNewCert] = useState('');

  // Portfolio items
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(profile.portfolio || []);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projVideo, setProjVideo] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const [saving, setSaving] = useState(false);

  // Role toggle
  const handleRoleToggle = async () => {
    const newRole = profile.role === 'buyer' ? 'seller' : 'buyer';
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { role: newRole });
      onProfileUpdate({ ...profile, role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  // Image Upload handlers
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { avatarURL: base64 });
      onProfileUpdate({ ...profile, avatarURL: base64 });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { coverURL: base64 });
      onProfileUpdate({ ...profile, coverURL: base64 });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const base64 = await convertFileToBase64(e.target.files[0]);
      setProjImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item array helpers
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

  const addEdu = () => {
    if (newEdu.trim() && !education.includes(newEdu.trim())) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu('');
    }
  };

  const removeEdu = (edu: string) => {
    setEducation(education.filter(e => e !== edu));
  };

  const addCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCert = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  // Portfolio addition
  const handleAddProject = () => {
    if (!projTitle.trim() || !projDesc.trim() || !projImage) return;
    
    const newProj: PortfolioProject = {
      id: Date.now().toString(),
      title: projTitle.trim(),
      description: projDesc.trim(),
      imageUrl: projImage,
      videoUrl: projVideo.trim() || undefined
    };

    const updatedPortfolio = [...portfolio, newProj];
    setPortfolio(updatedPortfolio);
    setProjTitle('');
    setProjDesc('');
    setProjImage('');
    setProjVideo('');
    setIsAddingProject(false);
  };

  const removeProject = (id: string) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  // Save changes
  const saveProfile = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const updateData = {
        fullName,
        bio,
        skills,
        languages,
        education,
        certifications,
        portfolio
      };
      await updateDoc(userRef, updateData);
      onProfileUpdate({ ...profile, ...updateData });
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Current View Role:</span>
          <button
            onClick={handleRoleToggle}
            className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
          >
            <Layers size={13} />
            Switch to {profile.role === 'buyer' ? 'Seller' : 'Buyer'} Mode
          </button>
        </div>
      </div>

      {/* Cover and Profile Intro */}
      <div className="relative rounded-3xl bg-slate-900 overflow-hidden border border-slate-800">
        <div className="h-48 md:h-64 w-full relative group">
          <img 
            src={profile.coverURL} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80"
          />
          <label className="absolute right-4 bottom-4 p-2 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-all border border-slate-700 cursor-pointer shadow-lg">
            <Camera size={16} />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCoverChange} 
            />
          </label>
        </div>

        <div className="px-6 pb-6 pt-1 md:pt-4 flex flex-col md:flex-row gap-6 items-start md:items-end relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-950 border-4 border-slate-900 relative group overflow-hidden -mt-12 md:-mt-16 shadow-2xl">
            <img 
              src={profile.avatarURL} 
              alt={profile.fullName} 
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer">
              <Camera size={20} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange} 
              />
            </label>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white">{profile.fullName || profile.username}</h2>
              {profile.isVerified && (
                <CheckCircle size={18} className="text-emerald-400 fill-emerald-400/10" />
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                {profile.role}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">@{profile.username}</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-brand/20 cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-brand/20"
                >
                  {saving ? 'Saving...' : <><Save size={13} /> Save</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Stats and Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats and metadata */}
        <div className="space-y-6">
          
          {/* Seller Status Display */}
          {profile.role === 'seller' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Briefcase size={14} className="text-brand" /> Seller Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/40 text-center">
                  <div className="text-lg font-black text-white">{profile.totalOrders}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Total Orders</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/40 text-center">
                  <div className="text-lg font-black text-emerald-400">★ {profile.rating.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Rating Score</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/40 text-center">
                  <div className="text-sm font-black text-white">{profile.responseTime}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Response Speed</div>
                </div>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/40 text-center">
                  <div className="text-lg font-black text-cyan-400">{profile.onTimeDelivery}%</div>
                  <div className="text-[10px] text-slate-500 font-mono">On-Time Delivery</div>
                </div>
              </div>
            </div>
          )}

          {/* Languages & Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Globe size={14} className="text-brand" /> Languages
              </h3>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  placeholder="Add Language..." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
                <button 
                  onClick={addLang}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span 
                  key={lang} 
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
                >
                  {lang}
                  {isEditing && (
                    <button onClick={() => removeLang(lang)} className="text-slate-500 hover:text-red-400">
                      ×
                    </button>
                  )}
                </span>
              ))}
              {languages.length === 0 && (
                <div className="text-xs text-slate-600 font-mono">No languages added yet</div>
              )}
            </div>
          </div>

          {/* Core Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu size={14} className="text-brand" /> Core Skills
            </h3>

            {isEditing && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add Skill..." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
                <button 
                  onClick={addSkill}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
                >
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400">
                      ×
                    </button>
                  )}
                </span>
              ))}
              {skills.length === 0 && (
                <div className="text-xs text-slate-600 font-mono">No skills specified</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Bio, Education, Certs, Portfolio */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Bio Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Professional Biography
            </h3>
            
            {!isEditing ? (
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {profile.bio || 'Provide a compelling introduction describing your focus, background, and approach to freelance projects.'}
              </p>
            ) : (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Share your details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-brand placeholder:text-slate-700"
              />
            )}
          </div>

          {/* Education & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Education */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen size={14} className="text-brand" /> Education
              </h3>

              {isEditing && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newEdu}
                    onChange={(e) => setNewEdu(e.target.value)}
                    placeholder="E.g. BSc Computer Science" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={addEdu}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {education.map((edu) => (
                  <div 
                    key={edu} 
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>{edu}</span>
                    {isEditing && (
                      <button onClick={() => removeEdu(edu)} className="text-slate-500 hover:text-red-400">
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {education.length === 0 && (
                  <div className="text-xs text-slate-600 font-mono">No educational items specified</div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award size={14} className="text-brand" /> Certifications
              </h3>

              {isEditing && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="E.g. AWS Solutions Architect" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={addCert}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div 
                    key={cert} 
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>{cert}</span>
                    {isEditing && (
                      <button onClick={() => removeCert(cert)} className="text-slate-500 hover:text-red-400">
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {certifications.length === 0 && (
                  <div className="text-xs text-slate-600 font-mono">No certifications added yet</div>
                )}
              </div>
            </div>

          </div>

          {/* Portfolio section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers size={14} className="text-brand" /> Portfolio Projects ({portfolio.length})
              </h3>
              
              {isEditing && !isAddingProject && (
                <button
                  onClick={() => setIsAddingProject(true)}
                  className="px-3 py-1.5 bg-brand text-white text-[10px] font-mono font-black uppercase rounded-lg flex items-center gap-1"
                >
                  <Plus size={12} /> Add Project
                </button>
              )}
            </div>

            {/* Project Creator Form */}
            {isAddingProject && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider">New Portfolio Item</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Project Title</label>
                    <input 
                      type="text" 
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="Enter project name..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Video URL (Optional)</label>
                    <input 
                      type="text" 
                      value={projVideo}
                      onChange={(e) => setProjVideo(e.target.value)}
                      placeholder="Youtube or Loom link..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Project Description</label>
                  <textarea 
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Write a clear description of the project deliverables..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Project Screenshot / Deliverable</label>
                  <div className="flex items-center gap-4">
                    {projImage ? (
                      <div className="w-16 h-16 rounded-xl border border-slate-800 overflow-hidden relative">
                        <img src={projImage} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setProjImage('')}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-24 h-24 border border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors">
                        <Upload size={18} className="text-slate-500 mb-1" />
                        <span className="text-[9px] font-mono text-slate-500">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProjectImageUpload} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddProject}
                    disabled={!projTitle || !projDesc || !projImage}
                    className="px-4 py-1.5 bg-brand text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            )}

            {/* List of projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group flex flex-col h-full"
                >
                  <div className="h-40 w-full relative">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isEditing && (
                      <button 
                        onClick={() => removeProject(project.id)}
                        className="absolute right-3 top-3 p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition-all cursor-pointer shadow-lg"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-white">{project.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-3">{project.description}</p>
                    </div>

                    {project.videoUrl && (
                      <a 
                        href={project.videoUrl} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="text-[10px] font-mono text-brand flex items-center gap-1 hover:underline"
                      >
                        <Video size={10} /> Watch project video walkthrough
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {portfolio.length === 0 && (
                <div className="col-span-2 text-center py-10 bg-slate-950 border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <Layers size={24} className="text-slate-600 mx-auto" />
                  <div className="text-xs text-slate-500 font-mono">No portfolio projects added yet.</div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
