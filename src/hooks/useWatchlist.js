import { useState, useEffect, useCallback } from 'react';

const KEY = 'gavel:watchlist';
const EVENT = 'gavel:watchlist-changed';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(read);

  useEffect(() => {
    const sync = () => setWatchlist(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback((id) => {
    const current = read();
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setWatchlist(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const isWatched = useCallback((id) => watchlist.includes(id), [watchlist]);

  return { watchlist, toggle, isWatched };
}
