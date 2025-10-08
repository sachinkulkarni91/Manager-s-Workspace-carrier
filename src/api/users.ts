import { config } from '../config';

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
}

interface UsersApiResponse {
  users: User[];
  total: number;
}

// Cache for user search results
const userSearchCache = new Map<string, { data: User[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchUsers(query: string): Promise<User[]> {
  if (!query.trim()) {
    return [];
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  const cached = userSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${config.apiBaseUrl}${config.searchUsersPath}?q=${encodeURIComponent(query)}`;
    console.log('Searching users with URL:', url); // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`, // if API key is needed
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data); // Debug log
    
    // Handle the actual API response structure
    let users: User[] = [];
    
    if (data.result && Array.isArray(data.result)) {
      // Convert ServiceNow user format to our User interface
      users = data.result.map((user: any) => ({
        id: user.sys_id || user.id || '',
        name: user.name || user.display_name || user.user_name || '',
        email: user.email || user.user_name || '',
        department: user.department || user.u_department || '',
        title: user.title || user.u_title || '',
      })).filter((user: User) => user.name && user.name.trim() !== '');
    } else if (data.users && Array.isArray(data.users)) {
      // Fallback for different API response structure
      users = data.users.map((user: any) => ({
        id: user.id || user.sys_id || '',
        name: user.name || user.display_name || '',
        email: user.email || user.user_name || '',
        department: user.department,
        title: user.title,
      }));
    }

    console.log('Processed users:', users); // Debug log

    // Cache the results
    userSearchCache.set(cacheKey, {
      data: users,
      timestamp: Date.now()
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    console.log('Falling back to mock data for query:', query);
    
    // Always return mock data for development/fallback
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        department: 'IT Support',
        title: 'Senior Support Engineer'
      },
      {
        id: '2', 
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Network Operations',
        title: 'Network Administrator'
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@company.com', 
        department: 'Application Support',
        title: 'Application Specialist'
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        department: 'Security Team',
        title: 'Security Analyst'
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        department: 'Infrastructure',
        title: 'System Administrator'
      },
      {
        id: '6',
        name: 'Renukumar P',
        email: 'renukumar.p@company.com',
        department: 'Application Support',
        title: 'Senior Application Engineer'
      },
      {
        id: '7',
        name: 'Lisa Martinez',
        email: 'lisa.martinez@company.com',
        department: 'Database Administration',
        title: 'Database Administrator'
      },
      {
        id: '8',
        name: 'Robert Brown',
        email: 'robert.brown@company.com',
        department: 'Network Operations',
        title: 'Network Engineer'
      },
      {
        id: '9',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@company.com',
        department: 'Security Team',
        title: 'Information Security Officer'
      },
      {
        id: '10',
        name: 'Andrew Kumar',
        email: 'andrew.kumar@company.com',
        department: 'IT Support',
        title: 'Help Desk Specialist'
      }
    ].filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.department?.toLowerCase().includes(query.toLowerCase())
    );

    // Cache the mock results too
    userSearchCache.set(cacheKey, {
      data: mockUsers,
      timestamp: Date.now()
    });

    return mockUsers;
  }
}

// Clear cache function (can be called when needed)
export function clearUserSearchCache(): void {
  userSearchCache.clear();
}