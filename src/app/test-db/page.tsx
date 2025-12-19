'use client';

import { useEffect, useState } from 'react';
import {
  getDatabaseOverview,
  testConnection,
  db,
  getTableNames,
} from '@/lib/supabase';

export default function TestDatabasePage() {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function test() {
      try {
        setLoading(true);
        setError(null);

        // Test connection
        const connResult = await testConnection();
        setConnection(connResult);

        // Get database overview
        const overviewResult = await getDatabaseOverview();
        setOverview(overviewResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    test();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Database Connection Test
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Connection Status
            </h2>
            <div
              className={`p-4 rounded-lg ${
                connection?.connected
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-3 w-3 rounded-full mr-3 ${
                    connection?.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-medium ${
                      connection?.connected ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {connection?.connected
                      ? '✅ Connected'
                      : '❌ Not Connected'}
                  </p>
                  {connection?.message && (
                    <p className="text-sm text-green-700 mt-1">
                      {connection.message}
                    </p>
                  )}
                  {connection?.error && (
                    <p className="text-sm text-red-700 mt-1">
                      {connection.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Database Statistics */}
          {overview && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Database Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(overview.stats || {}).map(
                  ([table, stats]: [string, any]) => (
                    <div
                      key={table}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <h3 className="font-semibold text-gray-900 capitalize mb-2">
                        {table.replace('_', ' ')}
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-blue-600">
                          {stats.count}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          records
                        </span>
                      </div>
                      {stats.error && (
                        <p className="text-xs text-red-600 mt-2">
                          Error: {stats.error}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Available Tables */}
          {overview && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Tables
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {overview.tables?.map((table: string) => (
                    <li
                      key={table}
                      className="text-sm text-gray-700 font-mono bg-white px-3 py-1 rounded border"
                    >
                      {table}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Table Relationships */}
          {overview && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Table Relationships
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(overview.relationships || {}).map(
                    ([table, rels]: [string, any]) => (
                      <div
                        key={table}
                        className="bg-white rounded p-3 border border-gray-200"
                      >
                        <h4 className="font-semibold text-gray-900 capitalize mb-2">
                          {table.replace('_', ' ')}
                        </h4>
                        {rels.hasMany?.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">
                              Has Many:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rels.hasMany.map((rel: string) => (
                                <span
                                  key={rel}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                >
                                  {rel}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {rels.belongsTo?.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-500">
                              Belongs To:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rels.belongsTo.map((rel: string) => (
                                <span
                                  key={rel}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                >
                                  {rel}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {overview && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last checked: {new Date(overview.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
