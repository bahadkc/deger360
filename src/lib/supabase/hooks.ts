'use client';

import { useEffect, useState, useCallback } from 'react';
import { casesApi, documentsApi, notificationsApi } from './api';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Use case data
export function useCase(caseId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caseId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const caseData = await casesApi.getById(caseId);
        setData(caseData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [caseId]);

  return { data, loading, error };
}

// Use documents
export function useDocuments(caseId: string) {
  const [data, setData] = useState<Tables['documents']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const documents = await documentsApi.getByCaseId(caseId);
      setData(documents);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    refetch();
  }, [caseId, refetch]);

  return { data, loading, error, refetch };
}

// Use notifications
export function useNotifications(customerId: string) {
  const [data, setData] = useState<Tables['notifications']['Row'][]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const [notifications, count] = await Promise.all([
        notificationsApi.getByCustomerId(customerId),
        notificationsApi.getUnreadCount(customerId),
      ]);
      setData(notifications);
      setUnreadCount(count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    refetch();
  }, [customerId, refetch]);

  return { data, unreadCount, loading, error, refetch };
}
