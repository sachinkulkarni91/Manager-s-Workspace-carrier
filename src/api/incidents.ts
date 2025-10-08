// incidents.ts - Fetch and normalize incidents from backend
// Uses centralized configuration for environment variables

import { config, buildIncidentsUrl } from '../config';

export interface RawIncident {
  number: string;
  short_description?: string;
  description?: string;
  priority?: string | number;
  state?: string;
  assignment_group?: string;
  assigned_to?: string;
  caller?: string;
  affected_user?: string;
  impact?: string | number;
  urgency?: string | number;
  location?: string;
  category?: string;
  subcategory?: string;
  channel?: string;
  service?: string;
  service_offering?: string;
  configuration_item?: string;
  application?: string;
  three_attempt_rule?: string;
  missing_ci?: boolean;
  notes?: string;
  created_at?: string;
  created?: string;
  [key: string]: any; // allow extra fields
}

let cache: RawIncident[] | null = null;
let lastFetch = 0;
const TTL = config.cacheTtl;

function resolveIncidentsUrl(): string {
  return buildIncidentsUrl();
}

export async function fetchIncidents(force = false): Promise<RawIncident[]> {
  if (!force && cache && Date.now() - lastFetch < TTL) return cache;
  
  const url = resolveIncidentsUrl();
  
  try {
    const res = await fetch(url, { 
      headers: { 
        Accept: 'application/json',
        'Content-Type': 'application/json'
      } 
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    let data: any = await res.json();

    // Accept several shapes: array | { data: [] } | { incidents: [] } | { result: [] } | { results: [] }
    if (Array.isArray(data)) {
      // Direct array response
    } else if (data && Array.isArray(data.data)) {
      data = data.data;
    } else if (data && Array.isArray(data.incidents)) {
      data = data.incidents;
    } else if (data && Array.isArray(data.result)) {
      data = data.result;
    } else if (data && Array.isArray(data.results)) {
      data = data.results;
    } else {
      // If it's an object with any array property, try to use the first array found
      if (data && typeof data === 'object') {
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          data = data[arrayKey];
        }
      }
    }

    if (!Array.isArray(data)) {
      console.error('Unexpected incidents payload:', data);
      throw new Error('Unexpected incidents payload structure');
    }

    cache = data.map(normalizeIncident);
    lastFetch = Date.now();
    console.log(`Fetched ${cache.length} incidents from API`);
    return cache;
    
  } catch (e) {
    console.error('Failed to fetch incidents:', e);
    
    // Provide fallback to keep UI functional
    const fallback: RawIncident[] = [
      {
        number: 'INC-FALLBACK-1',
        short_description: 'API connection failed - fallback data',
        state: 'New',
        priority: '3 - Moderate',
        impact: '3',
        urgency: '3',
        category: 'Network',
        assignment_group: 'IT Support'
      },
      {
        number: 'INC-FALLBACK-2',
        short_description: 'Unable to connect to backend service',
        state: 'Draft',
        priority: '2 - High',
        impact: '2',
        urgency: '2',
        category: 'Application',
        assigned_to: 'System Administrator'
      }
    ];
    
    cache = fallback;
    lastFetch = Date.now();
    return fallback;
  }
}

export function clearIncidentsCache() {
  cache = null;
  lastFetch = 0;
}

function normalizeIncident(raw: any): RawIncident {
  const number = String(
    raw.number || raw.sys_id || raw.id || raw.incident_number || raw.incidentNumber || 'UNKNOWN'
  );
  
  const short_description =
    raw.short_description || raw.shortDescription || raw.title || raw.description || '(no description)';
  
  return {
    ...raw,
    number,
    short_description
  };
}
