import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stethoscope, LogOut, Settings, ChevronDown } from "lucide-react";

interface AppNavProps {
  userName?: string;
  role?: string;
  hospitalName?: string;
  onSettings?: () => void;
}

const roleLabel: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital_admin: "Hospital Admin",
  admin: "Platform Admin",
};

export const AppNav = ({ userName, role, hospitalName, onSettings }: AppNavProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Stethoscope className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm bg-gradient-hero bg-clip-text text-transparent hidden sm:block">
            Medweb Care
          </span>
        </Link>

        {/* Hospital name (middle) */}
        {hospitalName && (
          <span className="text-sm font-medium text-muted-foreground hidden md:block truncate max-w-xs">
            {hospitalName}
          </span>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 pr-2 pl-1" data-testid="user-menu">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-hero text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium leading-none">{userName || "User"}</p>
                {role && (
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">
                    {roleLabel[role] || role}
                  </p>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onSettings && (
              <>
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
