export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mock AQI data for Delhi
    return res.status(200).json({
      city: 'Delhi',
      aqi: 156,
      category: 'Unhealthy',
      timestamp: new Date().toISOString(),
      pollutants: {
        pm25: 89,
        pm10: 156,
        no2: 45,
        so2: 12,
        co: 1.2,
        o3: 34
      }
    });
  } catch (error) {
    console.error('AQI fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch AQI data',
      message: error.message
    });
  }
}