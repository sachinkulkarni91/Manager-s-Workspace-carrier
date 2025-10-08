import React, { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, Mail, Save, Tag, Asterisk, MoreVertical, Info, Users, LockKeyhole, Newspaper, SlidersHorizontal, GraduationCap, Paperclip, FileText, ChevronDown, Funnel, ArrowDownWideNarrow, Maximize2, CheckCircle, AlertCircle } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ToggleNew from "../ui/toggleNew";
import { useTab } from "../../context/TabContext";
import ActivityCard from "./ActivityCard";
import { fetchAffectedUsers, AffectedUser } from "../../api/affectedUsers";
import { UserSearch } from "../ui/UserSearch";
import { User as UserType } from "../../api/users";
import { assignIncident, validateAssignment } from "../../api/assignment";

type BadgeProps = { children: React.ReactNode; className?: string };
const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
    <span
        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${className}`}
    >
        {children}
    </span>
);

const Field: React.FC<{ label: string | React.ReactNode; value?: string | React.ReactNode }> = ({
    label,
    value,
}) => (
    <div className="mb-4">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-800">{value ?? "—"}</div>
    </div>
);

interface CategoryDropdownProps {
    selected: string;
    onSelect: (category: string) => void;
    options: string[];
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    selected,
    onSelect,
    options
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    return (
        <div className="relative group" ref={dropdownRef}>
            <div 
                className="flex items-center border-b cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className="w-full py-1 bg-transparent text-sm outline-none cursor-pointer"
                >
                    {selected}
                </div>
                <div className="flex items-center gap-1">
                    <button className="cursor-pointer">
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-50">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                                onSelect(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface Article {
    title: string;
    excerpt: string;
    meta: string;
}

interface Incident {
    title: string;
    number: string;
    affectedUser: string;
    location: string;
    priority: string;
    state: string;
    service: string;
    category: string;
    assignmentGroup?: string;
    assignedTo?: string;
}

export interface Activity {
    title: string;
    timestamp: string;
    comment: string;
}

const activities: Activity[] = [
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
    {
        title: 'Unify integration user',
        timestamp: '2025-10-02 07:50:35',
        comment: 'Unification completed for three parts of the system...',
    },
]

export default function IncidentDetails() {
    const { activeTabId, addEmailDraftTab, tabs } = useTab();
    const [activeTab, setActiveTab] = useState('details');
    const [stacked, setStacked] = useState(false);
    const [composeTab, setComposeTab] = useState<'comments' | 'worknotes'>('comments');
    const [quickLinks, setQuickLinks] = useState<'graduation' | 'pin' | 'document'>('graduation');
    const [selectedCategory, setSelectedCategory] = useState('Application & Software');
    const [selectedSubcategory, setSelectedSubcategory] = useState('Application');
    const [selectedThreeAttemptRule, setSelectedThreeAttemptRule] = useState('Yes');
    const [selectedChannel, setSelectedChannel] = useState('Self-service');
    const [selectedState, setSelectedState] = useState('Assigned');
    const [selectedImpact, setSelectedImpact] = useState('3-Moderate');
    const [selectedUrgency, setSelectedUrgency] = useState('2-Medium');
    const [affectedUsers, setAffectedUsers] = useState<AffectedUser[]>([]);
    const [affectedUsersLoading, setAffectedUsersLoading] = useState(false);
    const [assignedToUser, setAssignedToUser] = useState<UserType | null>(null);
    const [assignmentGroup, setAssignmentGroup] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);
    const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    // Get the current incident tab data
    const currentTab = tabs.find(tab => tab.id === activeTabId);
    const incidentNumber = currentTab?.incidentNumber;

    // Debug logging to see what incident number we're working with
    console.log('IncidentDetails - Active Tab ID:', activeTabId);
    console.log('IncidentDetails - Current Tab:', currentTab);
    console.log('IncidentDetails - Incident Number:', incidentNumber);

    const categoryOptions = [
        'Application & Software',
        'Hardware',
        'Network',
        'Security',
        'Database',
        'Email & Collaboration',
        'Operating System',
        'Cloud Services',
        'Other'
    ];

    const subcategoryOptions = {
        'Application & Software': ['Application', 'Software Installation', 'Software Update', 'Application Access', 'Application Error'],
        'Hardware': ['Desktop', 'Laptop', 'Printer', 'Mobile Device', 'Server Hardware'],
        'Network': ['Internet Connectivity', 'VPN', 'Network Drive', 'WiFi', 'LAN'],
        'Security': ['Account Lock', 'Password Reset', 'Security Access', 'Security Incident', 'Compliance'],
        'Database': ['Database Access', 'Database Error', 'Data Corruption', 'Backup/Restore', 'Performance'],
        'Email & Collaboration': ['Email', 'Calendar', 'Teams/Slack', 'SharePoint', 'OneDrive'],
        'Operating System': ['Windows', 'MacOS', 'Linux', 'OS Update', 'OS Error'],
        'Cloud Services': ['AWS', 'Azure', 'Google Cloud', 'Cloud Storage', 'Cloud Access'],
        'Other': ['General Inquiry', 'Service Request', 'Consultation', 'Training', 'Documentation']
    };

    const threeAttemptRuleOptions = ['Yes', 'No', 'Not Applicable'];

    const channelOptions = [
        'Self-service',
        'Email',
        'Phone',
        'Walk-in',
        'Chat',
        'Teams',
        'Service Desk',
        'Automated Alert'
    ];

    const stateOptions = [
        'New',
        'Assigned',
        'In Progress',
        'Pending',
        'Resolved',
        'Closed',
        'Cancelled'
    ];

    const impactOptions = [
        '1-Enterprise',
        '2-Site/Department',
        '3-Moderate',
        '4-Low/Localized',
        '5-Minimal'
    ];

    const urgencyOptions = [
        '1-Critical',
        '2-High',
        '3-Medium',
        '4-Low',
        '5-Planning'
    ];

    // Handle tab change for both tab groups
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // sample data - use real incident number from tab
    const incident: Incident = {
        title: "Testing the New process", // This should come from API in real implementation
        number: incidentNumber || "INC1867021", // Use real incident number from tab
        affectedUser: "Luis Valdez",
        location: "LOC5001: Carrier - Plant A, Galeana 469 Ote, Santa ...",
        priority: "3 - Moderate",
        state: "Assigned",
        service: "BS-WHQ-Global-Corp",
        category: "Application & Soft...",
        assignmentGroup: "Network Operations Center", // Assignment group from API data
        // Don't set assignedTo by default - let user search and assign
    };

    // Debug the incident number being used
    console.log('IncidentDetails - Final incident number being used:', incident.number);

    // Fetch affected users for this incident
    useEffect(() => {
        const loadAffectedUsers = async () => {
            if (incident.number) {
                setAffectedUsersLoading(true);
                try {
                    const users = await fetchAffectedUsers(incident.number);
                    setAffectedUsers(users);
                } catch (error) {
                    console.error('Failed to fetch affected users:', error);
                    setAffectedUsers([]);
                } finally {
                    setAffectedUsersLoading(false);
                }
            }
        };

        loadAffectedUsers();
    }, [incident.number]);

    // Initialize assignment fields from incident data
    useEffect(() => {
        if (incident.assignmentGroup) {
            setAssignmentGroup(incident.assignmentGroup);
        }
        // Don't set default assigned user - keep it empty
    }, [incident.assignmentGroup]);

    // Handle assignment submission
    const handleAssignIncident = async () => {
        // Clear previous messages
        setAssignmentError(null);
        setAssignmentSuccess(null);

        // Validate assignment
        const validationError = validateAssignment(assignedToUser);
        if (validationError) {
            setAssignmentError(validationError);
            return;
        }

        if (!assignedToUser) {
            setAssignmentError('Please select a user to assign the incident to');
            return;
        }

        setIsAssigning(true);

        try {
            // Call assignment API with full incident number
            console.log('Assignment triggered from IncidentDetails - Save button clicked');
            console.log('Assigning incident:', incident.number, 'to user:', assignedToUser.name);
            const response = await assignIncident(incident.number, assignedToUser);
            
            if (response.success) {
                setAssignmentSuccess(
                    `Incident successfully assigned to ${response.assigned_to}`
                );
                
                // Optional: Update local state or refresh data
                console.log('Assignment successful:', response);
                // Show saved state on the Save & Assign button briefly
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setAssignmentSuccess(null);
                }, 5000);
            } else {
                setAssignmentError(response.message || 'Failed to assign incident');
            }
        } catch (error) {
            console.error('Assignment failed:', error);
            setAssignmentError(
                error instanceof Error 
                    ? error.message 
                    : 'Failed to assign incident. Please try again.'
            );
        } finally {
            setIsAssigning(false);
        }
    };

    const articles: Article[] = [
        {
            title: "Proceso de Whitelisting y Petic...",
            excerpt: "Tema/Pregunta Desbloquear una página para un individuo y añadir servicios web...",
            meta: "updated 5 months ago · 9 views",
        },
        {
            title: "Guía de instalación y conexión ...",
            excerpt: "Problema/Pregunta Guía de instalación y...",
            meta: "updated 1 year ago · 24 views",
        },
        {
            title: "Guía de instalación y conexión ...",
            excerpt: "Problema/Pregunta Guía de instalación y...",
            meta: "updated 1 year ago · 24 views",
        },
        {
            title: "Guía de instalación y conexión ...",
            excerpt: "Problema/Pregunta Guía de instalación y...",
            meta: "updated 1 year ago · 24 views",
        },
        {
            title: "Guía de instalación y conexión ...",
            excerpt: "Problema/Pregunta Guía de instalación y...",
            meta: "updated 1 year ago · 24 views",
        },
    ];

    const DetailsContent: React.FC<{ incident: Incident; articles: Article[] }> = ({ incident, articles }) => (
        <div style={{ display: 'flex', height: '100%' }}>
            <div className="grid p-6" style={{ gridTemplateColumns: "550px 1fr 320px", width: '100%' }}>
                {/* Left column - Incident */}
                <aside className="p-4 bg-white shadow-sm overflow-auto" style={{ marginTop: '20px', overflowY: 'scroll', maxHeight: '400px' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button
                                    className="p-1 hover:bg-gray-100 rounded"
                                    onClick={() => {
                                        // Dummy options menu
                                        console.log("Options clicked");
                                    }}
                                >
                                    <MoreVertical size={16} style={{ color: '#3C59E7'}} />
                                </button>
                            </div>
                            <h3 className="text-base text-gray-600 font-semibold">Incident</h3>
                        </div>
                        <button
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => {
                                // Toggle collapse
                                console.log("Collapse clicked");
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transform rotate-180"
                            >
                                <path
                                    d="M4 6L8 10L12 6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                    {/* ServiceNow Two-Column Layout */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Field
                                    label={
                                        <div className="flex items-center gap-2">
                                            Number
                                        </div>
                                    }
                                    value={
                                        <div className="flex items-center gap-2 group">
                                            <span>{incident.number}</span>
                                        </div>
                                    }
                                />
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Affected User <span><Asterisk className="w-4" /></span>
                                </div>
                                <div className="relative">
                                    <div className="flex items-center border-b bg-gray-50">
                                        <input
                                            type="text"
                                            className="w-full py-1 bg-gray-50 text-sm outline-none cursor-not-allowed"
                                            value="NTT ebonding User"
                                            readOnly
                                            disabled
                                        />
                                        <div className="flex items-center gap-1 opacity-50">
                                            <button className="p-1 rounded cursor-not-allowed" disabled>
                                                <Info size={12} className="text-gray-400" />
                                            </button>
                                            <button className="p-1 rounded cursor-not-allowed" disabled>
                                                <Search size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Location <span><Asterisk className="w-4" /></span>
                                </div>
                                <div className="relative">
                                    <div className="flex items-center border-b bg-gray-50">
                                        <input
                                            type="text"
                                            className="w-full py-1 bg-gray-50 text-sm outline-none cursor-not-allowed"
                                            value="CAF77: CCS - CIB, 13995 Pasteur Boulevard, Palm Beach Gardens, FL, 33418 USA"
                                            readOnly
                                            disabled
                                        />
                                        <div className="flex items-center gap-1 opacity-50">
                                            <button className="p-1 rounded cursor-not-allowed" disabled>
                                                <Info size={12} className="text-gray-400" />
                                            </button>
                                            <button className="p-1 rounded cursor-not-allowed" disabled>
                                                <Search size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500">Preferred Contact Number</div>
                                <div className="mt-2">
                                    <input
                                        className="w-full border-b py-2 text-sm bg-gray-50 cursor-not-allowed"
                                        value="—"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Category <span><Asterisk className="w-4" /></span>
                                </div>
                                <div className="relative">
                                    <div className="flex items-center border-b bg-gray-50 py-1">
                                        <span className="text-sm text-gray-600 py-1">Network</span>
                                        <div className="ml-auto opacity-50">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                className="text-gray-400"
                                            >
                                                <path
                                                    d="M4 6L8 10L12 6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Subcategory <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedSubcategory}
                                    onSelect={setSelectedSubcategory}
                                    options={subcategoryOptions[selectedCategory as keyof typeof subcategoryOptions]}
                                />
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Three Attempt Rule <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedThreeAttemptRule}
                                    onSelect={setSelectedThreeAttemptRule}
                                    options={threeAttemptRuleOptions}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Channel <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedChannel}
                                    onSelect={setSelectedChannel}
                                    options={channelOptions}
                                />
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    State <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedState}
                                    onSelect={setSelectedState}
                                    options={stateOptions}
                                />
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Impact <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedImpact}
                                    onSelect={setSelectedImpact}
                                    options={impactOptions}
                                />
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1 flex items-center">
                                    Urgency <span><Asterisk className="w-4" /></span>
                                </div>
                                <CategoryDropdown 
                                    selected={selectedUrgency}
                                    onSelect={setSelectedUrgency}
                                    options={urgencyOptions}
                                />
                            </div>

                            {/* Additional ServiceNow fields */}
                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1">
                                    Priority
                                </div>
                                <div className="py-1 text-sm">
                                    4 - Low
                                </div>
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1">
                                    Assignment Group
                                </div>
                                <div className="relative group">
                                    <div className="flex items-center border-b">
                                        <input
                                            type="text"
                                            className="w-full py-1 bg-transparent text-sm outline-none"
                                            placeholder="Search assignment groups..."
                                            value={assignmentGroup}
                                            onChange={(e) => setAssignmentGroup(e.target.value)}
                                        />
                                        <div className="flex items-center gap-1">
                                            <button className="p-1 rounded opacity-0 group-hover:opacity-100">
                                                <Info size={12} className="text-gray-500" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <Search size={14} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="text-xs text-gray-500 mb-1">
                                    Assigned to
                                </div>
                                <UserSearch
                                    value={assignedToUser?.name || ''}
                                    onChange={setAssignedToUser}
                                    placeholder="Search users..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment Status Messages */}
                    {/* Info box removed as requested */}
                    
                    {(assignmentError || assignmentSuccess) && (
                        <div className="mt-4">
                            {assignmentError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                    <span className="text-sm text-red-700">{assignmentError}</span>
                                </div>
                            )}
                            {assignmentSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                    <span className="text-sm text-green-700">{assignmentSuccess}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional ServiceNow sections */}
                    <div className="space-y-4 mt-6">
                        {/* Missing CI checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="missingCI"
                                className="w-4 h-4"
                            />
                            <label htmlFor="missingCI" className="text-sm text-gray-700">
                                Missing CI
                            </label>
                        </div>

                        {/* Short description */}
                        <div className="relative">
                            <div className="text-xs text-gray-500 mb-1 flex items-center">
                                Short description <span><Asterisk className="w-4" /></span>
                            </div>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-sm resize-none"
                                rows={2}
                                placeholder="Enter short description..."
                                defaultValue="problema de conectividad entre nuestro sistema y la banca"
                            />
                        </div>

                        {/* Description */}
                        <div className="relative">
                            <div className="text-xs text-gray-500 mb-1">
                                Description
                            </div>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-sm resize-none"
                                rows={4}
                                placeholder="Enter detailed description..."
                                defaultValue="problema de conectividad entre nuestro sistema y la banca. Accounts for SSS % CARRIER S DE RL DE CV were not in the original SCOPE"
                            />
                        </div>

                        {/* Notes section - collapsible (minimized) */}
                        <div className="border rounded">
                            <button 
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                    // Toggle notes section
                                    console.log("Toggle notes section");
                                }}
                            >
                                <span className="text-sm font-medium text-gray-700">Notes</span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    className="transform rotate-180 transition-transform duration-200"
                                >
                                    <path
                                        d="M4 6L8 10L12 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            {/* Content hidden by default - minimized */}
                        </div>

                        {/* Related Records section - collapsible (minimized) */}
                        <div className="border rounded">
                            <button 
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                    // Toggle related records section
                                    console.log("Toggle related records section");
                                }}
                            >
                                <span className="text-sm font-medium text-gray-700">Related Records</span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    className="transform rotate-180 transition-transform duration-200"
                                >
                                    <path
                                        d="M4 6L8 10L12 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            {/* Content hidden by default - minimized */}
                        </div>

                        {/* Resolution Information section - collapsible (minimized) */}
                        <div className="border rounded">
                            <button 
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                    // Toggle resolution information section
                                    console.log("Toggle resolution information section");
                                }}
                            >
                                <span className="text-sm font-medium text-gray-700">Resolution Information</span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    className="transform rotate-180 transition-transform duration-200"
                                >
                                    <path
                                        d="M4 6L8 10L12 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            {/* Content hidden by default - minimized */}
                        </div>
                    </div>
                </aside>

                {/* Middle column - Compose */}
                <main className="shadow-sm overflow-auto flex flex-col" style={{ borderLeft: '1px solid #CCC', marginTop: '20px', maxHeight: '400px'}}>
                    <div style={{ backgroundColor: '#F6F8F7', padding: '16px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-700">Compose</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Stacked view</span>
                                <ToggleNew
                                    // checked={stacked}
                                    // onChange={(v) => setStacked(v)}
                                    // size="sm"
                                    // ariaLabel="Stacked view toggle"
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="border-b px-4">
                                <div className="flex items-center -mb-px">
                                    <button 
                                        onClick={() => setComposeTab('comments')}
                                        className={`px-4 py-3 inline-flex items-center gap-2 text-sm border-b-2 transition-colors cursor-pointer ${
                                            composeTab === 'comments' 
                                                ? 'border-[#3C59E7] text-[#3C59E7]' 
                                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                        style={{ color: composeTab === 'comments' ? '#3C59E7' : 'black', borderBottom: composeTab === 'comments' ? '2px solid #3C59E7': '' }}
                                    >
                                        <Users className={`w-4 ${composeTab === 'comments' ? 'text-[#3C59E7]' : ''}`} style={{ color: composeTab === 'comments' ? '#3C59E7' : 'black'}} />
                                        Comments
                                    </button>
                                    <button 
                                        onClick={() => setComposeTab('worknotes')}
                                        className={`px-4 py-3 inline-flex items-center gap-2 text-sm border-b-2 transition-colors cursor-pointer ${
                                            composeTab === 'worknotes' 
                                                ? 'border-[#3C59E7] text-[#3C59E7]' 
                                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                        style={{ color: composeTab === 'worknotes' ? '#3C59E7' : 'black', borderBottom: composeTab === 'worknotes' ? '2px solid #3C59E7' : ''}}
                                    >
                                        <LockKeyhole className={`w-4 ${composeTab === 'worknotes' ? 'text-[#3C59E7]' : ''}`} />
                                        Work notes (Private)
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                {composeTab === 'comments' ? (
                                    <>
                                        <textarea
                                            rows={4}
                                            className="w-full text-sm border-0 bg-transparent resize-none placeholder:text-gray-400 focus:ring-0"
                                            placeholder="Enter your Comments here"
                                        />

                                        <div className="flex items-center justify-between pt-3 border-t mt-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 7c0-2.898 2.352-5.25 5.25-5.25S12.25 4.102 12.25 7s-2.352 5.25-5.25 5.25S1.75 9.898 1.75 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M7 4.375v.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M6.125 7H7v2.625h.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Everyone can see this comment
                                            </div>
                                            <button 
                                                className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 border rounded-md"
                                                style={{ marginTop: '10px', opacity: 0.5 }}
                                            >
                                                Post Comments
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <textarea
                                            rows={4}
                                            className="w-full text-sm border-0 bg-transparent resize-none placeholder:text-gray-400 focus:ring-0"
                                            placeholder="Enter work notes here (Private)"
                                        />
                                        <div className="flex items-center justify-end pt-3 border-t mt-2">
                                            <button 
                                                className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 border rounded-md"
                                                style={{ marginTop: '10px', opacity: 0.5 }}
                                            >
                                                Post Work Notes
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 className="text-sm text-gray-600">Activity</h4>
                                <p style={{ backgroundColor: '#EEE', padding: '4px 8px', borderRadius: '4px', fontSize: '11px'}}>4</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Funnel size={16} className="text-gray-500" />
                                <Search size={16} className="text-gray-500" />
                                <ArrowDownWideNarrow size={16} className="text-gray-500" />
                                <Maximize2 size={16} className="text-gray-500" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* <div className="border rounded p-3 bg-gray-50 text-sm">No recent activity</div>
                            <div className="text-xs text-gray-400">—</div> */}
                            {activities?.map(activity => <ActivityCard title={activity.title} timestamp={activity.timestamp} comment={activity.comment} />)}
                        </div>
                    </div>
                </main>

                {/* Right column - Agent Assist */}
                <aside className="p-4 bg-white shadow-sm overflow-auto" style={{ borderLeft: '1px solid #CCC', maxHeight: '400px'}}>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg flex-1" style={{ fontWeight: 400 }}>Agent Assist</h3>
                    </div>

                    <div className="mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', }}>
                        <div className="relative flex items-center" style={{ width: '100%'}}>
                            <input
                                className="w-full py-2 text-sm"
                                placeholder="problema de conectividad..."
                                style={{ padding: '8px 12px 8px 40px', color: '#666', borderBottom: '1px solid #666'}}
                            />
                            <div className="absolute top-2.5" style={{ paddingLeft: '10px', color: '#666'}}>
                                <Search size={16} />
                            </div>
                        </div>

                        <div style={{ padding: '2px 6px', border: '1px solid black', width: 'max-content'}}><SlidersHorizontal className="w-4" /></div>
                    </div>

                    <div className="space-y-3" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {articles.map((a, idx) => (
                            <div key={idx} className="border rounded p-3 bg-white hover:shadow p-4">
                                <p style={{ fontSize: '12px', display: 'flex', alignItems: 'center', columnGap: '6px', color: '#333'}}><Newspaper className="w-3" />Article</p>
                                <div className="text-sm font-medium mb-2">{a.title}</div>
                                <div className="text-xs text-gray-500 mb-2 truncate">{a.excerpt}</div>
                                <div className="text-xs text-gray-400">{a.meta}</div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
            <div style={{ width: '40px', borderLeft: '1px solid #DDD'}}>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40px',
                        color: quickLinks === 'graduation' ? '#3C59E7' : 'black',
                        cursor: 'pointer'
                    }}
                    onClick={() => setQuickLinks('graduation')}
                ><GraduationCap className="w-4" /></div>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40px',
                        color: quickLinks === 'pin' ? '#3C59E7' : 'black',
                        cursor: 'pointer'
                    }}
                    onClick={() => setQuickLinks('pin')}
                ><Paperclip className="w-4" /></div>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '40px',
                        color: quickLinks === 'document' ? '#3C59E7' : 'black',
                        cursor: 'pointer'
                    }}
                    onClick={() => setQuickLinks('document')}
                ><FileText className="w-4" /></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1200px] mx-auto bg-white shadow-sm rounded-md">
            {/* Header area */}
            <div className="px-6 py-5 border-b flex items-start justify-between gap-4" style={{ paddingTop: '20px'}}>
                <div className="flex-1">
                    <h1
                        className="text-xl font-semibold text-gray-800"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        {incident.title}
                        <Tag style={{ width: '16px' }} />
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2 items-center" style={{ columnGap: '24px' }}>
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Priority</p>
                            <div
                                style={{
                                    backgroundColor: '#D7D4F3',
                                    borderColor: '#FFD8A8',
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}
                            >
                                <span style={{ color: '#5858C6' }}>● &nbsp;</span>{incident.priority}
                            </div>
                        </div>
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>State</p>
                            <span className="text-sm">{incident.category}</span>
                        </div>
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Service</p>
                            <span className="font-medium" style={{ color: '#7092BE' }}>{incident.service}</span>
                        </div>
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Category</p>
                            <span className="text-sm ml-2">{incident.category}</span>
                        </div>
                    </div>

                    <div className="mt-4 border-b border-gray-200">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="bg-transparent border-0">
                                <TabsTrigger
                                    value="details"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'details' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="task-slas"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'task-slas' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    Task SLAs (6)
                                </TabsTrigger>
                                <TabsTrigger
                                    value="affected-cis"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'affected-cis' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    Affected CIs (1)
                                </TabsTrigger>
                                <TabsTrigger
                                    value="impacted-services"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'impacted-services' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    Impacted Services/CIs (1)
                                </TabsTrigger>
                                <TabsTrigger
                                    value="service-offerings"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'service-offerings' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    Service Offerings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="more"
                                    className="relative px-4 py-2 text-sm text-gray-600 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 rounded-none bg-transparent hover:text-indigo-600"
                                    style={{ borderBottom: activeTab === 'more' ? '2px solid #4F46E5' : '2px solid transparent' }}
                                >
                                    More ▾
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <button 
                        className={`inline-flex items-center gap-2 border px-3 py-1.5 text-sm mr-2 cursor-pointer ${
                            (isAssigning || isSaved) 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : assignedToUser 
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                    : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={assignedToUser && !isSaved ? handleAssignIncident : undefined}
                        disabled={isAssigning || isSaved}
                        title={isSaved ? 'Saved' : (assignedToUser ? 'Save and assign incident' : 'Save incident')}
                    >
                        {isAssigning ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                                Assigning...
                            </>
                        ) : isSaved ? (
                            <>
                                <Save size={16} />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save size={16} /> 
                                {assignedToUser ? 'Save & Assign' : 'Save'}
                            </>
                        )}
                    </button>
                    <button 
                        className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm bg-gray-50 cursor-pointer mr-2"
                        onClick={() => addEmailDraftTab(activeTabId)}
                    >
                        <Mail size={16} /> Compose Email
                    </button>
                    <button className="p-2 border bg-gray-50 cursor-pointer">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsContent value="details" className="m-0">
                    <DetailsContent incident={incident} articles={articles} />
                </TabsContent>
                <TabsContent value="task-slas" className="m-0">
                    <div className="p-6">
                        <div className="text-gray-500">Task SLAs content will be implemented later</div>
                    </div>
                </TabsContent>
                <TabsContent value="affected-cis" className="m-0">
                    <div className="p-6">
                        <div className="text-gray-500">Affected CIs content will be implemented later</div>
                    </div>
                </TabsContent>
                <TabsContent value="impacted-services" className="m-0">
                    <div className="p-6">
                        <div className="text-gray-500">Impacted Services content will be implemented later</div>
                    </div>
                </TabsContent>
                <TabsContent value="service-offerings" className="m-0">
                    <div className="p-6">
                        <div className="text-gray-500">Service Offerings content will be implemented later</div>
                    </div>
                </TabsContent>
                <TabsContent value="more" className="m-0">
                    <div className="p-6">
                        <div className="text-gray-500">Additional options will be implemented later</div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
