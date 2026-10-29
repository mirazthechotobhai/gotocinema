import React, { useEffect, useState } from 'react';
import { PersonDetails, MediaItem } from '../types';
import { fetchPerson, avatarUrl, imgUrl, getTitle, getYear, typeBg, typeLabel } from '../services/api';

interface PersonModalProps {
  personId: number | null;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  personId,
  onClose,
  onSelectMedia,
}) => {
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [works, setWorks] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!personId) return;
    setIsLoading(true);
    fetchPerson(personId)
      .then(({ details, works }) => {
        setPerson(details);
        setWorks(works);
      })
      .catch((err) => console.warn('Person fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [personId]);

  if (!personId) return null;

  return (
    <div className="fixed inset-0 z-[9500] bg-[#070d1a] overflow-y-auto text-[#e2e8f0]">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[9600] w-10 h-10 rounded-full bg-slate-900/95 border border-white/20 hover:bg-red-600 text-white flex items-center justify-center transition-colors text-lg"
      >
        ✕
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : person ? (
        <div className="max-w-6xl mx-auto pb-12">
          {/* Hero Header */}
          <div className="flex items-start gap-5 p-6 md:p-8 bg-gradient-to-b from-red-600/10 to-transparent">
            {person.profile_path ? (
              <img
                src={avatarUrl(person.profile_path, 'w185')}
                alt={person.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shrink-0 border-3 border-red-500/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border-3 border-red-500/50">
                <svg className="w-12 h-12 text-gray-400 stroke-current fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold text-[#f1f5f9] mb-1.5">
                {person.name}
              </h1>
              {person.known_for_department && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-300 border border-red-600/30">
                  {person.known_for_department}
                </span>
              )}
            </div>
          </div>

          {/* Biography */}
          {person.biography && (
            <div className="px-6 md:px-8 pb-6 text-sm text-gray-300 leading-relaxed border-b border-white/5">
              {person.biography.slice(0, 800)}
              {person.biography.length > 800 ? '...' : ''}
            </div>
          )}

          {/* Works Grid */}
          <div className="px-6 md:px-8 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">All Works</h2>
              <span className="text-xs text-gray-400">{works.length} titles</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {works.map((w, idx) => {
                const rating = w.vote_average ? w.vote_average.toFixed(1) : '';
                return (
                  <div
                    key={`${w.id}-${idx}`}
                    onClick={() => {
                      onClose();
                      onSelectMedia(w);
                    }}
                    className="bg-[#181818] rounded-md overflow-hidden cursor-pointer relative flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all group"
                  >
                    <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#111]">
                      <img
                        src={imgUrl(w.poster_path, 'w342')}
                        alt={getTitle(w)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className="absolute top-1.5 left-1.5 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase z-10"
                        style={{ background: typeBg(w.contentType) }}
                      >
                        {typeLabel(w.contentType)}
                      </span>
                      {rating && (
                        <span className="absolute top-1.5 right-1.5 bg-black/75 text-[#f5c518] text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                          ★ {rating}
                        </span>
                      )}
                    </div>
                    <div className="p-2 flex flex-col justify-between flex-1">
                      <div className="text-[11px] font-bold text-gray-200 line-clamp-2 leading-tight">
                        {getTitle(w)}
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">{getYear(w)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
