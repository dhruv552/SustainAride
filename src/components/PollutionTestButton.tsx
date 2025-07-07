import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * A standalone button component for testing the EmergencyPollutionMode
 * Does not require API calls - works directly through browser events
 */
const PollutionTestButton: React.FC = () => {
  const [testModeActive, setTestModeActive] = useState(false);

  // Toggle test mode
  const toggleTestMode = () => {
    if (testModeActive) {
      // Reset test mode
      window.dispatchEvent(new CustomEvent('reset-pollution-alert'));
      setTestModeActive(false);
    } else {
      // Create test data with hazardous AQI level
      const testData = {
        aqi: 350,
        location: 'Delhi, India (Test Mode)',
        level: 'Hazardous', 
        color: '#7E0023',
        timestamp: new Date().toISOString(),
        status: 'alert'
      };

      // Dispatch custom event to force pollution alert
      window.dispatchEvent(new CustomEvent('force-pollution-alert', { detail: testData }));
      setTestModeActive(true);
    }
  };

  return (
    <Button 
      onClick={toggleTestMode} 
      variant={testModeActive ? "destructive" : "outline"}
      size="sm"
      className="flex items-center gap-2 mb-4"
    >
      <AlertTriangle className="h-4 w-4" />
      {testModeActive ? 'Disable Test Alert' : 'Test Pollution Alert'}
    </Button>
  );
};

export default PollutionTestButton;