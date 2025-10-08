import { useTab } from '../context/TabContext';
import IncidentDetails from './incident/IncidentDetails';
import { EmailDraft } from './email/EmailDraft';
import { MyWorkTable } from './MyWorkTable';
import { UnassignedIncidentsTable } from './UnassignedIncidentsTable';
import { HappeningNowCards } from './HappeningNowCards';
import { OrganizationalPerformanceCards } from './OrganizationalPerformanceCards';
import { RefreshCw } from 'lucide-react';

export function MainContent() {
  const { activeTabId, activeSecondaryTabId, tabs, switchTab, closeTab, switchSecondaryTab } = useTab();

  // Find the current active tab and email drafts
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const activeIncidentTab = activeTab?.type === 'incident' ? activeTab : null;
  
  if (activeIncidentTab) {
    // Get all associated email drafts for this incident
    const emailDrafts = tabs.filter(tab => tab.type === 'email' && tab.parentId === activeIncidentTab.id);
    const activeEmailDraft = emailDrafts.find(draft => draft.id === activeTabId);
      
    return (
      <div className="flex-1 overflow-auto bg-white">
        <div style={{ borderBottom: '1px solid #CCC' }}>
          <div style={{ display: 'flex', margin: '18px 0 0 20px', gap: '8px' }}>
            <div 
              style={{
                border: !activeSecondaryTabId ? '2px solid #15347D' : '2px solid transparent',
                padding: '5px 36px',
                width: 'fit-content',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onClick={() => switchSecondaryTab(null)}
            >
              Details
            </div>
            {emailDrafts.map(draft => (
              <div 
                key={draft.id}
                style={{
                  border: activeSecondaryTabId === draft.id ? '2px solid #15347D' : '2px solid transparent',
                  padding: '5px 8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => switchSecondaryTab(draft.id)}
              >
                <span>New Email Draft</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(draft.id);
                  }}
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>
        {activeSecondaryTabId && tabs.find(t => t.id === activeSecondaryTabId)?.type === 'email' ? 
          <EmailDraft /> : 
          <IncidentDetails />
        }
      </div>
    );
  }

  // Show home dashboard for home tab
  return (
    <div className="flex-1 overflow-auto p-4 bg-white">
      <div className="flex gap-4 h-full">
        {/* Left section - Tables */}
        <div className="space-y-4 min-w-0 flex-shrink-0" style={{ width: '870px' }}>
          {/* My Work Table Container */}
          <div className="bg-gray-50 rounded border border-gray-200 p-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="text-lg font-medium">My Work</h3>
              <RefreshCw className='w-4' />
            </div>
            <div className="bg-white px-4 py-3">
              <MyWorkTable />
            </div>
          </div>
          
          {/* Unassigned Incidents Table Container */}
          <div className="bg-gray-50 rounded border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Unassigned Incidents</h3>
            <div className="bg-white px-4 py-3">
              <UnassignedIncidentsTable />
            </div>
          </div>
        </div>
        
        {/* Right section - Dashboard cards */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="bg-gray-50 rounded border border-gray-200">
            <HappeningNowCards />
          </div>
          <div className="bg-gray-50 rounded border border-gray-200">
            <OrganizationalPerformanceCards />
          </div>
        </div>
      </div>
    </div>
  );
}