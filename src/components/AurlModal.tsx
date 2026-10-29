import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { saveMediaUrl, loadMediaUrls } from '../services/firebase';

interface AurlModalProps {
  type: 'player' | 'download' | null;
  item: MediaItem | null;
  onClose: () => void;
  onSuccess: (type: 'player' | 'download', value: string) => void;
}

export const AurlModal: React.FC<AurlModalProps> = ({
  type,
  item,
  onClose,
  onSuccess,
}) => {
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!type || !item) return;
    loadMediaUrls(item.contentType, item.id).then(({ dlUrl, plUrl }) => {
      setValue(type === 'player' ? plUrl : dlUrl);
    });
  }, [type, item]);

  if (!type || !item) return null;

  const isPlayer = type === 'player';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await saveMediaUrl(item.contentType, item.id, type, value);
      onSuccess(type, saved);
      onClose();
    } catch (err) {
      console.warn('Save Aurl failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await saveMediaUrl(item.contentType, item.id, type, '');
      onSuccess(type, '');
      setValue('');
      onClose();
    } catch (err) {
      console.warn('Clear Aurl failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[11001] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d1120] border border-[#2a3a55] rounded-xl p-5 relative text-[#e2e8f0] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-base"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-1.5">
          {isPlayer ? (
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          <span>{isPlayer ? 'Edit Custom Player URL' : 'Edit Download URL'}</span>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
          {isPlayer
            ? 'Supports YouTube link or 11-char ID, Google Drive, Archive.org, or any custom embed URL (auto-converts).'
            : 'Enter the direct download link for this title:'}
        </p>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            isPlayer ? 'YouTube URL / ID / Drive / Archive / embed URL...' : 'https://...'
          }
          className="w-full bg-[#0a0d18] border border-[#2a3a55] focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="px-4 py-2 bg-[#1a0505] hover:bg-[#2a0505] border border-red-950 text-red-400 font-semibold rounded-lg text-xs transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
