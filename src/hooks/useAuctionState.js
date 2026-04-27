import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'gavel:auction-state-v2';
const CHANNEL_NAME = 'gavel-auction-sync';

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function writeAll(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  catch {}
}

// Module-level subscribers so multiple hook instances stay in sync within the same tab
const subscribers = new Set();
function notifyLocal() { subscribers.forEach(fn => fn()); }

export function useAuctionState(auctionId) {
  const [state, setState] = useState(readAll);
  const channelRef = useRef(null);

  useEffect(() => {
    // Cross-tab sync
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current.onmessage = () => setState(readAll());

    // Same-tab sync
    const sync = () => setState(readAll());
    subscribers.add(sync);

    return () => {
      channelRef.current?.close();
      subscribers.delete(sync);
    };
  }, []);

  const broadcast = useCallback(() => {
    try {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({ type: 'update' });
      ch.close();
    } catch {}
  }, []);

  const recordBid = useCallback((id = auctionId) => {
    const all = readAll();
    const a = all[id] || { extraBids: 0, extensionMs: 0 };
    a.extraBids = (a.extraBids || 0) + 1;
    all[id] = a;
    writeAll(all);
    setState({ ...all });
    notifyLocal();
    broadcast();
  }, [auctionId, broadcast]);

  const extendAuction = useCallback((id = auctionId, ms = 5 * 60 * 1000) => {
    const all = readAll();
    const a = all[id] || { extraBids: 0, extensionMs: 0 };
    a.extensionMs = (a.extensionMs || 0) + ms;
    all[id] = a;
    writeAll(all);
    setState({ ...all });
    notifyLocal();
    broadcast();
  }, [auctionId, broadcast]);

  const getExtra = useCallback((id = auctionId) => {
    const s = state[id] || {};
    return { extraBids: s.extraBids || 0, extensionMs: s.extensionMs || 0 };
  }, [state, auctionId]);

  return { recordBid, extendAuction, getExtra };
}
