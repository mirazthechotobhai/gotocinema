import React, { useState, useEffect } from 'react';
import { auth, uploadToImgBB, loadUserProfile, saveUserProfileToFirestore } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onOpenAdmin,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isDragEnabled, setIsDragEnabled] = useState(true);

  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' | '' }>({
    text: '',
    type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && !user.isAnonymous) {
        loadUserProfile(user.uid).then((p) => {
          setUserProfile(p);
          setEditName(p.displayName || user.displayName || '');
          setEditBio(p.bio || '');
        });
      }
    });

    const drag = localStorage.getItem('gtc_drag_enabled');
    setIsDragEnabled(drag !== 'off');

    return () => unsub();
  }, [isOpen]);

  const toggleDrag = () => {
    const next = !isDragEnabled;
    setIsDragEnabled(next);
    localStorage.setItem('gtc_drag_enabled', next ? 'on' : 'off');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: 'Please wait...', type: '' });
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        let photoUrl = '';

        if (avatarFile) {
          setMessage({ text: 'Uploading avatar image...', type: '' });
          try {
            photoUrl = await uploadToImgBB(avatarFile);
          } catch (pe) {
            console.warn('Avatar upload failed:', pe);
          }
        }

        if (cred.user) {
          await cred.user.updateProfile({
            displayName: displayName || email.split('@')[0],
            photoURL: photoUrl || undefined,
          });
          await saveUserProfileToFirestore(cred.user.uid, {
            displayName: displayName || email.split('@')[0],
            photoUrl,
            bio: '',
          });
        }
        setMessage({ text: 'Account created! Welcome!', type: 'ok' });
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        setMessage({ text: 'Signed in successfully!', type: 'ok' });
      }

      setTimeout(() => {
        setMessage({ text: '', type: '' });
        if (isAdmin) {
          onClose();
          onOpenAdmin();
        }
      }, 700);
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication error.', type: 'err' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setMessage({ text: 'Saving profile...', type: '' });

    try {
      await currentUser.updateProfile({ displayName: editName });
      await saveUserProfileToFirestore(currentUser.uid, {
        displayName: editName,
        bio: editBio,
      });
      setUserProfile((prev) => ({ ...prev, displayName: editName, bio: editBio }));
      setMessage({ text: '✓ Profile updated!', type: 'ok' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2500);
    } catch (err: any) {
      setMessage({ text: `Failed: ${err.message}`, type: 'err' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setMessage({ text: 'Uploading photo...', type: '' });

    try {
      const url = await uploadToImgBB(file);
      await currentUser.updateProfile({ photoURL: url });
      await saveUserProfileToFirestore(currentUser.uid, { photoUrl: url });
      setUserProfile((prev) => ({ ...prev, photoUrl: url }));
      setMessage({ text: '✓ Photo updated!', type: 'ok' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2500);
    } catch (err: any) {
      setMessage({ text: `Upload failed: ${err.message}`, type: 'err' });
    }
  };

  if (!isOpen) return null;

  const isUserLoggedIn = currentUser && !currentUser.isAnonymous;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0a0d18] border border-white/10 rounded-2xl p-6 relative shadow-2xl text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-white text-lg"
        >
          ✕
        </button>

        {isUserLoggedIn ? (
          /* User Profile Panel */
          <div>
            <div className="flex flex-col items-center text-center mb-4">
              <label className="relative group cursor-pointer mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {userProfile.photoUrl || currentUser.photoURL ? (
                  <img
                    src={userProfile.photoUrl || currentUser.photoURL}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-2 border-red-500/40"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-2xl font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold transition-opacity">
                  Change
                </div>
              </label>

              <div className="text-base font-bold text-gray-100">
                {userProfile.displayName || currentUser.displayName || currentUser.email}
              </div>
              <div className="text-xs text-gray-400">{currentUser.email}</div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                  isAdmin ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                }`}
              >
                {isAdmin ? '✓ Admin' : '● Member'}
              </span>
            </div>

            {/* Profile Fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Short bio..."
                  className="w-full bg-[#111827] border border-white/10 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSubmitting}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                Save Profile
              </button>
            </div>

            {/* Draggable Buttons Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-white/10 mb-4">
              <span className="text-xs text-gray-300">Draggable Nav Buttons</span>
              <button
                onClick={toggleDrag}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  isDragEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {isDragEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Admin Panel button if admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full py-2 mb-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-colors"
              >
                Open Admin Panel
              </button>
            )}

            {/* Logout */}
            <button
              onClick={async () => {
                await auth.signOut();
                onClose();
              }}
              className="w-full py-2 bg-[#111827] hover:bg-gray-800 border border-white/10 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Login & Signup Form */
          <div>
            <h2 className="text-lg font-extrabold text-center mb-1">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-gray-500 text-center mb-4">
              Sign in to manage your favorites and settings
            </p>

            {/* Mode Tabs */}
            <div className="flex p-0.5 bg-[#111827] border border-white/10 rounded-lg mb-4">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMode === 'login' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMode === 'signup' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Profile Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          const reader = new FileReader();
                          reader.onload = (re) => setAvatarPreview(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                    />
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover mt-2 border border-red-500/40"
                      />
                    )}
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder={authMode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* Message notification */}
        {message.text && (
          <div
            className={`text-center text-xs mt-3 font-semibold ${
              message.type === 'err'
                ? 'text-red-400'
                : message.type === 'ok'
                ? 'text-green-400'
                : 'text-amber-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
