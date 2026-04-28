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

export function useAuctionState(auctionId, { onExternalBid } = {}) {
  const [state, setState] = useState(readAll);
  const channelRef = useRef(null);
  const onExternalBidRef = useRef(onExternalBid);
  onExternalBidRef.current = onExternalBid;

  useEffect(() => {
    // Cross-tab sync
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current.onmessage = (e) => {
      setState(readAll());
      if (e.data?.type === 'bid' && e.data?.auctionId === auctionId) {
        onExternalBidRef.current?.({ auctionId: e.data.auctionId });
      }
    };

    // Same-tab sync
    const sync = () => setState(readAll());
    subscribers.add(sync);

    return () => {
      channelRef.current?.close();
      subscribers.delete(sync);
    };
  }, [auctionId]);

  const broadcast = useCallback((id = auctionId) => {
    try {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({ type: 'bid', auctionId: id });
      ch.close();
    } catch {}
  }, [auctionId]);

  const recordBid = useCallback((id = auctionId) => {
    const all = readAll();
    const a = all[id] || { extraBids: 0, extensionMs: 0 };
    a.extraBids = (a.extraBids || 0) + 1;
    all[id] = a;
    writeAll(all);
    setState({ ...all });
    notifyLocal();
    broadcast(id);
  }, [auctionId, broadcast]);

  const extendAuction = useCallback((id = auctionId, ms = 5 * 60 * 1000) => {
    const all = readAll();
    const a = all[id] || { extraBids: 0, extensionMs: 0 };
    a.extensionMs = (a.extensionMs || 0) + ms;
    all[id] = a;
    writeAll(all);
    setState({ ...all });
    notifyLocal();
    broadcast(id);
  }, [auctionId, broadcast]);

  const getExtra = useCallback((id = auctionId) => {
    const s = state[id] || {};
    return { extraBids: s.extraBids || 0, extensionMs: s.extensionMs || 0 };
  }, [state, auctionId]);

  return { recordBid, extendAuction, getExtra };
}
