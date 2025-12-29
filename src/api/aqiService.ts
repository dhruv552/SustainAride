import apiClient from './apiClient';

// Simple custom event emitter for browser compatibility
class SimpleEventEmitter {
  private events: { [key: string]: Array<(data: any) => void> } = {};

  on(event: string, callback: (data: any) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      setTimeout(() => callback(data), 0);
    });
  }

  // Add public method to get events
  getEvents(): { [key: string]: Array<(data: any) => void> } {
    return this.events;
  }
}

interface AQIResponse {
  aqi: number;
  location: string;
  timestamp: string;
  status: 'normal' | 'alert';
}

interface AQIDataWithLevel extends AQIResponse {
  level: string;
  color: string;
}

class AQIService {
  private pollInterval: number = 1800000; // 30 minutes in milliseconds
  private intervalId: number | null = null; // Changed from NodeJS.Timeout to number for browser compatibility
  private emitter: SimpleEventEmitter;
  private currentData: AQIDataWithLevel | null = null;
  private testMode: boolean = false;

  constructor() {
    this.emitter = new SimpleEventEmitter();
    // Start polling when service is instantiated
    this.startPolling();
  }

  /**
   * Get the current AQI data for Delhi
   */
  async getDelhiAQI(): Promise<AQIDataWithLevel> {
    // Return cached data if available
    if (this.currentData) {
      return this.currentData;
    }
    
    // Otherwise fetch fresh data
    try {
      const response = await apiClient.get<AQIResponse>('/api/aqi/delhi');
      
      const { aqi, location } = response;
      const { level, color } = this.getAQILevel(aqi);
      
      this.currentData = {
        ...response,
        level,
        color
      };
      
      return this.currentData;
    } catch (error) {
      console.error('Failed to fetch AQI data:', error);
      
      // Return fallback data when API fails
      const fallbackData: AQIDataWithLevel = {
        aqi: 80,
        location: 'Delhi, India (Fallback)',
        level: 'Moderate',
        color: '#FFFF00',
        timestamp: new Date().toISOString(),
        status: 'normal'
      };
      
      this.currentData = fallbackData;
      return fallbackData;
    }
  }
  
  /**
   * Check if there's a current pollution alert
   */
  async checkPollutionAlert(): Promise<{isAlert: boolean; aqi: number}> {
    return apiClient.get<{isAlert: boolean; aqi: number}>('/api/aqi/alert-status');
  }
  
  /**
   * Subscribe to AQI updates
   * @param callback Function to call when AQI data is updated
   * @returns Unsubscribe function
   */
  subscribeToUpdates(callback: (data: AQIDataWithLevel) => void): () => void {
    this.emitter.on('aqi-update', callback);
    
    // If we have current data, emit it immediately
    if (this.currentData) {
      setTimeout(() => callback(this.currentData!), 0);
    } else {
      // Otherwise fetch it first
      this.getDelhiAQI()
        .then(data => callback(data))
        .catch(err => console.error('Error fetching initial AQI data:', err));
    }
    
    // Return unsubscribe function
    return () => {
      this.emitter.off('aqi-update', callback);
    };
  }
  
  /**
   * Start polling for AQI updates
   */
  private startPolling(): void {
    // Clear any existing interval
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
    
    // Do an initial fetch
    this.updateAQIData();
    
    // Set up interval for regular updates
    this.intervalId = window.setInterval(() => {
      this.updateAQIData();
    }, this.pollInterval);
  }
  
  /**
   * Stop polling for AQI updates
   */
  stopPolling(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Fetch and update AQI data
   */
  private async updateAQIData(): Promise<void> {
    // Skip API call if in test mode
    if (this.testMode) {
      console.log('In test mode, skipping API call');
      return;
    }
    
    try {
      const response = await apiClient.get<AQIResponse>('/api/aqi/delhi');
      
      const { aqi, location } = response;
      const { level, color } = this.getAQILevel(aqi);
      
      const newData: AQIDataWithLevel = {
        ...response,
        level,
        color
      };
      
      // Update cached data
      this.currentData = newData;
      
      // Notify subscribers
      this.emitter.emit('aqi-update', newData);
    } catch (error) {
      console.error('Failed to update AQI data:', error);
      
      // Use fallback data if API fails
      if (!this.currentData) {
        const fallbackData: AQIDataWithLevel = {
          aqi: 80,
          location: 'Delhi, India (Fallback)',
          level: 'Moderate',
          color: '#FFFF00',
          timestamp: new Date().toISOString(),
          status: 'normal'
        };
        
        this.currentData = fallbackData;
        this.emitter.emit('aqi-update', fallbackData);
      }
    }
  }
  
  /**
   * Get AQI level description and color based on value
   */
  private getAQILevel(aqi: number): { level: string; color: string } {
    if (aqi <= 50) return { level: 'Good', color: '#00E400' };
    if (aqi <= 100) return { level: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#99004C' };
    return { level: 'Hazardous', color: '#7E0023' };
  }

  /**
   * Test function to simulate high AQI for testing EmergencyPollutionMode
   */
  simulateHighAQI(): void {
    console.log('Simulating high AQI levels for testing');
    
    // Create mock data with very high AQI
    const testData: AQIDataWithLevel = {
      aqi: 350, // Very high AQI value to ensure it triggers the alert
      location: 'Delhi, India (Test Mode)',
      level: 'Hazardous', 
      color: '#7E0023',
      timestamp: new Date().toISOString(),
      status: 'alert'
    };
    
    // Update cached data
    this.currentData = testData;
    this.testMode = true;
    
    // Force EmergencyPollutionMode to appear by directly broadcasting the high AQI data
    window.dispatchEvent(new CustomEvent('force-pollution-alert', { detail: testData }));
    
    // Make sure all subscribers get this update immediately
    try {
      const events = this.emitter.getEvents();
      if (events && events['aqi-update'] && events['aqi-update'].length > 0) {
        console.log('Found subscribers to notify:', events['aqi-update'].length);
        events['aqi-update'].forEach(callback => {
          // Call directly instead of using setTimeout to ensure immediate execution
          callback(testData);
        });
      } else {
        console.warn('No subscribers found for aqi-update event, using custom event instead');
      }
    } catch (err) {
      console.error('Error notifying subscribers:', err);
    }
  }

  /**
   * Reset AQI to normal values after testing
   */
  resetAQI(): void {
    this.testMode = false;
    // Force a fresh update from the API
    this.currentData = null;
    this.updateAQIData();
  }

  /**
   * Check if currently in test mode
   */
  isInTestMode(): boolean {
    return this.testMode;
  }
}

// Create singleton instance
const aqiService = new AQIService();
export default aqiService;