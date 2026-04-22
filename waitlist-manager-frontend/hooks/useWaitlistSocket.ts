'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinRestaurantRoom,
  leaveRestaurantRoom,
  getSocket,
} from '@/lib/socket';
import { waitlistApi, WaitlistEntry } from '@/lib/api';

interface UseWaitlistSocketReturn {
  waitlist: WaitlistEntry[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWaitlistSocket(restaurantId: string): UseWaitlistSocketReturn {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await waitlistApi.getWaitlist(restaurantId);
      setWaitlist(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la fila');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    refresh();

    const socket = connectSocket();
    joinRestaurantRoom(restaurantId);

    socket.on('connect', () => {
      setIsConnected(true);
      refresh();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('waitlistUpdated', (updatedWaitlist: WaitlistEntry[]) => {
      setWaitlist(updatedWaitlist);
      setIsLoading(false);
    });

    return () => {
      leaveRestaurantRoom(restaurantId);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('waitlistUpdated');
      disconnectSocket();
    };
  }, [restaurantId, refresh]);

  return { waitlist, isConnected, isLoading, error, refresh };
}