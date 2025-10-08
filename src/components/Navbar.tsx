import { Search, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import logo from '../styles/media/logo.png'

export function Navbar() {
  return (
    <div className="h-12 text-white flex items-center justify-between pr-4 border-b border-gray-600" style={{ background: 'linear-gradient(to right, #152E75, #177EDD)'}}>
      {/* Logo */}
      <div className="flex items-center">
        <div className="mr-3" >
          <img src={logo} width={60} alt="Carrier" className="object-contain" style={{ marginLeft: '10px'}} />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
          <Search className="w-4 h-4" style={{ color: '#B6C5C8'}} />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <Bell className="w-4 h-4" style={{ color: '#B6C5C8'}} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>No new notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 flex items-center">
              <User className="w-4 h-4 mr-1" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}