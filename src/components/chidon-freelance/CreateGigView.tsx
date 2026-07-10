import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Trash, Save, Info, Zap, Upload, Eye, FileText, CheckCircle
} from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Gig, PricePackage, FAQItem, FreelanceProfile } from './types';
import { convertFileToBase64, handleFirestoreError, OperationType } from './utils';

interface CreateGigViewProps {
  profile: FreelanceProfile;
  editingGig?: Gig;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateGigView: React.FC<CreateGigViewProps> = ({ 
  profile, 
  editingGig, 
  onSuccess, 
  onCancel 
}) => {
  const [title, setTitle] = useState(editingGig?.title || '');
  const [description, setDescription] = useState(editingGig?.description || '');
  const [category, setCategory] = useState<Gig['category']>(editingGig?.category || 'Programming');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingGig?.tags || []);
  const [requirements, setRequirements] = useState(editingGig?.requirements || '');
  const [images, setImages] = useState<string[]>(editingGig?.images || []);

  // Pricing Packages state
  const defaultPackage = (price: number, delivery: number): PricePackage => ({
    title: '',
    description: '',
    deliveryTime: delivery,
    revisions: 3,
    price: price,
    features: []
  });

  const [basicPkg, setBasicPkg] = useState<PricePackage>(
    editingGig?.packages.basic || defaultPackage(15, 3)
  );
  const [standardPkg, setStandardPkg] = useState<PricePackage>(
    editingGig?.packages.standard || defaultPackage(45, 5)
  );
  const [premiumPkg, setPremiumPkg] = useState<PricePackage>(
    editingGig?.packages.premium || defaultPackage(120, 7)
  );

  // FAQ items state
  const [faq, setFaq] = useState<FAQItem[]>(editingGig?.faq || []);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  const [saving, setSaving] = useState(false);

  // Upload handles
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploadedB64s: string[] = [];
    
    // Limit to 10 total images
    const remainingSlots = 10 - images.length;
    const filesToUpload = Array.from(e.target.files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      try {
        const b64 = await convertFileToBase64(file);
        uploadedB64s.push(b64);
      } catch (err) {
        console.error("Error converting file:", err);
      }
    }

    setImages([...images, ...uploadedB64s]);
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Tag list handles
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // FAQ handlers
  const handleAddFaq = () => {
    if (faqQuestion.trim() && faqAnswer.trim()) {
      setFaq([...faq, { question: faqQuestion.trim(), answer: faqAnswer.trim() }]);
      setFaqQuestion('');
      setFaqAnswer('');
      setIsAddingFaq(false);
    }
  };

  const removeFaq = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  // Pre-fill features helper
  const addFeatureToPackage = (pkg: 'basic' | 'standard' | 'premium', feat: string) => {
    if (!feat.trim()) return;
    if (pkg === 'basic') {
      setBasicPkg({ ...basicPkg, features: [...basicPkg.features, feat.trim()] });
    } else if (pkg === 'standard') {
      setStandardPkg({ ...standardPkg, features: [...standardPkg.features, feat.trim()] });
    } else {
      setPremiumPkg({ ...premiumPkg, features: [...premiumPkg.features, feat.trim()] });
    }
  };

  const removeFeatureFromPackage = (pkg: 'basic' | 'standard' | 'premium', idx: number) => {
    if (pkg === 'basic') {
      setBasicPkg({ ...basicPkg, features: basicPkg.features.filter((_, i) => i !== idx) });
    } else if (pkg === 'standard') {
      setStandardPkg({ ...standardPkg, features: standardPkg.features.filter((_, i) => i !== idx) });
    } else {
      setPremiumPkg({ ...premiumPkg, features: premiumPkg.features.filter((_, i) => i !== idx) });
    }
  };

