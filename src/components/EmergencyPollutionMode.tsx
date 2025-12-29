import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, Wind, Zap, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import aqiService from '../api/aqiService';
import apiClient from '../api/apiClient';

// Interface for AQI data
interface AQIData {
  aqi: number;
  location: string;
  level: string;
  color: string;
  timestamp?: string;
  status?: 'normal' | 'alert';
}

const EmergencyPollutionMode: React.FC = () => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  // Use subscription model to get AQI updates
  useEffect(() => {
    console.log('EmergencyPollutionMode component mounted');
    setLoading(true);
    
    // Subscribe to AQI updates
    const unsubscribe = aqiService.subscribeToUpdates(data => {
      console.log('AQI update received in EmergencyPollutionMode:', data);
      setAqiData(data);
      const shouldShow = data.aqi > 200;
      console.log('Should show pollution alert?', shouldShow, 'AQI value:', data.aqi);
      setIsVisible(shouldShow);
      setLoading(false);
    });
    
    // Also listen for the custom force-pollution-alert event
    const handleForceAlert = (event: CustomEvent<AQIData>) => {
      console.log('Force pollution alert event received:', event.detail);
      setAqiData(event.detail);
      setIsVisible(true);
      setLoading(false);
    };
    
    window.addEventListener('force-pollution-alert', handleForceAlert as EventListener);
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('EmergencyPollutionMode component unmounting');
      unsubscribe();
      window.removeEventListener('force-pollution-alert', handleForceAlert as EventListener);
    };
  }, []);

  // Add a debug message when visibility changes
  useEffect(() => {
    console.log('EmergencyPollutionMode visibility changed:', isVisible);
  }, [isVisible]);

  const handleClaimBonus = async () => {
    if (!user?._id) {
      alert('You must be logged in to claim bonus points.');
      return;
    }
    
    try {
      setClaimingBonus(true);
      await apiClient.post('/api/rewards/claim-eco-bonus', {
        userId: user._id,
        timestamp: new Date().toISOString(),
        actionType: 'pollution_alert_opt_in'
      });
      
      alert('Thank you for committing to eco-friendly rides! Extra points will be added to your next green ride.');
    } catch (err) {
      console.error('Error claiming bonus:', err);
      alert('There was an error claiming your eco bonus. Please try again.');
    } finally {
      setClaimingBonus(false);
    }
  };

  // If AQI is not high enough or still loading, don't show anything
  if (!isVisible || loading) {
    console.log('EmergencyPollutionMode not showing:', { isVisible, loading });
    return null;
  }

  // If there was an error fetching data
  if (error) return null;

  // Render component with animation
  return (
    <div className="w-full mb-6 animate-slideDown">
      <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: aqiData?.color }}>
        <div className="relative overflow-hidden">
          {/* Background gradient based on AQI color */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              background: `linear-gradient(90deg, ${aqiData?.color} 0%, transparent 100%)` 
            }}
          />
          
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Alert Info */}
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 mr-3 text-red-500 animate-pulse" />
                <div>
                  <h3 className="font-bold text-lg text-red-500">High pollution alert!</h3>
                  <p className="text-sm md:text-base">Help Delhi breathe. Take a CNG, EV, or shared ride today.</p>
                </div>
              </div>
              
              {/* AQI Info */}
              <div className="flex items-center bg-black/5 rounded-lg p-2">
                <div className="flex flex-col items-center mr-3">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">Current AQI</span>
                  <span 
                    className="text-2xl font-bold" 
                    style={{ color: aqiData?.color }}
                  >
                    {aqiData?.aqi}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">Level</span>
                  <span className="font-medium" style={{ color: aqiData?.color }}>{aqiData?.level}</span>
                  <span className="text-xs">{aqiData?.location}</span>
                </div>
              </div>
            </div>
            
            {/* Extra Rewards Section */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Extra rewards during high pollution:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center p-2 bg-green-50 rounded-md">
                  <Wind className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">🚖 +20 Eco Points for CNG</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-md">
                  <Zap className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">⚡ +30 Eco Points for EV</span>
                </div>
                <div className="flex items-center p-2 bg-amber-50 rounded-md">
                  <Users className="h-4 w-4 mr-2 text-amber-600" />
                  <span className="text-sm">🤝 +15 Eco Points for Shared Ride</span>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleClaimBonus} 
                disabled={claimingBonus} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {claimingBonus ? 'Claiming...' : 'Claim Eco Bonus'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default EmergencyPollutionMode;