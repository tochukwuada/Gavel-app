import { useState, useEffect, useCallback } from 'react';
import { AUCTIONS, getTimeLeft } from '../data/auctions';
import { showToast } from '../components/Toast';

const PREFS_KEY = 'gavel:notif-prefs';
const LOG_KEY   = 'gavel:notif-log';
const FIRED_KEY = 'gavel:notif-fired';
export const NOTIF_EVENT = 'gavel:notif-changed';

function readPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); }
  catch { return {}; }
}
function readLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}
function writeLog(data) {
  localStorage.setItem(LOG_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(NOTIF_EVENT));
}
function readFired() {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || '{}'); }
  catch { return {}; }
}

export function getPrefsFor(auctionId) {
  return readPrefs()[auctionId] || { h24: true, h1: true, m15: true, outbid: false };
}

export function savePrefsFor(auctionId, prefs) {
  const all = readPrefs();
  all[auctionId] = prefs;
  localStorage.setItem(PREFS_KEY, JSON.stringify(all));
}

export function useNotifications() {
  const [log, setLog] = useState(readLog);

  useEffect(() => {
    const sync = () => setLog(readLog());
    window.addEventListener(NOTIF_EVENT, sync);
    return () => window.removeEventListener(NOTIF_EVENT, sync);
  }, []);

  const unreadCount = log.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    writeLog(readLog().map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    writeLog([]);
  }, []);

  return { log, unreadCount, markAllRead, clearAll };
}

function pushNotif(auctionId, auctionName, message, type) {
  const existing = readLog();
  const entry = {
    id: `${auctionId}-${Date.now()}`,
    auctionId,
    auctionName,
    message,
    timestamp: Date.now(),
    read: false,
  };
  writeLog([entry, ...existing].slice(0, 50));
  showToast(message, type);
}

export function useNotificationChecker(watchlist) {
  useEffect(() => {
    if (!watchlist || watchlist.length === 0) return;

    const H24 = 24 * 60 * 60 * 1000;
    const H1  = 60 * 60 * 1000;
    const M15 = 15 * 60 * 1000;

    const check = () => {
      const prefs = readPrefs();
      const fired = readFired();
      let didFire = false;

      for (const id of watchlist) {
        const auction = AUCTIONS.find(a => a.id === id);
        if (!auction) continue;
        const p = prefs[id];
        if (!p) continue;
        const tl = getTimeLeft(auction);
        const f = fired[id] || {};
        const next = { ...f };

        if (p.h24 && !f.h24 && tl > 0 && tl <= H24 && tl > H1) {
          pushNotif(id, auction.name, `⏰ ${auction.name} closes in 24 hours`, 'warning');
          next.h24 = true; didFire = true;
        }
        if (p.h1 && !f.h1 && tl > 0 && tl <= H1 && tl > M15) {
          pushNotif(id, auction.name, `🔔 ${auction.name} closes in 1 hour — don’t miss it!`, 'warning');
          next.h1 = true; didFire = true;
        }
        if (p.m15 && !f.m15 && tl > 0 && tl <= M15) {
          pushNotif(id, auction.name, `🚨 ${auction.name} closing in 15 minutes!`, 'outbid');
          next.m15 = true; didFire = true;
        }

        fired[id] = next;
      }

      if (didFire) localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
    };

    check();
    const iv = setInterval(check, 60 * 1000);
    return () => clearInterval(iv);
  }, [watchlist]);
}
