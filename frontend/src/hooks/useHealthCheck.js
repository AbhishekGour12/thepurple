'use client';

import { useState, useEffect, useCallback } from 'react';
import healthService from '../services/healthService.js';

export function useHealthCheck(pollIntervalMs = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await healthService.getHealth();
      setData(res.data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchHealth, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchHealth, pollIntervalMs]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchHealth,
  };
}

export default useHealthCheck;
