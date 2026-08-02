import { useState } from 'react';
import { X, Send, User, MessageSquare, Loader2, Image as ImageIcon } from 'lucide-react';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  postTitle: string;
  postPrice: string | number;
  onSend: (initialMessage: string, imageFile: File | null) => Promise<void>;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  postTitle,
  postPrice,
  onSend
}) => {
  const [messageText, setMessageText] = useState<string>(
    `Hello ${sellerName}, I am interested in your listing: "${postTitle}" (${postPrice}). Is this still available?`
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await onSend(messageText, selectedFile);
      onClose();
    } catch (err: any) {
      console.error('[NewMessageModal] Start connection failed:', err);
      setError(err.message || 'Failed to start transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8 animate-fade-in">
        
        {/* HEADER */}
        <div className="p-4 bg-[var(--bg-app)] border-b border-[var(--border-base)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-brand" size={18} />
            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">
              Initialize Deal Negotiation
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Post Summary Indicator Card */}
          <div className="p-3 bg-brand/5 border border-brand/10 rounded-xl space-y-1">
            <span className="text-[9px] font-mono font-black text-brand uppercase tracking-widest">
              Listing Context
            </span>
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
              {postTitle}
            </p>
            <p className="text-xs font-black text-brand font-mono">
              {postPrice}
            </p>
          </div>

          {/* Seller Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
            <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/10">
              <User size={10} />
            </div>
            <span>Sending to: <strong className="text-brand">{sellerName}</strong></span>
          </div>

          {/* Error Message */}
          {error && (
            <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-semibold leading-relaxed">
              ⚠️ {error}
            </p>
          )}

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Introductory Message
            </label>
            <textarea
              rows={4}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Formulate your initial proposal or ask if it is still available..."
              className="w-full p-3.5 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70 resize-none leading-relaxed"
            />
          </div>

          {/* Image Attachment Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Add Deal Asset / Image Proof (Optional)
            </label>
            
            {filePreview ? (
              <div className="flex items-center gap-3 p-2 border border-brand/10 rounded-xl bg-brand/5 max-w-sm relative">
                <img 
                  src={filePreview} 
                  alt="Attachment preview" 
                  className="w-12 h-12 rounded-lg object-cover border border-black/5 bg-black/5"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[var(--text-primary)] block truncate">
                    {selectedFile?.name}
                  </span>
                  <span className="text-[9px] font-medium text-[var(--text-secondary)] block">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearFileSelection}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--border-base)] hover:border-brand/30 rounded-xl bg-gray-50/20 dark:bg-gray-800/5 cursor-pointer text-xs text-[var(--text-secondary)] font-semibold hover:text-[var(--text-primary)] transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <ImageIcon size={14} className="text-brand" />
                Attach Photo Reference
              </label>
            )}
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800/40 hover:bg-gray-200 dark:hover:bg-gray-800 text-[11px] font-bold uppercase tracking-wider border border-[var(--border-base)]/40 rounded-xl transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !messageText.trim()}
              className="px-4 py-2 bg-brand hover:bg-brand/90 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Connect & Chat
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
