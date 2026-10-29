import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {
  API_CONFIG,
  ADMIN_CONFIG,
  DEFAULT_MOVIE_PLAYERS,
  DEFAULT_TV_PLAYERS,
  DEFAULT_ANIME_PLAYERS
} from '../config';
import { AdminSettings, UserProfile } from '../types';

// Initialize Firebase App
if (!firebase.apps.length) {
  firebase.initializeApp(API_CONFIG.firebase || {});
}

export const auth = firebase.auth();
export const db = firebase.firestore();

// ── IMGBB UPLOAD ─────────────────────────────────────────────────────────────
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = API_CONFIG.imgbb?.apiKey || '';
  const uploadUrl = API_CONFIG.imgbb?.uploadUrl || 'https://api.imgbb.com/1/upload';
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${uploadUrl}?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Upload failed');
  return data.data.url;
}

// ── USER PROFILES ────────────────────────────────────────────────────────────
export async function loadUserProfile(uid: string): Promise<UserProfile> {
  try {
    const snap = await db.collection('users').doc(uid).get();
    if (snap.exists) return snap.data() as UserProfile;
  } catch (err) {
    console.warn('loadUserProfile error:', err);
  }
  return {};
}

export async function saveUserProfileToFirestore(uid: string, data: Partial<UserProfile>) {
  await db.collection('users').doc(uid).set(data, { merge: true });
}

// ── CUSTOM MEDIA URLS ────────────────────────────────────────────────────────
export function normalizeEmbed(raw: string): string {
  const t = (raw || '').trim();
  if (!t) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return `https://www.youtube.com/embed/${t}?autoplay=1`;
  const yt = t.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  if (/youtube\.com\/embed\//.test(t)) {
    return t.includes('autoplay') ? t : `${t}${t.includes('?') ? '&' : '?'}autoplay=1`;
  }
  const gd = t.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  const ar = t.match(/archive\.org\/details\/([^/?#]+)/);
  if (ar) return `https://archive.org/embed/${ar[1]}`;
  return t;
}

export async function loadMediaUrls(contentType: string, id: number): Promise<{ dlUrl: string; plUrl: string }> {
  try {
    if (!auth.currentUser) {
      await auth.signInAnonymously().catch(() => {});
    }
    const snap = await db.collection('media_urls').doc(`${contentType}_${id}`).get();
    if (snap.exists) {
      const data = snap.data();
      return {
        dlUrl: data?.downloadUrl || '',
        plUrl: data?.playerUrl || '',
      };
    }
  } catch (err) {
    console.warn('loadMediaUrls:', err);
  }
  return { dlUrl: '', plUrl: '' };
}

export async function saveMediaUrl(
  contentType: string,
  id: number,
  type: 'player' | 'download',
  value: string
) {
  const ref = db.collection('media_urls').doc(`${contentType}_${id}`);
  const key = type === 'player' ? 'playerUrl' : 'downloadUrl';
  const finalVal = type === 'player' ? normalizeEmbed(value) : value.trim();

  if (finalVal) {
    await ref.set({ [key]: finalVal }, { merge: true });
  } else {
    await ref.update({ [key]: firebase.firestore.FieldValue.delete() }).catch(() => {});
  }
  return finalVal;
}

// ── ADMIN SETTINGS ───────────────────────────────────────────────────────────
export async function loadAdminSettings(): Promise<AdminSettings> {
  const defaultSettings: AdminSettings = {
    iptv: 'https://iptv-org.github.io/iptv/index.m3u',
    fifa: '#',
    movies: 'https://kwvdnm.movielinkbd.li/',
    moviePlayers: [...DEFAULT_MOVIE_PLAYERS],
    tvPlayers: [...DEFAULT_TV_PLAYERS],
    animePlayers: [...DEFAULT_ANIME_PLAYERS],
    ltOrder: ['fifa', 'livetv', 'movies'],
  };

  try {
    if (!auth.currentUser) {
      await auth.signInAnonymously().catch(() => {});
    }
    const snap = await db.collection('admin_settings').doc('config').get();
    if (snap.exists) {
      const data = snap.data();
      if (data?.iptv !== undefined) defaultSettings.iptv = data.iptv;
      if (data?.fifa !== undefined) defaultSettings.fifa = data.fifa;
      if (data?.movies !== undefined) defaultSettings.movies = data.movies;
      if (data?.moviePlayers?.length) defaultSettings.moviePlayers = data.moviePlayers;
      if (data?.tvPlayers?.length) defaultSettings.tvPlayers = data.tvPlayers;
      if (data?.animePlayers?.length) defaultSettings.animePlayers = data.animePlayers;
      if (data?.ltOrder?.length) defaultSettings.ltOrder = data.ltOrder;
    }
  } catch (err) {
    console.warn('loadAdminSettings error:', err);
  }
  return defaultSettings;
}

export async function saveAdminSettings(settings: Partial<AdminSettings>) {
  await db.collection('admin_settings').doc('config').set(settings, { merge: true });
}

export function subscribeDragSetting(callback: (enabled: boolean) => void) {
  try {
    return db
      .collection('gtcConfig')
      .doc('settings')
      .onSnapshot((doc) => {
        if (doc.exists && doc.data()?.dragEnabled === false) {
          callback(false);
        } else {
          callback(true);
        }
      });
  } catch (e) {
    console.warn('subscribeDragSetting error:', e);
    return () => {};
  }
}

export async function toggleGlobalDrag(enabled: boolean) {
  try {
    await db.collection('gtcConfig').doc('settings').set({ dragEnabled: enabled }, { merge: true });
  } catch (err) {
    console.warn('toggleGlobalDrag error:', err);
  }
}
