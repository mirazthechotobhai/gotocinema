import React, { useState, useEffect } from 'react';
import { ADMIN_CONFIG } from '../config';

interface FloatingButtonsProps {
  currentUser: any;
  isAdmin: boolean;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  currentUser,
  isAdmin,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const photo = isAdmin
    ? ADMIN_CONFIG.profile?.imageUrl
    : currentUser?.photoURL;
  const initial = (
    isAdmin
      ? ADMIN_CONFIG.profile?.name || 'A'
      : currentUser?.displayName || currentUser?.email || 'U'
  )
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* Account / Admin Trigger Button (Bottom Left) */}
      <button
        onClick={() => {
          if (isAdmin) onOpenAdmin();
          else onOpenAuth();
        }}
        title={isAdmin ? 'Admin Panel' : currentUser ? 'My Account' : 'Login / Sign Up'}
        className={`fixed left-5 bottom-5 w-11 h-11 rounded-full z-[999] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 overflow-hidden ${
          isAdmin ? 'bg-green-600' : 'bg-[#333] hover:bg-[#444]'
        }`}
      >
        {currentUser && !currentUser.isAnonymous ? (
          photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-extrabold text-white">{initial}</span>
          )
        ) : (
          <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
            <path
              opacity="0.4"
              d="M12 22.01C17.52 22.01 22 17.53 22 12.01C22 6.49 17.52 2.01 12 2.01C6.48 2.01 2 6.49 2 12.01C2 17.53 6.48 22.01 12 22.01Z"
            />
            <path d="M12 6.94C9.93 6.94 8.25 8.62 8.25 10.69C8.25 12.72 9.84 14.37 11.95 14.43C11.98 14.43 12.02 14.43 12.04 14.43C12.06 14.43 12.09 14.43 12.11 14.43C14.15 14.36 15.74 12.72 15.75 10.69C15.75 8.62 14.07 6.94 12 6.94Z" />
            <path d="M18.78 19.36C17 21 14.62 22.01 12 22.01C9.38 22.01 7 21 5.22 19.36C5.46 18.45 6.11 17.62 7.06 16.98C9.79 15.16 14.23 15.16 16.94 16.98C17.9 17.62 18.54 18.45 18.78 19.36Z" />
          </svg>
        )}
      </button>

      {/* Scroll to Top Button (Bottom Right) */}
      <button
        onClick={scrollToTop}
        title="Scroll to Top"
        className={`fixed right-5 bottom-5 w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white z-[999] flex items-center justify-center shadow-lg transition-all duration-300 ${
          showScrollTop
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-75 invisible pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
};
