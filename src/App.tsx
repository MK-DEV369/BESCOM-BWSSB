import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Home, Droplet, Zap, Settings, Download, FileText, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { downloadPDFReport } from './pdfGenerator'; 

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

//I want to make the download print to pdf button which will download all the report of simulation and current consumption of electricity and water; you can create a new file so that I can import it in this app.tsx; update all and tell me where to change the code; make all the buttons work;

// Main App Component
export default function SustainableUtilitiesDashboard() {
  const [rainwaterHarvesting, setRainwaterHarvesting] = useState(false);
  const [greywaterRecycling, setGreywaterRecycling] = useState(false);
  const [smartMetering, setSmartMetering] = useState(false);
  const [leakDetection, setLeakDetection] = useState(false);  
  const [solar, setSolar] = useState(false);
  const [led, setLed] = useState(false);
  const [smartGrid, setSmartGrid] = useState(false);
  const [energyStorage, setEnergyStorage] = useState(false);
  const [investmentLevel, setInvestmentLevel] = useState<'low' | 'medium' | 'high'>('medium');  
  const [activeTab, setActiveTab] = useState('overview'); // State for the active utility view (water or electricity)    
  const [timePeriod, setTimePeriod] = useState('month'); // State for time period selection  
  const [simulationEnabled, setSimulationEnabled] = useState(false); // State for simulation controls
  const [waterConservationFactor, setWaterConservationFactor] = useState(0);
  const [energyEfficiencyFactor, setEnergyEfficiencyFactor] = useState(0);
  
  const formatUnit = (value: number): string => {
    const utilityType = activeTab === 'water' ? 'L' : 'kWh';
    return `${(value / 1000000).toFixed(2)} ${utilityType}`;
  };

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
  interface ElectricityConsumption {
    id: number;
    zone: string;
    lat: number;
    lng: number;
    consumption: number;
    perCapita: number;
    sustainability: number;
  }
  const [waterConsumptionData, setWaterConsumptionData] = useState<WaterConsumption[]>([]);
  const [electricityConsumptionData, setElectricityConsumptionData] = useState<ElectricityConsumption[]>([]);
  const [, setSelectedZone] = useState<WaterConsumption | ElectricityConsumption | null>(null);
  const [mapView, setMapView] = useState('heatmap'); // State for map view settings
  const [showSustainabilityScore, setShowSustainabilityScore] = useState(true);

  
  useEffect(() => { // Fetch initial data (would be replaced with real API calls)    
    fetchWaterConsumptionData(); // Simulate fetching water consumption data    
    fetchElectricityConsumptionData(); // Simulate fetching electricity consumption data
  }, [timePeriod]);
  
  const handleDownloadReport = async () => {
    const reportData = {
      sustainabilityScores,
      waterData: processedWaterData,
      electricityData: processedElectricityData,
      timeSeriesData,
      simulationSettings: {
        rainwaterHarvesting,
        greywaterRecycling,
        smartMetering,
        leakDetection,
        solar,
        led,
        smartGrid,
        energyStorage,
        investmentLevel,
        simulationEnabled
      },
      savings: {
        water: calculateSavings(),
        electricity: calculateSavings()
      }
    };
  
    const success = await downloadPDFReport(reportData, `utilities-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    if (success) {
      alert('Report downloaded successfully!');
    } else {
      alert('Error generating report. Please try again.');
    }
  };
  
  const handleExportData = () => {
    const data = activeTab === 'water' ? processedWaterData : processedElectricityData;
    const csv = convertToCSV(data);
    downloadCSV(csv, `${activeTab}-consumption-data-${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  const convertToCSV = (data: any[]) => {
    const headers = ['Zone', 'Consumption', 'Per Capita', 'Sustainability Score', 'Latitude', 'Longitude'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.zone}"`,
        item.consumption,
        item.perCapita,
        item.sustainability,
        item.lat,
        item.lng
      ].join(','))
    ].join('\n');
    return csvContent;
  };
  
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const resetSimulation = () => {
    setRainwaterHarvesting(false);
    setGreywaterRecycling(false);
    setSmartMetering(false);
    setLeakDetection(false);
    setSolar(false);
    setLed(false);
    setSmartGrid(false);
    setEnergyStorage(false);
    setInvestmentLevel('medium');
    setWaterConservationFactor(0);
    setEnergyEfficiencyFactor(0);
    setSimulationEnabled(false);
  };
  
  const applyOptimalSettings = () => {
    setRainwaterHarvesting(true);
    setGreywaterRecycling(true);
    setSmartMetering(true);
    setLeakDetection(true);
    setSolar(true);
    setLed(true);
    setSmartGrid(true);
    setEnergyStorage(true);
    setInvestmentLevel('high');
    setWaterConservationFactor(25);
    setEnergyEfficiencyFactor(30);
    setSimulationEnabled(true);
  };

  const fetchWaterConsumptionData = () => { // Example data fetching function (to be replaced with actual API calls)
    const WaterData = [
      { id: 1, zone: 'Cauvery Stage 1', lat: 12.9716, lng: 77.5946, consumption: 4500000, perCapita: 125, sustainability: 65 },
      { id: 2, zone: 'Cauvery Stage 2', lat: 12.9716, lng: 77.5946, consumption: 5200000, perCapita: 145, sustainability: 52 },
      { id: 3, zone: 'Cauvery Stage 3', lat: 12.9716, lng: 77.5946, consumption: 3800000, perCapita: 115, sustainability: 78 },
      { id: 4, zone: 'Cauvery Stage 4 Phase 1', lat: 12.9716, lng: 77.5946, consumption: 4100000, perCapita: 130, sustainability: 71 },
      { id: 5, zone: 'Cauvery Stage 4 Phase 2', lat: 12.9716, lng: 77.5946, consumption: 2900000, perCapita: 95, sustainability: 82 },
      { id: 6, zone: 'Nethajinagar', lat: 12.9825, lng: 77.5480, consumption: 4000000, perCapita: 120, sustainability: 70 },
      { id: 7, zone: 'NTY Layout', lat: 12.9820, lng: 77.5470, consumption: 4200000, perCapita: 125, sustainability: 68 },
      { id: 8, zone: 'Gandhinagar', lat: 12.9780, lng: 77.5720, consumption: 3900000, perCapita: 110, sustainability: 72 },
      { id: 9, zone: 'Mahalakshmi Layout', lat: 13.0050, lng: 77.5450, consumption: 3600000, perCapita: 100, sustainability: 75 },
      { id: 10, zone: '4th Block Nandini Layout', lat: 13.0150, lng: 77.5300, consumption: 3800000, perCapita: 105, sustainability: 73 },
      { id: 11, zone: 'Nagamma Nagar', lat: 12.9610, lng: 77.5500, consumption: 3700000, perCapita: 105, sustainability: 70 },
      { id: 12, zone: 'Telecom Layout', lat: 13.0400, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 68 },
      { id: 13, zone: 'Laxmanpuri Slum', lat: 12.9610, lng: 77.5500, consumption: 4200000, perCapita: 120, sustainability: 65 },
      { id: 14, zone: 'J C Nagar', lat: 13.0050, lng: 77.5900, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 15, zone: 'BHEL Layout', lat: 12.9800, lng: 77.5600, consumption: 3800000, perCapita: 105, sustainability: 72 },
      { id: 16, zone: 'Keshava Nagar', lat: 12.9900, lng: 77.5600, consumption: 3900000, perCapita: 110, sustainability: 71 },
      { id: 17, zone: 'Byatarayanapura', lat: 13.0800, lng: 77.5700, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 18, zone: 'Kumarapark East', lat: 12.9900, lng: 77.5700, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 19, zone: 'Athmiya Geleyara Balaga', lat: 12.9900, lng: 77.5600, consumption: 3800000, perCapita: 105, sustainability: 72 },
      { id: 20, zone: 'Nandini Layout', lat: 13.0150, lng: 77.5300, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 21, zone: 'K P Agrahara', lat: 12.9800, lng: 77.5400, consumption: 3900000, perCapita: 110, sustainability: 71 },
      { id: 22, zone: 'Kasturba Nagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 23, zone: 'Vasanthanagar', lat: 12.9900, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 24, zone: 'Sri Ramnagar', lat: 13.0000, lng: 77.5800, consumption: 3900000, perCapita: 110, sustainability: 71 },
      { id: 25, zone: 'Srinivasa Nagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 26, zone: 'New Binny Layout', lat: 12.9800, lng: 77.5400, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 27, zone: 'New Guddadahalli', lat: 12.9600, lng: 77.5400, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 28, zone: 'Abshot Layout', lat: 12.9900, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 29, zone: 'Muneswara Block', lat: 12.9700, lng: 77.5500, consumption: 3900000, perCapita: 110, sustainability: 71 },
      { id: 30, zone: 'Jaimaruthi Nagar & Badavane', lat: 12.9800, lng: 77.5500, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 31, zone: 'Raghavendra Colony', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 32, zone: 'Maruthinagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 33, zone: 'Chakravathi Layout', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 34, zone: 'J S Nagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 35, zone: 'Sakamma Layout', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 36, zone: 'Tippunagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 37, zone: 'Shamanna Nagar', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 38, zone: 'High Grounds', lat: 12.9800, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 39, zone: 'WOC Road 2nd Stage and 2nd Phase', lat: 12.9900, lng: 77.5600, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 40, zone: 'Narasimha Swamy Layout', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 41, zone: 'Anandapura', lat: 13.0000, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 42, zone: 'Bapuji Nagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 43, zone: 'Sampangiramnagar', lat: 12.9600, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 44, zone: 'Saraswathi Puram', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 45, zone: 'Muneshwaranagara', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 46, zone: 'Chamarajpet', lat: 12.9600, lng: 77.5700, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 47, zone: 'Joly Mohalla', lat: 12.9600, lng: 77.5700, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 48, zone: 'CKC Garden', lat: 12.9600, lng: 77.5700, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 49, zone: 'Mahalakshmi Layout Further Extension', lat: 13.0100, lng: 77.5400, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 50, zone: 'Jnanajyothinagar', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 51, zone: 'Ramchandra Agrahara', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 52, zone: 'PVR Road', lat: 12.9500, lng: 77.5800, consumption: 3800000, perCapita: 105, sustainability: 72 },
      { id: 53, zone: 'KS Garden', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 54, zone: 'Bhovi Playa', lat: 12.9500, lng: 77.5800, consumption: 4200000, perCapita: 120, sustainability: 68 },
      { id: 55, zone: 'Jnanaganganagar', lat: 12.9500, lng: 77.5800, consumption: 4000000, perCapita: 115, sustainability: 70 },
      { id: 56, zone: 'Adarshanagar', lat: 12.9500, lng: 77.5800, consumption: 3800000, perCapita: 105, sustainability: 72 },
      { id: 57, zone: 'Central', lat: 12.9716, lng: 77.5946, consumption: 2900000, perCapita: 95, sustainability: 82 },
    ];    
    setWaterConsumptionData(WaterData);
  };
  
  const fetchElectricityConsumptionData = () => {
    const ElectricityData = [
      { id: 1, zone: 'WHITEFIELD', lat: 12.96672724, lng: 77.74846312, consumption: 8500000, perCapita: 235, sustainability: 58 },
      { id: 2, zone: 'VIDHANA SOUDHA', lat: 12.97545574, lng: 77.57542405, consumption: 9200000, perCapita: 255, sustainability: 49 },
      { id: 3, zone: 'JALAHALLI', lat: 13.10396843, lng: 77.52203297, consumption: 7500000, perCapita: 225, sustainability: 64 },
      { id: 4, zone: 'RAJAJINAGAR', lat: 12.98053097, lng: 77.52857634, consumption: 8000000, perCapita: 240, sustainability: 61 },
      { id: 5, zone: 'TIPTUR', lat: 13.25269796, lng: 76.49300996, consumption: 6200000, perCapita: 205, sustainability: 76 },
      { id: 6, zone: 'KANAKAPURA', lat: 12.53318508, lng: 77.41727269, consumption: 7000000, perCapita: 230, sustainability: 62 },
      { id: 7, zone: 'R R NAGAR', lat: 12.92488015, lng: 77.52021025, consumption: 7800000, perCapita: 245, sustainability: 59 },
      { id: 8, zone: 'CHANDAPURA', lat: 12.71560352, lng: 77.70100397, consumption: 6900000, perCapita: 220, sustainability: 63 },
      { id: 9, zone: 'CHIKKABALAPURA', lat: 13.56721035, lng: 77.49162508, consumption: 7300000, perCapita: 235, sustainability: 60 },
      { id: 10, zone: 'NELAMANGALA', lat: 13.28505426, lng: 77.54840132, consumption: 8200000, perCapita: 250, sustainability: 57 },
      { id: 11, zone: 'CHITRADURGA', lat: 14.25165747, lng: 76.4917188, consumption: 9500000, perCapita: 260, sustainability: 55 },
      { id: 12, zone: 'MADHUGIRI', lat: 13.74447218, lng: 76.90305552, consumption: 8700000, perCapita: 270, sustainability: 54 },
      { id: 13, zone: 'KGF', lat: 13.0437091, lng: 78.28602525, consumption: 10000000, perCapita: 280, sustainability: 53 },
      { id: 14, zone: 'KOLAR', lat: 13.13819204, lng: 78.13377304, consumption: 10500000, perCapita: 290, sustainability: 52 },
      { id: 15, zone: 'RAMANAGARA', lat: 12.68633689, lng: 77.22797006, consumption: 9200000, perCapita: 260, sustainability: 58 },
      { id: 16, zone: 'YALAHANKA', lat: 13.07167259, lng: 77.79519256, consumption: 9500000, perCapita: 270, sustainability: 57 },
      { id: 17, zone: 'CHINTHAMANI', lat: 13.38430514, lng: 78.07893194, consumption: 9800000, perCapita: 280, sustainability: 56 },
      { id: 18, zone: 'DAVANAGERE', lat: 14.46133085, lng: 75.9161373, consumption: 11000000, perCapita: 290, sustainability: 54 },
      { id: 19, zone: 'HARIHARA', lat: 14.57045163, lng: 75.88026952, consumption: 11500000, perCapita: 300, sustainability: 53 },
      { id: 20, zone: 'HIRIYUR', lat: 14.14411658, lng: 76.64365097, consumption: 12000000, perCapita: 310, sustainability: 52 },
      { id: 21, zone: 'MALLESHWARAM', lat: 13.01438819, lng: 77.5690845, consumption: 10500000, perCapita: 280, sustainability: 58 },
      { id: 22, zone: 'HEBBAL', lat: 13.12098872, lng: 77.59589507, consumption: 11000000, perCapita: 290, sustainability: 57 },
      { id: 23, zone: 'HSR LAYOUT', lat: 12.8815713, lng: 77.62510473, consumption: 10000000, perCapita: 270, sustainability: 59 },
      { id: 24, zone: 'JAYANAGARA', lat: 12.92030876, lng: 77.56597568, consumption: 10500000, perCapita: 280, sustainability: 58 },
      { id: 25, zone: 'KENGERI', lat: 12.88053578, lng: 77.48181654, consumption: 10000000, perCapita: 270, sustainability: 59 },
      { id: 26, zone: 'KORAMANGALA', lat: 12.94348118, lng: 77.66896016, consumption: 11000000, perCapita: 290, sustainability: 57 },
      { id: 27, zone: 'PEENYA', lat: 13.03623979, lng: 77.52138267, consumption: 10500000, perCapita: 280, sustainability: 58 },
      { id: 28, zone: 'INDIRANAGARA', lat: 13.00152472, lng: 77.67237352, consumption: 10000000, perCapita: 270, sustainability: 59 },
      { id: 29, zone: 'SHIVAJINAGAR', lat: 13.03196136, lng: 77.64831458, consumption: 10500000, perCapita: 280, sustainability: 58 },
      { id: 30, zone: 'TUMKUR', lat: 13.02524581, lng: 77.03236304, consumption: 9000000, perCapita: 260, sustainability: 60 },
      { id: 31, zone: 'TUMKUR', lat: 13.35485874, lng: 77.10565022, consumption: 9500000, perCapita: 270, sustainability: 59 },
      { id: 32, zone: 'KOLAR', lat: 13.12791697, lng: 78.15828825, consumption: 10000000, perCapita: 280, sustainability: 58 },
      { id: 33, zone: 'WHITEFIELD', lat: 12.96672724, lng: 77.74846312, consumption: 8500000, perCapita: 235, sustainability: 58 },
      { id: 34, zone: 'MAJESTIC', lat: 12.97545574, lng: 77.57542405, consumption: 9200000, perCapita: 255, sustainability: 49 },
      { id: 35, zone: 'AGRAHARA', lat: 13.10396843, lng: 77.52203297, consumption: 7500000, perCapita: 225, sustainability: 64 },
    ];    
    setElectricityConsumptionData(ElectricityData);
  };  
  const getProcessedData = ( // Function to process data based on simulation factors
    originalData: WaterConsumption[] | ElectricityConsumption[],
    conservationFactor: number,
    utilityType: 'water' | 'electricity'
  ) => {
    let multiplier = 1 - (conservationFactor / 100);
    if (simulationEnabled) {
      if (utilityType === 'water') {
        if (rainwaterHarvesting) multiplier -= 0.02;
        if (greywaterRecycling) multiplier -= 0.02;
        if (smartMetering) multiplier -= 0.01;
        if (leakDetection) multiplier -= 0.03;
      } else {
        if (solar) multiplier -= 0.03;
        if (led) multiplier -= 0.01;
        if (smartGrid) multiplier -= 0.02;
        if (energyStorage) multiplier -= 0.02;
      }
      if (investmentLevel === 'high') multiplier -= 0.05;
      else if (investmentLevel === 'medium') multiplier -= 0.025;
    }
    multiplier = Math.max(0.5, multiplier); // Clamp to avoid excessive reduction
    return originalData.map(item => {
      const newConsumption = Math.round(item.consumption * multiplier);
      const newPerCapita = Math.round(item.perCapita * multiplier);
      const newSustainability = Math.min(100, Math.round(item.sustainability + (conservationFactor * 0.5)));
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
  const calculateOverallSustainability = () => {
    const waterSustainability = processedWaterData.reduce((acc, item) => acc + item.sustainability, 0) / (processedWaterData.length || 1);
    const electricitySustainability = processedElectricityData.reduce((acc, item) => acc + item.sustainability, 0) / (processedElectricityData.length || 1);
    return {
      water: Math.round(waterSustainability),
      electricity: Math.round(electricitySustainability),
      overall: Math.round((waterSustainability + electricitySustainability) / 2)
    };
  };
  const sustainabilityScores = calculateOverallSustainability();  
  const generateTimeSeriesData = () => { // Time series chart data (would be replaced with real historical data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();    
    return months.map((month, idx) => {
      const seasonalFactor = Math.sin((idx / 12) * Math.PI * 2) * 0.2 + 0.9; // Create a seasonal pattern with some randomness
      const waterFactor = 1 + Math.sin(((idx + 3) / 12) * Math.PI * 2) * 0.3; // More consumption in summer months for water
      const electricityFactor = 1 + Math.cos(((idx + 1) / 6) * Math.PI * 2) * 0.25; // More electricity in winter and summer (heating and cooling)
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
  const handleZoneSelect = (zone: WaterConsumption | ElectricityConsumption) => {
    setSelectedZone(zone);
  };
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
  const getTopPriorityZones = () => {
    const data = activeTab === 'water' ? processedWaterData : processedElectricityData;
    return [...data]
      .sort((a, b) => a.sustainability - b.sustainability)
      .slice(0, 3); // lowest 3 sustainability scores
  };
  const calculateSavings = () => {
    const baseData = activeTab === 'water' ? waterConsumptionData : electricityConsumptionData;
    const simData = activeTab === 'water' ? processedWaterData : processedElectricityData;
    const unit = activeTab === 'water' ? 'KL' : 'kWh';

    const totalBase = baseData.reduce((acc, item) => acc + item.consumption, 0);
    const totalSim = simData.reduce((acc, item) => acc + item.consumption, 0);
    const savings = totalBase - totalSim;

    return {
      savings,
      unit,
      percent: ((savings / totalBase) * 100).toFixed(2)
    };
  };  
  const renderConsumptionMarkers = (data:any, utilityType:any) => { // Render the map circles for consumption data
    const color = utilityType === 'water' ? colors.water : colors.electricity;    
    return data.map((item: GeoDataItem) => {      
      const radius = Math.max(10, Math.sqrt(item.consumption / 100000)); // Scale circle size based on consumption
      return (
        <CircleMarker
          key={`${utilityType}-${item.id}`}
          center={[item.lat, item.lng]}
          pathOptions={{
            radius,
            fillColor: showSustainabilityScore ? getSustainabilityColor(item.sustainability) : color,
          }}
          fillOpacity={0.7}
          stroke={true}
          color={color}
          weight={1}
          eventHandlers={{
            click: () => handleZoneSelect(item)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{item.zone} Zone</h3>
              <p>Consumption: {formatUnit(item.consumption)}</p>
              <p>Per Capita: {item.perCapita} Lakhs</p>
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
        <header className="bg-teal-600 text-white p-4 shadow-md transition-all duration-300 ease-in-out">
  <div className="container mx-auto flex justify-between items-center h-full">
    <div className="flex items-center">
      <Home className="mr-2" />
      <h1 className="text-2xl font-bold">Bangalore Smart Utilities Dashboard</h1>
    </div>
    <div className="rounded-lg shadow-md mb-6">
      <div className="flex border-b">
        <button 
          className={`px-6 py-3 font-medium flex items-center transition-colors duration-300 ${activeTab === 'overview' ? 'text-white border-b-2 border-teal-600' : 'text-gray-300 hover:text-orange-400'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`px-6 py-3 font-medium flex items-center transition-colors duration-300 ${activeTab === 'water' ? 'text-white border-b-2 border-teal-600' : 'text-gray-300 hover:text-orange-400'}`}
          onClick={() => setActiveTab('water')}
        >
          <Droplet className="mr-2" size={16} />
          Water Consumption
        </button>
        <button 
          className={`px-6 py-3 font-medium flex items-center transition-colors duration-300 ${activeTab === 'electricity' ? 'text-white border-b-2 border-teal-600' : 'text-gray-300 hover:text-orange-400'}`}
          onClick={() => setActiveTab('electricity')}
        >
          <Zap className="mr-2" size={16} />
          Electricity Consumption
        </button>            
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <a href="https://bwssb.karnataka.gov.in/english" target="_blank" rel="noopener noreferrer" className="flex items-center transition-colors duration-300">
        <Droplet className="mr-1" size={20} />
        BWSSB
      </a>
      <a href="https://www.bescom.co.in/bescom/main/home" target="_blank" rel="noopener noreferrer" className="flex items-center transition-colors duration-300">
        <Zap className="mr-1" size={20} />  
        BESCOM
      </a>
      <div className="bg-teal-800 px-3 py-1 rounded-full text-sm flex items-center transition-colors duration-300 space-x-4">
        <a href="https://sdgs.un.org/goals/goal11" target="_blank" rel="noopener noreferrer" className="mr-2">
          SDG 11
        </a>
        
        <a href="https://sdgs.un.org/goals/goal12" target="_blank" rel="noopener noreferrer" className="ml-2">
          SDG 12
        </a>
      </div>
      
    </div>
  </div>
</header>
      {/* Main Content */}
      <main className="container mx-auto p-4">
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
        <div className="grid py-3 grid-cols-1 overflow-hidden lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg justify-center shadow-md lg:col-span-3">
            <div className="p-4 border-b flex flex-wrap items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                {activeTab === 'water' ? 'BWSSB Water Consumption Map' : 
                activeTab === 'electricity' ? 'BESCOM Electricity Consumption Map' :
                'Bangalore Utilities Consumption Map'}
              </h2>
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
              {simulationEnabled && (
                <p className="text-sm text-teal-600">Simulation Mode Active: Showing projected data with conservation measures</p>
              )}
            </div>
            
            <div className="p-4 justify-center">
              <div className="rounded overflow-hidden" style={{ height: '500px', width: '100%' }}>
                <MapContainer
                  center={[12.9710, 77.5943]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; Bengaluru'
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
                <div className="bg-white rounded-lg shadow-md">
                  {/* Recommendations Summary
              <div className="bg-gray-50 mt-8 p-4 border rounded">
                <h3 className="text-md font-semibold mb-2">⚙️ Simulation Insights</h3>
                  
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Top 3 Priority Zones (Low Sustainability):</strong>
                  <ul className="list-disc list-inside">
                    {getTopPriorityZones().map(zone => (
                      <li key={zone.id}>{zone.zone} – {zone.sustainability}%</li>
                    ))}
                  </ul>
                </div>
                  
                <div className="text-sm text-gray-700">
                  <strong>Potential Savings:</strong> {calculateSavings().savings.toLocaleString()} {calculateSavings().unit}  
                  ({calculateSavings().percent}% reduction)
                </div>
              </div> */}

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

                    <div className="flex flex-row justify-evenly p-4">
                      <button
                        onClick={handleDownloadReport}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </button>
                      <button
                        onClick={handleExportData}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export Data
                      </button>
                      <button
                        onClick={resetSimulation}
                        className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyOptimalSettings}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Optimal
                      </button>
                      <button 
                        className={`${simulationEnabled ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white font-medium py-2 px-6 rounded flex items-center`}
                        onClick={() => setSimulationEnabled(!simulationEnabled)}
                      >
                        <Settings className="mr-2" size={18} />
                        {simulationEnabled ? 'Update Simulation' : 'Run Simulation'}
                      </button>
                    </div>
                  </div>
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
                    data={activeTab === 'water' ? processedWaterData.slice(0, 10) : processedElectricityData.slice(0, 10)}
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
                      {(activeTab === 'water' ? processedWaterData.slice(0, 10) : processedElectricityData.slice(0, 10)).map((entry, index) => (
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
                      data={activeTab === 'water' ? processedWaterData.slice(0, 10) : processedElectricityData.slice(0, 10)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="sustainability"
                      nameKey="zone"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(activeTab === 'water' ? processedWaterData.slice(0, 10) : processedElectricityData.slice(0, 10)).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSustainabilityColor(entry.sustainability)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}  
  </main>
  </div>
)};