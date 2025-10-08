import React, { createContext, useContext, ReactNode } from 'react';
import { Home } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  icon?: any;
  closeable: boolean;
  type: 'home' | 'incident' | 'email';
  incidentNumber?: string;
  parentId?: string;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string;
  activeSecondaryTabId: string | null;
  addTab: (incidentNumber: string) => void;
  addEmailDraftTab: (parentId: string) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  switchSecondaryTab: (tabId: string | null) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = React.useState<Tab[]>([
    { id: "home", title: "Home", icon: Home, closeable: false, type: 'home' },
  ]);
  const [activeTabId, setActiveTabId] = React.useState("home");
  const [activeSecondaryTabId, setActiveSecondaryTabId] = React.useState<string | null>(null);

  const addTab = (incidentNumber: string) => {
    const existingTab = tabs.find(tab => tab.incidentNumber === incidentNumber);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: `incident-${incidentNumber}`,
      title: incidentNumber,
      closeable: true,
      type: 'incident',
      incidentNumber
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      const newActiveTab = newTabs[newTabs.length - 1];
      setActiveTabId(newActiveTab.id);
    }
  };

  const addEmailDraftTab = (parentId: string) => {
    const newTab: Tab = {
      id: `email-${Date.now()}`,
      title: "New Email Draft",
      closeable: true,
      type: 'email',
      parentId
    };
    setTabs(prev => [...prev, newTab]);
    setActiveSecondaryTabId(newTab.id);
  };

  const switchTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.type === 'email') {
      setActiveSecondaryTabId(tabId);
    } else {
      setActiveTabId(tabId);
      setActiveSecondaryTabId(null);
    }
  };

  const switchSecondaryTab = (tabId: string | null) => {
    setActiveSecondaryTabId(tabId);
  };

  return (
    <TabContext.Provider value={{ 
      tabs, 
      activeTabId, 
      activeSecondaryTabId,
      addTab, 
      addEmailDraftTab, 
      closeTab, 
      switchTab,
      switchSecondaryTab 
    }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
}