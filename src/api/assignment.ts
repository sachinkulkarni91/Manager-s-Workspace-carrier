import { config } from '../config';
import { User } from './users';

export interface AssignmentRequest {
  assigned_to: string;
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  incident_id?: string;
  assigned_to?: string | {
    id: string;
    name: string;
    email: string;
  };
  updated_at?: string;
}

export async function assignIncident(
  incidentNumber: string, 
  assignee: User
): Promise<AssignmentResponse> {
  try {
    // Use the exact same approach that works in Thunder Client
    const url = `${config.apiBaseUrl}/incidents/${incidentNumber}/assignee`;
    console.log('Assignment API URL:', url); // Debug log
    console.log('Assignment request:', { incidentNumber, assignee }); // Debug log
    
    // Simple request body exactly as in Thunder Client
    const requestBody = {
      assigned_to: assignee.name,
    };

    console.log('Assignment request body:', requestBody); // Debug log

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Assignment API Response Status:', response.status); // Debug log
    console.log('Assignment API Response Headers:', Object.fromEntries(response.headers.entries())); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Assignment API Error Response:', errorText);
      
      // Try to parse error as JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      throw new Error(
        errorData.message || 
        errorData.error?.message ||
        `Failed to assign incident: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('Assignment API Response:', data);
    
    return {
      success: true,
      message: data.message || 'Incident assigned successfully',
      incident_id: incidentNumber,
      assigned_to: assignee.name,
      updated_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Assignment failed:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to assign incident');
  }
}

// Helper function to get sys_id from incident number
export function extractSysIdFromIncident(incidentNumber: string): string {
  // In a real implementation, you might need to map incident numbers to sys_ids
  // For now, we'll use the incident number as sys_id or extract it from existing data
  
  // If the incident number already contains a sys_id pattern, extract it
  // Otherwise, use the incident number itself
  return incidentNumber.replace(/^INC/, ''); // Remove INC prefix if present
}

// Validation helper
export function validateAssignment(assignee: User | null): string | null {
  if (!assignee) {
    return 'Please select a user to assign the incident to';
  }
  
  if (!assignee.id) {
    return 'Selected user is missing ID';
  }
  
  if (!assignee.name) {
    return 'Selected user is missing name';
  }
  
  if (!assignee.email) {
    return 'Selected user is missing email';
  }
  
  return null; // No validation errors
}