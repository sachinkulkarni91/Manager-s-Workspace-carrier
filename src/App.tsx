import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { TabSystem } from "./components/TabSystem";
import { MainContent } from "./components/MainContent";
import { TabProvider } from "./context/TabContext";
import { IncidentsProvider } from "./context/IncidentsContext";

export default function App() {
  return (
    <IncidentsProvider>
      <TabProvider>
        <div className="h-screen flex flex-col bg-white">
          <Navbar />

          {/* Main layout with sidebar */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col">
              <TabSystem />
              <MainContent />
            </div>
          </div>
        </div>
      </TabProvider>
    </IncidentsProvider>
  );
}