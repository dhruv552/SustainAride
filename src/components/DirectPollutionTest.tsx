import React, { useState } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface TestAQIData {
  aqi: number;
  location: string;
  level: string;
  color: string;
  timestamp: string;
  status: 'normal' | 'alert';
}

/**
 * A completely self-contained pollution mode test component
 * This component includes both the button and the alert card in one file
 * Works without any API calls or external dependencies
 */
const DirectPollutionTest: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [testData] = useState<TestAQIData>({
    aqi: 350,
    location: 'Delhi, India (Test Mode)',
    level: 'Hazardous',
    color: '#7E0023',
    timestamp: new Date().toISOString(),
    status: 'alert'
  });
  
  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };
  
  return (
    <div className="w-full mb-8">
      <Button 
        onClick={toggleAlert} 
        variant={showAlert ? "destructive" : "outline"}
        size="sm"
        className="flex items-center gap-2 mb-4"
      >
        <AlertTriangle className="h-4 w-4" />
        {showAlert ? 'Hide Pollution Alert' : 'Show Test Pollution Alert'}
      </Button>
      
      {showAlert && (
        <div className="w-full mb-6 animate-slideDown">
          <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: testData.color }}>
            <div className="relative overflow-hidden">
              {/* Background gradient based on AQI color */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                  background: `linear-gradient(90deg, ${testData.color} 0%, transparent 100%)` 
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
                        style={{ color: testData.color }}
                      >
                        {testData.aqi}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase font-semibold text-muted-foreground">Level</span>
                      <span className="font-medium" style={{ color: testData.color }}>{testData.level}</span>
                      <span className="text-xs">{testData.location}</span>
                    </div>
                  </div>
                </div>
                
                {/* Extra Rewards Section */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Extra rewards during high pollution:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center p-2 bg-green-50 rounded-md">
                      <span className="text-sm">🚖 +20 Eco Points for CNG</span>
                    </div>
                    <div className="flex items-center p-2 bg-blue-50 rounded-md">
                      <span className="text-sm">⚡ +30 Eco Points for EV</span>
                    </div>
                    <div className="flex items-center p-2 bg-amber-50 rounded-md">
                      <span className="text-sm">🤝 +15 Eco Points for Shared Ride</span>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => alert('Eco bonus claimed! Points will be added to your next green ride.')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Claim Eco Bonus
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DirectPollutionTest;