'use client';

import { useEffect, useState, useCallback } from 'react';
import { casesApi, documentsApi, processStepsApi, customerTasksApi, activitiesApi, notificationsApi } from './api';
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

// Use process steps
export function useProcessSteps(caseId: string) {
  const [data, setData] = useState<Tables['process_steps']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caseId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const steps = await processStepsApi.getByCaseId(caseId);
        setData(steps);
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

// Use customer tasks
export function useCustomerTasks(caseId: string) {
  const [data, setData] = useState<Tables['customer_tasks']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await customerTasksApi.getByCaseId(caseId);
      setData(tasks);
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

// Use activities
export function useActivities(caseId: string) {
  const [data, setData] = useState<Tables['activities']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caseId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const activities = await activitiesApi.getByCaseId(caseId);
        setData(activities);
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
