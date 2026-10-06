'use client';

import { useState, useEffect, useCallback } from 'react';

// Global clock offset between local machine time and official NTP.br time
let globalNtpOffsetMs: number = 0;
let isNtpInitialized: boolean = false;
let lastNtpSource: string = 'a.st1.ntp.br (NTP.br / Observatório Nacional)';

/**
 * Perform SNTP client synchronization against /api/time
 * Uses Cristian's Algorithm to account for network latency (RTT)
 */
export async function syncWithNtpBr(): Promise<{
  offsetMs: number;
  source: string;
  roundTripMs: number;
}> {
  const t0 = Date.now();
  try {
    const res = await fetch(`/api/time?t=${t0}`, { cache: 'no-store' });
    const t3 = Date.now();

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    const serverTimestamp = data.timestamp;
    const roundTrip = t3 - t0;
    // Estimate client time at the moment server sent its timestamp
    const clientTimeAtServerMoment = t0 + Math.floor(roundTrip / 2);
    const offset = serverTimestamp - clientTimeAtServerMoment;

    globalNtpOffsetMs = offset;
    isNtpInitialized = true;
    lastNtpSource = data.source || 'a.st1.ntp.br (NTP.br)';

    return {
      offsetMs: offset,
      source: lastNtpSource,
      roundTripMs: roundTrip
    };
  } catch (error) {
    console.warn('Falha na sincronização direta com NTP.br, mantendo offset atual:', error);
    return {
      offsetMs: globalNtpOffsetMs,
      source: lastNtpSource,
      roundTripMs: 0
    };
  }
}

/**
 * Returns a Date object aligned with official Brazilian NTP.br time
 */
export function getNtpDate(): Date {
  return new Date(Date.now() + globalNtpOffsetMs);
}

/**
 * Formats official NTP.br date and time string in America/Sao_Paulo timezone
 */
export function formatNtpTime(date?: Date): {
  timeStr: string;
  dateStr: string;
  fullPtBr: string;
} {
  const targetDate = date || getNtpDate();

  const timeStr = targetDate.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateStr = targetDate.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const dayOfWeek = targetDate.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long'
  });

  return {
    timeStr,
    dateStr,
    fullPtBr: `${dayOfWeek}, ${dateStr} às ${timeStr}`
  };
}

/**
 * React Hook for live atomic clock synchronized with NTP.br
 */
export function useNtpClock() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [ntpTime, setNtpTime] = useState<Date>(getNtpDate());
  const [isSynced, setIsSynced] = useState<boolean>(isNtpInitialized);
  const [source, setSource] = useState<string>(lastNtpSource);
  const [offsetMs, setOffsetMs] = useState<number>(globalNtpOffsetMs);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncWithNtpBr();
      setOffsetMs(res.offsetMs);
      setSource(res.source);
      setIsSynced(true);
      setNtpTime(getNtpDate());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial sync on mount and periodically every 5 minutes
  useEffect(() => {
    resync();
    const syncInterval = setInterval(resync, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, [resync]);

  // Tick every second using the NTP offset
  useEffect(() => {
    const timer = setInterval(() => {
      setNtpTime(getNtpDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = formatNtpTime(ntpTime);

  return {
    ntpTime,
    timeStr: mounted ? formatted.timeStr : '--:--:--',
    dateStr: mounted ? formatted.dateStr : '--/--/----',
    fullPtBr: mounted ? formatted.fullPtBr : 'Sincronizando com NTP.br...',
    isMounted: mounted,
    isSynced,
    isSyncing,
    source,
    offsetMs,
    resync
  };
}
