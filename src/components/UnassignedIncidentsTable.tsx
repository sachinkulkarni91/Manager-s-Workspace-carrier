import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowUpDown, Filter, Check, X, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTab } from "../context/TabContext";
import { useIncidents } from "../context/IncidentsContext";
import { useState, useEffect } from "react";
import { fetchAffectedUsers, AffectedUser } from "../api/affectedUsers";
import { UserSearch } from "./ui/UserSearch";
import { User as UserType } from "../api/users";
import { assignIncident, validateAssignment } from "../api/assignment";

export function UnassignedIncidentsTable() {
  const { addTab } = useTab();
  const { incidents, loading, error, refreshIncidents } = useIncidents();
  const [showAll, setShowAll] = useState(false);
  const [affectedUsersMap, setAffectedUsersMap] = useState<Map<string, AffectedUser[]>>(new Map());
  const [assigningIncidents, setAssigningIncidents] = useState<Set<string>>(new Set());
  const [assignmentUsers, setAssignmentUsers] = useState<Map<string, UserType | null>>(new Map());
  const [assignmentErrors, setAssignmentErrors] = useState<Map<string, string>>(new Map());
  const [assignmentSuccess, setAssignmentSuccess] = useState<Map<string, string>>(new Map());
  
  // Filter incidents for unassigned incidents (no assigned_to field or empty)
  const allUnassignedIncidents = incidents.filter((incident: any) => !incident.assigned_to);
  
  // Show first 4 items or all items based on showAll state
  const unassignedIncidents = showAll ? allUnassignedIncidents : allUnassignedIncidents.slice(0, 4);

  // Fetch affected users for each incident
  useEffect(() => {
    const fetchAllAffectedUsers = async () => {
      const newAffectedUsersMap = new Map<string, AffectedUser[]>();
      
      for (const incident of unassignedIncidents) {
        try {
          const users = await fetchAffectedUsers(incident.number);
          newAffectedUsersMap.set(incident.number, users);
        } catch (error) {
          console.warn(`Failed to fetch affected users for ${incident.number}:`, error);
          newAffectedUsersMap.set(incident.number, []);
        }
      }
      
      setAffectedUsersMap(newAffectedUsersMap);
    };

    if (unassignedIncidents.length > 0) {
      fetchAllAffectedUsers();
    }
  }, [unassignedIncidents]);  const getPriorityColor = (priority: string) => {
    if (priority.includes("1 - Critical")) return "bg-red-100 text-red-800";
    if (priority.includes("2 - High")) return "bg-orange-100 text-orange-800";
    if (priority.includes("3 - Medium")) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStateColor = (state: string) => {
    if (state === "Requirement Gathering") return "bg-blue-100 text-blue-800";
    if (state === "Draft") return "bg-yellow-100 text-yellow-800";
    if (state === "Assigned") return "bg-green-100 text-green-800";
    if (state === "Cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Handle user selection for assignment
  const handleUserSelect = (incidentNumber: string, user: UserType | null) => {
    const newAssignmentUsers = new Map(assignmentUsers);
    newAssignmentUsers.set(incidentNumber, user);
    setAssignmentUsers(newAssignmentUsers);
    
    // Clear any previous errors or success messages for this incident
    const newErrors = new Map(assignmentErrors);
    const newSuccess = new Map(assignmentSuccess);
    newErrors.delete(incidentNumber);
    newSuccess.delete(incidentNumber);
    setAssignmentErrors(newErrors);
    setAssignmentSuccess(newSuccess);
  };

  // Handle assignment submission
  const handleAssignIncident = async (incidentNumber: string) => {
    const user = assignmentUsers.get(incidentNumber) || null;
    
    // Clear previous messages
    const newErrors = new Map(assignmentErrors);
    const newSuccess = new Map(assignmentSuccess);
    newErrors.delete(incidentNumber);
    newSuccess.delete(incidentNumber);
    
    // Validate assignment
    const validationError = validateAssignment(user);
    if (validationError) {
      newErrors.set(incidentNumber, validationError);
      setAssignmentErrors(newErrors);
      return;
    }

    if (!user) {
      newErrors.set(incidentNumber, 'Please select a user to assign the incident to');
      setAssignmentErrors(newErrors);
      return;
    }

    // Mark as assigning
    const newAssigning = new Set(assigningIncidents);
    newAssigning.add(incidentNumber);
    setAssigningIncidents(newAssigning);

    try {
      // Call assignment API
      console.log('Assigning incident:', incidentNumber, 'to user:', user.name); // Debug log
      const response = await assignIncident(incidentNumber, user);
      
      if (response.success) {
        newSuccess.set(incidentNumber, `Successfully assigned to ${response.assigned_to}`);
        setAssignmentSuccess(newSuccess);
        
        // Clear the assignment form for this incident
        const clearedUsers = new Map(assignmentUsers);
        clearedUsers.delete(incidentNumber);
        setAssignmentUsers(clearedUsers);
        
        // Refresh incidents list to remove the newly assigned incident
        await refreshIncidents();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          const updatedSuccess = new Map(assignmentSuccess);
          updatedSuccess.delete(incidentNumber);
          setAssignmentSuccess(updatedSuccess);
        }, 3000);
        
        console.log('Assignment successful:', response);
      } else {
        newErrors.set(incidentNumber, response.message || 'Failed to assign incident');
        setAssignmentErrors(newErrors);
      }
    } catch (error) {
      console.error('Assignment failed:', error);
      newErrors.set(incidentNumber, 
        error instanceof Error 
          ? error.message 
          : 'Failed to assign incident. Please try again.'
      );
      setAssignmentErrors(newErrors);
    } finally {
      // Remove from assigning set
      const updatedAssigning = new Set(assigningIncidents);
      updatedAssigning.delete(incidentNumber);
      setAssigningIncidents(updatedAssigning);
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center justify-between">
                Number
                <Button variant="ghost" size="sm" className="p-0 h-4 w-4">
                  <ArrowUpDown className="w-3 h-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead>Short Description</TableHead>
            <TableHead>Affected User</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>
              <div className="flex items-center justify-between">
                State
                <Button variant="ghost" size="sm" className="p-0 h-4 w-4">
                  <Filter className="w-3 h-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Assignment Group</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
      <TableBody>
        {unassignedIncidents.map((incident: any, index: number) => (
          <TableRow key={incident.number} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <TableCell 
              className="hover:underline cursor-pointer" 
              style={{ color: '#3C59E7'}}
              onClick={() => addTab(incident.number)}
            >
              {incident.number}
            </TableCell>
            <TableCell>{incident.short_description || incident.shortDescription}</TableCell>
            <TableCell className="hover:underline cursor-pointer" style={{ color: '#3C59E7'}}>
              {affectedUsersMap.get(incident.number) && affectedUsersMap.get(incident.number)!.length > 0
                ? affectedUsersMap.get(incident.number)![0].name
                : incident.affected_user || incident.affectedUser || incident.caller || 'Loading...'
              }
            </TableCell>
            <TableCell>
              {incident.priority}
            </TableCell>
            <TableCell>
              {incident.state}
            </TableCell>
            <TableCell>{incident.category}</TableCell>
            <TableCell className="hover:underline cursor-pointer" style={{ color: '#3C59E7'}}>
              {incident.assignment_group || incident.assignmentGroup}
            </TableCell>
            <TableCell className="min-w-[200px]">
              <UserSearch
                value={assignmentUsers.get(incident.number)?.name || ''}
                onChange={(user) => handleUserSelect(incident.number, user)}
                placeholder="Select user..."
                disabled={assigningIncidents.has(incident.number)}
              />
              {assignmentErrors.get(incident.number) && (
                <div className="text-xs text-red-600 mt-1">
                  {assignmentErrors.get(incident.number)}
                </div>
              )}
              {assignmentSuccess.get(incident.number) && (
                <div className="text-xs text-green-600 mt-1">
                  {assignmentSuccess.get(incident.number)}
                </div>
              )}
            </TableCell>
            <TableCell>
              {assignmentUsers.get(incident.number) && (
                <Button
                  size="sm"
                  onClick={() => handleAssignIncident(incident.number)}
                  disabled={assigningIncidents.has(incident.number)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {assigningIncidents.has(incident.number) ? (
                    <>
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Check size={14} className="mr-1" />
                      Submit
                    </>
                  )}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    {/* Show all button - only show if there are more than 4 items */}
    {allUnassignedIncidents.length > 4 && (
      <div className="mt-3 mb-4">
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline-offset-2 hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          {showAll ? 'Show less' : 'Show all'}
        </button>
      </div>
    )}
    </div>
  );
}