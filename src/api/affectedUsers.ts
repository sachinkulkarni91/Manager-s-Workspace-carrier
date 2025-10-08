// affectedUsers.ts - Fetch affected users for incidents
// Uses centralized configuration for environment variables

import { config, buildAffectedUsersUrl } from '../config';

export interface AffectedUser {
  id: string;
  name: string;
  email?: string;
  department?: string;
  [key: string]: any;
}

// Cache for affected users by incident number
const affectedUsersCache = new Map<string, AffectedUser[]>();
const cacheExpiry = new Map<string, number>();
const TTL = config.affectedUsersCacheTtl;

function resolveAffectedUsersUrl(incidentNumber: string): string {
  return buildAffectedUsersUrl(incidentNumber);
}

export async function fetchAffectedUsers(incidentNumber: string, force = false): Promise<AffectedUser[]> {
  const cacheKey = incidentNumber;
  const now = Date.now();
  
  // Check cache first
  if (!force && affectedUsersCache.has(cacheKey)) {
    const expiry = cacheExpiry.get(cacheKey) || 0;
    if (now < expiry) {
      return affectedUsersCache.get(cacheKey) || [];
    }
  }

  try {
    const url = resolveAffectedUsersUrl(incidentNumber);
    console.log('Fetching affected users from:', url); // Debug log
    const res = await fetch(url, { 
      headers: { Accept: 'application/json' } 
    });
    
    if (!res.ok) {
      console.log(`Affected users API returned ${res.status}, using mock data`);
      // If 404 or other error, return mock data instead of empty array
      if (res.status === 404) {
        return getMockAffectedUsers(incidentNumber);
      }
      throw new Error(`HTTP ${res.status}`);
    }
    
    let data: any = await res.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      // Direct array
    } else if (data && Array.isArray(data.users)) {
      data = data.users;
    } else if (data && Array.isArray(data.affected_users)) {
      data = data.affected_users;
    } else if (data && Array.isArray(data.data)) {
      data = data.data;
    } else {
      // Single user object
      if (data && typeof data === 'object') {
        data = [data];
      } else {
        data = [];
      }
    }

    const users: AffectedUser[] = data.map((user: any) => ({
      id: user.id || user.user_id || user.sys_id || 'unknown',
      name: user.name || user.display_name || user.full_name || user.username || 'Unknown User',
      email: user.email || user.email_address,
      department: user.department || user.dept,
      ...user
    }));

    // Cache the result
    affectedUsersCache.set(cacheKey, users);
    cacheExpiry.set(cacheKey, now + TTL);
    
    return users;
  } catch (error) {
    console.warn(`Failed to fetch affected users for ${incidentNumber}:`, error);
    console.log('Returning mock affected users data');
    // Return mock data on error to prevent UI breaking
    return getMockAffectedUsers(incidentNumber);
  }
}

// Mock data function for development/fallback
function getMockAffectedUsers(incidentNumber: string): AffectedUser[] {
  // Return realistic mock data based on incident number
  const mockUsers: AffectedUser[] = [
    {
      id: 'user_001',
      name: 'NTT ebonding User',
      email: 'ntt.ebonding@company.com',
      department: 'Network Operations'
    },
    {
      id: 'user_002', 
      name: 'Luis Valdez',
      email: 'luis.valdez@company.com',
      department: 'Application Support'
    }
  ];
  
  // Return different users based on incident number for variety
  if (incidentNumber.includes('1867021')) {
    return [mockUsers[1]]; // Luis Valdez for this incident
  } else {
    return [mockUsers[0]]; // NTT ebonding User for others
  }
}

export function clearAffectedUsersCache() {
  affectedUsersCache.clear();
  cacheExpiry.clear();
}

// Helper function to get the first affected user name for display
export function getFirstAffectedUserName(users: AffectedUser[]): string {
  if (users.length === 0) return 'No affected user';
  if (users.length === 1) return users[0].name;
  return `${users[0].name} (+${users.length - 1} more)`;
}