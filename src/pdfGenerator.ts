// pdfGenerator.ts
// Install: npm install jspdf html2canvas

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  sustainabilityScores: {
    water: number;
    electricity: number;
    overall: number;
  };
  waterData: any[];
  electricityData: any[];
  timeSeriesData: any[];
  simulationSettings: {
    rainwaterHarvesting: boolean;
    greywaterRecycling: boolean;
    smartMetering: boolean;
    leakDetection: boolean;
    solar: boolean;
    led: boolean;
    smartGrid: boolean;
    energyStorage: boolean;
    investmentLevel: string;
    simulationEnabled: boolean;
  };
  savings: {
    water: { savings: number; unit: string; percent: string };
    electricity: { savings: number; unit: string; percent: string };
  };
}

export const generatePDFReport = async (data: ReportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add a new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(0, 51, 102);
  pdf.text('Sustainable Utilities Dashboard Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setTextColor(100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Executive Summary
  checkNewPage(30);
  pdf.setFontSize(18);
  pdf.setTextColor(0, 51, 102);
  pdf.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setTextColor(0);
  const summaryText = [
    `Overall Sustainability Score: ${data.sustainabilityScores.overall}%`,
    `Water Sustainability Score: ${data.sustainabilityScores.water}%`,
    `Electricity Sustainability Score: ${data.sustainabilityScores.electricity}%`,
    '',
    'This report provides a comprehensive analysis of water and electricity consumption',
    'patterns across various zones, along with sustainability metrics and potential',
    'savings from conservation measures.'
  ];

  summaryText.forEach(line => {
    pdf.text(line, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Current Consumption Overview
  checkNewPage(40);
  pdf.setFontSize(16);
  pdf.setTextColor(0, 51, 102);
  pdf.text('Current Consumption Overview', 20, yPosition);
  yPosition += 10;

  // Water Consumption Summary
  pdf.setFontSize(14);
  pdf.text('Water Consumption', 20, yPosition);
  yPosition += 8;

  const totalWaterConsumption = data.waterData.reduce((acc, item) => acc + item.consumption, 0);
  const avgWaterPerCapita = data.waterData.reduce((acc, item) => acc + item.perCapita, 0) / data.waterData.length;

  pdf.setFontSize(12);
  pdf.text(`Total Water Consumption: ${(totalWaterConsumption / 1000000).toFixed(2)} ML`, 25, yPosition);
  yPosition += 6;
  pdf.text(`Average Per Capita: ${avgWaterPerCapita.toFixed(2)} L`, 25, yPosition);
  yPosition += 6;
  pdf.text(`Number of Zones: ${data.waterData.length}`, 25, yPosition);
  yPosition += 12;

  // Electricity Consumption Summary
  pdf.setFontSize(14);
  pdf.text('Electricity Consumption', 20, yPosition);
  yPosition += 8;

  const totalElectricityConsumption = data.electricityData.reduce((acc, item) => acc + item.consumption, 0);
  const avgElectricityPerCapita = data.electricityData.reduce((acc, item) => acc + item.perCapita, 0) / data.electricityData.length;

  pdf.setFontSize(12);
  pdf.text(`Total Electricity Consumption: ${(totalElectricityConsumption / 1000000).toFixed(2)} MWh`, 25, yPosition);
  yPosition += 6;
  pdf.text(`Average Per Capita: ${avgElectricityPerCapita.toFixed(2)} kWh`, 25, yPosition);
  yPosition += 6;
  pdf.text(`Number of Zones: ${data.electricityData.length}`, 25, yPosition);
  yPosition += 15;

  // Simulation Results (if enabled)
  if (data.simulationSettings.simulationEnabled) {
    checkNewPage(50);
    pdf.setFontSize(16);
    pdf.setTextColor(0, 51, 102);
    pdf.text('Simulation Results & Potential Savings', 20, yPosition);
    yPosition += 12;

    // Active Conservation Measures
    pdf.setFontSize(14);
    pdf.text('Active Conservation Measures:', 20, yPosition);
    yPosition += 8;

    const activeMeasures = [];
    if (data.simulationSettings.rainwaterHarvesting) activeMeasures.push('• Rainwater Harvesting');
    if (data.simulationSettings.greywaterRecycling) activeMeasures.push('• Greywater Recycling');
    if (data.simulationSettings.smartMetering) activeMeasures.push('• Smart Metering');
    if (data.simulationSettings.leakDetection) activeMeasures.push('• Leak Detection');
    if (data.simulationSettings.solar) activeMeasures.push('• Solar Power');
    if (data.simulationSettings.led) activeMeasures.push('• LED Lighting');
    if (data.simulationSettings.smartGrid) activeMeasures.push('• Smart Grid');
    if (data.simulationSettings.energyStorage) activeMeasures.push('• Energy Storage');

    pdf.setFontSize(12);
    activeMeasures.forEach(measure => {
      pdf.text(measure, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 8;
    pdf.text(`Investment Level: ${data.simulationSettings.investmentLevel.toUpperCase()}`, 25, yPosition);
    yPosition += 12;

    // Projected Savings
    pdf.setFontSize(14);
    pdf.text('Projected Annual Savings:', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.text(`Water Savings: ${(data.savings.water.savings / 1000000).toFixed(2)} ML (${data.savings.water.percent}%)`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Electricity Savings: ${(data.savings.electricity.savings / 1000000).toFixed(2)} MWh (${data.savings.electricity.percent}%)`, 25, yPosition);
    yPosition += 15;
  }

  // Top Priority Zones
  checkNewPage(60);
  pdf.setFontSize(16);
  pdf.setTextColor(0, 51, 102);
  pdf.text('Priority Zones for Improvement', 20, yPosition);
  yPosition += 12;

  // Water Priority Zones
  const waterPriorityZones = [...data.waterData]
    .sort((a, b) => a.sustainability - b.sustainability)
    .slice(0, 5);

  pdf.setFontSize(14);
  pdf.text('Water Conservation Priority Zones:', 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.text('Zone Name', 25, yPosition);
  pdf.text('Consumption (ML)', 90, yPosition);
  pdf.text('Sustainability Score', 150, yPosition);
  yPosition += 8;

  waterPriorityZones.forEach((zone, index) => {
    pdf.text(`${index + 1}. ${zone.zone}`, 25, yPosition);
    pdf.text(`${(zone.consumption / 1000000).toFixed(2)}`, 90, yPosition);
    pdf.text(`${zone.sustainability}%`, 150, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Electricity Priority Zones
  const electricityPriorityZones = [...data.electricityData]
    .sort((a, b) => a.sustainability - b.sustainability)
    .slice(0, 5);

  pdf.setFontSize(14);
  pdf.text('Electricity Efficiency Priority Zones:', 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.text('Zone Name', 25, yPosition);
  pdf.text('Consumption (MWh)', 90, yPosition);
  pdf.text('Sustainability Score', 150, yPosition);
  yPosition += 8;

  electricityPriorityZones.forEach((zone, index) => {
    checkNewPage(10);
    pdf.text(`${index + 1}. ${zone.zone}`, 25, yPosition);
    pdf.text(`${(zone.consumption / 1000000).toFixed(2)}`, 90, yPosition);
    pdf.text(`${zone.sustainability}%`, 150, yPosition);
    yPosition += 6;
  });

  // Recommendations
  checkNewPage(50);
  pdf.setFontSize(16);
  pdf.setTextColor(0, 51, 102);
  pdf.text('Recommendations', 20, yPosition);
  yPosition += 12;

  const recommendations = [
    '1. Immediate Actions:',
    '   • Implement leak detection systems in low-sustainability zones',
    '   • Deploy smart meters for real-time consumption monitoring',
    '   • Initiate public awareness campaigns in high-consumption areas',
    '',
    '2. Medium-term Initiatives:',
    '   • Install rainwater harvesting systems in residential areas',
    '   • Upgrade to LED lighting in public spaces',
    '   • Implement greywater recycling in commercial buildings',
    '',
    '3. Long-term Investments:',
    '   • Deploy solar power systems in suitable zones',
    '   • Establish smart grid infrastructure',
    '   • Create energy storage facilities for peak load management',
    '',
    '4. Policy Recommendations:',
    '   • Introduce tiered pricing for excessive consumption',
    '   • Provide incentives for conservation measures',
    '   • Mandate sustainability reporting for large consumers'
  ];

  pdf.setFontSize(12);
  recommendations.forEach(rec => {
    checkNewPage(8);
    pdf.text(rec, 20, yPosition);
    yPosition += 6;
  });

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: 'right' });
  }

  return pdf;
};

export const downloadPDFReport = async (data: ReportData, filename: string = 'utilities-report.pdf') => {
  try {
    const pdf = await generatePDFReport(data);
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
};

// Alternative method using html2canvas for chart capture
export const generatePDFWithCharts = async (data: ReportData, chartElements: HTMLElement[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Add text content first
  const textPdf = await generatePDFReport(data);
  
  // Add charts
  for (const element of chartElements) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add new page for chart
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  }
  
  return pdf;
};