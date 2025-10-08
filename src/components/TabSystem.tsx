import { Home, X, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useTab } from "../context/TabContext";

export function TabSystem() {
  const { tabs, activeTabId, closeTab, switchTab } = useTab();

  return (
    <div className="bg-[#e9ecef] flex items-center pr-2 h-10" style={{ borderBottom: '1px solid #777' }}>
      <div className="flex items-center flex-1">
        {tabs.filter(tab => tab.type !== 'email').map((tab) => (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex items-center px-3 py-3 mx-0.5 rounded-t text-sm cursor-pointer ${
              activeTabId === tab.id ? "bg-white" : "text-gray-600"
            }`}
            style={{ 
              borderRight: '1px solid #777', 
              borderBottom: activeTabId === tab.id ? '' : '1px solid #111' 
            }}
          >
            {tab.icon && <tab.icon className="w-3 h-3 mr-2" />}
            <span className="mr-2">{tab.title}</span>
            {tab.closeable && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-4 w-4 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #CCC', paddingLeft: '10px' }}>
        <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}