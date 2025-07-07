import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, User as UserIcon, Mail, Phone, Award, Calendar, AlertTriangle } from 'lucide-react';
import EmergencyPollutionMode from './EmergencyPollutionMode';
import PollutionTestButton from './PollutionTestButton';
import DirectPollutionTest from './DirectPollutionTest';
import aqiService from '../api/aqiService';

const Dashboard: React.FC = () => {
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

    // Show loading indicator while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    // Format date to be more readable
    const formatDate = (date: string | Date) => {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        return parsedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-center md:text-left">Welcome to your SustainAride Dashboard</h1>
            </div>
            
            {/* Direct Pollution Test - fully self-contained */}
            <DirectPollutionTest />
            
            {/* Previous implementation - kept for reference */}
            {/* <div className="mb-4">
                <PollutionTestButton />
            </div> */}

            {/* Emergency Pollution Mode Alert - will only display when AQI > 200 */}
            {/* <EmergencyPollutionMode /> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">{user.name}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Joined: {formatDate(user.joinDate || user.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                                <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Sustain Points: {user.sustainPoints || 0}</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => logout()}
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your recent rides and activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.rides && user.rides.length > 0 ? (
                            <div className="space-y-4">
                                {/* Render rides here when available */}
                                <p>You have {user.rides.length} rides in your history.</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No recent activity yet.</p>
                                <p className="mt-2">Book your first sustainable ride now!</p>
                                <Button className="mt-4">Book a Ride</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;