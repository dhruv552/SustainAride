import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { LogOut, User, Settings, AlertTriangle } from 'lucide-react';
import aqiService from '../api/aqiService';

const AuthHeader: React.FC = () => {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const [testModeActive, setTestModeActive] = useState(false);

    // Toggle high AQI for testing
    const toggleTestMode = () => {
        if (testModeActive) {
            // Reset to normal AQI
            aqiService.resetAQI();
            setTestModeActive(false);
        } else {
            // Simulate high AQI
            aqiService.simulateHighAQI();
            setTestModeActive(true);
        }
    };

    if (loading) {
        return <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>;
    }

    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-4">
                {/* Test Pollution Alert Button */}
                <Button 
                    onClick={toggleTestMode} 
                    variant={testModeActive ? "destructive" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <AlertTriangle className="h-4 w-4" />
                    {testModeActive ? 'Pollution Mode ON' : 'Test Pollution'}
                </Button>
                
                <span className="text-sm font-medium hidden md:inline-block">
                    Welcome, {user.name}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                {user.profilePicture ? (
                                    <AvatarImage src={user.profilePicture} alt={user.name} />
                                ) : null}
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="cursor-pointer flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link to="/signup">Sign Up</Link>
            </Button>
        </div>
    );
};

// Helper function to get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

export default AuthHeader;