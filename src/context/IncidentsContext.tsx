import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchIncidents, RawIncident } from '../api/incidents';

interface IncidentsContextType {
  incidents: RawIncident[];
  loading: boolean;
  error: string | null;
  refreshIncidents: () => Promise<void>;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<RawIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidents(true); // force refresh
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshIncidents();
  }, []);

  return (
    <IncidentsContext.Provider value={{ 
      incidents, 
      loading, 
      error, 
      refreshIncidents 
    }}>
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentsContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
}
