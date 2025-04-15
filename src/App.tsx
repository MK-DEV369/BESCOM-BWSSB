import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Home, Droplet, Zap, Settings } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface GeoDataItem {
  isSimulated: any;
  id: number;
  zone: string;
  lat: number;
  lng: number;
  consumption: number;
  perCapita: number;
  sustainability: number;
}

// Main App Component
export default function SustainableUtilitiesDashboard() {
  // State for the active utility view (water or electricity)
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState('month');
  
  // State for simulation controls
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [waterConservationFactor, setWaterConservationFactor] = useState(0);
  const [energyEfficiencyFactor, setEnergyEfficiencyFactor] = useState(0);
  
  // State for map data
  interface WaterConsumption {
    id: number;
    zone: string;
    lat: number;
    lng: number;
    consumption: number;
    perCapita: number;
    sustainability: number;
  }
  
  const [waterConsumptionData, setWaterConsumptionData] = useState<WaterConsumption[]>([]);
  interface ElectricityConsumption {
    id: number;
    zone: string;
    lat: number;
    lng: number;
    consumption: number;
    perCapita: number;
    sustainability: number;
  }
  
  const [electricityConsumptionData, setElectricityConsumptionData] = useState<ElectricityConsumption[]>([]);
  const [, setSelectedZone] = useState<WaterConsumption | ElectricityConsumption | null>(null);
  
  // State for map view settings
  const [mapView, setMapView] = useState('heatmap');
  const [showSustainabilityScore, setShowSustainabilityScore] = useState(true);

  // Fetch initial data (would be replaced with real API calls)
  useEffect(() => {
    // Simulate fetching water consumption data
    fetchWaterConsumptionData();
    
    // Simulate fetching electricity consumption data
    fetchElectricityConsumptionData();
  }, [timePeriod]);
  
  // Example data fetching function (to be replaced with actual API calls)
  const fetchWaterConsumptionData = () => {
    // This would be an API call in a real implementation
    const mockWaterData = [
      { id: 1, zone: 'North', lat: 13.0327, lng: 77.5909, consumption: 4500000, perCapita: 125, sustainability: 65 },
      { id: 2, zone: 'South', lat: 12.9299, lng: 77.6048, consumption: 5200000, perCapita: 145, sustainability: 52 },
      { id: 3, zone: 'East', lat: 12.9784, lng: 77.6408, consumption: 3800000, perCapita: 115, sustainability: 78 },
      { id: 4, zone: 'West', lat: 12.9715, lng: 77.5750, consumption: 4100000, perCapita: 130, sustainability: 71 },
      { id: 5, zone: 'Central', lat: 12.9716, lng: 77.5946, consumption: 2900000, perCapita: 95, sustainability: 82 },
    ];
    
    setWaterConsumptionData(mockWaterData);
  };
  
  const fetchElectricityConsumptionData = () => {
    // This would be an API call in a real implementation
    const mockElectricityData = [
      { id: 1, zone: 'North', lat: 13.0327, lng: 77.5909, consumption: 8500000, perCapita: 235, sustainability: 58 },
      { id: 2, zone: 'South', lat: 12.9299, lng: 77.6048, consumption: 9200000, perCapita: 255, sustainability: 49 },
      { id: 3, zone: 'East', lat: 12.9784, lng: 77.6408, consumption: 7500000, perCapita: 225, sustainability: 64 },
      { id: 4, zone: 'West', lat: 12.9715, lng: 77.5750, consumption: 8000000, perCapita: 240, sustainability: 61 },
      { id: 5, zone: 'Central', lat: 12.9716, lng: 77.5946, consumption: 6200000, perCapita: 205, sustainability: 76 },
    ];
    
    setElectricityConsumptionData(mockElectricityData);
  };

  // Function to process data based on simulation factors
  const getProcessedData = (originalData: WaterConsumption[] | typeof electricityConsumptionData, conservationFactor: number, utilityType: string) => {
    if (!simulationEnabled || conservationFactor === 0) return originalData;
    
    return originalData.map(item => {
      const reductionMultiplier = 1 - (conservationFactor / 100);
      const newConsumption = Math.round(item.consumption * reductionMultiplier);
      const newPerCapita = Math.round(item.perCapita * reductionMultiplier);
      const newSustainability = Math.min(100, Math.round(item.sustainability + (conservationFactor / 2)));
      
      return {
        ...item,
        consumption: newConsumption,
        perCapita: newPerCapita,
        sustainability: newSustainability,
        isSimulated: true
      };
    });
  };

  const processedWaterData = getProcessedData(waterConsumptionData, waterConservationFactor, 'water');
  const processedElectricityData = getProcessedData(electricityConsumptionData, energyEfficiencyFactor, 'electricity');

  // Calculate overall sustainability metrics
  const calculateOverallSustainability = () => {
    const waterSustainability = processedWaterData.reduce((acc, item) => acc + item.sustainability, 0) / 
                              (processedWaterData.length || 1);
    
    const electricitySustainability = processedElectricityData.reduce((acc, item) => acc + item.sustainability, 0) / 
                                    (processedElectricityData.length || 1);
    
    return {
      water: Math.round(waterSustainability),
      electricity: Math.round(electricitySustainability),
      overall: Math.round((waterSustainability + electricitySustainability) / 2)
    };
  };

  const sustainabilityScores = calculateOverallSustainability();

  // Time series chart data (would be replaced with real historical data)
  const generateTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, idx) => {
      // Create a seasonal pattern with some randomness
      const seasonalFactor = Math.sin((idx / 12) * Math.PI * 2) * 0.2 + 0.9;
      
      // More consumption in summer months for water
      const waterFactor = 1 + Math.sin(((idx + 3) / 12) * Math.PI * 2) * 0.3;
      
      // More electricity in winter and summer (heating and cooling)
      const electricityFactor = 1 + Math.cos(((idx + 1) / 6) * Math.PI * 2) * 0.25;
      
      const baseWaterConsumption = 4500000;
      const baseElectricityConsumption = 8500000;
      
      return {
        name: month,
        waterConsumption: Math.round(baseWaterConsumption * waterFactor * seasonalFactor),
        electricityConsumption: Math.round(baseElectricityConsumption * electricityFactor * seasonalFactor),
        isCurrentMonth: idx === currentMonth
      };
    });
  };

  const timeSeriesData = generateTimeSeriesData();

  // Handler for zone selection
  const handleZoneSelect = (zone: WaterConsumption | ElectricityConsumption) => {
    setSelectedZone(zone);
  };

  // UI Colors
  const colors = {
    water: '#0088FE',
    electricity: '#FFBB28',
    sustainable: '#00C49F',
    warning: '#FF8042',
    critical: '#FF0000',
    background: '#f8f9fa',
    text: '#333333',
    border: '#dddddd'
  };

  // Function to determine color based on sustainability score
  const getSustainabilityColor = (score:any) => {
    if (score >= 80) return colors.sustainable;
    if (score >= 60) return '#8FBC8F';
    if (score >= 40) return colors.warning;
    return colors.critical;
  };

  // Render the map circles for consumption data
  const renderConsumptionMarkers = (data:any, utilityType:any) => {
    const color = utilityType === 'water' ? colors.water : colors.electricity;
    
    return data.map((item: GeoDataItem) => {
      // Scale circle size based on consumption
      const radius = Math.max(10, Math.sqrt(item.consumption / 100000));
      
      return (
        <CircleMarker
          key={`${utilityType}-${item.id}`}
          center={[item.lat, item.lng]}
          pathOptions={{ radius, fillColor: showSustainabilityScore ? getSustainabilityColor(item.sustainability) : color }}
          //fillOpacity={0.7}
          //stroke={true}
          //color={color}
          //weight={1}
          eventHandlers={{
            click: () => handleZoneSelect(item)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{item.zone} Zone</h3>
              <p>Consumption: {(item.consumption / 1000000).toFixed(2)} ML</p>
              <p>Per Capita: {item.perCapita} L</p>
              <p>Sustainability Score: {item.sustainability}%</p>
              {item.isSimulated && (
                <p className="text-green-600 mt-2">Simulated data with conservation measures</p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Home className="mr-2" />
            <h1 className="text-2xl font-bold">Bangalore Smart Utilities Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Droplet className="mr-1" size={20} />
              BWSSB
            </span>
            <span className="flex items-center">
              <Zap className="mr-1" size={20} />  
              BESCOM
            </span>
            <span className="bg-teal-800 px-3 py-1 rounded-full text-sm">
              SDG 11 & 12 Tracker
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-6 py-3 font-medium flex items-center ${activeTab === 'water' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('water')}
            >
              <Droplet className="mr-2" size={16} />
              Water Consumption
            </button>
            <button 
              className={`px-6 py-3 font-medium flex items-center ${activeTab === 'electricity' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('electricity')}
            >
              <Zap className="mr-2" size={16} />
              Electricity Consumption
            </button>
            <button 
              className={`px-6 py-3 font-medium flex items-center ${activeTab === 'simulation' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('simulation')}
            >
              <Settings className="mr-2" size={16} />
              Simulation Settings
            </button>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select 
                  className="border rounded px-3 py-2 bg-white" 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Map View</label>
                <select 
                  className="border rounded px-3 py-2 bg-white"
                  value={mapView}
                  onChange={(e) => setMapView(e.target.value)}
                >
                  <option value="heatmap">Consumption Heatmap</option>
                  <option value="sustainability">Sustainability Scores</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="sustainabilityToggle" 
                  className="mr-2"
                  checked={showSustainabilityScore}
                  onChange={() => setShowSustainabilityScore(!showSustainabilityScore)}
                />
                <label htmlFor="sustainabilityToggle" className="text-sm font-medium text-gray-700">
                  Show Sustainability Scores
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="simulationToggle" 
                  className="mr-2"
                  checked={simulationEnabled}
                  onChange={() => setSimulationEnabled(!simulationEnabled)}
                />
                <label htmlFor="simulationToggle" className="text-sm font-medium text-gray-700">
                  Enable Simulation
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* KPI Cards */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Water Consumption</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {(processedWaterData.reduce((sum, item) => sum + item.consumption, 0) / 1000000).toFixed(2)} ML
                  </p>
                  <p className="text-sm text-gray-500">Total Consumption</p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getSustainabilityColor(sustainabilityScores.water)}30` }}>
                  <span className="text-lg font-bold" style={{ color: getSustainabilityColor(sustainabilityScores.water) }}>
                    {sustainabilityScores.water}%
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Average per capita: {Math.round(processedWaterData.reduce((sum, item) => sum + item.perCapita, 0) / processedWaterData.length)} liters
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Electricity Consumption</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {(processedElectricityData.reduce((sum, item) => sum + item.consumption, 0) / 1000000).toFixed(2)} MWh
                  </p>
                  <p className="text-sm text-gray-500">Total Consumption</p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getSustainabilityColor(sustainabilityScores.electricity)}30` }}>
                  <span className="text-lg font-bold" style={{ color: getSustainabilityColor(sustainabilityScores.electricity) }}>
                    {sustainabilityScores.electricity}%
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Average per capita: {Math.round(processedElectricityData.reduce((sum, item) => sum + item.perCapita, 0) / processedElectricityData.length)} kWh
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Sustainability</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-teal-600">
                    {sustainabilityScores.overall}%
                  </p>
                  <p className="text-sm text-gray-500">SDG Progress Score</p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getSustainabilityColor(sustainabilityScores.overall)}30` }}>
                  <span className="text-lg font-bold" style={{ color: getSustainabilityColor(sustainabilityScores.overall) }}>
                    {sustainabilityScores.overall > 70 ? '✓' : sustainabilityScores.overall > 50 ? '!' : '×'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  {sustainabilityScores.overall > 70 
                    ? 'Good progress toward SDG targets' 
                    : sustainabilityScores.overall > 50 
                      ? 'Moderate progress, improvements needed' 
                      : 'Significant improvements required'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map and Chart Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className={`bg-white rounded-lg shadow-md ${activeTab === 'overview' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">
                {activeTab === 'water' ? 'BWSSB Water Consumption Map' : 
                activeTab === 'electricity' ? 'BESCOM Electricity Consumption Map' :
                'Bangalore Utilities Consumption Map'}
              </h2>
              {simulationEnabled && (
                <p className="text-sm text-teal-600">Simulation Mode Active: Showing projected data with conservation measures</p>
              )}
            </div>
            
            <div className="p-4 w-screen border">
              <div style={{ height: '500px', width: '80%'}} className="mx-auto rounded overflow-hidden border">
                <MapContainer
                  center={[12.9710, 77.5943]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  
                  {/* Water Consumption Markers */}
                  {(activeTab === 'water' || activeTab === 'overview') && 
                    renderConsumptionMarkers(processedWaterData, 'water')}
                  
                  {/* Electricity Consumption Markers */}
                  {(activeTab === 'electricity' || activeTab === 'overview') && 
                    renderConsumptionMarkers(processedElectricityData, 'electricity')}
                </MapContainer>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Water Consumption</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Electricity Consumption</span>
                  </div>
                </div>
                
                {showSustainabilityScore && (
                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <span className="text-sm text-gray-700">Sustainability Score:</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Poor</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Fair</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Good</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Section - Only shown in overview tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-md lg:col-span-1">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-700">Consumption Trends</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Monthly Consumption</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke={colors.water} />
                      <YAxis yAxisId="right" orientation="right" stroke={colors.electricity} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="waterConsumption" 
                        name="Water (KL)" 
                        stroke={colors.water} 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="electricityConsumption" 
                        name="Electricity (kWh)" 
                        stroke={colors.electricity} 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Zone Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={processedWaterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="perCapita" name="Water per capita (L)" fill={colors.water} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        
        {/* Utility-specific charts - shown in water and electricity tabs */}
        {(activeTab === 'water' || activeTab === 'electricity') && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-700">
                  {activeTab === 'water' ? 'Water Consumption by Zone' : 'Electricity Consumption by Zone'}
                </h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={activeTab === 'water' ? processedWaterData : processedElectricityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="consumption" 
                      name={activeTab === 'water' ? 'Water Consumption (KL)' : 'Electricity Consumption (kWh)'} 
                      fill={activeTab === 'water' ? colors.water : colors.electricity} 
                    >
                      {(activeTab === 'water' ? processedWaterData : processedElectricityData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSustainabilityColor(entry.sustainability)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-700">
                  {activeTab === 'water' ? 'Water Sustainability Score' : 'Electricity Sustainability Score'}
                </h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activeTab === 'water' ? processedWaterData : processedElectricityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="sustainability"
                      nameKey="zone"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(activeTab === 'water' ? processedWaterData : processedElectricityData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSustainabilityColor(entry.sustainability)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
{/* Simulation Settings Tab */}
{activeTab === 'simulation' && (
  <div className="bg-white rounded-lg shadow-md">
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold text-gray-700">Simulation Parameters</h2>
      <p className="text-sm text-gray-500">Adjust parameters to simulate different conservation scenarios</p>
    </div>
    
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Water Conservation Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Overall Conservation Factor: {waterConservationFactor}%
            </label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={waterConservationFactor} 
              onChange={(e) => setWaterConservationFactor(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (No Change)</span>
              <span>50% (Maximum Savings)</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="rainwaterHarvesting" className="mr-2" />
              <label htmlFor="rainwaterHarvesting" className="text-sm text-gray-700">
                Enable Rainwater Harvesting
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="waterRecycling" className="mr-2" />
              <label htmlFor="waterRecycling" className="text-sm text-gray-700">
                Enable Greywater Recycling
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="smartMetering" className="mr-2" />
              <label htmlFor="smartMetering" className="text-sm text-gray-700">
                Deploy Smart Water Meters
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="leakDetection" className="mr-2" />
              <label htmlFor="leakDetection" className="text-sm text-gray-700">
                Active Leak Detection Systems
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Energy Efficiency Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Overall Efficiency Factor: {energyEfficiencyFactor}%
            </label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={energyEfficiencyFactor}
              onChange={(e) => setEnergyEfficiencyFactor(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (No Change)</span>
              <span>50% (Maximum Savings)</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="solarRooftop" className="mr-2" />
              <label htmlFor="solarRooftop" className="text-sm text-gray-700">
                Rooftop Solar Installation
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="ledLighting" className="mr-2" />
              <label htmlFor="ledLighting" className="text-sm text-gray-700">
                LED Lighting Conversion
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="smartGrid" className="mr-2" />
              <label htmlFor="smartGrid" className="text-sm text-gray-700">
                Smart Grid Implementation
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="energyStorage" className="mr-2" />
              <label htmlFor="energyStorage" className="text-sm text-gray-700">
                Energy Storage Systems
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Demographic & Climate Variables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Population Growth Rate
            </label>
            <select className="w-full p-2 border rounded">
              <option value="low">Low (0.5% per year)</option>
              <option value="medium" selected>Medium (1.2% per year)</option>
              <option value="high">High (2.5% per year)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Climate Scenario
            </label>
            <select className="w-full p-2 border rounded">
              <option value="current">Current Patterns</option>
              <option value="moderate">Moderate Change</option>
              <option value="extreme">Extreme Change</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Infrastructure Investment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="font-medium mb-1">Low Investment</div>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Basic maintenance only</li>
              <li>Minimal upgrades</li>
              <li>Low upfront cost</li>
              <li>Higher long-term loss</li>
            </ul>
            <div className="mt-3">
              <input type="radio" id="lowInvestment" name="investment" className="mr-2" />
              <label htmlFor="lowInvestment">Select</label>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg bg-blue-50">
            <div className="font-medium mb-1">Medium Investment</div>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Targeted upgrades</li>
              <li>Smart technology in key areas</li>
              <li>Moderate efficiency gains</li>
              <li>Balanced approach</li>
            </ul>
            <div className="mt-3">
              <input type="radio" id="mediumInvestment" name="investment" className="mr-2" checked />
              <label htmlFor="mediumInvestment">Select</label>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="font-medium mb-1">High Investment</div>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Complete system overhaul</li>
              <li>Advanced smart grid/water network</li>
              <li>High upfront cost</li>
              <li>Maximum long-term savings</li>
            </ul>
            <div className="mt-3">
              <input type="radio" id="highInvestment" name="investment" className="mr-2" />
              <label htmlFor="highInvestment">Select</label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded mr-2">
            Reset to Defaults
          </button>
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded">
            Save Scenario
          </button>
        </div>
        
        <button 
          className={`${simulationEnabled ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white font-medium py-2 px-6 rounded flex items-center`}
          onClick={() => setSimulationEnabled(!simulationEnabled)}
        >
          <Settings className="mr-2" size={18} />
          {simulationEnabled ? 'Update Simulation' : 'Run Simulation'}
        </button>
      </div>
    </div>
  </div>)}
  </main>
  </div>
)};