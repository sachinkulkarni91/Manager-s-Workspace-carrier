import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { ArrowUpDown, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { useTab } from "../context/TabContext";
import { useIncidents } from "../context/IncidentsContext";
import { useState } from "react";

export function MyWorkTable() {
  const { addTab } = useTab();
  const { incidents, loading, error } = useIncidents();
  const [showAll, setShowAll] = useState(false);
  
  // For My Work, we'll show incidents that are either assigned or have certain states that indicate work
  // If no incidents have assigned_to, we'll show some incidents to maintain the UI layout
  const allWorkItems = incidents.filter((incident: any) => 
    incident.assigned_to || 
    incident.state === 'Assigned' || 
    incident.state === 'Requirement Gathering' ||
    incident.state === 'Draft'
  );
  
  // If still no work items, take the first few incidents to maintain the UI layout
  const workItemsToShow = allWorkItems.length > 0 ? allWorkItems : incidents.slice(0, 4);
  
  // Show first 4 items or all items based on showAll state
  const workItems = showAll ? workItemsToShow : workItemsToShow.slice(0, 4);  const getPriorityColor = (priority: string) => {
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

  const formatTimestamp = (ts?: string) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return ts;
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch (e) {
      return ts;
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
            <TableHead>Created</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>
              <div className="flex items-center justify-between">
                State
                <Button variant="ghost" size="sm" className="p-0 h-4 w-4">
                  <Filter className="w-3 h-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead>Short description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workItems.map((item: any, index: number) => (
            <TableRow key={item.number} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <TableCell 
                className="hover:underline cursor-pointer" 
                style={{ color: '#3C59E7'}}
                onClick={() => addTab(item.number)}
              >
                {item.number}
              </TableCell>
              <TableCell className="text-gray-600">{formatTimestamp(item.sys_created_on || item.created_at || item.created)}</TableCell>
              <TableCell>
                {item.priority}
              </TableCell>
              <TableCell>
                {item.state}
              </TableCell>
              <TableCell>{item.short_description || item.shortDescription}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Show all button - only show if there are more than 4 items */}
      {workItemsToShow.length > 4 && (
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