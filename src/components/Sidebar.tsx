import { Home, List, ChartNoAxesCombined } from "lucide-react";
import { Button } from "./ui/button";
import { useTab } from "../context/TabContext";

export function Sidebar() {
  const { switchTab } = useTab();

  const handleHomeClick = () => {
    switchTab("home");
  };

  return (
    <div className=" border-r border-gray-600 flex flex-col" style={{ background: 'linear-gradient(#152E75, #177EDD)' }}>
      <nav className="space-y-1 flex flex-col items-center">
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 justify-center text-white hover:bg-blue-700"
          style={{ backgroundColor: '#0F235D' }}
          onClick={handleHomeClick}
        >
          <Home className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          className="w-8 h-8 p-0 justify-center text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          className="w-8 h-8 p-0 justify-center text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <ChartNoAxesCombined className="w-4 h-4" />
        </Button>
      </nav>
    </div>
  );
}