  // Save / Post Form
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requirements.trim() || images.length === 0) {
      alert("Please complete all required fields and upload at least one gig image.");
      return;
    }

    setSaving(true);
    try {
      const gigData = {
        userId: profile.uid,
        sellerName: profile.fullName || profile.username,
        sellerAvatar: profile.avatarURL,
        sellerRating: profile.rating || 5,
        sellerLevel: profile.totalOrders > 15 ? 'Top Rated' : profile.totalOrders > 5 ? 'Level 2' : 'New',
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        images,
        packages: {
          basic: basicPkg,
          standard: standardPkg,
          premium: premiumPkg
        },
        faq,
        requirements: requirements.trim(),
        isPaused: editingGig?.isPaused || false,
        createdAt: editingGig?.createdAt || serverTimestamp()
      };

      if (editingGig?.id) {
        // Update
        const docRef = doc(db, 'gigs', editingGig.id);
        await setDoc(docRef, gigData, { merge: true });
      } else {
        // Create
        const collectionRef = collection(db, 'gigs');
        await addDoc(collectionRef, gigData);
      }

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'gigs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handlePublish} className="w-full max-w-5xl mx-auto space-y-8 pb-16 text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Zap className="text-brand" size={20} />
            {editingGig ? 'Modify Active Gig Service' : 'Create an Empire Freelance Gig'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">Fill out the gig particulars to broadcast your creative capability</p>
        </div>
        
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">1. Service Overview</div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Gig Title (Make it clear and active)</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="I will design your modern fullstack app using React and Tailwind..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-brand"
                maxLength={80}
                required
              />
              <div className="text-[10px] text-slate-500 text-right font-mono">{title.length}/80 characters max</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Gig['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                >
                  <option value="Graphics">Graphics & UI/UX Design</option>
                  <option value="Writing">Writing & Content Translation</option>
                  <option value="Video">Video, VFX & Animation</option>
                  <option value="Programming">Programming & Web Tech</option>
                  <option value="Marketing">Digital Marketing & SEO</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Search Tags (up to 5)</label>
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and hit Enter..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-brand"
                />
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {tags.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 flex items-center gap-1">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-slate-500 hover:text-red-400 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Gig Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">2. Service Description</div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Detail your offer thoroughly</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what value the buyer receives, your workflow, and what specifications you deliver..."
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-brand placeholder:text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Requirements from the buyer to start</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="E.g. Please provide your wireframes, logo assets, brand colors, and copy texts..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-brand placeholder:text-slate-700"
                required
              />
            </div>
          </div>

          {/* Section 3: Gallery Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">3. Project Showcase Gallery (up to 10 screenshots)</div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 group">
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-2 top-2 p-1.5 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}

              {images.length < 10 && (
                <label className="aspect-video border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-colors">
                  <Upload size={20} className="text-slate-500 mb-1" />
                  <span className="text-[10px] font-mono text-slate-500">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <Info size={12} /> Visual imagery acts as your primary point of conversion. Upload real samples of your deliverables.
            </div>
          </div>

          {/* Section 4: FAQ Setup */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">4. Frequently Asked Questions</div>
              {!isAddingFaq && (
                <button
                  type="button"
                  onClick={() => setIsAddingFaq(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[10px] font-mono uppercase font-bold"
                >
                  + Add FAQ
                </button>
              )}
            </div>

            {isAddingFaq && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <input 
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="Question: E.g., Do you provide source files?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <textarea 
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Answer: E.g., Yes, Figma source files are always included in Standard and Premium tiers."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingFaq(false)}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleAddFaq}
                    className="px-4 py-1.5 bg-brand text-white rounded-xl text-xs font-bold"
                  >
                    Save FAQ
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {faq.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-white">Q: {item.question}</div>
                    <p className="text-[11px] text-slate-400">A: {item.answer}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFaq(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: 3 Tier Packages */}
        <div className="space-y-6">
          
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1">5. Pricing & Packages</div>
          
          {/* Basic Package */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Basic Package</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-mono">$</span>
                <input 
                  type="number"
                  value={basicPkg.price}
                  onChange={(e) => setBasicPkg({ ...basicPkg, price: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none"
                  min={5}
                />
              </div>
            </div>

            <input 
              type="text"
              value={basicPkg.title}
              onChange={(e) => setBasicPkg({ ...basicPkg, title: e.target.value })}
              placeholder="Package Name: E.g. Bronze Starter Pack"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <textarea 
              value={basicPkg.description}
              onChange={(e) => setBasicPkg({ ...basicPkg, description: e.target.value })}
              placeholder="What deliverables are included? (e.g. 1 landing page, basic layout)"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Delivery Days</label>
                <input 
                  type="number"
                  value={basicPkg.deliveryTime}
                  onChange={(e) => setBasicPkg({ ...basicPkg, deliveryTime: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={1}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Revisions</label>
                <input 
                  type="number"
                  value={basicPkg.revisions}
                  onChange={(e) => setBasicPkg({ ...basicPkg, revisions: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={-1}
                />
              </div>
            </div>
          </div>

          {/* Standard Package */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full">Standard Package</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-mono">$</span>
                <input 
                  type="number"
                  value={standardPkg.price}
                  onChange={(e) => setStandardPkg({ ...standardPkg, price: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none"
                  min={5}
                />
              </div>
            </div>

            <input 
              type="text"
              value={standardPkg.title}
              onChange={(e) => setStandardPkg({ ...standardPkg, title: e.target.value })}
              placeholder="Package Name: E.g. Silver Growth Pack"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <textarea 
              value={standardPkg.description}
              onChange={(e) => setStandardPkg({ ...standardPkg, description: e.target.value })}
              placeholder="Describe deliverables: E.g. Complete 5 page functional website"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Delivery Days</label>
                <input 
                  type="number"
                  value={standardPkg.deliveryTime}
                  onChange={(e) => setStandardPkg({ ...standardPkg, deliveryTime: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={1}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Revisions</label>
                <input 
                  type="number"
                  value={standardPkg.revisions}
                  onChange={(e) => setStandardPkg({ ...standardPkg, revisions: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={-1}
                />
              </div>
            </div>
          </div>

          {/* Premium Package */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">Premium Package</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-mono">$</span>
                <input 
                  type="number"
                  value={premiumPkg.price}
                  onChange={(e) => setPremiumPkg({ ...premiumPkg, price: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none"
                  min={5}
                />
              </div>
            </div>

            <input 
              type="text"
              value={premiumPkg.title}
              onChange={(e) => setPremiumPkg({ ...premiumPkg, title: e.target.value })}
              placeholder="Package Name: E.g. Ultimate Enterprise Solution"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <textarea 
              value={premiumPkg.description}
              onChange={(e) => setPremiumPkg({ ...premiumPkg, description: e.target.value })}
              placeholder="Complete high-end deliverables: E.g. API backend, DB, custom graphics"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-700 focus:outline-none"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Delivery Days</label>
                <input 
                  type="number"
                  value={premiumPkg.deliveryTime}
                  onChange={(e) => setPremiumPkg({ ...premiumPkg, deliveryTime: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={1}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Revisions</label>
                <input 
                  type="number"
                  value={premiumPkg.revisions}
                  onChange={(e) => setPremiumPkg({ ...premiumPkg, revisions: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  min={-1}
                />
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer shadow-lg hover:shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {saving ? 'Publishing Gig to Network...' : 'Publish Active Gig'}
          </button>

        </div>

      </div>

    </form>
  );
};
