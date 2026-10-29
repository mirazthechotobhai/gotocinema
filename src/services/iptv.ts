import { IPTVChannel } from '../types';

const PROXY = 'https://corsproxy.io/?';
const DEFAULT_M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';
const API_BASE = 'https://iptv-org.github.io/api';
const CACHE_KEY = 'gtc_iptv_cache_v3';
const CACHE_TTL = 6 * 3600 * 1000;

export async function fetchM3UPlaylist(m3uUrl = DEFAULT_M3U_URL): Promise<IPTVChannel[]> {
  // Check cache first
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL && parsed.channels?.length) {
        return parsed.channels;
      }
    }
  } catch (err) {}

  let m3uText = '';
  try {
    const res = await fetch(m3uUrl);
    if (!res.ok) throw new Error();
    m3uText = await res.text();
  } catch {
    try {
      const res = await fetch(PROXY + encodeURIComponent(m3uUrl));
      if (!res.ok) throw new Error();
      m3uText = await res.text();
    } catch (err) {
      console.warn('Failed to fetch M3U playlist', err);
      return [];
    }
  }

  // Also try to fetch channels info for missing country/logo
  let channelMap: Record<string, { country: string }> = {};
  try {
    const res = await fetch(`${API_BASE}/channels.json`);
    if (res.ok) {
      const arr = await res.json();
      arr.forEach((c: any) => {
        if (c.id) channelMap[c.id] = { country: c.country || '' };
      });
    }
  } catch {}

  const channels = parseM3U(m3uText);
  enrichChannels(channels, channelMap);

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ channels, ts: Date.now() })
    );
  } catch {}

  return channels;
}

function parseM3U(text: string): IPTVChannel[] {
  const lines = text.split('\n');
  const channels: IPTVChannel[] = [];
  let meta: any = null;
  let id = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const name = line.includes(',') ? line.split(',').slice(1).join(',').trim() : 'Unknown';
      const logo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
      const group = (line.match(/group-title="([^"]*)"/) || [])[1] || 'General';
      const country = (line.match(/tvg-country="([^"]*)"/) || [])[1] || '';
      const tvgId = (line.match(/tvg-id="([^"]*)"/) || [])[1] || '';
      meta = { name, logo, group, country, tvgId };
    } else if (meta && !line.startsWith('#')) {
      channels.push({
        id: id++,
        name: meta.name,
        logo: meta.logo,
        group: meta.group,
        country: meta.country,
        tvgId: meta.tvgId,
        url: line,
      });
      meta = null;
    }
  }
  return channels;
}

function enrichChannels(channels: IPTVChannel[], channelMap: Record<string, { country: string }>) {
  channels.forEach((ch) => {
    const info = ch.tvgId ? channelMap[ch.tvgId] : null;
    if (info && !ch.country && info.country) {
      ch.country = info.country;
    }
  });
}
